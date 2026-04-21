import { clearGameOver, saveStartingCash, saveWallet } from './walletStorage';

const RESETTABLE_STORAGE_KEYS = [
    'timeline',
    'events',
    'triggeredEvents',
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
    localStorage.setItem('gameStarted', 'true');
}
