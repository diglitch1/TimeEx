import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGuardianArticleById } from '@/app/lib/guardian';
import {
    GENERIC_NEWS_ERROR_MESSAGE,
    DEFAULT_NEWS_DATE,
    SCENARIO_DEFAULT_NEWS_DATE,
    buildNewsListHrefWithOptions,
    coerceNewsDate,
    formatNewsTimestamp,
    normalizeScenarioId,
} from '@/app/lib/news-shared';

export const dynamic = 'force-dynamic';

type NewsArticlePageProps = {
    params: Promise<{
        slug: string[];
    }>;
    searchParams: Promise<{
        date?: string;
        scenario?: string;
        character?: string;
    }>;
};

export default async function NewsArticlePage({
    params,
    searchParams,
}: NewsArticlePageProps) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const slug = resolvedParams.slug ?? [];

    if (slug.length === 0) {
        notFound();
    }

    const articleId = slug.map(segment => decodeURIComponent(segment)).join('/');
    const scenario = normalizeScenarioId(resolvedSearchParams.scenario);
    const character = resolvedSearchParams.character ?? null;
    const date = coerceNewsDate(
        resolvedSearchParams.date ?? SCENARIO_DEFAULT_NEWS_DATE[scenario] ?? DEFAULT_NEWS_DATE,
        scenario
    );

    let errorMessage: string | null = null;
    let article: Awaited<ReturnType<typeof getGuardianArticleById>> | null = null;

    try {
        article = await getGuardianArticleById(articleId);
    } catch {
        errorMessage = GENERIC_NEWS_ERROR_MESSAGE;
    }

    return (
        <main className="min-h-screen bg-[#F8FBFF] px-6 py-10 text-[#0A355B] md:px-10">
            <div className="mx-auto max-w-4xl">
                <Link
                    href={buildNewsListHrefWithOptions(date, { scenario, character })}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"
                >
                    <span aria-hidden>←</span>
                    Back to daily news
                </Link>

                {errorMessage || !article ? (
                    <div className="mt-8 rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-5 text-sm text-amber-900">
                        {errorMessage ?? 'Article not found.'}
                    </div>
                ) : (
                    <article className="mt-8 overflow-hidden rounded-[32px] border border-[#D9E9F8] bg-white shadow-sm">
                        {article.thumbnailUrl ? (
                            <img
                                src={article.thumbnailUrl}
                                alt={article.headline}
                                className="h-72 w-full object-cover"
                            />
                        ) : null}

                        <div className="px-6 py-8 md:px-10">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-500">
                                {article.sectionName} · {formatNewsTimestamp(article.webPublicationDate)}
                            </p>
                            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0A355B] md:text-4xl">
                                {article.headline}
                            </h1>

                            <div className="mt-4 flex flex-wrap gap-3 text-sm text-[#456887]">
                                {article.byline ? <span>{article.byline}</span> : null}
                                {article.publication ? <span>{article.publication}</span> : null}
                                {article.lastModified ? (
                                    <span>Updated {formatNewsTimestamp(article.lastModified)}</span>
                                ) : null}
                            </div>

                            {article.standfirstText ? (
                                <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-[#23496C]">
                                    {article.standfirstText}
                                </p>
                            ) : null}

                            <div className="guardian-article mt-8">
                                {article.bodyBlocks.map((block, index) => (
                                    <p key={`${article.id}-block-${index}`} className="whitespace-pre-line">
                                        {block}
                                    </p>
                                ))}
                            </div>

                            <div className="mt-8 border-t border-[#E4EEF8] pt-5 text-sm text-[#456887]">
                                <a
                                    href={article.webUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-semibold text-blue-700 hover:underline"
                                >
                                    Open the original Guardian page
                                </a>
                            </div>
                        </div>
                    </article>
                )}
            </div>
        </main>
    );
}
