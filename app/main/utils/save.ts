import { clearGameOver, saveStartingCash, saveWallet } from './walletStorage';
import { clearRunStats, resetRunStats } from './runStats';

const RESETTABLE_STORAGE_KEYS = [
    'timeline',
    'timeline:dotcom',
    'timeline:housing',
    'timeline:pandemic',
    'events',
    'triggeredEvents',
    'triggeredEvents:dotcom',
    'triggeredEvents:housing',
    'triggeredEvents:pandemic',
    'collegeParty',
    'familyHelpEvent',
    'partyConsequences',
    'collegeApplication',
    'collegeResult',
    'carInsurance',
    'parentsSupport',
    'carCrash',
    'freelanceGig',
    'jobOpportunity',
    'jobOpportunityResult',
    'riskyDeal',
    'daughterRentHelp',
    'laptopFailure',
    'golfTournament',
    'golfTournamentDay',
    'emergencyHousingNotice',
    'dotComFrenzy',
    'dotComRealityCheck',
    'partyTroubleUnlocked',
    'newGame',
] as const;

export function resetGame(startingCash: number) {
    saveWallet([
        {
            id: 'cash',
            label: 'Cash',
            units: startingCash,
            unitLabel: '$',
            usdValue: startingCash,
        },
    ]);

    saveStartingCash(startingCash);

    RESETTABLE_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
    clearGameOver();
    clearRunStats();
    resetRunStats(startingCash);
    localStorage.setItem('gameStarted', 'true');
}
