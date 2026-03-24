import ERIC from '../data/ERIC.json';
import IBM from '../data/IBM.json';
import INTC from '../data/INTC.json';
import MSFT from '../data/MSFT.json';
import NOK from '../data/nok.json';
import ORCL from '../data/ORCL.json';

export type MarketRow = {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    'adj close'?: number;
    volume: number;
};

type AssetBase = {
    symbol: string;
    name: string;
    data: MarketRow[];
};

export type AssetWithoutData = AssetBase & {
    hasData: false;
};

export type AssetWithData = AssetBase & {
    hasData: true;
    today: MarketRow;
    previous: MarketRow | null;
    price: number;
    change: number;
    positive: boolean;
    spark: number[];
};

export type AssetMarket = AssetWithData | AssetWithoutData;

export const ASSET_CATALOG: AssetBase[] = [
    { symbol: 'ERIC', name: 'Ericsson', data: ERIC as MarketRow[] },
    { symbol: 'IBM', name: 'IBM', data: IBM as MarketRow[] },
    { symbol: 'INTC', name: 'Intel', data: INTC as MarketRow[] },
    { symbol: 'MSFT', name: 'Microsoft', data: MSFT as MarketRow[] },
    { symbol: 'NOK', name: 'Nokia', data: NOK as MarketRow[] },
    { symbol: 'ORCL', name: 'Oracle', data: ORCL as MarketRow[] },
];

export function findRowAtOrBefore(data: MarketRow[], dateStr: string): MarketRow | null {
    if (!data || data.length === 0) return null;

    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));

    let last: MarketRow | null = null;
    for (const row of sorted) {
        if (row.date > dateStr) break;
        last = row;
    }

    return last;
}

export function toLocalDateStr(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getAssetsWithMarket(dateStr: string, sparkLength = 20): AssetMarket[] {
    return ASSET_CATALOG.map(asset => {
        const sortedData = [...asset.data].sort((a, b) => a.date.localeCompare(b.date));
        const today = findRowAtOrBefore(sortedData, dateStr);

        if (!today) {
            return {
                ...asset,
                hasData: false,
            };
        }

        const todayIndex = sortedData.findIndex(row => row.date === today.date);
        const previous = todayIndex > 0 ? sortedData[todayIndex - 1] : null;
        const spark = sortedData
            .filter(row => row.date <= dateStr)
            .slice(-Math.max(2, sparkLength))
            .map(row => row.close);
        const price = today.close;
        const change = previous ? ((price - previous.close) / previous.close) * 100 : 0;

        return {
            ...asset,
            hasData: true,
            today,
            previous,
            price,
            change,
            positive: change >= 0,
            spark,
        };
    });
}

export function getAssetLogo(symbol: string) {
    return `/images/assets/${symbol.toLowerCase()}.png`;
}
