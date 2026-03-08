'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ListItem } from '@/components/ui/ListItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { SliderInput } from '@/components/ui/SliderInput';
import { Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Tag } from '@/components/ui/Tag';
import { taskRepository } from '@/lib/repositories/TaskRepository';
import { objectiveRepository } from '@/lib/repositories/ObjectiveRepository';
import { notNowRepository } from '@/lib/repositories/NotNowRepository';
import { anxietyRepository } from '@/lib/repositories/AnxietyRepository';
import { settingsRepository } from '@/lib/repositories/SettingsRepository';
import { calendarEventRepository } from '@/lib/repositories/CalendarEventRepository';
import { EVENT_TYPES } from '@/components/calendar/eventTypeConfig';
import type { Task, Objective, NotNowItem, AnxietyLog, CalendarEvent, TaskScope } from '@/lib/models';
import { formatDate, getWeekNumber, todayString, cn } from '@/lib/utils';

export default function HomePage() {
  const { showToast } = useToast();
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [weekTasks, setWeekTasks] = useState<Task[]>([]);
  const [monthObjectives, setMonthObjectives] = useState<Objective[]>([]);
  const [quarterObjectives, setQuarterObjectives] = useState<Objective[]>([]);
  const [notNowItems, setNotNowItems] = useState<NotNowItem[]>([]);
  const [todayAnxiety, setTodayAnxiety] = useState<AnxietyLog | null>(null);
  const [currentFocus, setCurrentFocus] = useState('');
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddScope, setQuickAddScope] = useState<TaskScope>('today');
  const [anxietyScore, setAnxietyScore] = useState(5);

  const loadData = useCallback(async () => {
    const [today, week, monthObj, quarterObj, notNow, settings] = await Promise.all([
      taskRepository.getByScope('today'),
      taskRepository.getByScope('week'),
      objectiveRepository.getByScope('month'),
      objectiveRepository.getByScope('quarter'),
      notNowRepository.getActive(),
      settingsRepository.get(),
    ]);
    setTodayTasks(today.filter(t => t.status !== 'archived'));
    setWeekTasks(week.filter(t => t.status !== 'archived'));
    setMonthObjectives(monthObj.filter(o => o.status !== 'archived'));
    setQuarterObjectives(quarterObj.filter(o => o.status !== 'archived'));
    setNotNowItems(notNow.slice(0, 5));
    setCurrentFocus(settings.currentFocus || '');

    // Load upcoming calendar events (next 7 days)
    const todayDate = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    const upcoming = await calendarEventRepository.getByDateRange(todayDate, nextWeekStr);
    setUpcomingEvents(upcoming.slice(0, 3));

    const anxLog = await anxietyRepository.getByDate(todayString());
    if (anxLog) {
      setTodayAnxiety(anxLog);
      setAnxietyScore(anxLog.score || 5);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Listen for keyboard shortcut
  useEffect(() => {
    const handler = () => setShowQuickAdd(true);
    window.addEventListener('cr:new-task', handler);
    return () => window.removeEventListener('cr:new-task', handler);
  }, []);

  const handleQuickAdd = async () => {
    if (!newTaskTitle.trim()) return;
    await taskRepository.create({
      title: newTaskTitle.trim(),
      scope: quickAddScope,
      status: 'open',
    });
    setNewTaskTitle('');
    setShowQuickAdd(false);
    showToast('Task added');
    loadData();
  };

  const toggleTask = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'open' : 'done';
    await taskRepository.update(task.id, { status: newStatus });
    loadData();
  };

  const deleteTask = async (id: string) => {
    await taskRepository.delete(id);
    loadData();
  };

  const saveAnxietyScore = async () => {
    if (todayAnxiety) {
      await anxietyRepository.update(todayAnxiety.id, { score: anxietyScore });
    } else {
      await anxietyRepository.create({ date: todayString(), score: anxietyScore });
    }
    showToast('Anxiety score saved');
    loadData();
  };

  const saveFocus = async () => {
    await settingsRepository.update({ currentFocus });
    showToast('Focus updated');
  };

  const now = new Date();
  const openToday = todayTasks.filter(t => t.status === 'open').length;
  const doneToday = todayTasks.filter(t => t.status === 'done').length;

  return (
    <div className="space-y-4">
      {/* ── Status Strip ─────────────────────────────────── */}
      <Panel className="!p-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="font-mono text-xs text-cr-text-secondary">
            <span className="text-cr-accent">◉</span> {formatDate(now)}
          </div>
          <div className="font-mono text-xs text-cr-text-muted">
            W{getWeekNumber(now)}
          </div>
          {currentFocus && (
            <div className="font-mono text-xs">
              <span className="text-cr-text-muted">FOCUS:</span>{' '}
              <span className="text-cr-accent">{currentFocus}</span>
            </div>
          )}
          {todayAnxiety?.score && (
            <Tag label={`Anxiety: ${todayAnxiety.score}/10`} color={todayAnxiety.score > 6 ? '#cf3e3e' : '#cfa63e'} />
          )}
          <div className="font-mono text-xs text-cr-text-muted ml-auto">
            {openToday} open · {doneToday} done
          </div>
        </div>
      </Panel>

      {/* ── Focus editor (inline) ──────────────────────── */}
      <Panel className="!p-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-cr-text-muted shrink-0">FOCUS ▸</span>
          <input
            value={currentFocus}
            onChange={(e) => setCurrentFocus(e.target.value)}
            onBlur={saveFocus}
            onKeyDown={(e) => e.key === 'Enter' && saveFocus()}
            placeholder="What's your current objective?"
            className="flex-1 bg-transparent text-sm text-cr-text placeholder:text-cr-text-muted/50 outline-none font-mono"
          />
        </div>
      </Panel>

      {/* ── Main Grid ────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Today Panel */}
        <Panel
          title="Today"
          glow
          className="md:col-span-2 lg:col-span-2"
          headerAction={
            <Button size="sm" variant="primary" onClick={() => setShowQuickAdd(true)}>
              + Add
            </Button>
          }
        >
          {todayTasks.length === 0 ? (
            <EmptyState icon="▹" title="No tasks for today" description="Press 'n' or click +Add to add a task" />
          ) : (
            <div className="space-y-0.5 max-h-64 overflow-y-auto">
              {todayTasks.map((task) => (
                <ListItem
                  key={task.id}
                  title={task.title}
                  checked={task.status === 'done'}
                  onToggle={() => toggleTask(task)}
                  onDelete={() => deleteTask(task.id)}
                />
              ))}
            </div>
          )}
        </Panel>

        {/* Anxiety Mini Panel */}
        <Panel title="Anxiety" glow>
          <div className="space-y-3">
            <a
              href="/calm"
              className="block w-full rounded-md bg-cr-danger/20 border border-cr-danger-dim py-3 text-center font-mono text-sm font-bold text-cr-danger hover:bg-cr-danger/30 transition-all duration-200 hover:shadow-[0_0_20px_rgba(207,62,62,0.2)]"
            >
              ⚠ EMERGENCY
            </a>
            <SliderInput
              value={anxietyScore}
              onChange={setAnxietyScore}
              label="Today's Score"
              min={1}
              max={10}
            />
            <Button size="sm" variant="secondary" onClick={saveAnxietyScore} className="w-full">
              Save Score
            </Button>
          </div>
        </Panel>

        {/* This Week */}
        <Panel title="This Week" glow>
          {weekTasks.length === 0 ? (
            <EmptyState icon="◈" title="No weekly focus items" />
          ) : (
            <div className="space-y-0.5 max-h-48 overflow-y-auto">
              {weekTasks.slice(0, 7).map((task) => (
                <ListItem
                  key={task.id}
                  title={task.title}
                  checked={task.status === 'done'}
                  onToggle={() => toggleTask(task)}
                />
              ))}
              {weekTasks.length > 7 && (
                <p className="text-xs text-cr-text-muted font-mono pl-3">+{weekTasks.length - 7} more</p>
              )}
            </div>
          )}
        </Panel>

        {/* This Month */}
        <Panel title="This Month" glow>
          {monthObjectives.length === 0 ? (
            <EmptyState icon="◈" title="No monthly outcomes" description="1–3 recommended" />
          ) : (
            <div className="space-y-0.5">
              {monthObjectives.map((obj) => (
                <ListItem
                  key={obj.id}
                  title={obj.title}
                  subtitle={obj.notes}
                  checked={obj.status === 'done'}
                  onToggle={async () => {
                    await objectiveRepository.update(obj.id, { status: obj.status === 'done' ? 'open' : 'done' });
                    loadData();
                  }}
                />
              ))}
            </div>
          )}
        </Panel>

        {/* This Quarter */}
        <Panel title="This Quarter" glow>
          {quarterObjectives.length === 0 ? (
            <EmptyState icon="◈" title="No quarterly outcomes" description="1–2 recommended" />
          ) : (
            <div className="space-y-0.5">
              {quarterObjectives.map((obj) => (
                <ListItem
                  key={obj.id}
                  title={obj.title}
                  subtitle={obj.notes}
                  checked={obj.status === 'done'}
                  onToggle={async () => {
                    await objectiveRepository.update(obj.id, { status: obj.status === 'done' ? 'open' : 'done' });
                    loadData();
                  }}
                />
              ))}
            </div>
          )}
        </Panel>

        {/* Upcoming Events Preview */}
        <Panel
          title="Upcoming"
          glow
          headerAction={
            <a href="/schedule" className="font-mono text-[10px] text-cr-accent hover:underline">
              Schedule →
            </a>
          }
        >
          {upcomingEvents.length === 0 ? (
            <EmptyState icon="◫" title="No upcoming events" description="Add events in Schedule" />
          ) : (
            <div className="space-y-1">
              {upcomingEvents.map((ev) => {
                const config = EVENT_TYPES[ev.eventType];
                return (
                  <div
                    key={ev.id}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 border transition-all duration-200 hover:bg-cr-panel-hover"
                    style={{ borderColor: config.borderColor, backgroundColor: config.bgColor }}
                  >
                    <span className="text-sm">{config.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs font-medium truncate" style={{ color: config.color }}>
                        {ev.title}
                      </p>
                      <p className="font-mono text-[10px] text-cr-text-muted">
                        {ev.date} · {ev.startTime}–{ev.endTime}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        {/* Not Now Preview */}
        <Panel
          title="Not Now"
          glow
          headerAction={
            <a href="/not-now" className="font-mono text-[10px] text-cr-accent hover:underline">
              View All →
            </a>
          }
        >
          {notNowItems.length === 0 ? (
            <EmptyState icon="◇" title="Parking lot is empty" />
          ) : (
            <div className="space-y-0.5">
              {notNowItems.map((item) => (
                <ListItem key={item.id} title={item.title} subtitle={item.tags.join(', ')} />
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* ── Quick Add Modal ──────────────────────────────── */}
      <Modal isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} title="Quick Add Task">
        <div className="space-y-4">
          <Input
            label="Title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What needs to be done?"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
          />
          <Select
            label="Scope"
            value={quickAddScope}
            onChange={(e) => setQuickAddScope(e.target.value as TaskScope)}
            options={[
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
              { value: 'quarter', label: 'This Quarter' },
              { value: 'someday', label: 'Someday' },
            ]}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowQuickAdd(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleQuickAdd}>
              Add Task
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
