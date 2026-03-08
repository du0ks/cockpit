'use client';

import { AppShell } from '@/components/layout/AppShell';

export function ClientLayout({ children }: { children: React.ReactNode }) {
    return <AppShell>{children}</AppShell>;
}
