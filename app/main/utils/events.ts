export type GameEvent = {
    id: string;
    date: string; // YYYY-MM-DD
    hour: number; // 0–23
};

export const GAME_EVENTS: GameEvent[] = [
    {
        id: 'family-help',
        date: '2000-03-21',
        hour: 14,
    },
];
