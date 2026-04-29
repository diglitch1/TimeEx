'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { WalletItem } from '../utils/walletData';
import {
    getScenarioAssetCatalogs,
    getAssetsWithMarket,
    toLocalDateStr,
    type AssetWithData,
} from '../utils/marketData';
import AssetAvatar from './AssetAvatar';
import DailyNewsFeed from './DailyNewsFeed';

export default function Sidebar({
    wallet,
    currentDate,
    scenarioId,
    startingCash,
}: {
    wallet: WalletItem[];
    currentDate: Date;
    scenarioId: string;
    startingCash: number;
}) {
    const totalValue = wallet.reduce(
        (sum, item) => sum + item.usdValue,
        0
    );

    const dateStr = useMemo(() => toLocalDateStr(currentDate), [currentDate]);
    const scenarioCatalogs = useMemo(
        () => getScenarioAssetCatalogs(scenarioId),
        [scenarioId]
    );
    const assetsWithMarket = useMemo(
        () => getAssetsWithMarket(dateStr, 18, scenarioCatalogs.allCatalog),
        [dateStr, scenarioCatalogs]
    );
    const marketMover = useMemo(
        () =>
            assetsWithMarket.reduce<AssetWithData | null>((best, asset) => {
                if (!asset.hasData || asset.previous === null) return best;
                if (!best) return asset;
                return Math.abs(asset.change) > Math.abs(best.change) ? asset : best;
            }, null),
        [assetsWithMarket]
    );

    const gainLoss = totalValue - startingCash;
    const panelClass = 'rounded-[24px] border border-gray-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]';
    const sectionLabelClass = 'mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-gray-400';

    return (
        <aside className="w-[360px] shrink-0 border-r border-gray-200 bg-[#f8fafc] px-4 py-5 text-sm">
            <div className="flex h-full flex-col gap-4">
                <div className={panelClass}>
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-gray-200 bg-white">
                            <Image
                                src="/images/logo.png"
                                alt="TimeEx logo"
                                width={28}
                                height={28}
                            />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xl font-semibold tracking-tight text-gray-950">
                                Kira Light
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 rounded-[22px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-white p-4">
                        <div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-400">
                                    Net Worth
                                </p>
                                <p className="mt-1 text-[2.15rem] font-semibold tracking-tight text-gray-950">
                                    {formatSidebarCurrency(totalValue)}
                                </p>
                                <div className={`mt-2 inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-sm font-semibold ${
                                    gainLoss >= 0
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-red-100 text-red-700'
                                }`}>
                                    {gainLoss >= 0 ? '+' : '-'}
                                    {formatSidebarCurrency(Math.abs(gainLoss))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="rounded-[18px] border border-gray-200 bg-white p-3">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                                    Starting Cash
                                </p>
                                <p className="mt-1 text-lg font-semibold text-gray-950">
                                    {formatSidebarCurrency(startingCash)}
                                </p>
                            </div>
                            <div className="rounded-[18px] border border-gray-200 bg-white p-3">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                                    Holdings
                                </p>
                                <p className="mt-1 text-lg font-semibold text-gray-950">
                                    {wallet.length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <p className={sectionLabelClass}>Wallet</p>
                    <div className={panelClass}>
                        <div className="wallet-scroll max-h-[260px] space-y-3 overflow-y-auto pr-2">
                            {wallet.map(item => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 rounded-[20px] border border-gray-200 bg-gradient-to-r from-gray-50 to-white px-3 py-3"
                                >
                                    <WalletIcon label={item.label} />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="truncate text-sm font-semibold text-gray-950">
                                                {item.label}
                                            </p>
                                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                                                {item.id === 'cash' ? 'Cash' : item.id === 'car' ? 'Asset' : 'Stock'}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {item.id === 'cash'
                                                ? `${formatSidebarCurrency(item.units)} available`
                                                : `${item.units.toFixed(4)} ${item.unitLabel}`}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-950">
                                            {formatSidebarCurrency(item.usdValue)}
                                        </p>
                                        <p className="mt-1 text-xs font-medium text-gray-400">
                                            {totalValue > 0 ? `${((item.usdValue / totalValue) * 100).toFixed(1)}% of wallet` : '0.0% of wallet'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <p className={sectionLabelClass}>Market Mover</p>
                    <div className={panelClass}>
                        {marketMover ? (
                            <>
                                <div className="flex items-start gap-4">
                                    <AssetAvatar
                                        symbol={marketMover.symbol}
                                        name={marketMover.name}
                                        size={40}
                                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border ${
                                            marketMover.positive
                                                ? 'border-emerald-200 bg-emerald-50'
                                                : 'border-red-200 bg-red-50'
                                        }`}
                                        imageClassName="h-9 w-9 object-contain"
                                        fallbackTextClassName="text-sm"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-400">
                                            Featured Stock
                                        </p>
                                        <div className="mt-1 flex flex-wrap items-center gap-2">
                                            <p className="truncate text-lg font-semibold tracking-tight text-gray-950">
                                                {marketMover.name}
                                            </p>
                                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                                {marketMover.symbol}
                                            </span>
                                        </div>
                                        <div className="mt-3 flex flex-wrap items-center gap-3">
                                            <p className="text-2xl font-semibold tracking-tight text-gray-950">
                                                {formatSidebarCurrency(marketMover.price)}
                                            </p>
                                            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
                                                marketMover.positive
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}>
                                                {marketMover.change >= 0 ? '+' : ''}
                                                {marketMover.change.toFixed(2)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className={`mt-4 rounded-[22px] border p-3 ${
                                    marketMover.positive
                                        ? 'border-emerald-100 bg-gradient-to-b from-emerald-50 via-white to-white'
                                        : 'border-red-100 bg-gradient-to-b from-red-50 via-white to-white'
                                }`}>
                                    <div className="h-[128px] overflow-hidden rounded-[18px] bg-white px-3 py-3">
                                        <MarketMoverChart
                                            data={marketMover.spark}
                                            positive={marketMover.positive}
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    <StatTile
                                        label="Previous Close"
                                        value={formatSidebarCurrency(marketMover.previous?.close ?? marketMover.price)}
                                    />
                                    <StatTile
                                        label="Day Range"
                                        value={`${formatSidebarCurrency(marketMover.today.low)} - ${formatSidebarCurrency(marketMover.today.high)}`}
                                    />
                                    <StatTile
                                        label="Move"
                                        value={`${marketMover.change >= 0 ? '+' : ''}${marketMover.change.toFixed(2)}%`}
                                        positive={marketMover.positive}
                                    />
                                    <StatTile
                                        label="Volume"
                                        value={formatVolume(marketMover.today.volume)}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="rounded-[22px] border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                                No market mover data is available for this day yet.
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <p className={sectionLabelClass}>News Feed</p>
                    <div className={panelClass}>
                        <DailyNewsFeed dateStr={dateStr} scenarioId={scenarioId} />
                    </div>
                </div>

                <div>
                    <p className={sectionLabelClass}>Tickets</p>
                    <div className="rounded-[28px] border border-yellow-100 bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                        <div className="space-y-3">
                            <LotteryTicket
                                title="Budget Banger"
                                price="$5.00"
                                tone="pink"
                            />
                            <LotteryTicket
                                title="Mediocre Fortune"
                                price="$15.00"
                                tone="green"
                            />
                            <LotteryTicket
                                title="Eternal Riches Maybe"
                                price="$30.00"
                                tone="gold"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}

function WalletIcon({ label }: { label: string }) {
    if (label === 'Cash') {
        return (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-emerald-200 bg-gradient-to-br from-emerald-100 via-white to-emerald-50 p-2 shadow-[0_6px_16px_rgba(16,185,129,0.18)]">
                <Image
                    src="/images/money.png"
                    alt="Cash icon"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                />
            </div>
        );
    }

    if (label === 'Car') {
        return (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-slate-50 p-2 shadow-[0_6px_16px_rgba(59,130,246,0.12)]">
                <Image
                    src="/images/events/car.png"
                    alt="Car asset"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                />
            </div>
        );
    }

    return (
        <AssetAvatar
            symbol={label}
            size={32}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-gray-200 bg-white p-2 shadow-[0_6px_16px_rgba(15,23,42,0.06)]"
            imageClassName="h-8 w-8 object-contain"
            fallbackTextClassName="text-[10px]"
        />
    );
}


function StatTile({
    label,
    value,
    positive,
}: {
    label: string;
    value: string;
    positive?: boolean;
}) {
    return (
        <div className="rounded-[18px] border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                {label}
            </p>
            <p className={`mt-1 text-sm font-semibold ${
                positive === undefined
                    ? 'text-gray-950'
                    : positive
                        ? 'text-emerald-700'
                        : 'text-red-700'
            }`}>
                {value}
            </p>
        </div>
    );
}

function MarketMoverChart({
    data,
    positive,
}: {
    data: number[];
    positive: boolean;
}) {
    if (data.length === 0) {
        return <div className="h-full w-full" />;
    }

    const safeData = data.length === 1 ? [data[0], data[0]] : data;
    const viewWidth = 320;
    const viewHeight = 150;
    const chartLeft = 8;
    const chartRight = 312;
    const chartTop = 12;
    const chartBottom = 126;
    const lineColor = positive ? '#16a34a' : '#dc2626';
    const gradientId = positive ? 'market-mover-fill-positive' : 'market-mover-fill-negative';

    const max = Math.max(...safeData);
    const min = Math.min(...safeData);
    const span = Math.max(max - min, 1);
    const paddedMax = max + span * 0.18;
    const paddedMin = min - span * 0.18;

    const points = safeData.map((value, index) => {
        const x = chartLeft + (index / (safeData.length - 1)) * (chartRight - chartLeft);
        const y =
            chartBottom - ((value - paddedMin) / (paddedMax - paddedMin)) * (chartBottom - chartTop);
        return { x, y };
    });

    const linePath = points
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
        .join(' ');
    const areaPath = [
        `M ${points[0].x} ${chartBottom}`,
        ...points.map(point => `L ${point.x} ${point.y}`),
        `L ${points[points.length - 1].x} ${chartBottom}`,
        'Z',
    ].join(' ');
    const activePoint = points[points.length - 1];

    return (
        <svg
            viewBox={`0 0 ${viewWidth} ${viewHeight}`}
            preserveAspectRatio="none"
            className="h-full w-full"
        >
            <defs>
                <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={lineColor} stopOpacity="0.24" />
                    <stop offset="65%" stopColor={lineColor} stopOpacity="0.08" />
                    <stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
                </linearGradient>
            </defs>

            {Array.from({ length: 4 }, (_, index) => {
                const y = chartTop + (index / 3) * (chartBottom - chartTop);
                return (
                    <line
                        key={y}
                        x1={chartLeft}
                        x2={chartRight}
                        y1={y}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                    />
                );
            })}

            <path d={areaPath} fill={`url(#${gradientId})`} />
            <path
                d={linePath}
                fill="none"
                stroke={lineColor}
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
            />

            <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r={5.5}
                fill="#ffffff"
                stroke={lineColor}
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
            />
            <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r={2.25}
                fill={lineColor}
            />
        </svg>
    );
}

function LotteryTicket({
    title,
    price,
    tone,
}: {
    title: string;
    price: string;
    tone: 'pink' | 'green' | 'gold';
}) {
    const styles = {
        pink: {
            card: 'border-pink-200 bg-pink-50',
            button: 'bg-pink-600 text-white hover:bg-pink-500',
            price: 'text-pink-700',
        },
        green: {
            card: 'border-emerald-200 bg-emerald-50',
            button: 'bg-emerald-600 text-white hover:bg-emerald-500',
            price: 'text-emerald-700',
        },
        gold: {
            card: 'border-amber-200 bg-amber-50',
            button: 'bg-amber-500 text-white hover:bg-amber-400',
            price: 'text-amber-700',
        },
    }[tone];

    return (
        <div className={`flex items-center justify-between rounded-[22px] border px-4 py-4 ${styles.card}`}>
            <div>
                <p className="text-sm font-semibold text-gray-950">{title}</p>
                <p className={`mt-1 text-sm font-semibold ${styles.price}`}>{price}</p>
            </div>
            <button className={`rounded-full px-4 py-2 text-sm font-semibold transition ${styles.button}`}>
                Buy
            </button>
        </div>
    );
}

function formatSidebarCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function formatVolume(value: number) {
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(value);
}
