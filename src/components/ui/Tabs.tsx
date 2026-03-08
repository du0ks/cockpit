'use client';

import { cn } from '@/lib/utils';
import React, { useState } from 'react';

interface TabItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
}

interface TabsProps {
    tabs: TabItem[];
    activeTab: string;
    onChange: (id: string) => void;
    className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
    return (
        <div className={cn('flex gap-1 rounded-lg bg-cr-bg p-1 border border-cr-border', className)}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={cn(
                        'flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-xs font-medium',
                        'transition-all duration-200 cursor-pointer',
                        activeTab === tab.id
                            ? 'bg-cr-accent-muted text-cr-accent shadow-sm'
                            : 'text-cr-text-muted hover:text-cr-text-secondary hover:bg-cr-panel'
                    )}
                >
                    {tab.icon}
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
