'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1">
                {label && (
                    <label className="font-mono text-xs font-medium uppercase tracking-wider text-cr-text-secondary">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={cn(
                        'w-full rounded-md border border-cr-border bg-cr-bg px-3 py-2 text-sm text-cr-text',
                        'placeholder:text-cr-text-muted',
                        'focus:border-cr-accent-dim focus:outline-none focus:ring-1 focus:ring-cr-accent-dim',
                        'transition-colors duration-200',
                        error && 'border-cr-danger',
                        className
                    )}
                    {...props}
                />
                {error && <span className="text-xs text-cr-danger">{error}</span>}
            </div>
        );
    }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, className, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1">
                {label && (
                    <label className="font-mono text-xs font-medium uppercase tracking-wider text-cr-text-secondary">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={cn(
                        'w-full rounded-md border border-cr-border bg-cr-bg px-3 py-2 text-sm text-cr-text',
                        'placeholder:text-cr-text-muted resize-none',
                        'focus:border-cr-accent-dim focus:outline-none focus:ring-1 focus:ring-cr-accent-dim',
                        'transition-colors duration-200',
                        className
                    )}
                    rows={3}
                    {...props}
                />
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, options, className, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1">
                {label && (
                    <label className="font-mono text-xs font-medium uppercase tracking-wider text-cr-text-secondary">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    className={cn(
                        'w-full rounded-md border border-cr-border bg-cr-bg px-3 py-2 text-sm text-cr-text',
                        'focus:border-cr-accent-dim focus:outline-none focus:ring-1 focus:ring-cr-accent-dim',
                        'transition-colors duration-200 cursor-pointer',
                        className
                    )}
                    {...props}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
        );
    }
);

Select.displayName = 'Select';
