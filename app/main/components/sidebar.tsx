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

        </aside>
    );
}
