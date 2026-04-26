import { NextResponse } from 'next/server';
import {
    getGuardianArticleById,
    isGuardianConfigurationError,
} from '@/app/lib/guardian';
import { isNewsRateLimited } from '@/app/lib/news-rate-limit';
import { GENERIC_NEWS_ERROR_MESSAGE } from '@/app/lib/news-shared';

type NewsArticleRouteContext = {
    params: Promise<{
        slug?: string[];
    }>;
};

export async function GET(request: Request, { params }: NewsArticleRouteContext) {
    if (isNewsRateLimited(request)) {
        return NextResponse.json(
            { article: null, error: 'Too many news requests. Please wait a minute and try again.' },
            { status: 429 }
        );
    }

    const resolvedParams = await params;
    const articleId = (resolvedParams.slug ?? [])
        .map(segment => decodeURIComponent(segment))
        .join('/');

    if (!articleId) {
        return NextResponse.json(
            { article: null, error: 'Article id is required.' },
            { status: 400 }
        );
    }

    try {
        const article = await getGuardianArticleById(articleId);
        return NextResponse.json({ article });
    } catch (error) {
        return NextResponse.json(
            { article: null, error: GENERIC_NEWS_ERROR_MESSAGE },
            { status: isGuardianConfigurationError(error) ? 503 : 500 }
        );
    }
}
