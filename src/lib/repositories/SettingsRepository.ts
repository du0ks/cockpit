import { db } from '@/lib/db/database';
import type { UserSettings } from '@/lib/models';
import type { ISettingsRepository } from './interfaces';
import { now } from '@/lib/utils';

export class DexieSettingsRepository implements ISettingsRepository {
    async get(): Promise<UserSettings> {
        const settings = await db.settings.get('default');
        if (!settings) {
            return {
                id: 'default',
                reduceMotion: false,
                scanlineLevel: 0,
                currentFocus: '',
                updatedAt: now(),
            };
        }
        return settings;
    }

    async update(data: Partial<UserSettings>): Promise<void> {
        await db.settings.update('default', { ...data, updatedAt: now() });
    }
}

export const settingsRepository = new DexieSettingsRepository();
