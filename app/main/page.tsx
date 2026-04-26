'use client';
import DotComRealityCheckModal from './components/DotComRealityCheckModal';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import {
    getAssetsWithMarket,
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
const DAY_END_MINUTES = (24 * 60) - 1;
const TOTAL_SECONDS = DAY_DURATION_SECONDS;
const TIMELINE_DATE_OBJECTS = TIMELINE_DATES.map(date => new Date(date));
const FINAL_MINUTE_START_SECONDS =
    (TIMELINE_DATE_OBJECTS.length - 1) * TOTAL_SECONDS + Math.max(TOTAL_SECONDS - 60, 0);
const TIMELINE_STORAGE_KEY = 'timeline';
const TRIGGERED_EVENTS_STORAGE_KEY = 'triggeredEvents';
const END_GAME_REDIRECT_DELAY_MS = 2200;

function getWalletTotalValue(wallet: WalletItem[]) {
    return wallet.reduce((sum, item) => sum + item.usdValue, 0);
}

function readStoredDecision(key: string, property: string) {
    const parsed = readStoredJson<Record<string, unknown>>(key);
    return parsed?.[property] === true;
}

function readStoredGameSeconds() {
    if (typeof window === 'undefined') return 0;

    try {
        const raw = localStorage.getItem(TIMELINE_STORAGE_KEY);
        if (!raw) return 0;

        const parsed = Number.parseInt(raw, 10);
        if (!Number.isFinite(parsed) || parsed < 0) return 0;

        const lastDayStart = (TIMELINE_DATE_OBJECTS.length - 1) * TOTAL_SECONDS;
        return Math.min(parsed, lastDayStart);
    } catch {
        return 0;
    }
}

function readStoredTriggeredEvents() {
    if (typeof window === 'undefined') return [];

    try {
        const raw = localStorage.getItem(TRIGGERED_EVENTS_STORAGE_KEY);
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
    const [mounted, setMounted] = useState(false);
    const searchParams = useSearchParams();
    const [startingCash] = useState(() => loadStartingCash(DEFAULT_STARTING_CASH));

    const [triggeredEvents, setTriggeredEvents] = useState<string[]>(readStoredTriggeredEvents);
    const [gameOver, setGameOver] = useState(loadGameOver);
    const [notifications, setNotifications] = useState<GameNotification[]>([]);
    const [activeToastIds, setActiveToastIds] = useState<string[]>([]);
    const [historyOpen, setHistoryOpen] = useState(false);
    const notificationCounter = useRef(0);
    const notificationsRef = useRef<GameNotification[]>([]);
    const historyOpenRef = useRef(false);
    const walletRef = useRef<WalletItem[]>([]);
    const runStatsRef = useRef<RunStats>(createRunStats(startingCash));
    const activeEventSnapshotRef = useRef<{
        id: string;
        walletValue: number;
    } | null>(null);
    const endGameHandledRef = useRef(false);

    const jumpToDate = (dateStr: string) => {
        const idx = TIMELINE_DATES.indexOf(dateStr);
        if (idx === -1) return;
        setGameSeconds(idx * TOTAL_SECONDS); // jump to start of that day
    };

    const [gameSeconds, setGameSeconds] = useState(readStoredGameSeconds);


    const dayIndex = Math.min(
        Math.floor(gameSeconds / TOTAL_SECONDS),
        TIMELINE_DATE_OBJECTS.length - 1
    );
    const baseDate = TIMELINE_DATE_OBJECTS[dayIndex];

    const secondsIntoDay = gameSeconds % TOTAL_SECONDS;
    const playableMinutes = DAY_END_MINUTES - DAY_START_MINUTES;
    const dayProgress =
        TOTAL_SECONDS <= 1 ? 0 : secondsIntoDay / (TOTAL_SECONDS - 1);
    const inGameMinutes =
        DAY_START_MINUTES + Math.round(dayProgress * playableMinutes);
    const hasReachedTimelineEnd =
        !gameOver &&
        dayIndex === TIMELINE_DATE_OBJECTS.length - 1 &&
        secondsIntoDay >= TOTAL_SECONDS - 1;

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

    const gameHour = currentDateTime.getHours();
    const currentDateKey = toLocalDateStr(currentDateTime);
    const dayStartTime = new Date(baseDate);
    dayStartTime.setHours(0, 0, 0, 0);
    dayStartTime.setMinutes(DAY_START_MINUTES);
    const dayStartTimestampLabel = formatNotificationTimestamp(dayStartTime);
    const secondsLeft = TOTAL_SECONDS - secondsIntoDay;

    const attendedCollegeParty = readStoredDecision('collegeParty', 'attended');
    const acceptedGig = readStoredDecision('freelanceGig', 'accepted');

    const pushNotification = useCallback((draft: NotificationDraft) => {
        if (draft.sourceKey && notificationsRef.current.some(notification => notification.sourceKey === draft.sourceKey)) {
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

    const handleBuyNotification = useCallback((details: {
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
    }, [pushNotification]);

    const handleSellNotification = useCallback((details: {
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
    }, [pushNotification]);

    const activeEvent = gameOver ? null : GAME_EVENTS.find(event => {
        if (event.date !== currentDateKey) return false;
        if (triggeredEvents.includes(event.id)) return false;
        return canTriggerEvent(event.id, attendedCollegeParty, acceptedGig);
    })?.id ?? null;

    const handleCloseActiveEvent = useCallback(() => {
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

        setTriggeredEvents(prev =>
            prev.includes(activeEvent) ? prev : [...prev, activeEvent]
        );
    }, [activeEvent, currentDateTime]);

    const handleGameOver = useCallback((reason: string) => {
        if (activeEvent) {
            setTriggeredEvents(prev =>
                prev.includes(activeEvent) ? prev : [...prev, activeEvent]
            );
        }

        setGameOver(saveGameOver(reason));
    }, [activeEvent]);

    useEffect(() => {
        if (gameOver || hasReachedTimelineEnd) return;

        const interval = setInterval(() => {
            setGameSeconds(s => s + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [gameOver, hasReachedTimelineEnd]);

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
        const ownedStocks = walletRef.current.filter(item =>
            item.id !== 'cash' &&
            item.id !== 'car' &&
            item.units > 0
        );

        if (ownedStocks.length === 0 || gameOver) return;

        const marketBySymbol = new Map(
            getAssetsWithMarket(currentDateKey, 4)
                .filter((asset): asset is AssetWithData => asset.hasData && asset.previous !== null)
                .map(asset => [asset.symbol, asset])
        );

        ownedStocks.forEach(item => {
            const asset = marketBySymbol.get(item.label);
            if (!asset) return;

            pushNotification(
                buildDailyMoveNotification(
                    asset,
                    item.units,
                    currentDateKey,
                    dayStartTimestampLabel
                )
            );
        });
    }, [currentDateKey, dayStartTimestampLabel, gameOver, pushNotification]);

    const skip30Seconds = () => {
        setGameSeconds(s => s + 30);
    };

    const skipToNextDay = () => {
        setGameSeconds(current => {
            const nextDayStart = (Math.floor(current / TOTAL_SECONDS) + 1) * TOTAL_SECONDS;
            const lastDayStart = (TIMELINE_DATE_OBJECTS.length - 1) * TOTAL_SECONDS;
            return Math.min(nextDayStart, lastDayStart);
        });
    };

    const skipToFinalMinute = () => {
        setGameSeconds(current => Math.max(current, FINAL_MINUTE_START_SECONDS));
    };

    useEffect(() => {
        saveWallet(wallet);
    }, [wallet]);

    useEffect(() => {
        localStorage.setItem(TIMELINE_STORAGE_KEY, String(gameSeconds));
    }, [gameSeconds]);

    useEffect(() => {
        localStorage.setItem(
            TRIGGERED_EVENTS_STORAGE_KEY,
            JSON.stringify(triggeredEvents)
        );
    }, [triggeredEvents]);

    useEffect(() => {
        runStatsRef.current = loadRunStats() ?? createRunStats(startingCash);
    }, [startingCash]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const router = useRouter();
    const scenarioId = normalizeScenarioId(searchParams.get('scenario'));

    const handleReturnHome = useCallback(() => {
        clearGameOver();
        localStorage.removeItem('gameStarted');
        router.replace('/');
    }, [router]);

    useEffect(() => {
        const started = localStorage.getItem('gameStarted');
        if (!started) {
            router.replace('/'); // 👈 kick them back
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

            {/* GLOBAL EVENT MODAL */}
            {!hasReachedTimelineEnd && activeEvent === 'dot-com-frenzy' && (
                <DotComFrenzyModal
                    onClose={handleCloseActiveEvent}
                />
            )}
            {!hasReachedTimelineEnd && activeEvent === 'apply-for-college' && (
                <ApplyForCollegeModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={handleCloseActiveEvent}
                />
            )}
            {!hasReachedTimelineEnd && activeEvent === 'dot-com-reality-check' && (
                <DotComRealityCheckModal
                    onClose={handleCloseActiveEvent}
                />
            )}
            {!hasReachedTimelineEnd && activeEvent === 'family-help' && (
                <FamilyHelpModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={handleCloseActiveEvent}
                />
            )}
            {!hasReachedTimelineEnd && activeEvent === 'car-insurance' && (
                <CarInsuranceModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={handleCloseActiveEvent}
                />
            )}
            {!hasReachedTimelineEnd && activeEvent === 'college-results' && (
                <CollegeResultsModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={handleCloseActiveEvent}
                />

            )}
            {!hasReachedTimelineEnd && activeEvent === 'college-party-invite' && (
                <CollegePartyInvite
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={handleCloseActiveEvent}
                />
            )}
            {!hasReachedTimelineEnd && activeEvent === 'party-consequences' && (
                <PartyConsequencesModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={handleCloseActiveEvent}
                    onGameOver={handleGameOver}
                />
            )}
            {!hasReachedTimelineEnd && activeEvent === 'parents-support' && (
                <ParentsSupportModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={handleCloseActiveEvent}
                />
            )}
            {!hasReachedTimelineEnd && activeEvent === 'car-crash' && (
                <CarCrashModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={handleCloseActiveEvent}
                    onGameOver={handleGameOver}
                />
            )}
            {!hasReachedTimelineEnd && activeEvent === 'freelance-gig' && (
                <FreelanceGigModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={handleCloseActiveEvent}
                />
            )}
            {!hasReachedTimelineEnd && activeEvent === 'job-opportunity' && (
                <JobOpportunityModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={handleCloseActiveEvent}
                />
            )}

            {/* MAIN PAGE LAYOUT */}
            <div className={`flex min-h-screen w-full bg-[#f8fafc] transition-all duration-700 ${
                hasReachedTimelineEnd ? 'pointer-events-none select-none blur-[1px] saturate-90' : ''
            }`}>
                <Sidebar
                    wallet={wallet}
                    currentDate={currentDateTime}
                    scenarioId={scenarioId}
                    startingCash={startingCash}
                />
                <div className="flex-1 p-6">
                    <div className="mx-auto w-full max-w-[1420px]">
                        <Timeline
                            timelineDates={TIMELINE_DATES}
                            markers={TIMELINE}
                            currentDate={currentDateTime}
                            onJumpToDate={jumpToDate}
                        />

                        <div className="mt-6">
                            <MainPanel
                                wallet={wallet}
                                setWallet={setWallet}
                                currentDate={currentDateTime}
                                secondsLeft={secondsLeft}
                                gameHour={gameHour}
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
                            />
                        </div>
                    </div>
                </div>
            </div>
            {gameOver ? (
                <GameOverModal
                    reason={gameOver.reason}
                    onReturnHome={handleReturnHome}
                />
            ) : null}


        </>
    );
}
