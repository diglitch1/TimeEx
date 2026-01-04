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
            <div className="bg-white w-[760px] rounded-2xl p-8 text-gray-900 shadow-xl animate-event-in">

                {/* TITLE */}
                <h2 className="text-2xl font-bold text-red-600 mb-3">
                    ! Parents Support !
                </h2>
                {/* IMAGE */}
                <img
                    src="/events/car.png"
                    alt="New car"
                    className="w-full h-[380px] object-cover rounded-xl mb-6"
                />
                <p className="text-lg mb-6">
                    Your parents notice you’ve been struggling lately with college,
                    stress, and recent trouble.
                    <br />
                    <span className="text-gray-700">
                        They feel generous and decide to gift you a car.
                    </span>
                </p>

                {/* ACCEPT / DECLINE */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setChoice('accept')}
                        className={`flex-1 rounded-full py-3 text-lg font-semibold border transition ${
                            choice === 'accept'
                                ? 'bg-green-500 text-white border-green-500'
                                : 'bg-white text-gray-600 border-gray-300'
                        }`}
                    >
                        accept gift
                    </button>

                    <button
                        onClick={() => setChoice('decline')}
                        className={`flex-1 rounded-full py-3 text-lg font-semibold border transition ${
                            choice === 'decline'
                                ? 'bg-red-500 text-white border-red-500'
                                : 'bg-white text-gray-600 border-gray-300'
                        }`}
                    >
                        decline politely
                    </button>
                </div>

                {/* CONTENT */}
                <div className="grid grid-cols-2 gap-6 mb-6">

                    {/* LEFT */}
                    <div className="space-y-4">
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
                    <div className="border border-gray-300 rounded-xl p-4">
                        <p className="font-semibold mb-2">Wallet</p>

                        <div className="space-y-1 text-gray-800 max-h-[180px] overflow-y-auto">
                            {wallet.map(item => (
                                <p key={item.id}>
                                    {item.label}:{' '}
                                    <span className="font-medium">
                                        {item.units} {item.unitLabel}
                                    </span>
                                    <span className="text-gray-500">
                                        {' '}(${item.usdValue})
                                    </span>
                                </p>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CONFIRM */}
                <button
                    onClick={handleConfirm}
                    className="w-full rounded-full py-4 text-lg font-semibold transition
                               bg-blue-600 text-white hover:bg-blue-500"
                >
                    confirm
                </button>
            </div>
        </div>
    );
}
