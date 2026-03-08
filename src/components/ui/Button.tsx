'use client';

import { cn } from '@/lib/utils';
import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'emergency';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary:
        'bg-cr-accent-muted text-cr-accent border-cr-accent-dim hover:bg-cr-accent-dim hover:shadow-[0_0_12px_rgba(62,207,90,0.15)]',
    secondary:
        'bg-cr-panel text-cr-text border-cr-border hover:bg-cr-panel-hover hover:border-cr-border-hover',
    danger:
        'bg-cr-danger-dim/30 text-cr-danger border-cr-danger-dim hover:bg-cr-danger-dim/50',
    ghost:
        'bg-transparent text-cr-text-secondary border-transparent hover:bg-cr-panel hover:text-cr-text',
    emergency:
        'bg-cr-danger text-white border-cr-danger hover:bg-cr-danger/80 shadow-[0_0_20px_rgba(207,62,62,0.3)] hover:shadow-[0_0_30px_rgba(207,62,62,0.5)]',
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
};

export function Button({
    variant = 'secondary',
    size = 'md',
    children,
    className,
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded-md border font-mono font-medium',
                'transition-all duration-200 cursor-pointer',
                'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none',
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
