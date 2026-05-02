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
        date: '2007-08-09',
        kind: 'event',
        title: 'Risky Deal',
        eventId: 'risky-deal',
    },
    {
        date: '2007-12-12',
        kind: 'market',
        title: 'Fed opens emergency funding',
        subtitle: 'The Term Auction Facility is announced to ease pressure in bank funding markets.',
    },
    {
        date: '2007-12-12',
        kind: 'event',
        title: 'Daughter Needs Rent Help',
        eventId: 'daughter-rent-help',
    },
    {
        date: '2008-03-16',
        kind: 'market',
        title: 'Bear Stearns rescued',
        subtitle: 'JPMorgan acquires Bear Stearns with Federal Reserve support.',
    },
    {
        date: '2008-03-16',
        kind: 'event',
        title: 'Subprime Lender Collapse',
        eventId: 'subprime-lender-collapse-news',
    },
    {
        date: '2008-03-16',
        kind: 'event',
        title: 'Workstation Failure',
        eventId: 'laptop-failure',
    },
    {
        date: '2008-07-30',
        kind: 'market',
        title: 'Housing rescue law signed',
        subtitle: 'New federal tools aim to steady mortgage markets and protect Fannie and Freddie.',
    },
    {
        date: '2008-09-07',
        kind: 'market',
        title: 'Fannie and Freddie taken over',
        subtitle: 'The U.S. government places the mortgage giants into conservatorship.',
    },
    {
        date: '2008-09-07',
        kind: 'event',
        title: 'Golf Tournament Invitation',
        eventId: 'golf-tournament',
    },
    {
        date: '2008-09-15',
        kind: 'market',
        title: 'Lehman Brothers fails',
        subtitle: 'The bankruptcy intensifies panic across the global financial system.',
    },
    {
        date: '2008-09-15',
        kind: 'event',
        title: 'Tournament Day',
        eventId: 'golf-tournament-day',
    },
    {
        date: '2008-09-16',
        kind: 'market',
        title: 'AIG receives emergency support',
        subtitle: 'Authorities move to contain contagion after the Lehman collapse.',
    },
    {
        date: '2008-09-29',
        kind: 'market',
        title: 'Bailout vote fails',
        subtitle: 'Markets plunge after the first rescue bill is rejected by the House.',
    },
    {
        date: '2008-09-29',
        kind: 'event',
        title: 'Emergency Housing Notice',
        eventId: 'emergency-housing-notice',
    },
    {
        date: '2008-10-03',
        kind: 'market',
        title: 'TARP becomes law',
        subtitle: 'A $700 billion rescue package is approved to stabilize the banking system.',
    },
    {
        date: '2008-11-23',
        kind: 'market',
        title: 'Citigroup receives support',
        subtitle: 'U.S. authorities announce a rescue package for a major bank under pressure.',
    },
    {
        date: '2008-11-23',
        kind: 'event',
        title: 'Banking Crisis Deepens',
        eventId: 'banking-crisis-deepens-news',
    },
    {
        date: '2008-11-23',
        kind: 'event',
        title: 'Client Lawsuit',
        eventId: 'client-lawsuit',
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
        date: '2009-03-09',
        kind: 'event',
        title: 'Apartment Search',
        eventId: 'apartment-search',
    },
    {
        date: '2009-06-01',
        kind: 'market',
        title: 'Stabilization begins',
        subtitle: 'Emergency support starts calming markets, even though households are still under pressure.',
    },
    {
        date: '2009-06-01',
        kind: 'event',
        title: 'Racetrack Wager',
        eventId: 'horse-bets',
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
