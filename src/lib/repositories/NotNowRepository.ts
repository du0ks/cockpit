import { db } from '@/lib/db/database';
import type { NotNowItem } from '@/lib/models';
import type { INotNowRepository } from './interfaces';
import { generateId, now } from '@/lib/utils';

export class DexieNotNowRepository implements INotNowRepository {
    async getAll(): Promise<NotNowItem[]> {
        return db.notNowItems.orderBy('updatedAt').reverse().toArray();
    }

    async getActive(): Promise<NotNowItem[]> {
        return db.notNowItems.filter(item => !item.archived).reverse().sortBy('updatedAt');
    }

    async getArchived(): Promise<NotNowItem[]> {
        return db.notNowItems.filter(item => !!item.archived).reverse().sortBy('updatedAt');
    }

    async create(data: Omit<NotNowItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotNowItem> {
        const item: NotNowItem = {
            ...data,
            id: generateId(),
            createdAt: now(),
            updatedAt: now(),
        };
        await db.notNowItems.add(item);
        return item;
    }

    async update(id: string, data: Partial<NotNowItem>): Promise<void> {
        await db.notNowItems.update(id, { ...data, updatedAt: now() });
    }

    async delete(id: string): Promise<void> {
        await db.notNowItems.delete(id);
    }
}

export const notNowRepository = new DexieNotNowRepository();
