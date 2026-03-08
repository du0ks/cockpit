'use client';

import React from 'react';
import type { CalendarEvent, EventType } from '@/lib/models';
import { EVENT_TYPES } from './eventTypeConfig';
import { cn } from '@/lib/utils';

interface CalendarGridProps {
    year: number;
    month: number; // 0-indexed
    events: CalendarEvent[];
    onDayClick: (date: string) => void;
}

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
    return new Date(year, month, 1).getDay(); // 0=Sun
}

function formatDateStr(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function CalendarGrid({ year, month, events, onDayClick }: CalendarGridProps) {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfWeek(year, month);
    const today = new Date();
    const todayStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());

    // Group events by date
    const eventsByDate = new Map<string, CalendarEvent[]>();
    events.forEach((ev) => {
        const existing = eventsByDate.get(ev.date) || [];
        existing.push(ev);
        eventsByDate.set(ev.date, existing);
    });

    // Get aggregated type badges for a date
    const getTypeBadges = (dateStr: string) => {
        const dayEvents = eventsByDate.get(dateStr) || [];
        if (dayEvents.length === 0) return null;

        const typeCounts = new Map<EventType, number>();
        dayEvents.forEach((ev) => {
            typeCounts.set(ev.eventType, (typeCounts.get(ev.eventType) || 0) + 1);
        });

        return Array.from(typeCounts.entries()).map(([type, count]) => ({
            type,
            count,
            config: EVENT_TYPES[type],
        }));
    };

    // Previous month fill
    const prevMonthDays = getDaysInMonth(year, month - 1);
    const prevMonthCells: (number | null)[] = [];
    for (let i = firstDay - 1; i >= 0; i--) {
        prevMonthCells.push(prevMonthDays - i);
    }

    // Current month cells
    const currentCells: number[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
        currentCells.push(d);
    }

    // Next month fill
    const totalCells = prevMonthCells.length + currentCells.length;
    const nextFill = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;
    const nextMonthCells: number[] = [];
    for (let d = 1; d <= nextFill; d++) {
        nextMonthCells.push(d);
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="select-none">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-px mb-1">
                {dayNames.map((d) => (
                    <div key={d} className="text-center font-mono text-[10px] text-cr-text-muted uppercase tracking-wider py-2">
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar cells */}
            <div className="grid grid-cols-7 gap-px">
                {/* Previous month */}
                {prevMonthCells.map((day, i) => (
                    <div
                        key={`prev-${i}`}
                        className="min-h-[72px] md:min-h-[88px] rounded-md border border-cr-border/30 bg-cr-bg/30 p-1.5"
                    >
                        <span className="font-mono text-[11px] text-cr-text-muted/40">{day}</span>
                    </div>
                ))}

                {/* Current month */}
                {currentCells.map((day) => {
                    const dateStr = formatDateStr(year, month, day);
                    const isToday = dateStr === todayStr;
                    const badges = getTypeBadges(dateStr);

                    return (
                        <div
                            key={day}
                            onClick={() => onDayClick(dateStr)}
                            className={cn(
                                'min-h-[72px] md:min-h-[88px] rounded-md border p-1.5 cursor-pointer',
                                'transition-all duration-200 hover:bg-cr-panel-hover hover:border-cr-border-hover',
                                isToday
                                    ? 'border-cr-accent-dim bg-cr-accent-muted/20 shadow-[0_0_12px_rgba(62,207,90,0.08)]'
                                    : 'border-cr-border bg-cr-panel/40'
                            )}
                        >
                            <span
                                className={cn(
                                    'inline-flex items-center justify-center font-mono text-[11px] w-5 h-5 rounded-full',
                                    isToday
                                        ? 'bg-cr-accent text-cr-bg font-bold'
                                        : 'text-cr-text-secondary'
                                )}
                            >
                                {day}
                            </span>

                            {/* Type badges */}
                            {badges && (
                                <div className="mt-1 flex flex-wrap gap-0.5">
                                    {badges.map(({ type, count, config }) => (
                                        <span
                                            key={type}
                                            className="inline-flex items-center gap-0.5 rounded-sm px-1 py-px text-[9px] font-mono font-medium"
                                            style={{
                                                backgroundColor: config.bgColor,
                                                color: config.color,
                                                border: `1px solid ${config.borderColor}`,
                                            }}
                                            title={`${config.label}: ${count}`}
                                        >
                                            <span className="text-[10px]">{config.icon}</span>
                                            {count > 1 && <span>{count}</span>}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Next month */}
                {nextMonthCells.map((day, i) => (
                    <div
                        key={`next-${i}`}
                        className="min-h-[72px] md:min-h-[88px] rounded-md border border-cr-border/30 bg-cr-bg/30 p-1.5"
                    >
                        <span className="font-mono text-[11px] text-cr-text-muted/40">{day}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
