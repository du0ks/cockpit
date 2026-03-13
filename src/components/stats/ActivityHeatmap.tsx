'use client';

import React from 'react';
import type { HeatmapCell } from '@/lib/utils/statsEngine';

interface ActivityHeatmapProps {
    cells: HeatmapCell[];
    weeks?: number;
}

const LEVEL_COLORS = [
    'var(--color-cr-border)',        // 0 - no activity
    'rgba(62, 207, 90, 0.4)',        // 1 - low
    'rgba(62, 207, 90, 0.65)',       // 2 - medium
    'rgba(62, 207, 90, 0.9)',        // 3 - high
];

const LEVEL_BORDERS = [
    'transparent',
    'rgba(62, 207, 90, 0.2)',
    'rgba(62, 207, 90, 0.4)',
    'rgba(62, 207, 90, 0.6)',
];

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

export function ActivityHeatmap({ cells, weeks = 12 }: ActivityHeatmapProps) {
    // Organize into columns (weeks) of 7 rows (days)
    const columns: HeatmapCell[][] = [];
    for (let w = 0; w < weeks; w++) {
        const week: HeatmapCell[] = [];
        for (let d = 0; d < 7; d++) {
            const idx = w * 7 + d;
            week.push(cells[idx] || { date: '', count: 0, level: 0 });
        }
        columns.push(week);
    }

    return (
        <div className="w-full overflow-x-auto pt-10 pb-2 custom-scrollbar">
            <div className="flex justify-start min-w-max">
                <div className="inline-flex flex-col">
                    <div className="flex gap-[3px] items-start">
                        {/* Day labels */}
                        <div className="flex flex-col gap-[3px] mr-2 pt-0 sticky left-0 bg-cr-panel/70 backdrop-blur-sm z-[5]">
                            {DAY_LABELS.map((label, i) => (
                                <div key={i} className="h-3.5 w-6 flex items-center justify-end">
                                    <span className="font-mono text-[9px] text-cr-text-muted">{label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Grid */}
                        {columns.map((week, wi) => (
                            <div key={wi} className="flex flex-col gap-[3px]">
                                {week.map((cell, di) => (
                                    <div
                                        key={di}
                                        className="w-3.5 h-3.5 rounded-[2px] transition-all duration-200 hover:ring-1 hover:ring-cr-text hover:z-[60] relative group cursor-pointer"
                                        style={{
                                            backgroundColor: LEVEL_COLORS[cell.level],
                                            border: `1px solid ${LEVEL_BORDERS[cell.level]}`,
                                        }}
                                    >
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-[99]">
                                            <div className="bg-cr-bg border border-cr-border rounded-md px-2.5 py-1.5 whitespace-nowrap shadow-xl">
                                                <span className="font-mono text-[10px] text-cr-text font-medium text-opacity-90">{cell.count} task{cell.count !== 1 ? 's' : ''} on {cell.date || 'unknown'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-1 mt-3 justify-end w-full pr-1">
                        <span className="font-mono text-[10px] text-cr-text-muted mr-1">Less</span>
                        {LEVEL_COLORS.map((color, i) => (
                            <div
                                key={i}
                                className="w-3.5 h-3.5 rounded-[2px]"
                                style={{ backgroundColor: color, border: `1px solid ${LEVEL_BORDERS[i]}` }}
                            />
                        ))}
                        <span className="font-mono text-[10px] text-cr-text-muted ml-1">More</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
