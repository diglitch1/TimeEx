export type PandemicLiveNewsEvent = {
    id: string;
    date: string;
};

export const PANDEMIC_LIVE_NEWS_EVENTS: PandemicLiveNewsEvent[] = [
    {
        id: 'route-assignment',
        date: '2020-02-19',
    },
    {
        id: 'sick-passenger',
        date: '2020-03-11',
    },
    {
        id: 'pandemic-declared',
        date: '2020-03-11',
    },
    {
        id: 'goodbye-party',
        date: '2020-03-27',
    },
    {
        id: 'covid-test',
        date: '2020-04-20',
    },
    {
        id: 'vaccine-announced',
        date: '2020-11-09',
    },
];
