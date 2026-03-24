'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { WalletItem } from './utils/walletData';
import { loadWallet, saveWallet } from './utils/walletStorage';

import { useRouter } from 'next/navigation';
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
import Timeline from './components/Timeline';
import { TIMELINE, TIMELINE_DATES } from './utils/timeline';
import {
    getAssetsWithMarket,
    toLocalDateStr,
    type AssetWithData,
} from './utils/marketData';
import type {
    GameNotification,
    NotificationDraft,
    NotificationTone,
} from './utils/notifications';

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
const STARTING_CASH = 7000;
const DEFAULT_WATCHLIST = ['SOL', 'GOLD', 'TSLA', 'NVDA', 'ADA'];
const TIMELINE_DATE_OBJECTS = TIMELINE_DATES.map(date => new Date(date));

function readStoredDecision(key: string, property: string) {
    if (typeof window === 'undefined') return false;

    try {
        const raw = localStorage.getItem(key);
        if (!raw) return false;
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        return parsed[property] === true;
    } catch {
        return false;
    }
}

export default function MainPage() {
    const [mounted, setMounted] = useState(false);

    const [triggeredEvents, setTriggeredEvents] = useState<string[]>([]);
    const [notifications, setNotifications] = useState<GameNotification[]>([]);
    const [activeToastIds, setActiveToastIds] = useState<string[]>([]);
    const [historyOpen, setHistoryOpen] = useState(false);
    const notificationCounter = useRef(0);
    const notificationsRef = useRef<GameNotification[]>([]);
    const historyOpenRef = useRef(false);
    const walletRef = useRef<WalletItem[]>([]);

    const jumpToDate = (dateStr: string) => {
        const idx = TIMELINE_DATES.indexOf(dateStr);
        if (idx === -1) return;
        setGameSeconds(idx * TOTAL_SECONDS); // jump to start of that day
    };

    const [gameSeconds, setGameSeconds] = useState(0);


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

    const [wallet, setWallet] = useState<WalletItem[]>(() => {
        if (typeof window === 'undefined') {
            return createStartingWallet(STARTING_CASH);
        }

        const isNewGame = localStorage.getItem('newGame') === 'true';

        if (isNewGame) {
            localStorage.removeItem('newGame'); // consume flag

            const freshWallet = createStartingWallet(STARTING_CASH);

            saveWallet(freshWallet);
            return freshWallet;
        }

        const stored = loadWallet();
        if (stored) return stored;

        return createStartingWallet(STARTING_CASH);
    });
    const [watchlist, setWatchlist] = useState<string[]>(DEFAULT_WATCHLIST);

    const currentDateTime = new Date(baseDate);
    currentDateTime.setHours(0, 0, 0, 0);
    currentDateTime.setMinutes(inGameMinutes);

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

    const activeEvent = GAME_EVENTS.find(event => {
        if (event.date !== currentDateKey) return false;
        if (triggeredEvents.includes(event.id)) return false;
        return canTriggerEvent(event.id, attendedCollegeParty, acceptedGig);
    })?.id ?? null;

    const handleCloseActiveEvent = useCallback(() => {
        if (!activeEvent) return;

        setTriggeredEvents(prev =>
            prev.includes(activeEvent) ? prev : [...prev, activeEvent]
        );
    }, [activeEvent]);

    useEffect(() => {
        const interval = setInterval(() => {
            setGameSeconds(s => s + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

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
        const ownedStocks = walletRef.current.filter(item =>
            item.id !== 'cash' &&
            item.id !== 'car' &&
            item.units > 0
        );

        if (ownedStocks.length === 0) return;

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
    }, [currentDateKey, dayStartTimestampLabel, pushNotification]);

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

    useEffect(() => {
        saveWallet(wallet);
    }, [wallet]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const router = useRouter();

    useEffect(() => {
        const started = localStorage.getItem('gameStarted');
        if (!started) {
            router.replace('/'); // 👈 kick them back
        }
    }, [router]);

    if (!mounted) return null;

    return (
        <>
            {/* GLOBAL EVENT MODAL */}
            {activeEvent === 'apply-for-college' && (
                <ApplyForCollegeModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={handleCloseActiveEvent}
                />
            )}

            {activeEvent === 'family-help' && (
                <FamilyHelpModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={handleCloseActiveEvent}
                />
            )}
            {activeEvent === 'car-insurance' && (
                <CarInsuranceModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={handleCloseActiveEvent}
                />
            )}
            {activeEvent === 'college-results' && (
                <CollegeResultsModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={handleCloseActiveEvent}
                />

            )}
            {activeEvent === 'college-party-invite' && (
                <CollegePartyInvite
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={handleCloseActiveEvent}
                />
            )}
            {activeEvent === 'party-consequences' && (
                <PartyConsequencesModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={handleCloseActiveEvent}
                />
            )}
            {activeEvent === 'parents-support' && (
                <ParentsSupportModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={handleCloseActiveEvent}
                />
            )}
            {activeEvent === 'car-crash' && (
                <CarCrashModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={handleCloseActiveEvent}
                />
            )}
            {activeEvent === 'freelance-gig' && (
                <FreelanceGigModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={handleCloseActiveEvent}
                />
            )}
            {activeEvent === 'job-opportunity' && (
                <JobOpportunityModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={handleCloseActiveEvent}
                />
            )}

            {/* MAIN PAGE LAYOUT */}
            <div className="flex min-h-screen w-full bg-[#f8fafc]">
                <Sidebar
                    wallet={wallet}
                    watchlist={watchlist}
                    setWatchlist={setWatchlist}
                    currentDate={currentDateTime}
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


        </>
    );
}
