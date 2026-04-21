import Image from 'next/image';
import Link from 'next/link';
import { getNewsForDate } from '@/app/lib/guardian';
import {
    DEFAULT_NEWS_DATE,
    GENERIC_NEWS_ERROR_MESSAGE,
    SCENARIO_NEWS_CONFIG,
    buildNewsArticleHref,
    coerceNewsDate,
    formatNewsDateLabel,
    formatNewsTimestamp,
    normalizeScenarioId,
} from '@/app/lib/news-shared';

export const dynamic = 'force-dynamic';

type NewsPageProps = {
    searchParams: Promise<{
        date?: string;
        scenario?: string;
    }>;
};

export default async function NewsPage({ searchParams }: NewsPageProps) {
    const resolvedSearchParams = await searchParams;
    const date = coerceNewsDate(resolvedSearchParams.date ?? DEFAULT_NEWS_DATE);
    const scenario = normalizeScenarioId(resolvedSearchParams.scenario);
    const scenarioConfig = SCENARIO_NEWS_CONFIG[scenario];

    let errorMessage: string | null = null;
    let articles = [] as Awaited<ReturnType<typeof getNewsForDate>>;

    try {
        articles = await getNewsForDate(date, scenario, 6);
    } catch {
        errorMessage = GENERIC_NEWS_ERROR_MESSAGE;
    }

    return (
        <main className="min-h-screen bg-[#F6FAFF] px-6 py-10 text-[#0A355B] md:px-10">
            <div className="mx-auto max-w-6xl">
                <Link
                    href={`/main?scenario=${scenario}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"
                >
                    <span aria-hidden>←</span>
                    Back to simulation
                </Link>

                <div className="mt-6 rounded-[28px] border border-[#CFE3F8] bg-white px-6 py-7 shadow-sm md:px-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-500">
                        News archive
                    </p>
                    <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                        {scenarioConfig.label} on {formatNewsDateLabel(date)}
                    </h1>
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#335B7E]">
                        Pick one of the main articles from this simulated day. Each article opens as a
                        full read view, not just a summary card.
                    </p>
                </div>

                {errorMessage ? (
                    <div className="mt-8 rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-5 text-sm text-amber-900">
                        {errorMessage}
                    </div>
                ) : articles.length === 0 ? (
                    <div className="mt-8 rounded-[24px] border border-dashed border-gray-200 bg-white px-5 py-8 text-sm text-gray-500">
                        No Guardian articles matched this scenario on this day.
                    </div>
                ) : (
                    <div className="mt-8 grid gap-5 lg:grid-cols-2">
                        {articles.map(article => (
                            <Link
                                key={article.id}
                                href={buildNewsArticleHref(article.id, { date, scenario })}
                                className="group overflow-hidden rounded-[28px] border border-[#D9E9F8] bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#9CC8F5] hover:shadow-md"
                            >
                                {article.thumbnailUrl ? (
                                    <Image
                                        src={article.thumbnailUrl}
                                        alt={article.headline}
                                        width={800}
                                        height={416}
                                        className="h-52 w-full object-cover"
                                    />
                                ) : null}

                                <div className="px-6 py-5">
                                    <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-500 ${
                                        article.thumbnailUrl ? '' : 'pt-1'
                                    }`}>
                                        {article.sectionName} · {formatNewsTimestamp(article.webPublicationDate)}
                                    </p>
                                    <h2 className="mt-3 text-xl font-bold leading-tight text-[#0A355B] group-hover:text-blue-700">
                                        {article.headline}
                                    </h2>
                                    {article.trailText ? (
                                        <p className="mt-3 text-sm leading-relaxed text-[#456887]">
                                            {article.trailText}
                                        </p>
                                    ) : null}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
