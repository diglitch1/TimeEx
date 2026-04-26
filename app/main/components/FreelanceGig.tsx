'use client';

import { useState } from 'react';
import type { WalletItem } from '../utils/walletData';

type Props = {
    wallet: WalletItem[];
    setWallet: React.Dispatch<React.SetStateAction<WalletItem[]>>;
    onClose: () => void;
};

const GIG_PAYMENT = 500;

export default function FreelanceGigModal({
                                              wallet,
                                              setWallet,
                                              onClose,
                                          }: Props) {

    const [choice, setChoice] = useState<'accept' | 'decline'>('accept');
    const [showDetails, setShowDetails] = useState(false);

    const cash = wallet.find(w => w.id === 'cash');

    const handleConfirm = () => {
        if (choice === 'accept' && cash) {
            setWallet(prev =>
                prev.map(item =>
                    item.id === 'cash'
                        ? {
                            ...item,
                            usdValue: item.usdValue + GIG_PAYMENT,
                            units: item.units + GIG_PAYMENT,
                        }
                        : item
                )
            );

            localStorage.setItem(
                'freelanceGig',
                JSON.stringify({
                    accepted: true,
                    payment: GIG_PAYMENT,
                    unlocksFutureJob: true,
                    date: new Date().toISOString(),
                })
            );

            onClose();
            return;
        }

        localStorage.setItem(
            'freelanceGig',
            JSON.stringify({
                accepted: false,
                unlocksFutureJob: false,
                date: new Date().toISOString(),
            })
        );

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="overflow-hidden bg-white w-[760px] rounded-2xl p-8 text-gray-900 shadow-xl animate-event-in">

                {/* TITLE */}
                <h2 className="mb-3 text-center text-2xl font-bold text-red-600">
                    Freelance Gig
                </h2>

                <p className="text-lg mb-4">
                    A small startup comes across your old forum posts and portfolio.
                    <br />
                    Their site is unstable and they’re urgently looking for help.
                </p>

                {/* DETAILS TOGGLE */}
                <button
                    onClick={() => setShowDetails(v => !v)}
                    className="mb-6 text-blue-600 font-semibold hover:underline"
                >
                    {showDetails ? 'Hide gig details ▲' : 'View gig details ▼'}
                </button>

                {/* GIG DETAILS */}
                {showDetails && (
                    <div className="border border-gray-300 rounded-xl p-4 mb-6 bg-gray-50">

                        {/* HEADER */}
                        <div className="flex items-center gap-4 mb-4">
                            <img
                                src="/images/events/company_logo.png"
                                alt="Company logo"
                                className="h-20 w-20 object-contain"
                            />
                            <div>
                                <p className="font-semibold text-lg">
                                    Backend Stability Fix (Freelance)
                                </p>
                                <p className="text-sm text-gray-600">
                                    Remote · Immediate start
                                </p>
                            </div>
                        </div>

                        {/* BULLET CONTENT */}
                        <div className="text-sm text-gray-700 space-y-2 leading-relaxed">
                            <p>
                                <span className="font-semibold">What you’ll do:</span>
                            </p>
                            <ul className="list-disc list-inside">
                                <li>Investigate backend crashes under high traffic</li>
                                <li>Fix database performance issues</li>
                                <li>Patch and refactor unstable legacy code</li>
                                <li>Deploy a short-term stability fix</li>
                            </ul>

                            <p className="mt-3">
                                <span className="font-semibold">Time commitment:</span>{' '}
                                1–2 days, urgent
                            </p>

                            <p>
                                <span className="font-semibold">Payment:</span>{' '}
                                $500 (one-time)
                            </p>

                            <p>
                                <span className="font-semibold">Notes:</span>{' '}
                                If the fix is successful, the company may contact you again
                                for future paid work.
                            </p>
                        </div>
                    </div>
                )}

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
                        accept gig
                    </button>

                    <button
                        onClick={() => setChoice('decline')}
                        className={`flex-1 rounded-full py-3 text-lg font-semibold border transition ${
                            choice === 'decline'
                                ? 'bg-red-500 text-white border-red-500'
                                : 'bg-white text-gray-600 border-gray-300'
                        }`}
                    >
                        decline gig
                    </button>
                </div>

                {/* CONTENT */}
                <div className="grid grid-cols-2 gap-6 mb-6">

                    {/* LEFT */}
                    <div className="space-y-4">
                        {choice === 'accept' && (
                            <div>
                                <label className="text-sm font-medium mb-1 block">
                                    Payment
                                </label>
                                <div className="rounded-lg border px-4 py-3 text-lg font-semibold ">
                                    + $500
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-sm font-medium mb-1 block">
                                Outcome
                            </label>
                            <p className="text-gray-700">
                                {choice === 'accept'
                                    ? 'You earn money and unlock a future job opportunity.'
                                    : 'You pass on the gig and miss a future opportunity.'}
                            </p>
                        </div>
                    </div>

                    {/* RIGHT — WALLET */}
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
