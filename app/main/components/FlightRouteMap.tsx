'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

type RouteKind = 'long-haul' | 'short-haul';

type RouteStop = {
    city: string;
    date: string;
    x: number;
    y: number;
};

type Props = {
    route: RouteKind;
    currentDate: Date;
    locked?: boolean;
    lockedDate?: string;
};

// Manually adjust route point positions here.
// x and y are percentages of the map image: x=0 is left, x=100 is right, y=0 is top, y=100 is bottom.
const LONG_HAUL_STOPS: RouteStop[] = [
    { city: 'Frankfurt', date: '2020-02-19', x: 48.4, y: 35.8 },
    { city: 'Seoul', date: '2020-03-11', x: 79.2, y: 41.8 },
    { city: 'Tokyo', date: '2020-03-27', x: 82.3, y: 40.6 },
    { city: 'Sydney', date: '2020-04-20', x: 84.2, y: 82.2 },
    { city: 'Singapore', date: '2020-05-15', x: 73.7, y: 65.3 },
    { city: 'Bangkok', date: '2020-06-08', x: 70.4, y: 60.1 },
    { city: 'Dubai', date: '2020-09-02', x: 61.5, y: 51.8 },
    { city: 'Doha', date: '2020-11-09', x: 58.6, y: 51.2 },
    { city: 'Nairobi', date: '2020-12-14', x: 56.1, y: 65.5 },
    { city: 'Cape Town', date: '2021-01-15', x: 51.4, y: 82.9 },
    { city: 'Rio de Janeiro', date: '2021-03-11', x: 35.1, y: 77.4 },
    { city: 'Mexico City', date: '2021-06-15', x: 20.1, y: 55.2 },
    { city: 'Los Angeles', date: '2021-08-23', x: 14.8, y: 45.8 },
    { city: 'New York', date: '2021-09-23', x: 28.1, y: 42.2 },
    { city: 'London', date: '2021-12-31', x: 45.5, y: 32.4 },
];


const SHORT_HAUL_STOPS: RouteStop[] = [
    { city: 'Frankfurt', date: '2020-02-19', x: 40.6, y: 51.8 },
    { city: 'Amsterdam', date: '2020-03-11', x: 34.6, y: 48.7 },
    { city: 'Paris', date: '2020-03-27', x: 28.6, y: 58.2 },
    { city: 'Madrid', date: '2020-04-20', x: 16.6, y: 78.6 },
    { city: 'Rome', date: '2020-05-15', x: 45.8, y: 75.4 },
    { city: 'Athens', date: '2020-06-08', x: 64.8, y: 85.0 },
    { city: 'Budapest', date: '2020-09-02', x: 59.6, y: 62.1 },
    { city: 'Warsaw', date: '2020-11-09', x: 59.2, y: 50.7 },
    { city: 'Stockholm', date: '2020-12-14', x: 52.5, y: 31.2 },
    { city: 'Oslo', date: '2021-01-15', x: 43.9, y: 32.3 },
    { city: 'Copenhagen', date: '2021-03-11', x: 43.7, y: 38.2 },
    { city: 'Vienna', date: '2021-06-15', x: 50.1, y: 59.8 },
    { city: 'Prague', date: '2021-08-23', x: 45.0, y: 57.4 },
    { city: 'Zurich', date: '2021-09-23', x: 40.9, y: 61.0 },
    { city: 'Brussels', date: '2021-12-31', x: 34.6, y: 55.2 },
];

function toDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getActiveStopIndex(stops: RouteStop[], currentDate: Date) {
    const current = toDateKey(currentDate);
    let activeIndex = 0;
    let activeDate = stops[0]?.date ?? '';

    for (let index = 0; index < stops.length; index += 1) {
        const stopDate = stops[index].date;
        if (stopDate <= current && stopDate >= activeDate) {
            activeIndex = index;
            activeDate = stopDate;
        }
    }

    return activeIndex;
}

function routePath(stops: RouteStop[]) {
    return stops.map((stop, index) => `${index === 0 ? 'M' : 'L'} ${stop.x} ${stop.y}`).join(' ');
}

export default function FlightRouteMap({ route, currentDate, locked = false, lockedDate }: Props) {
    const [open, setOpen] = useState(false);
    const [lockMessageOpen, setLockMessageOpen] = useState(false);
    const [showUnlockHint, setShowUnlockHint] = useState(true);
    const [markerStop, setMarkerStop] = useState<RouteStop | null>(null);
    const [railIndex, setRailIndex] = useState(0);
    const stops = route === 'long-haul' ? LONG_HAUL_STOPS : SHORT_HAUL_STOPS;
    const effectiveDate = useMemo(
        () => (locked && lockedDate ? new Date(`${lockedDate}T00:00:00`) : currentDate),
        [currentDate, locked, lockedDate]
    );
    const activeIndex = useMemo(() => getActiveStopIndex(stops, effectiveDate), [effectiveDate, stops]);
    const activeStop = stops[activeIndex];
    const previousStop = stops[Math.max(0, activeIndex - 1)];
    const completedStops = stops.slice(0, Math.max(1, activeIndex));
    const currentSegmentStops = activeIndex > 0 ? [previousStop, activeStop] : [];
    const upcomingStops = stops.slice(Math.max(0, activeIndex - 1));
    const railProgress = stops.length <= 1 ? 0 : (railIndex / (stops.length - 1)) * 100;
    const mapTitle = route === 'long-haul' ? 'International Route Map' : 'European Route Map';
    const mapSubtitle =
        route === 'long-haul'
            ? 'Long-haul roster with international flight points'
            : 'Short-haul roster with European flight points';
    const mapImage =
        route === 'long-haul'
            ? '/images/COVID-19-PANDEMIC/map/long haul.png'
            : '/images/COVID-19-PANDEMIC/map/short haul.png';
    const mapAspectRatio = route === 'long-haul' ? '1680 / 920' : '1376 / 1144';
    const mapWidth = route === 'long-haul'
        ? 'min(100%, calc((100svh - 190px) * 1.826))'
        : 'min(100%, calc((100svh - 190px) * 1.203))';
    const modalWidth = route === 'long-haul'
        ? 'min(1260px, calc(100vw - 32px))'
        : 'min(1080px, calc(100vw - 32px))';

    const openMap = () => {
        setShowUnlockHint(false);
        if (locked) {
            setLockMessageOpen(true);
            return;
        }

        setOpen(true);
    };

    useEffect(() => {
        if (!open) return;

        setMarkerStop(previousStop);
        setRailIndex(Math.max(0, activeIndex - 1));
        const timer = window.setTimeout(() => {
            setMarkerStop(activeStop);
            setRailIndex(activeIndex);
        }, 80);

        return () => window.clearTimeout(timer);
    }, [activeIndex, activeStop, open, previousStop]);

    return (
        <>
            {showUnlockHint ? (
                <div className="fixed bottom-20 right-5 z-40 w-[min(280px,calc(100vw-40px))] rounded-2xl border border-sky-200 bg-white p-3 text-sm text-slate-700 shadow-[0_16px_38px_rgba(15,23,42,0.18)]">
                    <p className="font-semibold text-slate-950">
                        {locked ? 'Route map unavailable' : 'Route map unlocked'}
                    </p>
                    <p className="mt-1">
                        {locked
                            ? "Diana's active roster is suspended."
                            : "Tap the map button to follow Diana's flights."}
                    </p>
                </div>
            ) : null}

            <button
                type="button"
                onClick={openMap}
                className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-sky-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-[0_14px_36px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50"
                aria-label="Open Diana flight route map"
            >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                    <Image
                        src={locked ? '/images/lock.png' : '/images/COVID-19-PANDEMIC/map/plane.png'}
                        alt=""
                        width={44}
                        height={44}
                        className="h-9 w-9 object-contain"
                    />
                </span>
                {locked ? 'Route locked' : 'Route map'}
            </button>

            {lockMessageOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
                    <div className="animate-event-in w-[min(460px,calc(100vw-32px))] rounded-2xl bg-white p-6 text-center text-slate-900 shadow-2xl">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                            <Image
                                src="/images/lock.png"
                                alt=""
                                width={46}
                                height={46}
                                className="h-11 w-11 object-contain"
                            />
                        </div>
                        <h2 className="text-xl font-bold">This feature is currently unavailable.</h2>
                        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                            {`Diana's flying duties have been suspended following
her COVID-19 diagnosis. She is no longer on the
active roster.

The Route Map will reflect her status once
her situation changes.`}
                        </p>
                        <button
                            type="button"
                            onClick={() => setLockMessageOpen(false)}
                            className="mt-5 w-full rounded-full bg-blue-600 py-3 text-base font-semibold text-white transition hover:bg-blue-500"
                        >
                            close
                        </button>
                    </div>
                </div>
            ) : null}

            {open ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
                    <div
                        className="animate-event-in overflow-hidden rounded-2xl bg-white text-slate-950 shadow-2xl"
                        style={{ width: modalWidth, maxWidth: modalWidth }}
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-600">
                                    Diana Gelus
                                </p>
                                <h2 className="mt-1 text-2xl font-bold">{mapTitle}</h2>
                                <p className="mt-1 text-sm text-slate-500">{mapSubtitle}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-xl font-semibold text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
                                aria-label="Close route map"
                            >
                                x
                            </button>
                        </div>

                        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_260px]">
                            <div className="flex items-center justify-center overflow-auto bg-slate-100 p-2">
                                <div
                                    className="relative max-w-full overflow-hidden rounded-xl shadow-inner"
                                    style={{
                                        aspectRatio: mapAspectRatio,
                                        maxHeight: 'calc(100svh - 190px)',
                                        width: mapWidth,
                                    }}
                                >
                                    <Image
                                        src={mapImage}
                                        alt={mapTitle}
                                        fill
                                        priority
                                        sizes="(min-width: 1024px) 830px, calc(100vw - 32px)"
                                        className="object-contain"
                                    />

                                    <svg
                                        viewBox="0 0 100 100"
                                        className="absolute inset-0 h-full w-full"
                                        preserveAspectRatio="none"
                                        aria-hidden="true"
                                    >
                                        <defs>
                                            <filter id="flightRouteGlow">
                                                <feGaussianBlur stdDeviation="1.2" result="blur" />
                                                <feMerge>
                                                    <feMergeNode in="blur" />
                                                    <feMergeNode in="SourceGraphic" />
                                                </feMerge>
                                            </filter>
                                        </defs>

                                        {upcomingStops.length > 1 ? (
                                            <path
                                                d={routePath(upcomingStops)}
                                                fill="none"
                                                stroke="#ef4444"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="0.6"
                                                opacity="0.9"
                                                filter="url(#flightRouteGlow)"
                                            />
                                        ) : null}

                                        {completedStops.length > 1 ? (
                                            <path
                                                d={routePath(completedStops)}
                                                fill="none"
                                                stroke="#64748b"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="0.75"
                                                opacity="0.85"
                                            />
                                        ) : null}

                                        {currentSegmentStops.length > 1 ? (
                                            <path
                                                key={`current-segment-${activeIndex}-${open ? 'open' : 'closed'}`}
                                                d={routePath(currentSegmentStops)}
                                                fill="none"
                                                stroke="#64748b"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="0.75"
                                                opacity="0.92"
                                                pathLength={1}
                                                strokeDasharray="1"
                                                strokeDashoffset="1"
                                            >
                                                <animate
                                                    attributeName="stroke-dashoffset"
                                                    from="1"
                                                    to="0"
                                                    dur="1.4s"
                                                    fill="freeze"
                                                />
                                            </path>
                                        ) : null}

                                        {stops.map((stop, index) => {
                                            const completed = index < activeIndex;
                                            const active = index === activeIndex;
                                            return (
                                                <g key={`${stop.city}-${stop.date}`}>
                                                    <circle
                                                        cx={stop.x}
                                                        cy={stop.y}
                                                        r={active ? '2.1' : '1.7'}
                                                        fill={completed ? '#64748b' : '#ef4444'}
                                                        opacity={active ? '0.34' : '0.24'}
                                                        filter="url(#flightRouteGlow)"
                                                    />
                                                    <circle
                                                        cx={stop.x}
                                                        cy={stop.y}
                                                        r={active ? '0.9' : '0.72'}
                                                        fill={completed ? '#475569' : '#dc2626'}
                                                        stroke="white"
                                                        strokeWidth="0.25"
                                                    />
                                                </g>
                                            );
                                        })}
                                    </svg>

                                    {stops.map((stop, index) => (
                                        <div
                                            key={`${stop.city}-${stop.date}-label`}
                                            className={`absolute -translate-x-1/2 translate-y-[0.55rem] rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm ${
                                                index < activeIndex
                                                    ? 'bg-slate-100/85 text-slate-500'
                                                    : 'bg-white/85 text-slate-800'
                                            }`}
                                            style={{ left: `${stop.x}%`, top: `${stop.y}%` }}
                                        >
                                            {stop.city}
                                        </div>
                                    ))}

                                    <div
                                        className="absolute h-11 w-11 -translate-x-1/2 -translate-y-[88%] drop-shadow-[0_0_12px_rgba(14,165,233,0.85)] transition-[left,top] duration-[1400ms] ease-in-out"
                                        style={{
                                            left: `${(markerStop ?? activeStop).x}%`,
                                            top: `${(markerStop ?? activeStop).y}%`,
                                        }}
                                        title={`Diana is in ${activeStop.city}`}
                                    >
                                        <Image
                                            src="/images/COVID-19-PANDEMIC/map/chibified.png"
                                            alt={`Diana current location: ${activeStop.city}`}
                                            fill
                                            sizes="44px"
                                            className="object-contain"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 bg-white p-4 lg:border-l lg:border-t-0">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                    Current location
                                </p>
                                <p className="mt-2 text-xl font-bold text-slate-950">{activeStop.city}</p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Diana moves to the route point tied to the current timeline date.
                                </p>

                                <div
                                    className={`mt-5 overflow-y-auto pr-1 ${
                                        route === 'short-haul' ? 'max-h-[520px]' : 'max-h-[390px]'
                                    }`}
                                >
                                    <div className="relative pl-8">
                                        <div className="absolute bottom-5 left-[15px] top-5 w-px bg-slate-200" />
                                        <div
                                            className="absolute left-[15px] top-5 w-px bg-slate-400 transition-all duration-[1400ms] ease-in-out"
                                            style={{ height: `calc((100% - 2.5rem) * ${railProgress / 100})` }}
                                        />
                                        <div
                                            className="absolute -left-0.5 z-10 h-10 w-10 -translate-y-1/2 transition-[top] duration-[1400ms] ease-in-out"
                                            style={{ top: `calc(1.25rem + (100% - 2.5rem) * ${railProgress / 100})` }}
                                        >
                                            <Image
                                                src="/images/COVID-19-PANDEMIC/map/plane.png"
                                                alt="Current route point"
                                                fill
                                                sizes="40px"
                                                className="rotate-180 object-contain drop-shadow-[0_0_8px_rgba(14,165,233,0.65)]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            {stops.map((stop, index) => (
                                                <div
                                                    key={`${stop.city}-${stop.date}-list`}
                                                    className={`relative rounded-lg border px-3 py-2 text-sm ${
                                                        index === activeIndex
                                                            ? 'border-sky-200 bg-sky-50 text-sky-900'
                                                            : index < activeIndex
                                                              ? 'border-slate-200 bg-slate-100 text-slate-500'
                                                              : 'border-slate-200 bg-slate-50 text-slate-600'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="font-semibold">{stop.city}</span>
                                                        <span className="text-xs">{stop.date}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}
