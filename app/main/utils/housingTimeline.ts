import type { TimelineMarker } from './timeline';

export const HOUSING_TIMELINE: TimelineMarker[] = [
    {
        date: '2007-04-02',
        kind: 'market',
        title: 'Subprime lender collapses',
        subtitle: 'New Century Financial files for bankruptcy as mortgage stress becomes impossible to ignore.',
    },
    {
        date: '2007-08-09',
        kind: 'market',
        title: 'Credit markets seize up',
        subtitle: 'Mortgage-linked losses spill into global funding markets and confidence breaks.',
    },
    {
        date: '2008-03-16',
        kind: 'market',
        title: 'Bear Stearns rescued',
        subtitle: 'JPMorgan acquires Bear Stearns with Federal Reserve support.',
    },
    {
        date: '2008-09-07',
        kind: 'market',
        title: 'Fannie and Freddie taken over',
        subtitle: 'The U.S. government places the mortgage giants into conservatorship.',
    },
    {
        date: '2008-09-15',
        kind: 'market',
        title: 'Lehman Brothers fails',
        subtitle: 'The bankruptcy intensifies panic across the global financial system.',
    },
    {
        date: '2008-09-16',
        kind: 'market',
        title: 'AIG receives emergency support',
        subtitle: 'Authorities move to contain contagion after the Lehman collapse.',
    },
    {
        date: '2008-10-03',
        kind: 'market',
        title: 'TARP becomes law',
        subtitle: 'A $700 billion rescue package is approved to stabilize the banking system.',
    },
    {
        date: '2008-12-16',
        kind: 'market',
        title: 'Rates cut near zero',
        subtitle: 'The Fed pushes policy to crisis levels as recession deepens.',
    },
    {
        date: '2009-03-09',
        kind: 'market',
        title: 'Stocks hit their low',
        subtitle: 'After months of panic, U.S. equities finally bottom out.',
    },
    {
        date: '2009-06-01',
        kind: 'market',
        title: 'Stabilization begins',
        subtitle: 'Emergency support starts calming markets, even though households are still under pressure.',
    },
    {
        date: '2009-12-31',
        kind: 'market',
        title: 'Aftershocks remain',
        subtitle: 'The panic phase ends, but the crisis leaves a weaker economy and lasting distrust.',
    },
];

export const HOUSING_TIMELINE_DATES = Array.from(
    new Set(HOUSING_TIMELINE.map(marker => marker.date))
);
