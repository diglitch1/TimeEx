import 'server-only';

import {
    SCENARIO_DATE_NEWS_CONFIG,
    SCENARIO_NEWS_CONFIG,
    normalizeScenarioId,
    type NewsFeedItem,
} from './news-shared';

const GUARDIAN_API_URL = 'https://content.guardianapis.com';
const LIST_FIELDS = 'headline,trailText,standfirst,thumbnail,shortUrl,byline,publication,lastModified';
const ARTICLE_FIELDS = 'headline,trailText,standfirst,body,thumbnail,shortUrl,byline,publication,lastModified';

type GuardianSearchResult = {
    id: string;
    sectionName?: string;
    webPublicationDate: string;
    webTitle: string;
    webUrl: string;
    fields?: {
        headline?: string;
        trailText?: string;
        standfirst?: string;
        thumbnail?: string;
        shortUrl?: string;
        byline?: string;
        publication?: string;
        body?: string;
        lastModified?: string;
    };
};

type GuardianApiResponse = {
    response?: {
        status?: string;
        results?: GuardianSearchResult[];
        content?: GuardianSearchResult;
    };
};

export type GuardianArticle = {
    id: string;
    headline: string;
    sectionName: string;
    webPublicationDate: string;
    webUrl: string;
    thumbnailUrl: string | null;
    trailText: string | null;
    standfirstText: string | null;
    bodyBlocks: string[];
    byline: string | null;
    publication: string | null;
    shortUrl: string | null;
    lastModified: string | null;
};

export class GuardianConfigurationError extends Error {
    constructor() {
        super('Guardian API key not found. Set GUARDIAN_API_KEY as a private server environment variable.');
        this.name = 'GuardianConfigurationError';
    }
}

export function isGuardianConfigurationError(error: unknown) {
    return error instanceof GuardianConfigurationError;
}

function decodeHtmlEntities(value: string) {
    return value
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#(\d+);/g, (_, code: string) => {
            const parsed = Number.parseInt(code, 10);
            return Number.isFinite(parsed) ? String.fromCodePoint(parsed) : _;
        })
        .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => {
            const parsed = Number.parseInt(code, 16);
            return Number.isFinite(parsed) ? String.fromCodePoint(parsed) : _;
        });
}

function stripHtml(value?: string | null) {
    if (!value) return null;

    return decodeHtmlEntities(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function htmlToTextBlocks(html?: string | null) {
    if (!html) return [];

    const normalized = html
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<(li)\b[^>]*>/gi, '• ')
        .replace(/<\/li>/gi, '\n')
        .replace(/<\/(p|div|section|article|blockquote|figure|figcaption|h1|h2|h3|h4|h5|h6|ul|ol)>/gi, '\n\n')
        .replace(/<[^>]+>/g, '');

    const decoded = decodeHtmlEntities(normalized)
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n[ \t]+/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    return decoded
        .split(/\n{2,}/)
        .map(block => block.trim())
        .filter(Boolean);
}

export function getGuardianApiKey() {
    const directValue = process.env.GUARDIAN_API_KEY?.trim();

    if (directValue) {
        return directValue;
    }

    throw new GuardianConfigurationError();
}

async function fetchGuardianJson(url: URL) {
    const apiKey = getGuardianApiKey();
    url.searchParams.set('api-key', apiKey);
    url.searchParams.set('format', 'json');

    const response = await fetch(url.toString(), {
        next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) {
        throw new Error(`Guardian request failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as GuardianApiResponse;

    if (payload.response?.status !== 'ok') {
        throw new Error('Guardian API did not return an ok response.');
    }

    return payload;
}

function mapGuardianSearchResult(result: GuardianSearchResult): NewsFeedItem {
    return {
        id: result.id,
        headline: stripHtml(result.fields?.headline) ?? result.webTitle,
        sectionName: result.sectionName ?? 'News',
        webPublicationDate: result.webPublicationDate,
        webUrl: result.webUrl,
        thumbnailUrl: result.fields?.thumbnail ?? null,
        trailText: stripHtml(result.fields?.trailText ?? result.fields?.standfirst),
    };
}

const SECTION_WEIGHTS: Record<string, number> = {
    business: 8,
    technology: 6,
    money: 5,
    world: 3,
};

const BAD_HEADLINE_PATTERNS = [
    /\bobituary\b/i,
    /\bletters\b/i,
    /\bmedia diary\b/i,
    /\bcity briefing\b/i,
    /\bweek in view\b/i,
    /\bchatroom\b/i,
    /\bweb watch\b/i,
    /\bweblife\b/i,
    /\bthe issue explained\b/i,
    /\bthe basics\b/i,
    /\bwhat they're reading\b/i,
    /\bmammon\b/i,
    /\bthe small ads\b/i,
];

function countKeywordMatches(text: string, keywords: string[]) {
    const lowerText = text.toLowerCase();

    return keywords.reduce((count, keyword) => {
        return lowerText.includes(keyword.toLowerCase()) ? count + 1 : count;
    }, 0);
}

function scoreNewsCandidate(
    article: NewsFeedItem,
    scenarioKeywords: string[],
    dateKeywords: string[]
) {
    const headline = article.headline.toLowerCase();
    const trailText = (article.trailText ?? '').toLowerCase();
    const combinedText = `${headline} ${trailText}`;
    const sectionId = article.sectionName.toLowerCase();

    let score = 0;

    score += Object.entries(SECTION_WEIGHTS).reduce((best, [section, sectionWeight]) => {
        return sectionId.includes(section) ? Math.max(best, sectionWeight) : best;
    }, 0);

    score += countKeywordMatches(headline, dateKeywords) * 7;
    score += countKeywordMatches(trailText, dateKeywords) * 3;
    score += countKeywordMatches(headline, scenarioKeywords) * 3;
    score += countKeywordMatches(trailText, scenarioKeywords);

    if (/\bmarket\b|\bshares\b|\bstocks\b|\brate\b|\bnasdaq\b|\bdow\b|\bdot\.?com\b|\binternet\b/i.test(combinedText)) {
        score += 4;
    }

    if (/\bwhat to do\b|\bfind safety\b|\bimpacts\b|\bdecline\b|\bthreatens\b|\bdeepens\b|\bstruggles\b|\bcut\b/i.test(combinedText)) {
        score += 3;
    }

    if (BAD_HEADLINE_PATTERNS.some(pattern => pattern.test(article.headline))) {
        score -= 12;
    }

    if (article.headline.split(' ').length <= 2) {
        score -= 4;
    }

    return score;
}

async function searchGuardianForDate({
    date,
    limit,
    query,
    orderBy,
    section,
}: {
    date: string;
    limit: number;
    query?: string;
    orderBy: 'newest' | 'relevance';
    section?: string;
}) {
    const url = new URL('/search', GUARDIAN_API_URL);
    url.searchParams.set('from-date', date);
    url.searchParams.set('to-date', date);
    url.searchParams.set('use-date', 'published');
    url.searchParams.set('page-size', String(limit));
    url.searchParams.set('show-fields', LIST_FIELDS);
    url.searchParams.set('query-fields', 'headline,trailText,body');
    url.searchParams.set('order-by', orderBy);
    url.searchParams.set('show-elements', 'image');
    if (section) {
        url.searchParams.set('section', section);
    }

    if (query) {
        url.searchParams.set('q', query);
    }

    const payload = await fetchGuardianJson(url);
    const results = payload.response?.results ?? [];

    return results.map(mapGuardianSearchResult).filter(article => Boolean(article.headline));
}

export async function getNewsForDate(date: string, scenarioInput?: string | null, limit = 6) {
    const scenario = normalizeScenarioId(scenarioInput);
    const scenarioConfig = SCENARIO_NEWS_CONFIG[scenario];
    const dateConfig = SCENARIO_DATE_NEWS_CONFIG[scenario]?.[date];
    const clampedLimit = Math.min(Math.max(limit, 1), 12);
    const scenarioKeywords = scenarioConfig.query
        .split(/\s+OR\s+/i)
        .map(keyword => keyword.replace(/^"|"$/g, '').trim())
        .filter(Boolean);

    if (dateConfig) {
        const sectionResults = await Promise.all(
            dateConfig.sections.map(section =>
                searchGuardianForDate({
                    date,
                    limit: 12,
                    orderBy: 'newest',
                    section,
                })
            )
        );

        const fallbackQueryResults = dateConfig.fallbackQuery
            ? await searchGuardianForDate({
                date,
                limit: 10,
                query: dateConfig.fallbackQuery,
                orderBy: 'relevance',
            })
            : [];

        const rankedResults = [...sectionResults.flat(), ...fallbackQueryResults]
            .filter(
                (article, index, allArticles) =>
                    allArticles.findIndex(candidate => candidate.id === article.id) === index
            )
            .map(article => ({
                article,
                score: scoreNewsCandidate(article, scenarioKeywords, dateConfig.keywords),
            }))
            .filter(entry => entry.score > 0)
            .sort((left, right) => right.score - left.score)
            .map(entry => entry.article);

        if (rankedResults.length >= clampedLimit) {
            return rankedResults.slice(0, clampedLimit);
        }

        const broadFallbackResults = await searchGuardianForDate({
            date,
            limit: 12,
            query: scenarioConfig.query,
            orderBy: 'relevance',
        });

        const mergedResults = [...rankedResults, ...broadFallbackResults].filter(
            (article, index, allArticles) =>
                allArticles.findIndex(candidate => candidate.id === article.id) === index
        );

        return mergedResults.slice(0, clampedLimit);
    }

    const primaryResults = await searchGuardianForDate({
        date,
        limit: clampedLimit,
        query: scenarioConfig.query,
        orderBy: 'relevance',
    });

    if (primaryResults.length >= clampedLimit) {
        return primaryResults.slice(0, clampedLimit);
    }

    const fallbackResults = await searchGuardianForDate({
        date,
        limit: Math.max(clampedLimit * 2, 8),
        orderBy: 'newest',
    });

    const mergedResults = [...primaryResults, ...fallbackResults].filter(
        (article, index, allArticles) =>
            allArticles.findIndex(candidate => candidate.id === article.id) === index
    );

    return mergedResults.slice(0, clampedLimit);
}

export async function getGuardianArticleById(articleId: string) {
    const url = new URL(`/${articleId}`, GUARDIAN_API_URL);
    url.searchParams.set('show-fields', ARTICLE_FIELDS);
    url.searchParams.set('show-elements', 'image');

    const payload = await fetchGuardianJson(url);
    const content = payload.response?.content;

    if (!content) {
        throw new Error(`Guardian article not found for id "${articleId}".`);
    }

    const standfirstBlocks = htmlToTextBlocks(content.fields?.standfirst);
    const bodyBlocks = htmlToTextBlocks(content.fields?.body);

    return {
        id: content.id,
        headline: stripHtml(content.fields?.headline) ?? content.webTitle,
        sectionName: content.sectionName ?? 'News',
        webPublicationDate: content.webPublicationDate,
        webUrl: content.webUrl,
        thumbnailUrl: content.fields?.thumbnail ?? null,
        trailText: stripHtml(content.fields?.trailText ?? content.fields?.standfirst),
        standfirstText: standfirstBlocks.join('\n\n') || null,
        bodyBlocks,
        byline: stripHtml(content.fields?.byline),
        publication: stripHtml(content.fields?.publication),
        shortUrl: content.fields?.shortUrl ?? null,
        lastModified: content.fields?.lastModified ?? null,
    } satisfies GuardianArticle;
}
