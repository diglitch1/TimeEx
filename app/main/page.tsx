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
    const DAY_DURATION_SECONDS = 6 * 60;
    const DAY_START_MINUTES = 2 * 60;
    const DAY_END_MINUTES = (24 * 60) - 1;

    const [mounted, setMounted] = useState(false);

    const STARTING_CASH = 7000;

    const [activeEvent, setActiveEvent] = useState<string | null>(null);
    const [triggeredEvents, setTriggeredEvents] = useState<string[]>([]);


    const timelineDates = TIMELINE_DATES.map(d => new Date(d));
    const jumpToDate = (dateStr: string) => {
        const idx = TIMELINE_DATES.indexOf(dateStr);
        if (idx === -1) return;
        setGameSeconds(idx * TOTAL_SECONDS); // jump to start of that day
    };

    const TOTAL_SECONDS = DAY_DURATION_SECONDS;

    const [gameSeconds, setGameSeconds] = useState(0);


    const dayIndex = Math.min(
        Math.floor(gameSeconds / TOTAL_SECONDS),
        timelineDates.length - 1
    );
    const baseDate = timelineDates[dayIndex];

    const secondsIntoDay = gameSeconds % TOTAL_SECONDS;
    const playableMinutes = DAY_END_MINUTES - DAY_START_MINUTES;
    const dayProgress =
        TOTAL_SECONDS <= 1 ? 0 : secondsIntoDay / (TOTAL_SECONDS - 1);
    const inGameMinutes =
        DAY_START_MINUTES + Math.round(dayProgress * playableMinutes);

    const [wallet, setWallet] = useState<WalletItem[]>(() => {
        const isNewGame = localStorage.getItem('newGame') === 'true';

        if (isNewGame) {
            localStorage.removeItem('newGame'); // consume flag

            const freshWallet = [
                {
                    id: 'cash',
                    label: 'Cash',
                    units: STARTING_CASH,
                    unitLabel: '$',
                    usdValue: STARTING_CASH,
                },
            ];

            saveWallet(freshWallet);
            return freshWallet;
        }

        const stored = loadWallet();
        if (stored) return stored;

        return [
            {
                id: 'cash',
                label: 'Cash',
                units: STARTING_CASH,
                unitLabel: '$',
                usdValue: STARTING_CASH,
            },
        ];
    });


    const [watchlist, setWatchlist] = useState<string[]>([
        'SOL',
        'GOLD',
        'TSLA',
        'NVDA',
        'ADA',
    ]);
// build full in-game datetime
    const currentDateTime = new Date(baseDate);
    currentDateTime.setHours(0, 0, 0, 0);
    currentDateTime.setMinutes(inGameMinutes);

// derive hour from the actual in-game time
    const gameHour = currentDateTime.getHours();


    const secondsLeft = TOTAL_SECONDS - secondsIntoDay;


    const attendedCollegeParty = (() => {
        try {
            const raw = localStorage.getItem('collegeParty');
            if (!raw) return false;
            return JSON.parse(raw).attended === true;
        } catch {
            return false;
        }
    })();
    const acceptedGig = (() => {
        try {
            const raw = localStorage.getItem('freelanceGig');
            if (!raw) return false;
            return JSON.parse(raw).accepted === true;
        } catch {
            return false;
        }
    })();
    useEffect(() => {
        const interval = setInterval(() => {
            setGameSeconds(s => s + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const dateStr = currentDateTime.toISOString().split('T')[0];

        GAME_EVENTS.forEach(event => {
            if (
                triggeredEvents.includes(event.id) ||
                event.date !== dateStr
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
    }, [currentDateTime, triggeredEvents, attendedCollegeParty, acceptedGig]);

    const skip30Seconds = () => {
        setGameSeconds(s => s + 30);
    };

    const skipToNextDay = () => {
        setGameSeconds(current => {
            const nextDayStart = (Math.floor(current / TOTAL_SECONDS) + 1) * TOTAL_SECONDS;
            const lastDayStart = (timelineDates.length - 1) * TOTAL_SECONDS;
            return Math.min(nextDayStart, lastDayStart);
        });
    };

    useEffect(() => {
        saveWallet(wallet);
    }, [wallet]);

    function getAssetPrice(symbol: string): number {

        return 0;
    }

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

            {/* MAIN PAGE LAYOUT */}
            <div className="flex min-h-screen w-full bg-[#f8fafc]">
                <Sidebar
                    wallet={wallet}
                    watchlist={watchlist}
                    setWatchlist={setWatchlist}
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
                            />
                        </div>
                    </div>
                </div>
            </div>


        </>
    );
}
