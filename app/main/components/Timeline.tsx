'use client';

import { useCallback, useMemo, useState } from 'react';
import type { TimelineMarker } from '../utils/timeline';

type Props = {
    timelineDates: string[]; // sorted unique YYYY-MM-DD
    markers: TimelineMarker[]; // market + event
    currentDate: Date;
    onJumpToDate: (dateStr: string) => void;
    disabled?: boolean;
};

function fmt(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function parseDay(dateStr: string) {
    return new Date(dateStr + 'T00:00:00');
}

function monthKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

function parseMonthKey(key: string) {
    const [year, month] = key.split('-').map(Number);
    return new Date(year, month - 1, 1);
}

function addOneMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

function toLocalDateStr(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}


type Tick = {
    pct: number;
    label: string;
    kind: 'year' | 'month';
    compact?: boolean;
};

export default function TimelineBar({
    timelineDates,
    markers,
    currentDate,
    onJumpToDate,
    disabled = false,
}: Props) {
    const [hoverDate, setHoverDate] = useState<string | null>(null);

    const currentStr = useMemo(
        () => toLocalDateStr(currentDate),
        [currentDate]
    );

    const isFuture = (dateStr: string) => dateStr > currentStr;

    // group markers by date
    const grouped = useMemo(() => {
        const map = new Map<string, TimelineMarker[]>();
        for (const m of markers) {
            if (!map.has(m.date)) map.set(m.date, []);
            map.get(m.date)!.push(m);
        }
        return map;
    }, [markers]);

    const activeHover = hoverDate ?? currentStr;

    // show only market items in the hover card
    const hoverItems = (grouped.get(activeHover) ?? []).filter(m => m.kind === 'market');

    const { ticks, datePctMap } = useMemo(() => {
        if (timelineDates.length === 0) {
            return {
                ticks: [] as Tick[],
                datePctMap: new Map<string, number>(),
            };
        }

        const datesByMonth = new Map<string, string[]>();
        for (const dateStr of timelineDates) {
            const key = monthKey(parseDay(dateStr));
            if (!datesByMonth.has(key)) datesByMonth.set(key, []);
            datesByMonth.get(key)!.push(dateStr);
        }

        type MonthLayout = {
            key: string;
            year: number;
            month: number;
            dates: string[];
            hasDots: boolean;
            weight: number;
        };

        const firstMonth = parseMonthKey(monthKey(parseDay(timelineDates[0])));
        const lastMonth = parseMonthKey(monthKey(parseDay(timelineDates[timelineDates.length - 1])));

        const months: MonthLayout[] = [];
        for (let cursor = new Date(firstMonth); cursor <= lastMonth; cursor = addOneMonth(cursor)) {
            const key = monthKey(cursor);
            const dates = datesByMonth.get(key) ?? [];
            const hasDots = dates.length > 0;
            const weight = hasDots
                ? 2.9 + Math.max(0, dates.length - 1) * 1.6
                : 0.7;

            months.push({
                key,
                year: cursor.getFullYear(),
                month: cursor.getMonth(),
                dates,
                hasDots,
                weight,
            });
        }

        const totalWeight = Math.max(
            months.reduce((sum, month) => sum + month.weight, 0),
            1
        );

        let consumedWeight = 0;
        const laidOutMonths = months.map(month => {
            const startPct = (consumedWeight / totalWeight) * 100;
            consumedWeight += month.weight;
            const endPct = (consumedWeight / totalWeight) * 100;

            return {
                ...month,
                startPct,
                endPct,
                centerPct: (startPct + endPct) / 2,
            };
        });

        const nextDatePctMap = new Map<string, number>();

        for (const month of laidOutMonths) {
            const sortedDates = [...month.dates].sort();
            const count = sortedDates.length;

            sortedDates.forEach((dateStr, index) => {
                const localFraction =
                    count === 1
                        ? 0.5
                        : 0.22 + (index / (count - 1)) * 0.56;
                const pct =
                    month.startPct + ((month.endPct - month.startPct) * localFraction);

                nextDatePctMap.set(dateStr, pct);
            });
        }

        const yearGroups = new Map<number, typeof laidOutMonths>();
        for (const month of laidOutMonths) {
            const group = yearGroups.get(month.year) ?? [];
            group.push(month);
            yearGroups.set(month.year, group);
        }

        const yearTicks: Tick[] = Array.from(yearGroups.entries()).map(([year, monthsInYear]) => ({
            kind: 'year',
            label: String(year),
            pct: (monthsInYear[0].startPct + monthsInYear[monthsInYear.length - 1].endPct) / 2,
        }));

        const monthTicks: Tick[] = laidOutMonths
            .filter(month => month.month % 3 === 0)
            .map(month => ({
                kind: 'month',
                label: new Date(month.year, month.month, 1).toLocaleDateString('en-US', { month: 'short' }),
                pct: month.centerPct,
                compact: !month.hasDots,
            }));

        return {
            ticks: [...yearTicks, ...monthTicks],
            datePctMap: nextDatePctMap,
        };
    }, [timelineDates]);

    const pctForDate = useCallback(
        (dateStr: string) => datePctMap.get(dateStr) ?? 0,
        [datePctMap]
    );

    const currentPct = pctForDate(currentStr);

    return (
        <div className="w-full">
            {/* outer padding / size controls */}
            <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm text-gray-500 leading-none">Timeline</p>

                    </div>


                </div>

                {/* Track */}
                <div className="mt-4">
                    {/* Increase overall "length" by giving more horizontal breathing room */}
                    <div className="relative px-6">
                        {/* Taller because we have year + month rows */}
                        <div className="relative h-20">
                            {/* YEAR ROW (independent axis) */}
                            <div className="absolute left-0 right-0 top-0 h-7">
                                {ticks
                                    .filter(t => t.kind === 'year')
                                    .map(t => {
                                        const left = `${clamp(t.pct, 0, 100)}%`;
                                        return (
                                            <div
                                                key={`year-${t.label}-${t.pct}`}
                                                className="absolute -translate-x-1/2"
                                                style={{ left }}
                                            >
                                                <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-900">
                            {t.label}
                          </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>

                            {/* MONTH ROW (independent axis) */}
                            <div className="absolute left-0 right-0 top-7 h-5">
                                {ticks
                                    .filter(t => t.kind === 'month')
                                    .map(t => {
                                        const left = `${clamp(t.pct, 0, 100)}%`;
                                        return (
                                            <div
                                                key={`month-${t.label}-${t.pct}`}
                                                className="absolute -translate-x-1/2"
                                                style={{ left }}
                                            >
                        <span className={t.compact
                            ? 'text-[10px] font-medium text-gray-400'
                            : 'text-[11px] font-medium text-gray-700'
                        }>
                          {t.label}
                        </span>
                                            </div>
                                        );
                                    })}
                            </div>

                            {/* LINE (starts before first dot & ends after last dot because axis is bigger) */}
                            <div className="absolute left-0 right-0 top-[62px] -translate-y-1/2 h-[6px] rounded-full bg-gray-200" />

                            {/* PROGRESS LINE */}
                            <div
                                className="absolute left-0 top-[62px] -translate-y-1/2 h-[6px] rounded-full bg-blue-600 transition-all duration-500"
                                style={{ width: `${currentPct}%` }}
                            />

                            {/* DOTS (positioned by real time proportion, not justify-between) */}
                            {timelineDates.map(dateStr => {
                                const pct = pctForDate(dateStr);
                                const isCurrent = dateStr === currentStr;
                                const future = isFuture(dateStr);

                                const hasEvent = (grouped.get(dateStr) ?? []).some(m => m.kind === 'event');
                                const hasMarket = (grouped.get(dateStr) ?? []).some(m => m.kind === 'market');

                                const base = 'h-3 w-3 rounded-full border transition-transform duration-200';
                                const dotColor = isCurrent
                                    ? 'bg-blue-700 border-blue-700'
                                    : hasEvent
                                        ? 'bg-blue-100 border-blue-700'
                                        : hasMarket
                                            ? 'bg-slate-100 border-slate-600'
                                            : 'bg-white border-gray-400';

                                return (
                                    <button
                                        key={dateStr}
                                        type="button"
                                        disabled={future || disabled}
                                        onMouseEnter={() => {
                                            if (!future && !disabled) setHoverDate(dateStr);
                                        }}
                                        onMouseLeave={() => setHoverDate(null)}
                                        onClick={() => {
                                            if (!future && !disabled) onJumpToDate(dateStr);
                                        }}
                                        className={`absolute top-[62px] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center ${
                                            future || disabled ? 'cursor-not-allowed opacity-60' : ''
                                        }`}
                                        style={{ left: `${pct}%` }}
                                        title={future ? 'Future date' : fmt(dateStr)}
                                    >
                                        {isCurrent && (
                                            <span className="absolute inline-flex h-6 w-6 rounded-full bg-blue-700/20 animate-ping" />
                                        )}

                                        <span className={`${base} ${dotColor} ${isCurrent ? 'scale-125' : 'hover:scale-110'}`} />

                                        <span
                                            className="absolute whitespace-nowrap text-[10px] font-medium text-gray-900"
                                            style={{
                                                top: '24px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                            }}
                                        >
                                            {new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                                        </span>

                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Hover card */}
                    <div className="mt-14 rounded-[20px] border border-gray-200 bg-gray-50/80 px-4 py-3">
                        <p className="text-xs font-medium text-gray-500 mb-2">
                            {hoverDate ? 'Market context' : "Today's market context"}
                        </p>

                        {hoverItems.length === 0 ? (
                            <p className="text-sm text-gray-600">
                                No notable market movement on this date.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {hoverItems.map((m, idx) => (
                                    <div
                                        key={`${m.date}-${m.kind}-${idx}`}
                                        className="flex items-start gap-3"
                                    >
                                        {/* subtle indicator */}
                                        <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-600 shrink-0" />

                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {m.title}
                                            </p>
                                            {m.subtitle && (
                                                <p className="text-xs text-gray-600">
                                                    {m.subtitle}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                <style jsx global>{`
                    @keyframes ping {
                        0% { transform: scale(0.9); opacity: 0.9; }
                        70% { transform: scale(1.5); opacity: 0.1; }
                        100% { transform: scale(1.6); opacity: 0; }
                    }
                    .animate-ping {
                        animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;
                    }
                `}</style>
            </div>
        </div>
    );
}
