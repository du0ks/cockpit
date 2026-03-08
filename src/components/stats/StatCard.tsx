'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    label: string;
    value: string | number;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon?: string;
    accentColor?: string;
}

export function StatCard({ label, value, subtitle, trend, icon, accentColor }: StatCardProps) {
    return (
        <div className="rounded-lg border border-cr-border bg-cr-panel/80 p-4 transition-all duration-300 hover:border-cr-border-hover hover:shadow-[0_0_20px_rgba(62,207,90,0.05)]">
            <div className="flex items-start justify-between mb-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-cr-text-muted">
                    {label}
                </span>
                {icon && <span className="text-sm opacity-60">{icon}</span>}
            </div>
            <div className="flex items-baseline gap-2">
                <span
                    className="font-mono text-2xl font-bold"
                    style={{ color: accentColor || 'var(--color-cr-accent)' }}
                >
                    {value}
                </span>
                {trend && (
                    <span
                        className={cn(
                            'font-mono text-xs font-medium',
                            trend === 'up' && 'text-cr-success',
                            trend === 'down' && 'text-cr-danger',
                            trend === 'neutral' && 'text-cr-text-muted'
                        )}
                    >
                        {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '─'}
                    </span>
                )}
            </div>
            {subtitle && (
                <p className="font-mono text-[10px] text-cr-text-muted mt-1">{subtitle}</p>
            )}
        </div>
    );
}
