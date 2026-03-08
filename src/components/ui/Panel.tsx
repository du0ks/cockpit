'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface PanelProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    headerAction?: React.ReactNode;
    noPadding?: boolean;
    glow?: boolean;
}

export function Panel({ children, className, title, headerAction, noPadding, glow }: PanelProps) {
    return (
        <div
            className={cn(
                'rounded-lg border border-cr-border bg-cr-panel/80 backdrop-blur-sm',
                'transition-all duration-300',
                glow && 'hover:border-cr-border-hover hover:shadow-[0_0_20px_rgba(62,207,90,0.05)]',
                !noPadding && 'p-4',
                className
            )}
        >
            {(title || headerAction) && (
                <div className={cn('flex items-center justify-between', !noPadding && 'mb-3')}>
                    {title && (
                        <h3 className="font-mono text-xs font-medium uppercase tracking-wider text-cr-text-secondary">
                            {title}
                        </h3>
                    )}
                    {headerAction}
                </div>
            )}
            {children}
        </div>
    );
}
