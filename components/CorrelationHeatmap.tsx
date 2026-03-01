"use client";

import React from 'react';

interface CorrelationHeatmapProps {
    data: { pair: string[]; value: number; trend: string }[];
}

export default function CorrelationHeatmap({ data }: CorrelationHeatmapProps) {
    // Extract unique assets from the pairs
    const assets = Array.from(new Set(data.flatMap(d => d.pair))).sort();

    // Build the matrix
    const matrix: Record<string, Record<string, number>> = {};
    assets.forEach(a1 => {
        matrix[a1] = {};
        assets.forEach(a2 => {
            if (a1 === a2) {
                matrix[a1][a2] = 1.0;
            } else {
                const match = data.find(d =>
                    (d.pair[0] === a1 && d.pair[1] === a2) ||
                    (d.pair[0] === a2 && d.pair[1] === a1)
                );
                matrix[a1][a2] = match ? match.value : 0;
            }
        });
    });

    const getColor = (val: number) => {
        if (val >= 0.8) return 'bg-purple-600';
        if (val >= 0.5) return 'bg-purple-500/80';
        if (val >= 0.2) return 'bg-purple-400/60';
        if (val >= 0) return 'bg-blue-400/40';
        if (val >= -0.3) return 'bg-blue-500/60';
        return 'bg-blue-600';
    };

    const getTextColor = (val: number) => {
        return Math.abs(val) > 0.5 ? 'text-white' : 'text-gray-300';
    };

    return (
        <div className="w-full overflow-hidden">
            <div className="grid grid-cols-[80px_1fr] gap-1">
                {/* Top-left corner */}
                <div className="h-10"></div>

                {/* Header Row */}
                <div className="flex gap-1">
                    {assets.map(asset => (
                        <div key={asset} className="flex-1 h-10 flex items-center justify-center text-[10px] font-black text-gray-500 uppercase tracking-tighter text-center leading-none px-1">
                            {asset}
                        </div>
                    ))}
                </div>

                {/* Matrix Rows */}
                {assets.map(rowAsset => (
                    <React.Fragment key={rowAsset}>
                        <div className="h-12 flex items-center justify-end pr-3 text-[10px] font-black text-gray-400 uppercase tracking-tighter text-right">
                            {rowAsset}
                        </div>
                        <div className="flex gap-1 h-12">
                            {assets.map(colAsset => {
                                const val = matrix[rowAsset][colAsset];
                                return (
                                    <div
                                        key={`${rowAsset}-${colAsset}`}
                                        className={`flex-1 flex flex-col items-center justify-center rounded-lg ${getColor(val)} transition-all hover:brightness-125 hover:scale-[1.02] cursor-default border border-white/5 relative group`}
                                    >
                                        <span className={`text-xs font-mono font-black ${getTextColor(val)}`}>
                                            {val.toFixed(2)}
                                        </span>
                                        {/* Tooltip */}
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 border border-white/10 px-2 py-1 rounded text-[8px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none uppercase font-black text-blue-400">
                                            {rowAsset} vs {colAsset}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}
