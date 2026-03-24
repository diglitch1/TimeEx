'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import type { GameNotification } from '../utils/notifications';

type Props = {
    notifications: GameNotification[];
    activeToastIds: string[];
    historyOpen: boolean;
    onSetHistoryOpen: (open: boolean) => void;
    onDismissToast: (id: string) => void;
};

const TONE_STYLES = {
    gain: {
        accent: 'border-l-4 border-emerald-500',
        badge: 'bg-emerald-100 text-emerald-700',
        dot: 'bg-emerald-500',
        label: 'Gain',
    },
    loss: {
        accent: 'border-l-4 border-red-500',
        badge: 'bg-red-100 text-red-700',
        dot: 'bg-red-500',
        label: 'Loss',
    },
    info: {
        accent: 'border-l-4 border-blue-500',
        badge: 'bg-blue-100 text-blue-700',
        dot: 'bg-blue-500',
        label: 'Info',
    },
} as const;

const TOAST_VISIBLE_MS = 3000;
const TOAST_FADE_MS = 180;

export default function NotificationCenter({
    notifications,
    activeToastIds,
    historyOpen,
    onSetHistoryOpen,
    onDismissToast,
}: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const unreadCount = useMemo(
        () => notifications.filter(notification => !notification.read).length,
        [notifications]
    );

    const activeToasts = useMemo(
        () =>
            activeToastIds
                .map(id => notifications.find(notification => notification.id === id) ?? null)
                .filter((notification): notification is GameNotification => notification !== null),
        [activeToastIds, notifications]
    );

    useEffect(() => {
        if (!historyOpen) return;

        const handlePointerDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                onSetHistoryOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, [historyOpen, onSetHistoryOpen]);

    return (
        <div ref={containerRef} className="relative">
            <div className="absolute right-[calc(100%+1rem)] top-1/2 z-30 flex w-[22rem] -translate-y-1/2 flex-col gap-3 max-lg:right-0 max-lg:top-[calc(100%+0.85rem)] max-lg:w-[min(22rem,calc(100vw-3rem))] max-lg:translate-y-0">
                {activeToasts.map(notification => (
                    <ToastCard
                        key={notification.id}
                        notification={notification}
                        onDismiss={onDismissToast}
                    />
                ))}
            </div>

            <button
                type="button"
                onClick={() => onSetHistoryOpen(!historyOpen)}
                className="relative flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:border-slate-300 hover:shadow-[0_14px_30px_rgba(15,23,42,0.12)]"
                title="Notifications"
            >
                <Image
                    src="/images/bellicon.png"
                    alt="Notifications"
                    width={80}
                    height={80}
                    className="h-10 w-10 object-contain"
                />

                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white shadow-[0_8px_18px_rgba(239,68,68,0.32)]">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {historyOpen && (
                <div className="absolute right-0 top-[calc(100%+0.9rem)] z-40 w-[24rem] rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-1 pb-3">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                Notification History
                            </p>
                            <p className="mt-1 text-lg font-semibold text-slate-950">
                                Alerts
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => onSetHistoryOpen(false)}
                            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
                        >
                            Close
                        </button>
                    </div>

                    <div className="mt-3 max-h-[24rem] space-y-3 overflow-y-auto pr-1">
                        {notifications.length === 0 ? (
                            <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                                No alerts yet.
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <HistoryItem
                                    key={notification.id}
                                    notification={notification}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function ToastCard({
    notification,
    onDismiss,
}: {
    notification: GameNotification;
    onDismiss: (id: string) => void;
}) {
    const [visible, setVisible] = useState(false);
    const dismissedRef = useRef(false);

    useEffect(() => {
        const showTimer = window.setTimeout(() => setVisible(true), 16);
        const hideTimer = window.setTimeout(
            () => setVisible(false),
            TOAST_VISIBLE_MS - TOAST_FADE_MS
        );
        const removeTimer = window.setTimeout(() => {
            if (dismissedRef.current) return;
            dismissedRef.current = true;
            onDismiss(notification.id);
        }, TOAST_VISIBLE_MS);

        return () => {
            window.clearTimeout(showTimer);
            window.clearTimeout(hideTimer);
            window.clearTimeout(removeTimer);
        };
    }, [notification.id, onDismiss]);

    const handleDismiss = () => {
        if (dismissedRef.current) return;
        dismissedRef.current = true;
        setVisible(false);
        window.setTimeout(() => onDismiss(notification.id), TOAST_FADE_MS);
    };

    const tone = TONE_STYLES[notification.tone];

    return (
        <div
            className={`pointer-events-auto rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.14)] transition duration-200 ${tone.accent} ${
                visible ? 'translate-x-0 opacity-100' : 'translate-x-3 opacity-0'
            }`}
        >
            <div className="flex items-start gap-3">
                <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${tone.dot}`} />

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate text-sm font-semibold text-slate-950">
                                    {notification.title}
                                </p>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${tone.badge}`}>
                                    {tone.label}
                                </span>
                            </div>
                            <p className="mt-1 text-sm leading-snug text-slate-600">
                                {notification.message}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleDismiss}
                            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Dismiss notification"
                        >
                            ×
                        </button>
                    </div>

                    <p className="mt-3 text-xs font-medium text-slate-400">
                        {notification.timestampLabel}
                    </p>
                </div>
            </div>
        </div>
    );
}

function HistoryItem({ notification }: { notification: GameNotification }) {
    const tone = TONE_STYLES[notification.tone];

    return (
        <div className={`rounded-[22px] border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)] ${tone.accent}`}>
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />
                    <p className="text-sm font-semibold text-slate-950">
                        {notification.title}
                    </p>
                </div>

                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${tone.badge}`}>
                    {tone.label}
                </span>
            </div>

            <p className="mt-2 text-sm leading-snug text-slate-600">
                {notification.message}
            </p>

            <p className="mt-3 text-xs font-medium text-slate-400">
                {notification.timestampLabel}
            </p>
        </div>
    );
}
