'use client';
import DotComRealityCheckModal from './components/DotComRealityCheckModal';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { WalletItem } from './utils/walletData';
import {
    DEFAULT_STARTING_CASH,
    clearGameOver,
    loadGameOver,
    loadStartingCash,
    loadWallet,
    readStoredJson,
    saveGameOver,
    saveWallet,
} from './utils/walletStorage';
import DotComFrenzyModal from './components/DotComFrenzyModal';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from './components/sidebar';
import MainPanel from './components/mainPanel';
import { GAME_EVENTS } from './utils/events';
import FamilyHelpModal from './components/familyHelp';
import ApplyForCollegeModal from './components/ApplyForCollege';
import CarInsuranceModal from './components/CarInsurance';
import CollegeResultsModal from './components/CollegeResults';
import CollegePartyInvite from './components/CollegePartyInvite';
import PartyConsequencesModal from './components/CollegePartyConsequences';
import ParentsSupportModal from './components/ParentsSupport';
import CarCrashModal from './components/CarCrash';
import FreelanceGigModal from './components/FreelanceGig';
import JobOpportunityModal from './components/JobOpportunity';
import GameOverModal from './components/GameOverModal';
import EndGameOverlay from './components/EndGameOverlay';
import Timeline from './components/Timeline';
import { TIMELINE, TIMELINE_DATES } from './utils/timeline';
import { PANDEMIC_TIMELINE, PANDEMIC_TIMELINE_DATES } from './utils/pandemicTimeline';
import {
    getScenarioAssetCatalogs,
    getAssetsWithMarket,
    findRowAtOrBefore,
    toLocalDateStr,
    type AssetWithData,
} from './utils/marketData';
import { normalizeScenarioId } from '@/app/lib/news-shared';
import type {
    GameNotification,
    NotificationDraft,
    NotificationTone,
} from './utils/notifications';
import {
    buildGameOverSummary,
    createRunStats,
    loadRunStats,
    recordBuyAction,
    recordEventAction,
    recordSellAction,
    saveGameOverSummary,
    saveRunStats,
    type RunStats,
} from './utils/runStats';

function formatNotificationTimestamp(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

function formatNotificationCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function getPositionMoveTone(changePercent: number): NotificationTone {
    if (changePercent > 0) return 'gain';
    if (changePercent < 0) return 'loss';
    return 'info';
}

function canTriggerEvent(
    eventId: string,
    attendedCollegeParty: boolean,
    acceptedGig: boolean
) {
    if (eventId === 'party-consequences') return attendedCollegeParty;
    if (eventId === 'job-opportunity') return acceptedGig;
    return true;
}

function buildTradeNotification({
    titleVerb,
    messageVerb,
    symbol,
    units,
    totalValue,
    price,
    timestampLabel,
}: {
    titleVerb: 'Bought' | 'Sold';
    messageVerb: 'purchased' | 'sold';
    symbol: string;
    units: number;
    totalValue: number;
    price: number;
    timestampLabel: string;
}): NotificationDraft {
    return {
        tone: 'info',
        title: `${titleVerb} ${symbol}`,
        message: `${units.toFixed(4)} shares ${messageVerb} for ${formatNotificationCurrency(totalValue)} at ${formatNotificationCurrency(price)}.`,
        timestampLabel,
    };
}

function buildDailyMoveNotification(
    asset: AssetWithData,
    ownedUnits: number,
    dateKey: string,
    timestampLabel: string
): NotificationDraft {
    const positionMoveUsd = (asset.price - (asset.previous?.close ?? asset.price)) * ownedUnits;
    const moveDirection = asset.change > 0 ? 'up' : asset.change < 0 ? 'down' : 'flat';
    const positionVerb = positionMoveUsd > 0 ? 'gained' : positionMoveUsd < 0 ? 'lost' : 'held';

    return {
        tone: getPositionMoveTone(asset.change),
        title: `${asset.symbol} is ${moveDirection} today`,
        message:
            asset.change === 0
                ? `Your ${ownedUnits.toFixed(4)} shares are unchanged at ${formatNotificationCurrency(asset.price)}.`
                : `Your ${ownedUnits.toFixed(4)} shares ${positionVerb} ${formatNotificationCurrency(Math.abs(positionMoveUsd))} after a ${Math.abs(asset.change).toFixed(2)}% move.`,
        timestampLabel,
        sourceKey: `daily-move:${dateKey}:${asset.symbol}`,
    };
}

function buildPeriodMoveNotification({
    symbol,
    ownedUnits,
    fromPrice,
    toPrice,
    fromDateKey,
    toDateKey,
    timestampLabel,
}: {
    symbol: string;
    ownedUnits: number;
    fromPrice: number;
    toPrice: number;
    fromDateKey: string;
    toDateKey: string;
    timestampLabel: string;
}): NotificationDraft {
    const priceDelta = toPrice - fromPrice;
    const positionDelta = priceDelta * ownedUnits;
    const changePct = fromPrice !== 0 ? (priceDelta / fromPrice) * 100 : 0;

    const calDays = Math.round(
        (new Date(toDateKey + 'T00:00:00').getTime() - new Date(fromDateKey + 'T00:00:00').getTime()) /
            (1000 * 60 * 60 * 24)
    );

    const direction = priceDelta > 0 ? 'up' : priceDelta < 0 ? 'down' : 'flat';
    const verb = positionDelta > 0 ? 'gained' : positionDelta < 0 ? 'lost' : 'held steady at';

    let title: string;
    let periodPhrase: string;

    if (calDays <= 1) {
        title = `${symbol} is ${direction} today`;
        periodPhrase = `after today's move`;
    } else {
        const periodStr =
            calDays < 30
                ? `${calDays} days`
                : calDays < 365
                  ? `${Math.round(calDays / 30)} month${Math.round(calDays / 30) === 1 ? '' : 's'}`
                  : `${(calDays / 365).toFixed(1)}y`;
        title = `${symbol} ${direction} over ${periodStr}`;
        const fromLabel = new Date(fromDateKey + 'T00:00:00').toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
        const toLabel = new Date(toDateKey + 'T00:00:00').toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
        periodPhrase = `from ${fromLabel} to ${toLabel}`;
    }

    const message =
        priceDelta === 0
            ? `Your ${ownedUnits.toFixed(4)} shares are unchanged at ${formatNotificationCurrency(toPrice)}.`
            : `Your ${ownedUnits.toFixed(4)} shares ${verb} ${formatNotificationCurrency(Math.abs(positionDelta))} (${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%) ${periodPhrase}.`;

    return {
        tone: getPositionMoveTone(changePct),
        title,
        message,
        timestampLabel,
        sourceKey: `period-move:${fromDateKey}:${toDateKey}:${symbol}`,
    };
}

function createStartingWallet(startingCash: number): WalletItem[] {
    return [
        {
            id: 'cash',
            label: 'Cash',
            units: startingCash,
            unitLabel: '$',
            usdValue: startingCash,
        },
    ];
}

const DAY_DURATION_SECONDS = 6 * 60;
const DAY_START_MINUTES = 2 * 60;
const DAY_END_MINUTES = 24 * 60 - 1;
const TOTAL_SECONDS = DAY_DURATION_SECONDS;
const END_GAME_REDIRECT_DELAY_MS = 2200;
const CASH_BREAK_SECONDS = 30;
const BILLING_BREAK_SECONDS = 120;
const MONTHLY_INSURANCE = 70;
const MONTHLY_TUITION: Record<string, number> = {
    atlas: 700,
    'ivy-tech': 600,
    northbridge: 500,
    'state-university': 200,
    'city-college': 150,
    'community-college': 100,
};

function getMonthsElapsed(fromDateStr: string, toDateStr: string): number {
    const fromParts = fromDateStr.split('-').map(Number);
    const toParts = toDateStr.split('-').map(Number);
    return (toParts[0] - fromParts[0]) * 12 + (toParts[1] - fromParts[1]);
}

function getWalletTotalValue(wallet: WalletItem[]) {
    return wallet.reduce((sum, item) => sum + item.usdValue, 0);
}

function readStoredDecision(key: string, property: string) {
    const parsed = readStoredJson<Record<string, unknown>>(key);
    return parsed?.[property] === true;
}

function readStoredGameSeconds(storageKey: string, timelineDates: string[]) {
    if (typeof window === 'undefined') return 0;

    try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return 0;

        const parsed = Number.parseInt(raw, 10);
        if (!Number.isFinite(parsed) || parsed < 0) return 0;

        const lastDayStart = (timelineDates.length - 1) * TOTAL_SECONDS;
        return Math.min(parsed, lastDayStart);
    } catch {
        return 0;
    }
}

function readStoredTriggeredEvents(storageKey: string) {
    if (typeof window === 'undefined') return [];

    try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return [];

        const parsed = JSON.parse(raw);
        return Array.isArray(parsed)
            ? parsed.filter((item): item is string => typeof item === 'string')
            : [];
    } catch {
        return [];
    }
}

export default function MainPage() {
    return (
        <Suspense fallback={null}>
            <MainPageContent />
        </Suspense>
    );
}

function MainPageContent() {
    const [mounted, setMounted] = useState(false);
    const searchParams = useSearchParams();
    const scenarioId = normalizeScenarioId(searchParams.get('scenario'));
    const scenarioCatalogs = useMemo(() => getScenarioAssetCatalogs(scenarioId), [scenarioId]);
    const timelineDates = useMemo(
        () => (scenarioId === 'pandemic' ? PANDEMIC_TIMELINE_DATES : TIMELINE_DATES),
        [scenarioId]
    );
    const timelineMarkers = useMemo(
        () => (scenarioId === 'pandemic' ? PANDEMIC_TIMELINE : TIMELINE),
        [scenarioId]
    );
    const timelineDateObjects = useMemo(
        () => timelineDates.map(date => new Date(date)),
        [timelineDates]
    );
    const timelineStorageKey = scenarioId === 'pandemic' ? 'timeline:pandemic' : 'timeline';
    const triggeredEventsStorageKey =
        scenarioId === 'pandemic' ? 'triggeredEvents:pandemic' : 'triggeredEvents';
    const scenarioEvents = scenarioId === 'pandemic' ? [] : GAME_EVENTS;
    const [startingCash] = useState(() => loadStartingCash(DEFAULT_STARTING_CASH));
    const [triggeredEvents, setTriggeredEvents] = useState<string[]>(() =>
        readStoredTriggeredEvents(triggeredEventsStorageKey)
    );
    const [gameOver, setGameOver] = useState(loadGameOver);
    const [notifications, setNotifications] = useState<GameNotification[]>([]);
    const [activeToastIds, setActiveToastIds] = useState<string[]>([]);
    const [historyOpen, setHistoryOpen] = useState(false);
    const notificationCounter = useRef(0);
    const notificationsRef = useRef<GameNotification[]>([]);
    const historyOpenRef = useRef(false);
    const walletRef = useRef<WalletItem[]>([]);
    const runStatsRef = useRef<RunStats>(createRunStats(startingCash));
    const activeEventSnapshotRef = useRef<{ id: string; walletValue: number } | null>(null);
    const endGameHandledRef = useRef(false);
    const [cashBreak, setCashBreak] = useState<{ eventId: string; deadline: number } | null>(null);
    const [cashBreakTick, setCashBreakTick] = useState(() => Date.now());
    const [billingBreak, setBillingBreak] = useState<{
        reason: string;
        totalOwed: number;
        deadline: number;
    } | null>(null);
    const [billingBreakTick, setBillingBreakTick] = useState(() => Date.now());
    const [gameSeconds, setGameSeconds] = useState(() =>
        readStoredGameSeconds(timelineStorageKey, timelineDates)
    );
    const [skipLabel, setSkipLabel] = useState<string | null>(null);
    const skipLabelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSeenDateKeyRef = useRef<string>('');

    const dayIndex = Math.min(Math.floor(gameSeconds / TOTAL_SECONDS), timelineDateObjects.length - 1);
    const baseDate = timelineDateObjects[dayIndex];
    const secondsIntoDay = gameSeconds % TOTAL_SECONDS;
    const finalMinuteStartSeconds = (timelineDateObjects.length - 1) * TOTAL_SECONDS;
    const isLastDay = dayIndex === timelineDateObjects.length - 1;
    const playableMinutes = DAY_END_MINUTES - DAY_START_MINUTES;
    const dayProgress = TOTAL_SECONDS <= 1 ? 0 : secondsIntoDay / (TOTAL_SECONDS - 1);
    const inGameMinutes = DAY_START_MINUTES + Math.round(dayProgress * playableMinutes);
    const hasReachedTimelineEnd = !gameOver && isLastDay && secondsIntoDay >= 60;

    const [wallet, setWallet] = useState<WalletItem[]>(() => {
        if (typeof window === 'undefined') {
            return createStartingWallet(DEFAULT_STARTING_CASH);
        }

        const stored = loadWallet();
        if (stored) return stored;

        return createStartingWallet(loadStartingCash(DEFAULT_STARTING_CASH));
    });

    const currentDateTime = useMemo(() => {
        const nextDateTime = new Date(baseDate);
        nextDateTime.setHours(0, 0, 0, 0);
        nextDateTime.setMinutes(inGameMinutes);
        return nextDateTime;
    }, [baseDate, inGameMinutes]);

    const currentDateKey = toLocalDateStr(currentDateTime);
    const dayStartTime = new Date(baseDate);
    dayStartTime.setHours(0, 0, 0, 0);
    dayStartTime.setMinutes(DAY_START_MINUTES);
    const dayStartTimestampLabel = formatNotificationTimestamp(dayStartTime);
    const secondsLeft = isLastDay ? Math.max(0, 60 - secondsIntoDay) : TOTAL_SECONDS - secondsIntoDay;

    const attendedCollegeParty = readStoredDecision('collegeParty', 'attended');
    const acceptedGig = readStoredDecision('freelanceGig', 'accepted');

    const pushNotification = useCallback((draft: NotificationDraft) => {
        if (
            draft.sourceKey &&
            notificationsRef.current.some(notification => notification.sourceKey === draft.sourceKey)
        ) {
            return;
        }

        notificationCounter.current += 1;

        const notification: GameNotification = {
            id: `notification-${notificationCounter.current}`,
            read: historyOpenRef.current,
            ...draft,
        };

        notificationsRef.current = [notification, ...notificationsRef.current];
        setNotifications(prev => [notification, ...prev]);
        setActiveToastIds(prev => [notification.id, ...prev.filter(id => id !== notification.id)].slice(0, 4));
    }, []);

    const handleSetHistoryOpen = useCallback((open: boolean) => {
        historyOpenRef.current = open;
        setHistoryOpen(open);

        if (!open) return;

        setNotifications(prev => {
            const next = prev.map(notification =>
                notification.read ? notification : { ...notification, read: true }
            );
            notificationsRef.current = next;
            return next;
        });
    }, []);

    const handleDismissToast = useCallback((id: string) => {
        setActiveToastIds(prev => prev.filter(toastId => toastId !== id));
    }, []);

    const handleBuyNotification = useCallback(
        (details: {
            symbol: string;
            units: number;
            totalCost: number;
            price: number;
            timestamp: Date;
        }) => {
            recordBuyAction(runStatsRef.current, {
                symbol: details.symbol,
                totalCost: details.totalCost,
                units: details.units,
                date: details.timestamp.toISOString(),
            });
            saveRunStats(runStatsRef.current);
            pushNotification(
                buildTradeNotification({
                    titleVerb: 'Bought',
                    messageVerb: 'purchased',
                    symbol: details.symbol,
                    units: details.units,
                    totalValue: details.totalCost,
                    price: details.price,
                    timestampLabel: formatNotificationTimestamp(details.timestamp),
                })
            );
        },
        [pushNotification]
    );

    const handleSellNotification = useCallback(
        (details: {
            symbol: string;
            units: number;
            totalReceived: number;
            price: number;
            timestamp: Date;
        }) => {
            recordSellAction(runStatsRef.current, {
                symbol: details.symbol,
                totalReceived: details.totalReceived,
                units: details.units,
                date: details.timestamp.toISOString(),
            });
            saveRunStats(runStatsRef.current);
            pushNotification(
                buildTradeNotification({
                    titleVerb: 'Sold',
                    messageVerb: 'sold',
                    symbol: details.symbol,
                    units: details.units,
                    totalValue: details.totalReceived,
                    price: details.price,
                    timestampLabel: formatNotificationTimestamp(details.timestamp),
                })
            );
        },
        [pushNotification]
    );

    const activeEvent = gameOver
        ? null
        : (scenarioEvents.find(event => {
              if (event.date !== currentDateKey) return false;
              if (triggeredEvents.includes(event.id)) return false;
              return canTriggerEvent(event.id, attendedCollegeParty, acceptedGig);
          })?.id ?? null);

    const cashBreakActive =
        activeEvent !== null &&
        cashBreak?.eventId === activeEvent &&
        cashBreak.deadline > cashBreakTick;
    const cashBreakRemaining = cashBreakActive
        ? Math.max(0, Math.ceil((cashBreak.deadline - cashBreakTick) / 1000))
        : 0;
    const billingBreakActive = billingBreak !== null && billingBreak.deadline > billingBreakTick;
    const billingBreakRemaining = billingBreakActive
        ? Math.max(0, Math.ceil((billingBreak.deadline - billingBreakTick) / 1000))
        : 0;
    const eventModalOpen = activeEvent !== null && !cashBreakActive && !hasReachedTimelineEnd;

    const handleCloseActiveEvent = () => {
        if (!activeEvent) return;

        const eventSnapshot = activeEventSnapshotRef.current;
        if (eventSnapshot?.id === activeEvent) {
            const snapshotDate = currentDateTime.toISOString();

            window.setTimeout(() => {
                recordEventAction(runStatsRef.current, {
                    eventId: activeEvent,
                    valueDelta: getWalletTotalValue(walletRef.current) - eventSnapshot.walletValue,
                    date: snapshotDate,
                });
                saveRunStats(runStatsRef.current);
                activeEventSnapshotRef.current = null;
            }, 0);
        }

        setTriggeredEvents(prev => (prev.includes(activeEvent) ? prev : [...prev, activeEvent]));
        setCashBreak(null);
    };

    const handleGameOver = (reason: string) => {
        if (activeEvent) {
            setTriggeredEvents(prev => (prev.includes(activeEvent) ? prev : [...prev, activeEvent]));
        }

        setCashBreak(null);
        setGameOver(saveGameOver(reason));
    };

    const handleRequestCashBreak = useCallback(() => {
        if (!activeEvent) return;

        const deadline = Date.now() + CASH_BREAK_SECONDS * 1000;
        setCashBreak({ eventId: activeEvent, deadline });
        setCashBreakTick(Date.now());
    }, [activeEvent]);

    useEffect(() => {
        if (gameOver || hasReachedTimelineEnd || activeEvent) return;
        if (billingBreak !== null && billingBreak.deadline > Date.now()) return;

        const interval = setInterval(() => {
            setGameSeconds(s => s + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [activeEvent, billingBreak, gameOver, hasReachedTimelineEnd]);

    useEffect(() => {
        if (!cashBreak || cashBreak.eventId !== activeEvent) return;

        const updateCountdown = () => {
            const now = Date.now();
            setCashBreakTick(now);
            if (now >= cashBreak.deadline) {
                setCashBreak(null);
            }
        };

        const interval = window.setInterval(updateCountdown, 250);
        return () => window.clearInterval(interval);
    }, [activeEvent, cashBreak]);

    useEffect(() => {
        if (!eventModalOpen) return;

        const { body, documentElement } = document;
        const previousBodyOverflow = body.style.overflow;
        const previousHtmlOverflow = documentElement.style.overflow;
        body.style.overflow = 'hidden';
        documentElement.style.overflow = 'hidden';

        return () => {
            body.style.overflow = previousBodyOverflow;
            documentElement.style.overflow = previousHtmlOverflow;
        };
    }, [eventModalOpen]);

    useEffect(() => {
        notificationsRef.current = notifications;
    }, [notifications]);

    useEffect(() => {
        historyOpenRef.current = historyOpen;
    }, [historyOpen]);

    useEffect(() => {
        walletRef.current = wallet;
    }, [wallet]);

    useEffect(() => {
        if (!activeEvent) {
            activeEventSnapshotRef.current = null;
            return;
        }

        activeEventSnapshotRef.current = {
            id: activeEvent,
            walletValue: getWalletTotalValue(walletRef.current),
        };
    }, [activeEvent]);

    useEffect(() => {
        if (lastSeenDateKeyRef.current === '') {
            lastSeenDateKeyRef.current = currentDateKey;
            return;
        }

        const fromDateKey = lastSeenDateKeyRef.current;
        lastSeenDateKeyRef.current = currentDateKey;
        if (fromDateKey === currentDateKey) return;

        const ownedStocks = walletRef.current.filter(
            item => item.id !== 'cash' && item.id !== 'car' && item.units > 0
        );
        if (ownedStocks.length === 0 || gameOver) return;

        const assetBySymbol = new Map(
            getAssetsWithMarket(currentDateKey, 4, scenarioCatalogs.allCatalog)
                .filter((asset): asset is AssetWithData => asset.hasData)
                .map(asset => [asset.symbol, asset])
        );

        ownedStocks.forEach(item => {
            const asset = assetBySymbol.get(item.label);
            if (!asset) return;

            const fromRow = findRowAtOrBefore(asset.data, fromDateKey);
            if (!fromRow) return;

            pushNotification(
                buildPeriodMoveNotification({
                    symbol: item.label,
                    ownedUnits: item.units,
                    fromPrice: fromRow.close,
                    toPrice: asset.price,
                    fromDateKey,
                    toDateKey: currentDateKey,
                    timestampLabel: dayStartTimestampLabel,
                })
            );
        });
    }, [currentDateKey, dayStartTimestampLabel, gameOver, pushNotification, scenarioCatalogs]);

    useEffect(() => {
        if (gameOver) return;

        const insuranceData = readStoredJson<{ insured: boolean }>('carInsurance');
        const hasInsurance = insuranceData?.insured === true;
        const collegeResult = readStoredJson<{ result: string; fallback?: string | null }>('collegeResult');
        const collegeResultKind = collegeResult?.result;
        const collegeApp = readStoredJson<{ schoolId: string; schoolName?: string }>('collegeApplication');
        let tuitionSchoolId: string | null = null;
        let tuitionSchoolName: string | null = null;

        if (collegeResultKind === 'accepted') {
            tuitionSchoolId = collegeApp?.schoolId ?? null;
            tuitionSchoolName = collegeApp?.schoolName ?? tuitionSchoolId;
        } else if (collegeResultKind === 'fallback') {
            tuitionSchoolId = 'state-university';
            tuitionSchoolName = 'State University';
        }

        const monthlyTuition = tuitionSchoolId ? (MONTHLY_TUITION[tuitionSchoolId] ?? null) : null;
        let totalOwed = 0;
        const billingParts: string[] = [];
        const dateIso = new Date(currentDateKey + 'T00:00:00').toISOString();

        if (hasInsurance) {
            const lastBilled = localStorage.getItem('billing_insurance_lastDate');
            if (!lastBilled) {
                localStorage.setItem('billing_insurance_lastDate', currentDateKey);
            } else {
                const months = getMonthsElapsed(lastBilled, currentDateKey);
                if (months > 0) {
                    const amount = months * MONTHLY_INSURANCE;
                    totalOwed += amount;
                    billingParts.push(`car insurance (${months} mo x $${MONTHLY_INSURANCE})`);
                    localStorage.setItem('billing_insurance_lastDate', currentDateKey);
                    pushNotification({
                        tone: 'loss',
                        title: 'Monthly insurance payment',
                        message: `$${amount.toFixed(2)} deducted for ${months} month${months > 1 ? 's' : ''} of car insurance.`,
                        timestampLabel: dayStartTimestampLabel,
                        sourceKey: `billing-insurance:${currentDateKey}`,
                    });
                    recordEventAction(runStatsRef.current, {
                        eventId: 'billing-insurance',
                        valueDelta: -amount,
                        date: dateIso,
                    });
                    saveRunStats(runStatsRef.current);
                }
            }
        }

        if (tuitionSchoolId && monthlyTuition !== null) {
            const lastBilled = localStorage.getItem('billing_college_lastDate');
            if (!lastBilled) {
                localStorage.setItem('billing_college_lastDate', currentDateKey);
            } else {
                const months = getMonthsElapsed(lastBilled, currentDateKey);
                if (months > 0) {
                    const amount = months * monthlyTuition;
                    totalOwed += amount;
                    billingParts.push(`tuition (${months} mo x $${monthlyTuition})`);
                    localStorage.setItem('billing_college_lastDate', currentDateKey);
                    pushNotification({
                        tone: 'loss',
                        title: 'Monthly tuition payment',
                        message: `$${amount.toFixed(2)} deducted for ${months} month${months > 1 ? 's' : ''} of tuition at ${tuitionSchoolName}.`,
                        timestampLabel: dayStartTimestampLabel,
                        sourceKey: `billing-college:${currentDateKey}`,
                    });
                    recordEventAction(runStatsRef.current, {
                        eventId: 'billing-college',
                        valueDelta: -amount,
                        date: dateIso,
                    });
                    saveRunStats(runStatsRef.current);
                }
            }
        }

        if (totalOwed <= 0) return;

        const currentCash = walletRef.current.find(item => item.id === 'cash')?.units ?? 0;
        const remainingCash = currentCash - totalOwed;

        setWallet(prev =>
            prev.map(item =>
                item.id === 'cash'
                    ? { ...item, units: item.units - totalOwed, usdValue: item.usdValue - totalOwed }
                    : item
            )
        );

        if (remainingCash < 0) {
            const deadline = Date.now() + BILLING_BREAK_SECONDS * 1000;
            setBillingBreak({ reason: billingParts.join(' + '), totalOwed, deadline });
            setBillingBreakTick(Date.now());
        }
    }, [currentDateKey, dayStartTimestampLabel, gameOver, pushNotification, setWallet]);

    useEffect(() => {
        if (!billingBreak) return;

        const tick = () => {
            const now = Date.now();
            setBillingBreakTick(now);
            if (now >= billingBreak.deadline) {
                setBillingBreak(null);
                const cash = walletRef.current.find(item => item.id === 'cash')?.units ?? 0;
                if (cash < 0) {
                    handleGameOver(`Could not cover monthly payments: ${billingBreak.reason}`);
                }
            }
        };

        const interval = window.setInterval(tick, 250);
        return () => window.clearInterval(interval);
    }, [billingBreak]);

    const flashSkip = useCallback((fromDateStr: string, toDateStr: string) => {
        const calDays = Math.round(
            (new Date(toDateStr + 'T00:00:00').getTime() - new Date(fromDateStr + 'T00:00:00').getTime()) /
                (1000 * 60 * 60 * 24)
        );
        if (calDays <= 0) return;

        let period: string;
        if (calDays === 1) {
            period = '+1 day';
        } else if (calDays < 30) {
            period = `+${calDays} days`;
        } else if (calDays < 365) {
            const months = Math.round(calDays / 30);
            period = `+${months} month${months === 1 ? '' : 's'}`;
        } else {
            const yrs = (calDays / 365).toFixed(1);
            period = `+${yrs}y`;
        }

        const dest = new Date(toDateStr + 'T00:00:00').toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });

        if (skipLabelTimerRef.current) clearTimeout(skipLabelTimerRef.current);
        setSkipLabel(`${period} to ${dest}`);
        skipLabelTimerRef.current = setTimeout(() => setSkipLabel(null), 30000);
    }, []);

    const skip30Seconds = () => {
        if (activeEvent || billingBreakActive) return;
        const newSeconds = gameSeconds + 30;
        const newDayIdx = Math.min(Math.floor(newSeconds / TOTAL_SECONDS), timelineDateObjects.length - 1);
        if (newDayIdx > dayIndex) {
            flashSkip(currentDateKey, timelineDates[newDayIdx]);
        }
        setGameSeconds(s => s + 30);
    };

    const skipToNextDay = () => {
        if (activeEvent || billingBreakActive) return;
        const newDayIdx = Math.min(dayIndex + 1, timelineDateObjects.length - 1);
        if (newDayIdx > dayIndex) {
            flashSkip(currentDateKey, timelineDates[newDayIdx]);
        }
        setGameSeconds(current => {
            const nextDayStart = (Math.floor(current / TOTAL_SECONDS) + 1) * TOTAL_SECONDS;
            const lastDayStart = (timelineDateObjects.length - 1) * TOTAL_SECONDS;
            return Math.min(nextDayStart, lastDayStart);
        });
    };

    const skipToFinalMinute = () => {
        if (activeEvent || billingBreakActive) return;
        const finalDayIdx = timelineDateObjects.length - 1;
        if (finalDayIdx > dayIndex) {
            flashSkip(currentDateKey, timelineDates[finalDayIdx]);
        }
        setGameSeconds(current => Math.max(current, finalMinuteStartSeconds));
    };

    const jumpToDate = useCallback(
        (dateStr: string) => {
            if (activeEvent || billingBreakActive) return;
            const idx = timelineDates.indexOf(dateStr);
            if (idx === -1) return;
            if (idx > dayIndex) {
                flashSkip(currentDateKey, dateStr);
            }
            setGameSeconds(idx * TOTAL_SECONDS);
        },
        [activeEvent, billingBreakActive, currentDateKey, dayIndex, flashSkip, timelineDates]
    );

    useEffect(() => {
        saveWallet(wallet);
    }, [wallet]);

    useEffect(() => {
        localStorage.setItem(timelineStorageKey, String(gameSeconds));
    }, [gameSeconds, timelineStorageKey]);

    useEffect(() => {
        localStorage.setItem(triggeredEventsStorageKey, JSON.stringify(triggeredEvents));
    }, [triggeredEvents, triggeredEventsStorageKey]);

    useEffect(() => {
        runStatsRef.current = loadRunStats() ?? createRunStats(startingCash);
    }, [startingCash]);

    useEffect(() => {
        setMounted(true);
    }, []);

    const router = useRouter();

    const handleReturnHome = useCallback(() => {
        clearGameOver();
        localStorage.removeItem('gameStarted');
        router.replace('/');
    }, [router]);

    useEffect(() => {
        const started = localStorage.getItem('gameStarted');
        if (!started) {
            router.replace('/');
        }
    }, [router]);

    useEffect(() => {
        if (endGameHandledRef.current || !hasReachedTimelineEnd) return;

        endGameHandledRef.current = true;
        saveGameOverSummary(
            buildGameOverSummary(runStatsRef.current, walletRef.current, currentDateTime)
        );

        const redirectTimer = window.setTimeout(() => {
            router.replace('/game-over');
        }, END_GAME_REDIRECT_DELAY_MS);

        return () => window.clearTimeout(redirectTimer);
    }, [currentDateTime, hasReachedTimelineEnd, router]);

    if (!mounted) return null;

    return (
        <>
            <EndGameOverlay visible={hasReachedTimelineEnd} />
            {billingBreakActive ? (
                <div className="fixed left-1/2 top-5 z-50 w-[min(560px,calc(100vw-32px))] -translate-x-1/2 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-950 shadow-[0_18px_44px_rgba(15,23,42,0.18)]">
                    <p className="text-sm font-semibold">
                        {billingBreakRemaining}s to cover payments - ${billingBreak.totalOwed.toFixed(2)} owed
                    </p>
                    <p className="mt-1 text-sm leading-relaxed">
                        Your cash went negative after monthly deductions ({billingBreak.reason}). Sell assets to bring your balance above zero or the game will end.
                    </p>
                </div>
            ) : cashBreakActive ? (
                <div className="fixed left-1/2 top-5 z-50 w-[min(560px,calc(100vw-32px))] -translate-x-1/2 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-950 shadow-[0_18px_44px_rgba(15,23,42,0.18)]">
                    <p className="text-sm font-semibold">{cashBreakRemaining}s to raise cash</p>
                    <p className="mt-1 text-sm leading-relaxed">
                        Sell assets now, then the scenario will reopen. You cannot skip days until this scenario is completed.
                    </p>
                </div>
            ) : null}

            {eventModalOpen && activeEvent === 'dot-com-frenzy' && <DotComFrenzyModal onClose={handleCloseActiveEvent} />}
            {eventModalOpen && activeEvent === 'apply-for-college' && (
                <ApplyForCollegeModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={handleCloseActiveEvent}
                    onRequestCashBreak={handleRequestCashBreak}
                />
            )}
            {eventModalOpen && activeEvent === 'dot-com-reality-check' && (
                <DotComRealityCheckModal onClose={handleCloseActiveEvent} />
            )}
            {eventModalOpen && activeEvent === 'family-help' && (
                <FamilyHelpModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={handleCloseActiveEvent}
                    onRequestCashBreak={handleRequestCashBreak}
                />
            )}
            {eventModalOpen && activeEvent === 'car-insurance' && (
                <CarInsuranceModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={handleCloseActiveEvent}
                    onRequestCashBreak={handleRequestCashBreak}
                />
            )}
            {eventModalOpen && activeEvent === 'college-results' && (
                <CollegeResultsModal wallet={wallet} setWallet={setWallet} onClose={handleCloseActiveEvent} />
            )}
            {eventModalOpen && activeEvent === 'college-party-invite' && (
                <CollegePartyInvite
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={handleCloseActiveEvent}
                    onRequestCashBreak={handleRequestCashBreak}
                />
            )}
            {eventModalOpen && activeEvent === 'party-consequences' && (
                <PartyConsequencesModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={handleCloseActiveEvent}
                    onGameOver={handleGameOver}
                    onRequestCashBreak={handleRequestCashBreak}
                />
            )}
            {eventModalOpen && activeEvent === 'parents-support' && (
                <ParentsSupportModal wallet={wallet} setWallet={setWallet} onClose={handleCloseActiveEvent} />
            )}
            {eventModalOpen && activeEvent === 'car-crash' && (
                <CarCrashModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={handleCloseActiveEvent}
                    onGameOver={handleGameOver}
                    onRequestCashBreak={handleRequestCashBreak}
                />
            )}
            {eventModalOpen && activeEvent === 'freelance-gig' && (
                <FreelanceGigModal wallet={wallet} setWallet={setWallet} onClose={handleCloseActiveEvent} />
            )}
            {eventModalOpen && activeEvent === 'job-opportunity' && (
                <JobOpportunityModal wallet={wallet} setWallet={setWallet} onClose={handleCloseActiveEvent} />
            )}

            <div
                className={`flex min-h-screen w-full overflow-x-hidden bg-[#f8fafc] transition-all duration-700 ${
                    hasReachedTimelineEnd ? 'pointer-events-none select-none blur-[1px] saturate-90' : ''
                }`}
            >
                <Sidebar
                    wallet={wallet}
                    currentDate={currentDateTime}
                    scenarioId={scenarioId}
                    startingCash={startingCash}
                />
                <div className="min-w-0 flex-1 box-border p-4 xl:p-5">
                    <div className="mx-auto w-full max-w-[1280px]">
                        <Timeline
                            timelineDates={timelineDates}
                            markers={timelineMarkers}
                            currentDate={currentDateTime}
                            onJumpToDate={jumpToDate}
                            skipFlash={skipLabel}
                        />

                        <div className="mt-5">
                            <MainPanel
                                wallet={wallet}
                                setWallet={setWallet}
                                currentDate={currentDateTime}
                                scenarioId={scenarioId}
                                secondsLeft={secondsLeft}
                                onSkip30={skip30Seconds}
                                onSkipDay={skipToNextDay}
                                onSkipFinalMinute={skipToFinalMinute}
                                notifications={notifications}
                                activeToastIds={activeToastIds}
                                historyOpen={historyOpen}
                                onSetHistoryOpen={handleSetHistoryOpen}
                                onDismissToast={handleDismissToast}
                                onBuyNotification={handleBuyNotification}
                                onSellNotification={handleSellNotification}
                                timeControlsDisabled={activeEvent !== null || billingBreakActive}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {gameOver ? <GameOverModal reason={gameOver.reason} onReturnHome={handleReturnHome} /> : null}
        </>
    );
}
