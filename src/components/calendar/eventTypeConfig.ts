import type { EventType } from '@/lib/models';

export interface EventTypeConfig {
    label: string;
    icon: string;
    color: string;
    bgColor: string;
    borderColor: string;
}

export const EVENT_TYPES: Record<EventType, EventTypeConfig> = {
    fitness: {
        label: 'Fitness',
        icon: '🏋️',
        color: '#3ecf5a',
        bgColor: 'rgba(62, 207, 90, 0.15)',
        borderColor: 'rgba(62, 207, 90, 0.4)',
    },
    work: {
        label: 'Work',
        icon: '💼',
        color: '#5b9bd5',
        bgColor: 'rgba(91, 155, 213, 0.15)',
        borderColor: 'rgba(91, 155, 213, 0.4)',
    },
    social: {
        label: 'Social',
        icon: '🎉',
        color: '#e88c30',
        bgColor: 'rgba(232, 140, 48, 0.15)',
        borderColor: 'rgba(232, 140, 48, 0.4)',
    },
    personal: {
        label: 'Personal',
        icon: '🧘',
        color: '#c77dba',
        bgColor: 'rgba(199, 125, 186, 0.15)',
        borderColor: 'rgba(199, 125, 186, 0.4)',
    },
    other: {
        label: 'Other',
        icon: '📌',
        color: '#8aaa8e',
        bgColor: 'rgba(138, 170, 142, 0.15)',
        borderColor: 'rgba(138, 170, 142, 0.4)',
    },
};

export const EVENT_TYPE_OPTIONS = Object.entries(EVENT_TYPES).map(([value, config]) => ({
    value,
    label: `${config.icon} ${config.label}`,
}));
