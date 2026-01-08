'use client';

import {useState, useEffect, useMemo} from 'react';
import { type WalletItem } from '../utils/walletData';

import ERIC from '../data/ERIC.json';
import IBM from '../data/IBM.json';
import INTC from '../data/INTC.json';
import MSFT from '../data/MSFT.json';
import NOK from '../data/nok.json';
import ORCL from '../data/ORCL.json';

import { getChartData, type RangeKey } from '../utils/chartSelector';

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

type AssetWithoutData = AssetBase & {
    hasData: false;
};

type AssetWithData = AssetBase & {
    hasData: true;
    price: number;
    change: number;
    positive: boolean;
    spark: number[];
};

type AssetMarket = AssetWithData | AssetWithoutData;


function findRowAtOrBefore(data: MarketRow[], dateStr: string): MarketRow | null {
    if (!data || data.length === 0) return null;

    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));

    let last: MarketRow | null = null;
    for (const row of sorted) {
        if (row.date > dateStr) break;
        last = row;
    }
    return last;
}

function toLocalDateStr(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export default function MainTradePanel({currentDate, secondsLeft, wallet, setWallet, gameHour, onSkip30,}: {
    currentDate: Date;
    secondsLeft: number;
    wallet: WalletItem[];
    setWallet: React.Dispatch<React.SetStateAction<WalletItem[]>>;
    gameHour: number;
    onSkip30: () => void;
}) {

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    const gameDate = currentDate.toLocaleDateString('en-CA', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const dateStr = toLocalDateStr(currentDate);

    const ASSETS = [
        { symbol: 'ERIC', name: 'Ericsson', data: ERIC as MarketRow[] },
        { symbol: 'IBM', name: 'IBM', data: IBM as MarketRow[] },
        { symbol: 'INTC', name: 'Intel', data: INTC as MarketRow[] },
        { symbol: 'MSFT', name: 'Microsoft', data: MSFT as MarketRow[] },
        { symbol: 'NOK', name: 'Nokia', data: NOK as MarketRow[] },
        { symbol: 'ORCL', name: 'Oracle', data: ORCL as MarketRow[] },
    ];

    const assetsWithMarket = useMemo<AssetMarket[]>(() => {
        return ASSETS.map(asset => {
            const sortedData = [...asset.data].sort(
                (a, b) => a.date.localeCompare(b.date)
            );

            const spark = sortedData
                .filter(d => d.date <= dateStr)
                .slice(-7)
                .map(d => d.close)

            const today = findRowAtOrBefore(sortedData, dateStr);

            if (!today) {
                return {
                    ...asset,
                    hasData: false,
                };
            }

            const idx = asset.data.findIndex(r => r.date === today.date);
            const prev = idx > 0 ? asset.data[idx - 1] : null;

            const price = today.close;
            const change =
                prev ? ((price - prev.close) / prev.close) * 100 : 0;


            return {
                ...asset,
                hasData: true,
                price,
                change,
                positive: change >= 0,
                spark,
            };
        });
    }, [dateStr]);

    const [range, setRange] = useState<RangeKey>('1D');

    const [activeSymbol, setActiveSymbol] = useState<string | null>(null);

    const activeAsset = useMemo(() => {
        if (activeSymbol) {
            return assetsWithMarket.find(a => a.symbol === activeSymbol) ?? null;
        }
        return assetsWithMarket.find(a => a.hasData) ?? null;
    }, [activeSymbol, assetsWithMarket]);

    const chartData = useMemo(() => {
        if (!activeAsset || !activeAsset.hasData) return [];
        return getChartData(activeAsset.data, range, dateStr);
    }, [activeAsset, range, dateStr]);


    const performance = useMemo(() => {
        if (!activeAsset || !activeAsset.hasData) {
            return { value: 0, positive: true };
        }

        const visibleData = activeAsset.data
            .filter(d => d.date <= dateStr)
            .sort((a, b) => a.date.localeCompare(b.date));

        return calculatePerformance(visibleData, range);
    }, [activeAsset, range, dateStr]);


    const hasActiveData = activeAsset?.hasData === true;

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const [side, setSide] = useState<'buy' | 'sell'>('buy');

    const [amount, setAmount] = useState<string>(''); // $
    const [units, setUnits] = useState<string>('');   // shares

    const price = activeAsset?.hasData ? activeAsset.price : 0;


    const getAssetPrice = () => {
        if (!activeAsset || !activeAsset.hasData) return 0;
        return activeAsset.price;
    };

    const handleAmountChange = (val: string) => {
        setAmount(val);

        const num = Number(val);
        if (!price || isNaN(num)) {
            setUnits('');
            return;
        }

        setUnits((num / price).toFixed(4));
    };

    const handleUnitsChange = (val: string) => {
        setUnits(val);

        const num = Number(val);
        if (!price || isNaN(num)) {
            setAmount('');
            return;
        }

        setAmount((num * price).toFixed(2));
    };


    const handleConfirmTrade = () => {
        if (!activeAsset || !activeAsset.hasData) {
            alert('No market data available');
            return;
        }

        const price = activeAsset.price;

        const dollarAmount = Number(amount);
        const unitAmount = Number(units);

        if (side === 'buy' && (isNaN(dollarAmount) || dollarAmount <= 0)) {
            alert('Enter dollar amount');
            return;
        }

        if (side === 'sell' && (isNaN(unitAmount) || unitAmount <= 0)) {
            alert('Enter units');
            return;
        }

        setWallet(prev => {
            const next = [...prev];
            const cash = next.find(w => w.label === 'Cash');
            const asset = next.find(w => w.label === activeAsset.symbol);

            if (!cash) return prev;

            /* ===== BUY ===== */
            if (side === 'buy') {
                if (cash.units < dollarAmount) {
                    alert('Not enough cash');
                    return prev;
                }

                const boughtUnits = dollarAmount / price;

                cash.units -= dollarAmount;
                cash.usdValue = cash.units;

                if (asset) {
                    asset.units += boughtUnits;
                    asset.usdValue = asset.units * price;
                } else {
                    next.push({
                        id: crypto.randomUUID(),
                        label: activeAsset.symbol,
                        units: boughtUnits,
                        unitLabel: activeAsset.symbol,
                        usdValue: boughtUnits * price,
                    });
                }
            }

            /* ===== SELL ===== */
            if (side === 'sell') {
                if (!asset || asset.units < unitAmount) {
                    alert('Not enough asset');
                    return prev;
                }

                const cashReceived = unitAmount * price;

                asset.units -= unitAmount;
                asset.usdValue = asset.units * price;

                cash.units += cashReceived;
                cash.usdValue = cash.units;
            }

            return next.filter(w => w.units > 0);
        });

        setAmount('');
        setUnits('');
    };


    const chartRows = useMemo(() => {
        if (!activeAsset || !activeAsset.hasData) return [];

        return getChartData(
            activeAsset.data,
            range,
            dateStr
        );
    }, [activeAsset, range, dateStr]);

    return (
        <div className="flex-1 w-full bg-white px-10 py-8">

            {/* TIME INFO */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <p className="text-lg text-gray-800">
                        Time now:{' '}
                        <span className="font-semibold">{gameDate} </span>
                    </p>
                    <p className={`text-xl font-semibold ${secondsLeft <= 180 ? 'text-red-500' : 'text-green-600'}`}>
                        Time remaining: {minutes}:{seconds.toString().padStart(2, '0')}
                    </p>

                </div>

                <button
                    onClick={onSkip30}
                    className="px-4 py-2 rounded-full bg-blue-600 text-white font-semibold
                   hover:bg-blue-500 transition cursor-pointer text-sm"
                    title="Skip 30 seconds"
                >
                    +30s
                </button>

                <button
                    className="w-14 h-14 rounded-full bg-[#e6f0ff] flex items-center justify-center border border-blue-200 hover:bg-blue-100 transition cursor-pointer">
                    <img src="/bell.png" alt="Notifications" className="w-10 h-10"/>
                </button>
            </div>

            {/* ASSET CAROUSEL */}
            <div className="w-full max-w-[1200px] mx-auto">
                <div className="relative border border-gray-200 rounded-2xl px-4 py-4">
                    <div className="flex gap-4 overflow-x-auto pl-2">
                        {assetsWithMarket.map(asset => {
                            const isActive = activeAsset !== null && asset.symbol === activeAsset.symbol;

                            return (
                                <div
                                    key={asset.symbol}
                                    onClick={() => asset.hasData && setActiveSymbol(asset.symbol)}

                                    className={`min-w-[220px] px-6 py-4 rounded-xl cursor-pointer flex justify-between items-center transition
                    ${isActive ? 'bg-blue-100 border-[3px] border-blue-600' : 'bg-white border border-gray-200 hover:border-gray-400'}
                  `}
                                >
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-semibold text-gray-500">
                                            {asset.symbol}
                                        </p>

                                        <p className="text-xl font-bold text-gray-900">
                                            {asset.hasData ? asset.price.toFixed(2) : '—'}
                                        </p>

                                        <p className={`text-sm font-semibold ${
                                            !asset.hasData ? 'text-gray-400' :
                                                asset.positive ? 'text-green-600' : 'text-red-500'
                                        }`}>
                                            {asset.hasData
                                                ? `${asset.change >= 0 ? '+' : ''}${asset.change.toFixed(2)}%`
                                                : 'No data'}
                                        </p>
                                    </div>

                                    <div className="ml-6">
                                        {asset.hasData && (
                                            <MiniSparkline
                                                data={asset.spark}
                                                positive={asset.positive}
                                            />
                                        )}
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
                        {hasActiveData ? (
                            <>
                                <p className="text-sm text-gray-500">
                                    {activeAsset.symbol} · {activeAsset.name}
                                </p>

                                <p className="text-3xl font-bold text-gray-900">
                                    {activeAsset.price.toFixed(2)}
                                </p>

                                <p
                                    className={`font-semibold ${
                                        activeAsset.positive ? 'text-green-600' : 'text-red-500'
                                    }`}
                                >
                                    {activeAsset.change >= 0 ? '+' : ''}
                                    {activeAsset.change.toFixed(2)}%
                                </p>
                            </>
                        ) : (
                            <p className="text-red-500 font-semibold">
                                Not enough data found
                            </p>
                        )}
                    </div>


                    {/* PERFORMANCE */}
                    {hasActiveData && (
                        <div className="mb-4">
                            <p className="text-sm text-gray-500 font-medium">Performance</p>

                            <div className="flex items-center gap-2 mt-1">
                      <span className={`text-lg font-bold ${performance.positive ? 'text-green-600' : 'text-red-500'}`}>
                        {performance.positive ? '+' : ''}
                          {performance.value.toFixed(2)}%
                      </span>

                                <span className="text-sm text-gray-500">Past {range === '1W' ? 'Week' : range === '1M'
                                    ? 'Month'
                                        : range === '6M'
                                            ? '6 Months'
                                            : 'Year'}
                            </span>
                            </div>
                        </div>
                    )}


                    <div className="mt-4 rounded-xl border border-gray-200 bg-green-50 p-4">
                        {/* CHART PLACEHOLDER */}
                        <div
                            style={{height: '400px'}}
                            className="mt-4 rounded-xl  bg-green-50 p-4"
                        >
                            {mounted && hasActiveData && chartData.length > 1 ? (
                                <div
                                    style={{height: '400px'}}
                                    className="mt-4 rounded-xl bg-green-50 p-4"
                                >
                                    {mounted && chartData.length > 1 ? (
                                        <HoverChart
                                            rows={chartData}
                                            positive={performance.positive}
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-gray-400">
                                            No data found for this date
                                        </div>
                                    )}
                                </div>

                            ) : (
                                <div className="flex h-full items-center justify-center text-gray-400">
                                    No data found for this date
                                </div>
                            )}

                        </div>

                    </div>

                    {/* RANGE buttons */}
                    <div className="flex gap-6 mt-4 text-sm">
                        {(['1D', '1W', '1M', '6M', '1Y'] as const).map(r => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                className={`font-semibold transition ${
                                    range === r
                                        ? 'text-blue-600'
                                        : 'text-gray-500 hover:text-blue-500'
                                }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>

                </div>


                {/* RIGHT */}
                <div className="border border-gray-300 rounded-2xl p-6">

                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex border border-gray-300 rounded-full p-1 w-[260px] h-[52px]">
                            <button
                                onClick={() => setSide('buy')}
                                className={`flex-1 rounded-full font-semibold text-lg transition
                                    ${side === 'buy'
                                    ? 'bg-green-500 text-white'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}>
                                buy
                            </button>

                            <button
                                onClick={() => setSide('sell')}
                                className={`flex-1 py-2 rounded-full text-lg font-semibold transition
                                    ${side === 'sell'
                                    ? 'bg-red-500 text-white'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}>
                                sell
                            </button>
                        </div>
                    </div>

                    {/* AMOUNT */}
                    <div className="border border-gray-300 rounded-xl p-4 mb-4">
                        <label className="text-sm text-gray-500 block mb-1">
                            Amount
                        </label>

                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full text-lg font-semibold text-black outline-none bg-transparent"
                            placeholder="$"
                        />


                    </div>

                    {/* STOP LOSS */}
                    <div className="border border-gray-300 rounded-xl p-4 mb-4">
                        <p className="text-sm text-gray-500">
                            Stop Loss
                        </p>

                        {numericAmount === 0 ? (
                            <p className="text-lg font-semibold text-red-500">
                                No SL
                            </p>
                        ) : (
                            <p className="text-lg font-semibold text-red-500">
                                −${stopLossValue.toFixed(2)}
                            </p>
                        )}
                    </div>

                    {/* TAKE PROFIT */}
                    <div className="border border-gray-300 rounded-xl p-4 mb-4">
                        <p className="text-sm text-gray-500">
                            Take Profit
                        </p>

                        {numericAmount === 0 ? (
                            <p className="text-lg font-semibold text-gray-400">
                                $0.00
                            </p>
                        ) : (
                            <p className="text-lg font-semibold text-green-600">
                                +${takeProfitValue.toFixed(2)}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={handleConfirmTrade}
                        className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-full text-lg font-semibold cursor-pointer">
                        confirm
                    </button>

                </div>

            </div>
            {/* ================= END TRADE PANEL ================= */}

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

function calculatePerformance(
    data: { date: string; close: number }[],
    range: '1D' | '1W' | '1M' | '6M' | '1Y'
) {
    if (!data || data.length < 2) {
        return { value: 0, positive: true };
    }

    const lookbackMap: Record<typeof range, number> = {
        '1D': 1,
        '1W': 5,
        '1M': 22,
        '6M': 126,
        '1Y': 252,
    };

    const lookback = lookbackMap[range];

    const endIndex = data.length - 1;
    const startIndex = Math.max(0, endIndex - lookback);

    const startPrice = data[startIndex].close;
    const endPrice = data[endIndex].close;

    const value = ((endPrice - startPrice) / startPrice) * 100;

    return {
        value,
        positive: value >= 0,
    };
}
function HoverChart({
                        rows,
                        positive,
                    }: {
    rows: { date: string; close: number }[];
    positive: boolean;
}) {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    if (rows.length === 0) return null;

    const values = rows.map(r => r.close);
    const max = Math.max(...values);
    const min = Math.min(...values);

    const padding = (max - min) * 0.15;
    const safeMax = max + padding;
    const safeMin = min - padding;

    const points = values.map((v, i) => {
        const x = (i / (values.length - 1)) * 100;
        const y = 100 - ((v - safeMin) / (safeMax - safeMin)) * 100;
        return { x, y };
    });

    return (
        <div className="relative w-full h-full">
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const pct = x / rect.width;
                    const index = Math.round(pct * (rows.length - 1));
                    setHoverIndex(
                        Math.max(0, Math.min(rows.length - 1, index))
                    );
                }}
                onMouseLeave={() => setHoverIndex(null)}
            >
                {/* LINE */}
                <polyline
                    points={points.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke={positive ? '#22c55e' : '#ef4444'}
                    strokeWidth="0.35"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />

                {/* VERTICAL GUIDE + ACTIVE DOT */}
                {hoverIndex !== null && (
                    <>
                        <line
                            x1={points[hoverIndex].x}
                            x2={points[hoverIndex].x}
                            y1={0}
                            y2={100}
                            stroke={positive ? '#22c55e' : '#ef4444'}
                            strokeWidth="0.2"
                            strokeDasharray="1 1"
                        />
                        <circle
                            cx={points[hoverIndex].x}
                            cy={points[hoverIndex].y}
                            r={0.45}
                            fill={positive ? '#22c55e' : '#ef4444'}
                        />
                    </>
                )}
            </svg>

            {/* TOOLTIP */}
            {hoverIndex !== null && (
                <div
                    className="absolute rounded-md shadow-lg px-3 py-2 text-xs
                     bg-gray-900 text-white border border-gray-700"
                    style={{
                        left: `${points[hoverIndex].x}%`,
                        top: `${points[hoverIndex].y}%`,
                        transform: 'translate(-50%, -120%)',
                        pointerEvents: 'none',
                    }}
                >
                    <div className="font-semibold">
                        {rows[hoverIndex].date}
                    </div>
                    <div>
                        ${values[hoverIndex].toFixed(2)}
                    </div>
                </div>
            )}
        </div>
    );
}
