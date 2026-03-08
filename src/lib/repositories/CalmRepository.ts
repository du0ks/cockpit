import { db } from '@/lib/db/database';
import type { CalmMessage } from '@/lib/models';
import type { ICalmRepository } from './interfaces';
import { generateId, now } from '@/lib/utils';

export class DexieCalmRepository implements ICalmRepository {
    async getAll(): Promise<CalmMessage[]> {
        return db.calmMessages.orderBy('updatedAt').reverse().toArray();
    }

    async getPinned(): Promise<CalmMessage[]> {
        return db.calmMessages.where('pinned').equals(1).toArray();
    }

    async create(data: Omit<CalmMessage, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalmMessage> {
        const msg: CalmMessage = {
            ...data,
            id: generateId(),
            createdAt: now(),
            updatedAt: now(),
        };
        await db.calmMessages.add(msg);
        return msg;
    }

    async update(id: string, data: Partial<CalmMessage>): Promise<void> {
        await db.calmMessages.update(id, { ...data, updatedAt: now() });
    }

    async delete(id: string): Promise<void> {
        await db.calmMessages.delete(id);
    }
}

export const calmRepository = new DexieCalmRepository();
