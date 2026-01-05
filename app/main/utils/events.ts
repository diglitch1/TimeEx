export type GameEvent = {
    id: string;
    date: string; // YYYY-MM-DD
    hour: number; // 0–23
};

export const GAME_EVENTS: GameEvent[] = [
    {
        id: 'apply-for-college',
        date: '2000-03-10',
        hour: 10
    },
    {
        id: 'family-help',
        date: '2000-04-14',
        hour: 14
    },
    {
        id: 'car-insurance',
        date: '2001-01-03',
        hour: 12
    },
    {
        id: 'college-results',
        date: '2001-03-12',
        hour: 11
    },
    {
        id: 'college-party-invite',
        date: '2001-06-18',
        hour: 18
    },
    {
        id: 'party-consequences',
        date: '2001-06-25',
        hour: 9
    },
    {
        id: 'parents-support',
        date: '2001-10-08',
        hour: 16
    },
    {
        id: 'car-crash',
        date: '2002-01-14',
        hour: 20
    },
    {
        id: 'freelance-gig',
        date: '2002-07-21',
        hour: 10
    },
    {
        id: 'job-opportunity',
        date: '2002-10-09',
        hour: 11
    },
];
