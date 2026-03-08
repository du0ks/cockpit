'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { ListItem } from '@/components/ui/ListItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tag } from '@/components/ui/Tag';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { taskRepository } from '@/lib/repositories/TaskRepository';
import { categoryRepository } from '@/lib/repositories/CategoryRepository';
import type { Task, Category, TaskScope } from '@/lib/models';

const SCOPE_TABS = [
    { id: 'all', label: 'All' },
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'quarter', label: 'Quarter' },
    { id: 'someday', label: 'Someday' },
];

const SCOPE_OPTIONS = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'someday', label: 'Someday' },
];

export default function ActionsPage() {
    const { showToast } = useToast();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [scopeFilter, setScopeFilter] = useState('all');
    const [showCapture, setShowCapture] = useState(false);
    const [title, setTitle] = useState('');
    const [scope, setScope] = useState<TaskScope>('today');
    const [categoryId, setCategoryId] = useState('');

    const loadData = useCallback(async () => {
        const [allTasks, cats] = await Promise.all([
            scopeFilter === 'all'
                ? taskRepository.getByStatus('open')
                : taskRepository.getByScope(scopeFilter as TaskScope),
            categoryRepository.getAll(),
        ]);
        setTasks(scopeFilter === 'all' ? allTasks : allTasks.filter(t => t.status === 'open'));
        setCategories(cats);
    }, [scopeFilter]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        const handler = () => setShowCapture(true);
        window.addEventListener('cr:new-task', handler);
        return () => window.removeEventListener('cr:new-task', handler);
    }, []);

    const handleCapture = async () => {
        if (!title.trim()) return;
        await taskRepository.create({
            title: title.trim(),
            scope,
            status: 'open',
            categoryId: categoryId || undefined,
        });
        setTitle('');
        setScope('today');
        setCategoryId('');
        setShowCapture(false);
        showToast('Task captured');
        loadData();
    };

    const toggleTask = async (task: Task) => {
        await taskRepository.update(task.id, { status: task.status === 'done' ? 'open' : 'done' });
        loadData();
    };

    const deleteTask = async (id: string) => {
        await taskRepository.delete(id);
        showToast('Deleted');
        loadData();
    };

    const getCategoryName = (catId?: string) => {
        if (!catId) return undefined;
        const cat = categories.find(c => c.id === catId);
        return cat ? `${cat.icon} ${cat.name}` : undefined;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="font-mono text-lg font-bold text-cr-text uppercase tracking-wider">Actions</h1>
                <Button variant="primary" onClick={() => setShowCapture(true)}>
                    ⚡ Quick Capture
                </Button>
            </div>

            {/* Quick Capture (inline mini form) */}
            <Panel className="!p-3">
                <div className="flex items-center gap-2">
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Quick capture — type and press Enter"
                        className="flex-1 bg-transparent text-sm text-cr-text placeholder:text-cr-text-muted/50 outline-none"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && title.trim()) {
                                taskRepository.create({ title: title.trim(), scope: 'today', status: 'open' }).then(() => {
                                    setTitle('');
                                    showToast('Task added to today');
                                    loadData();
                                });
                            }
                        }}
                    />
                    <Tag label="today" active size="sm" />
                </div>
            </Panel>

            {/* Scope Filter */}
            <Tabs tabs={SCOPE_TABS} activeTab={scopeFilter} onChange={setScopeFilter} />

            {/* Task List */}
            <Panel title="Daily Execution" glow>
                {tasks.length === 0 ? (
                    <EmptyState
                        icon="▹"
                        title={scopeFilter === 'all' ? 'No open tasks' : `No ${scopeFilter} tasks`}
                        description="Use Quick Capture above to add tasks"
                    />
                ) : (
                    <div className="space-y-0.5">
                        {tasks.map((task) => (
                            <ListItem
                                key={task.id}
                                title={task.title}
                                subtitle={getCategoryName(task.categoryId)}
                                checked={task.status === 'done'}
                                onToggle={() => toggleTask(task)}
                                onDelete={() => deleteTask(task.id)}
                                trailing={
                                    scopeFilter === 'all' ? (
                                        <Tag label={task.scope} size="sm" />
                                    ) : undefined
                                }
                            />
                        ))}
                    </div>
                )}
            </Panel>

            {/* Full Capture Modal */}
            <Modal isOpen={showCapture} onClose={() => setShowCapture(false)} title="Quick Capture">
                <div className="space-y-4">
                    <Input
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="What needs to be done?"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleCapture()}
                    />
                    <Select
                        label="Scope"
                        value={scope}
                        onChange={(e) => setScope(e.target.value as TaskScope)}
                        options={SCOPE_OPTIONS}
                    />
                    <Select
                        label="Category (optional)"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        options={[{ value: '', label: 'None' }, ...categories.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` }))]}
                    />
                    <div className="flex gap-2 justify-end">
                        <Button variant="ghost" onClick={() => setShowCapture(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleCapture}>Capture</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
