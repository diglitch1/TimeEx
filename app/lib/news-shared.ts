import { TIMELINE_DATES } from '@/app/main/utils/timeline';
import { PANDEMIC_TIMELINE_DATES } from '@/app/main/utils/pandemicTimeline';

export type ScenarioId = 'dotcom' | 'housing' | 'pandemic';

export type ScenarioExplainer = {
    title: string;
    href: string;
    description: string;
};

export type ScenarioNewsConfig = {
    label: string;
    query: string;
    explainers: ScenarioExplainer[];
};

export type ScenarioDateNewsConfig = {
    sections: string[];
    keywords: string[];
    fallbackQuery?: string;
};

export type NewsFeedItem = {
    id: string;
    headline: string;
    sectionName: string;
    webPublicationDate: string;
    webUrl: string;
    thumbnailUrl: string | null;
    trailText: string | null;
};

export const DEFAULT_SCENARIO_ID: ScenarioId = 'dotcom';
export const DEFAULT_NEWS_DATE = '1999-08-19';
export const GENERIC_NEWS_ERROR_MESSAGE = 'Unable to load news right now.';
export const SCENARIO_DEFAULT_NEWS_DATE: Record<ScenarioId, string> = {
    dotcom: DEFAULT_NEWS_DATE,
    housing: DEFAULT_NEWS_DATE,
    pandemic: PANDEMIC_TIMELINE_DATES[0],
};
export const SCENARIO_SUPPORTED_NEWS_DATES: Record<ScenarioId, readonly string[]> = {
    dotcom: TIMELINE_DATES,
    housing: TIMELINE_DATES,
    pandemic: PANDEMIC_TIMELINE_DATES,
};
export const SUPPORTED_NEWS_DATES = Array.from(
    new Set(Object.values(SCENARIO_SUPPORTED_NEWS_DATES).flat())
);
const supportedNewsDateSets: Record<ScenarioId, Set<string>> = {
    dotcom: new Set(SCENARIO_SUPPORTED_NEWS_DATES.dotcom),
    housing: new Set(SCENARIO_SUPPORTED_NEWS_DATES.housing),
    pandemic: new Set(SCENARIO_SUPPORTED_NEWS_DATES.pandemic),
};

export const SCENARIO_NEWS_CONFIG: Record<ScenarioId, ScenarioNewsConfig> = {
    dotcom: {
        label: 'Dot-com bubble',
        query: '"internet" OR technology OR tech OR nasdaq OR startup OR dotcom',
        explainers: [
            {
                title: 'Dot-com bubble explained',
                href: 'https://www.investopedia.com/terms/d/dotcom-bubble.asp',
                description: 'A clear overview of why internet stocks surged and why the bubble burst.',
            },
            {
                title: 'Britannica: dot-com bubble',
                href: 'https://www.britannica.com/event/dot-com-bubble',
                description: 'A concise history of the market environment behind the late-1990s mania.',
            },
        ],
    },
    housing: {
        label: 'Global financial crisis',
        query: '"housing market" OR mortgage OR subprime OR bank OR credit',
        explainers: [
            {
                title: 'Financial crisis overview',
                href: 'https://www.investopedia.com/terms/f/financial-crisis.asp',
                description: 'Background on the mortgage-driven crisis and the financial system damage it caused.',
            },
            {
                title: 'Britannica: 2007-2008 financial crisis',
                href: 'https://www.britannica.com/event/financial-crisis-of-2007-2008',
                description: 'A broad explanation of the causes, timeline, and global fallout.',
            },
        ],
    },
    pandemic: {
        label: 'Pandemic market shock',
        query: 'pandemic OR covid OR coronavirus OR lockdown OR vaccine',
        explainers: [
            {
                title: 'Wikipedia: 2020 stock market crash',
                href: 'https://en.wikipedia.org/wiki/2020_stock_market_crash',
                description: 'A detailed timeline of the rapid market selloff during the first COVID shock.',
            },
            {
                title: 'Britannica: COVID-19 pandemic',
                href: 'https://www.britannica.com/event/COVID-19-pandemic',
                description: 'A broad summary of the pandemic backdrop that drove the market disruption.',
            },
        ],
    },
};

export const SCENARIO_DATE_NEWS_CONFIG: Partial<
    Record<ScenarioId, Record<string, ScenarioDateNewsConfig>>
> = {
    dotcom: {
        '1999-08-19': {
            sections: ['business', 'technology', 'money'],
            keywords: ['internet', 'web', 'digital', 'shares', 'rates', 'market', 'technology', 'ondigital', 'bskyb'],
            fallbackQuery: 'internet OR web OR digital OR shares OR rates',
        },
        '1999-12-31': {
            sections: ['business', 'technology'],
            keywords: ['shares', 'market', 'trading', 'cyberspace', 'internet', 'technology', 'year'],
            fallbackQuery: 'shares OR market OR trading OR internet',
        },
        '2000-03-10': {
            sections: ['business', 'technology', 'money'],
            keywords: ['dot.com', 'dotcom', 'net', 'float', 'listings', 'freeserve', 'easynet', 'rates', 'market'],
            fallbackQuery: 'dot.com OR dotcom OR float OR listings OR rates',
        },
        '2000-04-14': {
            sections: ['business', 'money', 'technology'],
            keywords: ['market', 'trackers', 'safety', 'online', 'rates', 'retailers', 'selloff', 'shares'],
            fallbackQuery: 'market OR shares OR rates OR trackers',
        },
        '2001-01-03': {
            sections: ['business', 'technology', 'money'],
            keywords: ['nasdaq', 'stocks', 'dot.com', 'dotcom', 'internet', 'recession', 'euro', 'napster'],
            fallbackQuery: 'nasdaq OR stocks OR dot.com OR recession',
        },
        '2001-03-12': {
            sections: ['business', 'money'],
            keywords: ['bt', 'rights issue', 'market', 'debt', 'shareholders', 'gloom', 'stocks'],
            fallbackQuery: 'bt OR rights issue OR market OR shareholders',
        },
        '2001-09-17': {
            sections: ['business', 'money', 'world'],
            keywords: ['falling market', 'dow', 'rate cut', 'bank', 'policyholders', 'opening', 'market'],
            fallbackQuery: 'dow OR market OR rate cut OR bank',
        },
        '2001-12-02': {
            sections: ['business', 'technology', 'money'],
            keywords: ['enron', 'shockwave', 'steel', 'broadband', 'business', 'atlantic', 'market'],
            fallbackQuery: 'enron OR broadband OR market',
        },
        '2002-07-21': {
            sections: ['business', 'money'],
            keywords: ['worldcom', 'shares', 'greenspan', 'market', 'dip', 'euronext', 'accounting'],
            fallbackQuery: 'worldcom OR shares OR market OR greenspan',
        },
        '2002-10-09': {
            sections: ['business', 'technology', 'money'],
            keywords: ['shareholders', 'jobs', 'slowdown', 'marconi', 'logica', 'buyers', 'market'],
            fallbackQuery: 'shareholders OR jobs OR slowdown OR marconi',
        },
    },
    pandemic: {
        '2020-02-19': {
            sections: ['business', 'world', 'money'],
            keywords: ['virus', 'outbreak', 'markets', 'uncertainty', 'global economy'],
            fallbackQuery: 'virus OR outbreak OR markets OR uncertainty',
        },
        '2020-03-16': {
            sections: ['business', 'world', 'money'],
            keywords: ['lockdown', 'market crash', 'selloff', 'pandemic', 'travel'],
            fallbackQuery: 'lockdown OR market crash OR selloff OR pandemic',
        },
        '2020-03-27': {
            sections: ['business', 'money', 'politics'],
            keywords: ['stimulus', 'rescue package', 'central bank', 'support', 'economy'],
            fallbackQuery: 'stimulus OR rescue package OR central bank OR support',
        },
        '2020-04-20': {
            sections: ['business', 'world', 'money'],
            keywords: ['shutdown', 'oil', 'job losses', 'lockdown', 'economy'],
            fallbackQuery: 'shutdown OR oil OR job losses OR economy',
        },
        '2020-06-08': {
            sections: ['business', 'money'],
            keywords: ['reopening', 'rally', 'recovery', 'stocks', 'stimulus'],
            fallbackQuery: 'reopening OR rally OR recovery OR stocks',
        },
        '2020-09-02': {
            sections: ['business', 'technology', 'money'],
            keywords: ['tech stocks', 'nasdaq', 'growth', 'digital', 'market surge'],
            fallbackQuery: 'tech stocks OR nasdaq OR growth OR digital',
        },
        '2020-11-09': {
            sections: ['business', 'world', 'money'],
            keywords: ['vaccine', 'recovery', 'travel stocks', 'rotation', 'markets'],
            fallbackQuery: 'vaccine OR recovery OR travel stocks OR markets',
        },
        '2021-03-11': {
            sections: ['business', 'money', 'politics'],
            keywords: ['stimulus', 'recovery plan', 'jobs', 'growth', 'consumer spending'],
            fallbackQuery: 'stimulus OR recovery plan OR jobs OR growth',
        },
        '2021-06-15': {
            sections: ['business', 'money', 'world'],
            keywords: ['reopening', 'inflation', 'travel', 'consumer demand', 'recovery'],
            fallbackQuery: 'reopening OR inflation OR travel OR recovery',
        },
        '2021-09-23': {
            sections: ['business', 'money', 'world'],
            keywords: ['supply chain', 'inflation', 'shipping', 'rates', 'market risk'],
            fallbackQuery: 'supply chain OR inflation OR shipping OR market risk',
        },
        '2021-12-31': {
            sections: ['business', 'money', 'technology'],
            keywords: ['year-end markets', 'pandemic economy', 'recovery', 'inflation', 'stocks'],
            fallbackQuery: 'year-end markets OR recovery OR inflation OR stocks',
        },
    },
};

export function normalizeScenarioId(value?: string | null): ScenarioId {
    if (value === 'housing' || value === 'pandemic' || value === 'dotcom') {
        return value;
    }

    return DEFAULT_SCENARIO_ID;
}

export function coerceNewsDate(value?: string | null, scenario?: string | null) {
    const normalizedScenario = normalizeScenarioId(scenario);
    const supportedNewsDateSet = supportedNewsDateSets[normalizedScenario];

    if (value && supportedNewsDateSet.has(value)) {
        return value;
    }

    return SCENARIO_DEFAULT_NEWS_DATE[normalizedScenario];
}

export function clampNewsLimit(value: number, fallback = 3, maxLimit = 6) {
    if (!Number.isFinite(value)) {
        return fallback;
    }

    return Math.min(Math.max(Math.trunc(value), 1), maxLimit);
}

export function formatNewsDateLabel(dateStr: string) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(`${dateStr}T00:00:00`));
}

export function formatNewsTimestamp(isoDate: string) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(isoDate));
}

export function buildNewsListHref(dateStr = DEFAULT_NEWS_DATE, scenario?: string | null) {
    const searchParams = new URLSearchParams();
    const normalizedScenario = normalizeScenarioId(scenario);
    searchParams.set('date', coerceNewsDate(dateStr, normalizedScenario));
    searchParams.set('scenario', normalizedScenario);

    return `/news?${searchParams.toString()}`;
}

export function buildNewsArticleHref(
    articleId: string,
    options?: {
        date?: string;
        scenario?: string | null;
    }
) {
    const searchParams = new URLSearchParams();

    if (options?.date) {
        searchParams.set('date', coerceNewsDate(options.date, options.scenario));
    }

    if (options?.scenario) {
        searchParams.set('scenario', normalizeScenarioId(options.scenario));
    }

    const encodedId = articleId
        .split('/')
        .map(segment => encodeURIComponent(segment))
        .join('/');

    const suffix = searchParams.toString();
    return suffix ? `/news/${encodedId}?${suffix}` : `/news/${encodedId}`;
}
