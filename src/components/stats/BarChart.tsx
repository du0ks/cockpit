'use client';

import React from 'react';

interface BarChartProps {
    data: { label: string; value: number; maxValue?: number; color?: string }[];
    height?: number;
    showValues?: boolean;
}

export function BarChart({ data, height = 140, showValues = true }: BarChartProps) {
    const maxVal = Math.max(...data.map((d) => d.maxValue || d.value), 1);
    const barWidth = 28;
    const gap = 12;
    const minWidth = 280;
    const naturalWidth = data.length * (barWidth + gap) - gap;
    const totalWidth = Math.max(naturalWidth, minWidth);

    // Center bars if totalWidth > naturalWidth
    const offsetX = (totalWidth - naturalWidth) / 2;

    const chartPadding = { top: 20, right: 16, bottom: 28, left: 16 };
    const svgWidth = totalWidth + chartPadding.left + chartPadding.right;
    const svgHeight = height + chartPadding.top + chartPadding.bottom;
    const chartHeight = height;

    const gridLines = 4;

    return (
        <div style={{ maxHeight: svgHeight, overflow: 'hidden' }}>
            <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                width="100%"
                height={svgHeight}
                preserveAspectRatio="xMidYMid meet"
                style={{ maxHeight: svgHeight }}
            >
                {/* Grid lines */}
                {Array.from({ length: gridLines + 1 }).map((_, i) => {
                    const y = chartPadding.top + (chartHeight / gridLines) * i;
                    return (
                        <line
                            key={i}
                            x1={chartPadding.left}
                            y1={y}
                            x2={svgWidth - chartPadding.right}
                            y2={y}
                            stroke="var(--color-cr-border)"
                            strokeWidth="0.5"
                            strokeDasharray="3,3"
                        />
                    );
                })}

                {/* Bars */}
                {data.map((d, i) => {
                    const barHeight = maxVal > 0 ? (d.value / maxVal) * chartHeight : 0;
                    const x = chartPadding.left + offsetX + i * (barWidth + gap);
                    const y = chartPadding.top + chartHeight - barHeight;
                    const color = d.color || 'var(--color-cr-accent)';

                    return (
                        <g key={i}>
                            {/* Bar */}
                            <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={Math.max(barHeight, 0)}
                                rx={2}
                                fill={color}
                                opacity={0.7}
                                style={{ filter: d.value > 0 ? `drop-shadow(0 0 3px ${color})` : 'none' }}
                            >
                                <animate
                                    attributeName="height"
                                    from="0"
                                    to={Math.max(barHeight, 0)}
                                    dur="0.6s"
                                    fill="freeze"
                                />
                                <animate
                                    attributeName="y"
                                    from={chartPadding.top + chartHeight}
                                    to={y}
                                    dur="0.6s"
                                    fill="freeze"
                                />
                            </rect>

                            {/* Value label */}
                            {showValues && d.value > 0 && (
                                <text
                                    x={x + barWidth / 2}
                                    y={y - 4}
                                    textAnchor="middle"
                                    fill="var(--color-cr-accent)"
                                    fontFamily="var(--font-mono)"
                                    fontSize="9"
                                    fontWeight="600"
                                >
                                    {d.value}
                                </text>
                            )}

                            {/* X label */}
                            <text
                                x={x + barWidth / 2}
                                y={chartPadding.top + chartHeight + 16}
                                textAnchor="middle"
                                fill="var(--color-cr-text-muted)"
                                fontFamily="var(--font-mono)"
                                fontSize="9"
                            >
                                {d.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
