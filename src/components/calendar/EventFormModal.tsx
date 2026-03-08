'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EVENT_TYPE_OPTIONS } from './eventTypeConfig';
import type { CalendarEvent, EventType } from '@/lib/models';

interface EventFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onDelete?: () => void;
    initialData?: CalendarEvent;
    defaultDate?: string;
}

export function EventFormModal({
    isOpen,
    onClose,
    onSave,
    onDelete,
    initialData,
    defaultDate,
}: EventFormModalProps) {
    const [title, setTitle] = useState('');
    const [eventType, setEventType] = useState<EventType>('fitness');
    const [customType, setCustomType] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setEventType(initialData.eventType);
            setCustomType(initialData.customType || '');
            setDate(initialData.date);
            setStartTime(initialData.startTime);
            setEndTime(initialData.endTime);
            setLocation(initialData.location || '');
            setNotes(initialData.notes || '');
        } else {
            setTitle('');
            setEventType('fitness');
            setCustomType('');
            setDate(defaultDate || new Date().toISOString().split('T')[0]);
            setStartTime('09:00');
            setEndTime('10:00');
            setLocation('');
            setNotes('');
        }
    }, [initialData, defaultDate, isOpen]);

    const handleSubmit = () => {
        if (!title.trim() || !date) return;
        onSave({
            title: title.trim(),
            eventType,
            customType: eventType === 'other' ? customType.trim() : undefined,
            date,
            startTime,
            endTime,
            location: location.trim() || undefined,
            notes: notes.trim() || undefined,
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Event' : 'New Event'}>
            <div className="space-y-4">
                <Input
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Morning Gym Session"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />

                <Select
                    label="Event Type"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as EventType)}
                    options={EVENT_TYPE_OPTIONS}
                />

                {eventType === 'other' && (
                    <Input
                        label="Custom Type Name"
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value)}
                        placeholder="e.g. Hobby, Study..."
                    />
                )}

                <Input
                    label="Date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />

                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="Start Time"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                    />
                    <Input
                        label="End Time"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                    />
                </div>

                <Input
                    label="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Downtown Gym"
                />

                <Textarea
                    label="Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes..."
                />

                <div className="flex gap-2 justify-between pt-2">
                    <div>
                        {onDelete && (
                            <Button variant="danger" size="sm" onClick={onDelete}>
                                Delete
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSubmit}>
                            {initialData ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
