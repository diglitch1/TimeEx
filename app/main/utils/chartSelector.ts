import type { AssetMarketData } from './marketData';

export type RangeKey = '1D' | '1W' | '1M' | '6M' | '1Y';

export function getChartData(
    data: AssetMarketData | undefined,
    range: RangeKey
): number[] {
    if (!data) return [];
    if (!data[range]) return [];
    return data[range];
}
