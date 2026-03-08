import { db } from '@/lib/db/database';
import type { AnxietyLog } from '@/lib/models';
import type { IAnxietyRepository } from './interfaces';
import { generateId, now } from '@/lib/utils';

export class DexieAnxietyRepository implements IAnxietyRepository {
    async getAll(): Promise<AnxietyLog[]> {
        return db.anxietyLogs.orderBy('date').reverse().toArray();
    }

    async getByDate(date: string): Promise<AnxietyLog | undefined> {
        return db.anxietyLogs.where('date').equals(date).first();
    }

    async create(data: Omit<AnxietyLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<AnxietyLog> {
        const log: AnxietyLog = {
            ...data,
            id: generateId(),
            createdAt: now(),
            updatedAt: now(),
        };
        await db.anxietyLogs.add(log);
        return log;
    }

    async update(id: string, data: Partial<AnxietyLog>): Promise<void> {
        await db.anxietyLogs.update(id, { ...data, updatedAt: now() });
    }

    async delete(id: string): Promise<void> {
        await db.anxietyLogs.delete(id);
    }
}

export const anxietyRepository = new DexieAnxietyRepository();
