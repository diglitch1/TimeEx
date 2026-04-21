import { NextResponse } from 'next/server';
import { getNewsForDate } from '@/app/lib/guardian';
import { DEFAULT_NEWS_DATE } from '@/app/lib/news-shared';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') ?? DEFAULT_NEWS_DATE;
    const scenario = searchParams.get('scenario');
    const limitParam = Number.parseInt(searchParams.get('limit') ?? '3', 10);
    const limit = Number.isFinite(limitParam) ? limitParam : 3;

    try {
        const articles = await getNewsForDate(date, scenario, limit);
        return NextResponse.json({ articles });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Unable to load news for this date.';

        return NextResponse.json({ articles: [], error: message }, { status: 500 });
    }
}
