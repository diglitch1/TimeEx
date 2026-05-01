'use client';

import { useState } from 'react';
import { formatWalletUnits, type WalletItem } from '../../utils/walletData';

type Props = {
    wallet: WalletItem[];
    setWallet: React.Dispatch<React.SetStateAction<WalletItem[]>>;
    onClose: () => void;
    onRequestCashBreak: () => void;
};

const RENT_HELP_AMOUNT = 2000;

function formatWalletCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export default function DaughterRentHelpModal({
    wallet,
    setWallet,
    onClose,
    onRequestCashBreak,
}: Props) {
    const [choice, setChoice] = useState<'help' | 'refuse'>('help');
    const walletNeedsScroll = wallet.length > 3;
    const cash = wallet.find(item => item.id === 'cash');
    const hasEnoughCash = (cash?.usdValue ?? 0) >= RENT_HELP_AMOUNT;
    const canConfirm = choice === 'refuse' || hasEnoughCash;

    const handleConfirm = () => {
        if (choice === 'refuse') {
            localStorage.setItem(
                'daughterRentHelp',
                JSON.stringify({
                    daughterHelped: false,
                    daughterRelationship: 'strained',
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
                          usdValue: item.usdValue - RENT_HELP_AMOUNT,
                          units: item.units - RENT_HELP_AMOUNT,
                      }
                    : item
            )
        );

        localStorage.setItem(
            'daughterRentHelp',
            JSON.stringify({
                daughterHelped: true,
                daughterRelationship: 'supported',
                amount: RENT_HELP_AMOUNT,
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
                    Daughter Needs Rent Help
                </h2>

                <img
                    src="/images/Global-financial-crisis/events/helpDaughter.png"
                    alt="Daughter asking for rent help"
                    className="event-story-image rounded-xl mb-5"
                />

                <p className="text-lg mb-6 leading-relaxed">
                    Cain's daughter is studying law, and rent is getting harder to cover as the
                    housing crisis spreads.
                    <br />
                    She asks if he can help her through the month.
                </p>

                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setChoice('help')}
                        className={`flex-1 rounded-full py-3 text-lg font-semibold border transition ${
                            choice === 'help'
                                ? 'bg-green-500 text-white border-green-500'
                                : 'bg-white text-gray-600 border-gray-300'
                        }`}
                    >
                        help her
                    </button>

                    <button
                        onClick={() => setChoice('refuse')}
                        className={`flex-1 rounded-full py-3 text-lg font-semibold border transition ${
                            choice === 'refuse'
                                ? 'bg-red-500 text-white border-red-500'
                                : 'bg-white text-gray-600 border-gray-300'
                        }`}
                    >
                        refuse
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold mb-1 block">Outcome</label>
                            <p className="text-gray-700 leading-relaxed">
                                {choice === 'help'
                                    ? hasEnoughCash
                                        ? 'Cain sends rent support and keeps their relationship strong.'
                                        : 'Cain does not have enough cash available right now.'
                                    : 'Cain refuses, and their relationship becomes strained.'}
                            </p>
                        </div>

                        <div
                            className={`font-semibold ${
                                choice === 'help' ? 'text-red-600' : 'text-amber-600'
                            }`}
                        >
                            {choice === 'help'
                                ? `- ${formatWalletCurrency(RENT_HELP_AMOUNT)} rent help`
                                : '- daughter relationship'}
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
