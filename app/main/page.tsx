'use client';

import { useEffect, useState } from 'react';
import type { WalletItem } from './utils/walletData';
import { loadWallet, saveWallet } from './utils/walletStorage';

import { useRouter } from 'next/navigation';
import Sidebar from './components/sidebar';
import MainPanel from './components/mainPanel';
import { GAME_EVENTS } from './utils/events';
import FamilyHelpModal from './components/familyHelp';
import ApplyForCollegeModal from "@/app/main/components/ApplyForCollege";
import CarInsuranceModal from "@/app/main/components/CarInsurance";
import CollegeResultsModal from "@/app/main/components/CollegeResults";
import CollegePartyInvite from "@/app/main/components/CollegePartyInvite";
import PartyConsequencesModal from "@/app/main/components/CollegePartyConsequences";
import ParentsSupportModal from "@/app/main/components/ParentsSupport";
import CarCrashModal from "@/app/main/components/CarCrash";
import FreelanceGigModal from "@/app/main/components/FreelanceGig";
import JobOpportunityModal from "@/app/main/components/JobOpportunity";
import Timeline from "@/app/main/components/Timeline";
import { TIMELINE, TIMELINE_DATES } from './utils/timeline';

export default function MainPage() {
    const [mounted, setMounted] = useState(false);
    const [wallet, setWallet] = useState<WalletItem[]>([]);
    const [walletReady, setWalletReady] = useState(false);

    const [activeEvent, setActiveEvent] = useState<string | null>(null);
    const [triggeredEvents, setTriggeredEvents] = useState<string[]>([]);
    const [watchlist, setWatchlist] = useState<string[]>([
        'SOL',
        'GOLD',
        'TSLA',
        'NVDA',
        'ADA',
    ]);

    const router = useRouter();

    const TOTAL_SECONDS = 12 * 60;
    const [gameSeconds, setGameSeconds] = useState(0);

    const timelineDates = TIMELINE_DATES.map(d => new Date(d));

    const jumpToDate = (dateStr: string) => {
        const idx = TIMELINE_DATES.indexOf(dateStr);
        if (idx === -1) return;
        setGameSeconds(idx * TOTAL_SECONDS);
    };

    const dayIndex = Math.min(
        Math.floor(gameSeconds / TOTAL_SECONDS),
        timelineDates.length - 1
    );

    const baseDate = timelineDates[dayIndex];
    const inGameMinutesPerSecond = 2;
    const secondsIntoDay = gameSeconds % TOTAL_SECONDS;
    const inGameMinutes = secondsIntoDay * inGameMinutesPerSecond;

    const currentDateTime = new Date(baseDate);
    currentDateTime.setHours(0, 0, 0, 0);
    currentDateTime.setMinutes(inGameMinutes);

    const gameHour = currentDateTime.getHours();
    const secondsLeft = TOTAL_SECONDS - secondsIntoDay;

    const attendedCollegeParty =
        mounted &&
        (() => {
            try {
                const raw = localStorage.getItem('collegeParty');
                if (!raw) return false;
                return JSON.parse(raw).attended === true;
            } catch {
                return false;
            }
        })();

    const acceptedGig =
        mounted &&
        (() => {
            try {
                const raw = localStorage.getItem('freelanceGig');
                if (!raw) return false;
                return JSON.parse(raw).accepted === true;
            } catch {
                return false;
            }
        })();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;

        if (nav?.type === 'reload') {
            localStorage.setItem('newGame', 'true');
            localStorage.removeItem('gameStarted');
            window.location.href = '/';
        }
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const isNewGame = localStorage.getItem('newGame') === 'true';

        let finalWallet: WalletItem[];

        if (isNewGame) {
            localStorage.removeItem('newGame');

            const storedCash = Number(localStorage.getItem('startingCash')) || 7000;

            finalWallet = [
                {
                    id: 'cash',
                    label: 'Cash',
                    units: storedCash,
                    unitLabel: '$',
                    usdValue: storedCash,
                },
            ];

            saveWallet(finalWallet);
        } else {
            const stored = loadWallet();

            finalWallet = stored && stored.length > 0
                ? stored
                : [
                    {
                        id: 'cash',
                        label: 'Cash',
                        units: 7000,
                        unitLabel: '$',
                        usdValue: 7000,
                    },
                ];
        }

        setWallet(finalWallet);
        setWalletReady(true);
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const started = localStorage.getItem('gameStarted');
        if (!started) {
            router.replace('/');
        }
    }, [router, mounted]);

    useEffect(() => {
        const interval = setInterval(() => {
            setGameSeconds(s => s + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const dateStr = currentDateTime.toISOString().split('T')[0];

        GAME_EVENTS.forEach(event => {
            if (
                triggeredEvents.includes(event.id) ||
                event.date !== dateStr ||
                event.hour !== gameHour
            ) {
                return;
            }

            if (event.id === 'party-consequences' && !attendedCollegeParty) {
                return;
            }

            if (event.id === 'job-opportunity' && !acceptedGig) {
                return;
            }

            setActiveEvent(event.id);
            setTriggeredEvents(prev => [...prev, event.id]);
        });
    }, [
        currentDateTime,
        gameHour,
        triggeredEvents,
        attendedCollegeParty,
        acceptedGig,
        mounted,
    ]);

    useEffect(() => {
        if (!walletReady || wallet.length === 0) return;
        saveWallet(wallet);
    }, [wallet, walletReady]);

    const skip30Seconds = () => {
        setGameSeconds(s => s + 30);
    };

    if (!mounted || !walletReady) return null;

    return (
        <>
            {activeEvent === 'apply-for-college' && (
                <ApplyForCollegeModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={() => setActiveEvent(null)}
                />
            )}

            {activeEvent === 'family-help' && (
                <FamilyHelpModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={() => setActiveEvent(null)}
                />
            )}

            {activeEvent === 'car-insurance' && (
                <CarInsuranceModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={() => setActiveEvent(null)}
                />
            )}

            {activeEvent === 'college-results' && (
                <CollegeResultsModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={() => setActiveEvent(null)}
                />
            )}

            {activeEvent === 'college-party-invite' && (
                <CollegePartyInvite
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={() => setActiveEvent(null)}
                />
            )}

            {activeEvent === 'party-consequences' && (
                <PartyConsequencesModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={() => setActiveEvent(null)}
                />
            )}

            {activeEvent === 'parents-support' && (
                <ParentsSupportModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={() => setActiveEvent(null)}
                />
            )}

            {activeEvent === 'car-crash' && (
                <CarCrashModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={() => setActiveEvent(null)}
                />
            )}

            {activeEvent === 'freelance-gig' && (
                <FreelanceGigModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={() => setActiveEvent(null)}
                />
            )}

            {activeEvent === 'job-opportunity' && (
                <JobOpportunityModal
                    wallet={wallet}
                    setWallet={setWallet}
                    onClose={() => setActiveEvent(null)}
                />
            )}

            <div className="flex min-h-screen w-full bg-gray-50">
                <Sidebar
                    wallet={wallet}
                    watchlist={watchlist}
                    setWatchlist={setWatchlist}
                />

                <div className="flex-1 p-6">
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
                        />
                    </div>
                </div>
            </div>
        </>
    );
}