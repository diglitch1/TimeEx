'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
    loadGameOverSummary,
    type ActionSummaryEntry,
    type GameOverSummary,
} from '@/app/main/utils/runStats';

function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(value));
}

function StatCard({
    label,
    value,
    iconSrc,
}: {
    label: string;
    value: string;
    iconSrc: string;
}) {
    return (
        <div className="rounded-[28px] border border-[#CFE3F8] bg-white px-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
            <div className="flex min-h-[96px] items-center justify-between gap-4">
                <div className="flex flex-col justify-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3F6A91]">
                        {label}
                    </p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight text-[#0A355B]">
                        {value}
                    </p>
                </div>
                <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center self-center rounded-[22px] border border-[#DCEAF7] bg-[#F3F9FF] shadow-[0_8px_18px_rgba(95,168,245,0.12)]">
                    <Image
                        src={iconSrc}
                        alt=""
                        width={40}
                        height={40}
                        className="h-10 w-10 object-contain"
                    />
                </div>
            </div>
        </div>
    );
}

function ActionBadge({ entry }: { entry: ActionSummaryEntry }) {
    const toneClass =
        entry.direction === 'received'
            ? 'bg-emerald-100 text-emerald-700'
            : entry.direction === 'spent'
                ? 'bg-rose-100 text-rose-700'
                : 'bg-[#EAF4FF] text-[#1E6FBF]';

    return (
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${toneClass}`}>
            {entry.type}
        </span>
    );
}

export default function GameOverPage() {
    const router = useRouter();
    const [open, setOpen] = useState(true);
    const [summary] = useState<GameOverSummary | null>(() =>
        typeof window === 'undefined' ? null : loadGameOverSummary()
    );

    const statCards = useMemo(
        () =>
            summary
                ? [
                    {
                        label: 'Starting Capital',
                        value: formatCurrency(summary.startingCash),
                        iconSrc: '/images/endgame/starting_money.png',
                    },
                    {
                        label: 'Final Balance',
                        value: formatCurrency(summary.finalBalance),
                        iconSrc: '/images/endgame/final_balance.png',
                    },
                    {
                        label: 'Total Invested',
                        value: formatCurrency(summary.totalInvestedAmount),
                        iconSrc: '/images/endgame/tot_invested.png',
                    },
                    {
                        label: 'Total Spent On Events',
                        value: formatCurrency(summary.moneySpentOnEvents),
                        iconSrc: '/images/endgame/tot_spent_on_events.png',
                    },
                    {
                        label: 'Total Earned',
                        value: formatCurrency(summary.totalMoneyEarned),
                        iconSrc: '/images/endgame/total_earned.png',
                    },
                    {
                        label: 'Events Triggered',
                        value: String(summary.eventsTriggered),
                        iconSrc: '/images/endgame/events_triggered.png',
                    },
                ]
                : [],
        [summary]
    );

    const handleBackToStart = () => {
        localStorage.clear();
        router.push('/');
    };

    return (
        <main className="min-h-screen bg-[linear-gradient(180deg,#EAF4FF_0%,#F7FAFC_38%,#F8FBFF_100%)] px-6 py-10 text-[#0A355B] md:px-10 md:py-14">
            <div className="mx-auto max-w-6xl">
                <div className="rounded-[36px] border border-[#CFE3F8] bg-white/88 p-8 shadow-[0_26px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm md:p-10">
                    <div className="text-center">
                        <Image
                            src="/images/endgame/game_over_text.png"
                            alt="Game Over"
                            width={720}
                            height={260}
                            className="mx-auto h-auto w-[min(620px,88vw)]"
                            priority
                        />
                        <p className="mt-1 text-sm font-medium text-[#23496C] md:text-[15px]">
                            Congratulations! You successfully survived the dot-com bubble. Here are your final stats.
                        </p>
                        {summary ? (
                            <p className="mt-3 text-sm font-medium text-[#335B7E]">
                                Run completed on {formatDate(summary.completedAt)}
                            </p>
                        ) : null}
                    </div>

                    {!summary ? (
                        <div className="mx-auto mt-12 max-w-2xl rounded-[28px] border border-[#CFE3F8] bg-[#F7FAFC] px-6 py-8 text-center text-[#335B7E] shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
                            No run summary was found for this game.
                        </div>
                    ) : (
                        <>
                            <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {statCards.map(card => (
                                    <StatCard
                                        key={card.label}
                                        label={card.label}
                                        value={card.value}
                                        iconSrc={card.iconSrc}
                                    />
                                ))}
                            </div>

                            <div className="mt-10 rounded-[30px] border border-[#CFE3F8] bg-[#F7FAFC] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:p-7">
                                <div className="flex flex-col gap-3 border-b border-[#DCEAF7] pb-4 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3F6A91]">
                                            Actions
                                        </p>
                                        <p className="mt-1 text-xl font-semibold text-[#0A355B]">
                                            Events, investments, and money movements
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setOpen(value => !value)}
                                        className="inline-flex w-fit items-center rounded-full border border-[#CFE3F8] bg-white px-4 py-2 text-sm font-semibold text-[#1E6FBF] transition hover:bg-[#F3F9FF]"
                                    >
                                        {open ? 'Fold list' : 'Unfold list'}
                                    </button>
                                </div>

                                {open ? (
                                    <div className="mt-5 space-y-3">
                                        {summary.actionSummary.length > 0 ? (
                                            summary.actionSummary.map(entry => (
                                                <div
                                                    key={entry.id}
                                                    className="rounded-[24px] border border-[#D9E9F8] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.03)]"
                                                >
                                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-[#0A355B]">
                                                                {formatDate(entry.date)} — {entry.name}
                                                            </p>
                                                            <p className="mt-1 text-sm font-medium text-[#335B7E]">
                                                                {entry.symbol ? `${entry.symbol}` : 'Event'}
                                                                {entry.units ? ` — ${entry.units.toFixed(4)} units` : ''}
                                                            </p>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <ActionBadge entry={entry} />
                                                            <span
                                                                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                                                                    entry.direction === 'received'
                                                                        ? 'bg-emerald-50 text-emerald-700'
                                                                        : entry.direction === 'spent'
                                                                            ? 'bg-rose-50 text-rose-700'
                                                                            : 'bg-[#F3F9FF] text-[#1E6FBF]'
                                                                }`}
                                                            >
                                                                {entry.direction === 'received' ? '+' : entry.direction === 'spent' ? '-' : ''}
                                                                {formatCurrency(entry.amount)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="rounded-[24px] border border-dashed border-[#CFE3F8] bg-white px-5 py-8 text-center text-[#335B7E]">
                                                No tracked actions were recorded in this run.
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="mt-5 rounded-[24px] border border-dashed border-[#CFE3F8] bg-white px-5 py-6 text-center text-[#335B7E]">
                                        The action list is folded. Unfold it to review everything you did in the run.
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    <div className="mt-12 flex items-center justify-center">
                        <button
                            type="button"
                            onClick={handleBackToStart}
                            className="rounded-full border border-[#5FA8F5] bg-white px-8 py-3 text-sm font-semibold text-[#1E6FBF] shadow-[0_10px_24px_rgba(95,168,245,0.18)] transition hover:bg-[#F3F9FF] hover:scale-[1.02]"
                        >
                            Back To Start
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
