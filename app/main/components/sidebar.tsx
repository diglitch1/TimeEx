'use client';

import Image from 'next/image';
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

    return (
        <aside className="w-[380px] bg-[#f3f4f6] border-r border-gray-300 px-6 py-6 flex flex-col gap-4 text-base">

            {/* Logo */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-300">
                <Image
                    src="/logo.png"
                    alt="TimeEx logo"
                    width={36}
                    height={36}
                />
                <span className="text-2xl font-bold text-blue-600">
                    TimeEx
                </span>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-400"/>
                <h2 className="text-xl font-semibold text-gray-900">
                    Profile
                </h2>
            </div>

            {/* Wallet window */}
            <h3 className="text-xl font-semibold text-gray-900 " style={{marginBottom: -8}}>
                Wallet
            </h3>

            <div className="rounded-xl bg-white border border-gray-300 p-4">

                {/* Scrollable assets */}
                <div className="wallet-scroll max-h-[180px] overflow-y-auto pr-3 space-y-2 text-gray-800">
                    {wallet.map(item => (
                        <p key={item.id}>
                            {item.label}:{' '}
                            <span className="font-medium">{item.units.toFixed(3)} {item.unitLabel}</span>
                            <span className="text-gray-500"> (~${item.usdValue.toFixed(2)})</span>
                        </p>

                    ))}
                </div>

                <div className="my-4 border-t border-gray-200"/>

                {/*  im not sure how exactly are gains/losses calculated, so leaving this out for now
                  <div
                    className={`font-semibold text-lg ${
                        gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    Gain/Loss: {gainLoss >= 0 ? '+' : ''}
                    {gainLoss.toFixed(2)} $
                </div> */}

                <div className="mt-1 font-semibold text-gray-900 text-lg">
                    Cash Out Value: {totalValue.toFixed(2)} $
                </div>

            </div>

            {/* Watchlist */}
            {/* Watchlist */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                        My watchlist
                    </h3>

                    <button
                        onClick={() => setOpen(o => !o)}
                        className="text-sm px-3 py-1 rounded-full border border-gray-900 bg-blue-600 hover:bg-gray-900"
                    >
                        manage
                    </button>
                </div>

                {open && (
                    <div className="mb-3 rounded-lg border border-gray-300 bg-white p-3">
                        <div className="flex gap-2 mb-2">
                            <button
                                onClick={() => setMode('add')}
                                className={`px-3 py-1 rounded-full text-sm ${
                                    mode === 'add' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                                }`}
                            >
                                add
                            </button>

                            <button
                                onClick={() => setMode('remove')}
                                className={`px-3 py-1 rounded-full text-sm ${
                                    mode === 'remove' ? 'bg-red-500 text-white' : 'bg-gray-200'
                                }`}
                            >
                                remove
                            </button>
                        </div>

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
                                className="block w-full text-left px-2 py-1 rounded hover:bg-gray-900 text-sm text-gray-600"
                            >
                                {symbol}
                            </button>
                        ))}
                    </div>
                )}

                <div className="rounded-xl bg-white border border-gray-300 p-4 space-y-3">
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


            {/* News Feed */}
            <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                    News Feed
                </h3>

                <div className="rounded-xl bg-white border border-gray-300 p-4 space-y-4">

                    <NewsItem
                        img="/news/news1.png"
                        text="Goldman Sachs unveils its 10-year playbook — and AI is at the heart of it"
                    />

                    <NewsItem
                        img="/news/news2.png"
                        text="Earnings playbook: Nvidia, retailers headline the tail end of the season"
                    />

                    <NewsItem
                        img="/news/news3.png"
                        text="Ed Yardeni says gold is the best safe-haven play and ‘the new bitcoin’"
                    />

                    <ReadMoreButton />

                </div>
            </div>

            {/* Current Market Mover */}
            <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                    Current Marketmover
                </h3>

                <div className="rounded-xl bg-white border border-gray-300 p-4">

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-2">
                        <img
                            src="/assets/apple.png"
                            className="w-16 h-16 rounded-md object-cover"/>

                        <div>
                            <p className="font-semibold text-gray-900">AAPL</p>
                            <p className="text-sm text-gray-500">Apple</p>
                        </div>

                        <div className="ml-auto text-green-500 font-semibold">
                            +2.80%
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="h-[90px] bg-blue-50 rounded-lg mb-2 p-3 overflow-hidden">
                        <FakeChart data={aaplData.prices}/>
                    </div>


                    {/* Buy / Sell */}
                    <div className="grid grid-cols-2 gap-2">
                        <button className="rounded-md bg-gray-400 text-white py-2 font-semibold">
                            sell<br/>226.81
                        </button>

                        <button className="rounded-md bg-gray-600 text-white py-2 font-semibold">
                            buy<br/>227.22
                        </button>
                    </div>
                </div>
            </div>

            {/* Lottery Tickets */}
            <div>
                <h3
                    style={{
                        color: '#E39B00',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '20px',
                        marginBottom: '0px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                    }}
                    className="mb-3 flex items-center gap-2 w-fit"
                >
                    Lottery Tickets

                </h3>

                <div
                    className="rounded-xl p-4 space-y-4"
                    style={{
                        backgroundImage: 'url(/lottery.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}>
                    {/* Ticket 1 */}
                    <div
                        className="rounded-xl px-6 py-3 flex items-center justify-between"
                        style={{
                            backgroundColor: '#FF7FA3',
                            border: '2px solid white',
                        }}>
                        <div style={{color: 'white'}}>
                            <div style={{fontSize: '18px', fontWeight: 700}}>
                                Budget Banger
                            </div>
                            <div style={{fontSize: '16px'}}>
                                Price: $5.00
                            </div>
                        </div>

                        <button
                            className="cursor-pointer hover:opacity-90 transition"
                            style={{
                                backgroundColor: 'white',
                                color: '#FF4F82',
                                fontWeight: 700,
                                padding: '6px 18px',
                                borderRadius: '999px',
                            }}
                        >
                            buy
                        </button>
                    </div>

                    {/* Ticket 2 */}
                    <div
                        className="rounded-xl px-6 py-3 flex items-center justify-between"
                        style={{
                            backgroundColor: '#4BE36A',
                            border: '2px solid white',
                        }}>
                        <div style={{color: 'white'}}>
                            <div style={{fontSize: '18px', fontWeight: 700}}>
                                Mediocre Fortune
                            </div>
                            <div style={{fontSize: '16px'}}>
                                Price: $15.00
                            </div>
                        </div>

                        <button
                            className="cursor-pointer hover:opacity-90 transition"                            style={{
                                backgroundColor: 'white',
                                color: '#22B856',
                                fontWeight: 700,
                                padding: '6px 18px',
                                borderRadius: '999px',
                            }}
                        >
                            buy
                        </button>
                    </div>

                    {/* Ticket 3 */}
                    <div
                        className="rounded-xl px-6 py-3 flex items-center justify-between"
                        style={{
                            backgroundColor: '#FFF176',
                            border: '2px solid white',
                        }}>
                        <div style={{color: '#D39B00'}}>
                            <div style={{fontSize: '18px', fontWeight: 700}}>
                                Eternal Riches… Maybe
                            </div>
                            <div style={{fontSize: '16px'}}>
                                Price: $30.00
                            </div>
                        </div>

                        <button
                            className="cursor-pointer hover:opacity-90 transition"
                            style={{
                                backgroundColor: 'white',
                                color: '#D39B00',
                                fontWeight: 700,
                                padding: '6px 18px',
                                borderRadius: '999px',
                            }}
                        >
                            buy
                        </button>
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
        <div className="flex justify-between font-medium text-lg">
            <span className="text-gray-900">{name}</span>
            <span className={positive ? 'text-green-500' : 'text-red-500'}>
        {change}
      </span>
        </div>
    );
}


function NewsItem({img, text,}: {
    img: string;
    text: string;
}) {
    return (
        <div className="flex gap-4 items-start">
            <img
                src={img}
                alt=""
                className="w-16 h-16 rounded-md object-cover"
            />
            <p className="text-sm text-gray-900 leading-snug">
                {text}
            </p>
        </div>
    );
}

import { useRouter } from 'next/navigation';
import {useState} from "react";

function ReadMoreButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.push('/news')}
            className="w-full mt-3 rounded-full bg-blue-500 text-white font-semibold py-2
                       hover:bg-blue-400 cursor-pointer transition"
        >
            read more
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
                strokeWidth="0.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

