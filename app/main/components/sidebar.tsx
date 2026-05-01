'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { formatWalletUnits, WalletItem } from '../utils/walletData';
import {
    getScenarioAssetCatalogs,
    getAssetsWithMarket,
    toLocalDateStr,
    type AssetWithData,
} from '../utils/marketData';
import AssetAvatar from './AssetAvatar';
import DailyNewsFeed from './DailyNewsFeed';

type LotteryTone = 'pink' | 'green' | 'gold';

type LotteryPrize = {
    amount: number;
    chance: number;
    label: string;
};

type LotteryTicketConfig = {
    title: string;
    price: number;
    tone: LotteryTone;
    kicker: string;
    prizes: LotteryPrize[];
};

type ScratchSession = {
    ticket: LotteryTicketConfig;
    prize: LotteryPrize;
};

const LOTTERY_TICKETS: LotteryTicketConfig[] = [
    {
        title: 'Budget Banger',
        price: 5,
        tone: 'pink',
        kicker: 'Cheap shot, tiny odds, fast fun.',
        prizes: [
            { amount: 0, chance: 0.48, label: 'No win' },
            { amount: 5, chance: 0.2, label: 'Break-even' },
            { amount: 10, chance: 0.16, label: 'Small win' },
            { amount: 25, chance: 0.1, label: 'Nice hit' },
            { amount: 100, chance: 0.05, label: 'Big hit' },
            { amount: 500, chance: 0.01, label: 'Jackpot' },
        ],
    },
    {
        title: 'Mediocre Fortune',
        price: 15,
        tone: 'green',
        kicker: 'Balanced odds with a few real jumps.',
        prizes: [
            { amount: 0, chance: 0.44, label: 'No win' },
            { amount: 10, chance: 0.16, label: 'Soft loss' },
            { amount: 15, chance: 0.14, label: 'Break-even' },
            { amount: 30, chance: 0.14, label: 'Small win' },
            { amount: 75, chance: 0.08, label: 'Strong win' },
            { amount: 300, chance: 0.03, label: 'Huge hit' },
            { amount: 1000, chance: 0.01, label: 'Jackpot' },
        ],
    },
    {
        title: 'Eternal Riches Maybe',
        price: 30,
        tone: 'gold',
        kicker: 'Worst odds, biggest dream.',
        prizes: [
            { amount: 0, chance: 0.42, label: 'No win' },
            { amount: 20, chance: 0.15, label: 'Soft loss' },
            { amount: 30, chance: 0.13, label: 'Break-even' },
            { amount: 60, chance: 0.13, label: 'Small win' },
            { amount: 150, chance: 0.09, label: 'Strong win' },
            { amount: 600, chance: 0.06, label: 'Massive hit' },
            { amount: 2500, chance: 0.02, label: 'Jackpot' },
        ],
    },
];

export default function Sidebar({
    wallet,
    setWallet,
    currentDate,
    scenarioId,
    startingCash,
    characterName,
    characterId,
}: {
    wallet: WalletItem[];
    setWallet: React.Dispatch<React.SetStateAction<WalletItem[]>>;
    currentDate: Date;
    scenarioId: string;
    startingCash: number;
    characterName: string;
    characterId?: string | null;
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
    const cashAvailable = wallet.find(item => item.id === 'cash')?.units ?? 0;
    const panelClass = 'rounded-[24px] border border-gray-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]';
    const sectionLabelClass = 'mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-gray-400';
    const [pendingTicket, setPendingTicket] = useState<LotteryTicketConfig | null>(null);
    const [scratchSession, setScratchSession] = useState<ScratchSession | null>(null);
    const [prizeCredited, setPrizeCredited] = useState(false);

    const buyTicket = (ticket: LotteryTicketConfig) => {
        if (cashAvailable < ticket.price) return;
        const prize = drawLotteryPrize(ticket.prizes);

        setWallet(prev =>
            prev.map(item =>
                item.id === 'cash'
                    ? {
                          ...item,
                          units: item.units - ticket.price,
                          usdValue: item.usdValue - ticket.price,
                      }
                    : item
            )
        );
        setPendingTicket(null);
        setPrizeCredited(false);
        setScratchSession({ ticket, prize });
    };

    const collectPrize = () => {
        if (!scratchSession || prizeCredited) {
            setScratchSession(null);
            return;
        }

        if (scratchSession.prize.amount > 0) {
            setWallet(prev =>
                prev.map(item =>
                    item.id === 'cash'
                        ? {
                              ...item,
                              units: item.units + scratchSession.prize.amount,
                              usdValue: item.usdValue + scratchSession.prize.amount,
                          }
                        : item
                )
            );
        }

        setPrizeCredited(true);
        setScratchSession(null);
    };

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
                                {characterName}
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
                                    <WalletIcon item={item} />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="truncate text-sm font-semibold text-gray-950">
                                                {item.label}
                                            </p>
                                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                                                {item.id === 'cash'
                                                    ? 'Cash'
                                                    : item.id === 'car'
                                                      ? 'Asset'
                                                      : item.id === 'monthly-income'
                                                        ? 'JOB'
                                                        : 'Stock'}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {item.id === 'cash'
                                                ? `${formatSidebarCurrency(item.units)} available`
                                                : formatWalletUnits(item)}
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
                        <DailyNewsFeed
                            dateStr={dateStr}
                            scenarioId={scenarioId}
                            characterId={characterId}
                        />
                    </div>
                </div>

                <div>
                    <p className={sectionLabelClass}>Tickets</p>
                    <div className="rounded-[28px] border border-yellow-100 bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                        <p className={`mb-4 rounded-[18px] px-3 py-2 text-sm font-medium ${
                            cashAvailable >= LOTTERY_TICKETS[0].price
                                ? 'border border-yellow-200 bg-white/80 text-slate-600'
                                : 'border border-red-200 bg-red-50 text-red-700'
                        }`}>
                            {cashAvailable >= LOTTERY_TICKETS[0].price
                                ? `Cash available for tickets: ${formatSidebarCurrency(cashAvailable)}`
                                : `You need at least ${formatSidebarCurrency(LOTTERY_TICKETS[0].price)} cash to buy any ticket.`}
                        </p>
                        <div className="space-y-3">
                            {LOTTERY_TICKETS.map(ticket => (
                                <LotteryTicket
                                    key={ticket.title}
                                    title={ticket.title}
                                    price={formatSidebarCurrency(ticket.price)}
                                    tone={ticket.tone}
                                    disabled={cashAvailable < ticket.price}
                                    onBuy={() => setPendingTicket(ticket)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {pendingTicket ? (
                <LotteryConfirmModal
                    ticket={pendingTicket}
                    cashAvailable={cashAvailable}
                    onCancel={() => setPendingTicket(null)}
                    onConfirm={() => buyTicket(pendingTicket)}
                />
            ) : null}
            {scratchSession ? (
                <LotteryScratchModal
                    session={scratchSession}
                    onClose={collectPrize}
                />
            ) : null}
        </aside>
    );
}

function WalletIcon({ item }: { item: WalletItem }) {
    if (item.id === 'cash') {
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

    if (item.id === 'monthly-income') {
        return (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-2 shadow-[0_6px_16px_rgba(14,165,233,0.14)]">
                <Image
                    src="/images/COVID-19-PANDEMIC/icons/job.png"
                    alt="Job income icon"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                />
            </div>
        );
    }

    if (item.id === 'car') {
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
            symbol={item.label}
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
    disabled = false,
    onBuy,
}: {
    title: string;
    price: string;
    tone: 'pink' | 'green' | 'gold';
    disabled?: boolean;
    onBuy: () => void;
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
            <button
                onClick={onBuy}
                disabled={disabled}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    disabled
                        ? 'cursor-not-allowed bg-gray-200 text-gray-500'
                        : styles.button
                }`}
            >
                Buy
            </button>
        </div>
    );
}

function LotteryConfirmModal({
    ticket,
    cashAvailable,
    onCancel,
    onConfirm,
}: {
    ticket: LotteryTicketConfig;
    cashAvailable: number;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    const styles = getLotteryToneStyles(ticket.tone);
    const canAfford = cashAvailable >= ticket.price;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4 backdrop-blur-[2px]">
            <div className={`w-full max-w-md rounded-[30px] border p-6 shadow-[0_28px_80px_rgba(15,23,42,0.25)] ${styles.modal}`}>
                <p className={`text-xs font-semibold uppercase tracking-[0.26em] ${styles.label}`}>
                    {ticket.title}
                </p>
                <h3 className="mt-3 text-2xl font-bold text-slate-950">
                    Buy this ticket?
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">
                    {ticket.kicker} Ticket price: <span className="font-semibold">{formatSidebarCurrency(ticket.price)}</span>.
                </p>

                <div className="mt-5 rounded-[22px] border border-white/70 bg-white/75 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Prize chances
                    </p>
                    <div className="mt-3 space-y-2">
                        {ticket.prizes.map(prize => (
                            <div key={`${ticket.title}-${prize.amount}`} className="flex items-center justify-between gap-3 text-sm">
                                <span className="font-medium text-slate-800">
                                    {prize.amount === 0 ? 'No win' : formatSidebarCurrency(prize.amount)}
                                </span>
                                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                                    {(prize.chance * 100).toFixed(prize.chance < 0.01 ? 1 : 0)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className={`mt-4 text-sm ${canAfford ? 'text-slate-600' : 'font-semibold text-red-600'}`}>
                    Cash available: {formatSidebarCurrency(cashAvailable)}
                </p>

                <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!canAfford}
                        className={`rounded-full px-5 py-2 text-sm font-semibold text-white transition ${
                            canAfford ? styles.button : 'cursor-not-allowed bg-slate-300'
                        }`}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}

function LotteryScratchModal({
    session,
    onClose,
}: {
    session: ScratchSession;
    onClose: () => void;
}) {
    const styles = getLotteryToneStyles(session.ticket.tone);
    const [scratchedEnough, setScratchedEnough] = useState(false);
    const [scratchPercent, setScratchPercent] = useState(0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-[2px]">
            <div className={`w-full max-w-lg rounded-[32px] border p-6 shadow-[0_28px_80px_rgba(15,23,42,0.25)] ${styles.modal}`}>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className={`text-xs font-semibold uppercase tracking-[0.26em] ${styles.label}`}>
                            {session.ticket.title}
                        </p>
                        <h3 className="mt-3 text-2xl font-bold text-slate-950">
                            Scratch your ticket
                        </h3>
                    </div>
                    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600">
                        {scratchPercent}% cleared
                    </span>
                </div>

                <div className="mt-5">
                    <ScratchCard
                        tone={session.ticket.tone}
                        prize={session.prize}
                        onProgress={setScratchPercent}
                        onReveal={() => setScratchedEnough(true)}
                    />
                </div>

                <p className="mt-4 text-sm leading-relaxed text-slate-700">
                    Scratch away the coating to reveal your prize. Once 25% of the ticket is cleared,
                    you can close it and any winnings go directly back into Cash.
                </p>

                <div className="mt-6 flex items-center justify-end">
                    <button
                        onClick={onClose}
                        disabled={!scratchedEnough}
                        className={`rounded-full px-5 py-2 text-sm font-semibold text-white transition ${
                            scratchedEnough ? styles.button : 'cursor-not-allowed bg-slate-300'
                        }`}
                    >
                        {session.prize.amount > 0 ? 'Collect winnings' : 'Close ticket'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ScratchCard({
    tone,
    prize,
    onProgress,
    onReveal,
}: {
    tone: LotteryTone;
    prize: LotteryPrize;
    onProgress: (percent: number) => void;
    onReveal: () => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const isDrawingRef = useRef(false);
    const revealedRef = useRef(false);
    const styles = getLotteryToneStyles(tone);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = 560;
        canvas.height = 280;

        context.globalCompositeOperation = 'source-over';
        context.clearRect(0, 0, canvas.width, canvas.height);

        const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, styles.scratchStart);
        gradient.addColorStop(1, styles.scratchEnd);
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = 'rgba(255,255,255,0.45)';
        context.font = '700 22px system-ui';
        context.textAlign = 'center';
        context.fillText('SCRATCH TO REVEAL', canvas.width / 2, canvas.height / 2 + 8);

        revealedRef.current = false;
        onProgress(0);
    }, [onProgress, styles.scratchEnd, styles.scratchStart]);

    const eraseAtPoint = (clientX: number, clientY: number) => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        const rect = container.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;

        context.globalCompositeOperation = 'destination-out';
        context.beginPath();
        context.arc(x, y, 42, 0, Math.PI * 2);
        context.fill();
    };

    const updateProgress = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
        let transparentPixels = 0;
        for (let index = 3; index < data.length; index += 4) {
            if (data[index] < 80) transparentPixels += 1;
        }
        const percent = Math.min(100, Math.round((transparentPixels / (canvas.width * canvas.height)) * 100));
        onProgress(percent);

        if (percent >= 25 && !revealedRef.current) {
            revealedRef.current = true;
            onReveal();
        }
    };

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden rounded-[28px] border ${styles.card}`}
            onPointerDown={(event) => {
                isDrawingRef.current = true;
                eraseAtPoint(event.clientX, event.clientY);
                updateProgress();
            }}
            onPointerMove={(event) => {
                if (!isDrawingRef.current) return;
                eraseAtPoint(event.clientX, event.clientY);
                updateProgress();
            }}
            onPointerUp={() => {
                isDrawingRef.current = false;
                updateProgress();
            }}
            onPointerLeave={() => {
                isDrawingRef.current = false;
            }}
        >
            <div className={`relative flex min-h-[220px] flex-col items-center justify-center px-6 py-8 text-center ${styles.reveal}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                    Prize underneath
                </p>
                <p className="mt-4 text-4xl font-black tracking-tight text-slate-950">
                    {prize.amount > 0 ? formatSidebarCurrency(prize.amount) : '$0'}
                </p>
                <p className="mt-3 text-base font-semibold text-slate-700">
                    {prize.label}
                </p>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-600">
                    {prize.amount > 0
                        ? 'Nice. Clear enough of the ticket and collect your winnings.'
                        : 'No luck this time. Clear the ticket to finish the reveal.'}
                </p>
            </div>
            <canvas
                ref={canvasRef}
                className="absolute inset-0 h-full w-full touch-none"
            />
        </div>
    );
}

function drawLotteryPrize(prizes: LotteryPrize[]) {
    const roll = Math.random();
    let cumulative = 0;

    for (const prize of prizes) {
        cumulative += prize.chance;
        if (roll <= cumulative) return prize;
    }

    return prizes[prizes.length - 1];
}

function getLotteryToneStyles(tone: LotteryTone) {
    switch (tone) {
        case 'pink':
            return {
                modal: 'border-pink-200 bg-gradient-to-br from-pink-50 via-white to-rose-50',
                label: 'text-pink-500',
                button: 'bg-pink-600 hover:bg-pink-500',
                card: 'border-pink-200 bg-white',
                reveal: 'bg-gradient-to-br from-pink-50 via-white to-rose-50',
                scratchStart: '#f472b6',
                scratchEnd: '#ec4899',
            };
        case 'green':
            return {
                modal: 'border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50',
                label: 'text-emerald-600',
                button: 'bg-emerald-600 hover:bg-emerald-500',
                card: 'border-emerald-200 bg-white',
                reveal: 'bg-gradient-to-br from-emerald-50 via-white to-teal-50',
                scratchStart: '#34d399',
                scratchEnd: '#10b981',
            };
        case 'gold':
        default:
            return {
                modal: 'border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50',
                label: 'text-amber-600',
                button: 'bg-amber-500 hover:bg-amber-400',
                card: 'border-amber-200 bg-white',
                reveal: 'bg-gradient-to-br from-amber-50 via-white to-orange-50',
                scratchStart: '#fbbf24',
                scratchEnd: '#f59e0b',
            };
    }
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
