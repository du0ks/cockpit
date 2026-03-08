'use client';

import React from 'react';

interface ProgressRingProps {
    percentage: number;
    actual: number;
    target: number;
    label: string;
    icon: string;
    color: string;
    size?: number;
}

export function ProgressRing({
    percentage,
    actual,
    target,
    label,
    icon,
    color,
    size = 100,
}: ProgressRingProps) {
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const filled = (Math.min(percentage, 100) / 100) * circumference;
    const offset = circumference - filled;
    const completed = percentage >= 100;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    {/* Background ring */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="var(--color-cr-border)"
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress ring */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{
                            filter: completed ? `drop-shadow(0 0 6px ${color})` : `drop-shadow(0 0 2px ${color})`,
                            transition: 'stroke-dashoffset 0.8s ease-out',
                        }}
                    />
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-base">{icon}</span>
                    <span
                        className="font-mono text-sm font-bold"
                        style={{ color }}
                    >
                        {actual}/{target}
                    </span>
                </div>
            </div>

            <span className="font-mono text-[10px] text-cr-text-secondary uppercase tracking-wider text-center">
                {label}
            </span>
        </div>
    );
}
