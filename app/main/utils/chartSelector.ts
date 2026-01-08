export type RangeKey = '1D' | '1W' | '1M' | '6M' | '1Y';

export type MarketRow = {
    date: string;
    close: number;
    'adj close'?: number;
};

export function getChartData(
    data: MarketRow[],
    range: RangeKey,
    dateStr: string
): MarketRow[] {
    if (!data.length) return [];

    const RANGE_DAYS: Record<RangeKey, number> = {
        '1D': 1,
        '1W': 7,
        '1M': 31,
        '6M': 182,
        '1Y': 365,
    };

    return data
        .filter(d => d.date <= dateStr)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-RANGE_DAYS[range]);
}
