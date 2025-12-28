'use client';

import { useState, useEffect} from 'react';

import { ETH_DATA, BTC_DATA } from '../utils/marketData';

import { getChartData, type RangeKey } from '../utils/chartSelector';

export default function MainTradePanel() {

    const timelineDates = [
        new Date("2000-03-06"),
        new Date("2000-03-21"),
        new Date("2000-03-25"),
        new Date("2000-04-14"),
        new Date("2000-04-20"),
        new Date("2000-05-03"),
        new Date("2000-06-27"),
        new Date("2000-07-02"),
        new Date("2000-07-13"),
        new Date("2000-07-16"),
        new Date("2000-07-15"),
        new Date("2000-07-19")
    ];

    const TOTAL_SECONDS = 12 * 60; // 12 minutes

    const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentDate, setCurrentDate] = useState(timelineDates[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev === 1) {
                    setCurrentIndex(i => {
                        const nextIndex = i + 1;

                        if (nextIndex < timelineDates.length) {
                            setCurrentDate(timelineDates[nextIndex]);
                            return nextIndex;
                        }

                        clearInterval(interval);
                        return i;
                    });

                    return TOTAL_SECONDS;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // how many real seconds have passed in this 12-min round
    const elapsedSeconds = TOTAL_SECONDS - secondsLeft;

    // 30 real seconds = 1 in-game hour
    const gameHour = Math.min(
        Math.floor(elapsedSeconds / 30),
        23
    );

    // format HH:00
    const gameTime = `${gameHour.toString().padStart(2, '0')}:00`;

    // date WITHOUT time
    const gameDate = currentDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });


    const ASSETS = [
        {
            symbol: 'ETH',
            name: 'Ethereum',
            price: '3211.04',
            change: 1.8,
            positive: true,
            spark: [10, 14, 13, 18, 16, 20, 22],
            stopLossPct: 0.5,
            takeProfitPct: 2.0,
            data:ETH_DATA,
        },
        {
            symbol: 'BTC',
            name: 'Bitcoin',
            price: '63,420',
            change: 0.92,
            positive: true,
            spark: [30, 31, 29, 32, 34, 33, 35],
            stopLossPct: 0.3,
            takeProfitPct: 2.5,
            data: BTC_DATA,

        },
        {
            symbol: 'EURUSD',
            name: 'EUR / USD',
            price: '1.16210',
            change: -0.14,
            positive: false,
            spark: [16, 20, 19, 18, 19, 16, 15],
            stopLossPct: 0.6,
            takeProfitPct: 1.2,
        },
        {
            symbol: 'OIL',
            name: 'Oil',
            price: '59.89',
            change: 2.31,
            positive: true,
            spark: [8, 9, 11, 10, 13, 15, 16],
            stopLossPct: 0.5,
            takeProfitPct: 2.0,
        },
        {
            symbol: 'GOLD',
            name: 'Gold',
            price: '4082.38',
            change: -2.13,
            positive: false,
            spark: [27, 29, 28, 29, 30, 25, 24],
            stopLossPct: 0.5,
            takeProfitPct: 2.0,

        },
        {
            symbol: 'NSDQ100',
            name: 'NASDAQ 100',
            price: '25062.27',
            change: 0.24,
            positive: true,
            spark: [12, 13, 12, 14, 15, 16, 17],
            stopLossPct: 0.5,
            takeProfitPct: 2.0,
        },
        {
            symbol: 'AAPL',
            name: 'Apple',
            price: '227.22',
            change: +2.80,
            positive: true,
            spark: [16, 17, 18, 16, 20, 22, 24],
            stopLossPct: 0.5,
            takeProfitPct: 2.0,
        },

    ];

    const [activeAsset, setActiveAsset] = useState(ASSETS[0]); // first asset from carousel selected by default

    const [range, setRange] = useState<RangeKey>('1D');

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    return (
        <div className="flex-1 w-full bg-white px-10 py-8">

            {/* TIME INFO */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <p className="text-lg text-gray-800">
                        Time now:{' '}
                        <span className="font-semibold">{gameDate} at {gameTime}</span>
                    </p>


                    <p className={`text-xl font-semibold ${secondsLeft <= 180 ? 'text-red-500' : 'text-green-600'}`}>
                        Time remaining: {minutes}:{seconds.toString().padStart(2, '0')}
                    </p>
                </div>

                <button
                    className="w-14 h-14 rounded-full bg-[#e6f0ff] flex items-center justify-center border border-blue-200 hover:bg-blue-100 transition cursor-pointer">
                    <img src="/bell.png" alt="Notifications" className="w-10 h-10"/>
                </button>
            </div>

            {/* ASSET CAROUSEL */}
            <div className="w-full max-w-[1200px] mx-auto">
                <div className="relative border border-gray-200 rounded-2xl px-4 py-4">
                    <div className="flex gap-4 overflow-x-auto scroll-smooth pl-2" style={{ scrollbarWidth: 'none' }}>

                        {ASSETS.map((asset) => {
                            const isActive = asset.symbol === activeAsset.symbol;

                            return (
                                <div
                                    key={asset.symbol}
                                    onClick={() => setActiveAsset(asset)}
                                    className={`min-w-[220px px-6 py-4 rounded-xl cursor-pointer flex justify-between items-center transition-all duration-150
                                      ${isActive
                                        ? 'bg-blue-100 border-[3px] border-blue-600'
                                        : 'bg-white border border-gray-200 hover:border-gray-400'
                                    }`} >
                                    {/* asset card in carousel */}
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-semibold text-gray-500">
                                            {asset.symbol}
                                        </p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {asset.price}
                                        </p>
                                        <p
                                            className={`text-sm font-semibold ${
                                                asset.positive ? 'text-green-600' : 'text-red-500'}`}>
                                            {asset.positive ? '+' : ''}
                                            {asset.change}%
                                        </p>
                                    </div>

                                    {/* SPACE BETWEEN TEXT AND GRAPH */}
                                    <div className="ml-6">
                                        <MiniSparkline
                                            data={asset.spark}
                                            positive={asset.positive}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ================= TRADE PANEL ================= */}

            <div className="mt-10 grid grid-cols-[1fr_360px] gap-8">
            {/* LEFT: CHART */}
            <div className="border border-gray-300 rounded-2xl p-6 self-start">

                {/* HEADER */}
                <div className="flex items-center gap-4 mb-4">
                    {activeAsset.data ? (
                        <>
                            <img
                                src={`/assets/${activeAsset.symbol.toLowerCase()}.png`}
                                alt={activeAsset.symbol}
                                className="w-14 h-14"/>

                            <div>
                                <p className="text-sm text-gray-500">
                                    {activeAsset.symbol} · {activeAsset.name}
                                </p>

                                <div className="flex items-center gap-3">
                                    <p className="text-3xl font-bold text-gray-900">
                                        {activeAsset.price}
                                    </p>

                                    <p
                                        className={`font-semibold ${
                                            activeAsset.positive ? 'text-green-600' : 'text-red-500'
                                        }`}>
                                        {activeAsset.positive ? '+' : ''}
                                        {activeAsset.change}%
                                    </p>
                                </div>

                                <p className="text-sm text-gray-400">Market Open</p>
                            </div>
                        </>
                    ) : (
                        <p className="text-red-500 font-semibold">
                            Not enough data found
                        </p>
                    )}
                </div>


                {/* PERFORMANCE (above chart itself) */}
                <div className="mb-3">
                    <p className="font-semibold text-gray-800">Performance</p>

                    {activeAsset.data ? (
                        <p
                            className={`text-sm font-semibold ${
                                activeAsset.positive ? 'text-green-600' : 'text-red-500'
                            }`}
                        >
                            {activeAsset.positive ? '▲' : '▼'} {Math.abs(activeAsset.change)}%
                            <span className="text-gray-500"> Today</span>
                        </p>) : (
                        <p className="text-sm text-gray-400">
                            Not enough data
                        </p>
                    )}
                </div>


                {/* CHART PLACEHOLDER */}
                <div
                    style={{height: '400px'}}
                    className="relative w-full rounded-xl border border-gray-200 bg-green-50 p-4">
                    {mounted && activeAsset.data ? (
                        <FakeChart
                            data={getChartData(activeAsset.data, range)}
                            positive={activeAsset.positive}/>
                    ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                            Not enough data found
                        </div>
                    )}

                </div>

                {/* RANGE buttons */}
                <div className="flex gap-6 mt-4 text-sm">
                    {(['1D', '1W', '1M', '6M', '1Y'] as RangeKey[]).map(r => (
                        <button
                            key={r}
                            disabled={!activeAsset.data}
                            onClick={() => setRange(r)}
                            className={`font-semibold transition ${
                                !activeAsset.data ? 'text-gray-300 cursor-not-allowed' : range === r ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'
                            }`}>
                            {r}
                        </button>
                    ))}
                </div>


            </div>
            </div>

        </div>
    );

}

// mini graph in assets carousel
function MiniSparkline({data, positive,}: {
    data: number[];
    positive: boolean;
}) {
    const max = Math.max(...data);
    const min = Math.min(...data);

    const points = data
        .map((v, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((v - min) / (max - min)) * 100;
            return `${x},${y}`;
        })
        .join(' ');

    return (
        <svg
            viewBox="0 0 100 100"
            className="w-16 h-8"
            preserveAspectRatio="none"
        >
            <polyline
                points={points}
                fill="none"
                stroke={positive ? '#22c55e' : '#ef4444'}
                strokeWidth="3"
                strokeLinecap="round"
            />
        </svg>
    );
}

// picked asset chart
function FakeChart({data, positive,}: {
    data: number[];
    positive: boolean;
}) {
    if (!data || data.length === 0) {
        return null;
    }

    const max = Math.max(...data);
    const min = Math.min(...data);


    const padding = (max - min) * 0.15;
    const safeMax = max + padding;
    const safeMin = min - padding;

    const points = data
        .map((v, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y =
                100 - ((v - safeMin) / (safeMax - safeMin)) * 100;
            return `${x},${y}`;
        })
        .join(' ');

    return (
        <svg
            suppressHydrationWarning
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ display: 'block' }}
        >
            <polyline
                points={points}
                fill="none"
                stroke={positive ? '#22c55e' : '#ef4444'}
                strokeWidth="0.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
