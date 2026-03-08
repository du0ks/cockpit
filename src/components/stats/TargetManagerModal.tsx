'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { weeklyTargetRepository } from '@/lib/repositories/WeeklyTargetRepository';
import { EVENT_TYPES, EVENT_TYPE_OPTIONS } from '@/components/calendar/eventTypeConfig';
import type { WeeklyTarget, EventType } from '@/lib/models';

interface TargetManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export function TargetManagerModal({ isOpen, onClose, onUpdate }: TargetManagerModalProps) {
    const [targets, setTargets] = useState<WeeklyTarget[]>([]);
    const [newType, setNewType] = useState<EventType>('fitness');
    const [newCount, setNewCount] = useState(3);

    const loadTargets = async () => {
        const all = await weeklyTargetRepository.getAll();
        setTargets(all);
    };

    useEffect(() => {
        if (isOpen) loadTargets();
    }, [isOpen]);

    const handleAdd = async () => {
        // Don't add duplicate event types
        if (targets.some((t) => t.eventType === newType)) return;
        await weeklyTargetRepository.create({
            eventType: newType,
            targetCount: newCount,
        });
        loadTargets();
        onUpdate();
    };

    const handleDelete = async (id: string) => {
        await weeklyTargetRepository.delete(id);
        loadTargets();
        onUpdate();
    };

    const handleUpdateCount = async (id: string, count: number) => {
        await weeklyTargetRepository.update(id, { targetCount: count });
        loadTargets();
        onUpdate();
    };

    const usedTypes = new Set(targets.map((t) => t.eventType));
    const availableTypes = EVENT_TYPE_OPTIONS.filter((o) => !usedTypes.has(o.value as EventType));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Weekly Targets">
            <div className="space-y-4">
                <p className="font-mono text-xs text-cr-text-muted">
                    Set how many sessions per week you want to hit for each event type.
                </p>

                {/* Existing targets */}
                {targets.length > 0 && (
                    <div className="space-y-2">
                        {targets.map((t) => {
                            const config = EVENT_TYPES[t.eventType];
                            return (
                                <div
                                    key={t.id}
                                    className="flex items-center gap-3 rounded-md border px-3 py-2"
                                    style={{ borderColor: config.borderColor, backgroundColor: config.bgColor }}
                                >
                                    <span className="text-sm">{config.icon}</span>
                                    <span className="font-mono text-xs font-medium flex-1" style={{ color: config.color }}>
                                        {config.label}
                                    </span>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleUpdateCount(t.id, Math.max(1, t.targetCount - 1))}
                                            className="w-6 h-6 rounded border border-cr-border text-cr-text-secondary hover:bg-cr-panel-hover hover:text-cr-text font-mono text-xs cursor-pointer transition-colors"
                                        >
                                            −
                                        </button>
                                        <span className="font-mono text-sm font-bold text-cr-text w-4 text-center">
                                            {t.targetCount}
                                        </span>
                                        <button
                                            onClick={() => handleUpdateCount(t.id, t.targetCount + 1)}
                                            className="w-6 h-6 rounded border border-cr-border text-cr-text-secondary hover:bg-cr-panel-hover hover:text-cr-text font-mono text-xs cursor-pointer transition-colors"
                                        >
                                            +
                                        </button>
                                        <span className="font-mono text-[10px] text-cr-text-muted">/week</span>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(t.id)}
                                        className="ml-1 text-cr-text-muted hover:text-cr-danger transition-colors cursor-pointer text-sm"
                                    >
                                        ✕
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Add new target */}
                {availableTypes.length > 0 && (
                    <div className="flex items-end gap-2 pt-2 border-t border-cr-border">
                        <div className="flex-1">
                            <Select
                                label="Add Target"
                                value={newType}
                                onChange={(e) => setNewType(e.target.value as EventType)}
                                options={availableTypes}
                            />
                        </div>
                        <div className="flex items-center gap-1 pb-0.5">
                            <input
                                type="number"
                                min={1}
                                max={14}
                                value={newCount}
                                onChange={(e) => setNewCount(parseInt(e.target.value) || 1)}
                                className="w-12 rounded-md border border-cr-border bg-cr-bg px-2 py-2 text-sm text-cr-text text-center font-mono focus:border-cr-accent-dim focus:outline-none"
                            />
                            <span className="font-mono text-[10px] text-cr-text-muted">/wk</span>
                        </div>
                        <Button variant="primary" size="sm" onClick={handleAdd} className="mb-0.5">
                            Add
                        </Button>
                    </div>
                )}

                <div className="flex justify-end pt-2">
                    <Button variant="ghost" onClick={onClose}>
                        Done
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
