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

        </aside>
    );
}
