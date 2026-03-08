'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface TagProps {
    label: string;
    color?: string;
    removable?: boolean;
    onRemove?: () => void;
    onClick?: () => void;
    active?: boolean;
    size?: 'sm' | 'md';
}

export function Tag({ label, color, removable, onRemove, onClick, active, size = 'sm' }: TagProps) {
    return (
        <span
            onClick={onClick}
            className={cn(
                'inline-flex items-center gap-1 rounded-full border font-mono',
                'transition-all duration-200',
                size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
                active
                    ? 'border-cr-accent-dim bg-cr-accent-muted text-cr-accent'
                    : 'border-cr-border bg-cr-panel text-cr-text-secondary',
                onClick && 'cursor-pointer hover:border-cr-border-hover'
            )}
            style={color ? { borderColor: `${color}40`, color } : undefined}
        >
            {label}
            {removable && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove?.();
                    }}
                    className="ml-0.5 hover:text-cr-danger transition-colors cursor-pointer"
                >
                    ×
                </button>
            )}
        </span>
    );
}
