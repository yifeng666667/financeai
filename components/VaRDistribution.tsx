"use client";

import React from 'react';

interface VaRDistributionProps {
    confidence: number;
    varValue: string;
    expectedShortfall: string;
}

export default function VaRDistribution({
    confidence = 95,
    varValue = "2.84%",
    expectedShortfall = "4.12%"
}: VaRDistributionProps) {
    // Generate points for a normal distribution curve
    const points: string[] = [];
    const width = 400;
    const height = 150;
    const mean = width / 2;
    const stdDev = width / 6;

    for (let x = 0; x <= width; x++) {
        const y = height - (Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2)) / (stdDev * Math.sqrt(2 * Math.PI))) * height * stdDev * 2;
        points.push(`${x},${y}`);
    }

    // Calculate the VaR line (tail position)
    // 95% mark is approximately mean - 1.645 * stdDev
    const varX = mean - (1.645 * stdDev);

    // Extract path for the tail area (x < varX)
    const tailPoints = points.filter(p => parseFloat(p.split(',')[0]) <= varX);
    const tailPath = `M 0,${height} L ${tailPoints.join(' ')} L ${varX},${height} Z`;

    return (
        <div className="w-full relative pt-2 pb-4">
            <div className="relative mb-8">
                <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                    <defs>
                        <linearGradient id="tail-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Reference Grid Lines */}
                    <line x1="0" y1={height} x2={width} y2={height} stroke="#ffffff10" strokeWidth="1" />
                    <line x1={mean} y1="0" x2={mean} y2={height} stroke="#ffffff05" strokeWidth="1" strokeDasharray="4 4" />

                    {/* Main Curve */}
                    <polyline
                        points={points.join(' ')}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2"
                        filter="url(#glow)"
                        opacity="0.8"
                    />

                    {/* VaR Tail Area */}
                    <path d={tailPath} fill="url(#tail-gradient)" className="animate-pulse" />

                    {/* VaR Threshold Line */}
                    <line
                        x1={varX}
                        y1="0"
                        x2={varX}
                        y2={height}
                        stroke="#ef4444"
                        strokeWidth="2.5"
                        filter="url(#glow)"
                    />

                    {/* SVG Labels */}
                    <text x={mean} y={height / 2} textAnchor="middle" className="text-[10px] fill-sky-400/40 font-black tracking-[0.2em] uppercase pointer-events-none">
                        Normal Regime
                    </text>
                    <text x={varX - 12} y={25} textAnchor="end" className="text-[11px] fill-red-400 font-black tracking-tight uppercase whitespace-nowrap">
                        VaR {varValue}
                    </text>
                    <text x={varX / 2} y={height - 25} textAnchor="middle" className="text-[10px] fill-red-500 font-black tracking-widest uppercase">
                        Tail Risk
                    </text>
                </svg>
            </div>

            {/* Metrics Footer - Added padding to prevent clipping */}
            <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6 px-4">
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Confidence</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-white">{confidence}</span>
                        <span className="text-[10px] font-bold text-gray-400">%</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1 border-x border-white/5 px-4 text-center">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Value at Risk</span>
                    <span className="text-xl font-black text-red-500 tracking-tight">{varValue}</span>
                </div>
                <div className="flex flex-col gap-1 text-right">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Exp. Shortfall</span>
                    <span className="text-xl font-black text-orange-500 tracking-tight">{expectedShortfall}</span>
                </div>
            </div>
        </div>
    );
}
