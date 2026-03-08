'use client';

import React from 'react';
import type { HeatmapCell } from '@/lib/utils/statsEngine';

interface ActivityHeatmapProps {
    cells: HeatmapCell[];
    weeks?: number;
}

const LEVEL_COLORS = [
    'var(--color-cr-border)',        // 0 - no activity
    'rgba(62, 207, 90, 0.25)',       // 1 - low
    'rgba(62, 207, 90, 0.5)',        // 2 - medium
    'rgba(62, 207, 90, 0.85)',       // 3 - high
];

const LEVEL_BORDERS = [
    'transparent',
    'rgba(62, 207, 90, 0.15)',
    'rgba(62, 207, 90, 0.3)',
    'rgba(62, 207, 90, 0.5)',
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
        <div className="overflow-x-auto">
            <div className="flex gap-0.5 items-start min-w-fit">
                {/* Day labels */}
                <div className="flex flex-col gap-0.5 mr-1 pt-0">
                    {DAY_LABELS.map((label, i) => (
                        <div key={i} className="h-3 w-6 flex items-center justify-end">
                            <span className="font-mono text-[8px] text-cr-text-muted">{label}</span>
                        </div>
                    ))}
                </div>

                {/* Grid */}
                {columns.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-0.5">
                        {week.map((cell, di) => (
                            <div
                                key={di}
                                className="w-3 h-3 rounded-[2px] transition-all duration-200 hover:scale-150 hover:z-10 relative group"
                                style={{
                                    backgroundColor: LEVEL_COLORS[cell.level],
                                    border: `1px solid ${LEVEL_BORDERS[cell.level]}`,
                                    boxShadow: cell.level === 3 ? '0 0 4px rgba(62, 207, 90, 0.3)' : 'none',
                                }}
                                title={`${cell.date}: ${cell.count} task${cell.count !== 1 ? 's' : ''}`}
                            >
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-20">
                                    <div className="bg-cr-bg border border-cr-border rounded px-2 py-1 whitespace-nowrap shadow-lg">
                                        <span className="font-mono text-[9px] text-cr-text">{cell.count} task{cell.count !== 1 ? 's' : ''}</span>
                                        <br />
                                        <span className="font-mono text-[8px] text-cr-text-muted">{cell.date}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-1 mt-2 justify-end">
                <span className="font-mono text-[8px] text-cr-text-muted">Less</span>
                {LEVEL_COLORS.map((color, i) => (
                    <div
                        key={i}
                        className="w-3 h-3 rounded-[2px]"
                        style={{ backgroundColor: color, border: `1px solid ${LEVEL_BORDERS[i]}` }}
                    />
                ))}
                <span className="font-mono text-[8px] text-cr-text-muted">More</span>
            </div>
        </div>
    );
}
