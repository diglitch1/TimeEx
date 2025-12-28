export type AssetMarketData = {
    '1D': number[];
    '1W': number[];
    '1M': number[];
    '6M': number[];
    '1Y': number[];
};

function randomBetween(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

function generateTimeline(start: number, points: number): number[] {
    let price = start;
    const out: number[] = [];

    for (let i = 0; i < points; i++) {
        const vol = randomBetween(0.002, 0.02);
        price *= 1 + randomBetween(-vol, vol);
        out.push(Number(price.toFixed(2)));
    }

    return out;
}

export const ETH_DATA: AssetMarketData = {
    '1D': generateTimeline(3211, 24),
    '1W': generateTimeline(3211, 60),
    '1M': generateTimeline(3211, 120),
    '6M': generateTimeline(3211, 200),
    '1Y': generateTimeline(3211, 300),
};

export const BTC_DATA: AssetMarketData = {
    '1D': generateTimeline(63420, 24),
    '1W': generateTimeline(63420, 60),
    '1M': generateTimeline(63420, 120),
    '6M': generateTimeline(63420, 200),
    '1Y': generateTimeline(63420, 300),
};
