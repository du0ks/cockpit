import { db } from '@/lib/db/database';
import type { CalendarEvent } from '@/lib/models';
import type { ICalendarEventRepository } from './interfaces';
import { generateId, now } from '@/lib/utils';

export class DexieCalendarEventRepository implements ICalendarEventRepository {
    async getAll(): Promise<CalendarEvent[]> {
        return db.calendarEvents.orderBy('date').toArray();
    }

    async getByDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
        return db.calendarEvents
            .where('date')
            .between(startDate, endDate, true, true)
            .sortBy('date');
    }

    async getByDate(date: string): Promise<CalendarEvent[]> {
        return db.calendarEvents.where('date').equals(date).sortBy('startTime');
    }

    async getById(id: string): Promise<CalendarEvent | undefined> {
        return db.calendarEvents.get(id);
    }

    async create(data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> {
        const event: CalendarEvent = {
            ...data,
            id: generateId(),
            createdAt: now(),
            updatedAt: now(),
        };
        await db.calendarEvents.add(event);
        return event;
    }

    async update(id: string, data: Partial<CalendarEvent>): Promise<void> {
        await db.calendarEvents.update(id, { ...data, updatedAt: now() });
    }

    async delete(id: string): Promise<void> {
        await db.calendarEvents.delete(id);
    }
}

export const calendarEventRepository = new DexieCalendarEventRepository();
