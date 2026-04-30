import type { TimelineMarker } from './timeline';

export const PANDEMIC_TIMELINE: TimelineMarker[] = [
    {
        date: '2020-02-19',
        kind: 'market',
        title: 'Pre-crash peak',
        subtitle: 'Markets remain near record highs before the pandemic shock hits.',
    },
    {
        date: '2020-03-16',
        kind: 'market',
        title: 'Panic selling accelerates',
        subtitle: 'Lockdowns, travel restrictions, and uncertainty trigger one of the fastest selloffs on record.',
    },
    {
        date: '2020-03-27',
        kind: 'market',
        title: 'Stimulus reshapes expectations',
        subtitle: 'Emergency government and central-bank support begins stabilizing market sentiment.',
    },
    {
        date: '2020-04-20',
        kind: 'market',
        title: 'Economy remains frozen',
        subtitle: 'Shutdowns and supply-chain disruption keep pressure on many sectors.',
    },
    {
        date: '2020-06-08',
        kind: 'market',
        title: 'Reopening rally',
        subtitle: 'Markets rebound as reopening hopes and policy support boost confidence.',
    },
    {
        date: '2020-09-02',
        kind: 'market',
        title: 'Tech leads the recovery',
        subtitle: 'Digital and stay-at-home winners dominate the next phase of the rebound.',
    },
    {
        date: '2020-11-09',
        kind: 'market',
        title: 'Vaccine optimism',
        subtitle: 'Positive vaccine news strengthens the case for a broader economic recovery.',
    },
    {
        date: '2021-03-11',
        kind: 'market',
        title: 'Recovery support expands',
        subtitle: 'Additional stimulus reinforces hiring, spending, and recovery expectations.',
    },
    {
        date: '2021-06-15',
        kind: 'market',
        title: 'Reopening momentum',
        subtitle: 'Travel, consumer demand, and business activity improve, though unevenly.',
    },
    {
        date: '2021-09-23',
        kind: 'market',
        title: 'Supply strains emerge',
        subtitle: 'Inflation worries and supply-chain problems become a bigger market theme.',
    },
    {
        date: '2021-12-31',
        kind: 'market',
        title: 'Late-cycle recovery',
        subtitle: 'The pandemic shock has faded, but the recovery now carries new risks and tradeoffs.',
    },
];

export const PANDEMIC_TIMELINE_DATES = Array.from(
    new Set(PANDEMIC_TIMELINE.map(marker => marker.date))
);
