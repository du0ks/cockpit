'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { ListItem } from '@/components/ui/ListItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { SliderInput } from '@/components/ui/SliderInput';
import { Tag } from '@/components/ui/Tag';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { calmRepository } from '@/lib/repositories/CalmRepository';
import { anxietyRepository } from '@/lib/repositories/AnxietyRepository';
import type { CalmMessage, AnxietyLog } from '@/lib/models';
import { todayString, cn, formatDateShort } from '@/lib/utils';

export default function CalmPage() {
    const { showToast } = useToast();
    const [messages, setMessages] = useState<CalmMessage[]>([]);
    const [anxietyLogs, setAnxietyLogs] = useState<AnxietyLog[]>([]);
    const [emergency, setEmergency] = useState(false);
    const [emergencyIndex, setEmergencyIndex] = useState(0);
    const [showAddMsg, setShowAddMsg] = useState(false);
    const [showLogAnxiety, setShowLogAnxiety] = useState(false);
    const [msgTitle, setMsgTitle] = useState('');
    const [msgBody, setMsgBody] = useState('');
    const [msgTags, setMsgTags] = useState('');
    const [anxScore, setAnxScore] = useState(5);
    const [anxThought, setAnxThought] = useState('');
    const [anxBody, setAnxBody] = useState('');
    const [anxNotes, setAnxNotes] = useState('');

    const loadData = useCallback(async () => {
        const [msgs, logs] = await Promise.all([
            calmRepository.getAll(),
            anxietyRepository.getAll(),
        ]);
        setMessages(msgs);
        setAnxietyLogs(logs);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Emergency mode keyboard nav
    useEffect(() => {
        if (!emergency) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                setEmergencyIndex(prev => Math.min(prev + 1, messages.length - 1));
            }
            if (e.key === 'ArrowLeft') {
                setEmergencyIndex(prev => Math.max(0, prev - 1));
            }
            if (e.key === 'Escape') {
                setEmergency(false);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [emergency, messages.length]);

    const pinnedMessages = messages.filter(m => m.pinned);
    const emergencyMessages = pinnedMessages.length > 0 ? pinnedMessages : messages;

    const handleAddMessage = async () => {
        if (!msgTitle.trim() || !msgBody.trim()) return;
        await calmRepository.create({
            title: msgTitle.trim(),
            body: msgBody.trim(),
            tags: msgTags.split(',').map(t => t.trim()).filter(Boolean),
            pinned: false,
            isDefault: false,
        });
        setMsgTitle('');
        setMsgBody('');
        setMsgTags('');
        setShowAddMsg(false);
        showToast('Message added');
        loadData();
    };

    const togglePin = async (msg: CalmMessage) => {
        await calmRepository.update(msg.id, { pinned: !msg.pinned });
        loadData();
    };

    const deleteMessage = async (id: string) => {
        await calmRepository.delete(id);
        showToast('Deleted');
        loadData();
    };

    const handleLogAnxiety = async () => {
        const existing = await anxietyRepository.getByDate(todayString());
        if (existing) {
            await anxietyRepository.update(existing.id, {
                score: anxScore,
                thought: anxThought || undefined,
                body: anxBody || undefined,
                notes: anxNotes || undefined,
            });
        } else {
            await anxietyRepository.create({
                date: todayString(),
                score: anxScore,
                thought: anxThought || undefined,
                body: anxBody || undefined,
                notes: anxNotes || undefined,
            });
        }
        setShowLogAnxiety(false);
        setAnxThought('');
        setAnxBody('');
        setAnxNotes('');
        showToast('Anxiety logged');
        loadData();
    };

    const getScoreColor = (score: number) => {
        if (score <= 3) return 'text-cr-accent';
        if (score <= 6) return 'text-cr-warning';
        return 'text-cr-danger';
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="font-mono text-lg font-bold text-cr-text uppercase tracking-wider">Calm Mode</h1>
                <Button variant="primary" onClick={() => setShowAddMsg(true)}>
                    + Message
                </Button>
            </div>

            {/* Emergency Button */}
            <button
                onClick={() => { setEmergency(true); setEmergencyIndex(0); }}
                className="w-full rounded-lg border-2 border-cr-danger bg-cr-danger/10 py-6 font-mono text-xl font-bold text-cr-danger
          hover:bg-cr-danger/20 hover:shadow-[0_0_40px_rgba(207,62,62,0.2)]
          active:bg-cr-danger/30
          transition-all duration-300 cursor-pointer"
            >
                ⚠ EMERGENCY MODE
                <p className="text-xs font-normal text-cr-danger/60 mt-1">Click when anxiety spikes — breathe and read</p>
            </button>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Anxiety Score Panel */}
                <Panel title="Today's Anxiety" glow>
                    <div className="space-y-3">
                        <SliderInput
                            value={anxScore}
                            onChange={setAnxScore}
                            min={1}
                            max={10}
                        />
                        <Button variant="secondary" className="w-full" onClick={() => setShowLogAnxiety(true)}>
                            Log with Details
                        </Button>
                        <Button variant="primary" className="w-full" onClick={handleLogAnxiety}>
                            Save Quick Score
                        </Button>
                    </div>
                </Panel>

                {/* History Panel */}
                <Panel title="Anxiety History" glow>
                    {anxietyLogs.length === 0 ? (
                        <EmptyState icon="📊" title="No entries yet" />
                    ) : (
                        <div className="space-y-1 max-h-64 overflow-y-auto">
                            {anxietyLogs.slice(0, 20).map((log) => (
                                <div key={log.id} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-cr-panel-hover transition-colors">
                                    <span className="font-mono text-xs text-cr-text-secondary">
                                        {formatDateShort(new Date(log.date + 'T00:00:00'))}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className={cn('font-mono text-sm font-bold', getScoreColor(log.score || 0))}>
                                            {log.score || '—'}
                                        </span>
                                        {log.thought && <span className="text-[10px] text-cr-text-muted truncate max-w-24">💭 {log.thought}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Panel>
            </div>

            {/* Messages List */}
            <Panel title="Calm Messages" glow headerAction={
                <span className="font-mono text-[10px] text-cr-text-muted">{messages.length} messages</span>
            }>
                {messages.length === 0 ? (
                    <EmptyState icon="○" title="No calm messages" />
                ) : (
                    <div className="space-y-2">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className="rounded-md border border-cr-border p-3 hover:border-cr-border-hover transition-all duration-200"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-mono text-xs font-semibold text-cr-text">{msg.title}</h4>
                                            {msg.pinned && <Tag label="📌 pinned" size="sm" color="#3ecf5a" />}
                                        </div>
                                        <p className="text-sm text-cr-text-secondary mt-1 leading-relaxed">{msg.body}</p>
                                        {msg.tags.length > 0 && (
                                            <div className="flex gap-1 mt-2">
                                                {msg.tags.map(t => <Tag key={t} label={t} size="sm" />)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        <Button size="sm" variant="ghost" onClick={() => togglePin(msg)}>
                                            {msg.pinned ? '📌' : '📍'}
                                        </Button>
                                        {!msg.isDefault && (
                                            <Button size="sm" variant="ghost" onClick={() => deleteMessage(msg.id)}>
                                                ✕
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Panel>

            {/* ── Emergency Mode Overlay ────────────────────── */}
            {emergency && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-cr-bg/95 backdrop-blur-md">
                    <div className="absolute top-4 right-4">
                        <Button variant="ghost" onClick={() => setEmergency(false)}>
                            ✕ Close
                        </Button>
                    </div>

                    {emergencyMessages.length > 0 && (
                        <div
                            className="max-w-2xl px-6 text-center relative z-10"
                            onClick={() => setEmergencyIndex(prev => Math.min(prev + 1, emergencyMessages.length - 1))}
                        >
                            {/* Breathing Visualizer (Subtle Pulse) */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-cr-accent/5 mix-blend-screen blur-xl pointer-events-none animate-[pulse_8s_ease-in-out_infinite]" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-cr-accent/10 pointer-events-none animate-[ping_8s_ease-in-out_infinite]" />
                            
                            <p className="font-mono text-xs text-cr-text-muted mb-6">
                                {emergencyIndex + 1} / {emergencyMessages.length}
                            </p>
                            <h2 className="font-mono text-lg font-semibold text-cr-accent mb-4">
                                {emergencyMessages[emergencyIndex]?.title}
                            </h2>
                            <p className="text-xl leading-relaxed text-cr-text md:text-2xl">
                                {emergencyMessages[emergencyIndex]?.body}
                            </p>
                            <p className="mt-8 font-mono text-xs text-cr-text-muted animate-pulse">
                                Click or press → for next · Esc to close
                            </p>

                            {/* Progress dots */}
                            <div className="flex justify-center gap-2 mt-6">
                                {emergencyMessages.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={(e) => { e.stopPropagation(); setEmergencyIndex(i); }}
                                        className={cn(
                                            'h-2 w-2 rounded-full transition-all duration-300 cursor-pointer',
                                            i === emergencyIndex
                                                ? 'bg-cr-accent shadow-[0_0_8px_rgba(62,207,90,0.5)] scale-125'
                                                : 'bg-cr-border hover:bg-cr-border-hover'
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Touch / swipe hint for mobile */}
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); setEmergencyIndex(prev => Math.max(0, prev - 1)); }}
                            disabled={emergencyIndex === 0}
                        >
                            ← Prev
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); setEmergencyIndex(prev => Math.min(emergencyMessages.length - 1, prev + 1)); }}
                            disabled={emergencyIndex >= emergencyMessages.length - 1}
                        >
                            Next →
                        </Button>
                    </div>
                </div>
            )}

            {/* Add Message Modal */}
            <Modal isOpen={showAddMsg} onClose={() => setShowAddMsg(false)} title="Add Calm Message">
                <div className="space-y-4">
                    <Input label="Title" value={msgTitle} onChange={(e) => setMsgTitle(e.target.value)} placeholder="Short title..." autoFocus />
                    <Textarea label="Message" value={msgBody} onChange={(e) => setMsgBody(e.target.value)} placeholder="The calming message..." />
                    <Input label="Tags (comma-separated)" value={msgTags} onChange={(e) => setMsgTags(e.target.value)} placeholder="technique, core" />
                    <div className="flex gap-2 justify-end">
                        <Button variant="ghost" onClick={() => setShowAddMsg(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleAddMessage}>Add</Button>
                    </div>
                </div>
            </Modal>

            {/* Log Anxiety Modal */}
            <Modal isOpen={showLogAnxiety} onClose={() => setShowLogAnxiety(false)} title="Log Anxiety">
                <div className="space-y-4">
                    <SliderInput value={anxScore} onChange={setAnxScore} label="Score" min={1} max={10} />
                    <Input label="Thought" value={anxThought} onChange={(e) => setAnxThought(e.target.value)} placeholder="What's the anxious thought?" />
                    <Input label="Body Sensation" value={anxBody} onChange={(e) => setAnxBody(e.target.value)} placeholder="Where do you feel it?" />
                    <Textarea label="Notes" value={anxNotes} onChange={(e) => setAnxNotes(e.target.value)} placeholder="Additional notes..." />
                    <div className="flex gap-2 justify-end">
                        <Button variant="ghost" onClick={() => setShowLogAnxiety(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleLogAnxiety}>Save</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
