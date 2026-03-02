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
        <div className="w-full relative py-4">
            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                <defs>
                    <linearGradient id="tail-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
                    </linearGradient>
                </defs>

                {/* Main Curve */}
                <polyline
                    points={points.join(' ')}
                    fill="none"
                    stroke="#4b5563"
                    strokeWidth="2"
                    strokeDasharray="4 2"
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
                    strokeWidth="2"
                />

                {/* Labels */}
                <text x={mean} y={height + 15} textAnchor="middle" className="text-[10px] fill-gray-500 font-black">NORMAL MARKET REGIME</text>
                <text x={varX + 10} y={20} textAnchor="start" className="text-[10px] fill-red-400 font-black tracking-tighter uppercase">VaR Threshold ({varValue})</text>
                <text x={varX / 2} y={height - 10} textAnchor="middle" className="text-[10px] fill-red-500 font-black uppercase">Tail Risk</text>
            </svg>

            <div className="flex justify-between mt-6 px-2">
                <div className="text-center">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Confidence</div>
                    <div className="text-sm font-black text-white">{confidence}%</div>
                </div>
                <div className="text-center">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Value at Risk</div>
                    <div className="text-sm font-black text-red-500">{varValue}</div>
                </div>
                <div className="text-center">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Exp. Shortfall</div>
                    <div className="text-sm font-black text-orange-500">{expectedShortfall}</div>
                </div>
            </div>
        </div>
    );
}
