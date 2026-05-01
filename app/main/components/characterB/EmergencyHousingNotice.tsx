'use client';

import { useMemo, useState } from 'react';
import type { WalletItem } from '../../utils/walletData';

type Props = {
    wallet: WalletItem[];
    setWallet: React.Dispatch<React.SetStateAction<WalletItem[]>>;
    onClose: () => void;
    onRequestCashBreak: () => void;
};

type DaughterRentHelpDecision = {
    daughterHelped?: boolean;
};

const URGENT_RENT_COST = 2500;

function formatWalletCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function readDaughterHelped() {
    if (typeof window === 'undefined') return false;

    try {
        const raw = localStorage.getItem('daughterRentHelp');
        if (!raw) return false;

        const parsed = JSON.parse(raw) as DaughterRentHelpDecision;
        return parsed.daughterHelped === true;
    } catch {
        return false;
    }
}

export default function EmergencyHousingNoticeModal({
    wallet,
    setWallet,
    onClose,
    onRequestCashBreak,
}: Props) {
    const daughterHelped = useMemo(readDaughterHelped, []);
    const [choice, setChoice] = useState<'daughter' | 'urgent-rent'>(
        daughterHelped ? 'daughter' : 'urgent-rent'
    );
    const walletNeedsScroll = wallet.length > 3;
    const cash = wallet.find(item => item.id === 'cash');
    const hasEnoughCash = (cash?.usdValue ?? 0) >= URGENT_RENT_COST;
    const canConfirm = choice === 'daughter' || hasEnoughCash;

    const handleConfirm = () => {
        if (choice === 'daughter') {
            localStorage.setItem(
                'emergencyHousingNotice',
                JSON.stringify({
                    stayedWithDaughter: true,
                    paidUrgentRent: false,
                    amount: 0,
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
                          usdValue: item.usdValue - URGENT_RENT_COST,
                          units: item.units - URGENT_RENT_COST,
                      }
                    : item
            )
        );

        localStorage.setItem(
            'emergencyHousingNotice',
            JSON.stringify({
                stayedWithDaughter: false,
                paidUrgentRent: true,
                amount: URGENT_RENT_COST,
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
                    Emergency Housing Notice
                </h2>

                <img
                    src="/images/Global-financial-crisis/events/kickedOut.png"
                    alt="Emergency housing notice"
                    className="event-story-image rounded-xl mb-5"
                />

                <p className="mb-6 text-lg leading-relaxed">
                    Cain's apartment building is caught in the fallout from a failed property loan.
                    The owner loses financing, maintenance is frozen, and a city inspection orders
                    several units cleared while the building is stabilized. Cain has only a few days
                    to find somewhere safe to stay.
                </p>

                <div className="mb-6 flex gap-4">
                    <button
                        type="button"
                        disabled={!daughterHelped}
                        onClick={() => daughterHelped && setChoice('daughter')}
                        className={`flex-1 rounded-full border py-3 text-lg font-semibold transition ${
                            choice === 'daughter'
                                ? 'border-green-500 bg-green-500 text-white'
                                : daughterHelped
                                  ? 'border-gray-300 bg-white text-gray-600'
                                  : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                        }`}
                    >
                        ask daughter for help
                    </button>

                    <button
                        type="button"
                        onClick={() => setChoice('urgent-rent')}
                        className={`flex-1 rounded-full border py-3 text-lg font-semibold transition ${
                            choice === 'urgent-rent'
                                ? 'border-red-500 bg-red-500 text-white'
                                : 'border-gray-300 bg-white text-gray-600'
                        }`}
                    >
                        rent urgently
                    </button>
                </div>

                {!daughterHelped && (
                    <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                        Cain cannot ask his daughter for help because their relationship is strained.
                    </p>
                )}

                <div className="mb-6 grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-semibold">Outcome</label>
                            <p className="leading-relaxed text-gray-700">
                                {choice === 'daughter'
                                    ? 'His daughter lets him stay in her apartment for the next month while he searches for a new place.'
                                    : hasEnoughCash
                                      ? 'Cain finds a short-notice rental, but the emergency move is expensive.'
                                      : 'Cain does not have enough cash available for the urgent rental right now.'}
                            </p>
                        </div>

                        <div
                            className={`font-semibold ${
                                choice === 'daughter' ? 'text-green-600' : 'text-red-600'
                            }`}
                        >
                            {choice === 'daughter'
                                ? '$0 temporary stay'
                                : `- ${formatWalletCurrency(URGENT_RENT_COST)} urgent rent`}
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
                                        {item.id === 'cash'
                                            ? formatWalletCurrency(item.units)
                                            : `${item.units.toLocaleString('en-US', {
                                                  minimumFractionDigits: 3,
                                                  maximumFractionDigits: 3,
                                              })} ${item.unitLabel}`}
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
