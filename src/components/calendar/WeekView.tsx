'use client';

import React from 'react';
import type { CalendarEvent } from '@/lib/models';
import { EVENT_TYPES } from './eventTypeConfig';
import { cn } from '@/lib/utils';

interface WeekViewProps {
    weekStart: Date; // Should be a Sunday
    events: CalendarEvent[];
    onEventClick: (event: CalendarEvent) => void;
    onSlotClick: (date: string, time: string) => void;
}

function formatDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDayLabel(d: Date): string {
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM

export function WeekView({ weekStart, events, onEventClick, onSlotClick }: WeekViewProps) {
    const today = new Date();
    const todayStr = formatDateStr(today);

    // Build 7 days from weekStart
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
    });

    // Group events by date
    const eventsByDate = new Map<string, CalendarEvent[]>();
    events.forEach((ev) => {
        const existing = eventsByDate.get(ev.date) || [];
        existing.push(ev);
        eventsByDate.set(ev.date, existing);
    });

    // Parse hour from "HH:mm" string
    const parseHour = (time: string): number => {
        const [h, m] = time.split(':').map(Number);
        return h + m / 60;
    };

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[700px]">
                {/* Day headers */}
                <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-px mb-1">
                    <div /> {/* Time column spacer */}
                    {days.map((d) => {
                        const dateStr = formatDateStr(d);
                        const isToday = dateStr === todayStr;
                        return (
                            <div
                                key={dateStr}
                                className={cn(
                                    'text-center py-2 rounded-t-md font-mono text-[10px] uppercase tracking-wider',
                                    isToday
                                        ? 'text-cr-accent bg-cr-accent-muted/20 font-bold'
                                        : 'text-cr-text-muted'
                                )}
                            >
                                {getDayLabel(d)}
                            </div>
                        );
                    })}
                </div>

                {/* Time grid */}
                <div className="relative grid grid-cols-[60px_repeat(7,1fr)] gap-px">
                    {/* Hour rows */}
                    {HOURS.map((hour) => (
                        <React.Fragment key={hour}>
                            {/* Time label */}
                            <div className="h-14 flex items-start justify-end pr-2 pt-0.5">
                                <span className="font-mono text-[10px] text-cr-text-muted">
                                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                                </span>
                            </div>

                            {/* Day columns for this hour */}
                            {days.map((d) => {
                                const dateStr = formatDateStr(d);
                                const timeStr = `${String(hour).padStart(2, '0')}:00`;
                                return (
                                    <div
                                        key={`${dateStr}-${hour}`}
                                        onClick={() => onSlotClick(dateStr, timeStr)}
                                        className="h-14 border-t border-cr-border/40 hover:bg-cr-panel-hover/50 transition-colors cursor-pointer relative"
                                    />
                                );
                            })}
                        </React.Fragment>
                    ))}

                    {/* Overlay events on top of the grid */}
                    {days.map((d, dayIndex) => {
                        const dateStr = formatDateStr(d);
                        const dayEvents = eventsByDate.get(dateStr) || [];

                        return dayEvents.map((ev) => {
                            const startHour = parseHour(ev.startTime);
                            const endHour = parseHour(ev.endTime);
                            const topOffset = (startHour - 6) * 56; // 56px = h-14
                            const height = Math.max((endHour - startHour) * 56, 28);
                            const config = EVENT_TYPES[ev.eventType];

                            return (
                                <div
                                    key={ev.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEventClick(ev);
                                    }}
                                    className="absolute rounded-md px-1.5 py-1 overflow-hidden cursor-pointer transition-all duration-200 hover:brightness-125 hover:shadow-lg z-10"
                                    style={{
                                        top: `${topOffset}px`,
                                        height: `${height}px`,
                                        left: `calc(60px + ${(dayIndex * (100 - (60 / 7))) / 7 + (60 / 7)}%)`,
                                        width: `calc((100% - 60px) / 7 - 2px)`,
                                        backgroundColor: config.bgColor,
                                        borderLeft: `3px solid ${config.color}`,
                                        border: `1px solid ${config.borderColor}`,
                                        borderLeftWidth: '3px',
                                        borderLeftColor: config.color,
                                    }}
                                >
                                    <div className="font-mono text-[10px] font-semibold truncate" style={{ color: config.color }}>
                                        {ev.title}
                                    </div>
                                    <div className="font-mono text-[9px] text-cr-text-muted truncate">
                                        {ev.startTime} – {ev.endTime}
                                    </div>
                                    {ev.location && height > 40 && (
                                        <div className="font-mono text-[9px] text-cr-text-muted/70 truncate">
                                            📍 {ev.location}
                                        </div>
                                    )}
                                </div>
                            );
                        });
                    })}
                </div>
            </div>
        </div>
    );
}
