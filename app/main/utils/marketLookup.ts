type MarketRow = {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    'adj close': number;
    volume: number;
};


export function getMarketRowAtDate(
    data: MarketRow[],
    targetDate: string
): MarketRow | null {
    if (!data || data.length === 0) return null;

    const sorted = [...data].sort((a, b) =>
        a.date.localeCompare(b.date)
    );

    let last: MarketRow | null = null;

    for (const row of sorted) {
        if (row.date > targetDate) break;
        last = row;
    }

    return last;
}
