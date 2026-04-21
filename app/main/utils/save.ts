import { saveWallet } from './walletStorage';
import { resetRunStats } from './runStats';

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
    localStorage.removeItem('timeline');
    localStorage.removeItem('events');
    localStorage.removeItem('triggeredEvents');
    localStorage.removeItem('gameOver');
    localStorage.setItem('gameStarted', 'true');
    resetRunStats(startingCash);
}
