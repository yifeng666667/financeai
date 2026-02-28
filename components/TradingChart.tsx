"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, Time, ColorType, CandlestickSeries, HistogramSeries, SeriesMarker, createSeriesMarkers, LineSeries } from 'lightweight-charts';
import { calculateSMA, calculateMACD, calculateRSI } from '../lib/indicators';

export interface OHLCV {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface ChartEvent {
    date: string; // YYYY-MM-DD
    headline: string;
    type: 'Earnings' | 'Product' | 'Macro' | 'Policy' | 'Management' | 'Competition';
    sentiment: 'bullish' | 'bearish' | 'neutral';
    t1Return?: string;
}

interface TradingChartProps {
    data: OHLCV[];
    events?: ChartEvent[];
    onDateSelect: (date: string, dataPoint: OHLCV) => void;
    showMA?: boolean;
    showMACD?: boolean;
    showRSI?: boolean;
}

export default function TradingChart({
    data,
    events = [],
    onDateSelect,
    showMA = false,
    showMACD = false,
    showRSI = false
}: TradingChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const [tooltipParams, setTooltipParams] = useState<{
        visible: boolean;
        x: number;
        y: number;
        event?: ChartEvent;
    }>({ visible: false, x: 0, y: 0 });

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#d1d4dc',
            },
            grid: {
                vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
                horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
            },
            crosshair: {
                mode: 0,
            },
            rightPriceScale: {
                borderColor: 'rgba(197, 203, 206, 0.8)',
            },
            timeScale: {
                borderColor: 'rgba(197, 203, 206, 0.8)',
                timeVisible: true,
            },
        });

        chartRef.current = chart;

        // --- Calculate Layout Margins Based on Active Indicators ---
        let mainChartBottom = 0.8; // default if no indicators
        let volumeTop = 0.8;
        let volumeBottom = 0;

        let macdTop = 0;
        let macdBottom = 0;

        let rsiTop = 0;
        let rsiBottom = 0;

        const activeSubCharts = (showMACD ? 1 : 0) + (showRSI ? 1 : 0);

        if (activeSubCharts === 0) {
            mainChartBottom = 0.8;
        } else if (activeSubCharts === 1) {
            mainChartBottom = 0.6;
            volumeTop = 0.6;
            volumeBottom = 0.2;
            if (showMACD) { macdTop = 0.8; macdBottom = 0; }
            if (showRSI) { rsiTop = 0.8; rsiBottom = 0; }
        } else if (activeSubCharts === 2) {
            mainChartBottom = 0.5;
            volumeTop = 0.5;
            volumeBottom = 0.3;
            if (showMACD) { macdTop = 0.7; macdBottom = 0.15; }
            if (showRSI) { rsiTop = 0.85; rsiBottom = 0; }
        }

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });

        candlestickSeries.priceScale().applyOptions({
            scaleMargins: { top: 0.1, bottom: 1 - mainChartBottom + 0.05 }
        });

        candlestickSeries.setData(data.map(d => ({
            time: d.time as Time,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
        })));

        // --- MA Logic ---
        if (showMA) {
            const ma5Data = calculateSMA(data, 5);
            const ma10Data = calculateSMA(data, 10);
            const ma20Data = calculateSMA(data, 20);

            const ma5Series = chart.addSeries(LineSeries, { color: '#2962FF', lineWidth: 1, crosshairMarkerVisible: false });
            ma5Series.setData(ma5Data.map(d => ({ time: d.time as Time, value: d.value })));

            const ma10Series = chart.addSeries(LineSeries, { color: '#FF6D00', lineWidth: 1, crosshairMarkerVisible: false });
            ma10Series.setData(ma10Data.map(d => ({ time: d.time as Time, value: d.value })));

            const ma20Series = chart.addSeries(LineSeries, { color: '#00BFA5', lineWidth: 1, crosshairMarkerVisible: false });
            ma20Series.setData(ma20Data.map(d => ({ time: d.time as Time, value: d.value })));
        }

        // --- Volume Logic ---
        const volumeSeries = chart.addSeries(HistogramSeries, {
            color: '#26a69a',
            priceFormat: { type: 'volume' },
            priceScaleId: '', // set as an overlay
        });
        volumeSeries.priceScale().applyOptions({
            scaleMargins: { top: volumeTop, bottom: volumeBottom },
        });

        volumeSeries.setData(data.map(d => ({
            time: d.time as Time,
            value: d.volume,
            color: d.close > d.open ? 'rgba(38, 166, 154, 0.3)' : 'rgba(239, 83, 80, 0.3)',
        })));


        // --- MACD Logic ---
        if (showMACD) {
            const macdResult = calculateMACD(data);

            const macdHistogramSeries = chart.addSeries(HistogramSeries, {
                priceScaleId: 'macd',
            });
            macdHistogramSeries.priceScale().applyOptions({
                scaleMargins: { top: macdTop, bottom: macdBottom },
            });
            macdHistogramSeries.setData(macdResult.map(d => ({
                time: d.time as Time,
                value: d.histogram,
                color: d.histogram >= 0 ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)'
            })));

            const macdLineSeries = chart.addSeries(LineSeries, {
                color: '#2962FF',
                lineWidth: 1,
                priceScaleId: 'macd',
            });
            macdLineSeries.setData(macdResult.map(d => ({ time: d.time as Time, value: d.macd })));

            const signalLineSeries = chart.addSeries(LineSeries, {
                color: '#FF6D00',
                lineWidth: 1,
                priceScaleId: 'macd',
            });
            signalLineSeries.setData(macdResult.map(d => ({ time: d.time as Time, value: d.signal })));
        }

        // --- RSI Logic ---
        if (showRSI) {
            const rsiData = calculateRSI(data);

            const rsiSeries = chart.addSeries(LineSeries, {
                color: '#9C27B0',
                lineWidth: 1,
                priceScaleId: 'rsi',
            });
            rsiSeries.priceScale().applyOptions({
                scaleMargins: { top: rsiTop, bottom: rsiBottom },
            });
            rsiSeries.setData(rsiData.map(d => ({ time: d.time as Time, value: d.value })));

            // RSI overbought/oversold backgrounds or lines (optional but common)
            const rsiBase = chart.addSeries(LineSeries, {
                color: 'rgba(255,255,255,0.1)',
                lineWidth: 1,
                lineStyle: 2,
                priceScaleId: 'rsi',
                crosshairMarkerVisible: false
            });
            rsiBase.setData(data.map(d => ({ time: d.time as Time, value: 70 })));
            const rsiBase2 = chart.addSeries(LineSeries, {
                color: 'rgba(255,255,255,0.1)',
                lineWidth: 1,
                lineStyle: 2,
                priceScaleId: 'rsi',
                crosshairMarkerVisible: false
            });
            rsiBase2.setData(data.map(d => ({ time: d.time as Time, value: 30 })));
        }

        const getMarkerText = (type: string) => {
            switch (type) {
                case 'Earnings': return 'E';
                case 'Product': return 'T';
                case 'Macro': return 'M';
                case 'Policy': return 'P';
                case 'Management': return 'MG';
                case 'Competition': return 'C';
                default: return '*';
            }
        };

        // Generate markers
        const markerData: SeriesMarker<Time>[] = [];
        events.forEach(ev => {
            // Find if date exists in chart data, otherwise find the closest matching trading day
            let exactMatch = data.find(d => d.time === ev.date);
            if (!exactMatch) {
                // If weekend/holiday, snap to the closest previous available trading day
                const evTime = new Date(ev.date).getTime();
                const availableDays = data.filter(d => new Date(d.time).getTime() <= evTime);
                if (availableDays.length > 0) {
                    exactMatch = availableDays[availableDays.length - 1]; // Closest previous day
                } else if (data.length > 0) {
                    exactMatch = data[0]; // Or first available
                }
            }

            if (exactMatch) {
                markerData.push({
                    time: exactMatch.time as Time,
                    position: ev.sentiment === 'bullish' ? 'belowBar' : (ev.sentiment === 'bearish' ? 'aboveBar' : 'aboveBar'),
                    color: ev.sentiment === 'bullish' ? '#26a69a' : (ev.sentiment === 'bearish' ? '#ef5350' : '#888'),
                    shape: 'circle',
                    text: getMarkerText(ev.type),
                });
            }
        });

        createSeriesMarkers(candlestickSeries, markerData);

        // Crosshair move handler for Tooltip
        chart.subscribeCrosshairMove((param) => {
            if (
                param.point === undefined ||
                !param.time ||
                param.point.x < 0 ||
                param.point.x > chartContainerRef.current!.clientWidth ||
                param.point.y < 0 ||
                param.point.y > chartContainerRef.current!.clientHeight
            ) {
                setTooltipParams(prev => ({ ...prev, visible: false }));
                return;
            }

            const dateStr = param.time.toString();
            const event = events.find(e => e.date === dateStr);

            if (event) {
                setTooltipParams({
                    visible: true,
                    x: param.point.x,
                    y: param.point.y,
                    event
                });
            } else {
                setTooltipParams(prev => ({ ...prev, visible: false }));
            }
        });

        // Click handler
        chart.subscribeClick((param) => {
            if (param.time) {
                // Find the full data point
                const dateStr = param.time.toString();
                const point = data.find(d => d.time === dateStr);
                if (point) {
                    onDateSelect(dateStr, point);
                }
            }
        });

        // Fit content
        chart.timeScale().fitContent();

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [data, events, onDateSelect, showMA, showMACD, showRSI]);

    return (
        <div className="relative w-full h-full">
            <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
            {tooltipParams.visible && tooltipParams.event && (
                <div
                    className="absolute z-50 pointer-events-none bg-slate-900 border border-slate-700/50 rounded-lg shadow-xl p-3 text-sm text-slate-200 backdrop-blur-md"
                    style={{
                        left: `${tooltipParams.x + 15}px`,
                        top: `${Math.max(10, tooltipParams.y - 70)}px`,
                        maxWidth: '280px',
                        transition: 'opacity 0.1s ease',
                        opacity: 1
                    }}
                >
                    <div className="font-semibold text-white mb-1 truncate">{tooltipParams.event.date}</div>
                    <div className="text-slate-300 text-xs mb-2 line-clamp-3 leading-relaxed">{tooltipParams.event.headline}</div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 shrink-0">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tooltipParams.event.sentiment === 'bullish' ? 'bg-emerald-500/10 text-emerald-400' : tooltipParams.event.sentiment === 'bearish' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-500/10 text-slate-400'}`}>
                            {tooltipParams.event.type ? tooltipParams.event.type.toUpperCase() : 'EVENT'}
                        </span>
                        {tooltipParams.event.t1Return && (
                            <span className={`text-xs font-mono font-medium ${parseFloat(tooltipParams.event.t1Return) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                T+1: {tooltipParams.event.t1Return}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
