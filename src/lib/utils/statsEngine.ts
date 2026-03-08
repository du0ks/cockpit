import type { Task, CalendarEvent, AnxietyLog, Objective, WeeklyTarget, EventType } from '@/lib/models';

// ── Helper: date strings ────────────────────────────────────
function dateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysAgo(n: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(0, 0, 0, 0);
    return d;
}

function getWeekStartDate(d: Date): Date {
    const result = new Date(d);
    result.setDate(result.getDate() - result.getDay());
    result.setHours(0, 0, 0, 0);
    return result;
}

// ── Activity Heatmap ────────────────────────────────────────
export interface HeatmapCell {
    date: string;
    count: number;
    level: 0 | 1 | 2 | 3; // intensity
}

export function computeActivityHeatmap(tasks: Task[], weeks: number = 12): HeatmapCell[] {
    const totalDays = weeks * 7;
    const countByDate = new Map<string, number>();

    tasks.forEach((t) => {
        if (t.status === 'done') {
            const d = dateStr(new Date(t.updatedAt));
            countByDate.set(d, (countByDate.get(d) || 0) + 1);
        }
    });

    const cells: HeatmapCell[] = [];
    for (let i = totalDays - 1; i >= 0; i--) {
        const d = daysAgo(i);
        const ds = dateStr(d);
        const count = countByDate.get(ds) || 0;
        const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : 3;
        cells.push({ date: ds, count, level: level as 0 | 1 | 2 | 3 });
    }
    return cells;
}

// ── Weekly Bar Chart ────────────────────────────────────────
export interface WeeklyBarData {
    day: string;       // 'Mon', 'Tue', etc.
    date: string;
    completed: number;
    total: number;
}

export function computeWeeklyBars(tasks: Task[]): WeeklyBarData[] {
    const today = new Date();
    const weekStart = getWeekStartDate(today);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const bars: WeeklyBarData[] = [];

    for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        const ds = dateStr(d);

        // Tasks completed on this day
        const completed = tasks.filter((t) => {
            if (t.status !== 'done') return false;
            return dateStr(new Date(t.updatedAt)) === ds;
        }).length;

        // Tasks created on this day
        const total = tasks.filter((t) => {
            return dateStr(new Date(t.createdAt)) === ds;
        }).length;

        bars.push({ day: dayNames[i], date: ds, completed, total: Math.max(total, completed) });
    }

    return bars;
}

// ── Event Type Breakdown ────────────────────────────────────
export interface EventBreakdown {
    type: EventType;
    count: number;
    percentage: number;
}

export function computeEventBreakdown(events: CalendarEvent[]): EventBreakdown[] {
    const countByType = new Map<EventType, number>();
    events.forEach((ev) => {
        countByType.set(ev.eventType, (countByType.get(ev.eventType) || 0) + 1);
    });

    const total = events.length || 1;
    const types: EventType[] = ['fitness', 'work', 'social', 'personal', 'other'];

    return types
        .map((type) => ({
            type,
            count: countByType.get(type) || 0,
            percentage: Math.round(((countByType.get(type) || 0) / total) * 100),
        }))
        .filter((b) => b.count > 0);
}

// ── Target Progress ─────────────────────────────────────────
export interface TargetProgress {
    target: WeeklyTarget;
    actual: number;
    percentage: number;
}

export function computeTargetProgress(
    targets: WeeklyTarget[],
    events: CalendarEvent[],
    weekStart: Date
): TargetProgress[] {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const wsStr = dateStr(weekStart);
    const weStr = dateStr(weekEnd);

    return targets.map((target) => {
        const actual = events.filter(
            (ev) => ev.eventType === target.eventType && ev.date >= wsStr && ev.date <= weStr
        ).length;
        const percentage = target.targetCount > 0 ? Math.round((actual / target.targetCount) * 100) : 0;
        return { target, actual, percentage: Math.min(percentage, 100) };
    });
}

// ── Anxiety Trend ───────────────────────────────────────────
export interface AnxietyPoint {
    date: string;
    score: number;
}

export function computeAnxietyTrend(logs: AnxietyLog[], days: number = 30): AnxietyPoint[] {
    const points: AnxietyPoint[] = [];

    for (let i = days - 1; i >= 0; i--) {
        const d = daysAgo(i);
        const ds = dateStr(d);
        const log = logs.find((l) => l.date === ds);
        if (log && log.score != null) {
            points.push({ date: ds, score: log.score });
        }
    }

    return points;
}

export function computeAnxietyAverage(logs: AnxietyLog[], days: number = 7): number | null {
    const trend = computeAnxietyTrend(logs, days);
    if (trend.length === 0) return null;
    return Math.round((trend.reduce((sum, p) => sum + p.score, 0) / trend.length) * 10) / 10;
}

// ── Objective Completion Rates ──────────────────────────────
export interface ObjectiveRate {
    scope: string;
    total: number;
    done: number;
    rate: number;
}

export function computeObjectiveRates(objectives: Objective[]): ObjectiveRate[] {
    const scopes = ['week', 'month', 'quarter'];
    return scopes.map((scope) => {
        const scoped = objectives.filter((o) => o.scope === scope && o.status !== 'archived');
        const done = scoped.filter((o) => o.status === 'done').length;
        const total = scoped.length;
        return {
            scope,
            total,
            done,
            rate: total > 0 ? Math.round((done / total) * 100) : 0,
        };
    });
}

// ── Streak Calculation ──────────────────────────────────────
export function computeStreak(tasks: Task[]): { current: number; longest: number } {
    const doneByDate = new Map<string, boolean>();
    tasks.forEach((t) => {
        if (t.status === 'done') {
            doneByDate.set(dateStr(new Date(t.updatedAt)), true);
        }
    });

    let current = 0;
    let longest = 0;
    let streak = 0;

    // Check last 365 days
    for (let i = 0; i < 365; i++) {
        const ds = dateStr(daysAgo(i));
        if (doneByDate.has(ds)) {
            streak++;
            longest = Math.max(longest, streak);
            if (i === streak - 1) current = streak; // only if continuous from today
        } else {
            streak = 0;
        }
    }

    return { current, longest };
}

// ── Week helpers for external use ───────────────────────────
export { getWeekStartDate, dateStr };
