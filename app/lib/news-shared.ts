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
};

export function normalizeScenarioId(value?: string | null): ScenarioId {
    if (value === 'housing' || value === 'pandemic' || value === 'dotcom') {
        return value;
    }

    return DEFAULT_SCENARIO_ID;
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
    searchParams.set('date', dateStr);
    searchParams.set('scenario', normalizeScenarioId(scenario));

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
        searchParams.set('date', options.date);
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
