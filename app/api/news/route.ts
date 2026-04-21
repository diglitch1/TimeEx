import { NextResponse } from 'next/server';
import { getNewsForDate } from '@/app/lib/guardian';
import {
    DEFAULT_NEWS_DATE,
    GENERIC_NEWS_ERROR_MESSAGE,
    clampNewsLimit,
    coerceNewsDate,
    normalizeScenarioId,
} from '@/app/lib/news-shared';

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;
const rateLimitStore = new Map<string, number[]>();

function getClientKey(request: Request) {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0]?.trim() || 'anonymous';
    }

    return request.headers.get('x-real-ip') ?? 'anonymous';
}

function isRateLimited(clientKey: string) {
    const now = Date.now();
    const recentRequests = (rateLimitStore.get(clientKey) ?? []).filter(
        timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS
    );

    recentRequests.push(now);
    rateLimitStore.set(clientKey, recentRequests);

    return recentRequests.length > MAX_REQUESTS_PER_WINDOW;
}

export async function GET(request: Request) {
    const clientKey = getClientKey(request);

    if (isRateLimited(clientKey)) {
        return NextResponse.json(
            { articles: [], error: 'Too many news requests. Please wait a minute and try again.' },
            { status: 429 }
        );
    }

    const { searchParams } = new URL(request.url);
    const date = coerceNewsDate(searchParams.get('date') ?? DEFAULT_NEWS_DATE);
    const scenario = normalizeScenarioId(searchParams.get('scenario'));
    const limitParam = Number.parseInt(searchParams.get('limit') ?? '3', 10);
    const limit = clampNewsLimit(limitParam, 3, 6);

    try {
        const articles = await getNewsForDate(date, scenario, limit);
        return NextResponse.json({ articles });
    } catch {
        return NextResponse.json(
            { articles: [], error: GENERIC_NEWS_ERROR_MESSAGE },
            { status: 500 }
        );
    }
}
