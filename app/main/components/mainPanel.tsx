'use client';

import {useState, useEffect, useMemo, useRef, useId} from 'react';
import Image from 'next/image';
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
}; // {"date":"1999-07-20","volume":19946500,"open":26.2119655609,"high":26.2119655609,"low":25.0340595245,"close":25.1192092896,"adj close":13.2619962692}

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

    useEffect(() => {
        setWallet(prev =>
            prev.map(item => {
                if (item.label === 'Cash') {
                    return {
                        ...item,
                        usdValue: item.units,
                    };
                }
                const asset = assetsWithMarket.find(
                    (a): a is AssetWithData =>
                        a.hasData && a.symbol === item.label
                );

                if (!asset) return item;

                return {
                    ...item,
                    usdValue: item.units * asset.price,
                };
            })
        );
    }, [assetsWithMarket, dateStr, setWallet]);


    const [range, setRange] = useState<RangeKey>('1W');

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

    const rangeSummary = useMemo(() => {
        return calculateRangeSummary(chartData);
    }, [chartData]);

    const rangeLabel = getRangeLabel(range);

    const hasActiveData = activeAsset?.hasData === true;

    const [side, setSide] = useState<'buy' | 'sell'>('buy');

    const [amount, setAmount] = useState(''); // $
    const [units, setUnits] = useState('');   // shares

    const price = activeAsset?.hasData ? activeAsset.price : 0;


    const getAssetPrice = () => {
        if (!activeAsset || !activeAsset.hasData) return 0;
        return activeAsset.price;
    };

    const lastEdited = useRef<'amount' | 'units' | null>(null);

    const handleAmountChange = (val: string) => {
        lastEdited.current = 'amount';
        setAmount(val);

        const num = Number(val);
        if (!price || isNaN(num)) {
            setUnits('');
            return;
        }

        setUnits((num / price).toFixed(4));
    };

    const handleUnitsChange = (val: string) => {
        lastEdited.current = 'units';
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

    useEffect(() => {
        if (!price) return;

        if (lastEdited.current === 'amount' && amount !== '') {
            const num = Number(amount);
            if (!isNaN(num)) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setUnits((num / price).toFixed(4));
            }
        }

        if (lastEdited.current === 'units' && units !== '') {
            const num = Number(units);
            if (!isNaN(num)) {
                setAmount((num * price).toFixed(2));
            }
        }
    }, [price]);

    const ownedAsset = useMemo(() => {
        if (!activeAsset) return null;
        return wallet.find(w => w.label === activeAsset.symbol) ?? null;
    }, [wallet, activeAsset]);

    const ownedUnits = ownedAsset?.units ?? 0;
    const ownedValue = ownedUnits * price;



    return (
        <div className="flex-1 w-full bg-transparent px-4 py-4">

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
            <div className="w-full">
                <div className="relative rounded-[28px] border border-gray-200 bg-white px-5 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                    <div className="flex gap-5 overflow-x-auto px-1 pb-1">
                        {assetsWithMarket.map(asset => {
                            const isActive = activeAsset !== null && asset.symbol === activeAsset.symbol;

                            return (
                                <div
                                    key={asset.symbol}
                                    onClick={() => asset.hasData && setActiveSymbol(asset.symbol)}

                                    className={`min-w-[300px] cursor-pointer rounded-[24px] border px-6 py-5 transition shadow-[0_8px_24px_rgba(15,23,42,0.04)]
                    ${isActive
                                        ? 'border-blue-500 bg-blue-50/80'
                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/70'}
                  `}
                                >
                                    <div className="flex items-start justify-between gap-6">
                                        <div className="flex min-w-0 flex-col gap-1.5">
                                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">
                                                {asset.symbol}
                                            </p>
                                            <p className="truncate text-lg font-semibold text-gray-950">
                                                {asset.name}
                                            </p>
                                            <p className="text-3xl font-semibold tracking-tight text-gray-950">
                                                {asset.hasData ? formatCurrency(asset.price) : '—'}
                                            </p>
                                            <p className={`text-sm font-semibold ${
                                                !asset.hasData ? 'text-gray-400' :
                                                    asset.positive ? 'text-emerald-700' : 'text-red-700'
                                            }`}>
                                                {asset.hasData
                                                    ? `${asset.change >= 0 ? '+' : ''}${asset.change.toFixed(2)}% today`
                                                    : 'No data'}
                                            </p>
                                        </div>

                                        {asset.hasData && (
                                            <div className="w-28 shrink-0 pt-3">
                                                <MiniSparkline
                                                    data={asset.spark}
                                                    positive={asset.positive}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            {/* ================= TRADE PANEL ================= */}

            <div className="mt-10 grid grid-cols-[minmax(0,1fr)_360px] items-start gap-8">


                {/* LEFT: CHART */}
                <div className="min-w-0 self-start rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">

                    {/* HEADER */}
                    <div className="mb-5 border-b border-gray-200 pb-5">
                        {hasActiveData && (
                            <div className="mb-4 flex items-center gap-4">
                                <Image
                                    src={getAssetLogo(activeAsset.symbol)}
                                    alt={`${activeAsset.symbol} logo`}
                                    width={56}
                                    height={56}
                                    className="h-14 w-14 rounded-2xl border border-gray-200 bg-white p-2 object-contain"
                                />
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">
                                        {activeAsset.symbol}
                                    </p>
                                    <p className="text-[2rem] font-semibold tracking-tight text-gray-950">
                                        {activeAsset.name}
                                    </p>
                                </div>
                            </div>
                        )}

                        {hasActiveData ? (
                            <div className="flex flex-wrap items-end gap-3">
                                <p className="text-5xl font-semibold tracking-tight text-gray-950">
                                    {formatCurrency(activeAsset.price)}
                                </p>

                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-base font-semibold ${
                                    rangeSummary.positive
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-red-100 text-red-700'
                                }`}>
                                    {rangeSummary.percent >= 0 ? '+' : ''}
                                    {rangeSummary.percent.toFixed(2)}%
                                </span>

                                <p className={`pb-1 text-xl font-semibold ${
                                    rangeSummary.positive ? 'text-emerald-700' : 'text-red-700'
                                }`}>
                                    {rangeSummary.absolute >= 0 ? '+' : '-'}
                                    {formatCurrency(Math.abs(rangeSummary.absolute))} {rangeLabel}
                                </p>
                            </div>
                        ) : (
                            <p className="text-red-500 font-semibold">
                                Not enough data found
                            </p>
                        )}
                        {hasActiveData && (
                            <p className="mt-2 text-sm text-gray-500">
                                {gameDate} · USD
                            </p>
                        )}
                    </div>

                    <div className="mb-5 flex gap-2 text-sm">
                        {(['1W', '1M', '6M', '1Y'] as const).map(r => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                className={`rounded-full px-3 py-1.5 font-semibold transition ${
                                    range === r
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>

                    <div className={`rounded-[28px] border p-4 ${
                        rangeSummary.positive
                            ? 'border-emerald-100 bg-gradient-to-b from-emerald-50 via-white to-white'
                            : 'border-red-100 bg-gradient-to-b from-red-50 via-white to-white'
                    }`}>
                        <div
                            style={{height: '430px'}}
                            className="mx-auto w-full max-w-[1080px] rounded-[24px] bg-white p-3"
                        >
                            {hasActiveData && chartData.length > 1 ? (
                                <HoverChart
                                    rows={chartData}
                                    positive={rangeSummary.positive}
                                    range={range}
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-gray-400">
                                    No data found for this date
                                </div>
                            )}
                        </div>
                    </div>

                </div>


                {/* RIGHT */}
                <div className="self-start rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">

                    <div className="flex justify-center gap-3 mb-6">
                        <div className="flex h-[52px] w-[260px] rounded-full border border-gray-200 bg-gray-50 p-1">
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
                                disabled={ownedUnits === 0}
                                className={`flex-1 py-2 rounded-full text-lg font-semibold transition ${side === 'sell'
                                    ? 'bg-red-500 text-white'
                                    : ownedUnits === 0
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                sell
                            </button>

                        </div>
                    </div>

                    {side === 'sell' && ownedUnits > 0 && (
                        <div className="mb-4 rounded-[20px] border border-gray-200 bg-gray-50 p-4 text-sm">
                            <p className="text-gray-500">You own</p>
                            <p className="font-semibold text-gray-900">
                                {ownedUnits.toFixed(3)} {activeAsset?.symbol}
                                <span className="text-gray-500">
                        {' '} (~${ownedValue.toFixed(2)})
                    </span>
                            </p>
                        </div>
                    )}


                    {/* AMOUNT ($) */}
                    <div className="mb-4 rounded-[20px] border border-gray-200 p-4">
                        <label className="text-sm text-gray-500 block mb-1">
                            Amount ($)
                        </label>

                        <input
                            type="number"
                            value={amount}
                            disabled={side === 'sell'}
                            onChange={(e) => handleAmountChange(e.target.value)}
                            className={`w-full text-lg font-semibold outline-none bg-transparent
                            ${side === 'sell'
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-black'
                            }`}
                            placeholder="$"
                        />

                    </div>

                    {/* UNITS */}
                    <div className="mb-6 rounded-[20px] border border-gray-200 p-4">
                        <label className="text-sm text-gray-500 block mb-1">
                            Units
                        </label>

                        <input
                            type="number"
                            value={units}
                            max={side === 'sell' ? ownedUnits : undefined}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (side === 'sell' && Number(val) > ownedUnits) return;
                                handleUnitsChange(val);
                            }}
                            className="w-full text-lg font-semibold text-black outline-none bg-transparent"
                            placeholder="0.0000"
                        />

                    </div>

                    {side === 'sell' && units && Number(units) > 0 && (
                        <p className="mt-2 text-sm text-gray-600">
                            You will receive{' '}
                            <span className="font-semibold text-gray-900">
                        ${(Number(units) * price).toFixed(3)}
                    </span>
                        </p>
                    )}


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
            className="h-12 w-full"
            preserveAspectRatio="none"
        >
            <polyline
                points={points}
                fill="none"
                stroke={positive ? '#22c55e' : '#ef4444'}
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

function getAssetLogo(symbol: string) {
    return `/assets/${symbol.toLowerCase()}.png`;
}

function calculateRangeSummary(rows: { date: string; close: number }[]) {
    if (!rows || rows.length < 2) {
        return { absolute: 0, percent: 0, positive: true };
    }

    const start = rows[0].close;
    const end = rows[rows.length - 1].close;
    const absolute = end - start;
    const percent = start === 0 ? 0 : (absolute / start) * 100;

    return {
        absolute,
        percent,
        positive: absolute >= 0,
    };
}

function getRangeLabel(range: RangeKey) {
    if (range === '1W') return '1W';
    if (range === '1M') return '1M';
    if (range === '6M') return '6M';
    return '1Y';
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function formatAxisValue(value: number) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: value < 10 ? 2 : 0,
        maximumFractionDigits: value < 10 ? 2 : 0,
    }).format(value);
}

function formatChartDate(dateStr: string, range: RangeKey) {
    const date = new Date(`${dateStr}T00:00:00`);

    return new Intl.DateTimeFormat(
        'en-US',
        range === '1W' || range === '1M'
            ? { month: 'short', day: 'numeric' }
            : { month: 'short', year: '2-digit' }
    ).format(date);
}

function buildDateTicks(
    rows: { date: string; close: number }[],
    range: RangeKey
) {
    if (rows.length === 0) return [];

    const rawIndices = [0, Math.floor((rows.length - 1) / 3), Math.floor(((rows.length - 1) * 2) / 3), rows.length - 1];
    const indices = Array.from(new Set(rawIndices));

    return indices.map(index => ({
        index,
        label: formatChartDate(rows[index].date, range),
    }));
}

function HoverChart({
    rows,
    positive,
    range,
}: {
    rows: { date: string; close: number }[];
    positive: boolean;
    range: RangeKey;
}) {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const gradientId = useId();

    if (rows.length === 0) return null;

    const values = rows.map(r => r.close);
    const max = Math.max(...values);
    const min = Math.min(...values);

    const spread = Math.max(max - min, max * 0.08, 1);
    const padding = spread * 0.2;
    const safeMax = max + padding;
    const safeMin = min - padding;

    const viewWidth = 1000;
    const viewHeight = 420;
    const chartLeft = 96;
    const chartRight = 970;
    const chartTop = 34;
    const chartBottom = 326;

    const points = values.map((v, i) => {
        const x = chartLeft + (i / (values.length - 1)) * (chartRight - chartLeft);
        const y =
            chartBottom - ((v - safeMin) / (safeMax - safeMin)) * (chartBottom - chartTop);
        return { x, y };
    });

    const linePath = points
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
        .join(' ');
    const areaPath = [
        `M ${points[0].x} ${chartBottom}`,
        ...points.map((point, index) => `${index === 0 ? 'L' : 'L'} ${point.x} ${point.y}`),
        `L ${points[points.length - 1].x} ${chartBottom}`,
        'Z',
    ].join(' ');

    const yTicks = Array.from({ length: 5 }, (_, index) => {
        const ratio = index / 4;
        const y = chartTop + ratio * (chartBottom - chartTop);
        const value = safeMax - ratio * (safeMax - safeMin);
        return { y, value };
    });

    const xTicks = buildDateTicks(rows, range);
    const activeIndex = hoverIndex ?? rows.length - 1;
    const activePoint = points[activeIndex];
    const lineColor = positive ? '#16a34a' : '#dc2626';

    return (
        <div className="relative w-full h-full">
            <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${viewWidth} ${viewHeight}`}
                preserveAspectRatio="none"
                className="overflow-visible"
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const clampedX = Math.max(chartLeft / viewWidth, Math.min(chartRight / viewWidth, x / rect.width));
                    const pct = (clampedX - chartLeft / viewWidth) / ((chartRight - chartLeft) / viewWidth);
                    const index = Math.round(pct * (rows.length - 1));
                    setHoverIndex(
                        Math.max(0, Math.min(rows.length - 1, index))
                    );
                }}
                onMouseLeave={() => setHoverIndex(null)}
            >
                <defs>
                    <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={lineColor} stopOpacity="0.22" />
                        <stop offset="65%" stopColor={lineColor} stopOpacity="0.08" />
                        <stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
                    </linearGradient>
                </defs>

                {yTicks.map(tick => (
                    <g key={tick.y}>
                        <line
                            x1={chartLeft}
                            x2={chartRight}
                            y1={tick.y}
                            y2={tick.y}
                            stroke="#e5e7eb"
                            strokeWidth="1"
                            vectorEffect="non-scaling-stroke"
                        />
                        <text
                            x={chartLeft - 18}
                            y={tick.y + 4}
                            fontSize="12"
                            fill="#94a3b8"
                            textAnchor="end"
                        >
                            {formatAxisValue(tick.value)}
                        </text>
                    </g>
                ))}

                <path d={areaPath} fill={`url(#${gradientId})`} />
                <path
                    d={linePath}
                    fill="none"
                    stroke={lineColor}
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                />

                <line
                    x1={activePoint.x}
                    x2={activePoint.x}
                    y1={chartTop}
                    y2={chartBottom}
                    stroke={lineColor}
                    strokeWidth="1.5"
                    strokeDasharray="4 5"
                    opacity={hoverIndex === null ? 0.35 : 0.7}
                    vectorEffect="non-scaling-stroke"
                />

                <circle
                    cx={activePoint.x}
                    cy={activePoint.y}
                    r={8}
                    fill="#ffffff"
                    stroke={lineColor}
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                />

                <circle
                    cx={activePoint.x}
                    cy={activePoint.y}
                    r={3.5}
                    fill={lineColor}
                />

                {xTicks.map(tick => {
                    const point = points[tick.index];
                    return (
                        <text
                            key={`${tick.index}-${tick.label}`}
                            x={point.x}
                            y={387}
                            fontSize="12"
                            fill="#94a3b8"
                            textAnchor={tick.index === 0 ? 'start' : tick.index === rows.length - 1 ? 'end' : 'middle'}
                        >
                            {tick.label}
                        </text>
                    );
                })}
            </svg>

            {/* TOOLTIP */}
            {activeIndex !== null && (
                <div
                    className="absolute rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 shadow-[0_14px_30px_rgba(15,23,42,0.14)]"
                    style={{
                        left: `${(activePoint.x / viewWidth) * 100}%`,
                        top: `${(activePoint.y / viewHeight) * 100}%`,
                        transform: activePoint.x > viewWidth * 0.8 ? 'translate(-105%, -120%)' : 'translate(-10%, -120%)',
                        pointerEvents: 'none',
                    }}
                >
                    <div className="font-semibold text-gray-500">
                        {formatChartDate(rows[activeIndex].date, range)}
                    </div>
                    <div className="mt-1 text-sm font-bold text-gray-950">
                        {formatCurrency(values[activeIndex])}
                    </div>
                </div>
            )}
        </div>
    );
}
