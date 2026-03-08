'use client';

import { cn } from '@/lib/utils';
import React, { useEffect, useCallback } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
    fullScreen?: boolean;
}

export function Modal({ isOpen, onClose, title, children, className, fullScreen }: ModalProps) {
    const handleEscape = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        },
        [onClose]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleEscape]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />
            {/* Content */}
            <div
                className={cn(
                    'relative z-10 max-h-[90vh] overflow-y-auto',
                    fullScreen
                        ? 'h-full w-full'
                        : 'w-full max-w-lg rounded-lg border border-cr-border bg-cr-panel p-6 shadow-2xl mx-4',
                    className
                )}
            >
                {title && !fullScreen && (
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-cr-text">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="rounded p-1 text-cr-text-muted hover:text-cr-text transition-colors cursor-pointer"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4l8 8M12 4l-8 8" />
                            </svg>
                        </button>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}
