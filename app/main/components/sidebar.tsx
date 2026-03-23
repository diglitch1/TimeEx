'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { WalletItem } from '../utils/walletData';

const aaplData = {
    symbol: 'AAPL',
    name: 'Apple',
    change: 2.8,
    prices: [
        221.4, 221.1, 223.3, 223.0, 221.6,
        222.0, 222.4, 222.1, 222.6, 223.0,
        223.4, 222.1, 224.6, 224.2, 224.9,
        225.3, 224.1, 225.8, 226.5, 226.0,
        225.22,
    ],
    sell: 226.81,
    buy: 227.22,
};

const ALL_ASSETS = ['ETH', 'BTC', 'EURUSD', 'OIL', 'GOLD', 'NSDQ100', 'AAPL', 'SOL', 'TSLA', 'NVDA', 'ADA'];

const ASSET_LOOKUP: Record<
    string,
    { change: number; positive: boolean }
> = {
    ETH: { change: 1.8, positive: true },
    BTC: { change: 0.92, positive: true },
    EURUSD: { change: -0.14, positive: false },
    OIL: { change: 2.31, positive: true },
    GOLD: { change: -2.13, positive: false },
    NSDQ100: { change: 0.24, positive: true },
    AAPL: { change: 2.8, positive: true },
    SOL: { change: -1.86, positive: false },
    TSLA: { change: 2.34, positive: true },
    NVDA: { change: 1.3, positive: true },
    ADA: { change: 0.97, positive: true },
};


export default function Sidebar({
                                    wallet,
                                    watchlist,
                                    setWatchlist,
                                }: {
    wallet: WalletItem[];
    watchlist: string[];
    setWatchlist: React.Dispatch<React.SetStateAction<string[]>>;
}) {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<'add' | 'remove'>('add');

    const STARTING_CASH = 7000;

    const totalValue = wallet.reduce(
        (sum, item) => sum + item.usdValue,
        0
    );

    const gainLoss = totalValue - STARTING_CASH;
    const panelClass = 'rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]';
    const sectionLabelClass = 'mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-gray-400';

    return (
        <aside className="w-[416px] shrink-0 border-r border-gray-200 bg-[#f8fafc] px-5 py-6 text-base">
            <div className="flex h-full flex-col gap-5">
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
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-400">
                                Portfolio Terminal
                            </p>
                            <p className="text-2xl font-semibold tracking-tight text-gray-950">
                                TimeEx
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 rounded-[24px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-white p-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-400">
                                    Net Worth
                                </p>
                                <p className="mt-1 text-[2.6rem] font-semibold tracking-tight text-gray-950">
                                    {formatSidebarCurrency(totalValue)}
                                </p>
                            </div>
                            <div className={`rounded-full px-3 py-1 text-sm font-semibold ${
                                gainLoss >= 0
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-red-100 text-red-700'
                            }`}>
                                {gainLoss >= 0 ? '+' : '-'}
                                {formatSidebarCurrency(Math.abs(gainLoss))}
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="rounded-[18px] border border-gray-200 bg-white p-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                                    Starting Cash
                                </p>
                                <p className="mt-1 text-xl font-semibold text-gray-950">
                                    {formatSidebarCurrency(STARTING_CASH)}
                                </p>
                            </div>
                            <div className="rounded-[18px] border border-gray-200 bg-white p-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                                    Holdings
                                </p>
                                <p className="mt-1 text-xl font-semibold text-gray-950">
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
                                    className="flex items-center gap-4 rounded-[22px] border border-gray-200 bg-gradient-to-r from-gray-50 to-white px-4 py-4"
                                >
                                    <WalletIcon label={item.label} />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="truncate text-base font-semibold text-gray-950">
                                                {item.label}
                                            </p>
                                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                                                {item.label === 'Cash' ? 'Cash' : 'Stock'}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {item.label === 'Cash'
                                                ? `${formatSidebarCurrency(item.units)} available`
                                                : `${item.units.toFixed(4)} ${item.unitLabel}`}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-base font-semibold text-gray-950">
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
                    <div className="mb-3 flex items-center justify-between">
                        <p className={sectionLabelClass}>Watchlist</p>
                        <button
                            onClick={() => setOpen(o => !o)}
                            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-gray-600 transition hover:border-blue-200 hover:text-blue-600"
                        >
                            Manage
                        </button>
                    </div>

                    {open && (
                        <div className="mb-3 rounded-[20px] border border-gray-200 bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                            <div className="mb-3 flex gap-2">
                                <button
                                    onClick={() => setMode('add')}
                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${
                                        mode === 'add'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}
                                >
                                    Add
                                </button>

                                <button
                                    onClick={() => setMode('remove')}
                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${
                                        mode === 'remove'
                                            ? 'bg-red-600 text-white'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}
                                >
                                    Remove
                                </button>
                            </div>

                            <div className="space-y-1">
                                {(mode === 'add'
                                        ? ALL_ASSETS.filter(a => !watchlist.includes(a))
                                        : watchlist
                                ).map(symbol => (
                                    <button
                                        key={symbol}
                                        onClick={() => {
                                            setWatchlist(prev =>
                                                mode === 'add'
                                                    ? [...prev, symbol]
                                                    : prev.filter(s => s !== symbol)
                                            );
                                        }}
                                        className="block w-full rounded-[14px] px-3 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                    >
                                        {symbol}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={panelClass}>
                        <div className="space-y-3">
                            {watchlist.map(symbol => {
                                const asset = ASSET_LOOKUP[symbol];

                                if (!asset) return null;

                                return (
                                    <WatchItem
                                        key={symbol}
                                        name={symbol}
                                        change={`${asset.positive ? '+' : ''}${asset.change}%`}
                                        positive={asset.positive}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div>
                    <p className={sectionLabelClass}>News Feed</p>
                    <div className={panelClass}>
                        <div className="space-y-4">
                            <NewsItem
                                img="/images/news/news1.png"
                                text="Goldman Sachs unveils its 10-year playbook and AI is at the heart of it"
                            />

                            <NewsItem
                                img="/images/news/news2.png"
                                text="Earnings playbook: Nvidia and retailers headline the tail end of the season"
                            />

                            <NewsItem
                                img="/images/news/news3.png"
                                text="Ed Yardeni says gold is the best safe-haven play and the new bitcoin"
                            />
                        </div>

                        <ReadMoreButton />
                    </div>
                </div>

                <div>
                    <p className={sectionLabelClass}>Market Mover</p>
                    <div className={panelClass}>
                        <div className="flex items-center gap-3">
                            <Image
                                src="/images/assets/apple.png"
                                alt="Apple logo"
                                width={56}
                                height={56}
                                className="h-14 w-14 rounded-[20px] object-cover"
                            />

                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-950">Apple</p>
                                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                                    AAPL
                                </p>
                            </div>

                            <div className="ml-auto text-right">
                                <p className="text-lg font-semibold text-gray-950">
                                    {formatSidebarCurrency(aaplData.buy)}
                                </p>
                                <p className="text-sm font-semibold text-emerald-700">
                                    +{aaplData.change.toFixed(2)}%
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 rounded-[22px] border border-blue-100 bg-gradient-to-b from-blue-50 via-white to-white p-3">
                            <div className="h-[110px] overflow-hidden rounded-[18px] bg-white px-3 py-2">
                                <FakeChart data={aaplData.prices}/>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                            <button className="rounded-[18px] border border-gray-200 bg-gray-50 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100">
                                Sell {formatSidebarCurrency(aaplData.sell)}
                            </button>

                            <button className="rounded-[18px] bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">
                                Buy {formatSidebarCurrency(aaplData.buy)}
                            </button>
                        </div>
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

function WatchItem({
                       name,
                       change,
                       positive,
                   }: {
    name: string;
    change: string;
    positive: boolean;
}) {
    return (
        <div className="flex items-center justify-between rounded-[20px] border border-gray-200 bg-gray-50 px-4 py-3">
            <div>
                <p className="text-sm font-semibold text-gray-950">{name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-gray-400">
                    Live Watch
                </p>
            </div>
            <span className={`text-sm font-semibold ${positive ? 'text-emerald-700' : 'text-red-700'}`}>
                {change}
            </span>
        </div>
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

    const iconPath = `/images/assets/${label.toLowerCase()}.png`;

    return (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-gray-200 bg-white p-2 shadow-[0_6px_16px_rgba(15,23,42,0.06)]">
            <Image
                src={iconPath}
                alt={`${label} logo`}
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
            />
        </div>
    );
}


function NewsItem({img, text,}: {
    img: string;
    text: string;
}) {
    return (
        <div className="flex items-start gap-4">
            <Image
                src={img}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 rounded-[18px] object-cover"
            />
            <div className="min-w-0">
                <p className="text-sm font-medium leading-snug text-gray-900">
                    {text}
                </p>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                    Market News
                </p>
            </div>
        </div>
    );
}

function ReadMoreButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.push('/news')}
            className="mt-5 w-full rounded-full border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition hover:border-blue-200 hover:text-blue-600"
        >
            Read More
        </button>
    );
}


function FakeChart({ data }: { data: number[] }) {
    const max = Math.max(...data);
    const min = Math.min(...data);

    const points = data
        .map((value, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((value - min) / (max - min)) * 100;
            return `${x},${y}`;
        })
        .join(' ');

    return (
        <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                display: 'block',
            }}>
            <polyline
                points={points}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
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
