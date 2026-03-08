'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { ListItem } from '@/components/ui/ListItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { objectiveRepository } from '@/lib/repositories/ObjectiveRepository';
import { taskRepository } from '@/lib/repositories/TaskRepository';
import type { Objective, Task, ObjectiveScope, TaskScope } from '@/lib/models';

type PlanView = 'week' | 'month' | 'quarter';

const PLAN_TABS = [
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'quarter', label: 'Quarter' },
];

export default function PlansPage() {
    const { showToast } = useToast();
    const [view, setView] = useState<PlanView>('week');
    const [items, setItems] = useState<(Objective | Task)[]>([]);
    const [showAdd, setShowAdd] = useState(false);
    const [editItem, setEditItem] = useState<Objective | Task | null>(null);
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');

    const loadItems = useCallback(async () => {
        if (view === 'week') {
            const tasks = await taskRepository.getByScope('week');
            setItems(tasks.filter(t => t.status !== 'archived'));
        } else {
            const objs = await objectiveRepository.getByScope(view);
            setItems(objs.filter(o => o.status !== 'archived'));
        }
    }, [view]);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    const handleAdd = async () => {
        if (!title.trim()) return;
        if (view === 'week') {
            await taskRepository.create({ title: title.trim(), scope: 'week' as TaskScope, status: 'open', notes: notes || undefined });
        } else {
            await objectiveRepository.create({ title: title.trim(), scope: view as ObjectiveScope, status: 'open', notes: notes || undefined });
        }
        setTitle('');
        setNotes('');
        setShowAdd(false);
        showToast(`${view === 'week' ? 'Focus item' : 'Outcome'} added`);
        loadItems();
    };

    const handleUpdate = async () => {
        if (!editItem || !title.trim()) return;
        if (view === 'week') {
            await taskRepository.update(editItem.id, { title: title.trim(), notes: notes || undefined });
        } else {
            await objectiveRepository.update(editItem.id, { title: title.trim(), notes: notes || undefined });
        }
        setEditItem(null);
        setTitle('');
        setNotes('');
        showToast('Updated');
        loadItems();
    };

    const toggleItem = async (item: Objective | Task) => {
        const newStatus = item.status === 'done' ? 'open' : 'done';
        if (view === 'week') {
            await taskRepository.update(item.id, { status: newStatus });
        } else {
            await objectiveRepository.update(item.id, { status: newStatus });
        }
        loadItems();
    };

    const deleteItem = async (id: string) => {
        if (view === 'week') {
            await taskRepository.delete(id);
        } else {
            await objectiveRepository.delete(id);
        }
        showToast('Deleted');
        loadItems();
    };

    const openEdit = (item: Objective | Task) => {
        setEditItem(item);
        setTitle(item.title);
        setNotes(item.notes || '');
    };

    const viewLabel = view === 'week' ? 'Weekly Focus' : view === 'month' ? 'Monthly Outcomes' : 'Quarterly Outcomes';
    const recommendedCount = view === 'quarter' ? '1–2' : view === 'month' ? '1–3' : '~5';

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="font-mono text-lg font-bold text-cr-text uppercase tracking-wider">Plans</h1>
            </div>

            <Tabs tabs={PLAN_TABS} activeTab={view} onChange={(id) => setView(id as PlanView)} />

            <Panel
                title={viewLabel}
                glow
                headerAction={
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-cr-text-muted">{recommendedCount} recommended</span>
                        <Button size="sm" variant="primary" onClick={() => { setShowAdd(true); setTitle(''); setNotes(''); }}>
                            + Add
                        </Button>
                    </div>
                }
            >
                {items.length === 0 ? (
                    <EmptyState
                        icon="◈"
                        title={`No ${view} items yet`}
                        description={`Add your ${view}ly ${view === 'week' ? 'focus items' : 'outcomes'}`}
                    />
                ) : (
                    <div className="space-y-0.5">
                        {items.map((item) => (
                            <ListItem
                                key={item.id}
                                title={item.title}
                                subtitle={item.notes}
                                checked={item.status === 'done'}
                                onToggle={() => toggleItem(item)}
                                onDelete={() => deleteItem(item.id)}
                                onClick={() => openEdit(item)}
                            />
                        ))}
                    </div>
                )}
            </Panel>

            {/* Add Modal */}
            <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title={`Add ${viewLabel}`}>
                <div className="space-y-4">
                    <Input
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={view === 'week' ? 'Focus item...' : 'Outcome...'}
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAdd()}
                    />
                    <Textarea
                        label="Notes (optional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Additional notes..."
                    />
                    <div className="flex gap-2 justify-end">
                        <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleAdd}>Add</Button>
                    </div>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit">
                <div className="space-y-4">
                    <Input
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoFocus
                    />
                    <Textarea
                        label="Notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                    <div className="flex gap-2 justify-end">
                        <Button variant="ghost" onClick={() => setEditItem(null)}>Cancel</Button>
                        <Button variant="primary" onClick={handleUpdate}>Save</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
