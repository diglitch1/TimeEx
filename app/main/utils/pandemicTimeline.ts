import type { TimelineMarker } from './timeline';

export const PANDEMIC_TIMELINE: TimelineMarker[] = [
    {
        date: '2020-02-18',
        kind: 'market',
        title: 'Orientation day',
        subtitle: 'Diana starts her flight attendant timeline with a day to review the market and her wallet',
    },
    {
        date: '2020-02-19',
        kind: 'market',
        title: 'Pre-crash market peak',
        subtitle: 'U.S. equities close near their high before the COVID selloff begins',
    },
    {
        date: '2020-03-11',
        kind: 'market',
        title: 'WHO declares COVID-19 a pandemic',
        subtitle: 'Global risk sentiment shifts sharply as the outbreak becomes a worldwide crisis',
    },
    {
        date: '2020-03-11',
        kind: 'event',
        title: 'WHO Declares COVID-19 a Global Pandemic',
        eventId: 'pandemic-declared',
    },
    {
        date: '2020-03-27',
        kind: 'market',
        title: 'CARES Act signed',
        subtitle: 'Massive U.S. fiscal support helps steady expectations during the shutdown shock',
    },
    {
        date: '2020-04-20',
        kind: 'market',
        title: 'Oil market shock',
        subtitle: 'U.S. crude futures collapse as lockdown demand destruction peaks',
    },
    {
        date: '2020-05-15',
        kind: 'market',
        title: 'Lockdown rebound watch',
        subtitle: "Today's market context: investors weigh early reopenings against recession risk",
    },
    {
        date: '2020-06-08',
        kind: 'market',
        title: 'Reopening rally',
        subtitle: 'Risk assets push higher as economies reopen and liquidity remains abundant',
    },
    {
        date: '2020-09-02',
        kind: 'market',
        title: 'Big Tech surge',
        subtitle: 'Pandemic winners dominate market leadership as retail and momentum flows build',
    },
    {
        date: '2020-11-09',
        kind: 'market',
        title: 'Pfizer vaccine breakthrough',
        subtitle: 'Vaccine trial results trigger a sharp rotation toward recovery trades',
    },
    {
        date: '2020-11-09',
        kind: 'event',
        title: 'Vaccine Breakthrough Sends Markets Higher',
        eventId: 'vaccine-announced',
    },
    {
        date: '2020-12-14',
        kind: 'market',
        title: 'First U.S. vaccine rollout',
        subtitle: "Today's market context: optimism rises as the vaccination phase begins",
    },
    {
        date: '2021-01-15',
        kind: 'market',
        title: 'Stimulus-driven recovery trade',
        subtitle: 'Markets price in more fiscal support and a stronger reopening year',
    },
    {
        date: '2021-03-11',
        kind: 'market',
        title: 'American Rescue Plan signed',
        subtitle: 'Another major U.S. stimulus package reinforces the growth and inflation narrative',
    },
    {
        date: '2021-03-11',
        kind: 'event',
        title: 'The airline wants you back - on their terms',
        eventId: 'rehiring-offer',
    },
    {
        date: '2021-06-15',
        kind: 'market',
        title: 'Inflation debate intensifies',
        subtitle: 'Investors balance reopening strength against rising price pressures',
    },
    {
        date: '2021-08-23',
        kind: 'market',
        title: 'Delta wave uncertainty',
        subtitle: "Today's market context: the recovery continues, but variant risk tempers confidence",
    },
    {
        date: '2021-09-23',
        kind: 'market',
        title: 'Supply chain strain',
        subtitle: 'Bottlenecks and cost pressures complicate the late-pandemic expansion',
    },
    {
        date: '2021-12-31',
        kind: 'market',
        title: 'Pandemic era year-end',
        subtitle: 'Markets close 2021 with recovery underway, but inflation and variants still unresolved',
    },
];

export const PANDEMIC_TIMELINE_DATES = Array.from(
    new Set(PANDEMIC_TIMELINE.map(marker => marker.date))
).sort();
