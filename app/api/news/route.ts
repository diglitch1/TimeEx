import { NextResponse } from 'next/server';
import {
    getNewsForDate,
    isGuardianConfigurationError,
} from '@/app/lib/guardian';
import { isNewsRateLimited } from '@/app/lib/news-rate-limit';
import {
    DEFAULT_NEWS_DATE,
    GENERIC_NEWS_ERROR_MESSAGE,
    clampNewsLimit,
    coerceNewsDate,
    normalizeScenarioId,
} from '@/app/lib/news-shared';

export async function GET(request: Request) {
    if (isNewsRateLimited(request)) {
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
    } catch (error) {
        return NextResponse.json(
            { articles: [], error: GENERIC_NEWS_ERROR_MESSAGE },
            { status: isGuardianConfigurationError(error) ? 503 : 500 }
        );
    }
}
