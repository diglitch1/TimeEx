'use client';

import Image from 'next/image';

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
export default function Sidebar() {
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

                    <p>Cash: <span className="font-medium">2456 $</span></p>
                    <p>BTC: 0.005 (~$350)</p>
                    <p>ETH: 1.24 (~$3,980)</p>
                    <p>Oil: 1.8 bbl (~$108)</p>
                    <p>Silver: 2.3 oz (~$54)</p>
                    <p>Gold: 0.49 oz (~$2,000)</p>
                    <p>AAPL: 0.40 shares (~$60)</p>
                    <p>MSFT: 0.25 shares (~$95)</p>
                    <p>NVDA: 0.12 shares (~$62)</p>
                    <p>TSLA: 0.18 shares (~$47)</p>

                </div>

                <div className="my-4 border-t border-gray-200"/>

                <div className="text-red-600 font-semibold text-lg">
                    Gain/Loss: -345 $
                </div>

                <div className="mt-1 font-semibold text-gray-900 text-lg">
                    Cash Out Value: 7,268.00 $
                </div>
            </div>

            {/* Watchlist */}
            <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                    My watchlist
                </h3>

                <div className="rounded-xl bg-white border border-gray-300 p-4 space-y-3">
                    <WatchItem name="SOL" change="-1.86%" negative />
                    <WatchItem name="GOLD" change="-0.72%" negative />
                    <WatchItem name="TSLA" change="+2.34%" />
                    <WatchItem name="NVDA" change="+1.30%" />
                    <WatchItem name="ADA" change="+0.97%" />
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

        </aside>
    );
}

function WatchItem({name, change, negative = false,}: {
    name: string;
    change: string;
    negative?: boolean;
}) {
    return (
        <div className="flex justify-between font-medium text-lg">
            <span className="text-gray-900">{name}</span>
            <span className={negative ? 'text-red-500' : 'text-green-500'}>
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

