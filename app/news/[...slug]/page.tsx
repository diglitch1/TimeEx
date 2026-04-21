import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGuardianArticleById } from '@/app/lib/guardian';
import {
    DEFAULT_NEWS_DATE,
    buildNewsListHref,
    formatNewsTimestamp,
    normalizeScenarioId,
} from '@/app/lib/news-shared';

type NewsArticlePageProps = {
    params: Promise<{
        slug: string[];
    }>;
    searchParams: Promise<{
        date?: string;
        scenario?: string;
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
    const date = resolvedSearchParams.date ?? DEFAULT_NEWS_DATE;
    const scenario = normalizeScenarioId(resolvedSearchParams.scenario);

    let errorMessage: string | null = null;
    let article: Awaited<ReturnType<typeof getGuardianArticleById>> | null = null;

    try {
        article = await getGuardianArticleById(articleId);
    } catch (error) {
        errorMessage =
            error instanceof Error ? error.message : 'Unable to load this Guardian article.';
    }

    return (
        <main className="min-h-screen bg-[#F8FBFF] px-6 py-10 text-[#0A355B] md:px-10">
            <div className="mx-auto max-w-4xl">
                <Link
                    href={buildNewsListHref(date, scenario)}
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
                            <Image
                                src={article.thumbnailUrl}
                                alt={article.headline}
                                width={1200}
                                height={640}
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

                            {article.standfirstHtml ? (
                                <div
                                    className="mt-6 text-lg leading-relaxed text-[#23496C]"
                                    dangerouslySetInnerHTML={{ __html: article.standfirstHtml }}
                                />
                            ) : null}

                            <div
                                className="guardian-article mt-8"
                                dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
                            />

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
