'use client';

import { useState } from 'react';
import type { WalletItem } from '../utils/walletData';

type Props = {
    wallet: WalletItem[];
    setWallet: React.Dispatch<React.SetStateAction<WalletItem[]>>;
    onClose: () => void;
};

export default function ParentsSupportModal({
                                                wallet,
                                                setWallet,
                                                onClose,
                                            }: Props) {

    const [choice, setChoice] = useState<'accept' | 'decline'>('accept');

    const handleConfirm = () => {
        if (choice === 'decline') {
            localStorage.setItem(
                'parentsSupport',
                JSON.stringify({
                    accepted: false,
                    date: new Date().toISOString(),
                })
            );

            onClose();
            return;
        }

        // ACCEPT → add car to wallet
        localStorage.setItem(
            'parentsSupport',
            JSON.stringify({
                accepted: true,
                received: 'car',
                date: new Date().toISOString(),
            })
        );

        // only add car if player doesn't already have one
        setWallet(prev => {
            const alreadyHasCar = prev.some(item => item.id === 'car');
            if (alreadyHasCar) return prev;

            return [
                ...prev,
                {
                    id: 'car',
                    label: 'Car',
                    units: 1,
                    unitLabel: 'vehicle',
                    usdValue: 3000,
                },
            ];
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="car-offer-modal overflow-hidden bg-white rounded-2xl text-gray-900 shadow-xl animate-event-in">

                {/* TITLE */}
                <h2 className="mb-3 text-center text-2xl font-bold text-red-600">
                    Parents Support
                </h2>
                {/* IMAGE */}
                <img
                    src="/images/events/car.png"
                    alt="New car"
                    className="car-offer-image rounded-xl mb-3"
                />
                <p className="text-lg mb-4">
                    Your parents notice the stress from college and recent trouble.
                    <span className="block text-gray-700">
                        They feel generous and offer to gift you a car.
                    </span>
                </p>

                {/* ACCEPT / DECLINE */}
                <div className="flex gap-3 mb-4">
                    <button
                        onClick={() => setChoice('accept')}
                        className={`flex-1 rounded-full py-2 text-base font-semibold border transition ${
                            choice === 'accept'
                                ? 'bg-green-500 text-white border-green-500'
                                : 'bg-white text-gray-600 border-gray-300'
                        }`}
                    >
                        accept gift
                    </button>

                    <button
                        onClick={() => setChoice('decline')}
                        className={`flex-1 rounded-full py-2 text-base font-semibold border transition ${
                            choice === 'decline'
                                ? 'bg-red-500 text-white border-red-500'
                                : 'bg-white text-gray-600 border-gray-300'
                        }`}
                    >
                        decline politely
                    </button>
                </div>

                {/* CONTENT */}
                <div className="grid grid-cols-2 gap-4 mb-4">

                    {/* LEFT */}
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium mb-1 block">
                                Outcome
                            </label>
                            <p className="text-gray-700">
                                {choice === 'accept'
                                    ? 'You receive a car, making transportation easier.'
                                    : 'You decide to stay independent and manage on your own.'}
                            </p>
                        </div>

                        {choice === 'accept' && (
                            <div className="text-green-600 font-semibold">
                                + Car
                            </div>
                        )}
                    </div>

                    {/* RIGHT — WALLET */}
                    <div className="border border-gray-300 rounded-xl p-3">
                        <p className="font-semibold mb-2">Wallet</p>

                        <div className="space-y-1 text-sm text-gray-800 max-h-[120px] overflow-y-auto">
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
                    onClick={handleConfirm}
                    className="w-full rounded-full py-3 text-base font-semibold transition
                               bg-blue-600 text-white hover:bg-blue-500"
                >
                    confirm
                </button>
            </div>
        </div>
    );
}
