'use client';

import { useState } from 'react';
import { formatWalletUnits, type WalletItem } from '../../utils/walletData';

type Props = {
    wallet: WalletItem[];
    setWallet: React.Dispatch<React.SetStateAction<WalletItem[]>>;
    onClose: () => void;
    onRequestCashBreak: () => void;
};

const REPAIR_COST = 125;

function formatWalletCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export default function LaptopFailureModal({
    wallet,
    setWallet,
    onClose,
    onRequestCashBreak,
}: Props) {
    const [choice, setChoice] = useState<'repair' | 'ignore'>('repair');
    const walletNeedsScroll = wallet.length > 3;
    const cash = wallet.find(item => item.id === 'cash');
    const hasEnoughCash = (cash?.usdValue ?? 0) >= REPAIR_COST;
    const canConfirm = choice === 'ignore' || hasEnoughCash;

    const handleConfirm = () => {
        if (choice === 'ignore') {
            localStorage.setItem(
                'laptopFailure',
                JSON.stringify({
                    repaired: false,
                    ignoredDamage: true,
                    repairCost: 0,
                    futureReplacementRisk: true,
                    date: new Date().toISOString(),
                })
            );

            onClose();
            return;
        }

        if (!cash || !hasEnoughCash) return;

        setWallet(prev =>
            prev.map(item =>
                item.id === 'cash'
                    ? {
                          ...item,
                          usdValue: item.usdValue - REPAIR_COST,
                          units: item.units - REPAIR_COST,
                      }
                    : item
            )
        );

        localStorage.setItem(
            'laptopFailure',
            JSON.stringify({
                repaired: true,
                ignoredDamage: false,
                repairCost: REPAIR_COST,
                futureReplacementRisk: false,
                date: new Date().toISOString(),
            })
        );

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative w-[min(820px,calc(100vw-32px))] max-h-[calc(100svh-32px)] overflow-y-auto rounded-2xl bg-white p-7 text-gray-900 shadow-xl animate-event-in">
                <button
                    type="button"
                    onClick={onRequestCashBreak}
                    className="scenario-break-button"
                    aria-label="Exit scenario for 30 seconds to raise cash"
                    title="Exit for 30 seconds to sell assets"
                >
                    x
                </button>

                <h2 className="mb-3 text-center text-2xl font-bold text-red-600">
                    Workstation Failure
                </h2>

                <img
                    src="/images/Global-financial-crisis/events/laptopcrushed.png"
                    alt="Crashed laptop"
                    className="event-story-image rounded-xl mb-5"
                />

                <p className="mb-6 text-lg leading-relaxed">
                    Cain's laptop has been crashing on and off for the past week or two. At first
                    it was just a small interruption, but now it freezes during calls, restarts
                    while he is reviewing documents, and keeps slowing down his workday.
                </p>

                <div className="mb-6 flex gap-4">
                    <button
                        type="button"
                        onClick={() => setChoice('repair')}
                        className={`flex-1 rounded-full border py-3 text-lg font-semibold transition ${
                            choice === 'repair'
                                ? 'border-green-500 bg-green-500 text-white'
                                : 'border-gray-300 bg-white text-gray-600'
                        }`}
                    >
                        repair laptop
                    </button>

                    <button
                        type="button"
                        onClick={() => setChoice('ignore')}
                        className={`flex-1 rounded-full border py-3 text-lg font-semibold transition ${
                            choice === 'ignore'
                                ? 'border-red-500 bg-red-500 text-white'
                                : 'border-gray-300 bg-white text-gray-600'
                        }`}
                    >
                        ignore it
                    </button>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-semibold">Outcome</label>
                            <p className="leading-relaxed text-gray-700">
                                {choice === 'repair'
                                    ? hasEnoughCash
                                        ? 'Cain sends the laptop to a repair specialist and keeps the damage under control.'
                                        : 'Cain does not have enough cash available to repair it right now.'
                                    : 'Cain spends nothing today and decides to keep using it for now.'}
                            </p>
                        </div>

                        <div
                            className={`font-semibold ${
                                choice === 'repair' ? 'text-red-600' : 'text-amber-600'
                            }`}
                        >
                            {choice === 'repair'
                                ? `- ${formatWalletCurrency(REPAIR_COST)} repair cost`
                                : '$0 today'}
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-300 p-4">
                        <p className="mb-2 font-semibold">Wallet</p>

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
                    type="button"
                    disabled={!canConfirm}
                    onClick={handleConfirm}
                    className={`w-full rounded-full py-4 text-lg font-semibold transition ${
                        canConfirm
                            ? 'bg-blue-600 text-white hover:bg-blue-500'
                            : 'cursor-not-allowed bg-gray-300 text-gray-500'
                    }`}
                >
                    confirm
                </button>
            </div>
        </div>
    );
}
