import { db } from '@/lib/db/database';
import type { Category } from '@/lib/models';
import type { ICategoryRepository } from './interfaces';
import { generateId, now } from '@/lib/utils';

export class DexieCategoryRepository implements ICategoryRepository {
    async getAll(): Promise<Category[]> {
        return db.categories.toArray();
    }

    async getById(id: string): Promise<Category | undefined> {
        return db.categories.get(id);
    }

    async create(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
        const cat: Category = {
            ...data,
            id: generateId(),
            createdAt: now(),
            updatedAt: now(),
        };
        await db.categories.add(cat);
        return cat;
    }

    async update(id: string, data: Partial<Category>): Promise<void> {
        await db.categories.update(id, { ...data, updatedAt: now() });
    }

    async delete(id: string): Promise<void> {
        await db.categories.delete(id);
    }
}

export const categoryRepository = new DexieCategoryRepository();
