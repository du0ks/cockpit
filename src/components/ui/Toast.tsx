'use client';

import { cn } from '@/lib/utils';
import React, { createContext, useContext, useState, useCallback } from 'react';

interface ToastData {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface ToastContextType {
    showToast: (message: string, type?: ToastData['type']) => void;
}

const ToastContext = createContext<ToastContextType>({
    showToast: () => { },
});

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const showToast = useCallback((message: string, type: ToastData['type'] = 'success') => {
        const id = Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast container */}
            <div className="fixed bottom-20 right-4 z-[100] flex flex-col gap-2 md:bottom-4">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={cn(
                            'animate-[slideIn_0.3s_ease-out] rounded-md border px-4 py-2 font-mono text-xs shadow-lg backdrop-blur-sm',
                            toast.type === 'success' && 'border-cr-accent-dim bg-cr-accent-muted/80 text-cr-accent',
                            toast.type === 'error' && 'border-cr-danger-dim bg-cr-danger-dim/40 text-cr-danger',
                            toast.type === 'info' && 'border-cr-border bg-cr-panel/90 text-cr-text'
                        )}
                    >
                        {toast.message}
                    </div>
                ))}
            </div>
            <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
        </ToastContext.Provider>
    );
}
