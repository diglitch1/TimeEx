export type GameEvent = {
    id: string;
    date: string; // YYYY-MM-DD
    hour: number; // 0–23
};

export const GAME_EVENTS: GameEvent[] = [
    {
        id: 'apply-for-college',
        date: '2000-03-21',
        hour: 10,
    },
    {
        id: 'family-help',
        date: '2000-03-25',
        hour: 14,
    },
    {
        id: 'car-insurance',
        date: '2000-03-30',
        hour: 16,
    },
    {
        id: 'college-results',
        date: '2000-04-04',
        hour: 12,
    },
    {
        id: 'college-party-invite',
        date: '2000-04-09',
        hour: 10,
    },
    {
        id: 'party-consequences',
        date: '2000-04-14',
        hour: 6,
    },
    {
        id: 'parents-support',
        date: '2000-04-19',
        hour: 13,
    },
    {
        id: 'car-crash',
        date: '2000-04-24',
        hour: 20
    },

];
