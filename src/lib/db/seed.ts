import { db } from './database';
import { generateId, now } from '@/lib/utils';
import type { CalmMessage, UserSettings, Category } from '@/lib/models';

const SEED_CALM_MESSAGES: Omit<CalmMessage, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
        title: 'The Real Fear',
        body: 'You are not afraid of cancer. You are afraid of losing control over your life trajectory. Health anxiety is symbolic: "If my body fails, everything collapses." Your ambitions are big, so your fear target is big.',
        tags: ['health', 'control', 'core'],
        pinned: true,
        isDefault: true,
    },
    {
        title: 'Threat Relocation',
        body: 'Your brain is relocating threat. When one fear calms down, it searches for another target. That\'s the loop. Not evidence.',
        tags: ['pattern', 'loop'],
        pinned: false,
        isDefault: true,
    },
    {
        title: 'Don\'t Solve the Thought',
        body: 'Do not solve the thought. Label it and move on. Arguing feeds it.',
        tags: ['technique', 'core'],
        pinned: true,
        isDefault: true,
    },
    {
        title: 'Idle Time Pattern',
        body: 'If anxiety rises after you return to the dorm, idle time re-opens old threat files. Predictable pattern.',
        tags: ['pattern', 'environment'],
        pinned: false,
        isDefault: true,
    },
    {
        title: 'Zero Uncertainty',
        body: 'Zero uncertainty about health is impossible. Forcing probability to 0 creates panic.',
        tags: ['acceptance', 'core'],
        pinned: false,
        isDefault: true,
    },
];

const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { name: 'Work', icon: '💻', colorHint: '#3ecf5a' },
    { name: 'Personal', icon: '🏠', colorHint: '#5aa3cf' },
    { name: 'Health', icon: '🏃', colorHint: '#cf5a5a' },
    { name: 'Learning', icon: '📚', colorHint: '#cfa63e' },
    { name: 'Finance', icon: '💰', colorHint: '#a35acf' },
];

export async function seedDatabase(): Promise<void> {
    const settingsCount = await db.settings.count();
    if (settingsCount > 0) return; // Already seeded

    const timestamp = now();

    const defaultSettings: UserSettings = {
        id: 'default',
        reduceMotion: false,
        scanlineLevel: 0,
        currentFocus: '',
        updatedAt: timestamp,
    };

    const calmMessages: CalmMessage[] = SEED_CALM_MESSAGES.map((msg) => ({
        ...msg,
        id: generateId(),
        createdAt: timestamp,
        updatedAt: timestamp,
    }));

    const categories: Category[] = DEFAULT_CATEGORIES.map((cat) => ({
        ...cat,
        id: generateId(),
        createdAt: timestamp,
        updatedAt: timestamp,
    }));

    await db.transaction('rw', [db.settings, db.calmMessages, db.categories], async () => {
        await db.settings.add(defaultSettings);
        await db.calmMessages.bulkAdd(calmMessages);
        await db.categories.bulkAdd(categories);
    });
}
