"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
    buildNewsArticleHref,
    buildNewsListHrefWithOptions,
    formatNewsTimestamp,
    type NewsFeedItem,
} from '@/app/lib/news-shared';

type NewsApiResponse = {
    articles: NewsFeedItem[];
    error?: string;
};

export default function DailyNewsFeed({
    dateStr,
    scenarioId,
    characterId,
}: {
    dateStr: string;
    scenarioId: string;
    characterId?: string | null;
}) {
    const [articles, setArticles] = useState<NewsFeedItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function loadArticles() {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `/api/news?date=${encodeURIComponent(dateStr)}&scenario=${encodeURIComponent(scenarioId)}&limit=3`
                );
                const payload = (await response.json()) as NewsApiResponse;

                if (!response.ok) {
                    throw new Error(payload.error ?? 'Unable to load the news feed.');
                }

                if (!cancelled) {
                    setArticles(payload.articles ?? []);
                }
            } catch (fetchError) {
                if (!cancelled) {
                    setArticles([]);
                    setError(
                        fetchError instanceof Error
                            ? fetchError.message
                            : 'Unable to load the news feed.'
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadArticles();

        return () => {
            cancelled = true;
        };
    }, [dateStr, scenarioId]);

    return (
        <div className="space-y-4">
            {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                    <div
                        key={`news-skeleton-${index}`}
                        className="flex items-start gap-4 rounded-[22px] border border-gray-100 bg-gray-50 px-3 py-3"
                    >
                        <div className="h-16 w-16 animate-pulse rounded-[18px] bg-gray-200" />
                        <div className="min-w-0 flex-1 space-y-2 pt-1">
                            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                            <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
                            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                        </div>
                    </div>
                ))
            ) : error ? (
                <div className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
                    {error}
                </div>
            ) : articles.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
                    No relevant news was found for this day.
                </div>
            ) : (
                articles.map(article => (
                    <Link
                        key={article.id}
                        href={buildNewsArticleHref(article.id, {
                            date: dateStr,
                            scenario: scenarioId,
                            character: characterId,
                        })}
                        className="flex items-start gap-4 rounded-[22px] border border-transparent px-2 py-2 transition hover:border-blue-100 hover:bg-blue-50/60"
                    >
                        <img
                            src={article.thumbnailUrl ?? '/images/newspaper.jpg'}
                            alt={article.headline}
                            className="h-16 w-16 rounded-[18px] object-cover"
                        />

                        <div className="min-w-0">
                            <p className="text-sm font-medium leading-snug text-gray-900">
                                {article.headline}
                            </p>
                            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                                {article.sectionName} · {formatNewsTimestamp(article.webPublicationDate)}
                            </p>
                        </div>
                    </Link>
                ))
            )}

            <Link
                href={buildNewsListHrefWithOptions(dateStr, {
                    scenario: scenarioId,
                    character: characterId,
                })}
                className="mt-5 block w-full rounded-full border border-gray-200 bg-white py-3 text-center text-sm font-semibold text-gray-700 transition hover:border-blue-200 hover:text-blue-600"
            >
                Read More
            </Link>
        </div>
    );
}
