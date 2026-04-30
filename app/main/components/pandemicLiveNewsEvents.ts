export type PandemicLiveNewsEvent = {
    id: string;
    date: string;
};

export const PANDEMIC_LIVE_NEWS_EVENTS: PandemicLiveNewsEvent[] = [
    {
        id: 'pandemic-declared',
        date: '2020-03-11',
    },
    {
        id: 'vaccine-announced',
        date: '2020-11-09',
    },
];
