const NEWS_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_NEWS_REQUESTS_PER_WINDOW = 30;
const newsRateLimitStore = new Map<string, number[]>();

function getClientKey(request: Request) {
    const forwardedFor = request.headers.get('x-forwarded-for');

    if (forwardedFor) {
        return forwardedFor.split(',')[0]?.trim() || 'anonymous';
    }

    return request.headers.get('x-real-ip') ?? 'anonymous';
}

export function isNewsRateLimited(request: Request) {
    const clientKey = getClientKey(request);
    const now = Date.now();
    const recentRequests = (newsRateLimitStore.get(clientKey) ?? []).filter(
        timestamp => now - timestamp < NEWS_RATE_LIMIT_WINDOW_MS
    );

    recentRequests.push(now);
    newsRateLimitStore.set(clientKey, recentRequests);

    return recentRequests.length > MAX_NEWS_REQUESTS_PER_WINDOW;
}
