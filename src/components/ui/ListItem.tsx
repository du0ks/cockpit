'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface ListItemProps {
    title: string;
    subtitle?: string;
    checked?: boolean;
    onToggle?: () => void;
    onDelete?: () => void;
    onClick?: () => void;
    trailing?: React.ReactNode;
    className?: string;
}

export function ListItem({
    title,
    subtitle,
    checked,
    onToggle,
    onDelete,
    onClick,
    trailing,
    className,
}: ListItemProps) {
    return (
        <div
            className={cn(
                'group flex items-center gap-3 rounded-md px-3 py-2',
                'border border-transparent transition-all duration-200',
                'hover:bg-cr-panel-hover hover:border-cr-border',
                onClick && 'cursor-pointer',
                className
            )}
            onClick={onClick}
        >
            {onToggle !== undefined && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle();
                    }}
                    className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all duration-200 cursor-pointer',
                        checked
                            ? 'border-cr-accent bg-cr-accent text-cr-bg'
                            : 'border-cr-text-muted hover:border-cr-accent'
                    )}
                >
                    {checked && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 5l2 2 4-4" />
                        </svg>
                    )}
                </button>
            )}

            <div className="flex-1 min-w-0">
                <p
                    className={cn(
                        'text-sm truncate transition-all duration-200',
                        checked ? 'text-cr-text-muted line-through' : 'text-cr-text'
                    )}
                >
                    {title}
                </p>
                {subtitle && (
                    <p className="text-xs text-cr-text-muted truncate mt-0.5">{subtitle}</p>
                )}
            </div>

            <div className="flex items-center gap-2">
                {trailing}
                {onDelete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="opacity-0 group-hover:opacity-100 text-cr-text-muted hover:text-cr-danger transition-all duration-200 cursor-pointer"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M3 3l8 8M11 3l-8 8" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}
