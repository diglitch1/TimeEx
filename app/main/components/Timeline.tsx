'use client';

import { useMemo, useState } from 'react';
import type { TimelineMarker } from '../utils/timeline';

type Props = {
    timelineDates: string[]; // sorted unique YYYY-MM-DD
    markers: TimelineMarker[]; // market + event
    currentDate: Date;
    onJumpToDate: (dateStr: string) => void;
};

function fmt(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function parseDay(dateStr: string) {
    return new Date(dateStr + 'T00:00:00');
}

function startOfYear(year: number) {
    return new Date(Date.UTC(year, 0, 1, 0, 0, 0));
}

function endOfYear(year: number) {
    return new Date(Date.UTC(year, 11, 31, 23, 59, 59));
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


type Tick = { at: number; label: string; kind: 'year' | 'month' };

export default function TimelineBar({ timelineDates, markers, currentDate, onJumpToDate }: Props) {
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

    // --- Axis range (independent from dots) ---
    const { axisStart, axisEnd, ticks } = useMemo(() => {
        if (timelineDates.length === 0) {
            const now = new Date();
            const y = now.getFullYear();
            return {
                axisStart: startOfYear(y),
                axisEnd: endOfYear(y),
                ticks: [] as Tick[],
            };
        }

        const first = parseDay(timelineDates[0]);
        const last = parseDay(timelineDates[timelineDates.length - 1]);

        const y0 = first.getUTCFullYear();
        const y1 = last.getUTCFullYear();

        const start = startOfYear(y0);
        const end = endOfYear(y1);

        // Build independent calendar ticks:
        // Years: every Jan 1
        // Months: Jan/Apr/Jul/Oct (quarterly) so it stays readable
        const out: Tick[] = [];

        for (let y = y0; y <= y1; y++) {
            const yAt = startOfYear(y).getTime();
            out.push({ at: yAt, label: String(y), kind: 'year' });

            const quarterMonths = [0, 3, 6, 9]; // Jan, Apr, Jul, Oct
            for (const m of quarterMonths) {
                const d = new Date(Date.UTC(y, m, 1, 0, 0, 0));
                const label = d.toLocaleDateString('en-US', { month: 'short' });
                out.push({ at: d.getTime(), label, kind: 'month' });
            }
        }

        return { axisStart: start, axisEnd: end, ticks: out };
    }, [timelineDates]);

    const axisStartMs = axisStart.getTime();
    const axisEndMs = axisEnd.getTime();
    const axisSpan = Math.max(1, axisEndMs - axisStartMs);

    // Convert any dateStr to percentage along axis
    const pctForDate = (dateStr: string) => {
        const ms = parseDay(dateStr).getTime();
        const raw = ((ms - axisStartMs) / axisSpan) * 100;
        return clamp(raw, 0, 100);
    };

    const currentPct = pctForDate(currentStr);

    // This is ONLY for display: "Position X / N"
    const currentIndex = Math.max(0, timelineDates.indexOf(currentStr));
// --- label collision handling (labels only, dots untouched) ---
    const LABEL_MIN_GAP_PCT = 3; // how close labels can be before stacking
    const LABEL_LINE_HEIGHT = 17; // px per stacked level

    type LabelLayout = {
        offsetY: number;
        showLine: boolean;
    };

    const labelLayouts = useMemo(() => {
        const layouts = new Map<string, LabelLayout>();
        let lastPct: number | null = null;
        let stackLevel = 0;

        for (const dateStr of timelineDates) {
            const pct = pctForDate(dateStr);

            if (lastPct !== null && Math.abs(pct - lastPct) < LABEL_MIN_GAP_PCT) {
                stackLevel += 1;
            } else {
                stackLevel = 0;
            }

            layouts.set(dateStr, {
                offsetY: stackLevel * LABEL_LINE_HEIGHT,
                showLine: stackLevel > 0,
            });

            lastPct = pct;
        }

        return layouts;
    }, [timelineDates, pctForDate]);

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
                                        const pct = ((t.at - axisStartMs) / axisSpan) * 100;
                                        const left = `${clamp(pct, 0, 100)}%`;
                                        return (
                                            <div
                                                key={`year-${t.label}-${t.at}`}
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
                                        const pct = ((t.at - axisStartMs) / axisSpan) * 100;
                                        const left = `${clamp(pct, 0, 100)}%`;
                                        return (
                                            <div
                                                key={`month-${t.label}-${t.at}`}
                                                className="absolute -translate-x-1/2"
                                                style={{ left }}
                                            >
                        <span className="text-[11px] font-medium text-gray-700">
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
                                        disabled={future}
                                        onMouseEnter={() => {
                                            if (!future) setHoverDate(dateStr);
                                        }}
                                        onMouseLeave={() => setHoverDate(null)}
                                        onClick={() => {
                                            if (!future) onJumpToDate(dateStr);
                                        }}
                                        className={`absolute top-[62px] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center ${
                                            future ? 'cursor-not-allowed opacity-60' : ''
                                        }`}
                                        style={{ left: `${pct}%` }}
                                        title={future ? 'Future date' : fmt(dateStr)}
                                    >
                                        {isCurrent && (
                                            <span className="absolute inline-flex h-6 w-6 rounded-full bg-blue-700/20 animate-ping" />
                                        )}

                                        <span className={`${base} ${dotColor} ${isCurrent ? 'scale-125' : 'hover:scale-110'}`} />

                                        {/* Date label (collision-aware) */}
                                        {(() => {
                                            const layout = labelLayouts.get(dateStr)!;
                                            const labelTop = 24 + layout.offsetY;

                                            return (
                                                <>
                                                    {layout.showLine && (
                                                        <span
                                                            className="absolute w-px bg-gray-300"
                                                            style={{
                                                                top: '12px',
                                                                height: `${labelTop - 12}px`,
                                                            }}
                                                        />
                                                    )}

                                                    <span
                                                        className="absolute text-[11px] font-medium text-gray-900 whitespace-nowrap"
                                                        style={{ top: `${labelTop}px` }}
                                                    >
                {new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
            </span>
                                                </>
                                            );
                                        })()}

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
