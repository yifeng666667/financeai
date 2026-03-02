"use client";

import React, { useMemo } from 'react';

export interface ScorecardData {
    Value: number;
    Growth: number;
    Quality: number;
    Momentum: number;
    Volatility: number;
}

interface CompanyRadarScorecardProps {
    symbol: string;
    data: ScorecardData;
    bullCase: string[];
    bearCase: string[];
}

export default function CompanyRadarScorecard({ symbol, data, bullCase, bearCase }: CompanyRadarScorecardProps) {
    // SVG Dimensions & Padding
    const width = 300;
    const height = 300;
    const padding = 50;
    const radius = (width - padding * 2) / 2;
    const center = { x: width / 2, y: height / 2 };

    // 5 axes for our categories
    const axes = ["Value", "Growth", "Quality", "Momentum", "Volatility"] as const;
    const numAxes = axes.length;
    const angleStep = (Math.PI * 2) / numAxes;

    // Helper to calculate x,y on the radar given a value 0-100 and an axis index
    const getCoordinates = (value: number, axisIndex: number) => {
        // Offset by -PI/2 to start the first axis straight up
        const angle = axisIndex * angleStep - Math.PI / 2;
        const distance = (value / 100) * radius;
        return {
            x: center.x + distance * Math.cos(angle),
            y: center.y + distance * Math.sin(angle)
        };
    };

    // Generate paths for the background grid (concentric pentagons)
    const gridLevels = [20, 40, 60, 80, 100];
    const gridPaths = gridLevels.map(level => {
        const points = axes.map((_, i) => {
            const { x, y } = getCoordinates(level, i);
            return `${x},${y}`;
        });
        return `M ${points.join(' L ')} Z`;
    });

    // Generate the actual data polygon path
    const dataPath = useMemo(() => {
        const points = axes.map((axis, i) => {
            const { x, y } = getCoordinates(data[axis], i);
            return `${x},${y}`;
        });
        return `M ${points.join(' L ')} Z`;
    }, [data, axes, getCoordinates]);

    // Labels positioning
    const labels = axes.map((axis, i) => {
        // Push labels slightly outside the 100% radius
        const { x, y } = getCoordinates(120, i);
        // Adjust text anchor based on position to avoid overlapping the line
        let textAnchor: "middle" | "end" | "start" = "middle";
        if (x < center.x - 10) textAnchor = "end";
        if (x > center.x + 10) textAnchor = "start";
        return { label: axis, x, y, textAnchor };
    });

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-400";
        if (score >= 60) return "text-emerald-400";
        if (score >= 40) return "text-yellow-400";
        if (score >= 20) return "text-orange-400";
        return "text-red-400";
    };

    return (
        <div className="flex flex-col xl:flex-row gap-6 w-full animate-fade-in-up">

            {/* Radar Chart Container */}
            <div className="relative flex-none xl:w-[400px] bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center overflow-hidden group">

                {/* Ambient Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl group-hover:bg-cyan-500/30 transition-colors duration-1000"></div>

                <div className="text-center mb-2 z-10 w-full">
                    <h3 className="text-lg font-black text-white/90 uppercase tracking-widest">{symbol} <span className="text-cyan-400">Scorecard</span></h3>
                    <p className="text-xs text-slate-400 uppercase tracking-tighter">AI Factor Analysis</p>
                </div>

                <div className="relative z-10 w-full flex justify-center">
                    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">

                        {/* Grid Levels */}
                        {gridPaths.map((path, i) => (
                            <path
                                key={i}
                                d={path}
                                fill="none"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth={gridLevels[i] === 100 ? "1.5" : "0.5"}
                                strokeDasharray={gridLevels[i] === 50 ? "none" : "2,2"}
                            />
                        ))}

                        {/* Axes Lines */}
                        {axes.map((_, i) => {
                            const { x, y } = getCoordinates(100, i);
                            return (
                                <line
                                    key={`axis-${i}`}
                                    x1={center.x}
                                    y1={center.y}
                                    x2={x}
                                    y2={y}
                                    stroke="rgba(255,255,255,0.15)"
                                    strokeWidth="1"
                                />
                            );
                        })}

                        {/* Data Polygon Glow & Fill */}
                        <path
                            d={dataPath}
                            fill="rgba(6, 182, 212, 0.2)" /* cyan-500 equivalent */
                            stroke="#22d3ee" /* cyan-400 */
                            strokeWidth="2"
                            className="transition-all duration-700 ease-in-out drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                            style={{ filter: "drop-shadow(0 0 8px rgba(34,211,238,0.6))" }}
                        />

                        {/* Data Points */}
                        {axes.map((axis, i) => {
                            const { x, y } = getCoordinates(data[axis], i);
                            return (
                                <circle
                                    key={`point-${i}`}
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    fill="#fff"
                                    stroke="#22d3ee"
                                    strokeWidth="2"
                                    className="transition-all duration-700 ease-in-out hover:r-6 cursor-pointer"
                                >
                                    <title>{`${axis}: ${data[axis]}`}</title>
                                </circle>
                            );
                        })}

                        {/* Labels */}
                        {labels.map((l, i) => (
                            <g key={`label-${i}`} transform={`translate(${l.x}, ${l.y})`} className="transition-all duration-500">
                                <text
                                    textAnchor={l.textAnchor}
                                    alignmentBaseline="middle"
                                    className="text-[10px] sm:text-xs font-bold uppercase tracking-wider fill-slate-300 drop-shadow-md"
                                >
                                    {l.label}
                                </text>
                                <text
                                    y={14}
                                    textAnchor={l.textAnchor}
                                    className={`text-[10px] font-black tracking-tighter sm:text-sm drop-shadow-sm ${getScoreColor(data[axes[i]])}`}
                                >
                                    {data[axes[i]]}
                                </text>
                            </g>
                        ))}
                    </svg>
                </div>

            </div>

            {/* Bull/Bear Thesis Panel */}
            <div className="flex-1 flex flex-col gap-4">
                {/* Bull Case */}
                <div className="bg-emerald-900/20 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/40 transition-colors duration-300 h-full flex flex-col">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg className="w-24 h-24 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" /></svg>
                    </div>
                    <h4 className="text-emerald-400 font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Bull Case (牛市逻辑)
                    </h4>
                    <ul className="space-y-4 relative z-10 flex-1 flex flex-col justify-center">
                        {bullCase.map((point, idx) => (
                            <li key={idx} className="flex gap-3 text-sm text-emerald-100/90 leading-relaxed font-light">
                                <span className="text-emerald-500 font-bold mt-0.5">→</span>
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Bear Case */}
                <div className="bg-rose-900/20 backdrop-blur-md border border-rose-500/20 rounded-2xl p-6 relative overflow-hidden group hover:border-rose-500/40 transition-colors duration-300 h-full flex flex-col">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg className="w-24 h-24 text-rose-500" fill="currentColor" viewBox="0 0 24 24"><path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z" /></svg>
                    </div>
                    <h4 className="text-rose-400 font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                        Bear Case (熊市风险)
                    </h4>
                    <ul className="space-y-4 relative z-10 flex-1 flex flex-col justify-center">
                        {bearCase.map((point, idx) => (
                            <li key={idx} className="flex gap-3 text-sm text-rose-100/90 leading-relaxed font-light">
                                <span className="text-rose-500 font-bold mt-0.5">→</span>
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

        </div>
    );
}
