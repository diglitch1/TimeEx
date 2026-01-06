'use client';

import { useEffect, useState } from 'react';
import { INITIAL_WALLET, type WalletItem } from './utils/walletData';
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
    const [activeEvent, setActiveEvent] = useState<string | null>(null);
    const [triggeredEvents, setTriggeredEvents] = useState<string[]>([]);


    const timelineDates = TIMELINE_DATES.map(d => new Date(d));
    const jumpToDate = (dateStr: string) => {
        const idx = TIMELINE_DATES.indexOf(dateStr);
        if (idx === -1) return;
        setGameSeconds(idx * TOTAL_SECONDS); // jump to start of that day
    };

    const TOTAL_SECONDS = 12 * 60;

    const [gameSeconds, setGameSeconds] = useState(0);


    const dayIndex = Math.min(
        Math.floor(gameSeconds / TOTAL_SECONDS),
        timelineDates.length - 1
    );
    const REAL_SECONDS_PER_DAY = 12 * 60; // 720
    const GAME_MINUTES_PER_DAY = 24 * 60; // 1440

    const GAME_MINUTES_PER_REAL_SECOND =
        GAME_MINUTES_PER_DAY / REAL_SECONDS_PER_DAY; // = 2

    const baseDate = timelineDates[dayIndex];

// 12 real minutes = 24 in-game hours
// → 1 real second = 2 in-game minutes
    const inGameMinutesPerSecond = 2;

    const secondsIntoDay = gameSeconds % TOTAL_SECONDS;
    const inGameMinutes = secondsIntoDay * inGameMinutesPerSecond;
    const [wallet, setWallet] = useState<WalletItem[]>(INITIAL_WALLET);
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
    }, [currentDateTime, gameHour, triggeredEvents, attendedCollegeParty]);

    const skip30Seconds = () => {
        setGameSeconds(s => s + 30);
    };


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
            <div className="flex min-h-screen w-full bg-gray-50">
                <Sidebar
                    wallet={wallet}
                    watchlist={watchlist}
                    setWatchlist={setWatchlist}
                />                <div className="flex-1 p-6">
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
