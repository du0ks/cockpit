'use client';

import React from 'react';
import type { AnxietyPoint } from '@/lib/utils/statsEngine';

interface LineChartProps {
    data: AnxietyPoint[];
    height?: number;
    maxY?: number;
}

export function LineChart({ data, height = 140, maxY = 10 }: LineChartProps) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center" style={{ height }}>
                <span className="font-mono text-xs text-cr-text-muted">No data points yet</span>
            </div>
        );
    }

    const padding = { top: 16, right: 16, bottom: 28, left: 30 };
    const chartWidth = Math.max(data.length * 24, 300);
    const svgWidth = chartWidth + padding.left + padding.right;
    const svgHeight = height + padding.top + padding.bottom;
    const chartHeight = height;

    const xScale = (i: number) =>
        padding.left + (i / Math.max(data.length - 1, 1)) * chartWidth;
    const yScale = (val: number) =>
        padding.top + chartHeight - (val / maxY) * chartHeight;

    // Build path
    const linePath = data
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(p.score)}`)
        .join(' ');

    // Area fill path
    const areaPath = `${linePath} L ${xScale(data.length - 1)} ${yScale(0)} L ${xScale(0)} ${yScale(0)} Z`;

    // Grid lines
    const gridValues = [0, 2, 4, 6, 8, 10];

    // X-axis labels (show every few dates)
    const labelInterval = Math.max(1, Math.floor(data.length / 6));

    return (
        <div className="overflow-x-auto">
            <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full"
                style={{ minWidth: Math.min(svgWidth, 400) }}
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-cr-accent)" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="var(--color-cr-accent)" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Y-axis grid */}
                {gridValues.map((val) => (
                    <g key={val}>
                        <line
                            x1={padding.left}
                            y1={yScale(val)}
                            x2={svgWidth - padding.right}
                            y2={yScale(val)}
                            stroke="var(--color-cr-border)"
                            strokeWidth="0.5"
                            strokeDasharray="3,3"
                        />
                        <text
                            x={padding.left - 6}
                            y={yScale(val) + 3}
                            textAnchor="end"
                            fill="var(--color-cr-text-muted)"
                            fontFamily="var(--font-mono)"
                            fontSize="8"
                        >
                            {val}
                        </text>
                    </g>
                ))}

                {/* Area fill */}
                <path d={areaPath} fill="url(#areaGrad)" />

                {/* Line */}
                <path
                    d={linePath}
                    fill="none"
                    stroke="var(--color-cr-accent)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: 'drop-shadow(0 0 3px rgba(62, 207, 90, 0.4))' }}
                />

                {/* Dots */}
                {data.map((p, i) => (
                    <g key={i}>
                        <circle
                            cx={xScale(i)}
                            cy={yScale(p.score)}
                            r={3}
                            fill="var(--color-cr-accent)"
                            stroke="var(--color-cr-bg)"
                            strokeWidth="1.5"
                            style={{ filter: 'drop-shadow(0 0 2px rgba(62, 207, 90, 0.5))' }}
                        />
                        {/* Tooltip hover area */}
                        <circle
                            cx={xScale(i)}
                            cy={yScale(p.score)}
                            r={8}
                            fill="transparent"
                            className="cursor-pointer"
                        >
                            <title>{`${p.date}: ${p.score}/10`}</title>
                        </circle>
                    </g>
                ))}

                {/* X labels */}
                {data.map((p, i) => {
                    if (i % labelInterval !== 0 && i !== data.length - 1) return null;
                    const parts = p.date.split('-');
                    const shortDate = `${parts[1]}/${parts[2]}`;
                    return (
                        <text
                            key={i}
                            x={xScale(i)}
                            y={svgHeight - 4}
                            textAnchor="middle"
                            fill="var(--color-cr-text-muted)"
                            fontFamily="var(--font-mono)"
                            fontSize="7"
                        >
                            {shortDate}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
}
