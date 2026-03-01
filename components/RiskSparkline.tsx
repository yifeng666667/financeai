"use client";

import React from 'react';

interface RiskSparklineProps {
    data: number[];
    color?: string;
    width?: number;
    height?: number;
}

export default function RiskSparkline({
    data,
    color = "#3b82f6",
    width = 120,
    height = 40
}: RiskSparklineProps) {
    if (!data || data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div style={{ width, height }}>
            <svg width={width} height={height} className="overflow-visible">
                <defs>
                    <linearGradient id="sparkline-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Fill Area */}
                <path
                    d={`M 0,${height} L ${points} L ${width},${height} Z`}
                    fill="url(#sparkline-gradient)"
                />

                {/* Line */}
                <polyline
                    points={points}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* End Point Dot */}
                <circle
                    cx={width}
                    cy={height - ((data[data.length - 1] - min) / range) * height}
                    r="3"
                    fill={color}
                    className="animate-pulse"
                />
            </svg>
        </div>
    );
}
