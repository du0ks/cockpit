import { db } from '@/lib/db/database';
import type { WeeklyTarget } from '@/lib/models';
import type { IWeeklyTargetRepository } from './interfaces';
import { generateId, now } from '@/lib/utils';

export class DexieWeeklyTargetRepository implements IWeeklyTargetRepository {
    async getAll(): Promise<WeeklyTarget[]> {
        return db.weeklyTargets.toArray();
    }

    async getById(id: string): Promise<WeeklyTarget | undefined> {
        return db.weeklyTargets.get(id);
    }

    async create(data: Omit<WeeklyTarget, 'id' | 'createdAt' | 'updatedAt'>): Promise<WeeklyTarget> {
        const target: WeeklyTarget = {
            ...data,
            id: generateId(),
            createdAt: now(),
            updatedAt: now(),
        };
        await db.weeklyTargets.add(target);
        return target;
    }

    async update(id: string, data: Partial<WeeklyTarget>): Promise<void> {
        await db.weeklyTargets.update(id, { ...data, updatedAt: now() });
    }

    async delete(id: string): Promise<void> {
        await db.weeklyTargets.delete(id);
    }
}

export const weeklyTargetRepository = new DexieWeeklyTargetRepository();
