'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/stats/StatCard';
import { ActivityHeatmap } from '@/components/stats/ActivityHeatmap';
import { BarChart } from '@/components/stats/BarChart';
import { ProgressRing } from '@/components/stats/ProgressRing';
import { LineChart } from '@/components/stats/LineChart';
import { TargetManagerModal } from '@/components/stats/TargetManagerModal';
import { EVENT_TYPES } from '@/components/calendar/eventTypeConfig';
import { taskRepository } from '@/lib/repositories/TaskRepository';
import { objectiveRepository } from '@/lib/repositories/ObjectiveRepository';
import { anxietyRepository } from '@/lib/repositories/AnxietyRepository';
import { calendarEventRepository } from '@/lib/repositories/CalendarEventRepository';
import { weeklyTargetRepository } from '@/lib/repositories/WeeklyTargetRepository';
import {
    computeActivityHeatmap,
    computeWeeklyBars,
    computeEventBreakdown,
    computeTargetProgress,
    computeAnxietyTrend,
    computeAnxietyAverage,
    computeObjectiveRates,
    computeStreak,
    getWeekStartDate,
} from '@/lib/utils/statsEngine';
import { getAnxietyColor } from '@/lib/utils';

import type { Task, CalendarEvent, AnxietyLog, Objective, WeeklyTarget } from '@/lib/models';
import type { HeatmapCell, WeeklyBarData, EventBreakdown, TargetProgress, AnxietyPoint, ObjectiveRate } from '@/lib/utils/statsEngine';

export default function StatsPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [anxietyLogs, setAnxietyLogs] = useState<AnxietyLog[]>([]);
    const [objectives, setObjectives] = useState<Objective[]>([]);
    const [targets, setTargets] = useState<WeeklyTarget[]>([]);

    const [heatmap, setHeatmap] = useState<HeatmapCell[]>([]);
    const [weeklyBars, setWeeklyBars] = useState<WeeklyBarData[]>([]);
    const [eventBreakdown, setEventBreakdown] = useState<EventBreakdown[]>([]);
    const [targetProgress, setTargetProgress] = useState<TargetProgress[]>([]);
    const [anxietyTrend, setAnxietyTrend] = useState<AnxietyPoint[]>([]);
    const [objectiveRates, setObjectiveRates] = useState<ObjectiveRate[]>([]);
    const [streak, setStreak] = useState({ current: 0, longest: 0 });
    const [anxietyAvg, setAnxietyAvg] = useState<number | null>(null);
    const [weekDone, setWeekDone] = useState(0);
    const [showTargetModal, setShowTargetModal] = useState(false);

    const loadData = useCallback(async () => {
        const [allTasks, allEvents, allLogs, allObjectives, allTargets] = await Promise.all([
            taskRepository.getAll(),
            calendarEventRepository.getAll(),
            anxietyRepository.getAll(),
            objectiveRepository.getAll(),
            weeklyTargetRepository.getAll(),
        ]);

        setTasks(allTasks);
        setEvents(allEvents);
        setAnxietyLogs(allLogs);
        setObjectives(allObjectives);
        setTargets(allTargets);

        // Compute stats
        setHeatmap(computeActivityHeatmap(allTasks, 52));
        const bars = computeWeeklyBars(allTasks);
        setWeeklyBars(bars);
        setWeekDone(bars.reduce((sum, b) => sum + b.completed, 0));
        setEventBreakdown(computeEventBreakdown(allEvents));
        setTargetProgress(computeTargetProgress(allTargets, allEvents, getWeekStartDate(new Date())));
        setAnxietyTrend(computeAnxietyTrend(allLogs, 30));
        setAnxietyAvg(computeAnxietyAverage(allLogs, 7));
        setObjectiveRates(computeObjectiveRates(allObjectives));
        setStreak(computeStreak(allTasks));
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Objectives hit rate (across all scopes)
    const totalObjDone = objectiveRates.reduce((s, r) => s + r.done, 0);
    const totalObj = objectiveRates.reduce((s, r) => s + r.total, 0);
    const objRate = totalObj > 0 ? Math.round((totalObjDone / totalObj) * 100) : 0;

    return (
        <div className="space-y-4">
            <h1 className="font-mono text-lg font-bold text-cr-text uppercase tracking-wider">
                ◆ Stats
            </h1>

            {/* ── KPI Row ─────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                    label="Tasks This Week"
                    value={weekDone}
                    icon="▣"
                    subtitle={`${streak.current} day streak`}
                />
                <StatCard
                    label="Current Streak"
                    value={`${streak.current}d`}
                    icon="▸"
                    subtitle={`Longest: ${streak.longest}d`}
                    accentColor={streak.current >= 7 ? '#3ecf5a' : undefined}
                />
                <StatCard
                    label="Anxiety Avg"
                    value={anxietyAvg != null ? anxietyAvg : '—'}
                    icon="◉"
                    subtitle="Past 7 days"
                    accentColor={anxietyAvg != null ? getAnxietyColor(anxietyAvg) : undefined}
                    trend={anxietyAvg != null ? (anxietyAvg <= 4 ? 'down' : anxietyAvg >= 7 ? 'up' : 'neutral') : undefined}
                />
                <StatCard
                    label="Objectives"
                    value={`${objRate}%`}
                    icon="⬡"
                    subtitle={`${totalObjDone}/${totalObj} completed`}
                />
            </div>

            {/* ── Activity Heatmap ────────────────────────── */}
            <Panel title="Activity (1 Year)" className="overflow-x-auto pb-4" glow>
                <ActivityHeatmap cells={heatmap} weeks={52} />
            </Panel>

            {/* ── This Week Performance ───────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Panel title="This Week" glow>
                    {weeklyBars.some((b) => b.completed > 0) ? (
                        <BarChart
                            data={weeklyBars.map((b) => ({
                                label: b.day,
                                value: b.completed,
                            }))}
                            height={130}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-32">
                            <span className="font-mono text-xs text-cr-text-muted">
                                Complete tasks to see your week
                            </span>
                        </div>
                    )}
                </Panel>

                {/* ── Event Type Balance ──────────────────── */}
                <Panel title="Event Balance" glow>
                    {eventBreakdown.length > 0 ? (
                        <BarChart
                            data={eventBreakdown.map((b) => ({
                                label: EVENT_TYPES[b.type].icon,
                                value: b.count,
                                color: EVENT_TYPES[b.type].color,
                            }))}
                            height={130}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-32">
                            <span className="font-mono text-xs text-cr-text-muted">
                                Add calendar events to see balance
                            </span>
                        </div>
                    )}
                </Panel>
            </div>

            {/* ── Weekly Targets ──────────────────────────── */}
            <Panel
                title="Weekly Targets"
                glow
                headerAction={
                    <Button variant="ghost" size="sm" onClick={() => setShowTargetModal(true)}>
                        Manage
                    </Button>
                }
            >
                {targetProgress.length > 0 ? (
                    <div className="flex flex-wrap gap-6 justify-center py-2">
                        {targetProgress.map((tp) => {
                            const config = EVENT_TYPES[tp.target.eventType];
                            return (
                                <ProgressRing
                                    key={tp.target.id}
                                    percentage={tp.percentage}
                                    actual={tp.actual}
                                    target={tp.target.targetCount}
                                    label={config.label}
                                    icon={config.icon}
                                    color={config.color}
                                    size={90}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 py-4">
                        <span className="font-mono text-xs text-cr-text-muted">
                            No targets set yet
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => setShowTargetModal(true)}>
                            + Set Weekly Targets
                        </Button>
                    </div>
                )}
            </Panel>

            {/* ── Anxiety Trend ───────────────────────────── */}
            <Panel title="Anxiety Trend (30 days)" glow>
                <LineChart
                    data={anxietyTrend}
                    height={140}
                    maxY={10}
                />
            </Panel>

            {/* ── Objectives Scorecard ────────────────────── */}
            <Panel title="Objectives" glow>
                {objectiveRates.some((r) => r.total > 0) ? (
                    <div className="grid grid-cols-3 gap-3">
                        {objectiveRates.map((r) => (
                            <div key={r.scope} className="text-center">
                                <div className="font-mono text-[10px] uppercase tracking-wider text-cr-text-muted mb-1">
                                    {r.scope}
                                </div>
                                <div
                                    className="font-mono text-xl font-bold"
                                    style={{
                                        color:
                                            r.rate >= 80
                                                ? 'var(--color-cr-accent)'
                                                : r.rate >= 50
                                                    ? 'var(--color-cr-warning)'
                                                    : 'var(--color-cr-danger)',
                                    }}
                                >
                                    {r.rate}%
                                </div>
                                <div className="font-mono text-[10px] text-cr-text-muted">
                                    {r.done}/{r.total}
                                </div>
                                {/* Mini bar */}
                                <div className="mt-1 mx-auto w-16 h-1 rounded-full bg-cr-border overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{
                                            width: `${r.rate}%`,
                                            backgroundColor:
                                                r.rate >= 80
                                                    ? 'var(--color-cr-accent)'
                                                    : r.rate >= 50
                                                        ? 'var(--color-cr-warning)'
                                                        : 'var(--color-cr-danger)',
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-20">
                        <span className="font-mono text-xs text-cr-text-muted">
                            Add objectives in Plans to see rates
                        </span>
                    </div>
                )}
            </Panel>

            {/* ── Target Manager Modal ────────────────────── */}
            <TargetManagerModal
                isOpen={showTargetModal}
                onClose={() => setShowTargetModal(false)}
                onUpdate={loadData}
            />
        </div>
    );
}
