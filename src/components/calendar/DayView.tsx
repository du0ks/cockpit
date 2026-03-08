'use client';

import React from 'react';
import type { CalendarEvent } from '@/lib/models';
import { EVENT_TYPES } from './eventTypeConfig';
import { cn } from '@/lib/utils';

interface DayViewProps {
    date: string; // 'YYYY-MM-DD'
    events: CalendarEvent[];
    onEventClick: (event: CalendarEvent) => void;
    onAddClick: () => void;
}

function formatDisplayDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function DayView({ date, events, onEventClick, onAddClick }: DayViewProps) {
    const sorted = [...events].sort((a, b) => a.startTime.localeCompare(b.startTime));

    return (
        <div className="space-y-3">
            {/* Day header */}
            <div className="flex items-center justify-between">
                <h3 className="font-mono text-sm text-cr-text font-medium">
                    {formatDisplayDate(date)}
                </h3>
                <button
                    onClick={onAddClick}
                    className="font-mono text-xs text-cr-accent hover:text-cr-accent/80 transition-colors cursor-pointer"
                >
                    + Add Event
                </button>
            </div>

            {sorted.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-3xl mb-2 opacity-40">📅</div>
                    <p className="font-mono text-xs text-cr-text-muted">No events for this day</p>
                    <button
                        onClick={onAddClick}
                        className="mt-3 font-mono text-xs text-cr-accent hover:underline cursor-pointer"
                    >
                        Create one →
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    {sorted.map((ev) => {
                        const config = EVENT_TYPES[ev.eventType];
                        return (
                            <div
                                key={ev.id}
                                onClick={() => onEventClick(ev)}
                                className={cn(
                                    'rounded-lg border p-3 cursor-pointer',
                                    'transition-all duration-200 hover:shadow-lg hover:brightness-110'
                                )}
                                style={{
                                    backgroundColor: config.bgColor,
                                    borderColor: config.borderColor,
                                    borderLeftWidth: '4px',
                                    borderLeftColor: config.color,
                                }}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm">{config.icon}</span>
                                            <span
                                                className="font-mono text-sm font-semibold truncate"
                                                style={{ color: config.color }}
                                            >
                                                {ev.title}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 text-cr-text-secondary">
                                            <span className="font-mono text-xs">
                                                🕐 {ev.startTime} – {ev.endTime}
                                            </span>
                                            {ev.location && (
                                                <span className="font-mono text-xs">
                                                    📍 {ev.location}
                                                </span>
                                            )}
                                        </div>

                                        {ev.notes && (
                                            <p className="font-mono text-[11px] text-cr-text-muted mt-2 line-clamp-2">
                                                {ev.notes}
                                            </p>
                                        )}
                                    </div>

                                    <span
                                        className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-medium"
                                        style={{
                                            backgroundColor: `${config.color}20`,
                                            color: config.color,
                                            border: `1px solid ${config.borderColor}`,
                                        }}
                                    >
                                        {ev.eventType === 'other' && ev.customType
                                            ? ev.customType
                                            : config.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
