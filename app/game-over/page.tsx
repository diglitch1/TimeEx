'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
    accent = 'blue',
}: {
    label: string;
    value: string;
    iconSrc: string;
    accent?: 'blue' | 'green' | 'red';
}) {
    const accentClasses = {
        blue: 'border-[#CFE3F8] bg-white',
        green: 'border-emerald-100 bg-[linear-gradient(180deg,#F4FFF8_0%,#FFFFFF_100%)]',
        red: 'border-rose-100 bg-[linear-gradient(180deg,#FFF7F7_0%,#FFFFFF_100%)]',
    }[accent];

    return (
        <div className={`rounded-[28px] border p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] ${accentClasses}`}>
            <div className="flex items-start justify-between gap-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3F6A91]">
                    {label}
                </p>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-[#DCEAF7] bg-[#F3F9FF] shadow-[0_8px_18px_rgba(95,168,245,0.12)]">
                    <Image
                        src={iconSrc}
                        alt=""
                        width={24}
                        height={24}
                        className="h-6 w-6 object-contain"
                    />
                </div>
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-[#0A355B]">
                {value}
            </p>
        </div>
    );
}

function ActionTone({
    entry,
}: {
    entry: ActionSummaryEntry;
}) {
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
    const [summary] = useState<GameOverSummary | null>(() =>
        typeof window === 'undefined' ? null : loadGameOverSummary()
    );

    const netResult = summary ? summary.finalBalance - summary.startingCash : 0;

    const handleBackToStart = () => {
        localStorage.clear();
        router.push('/');
    };

    return (
        <main className="min-h-screen bg-[linear-gradient(180deg,#EAF4FF_0%,#F7FAFC_36%,#F8FBFF_100%)] px-6 py-10 text-[#0A355B] md:px-10 md:py-14">
            <div className="mx-auto max-w-6xl">
                <div className="rounded-[36px] border border-[#CFE3F8] bg-white/88 p-8 shadow-[0_26px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm md:p-10">
                    <div className="text-center">
                        <p className="inline-flex items-center gap-2 rounded-full border border-[#CFE3F8] bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.34em] text-[#1E6FBF]">
                            <span className="h-2 w-2 rounded-full bg-[#5FA8F5]" />
                            TimeEx Summary
                        </p>
                        <h1 className="mt-6 text-5xl font-black uppercase tracking-[0.18em] text-[#0A355B] md:text-7xl">
                            Game Over
                        </h1>
                        <p className="mt-4 text-base font-medium text-[#23496C]">
                            Your journey has ended.
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
                                <StatCard
                                    label="Final Balance"
                                    value={formatCurrency(summary.finalBalance)}
                                    iconSrc="/images/end-page/finalbalance.png"
                                    accent={netResult >= 0 ? 'green' : 'red'}
                                />
                                <StatCard
                                    label="Net Result"
                                    value={formatCurrency(netResult)}
                                    iconSrc="/images/end-page/netamount.png"
                                    accent={netResult >= 0 ? 'green' : 'red'}
                                />
                                <StatCard
                                    label="Starting Cash"
                                    value={formatCurrency(summary.startingCash)}
                                    iconSrc="/images/end-page/startingcash.png"
                                />
                                <StatCard
                                    label="Total Money Earned"
                                    value={formatCurrency(summary.totalMoneyEarned)}
                                    iconSrc="/images/end-page/moneyearned.png"
                                    accent="green"
                                />
                                <StatCard
                                    label="Total Money Spent"
                                    value={formatCurrency(summary.totalMoneySpent)}
                                    iconSrc="/images/end-page/spendmoney.png"
                                    accent="red"
                                />
                                <StatCard
                                    label="Money Spent On Events"
                                    value={formatCurrency(summary.moneySpentOnEvents)}
                                    iconSrc="/images/end-page/spentonevents.png"
                                    accent="red"
                                />
                                <StatCard
                                    label="Investments Made"
                                    value={String(summary.investmentCount)}
                                    iconSrc="/images/end-page/moneyspentoninvest.png"
                                />
                                <StatCard
                                    label="Total Invested Amount"
                                    value={formatCurrency(summary.totalInvestedAmount)}
                                    iconSrc="/images/end-page/investmenttotal.png"
                                />
                                <StatCard
                                    label="Events Triggered"
                                    value={String(summary.eventsTriggered)}
                                    iconSrc="/images/end-page/enentstriggered.png"
                                />
                            </div>

                            <div className="mt-10 rounded-[30px] border border-[#CFE3F8] bg-[#F7FAFC] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:p-7">
                                <div className="flex flex-col gap-2 border-b border-[#DCEAF7] pb-4 md:flex-row md:items-end md:justify-between">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3F6A91]">
                                            Actions Summary
                                        </p>
                                        <p className="mt-1 text-xl font-semibold text-[#0A355B]">
                                            Every major move from this run
                                        </p>
                                    </div>
                                    <p className="text-sm font-medium text-[#335B7E]">
                                        Buys, sells, and tracked event outcomes
                                    </p>
                                </div>

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
                                                            {entry.symbol ? `${entry.type} — ${entry.symbol}` : entry.type}
                                                            {entry.units ? ` — ${entry.units.toFixed(4)} units` : ''}
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <ActionTone entry={entry} />
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
