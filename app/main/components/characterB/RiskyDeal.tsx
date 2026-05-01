'use client';

import { useState } from 'react';
import { formatWalletUnits, type WalletItem } from '../../utils/walletData';

type Props = {
    wallet: WalletItem[];
    setWallet: React.Dispatch<React.SetStateAction<WalletItem[]>>;
    onClose: () => void;
};

const RISKY_SALE_COMMISSION = 12000;

function formatWalletCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export default function RiskyDealModal({ wallet, setWallet, onClose }: Props) {
    const [choice, setChoice] = useState<'warn' | 'push'>('warn');
    const walletNeedsScroll = wallet.length > 3;

    const handleConfirm = () => {
        if (choice === 'push') {
            setWallet(prev =>
                prev.map(item =>
                    item.id === 'cash'
                        ? {
                              ...item,
                              usdValue: item.usdValue + RISKY_SALE_COMMISSION,
                              units: item.units + RISKY_SALE_COMMISSION,
                          }
                        : item
                )
            );

            localStorage.setItem(
                'riskyDeal',
                JSON.stringify({
                    pushedSale: true,
                    warnedClient: false,
                    commission: RISKY_SALE_COMMISSION,
                    lawsuitRisk: true,
                    reputation: 'damaged',
                    date: new Date().toISOString(),
                })
            );

            onClose();
            return;
        }

        localStorage.setItem(
            'riskyDeal',
            JSON.stringify({
                pushedSale: false,
                warnedClient: true,
                commission: 0,
                lawsuitRisk: false,
                reputation: 'improved',
                date: new Date().toISOString(),
            })
        );

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative w-[min(820px,calc(100vw-32px))] max-h-[calc(100svh-32px)] overflow-y-auto rounded-2xl bg-white p-7 text-gray-900 shadow-xl animate-event-in">
                <h2 className="mb-3 text-center text-2xl font-bold text-red-600">
                    Risky Deal
                </h2>

                <img
                    src="/images/Global-financial-crisis/events/riskyDeal.png"
                    alt="Risky real estate deal"
                    className="event-story-image rounded-xl mb-5"
                />

                <p className="text-lg mb-6 leading-relaxed">
                    A nervous buyer wants Cain to close on a property with shaky loan terms.
                    <br />
                    The deal could pay a huge commission, but the warning signs are obvious.
                </p>

                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setChoice('warn')}
                        className={`flex-1 rounded-full py-3 text-lg font-semibold border transition ${
                            choice === 'warn'
                                ? 'bg-green-500 text-white border-green-500'
                                : 'bg-white text-gray-600 border-gray-300'
                        }`}
                    >
                        warn client honestly
                    </button>

                    <button
                        onClick={() => setChoice('push')}
                        className={`flex-1 rounded-full py-3 text-lg font-semibold border transition ${
                            choice === 'push'
                                ? 'bg-red-500 text-white border-red-500'
                                : 'bg-white text-gray-600 border-gray-300'
                        }`}
                    >
                        push the sale
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold mb-1 block">Outcome</label>
                            <p className="text-gray-700 leading-relaxed">
                                {choice === 'push'
                                    ? 'Cain closes the risky sale and takes the full commission.'
                                    : 'Cain protects the client and improves his reputation, but earns no commission.'}
                            </p>
                        </div>

                        <div
                            className={`font-semibold ${
                                choice === 'push' ? 'text-green-600' : 'text-blue-600'
                            }`}
                        >
                            {choice === 'push'
                                ? '+ $12,000 commission'
                                : '+ reputation, $0 commission'}
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-300 p-4">
                        <p className="font-semibold mb-2">Wallet</p>

                        <div
                            className={`space-y-1 pr-1 text-gray-800 ${
                                walletNeedsScroll ? 'max-h-[92px] overflow-y-auto' : ''
                            }`}
                        >
                            {wallet.map(item => (
                                <p key={item.id}>
                                    {item.label}:{' '}
                                    <span className="font-medium">
                                        {formatWalletUnits(item)}
                                    </span>
                                    <span className="text-gray-500">
                                        {' '}({formatWalletCurrency(item.usdValue)})
                                    </span>
                                </p>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleConfirm}
                    className="w-full rounded-full py-4 text-lg font-semibold transition bg-blue-600 text-white hover:bg-blue-500"
                >
                    confirm
                </button>
            </div>
        </div>
    );
}
