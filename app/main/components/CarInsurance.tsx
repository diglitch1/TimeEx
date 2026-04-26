'use client';

import { useState } from 'react';
import type { WalletItem } from '../utils/walletData';

type Props = {
    wallet: WalletItem[];
    setWallet: React.Dispatch<React.SetStateAction<WalletItem[]>>;
    onClose: () => void;
    onRequestCashBreak: () => void;
};

const MONTHLY_COST = 70;

export default function CarInsuranceModal({
                                              wallet,
                                              setWallet,
                                              onClose,
                                              onRequestCashBreak,
                                          }: Props) {
    const [choice, setChoice] = useState<'buy' | 'skip'>('buy');

    const cash = wallet.find(w => w.id === 'cash');
    const canConfirm = choice === 'skip' || (cash?.usdValue ?? 0) >= MONTHLY_COST;

    const handleConfirm = () => {
        if (choice === 'skip') {
            localStorage.setItem(
                'carInsurance',
                JSON.stringify({
                    insured: false,
                    date: new Date().toISOString(),
                })
            );

            onClose();
            return;
        }

        if (!cash || cash.usdValue < MONTHLY_COST) return;

        localStorage.setItem(
            'carInsurance',
            JSON.stringify({
                insured: true,
                monthlyCost: MONTHLY_COST,
                date: new Date().toISOString(),
            })
        );

        setWallet(prev =>
            prev.map(item =>
                item.id === 'cash'
                    ? {
                        ...item,
                        usdValue: item.usdValue - MONTHLY_COST,
                        units: item.units - MONTHLY_COST,
                    }
                    : item
            )
        );

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative bg-white w-[760px] rounded-2xl p-8 text-gray-900 shadow-xl animate-event-in">
                <button
                    type="button"
                    onClick={onRequestCashBreak}
                    className="scenario-break-button"
                    aria-label="Exit scenario for 30 seconds to raise cash"
                    title="Exit for 30 seconds to sell assets"
                >
                    ×
                </button>

                {/* TITLE */}
                <h2 className="mb-3 text-center text-2xl font-bold text-red-600">
                    Car Insurance Offer
                </h2>

                <p className="text-lg mb-6">
                    You already own a car. Your dad calls and insists you should get car insurance.
                    It costs <span className="font-semibold">$70</span> per month.
                    What do you do?
                </p>

                {/* BUY / SKIP */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setChoice('buy')}
                        className={`flex-1 rounded-full py-3 text-lg font-semibold border transition ${
                            choice === 'buy'
                                ? 'bg-green-500 text-white border-green-500'
                                : 'bg-white text-gray-600 border-gray-300'
                        }`}
                    >
                        buy insurance
                    </button>

                    <button
                        onClick={() => setChoice('skip')}
                        className={`flex-1 rounded-full py-3 text-lg font-semibold border transition ${
                            choice === 'skip'
                                ? 'bg-red-500 text-white border-red-500'
                                : 'bg-white text-gray-600 border-gray-300'
                        }`}
                    >
                        skip insurance
                    </button>
                </div>

                {/* CONTENT */}
                <div className="grid grid-cols-2 gap-6 mb-6">

                    {/* LEFT */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">
                                Monthly Cost
                            </label>
                            <div className="rounded-lg border px-4 py-3 text-lg font-semibold">
                                $70
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">
                                Outcome
                            </label>
                            <p className="text-gray-700">
                                {choice === 'buy'
                                    ? 'Provides additional security.'
                                    : 'Leaves you without added protection.'}
                            </p>
                        </div>

                        {!canConfirm && (
                            <p className="text-sm text-red-500">
                                Not enough cash available.
                            </p>
                        )}
                    </div>

                    {/* RIGHT – WALLET */}
                    <div className="border border-gray-300 rounded-xl p-4">
                        <p className="font-semibold mb-2">Wallet</p>

                        <div className="space-y-1 text-gray-800 max-h-[180px] overflow-y-auto">
                            {wallet.map(item => (
                                <p key={item.id}>
                                    {item.label}:{' '}
                                    <span className="font-medium">
                                        {item.units.toFixed(3)} {item.unitLabel}
                                    </span>
                                    <span className="text-gray-500">
                                        {' '}(${item.usdValue.toFixed(2)})
                                    </span>
                                </p>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CONFIRM */}
                <button
                    disabled={!canConfirm}
                    onClick={handleConfirm}
                    className={`w-full rounded-full py-4 text-lg font-semibold transition ${
                        canConfirm
                            ? 'bg-blue-600 text-white hover:bg-blue-500'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    confirm
                </button>
            </div>
        </div>
    );
}
