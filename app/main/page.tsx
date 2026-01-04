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

export default function MainPage() {
    const [activeEvent, setActiveEvent] = useState<string | null>(null);
    const [triggeredEvents, setTriggeredEvents] = useState<string[]>([]);

    const [wallet, setWallet] = useState<WalletItem[]>(INITIAL_WALLET);

    const timelineDates = [
        new Date('2000-03-06'),
        new Date('2000-03-21'),
        new Date('2000-03-25'),
        new Date('2000-03-30'),
        new Date('2000-04-04'),
        new Date('2000-04-09'),
        new Date('2000-04-14'),
        new Date('2000-04-19'),


    ];

    const TOTAL_SECONDS = 12 * 60;

    const [gameSeconds, setGameSeconds] = useState(0);


    const dayIndex = Math.min(
        Math.floor(gameSeconds / TOTAL_SECONDS),
        timelineDates.length - 1
    );

    const currentDate = timelineDates[dayIndex];

    const secondsIntoDay = gameSeconds % TOTAL_SECONDS;
    const secondsLeft = TOTAL_SECONDS - secondsIntoDay;

    const gameHour = Math.min(
        Math.floor(secondsIntoDay / 30),
        23
    );
    const attendedCollegeParty = (() => {
        try {
            const raw = localStorage.getItem('collegeParty');
            if (!raw) return false;
            return JSON.parse(raw).attended === true;
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

    // 🎯 EVENT TRIGGER
    useEffect(() => {
        const dateStr = currentDate.toISOString().split('T')[0];

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

            setActiveEvent(event.id);
            setTriggeredEvents(prev => [...prev, event.id]);
        });
    }, [currentDate, gameHour, triggeredEvents, attendedCollegeParty]);

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

            {/* MAIN PAGE LAYOUT */}
            <div className="flex min-h-screen w-full bg-gray-50">
                <Sidebar wallet={wallet}/>
                <MainPanel
                    wallet={wallet}
                    currentDate={currentDate}
                    secondsLeft={secondsLeft}
                    gameHour={gameHour}
                    onSkip30={skip30Seconds}
                />

            </div>
        </>
    );
}
