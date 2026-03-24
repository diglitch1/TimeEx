import { findIndexAtOrBeforeDate } from './findIndexAtOrBeforeDate';

export type RangeKey = '1W' | '1M' | '6M' | '1Y';

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
        '1W': 7,
        '1M': 31,
        '6M': 182,
        '1Y': 365,
    };

    const endIndex = findIndexAtOrBeforeDate(data, dateStr);

    if (endIndex < 0) return [];

    const length = RANGE_DAYS[range];
    const startIndex = Math.max(0, endIndex - length + 1);

    return data.slice(startIndex, endIndex + 1);
}
