export type TimelineKind = 'market' | 'event';

export type TimelineMarker = {
    date: string; // YYYY-MM-DD
    kind: TimelineKind;
    title: string;
    subtitle?: string;
    eventId?: string;
};

export const TIMELINE: TimelineMarker[] = [
    // ---- 1999: buildup ----
    {
        date: '1999-08-19',
        kind: 'market',
        title: 'Dot-com enthusiasm accelerates',
        subtitle: 'Tech IPOs surge, valuations stretch',
    },
    {
        date: '1999-12-31',
        kind: 'market',
        title: 'Millennium optimism',
        subtitle: 'Markets close the year at record confidence',
    },

    // ---- 2000: peak & break ----
    {
        date: '2000-03-10',
        kind: 'market',
        title: 'NASDAQ peaks',
        subtitle: 'Speculation reaches its limit',
    },
    {
        date: '2000-03-10',
        kind: 'event',
        title: 'Apply for college',
        eventId: 'apply-for-college',
    },

    {
        date: '2000-04-14',
        kind: 'market',
        title: 'Tech selloff begins',
        subtitle: 'Confidence starts to crack',
    },
    {
        date: '2000-04-14',
        kind: 'event',
        title: 'Dot-Com Reality Check',
        eventId: 'dot-com-reality-check',
    },
    {
        date: '2000-04-14',
        kind: 'event',
        title: 'Family help',
        eventId: 'family-help',
    },

    // ---- 2001: instability ----
    {
        date: '2001-01-03',
        kind: 'market',
        title: 'Emergency rate cut',
        subtitle: 'Federal Reserve reacts to slowdown',
    },
    {
        date: '2001-01-03',
        kind: 'event',
        title: 'Car insurance',
        eventId: 'car-insurance',
    },

    {
        date: '2001-03-12',
        kind: 'market',
        title: 'Bear market confirmed',
        subtitle: 'Tech stocks down sharply from peak',
    },
    {
        date: '2001-03-12',
        kind: 'event',
        title: 'College results',
        eventId: 'college-results',
    },

    {
        date: '2001-06-18',
        kind: 'event',
        title: 'College party invite',
        eventId: 'college-party-invite',
    },
    {
        date: '2001-06-25',
        kind: 'event',
        title: 'Party consequences',
        eventId: 'party-consequences',
    },
    {
        date: '2001-09-11',
        kind: 'market',
        title: 'Markets closed after September 11 attacks',
        subtitle: 'Terrorist attacks in the U.S. halt all trading',
    },
    {
        date: '2001-09-17',
        kind: 'market',
        title: 'Markets reopen after 9/11',
        subtitle: 'Severe uncertainty returns',
    },
    {
        date: '2001-10-08',
        kind: 'event',
        title: 'Parents support',
        eventId: 'parents-support',
    },

    // ---- 2002: collapse ----
    {
        date: '2001-12-02',
        kind: 'market',
        title: 'Enron bankruptcy',
        subtitle: 'Corporate trust erodes',
    },

    {
        date: '2002-01-14',
        kind: 'event',
        title: 'Car crash',
        eventId: 'car-crash',
    },

    {
        date: '2002-07-21',
        kind: 'market',
        title: 'WorldCom collapses',
        subtitle: 'Accounting scandals peak',
    },
    {
        date: '2002-07-21',
        kind: 'event',
        title: 'Freelance gig',
        eventId: 'freelance-gig',
    },

    {
        date: '2002-10-09',
        kind: 'market',
        title: 'NASDAQ bottom',
        subtitle: 'Dot-com crash reaches its low',
    },
    {
        date: '2002-10-09',
        kind: 'event',
        title: 'Job opportunity',
        eventId: 'job-opportunity',
    },
];

export const TIMELINE_DATES = Array.from(
    new Set(TIMELINE.map(m => m.date))
).sort();

export const TIMELINE_EVENT_MARKERS =
    TIMELINE.filter(m => m.kind === 'event' && m.eventId);
