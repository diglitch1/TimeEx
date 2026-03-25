export function resetGame(startingCash: number) {
    localStorage.setItem(
        'wallet',
        JSON.stringify([
            {
                id: 'cash',
                label: 'Cash',
                units: startingCash,
                unitLabel: '$',
                usdValue: startingCash,
            },
        ])
    );

    localStorage.removeItem('timeline');
    localStorage.removeItem('events');
    localStorage.removeItem('triggeredEvents');
    localStorage.setItem('gameStarted', 'true');
}
