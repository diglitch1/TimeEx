'use client';

import { useState } from 'react';
import { formatWalletCurrency, formatWalletUnits, type WalletItem } from '../utils/walletData';

type Props = {
    wallet: WalletItem[];
    setWallet: React.Dispatch<React.SetStateAction<WalletItem[]>>;
    onClose: () => void;
};

type Choice = 'cover' | 'refuse';

const IMG_FLATMATE_RENT = '/images/COVID-19-PANDEMIC/events/cant-pay-rent.png';
const COVER_RENT_COST = 700;
const REPLACEMENT_COST = 300;

export default function FlatmateRentModal({ wallet, setWallet, onClose }: Props) {
    const [choice, setChoice] = useState<Choice>('cover');
    const cash = wallet.find(item => item.id === 'cash');
    const immediateCost = choice === 'cover' ? COVER_RENT_COST : REPLACEMENT_COST;

    const handleConfirm = () => {
        const coveredRent = choice === 'cover';

        localStorage.setItem(
            'flatmateRent',
            JSON.stringify({
                coveredRent,
                refused: !coveredRent,
                cost: coveredRent ? COVER_RENT_COST : REPLACEMENT_COST,
                flatmateReturnsFavor: coveredRent,
                replacementCost: coveredRent ? 0 : REPLACEMENT_COST,
                date: new Date().toISOString(),
            })
        );

        localStorage.setItem('flatmateRentCovered', String(coveredRent));
        localStorage.setItem('flatmateReturnsFavor', String(coveredRent));

        setWallet(prev =>
            prev.map(item =>
                item.id === 'cash'
                    ? {
                          ...item,
                          units: item.units - immediateCost,
                          usdValue: item.usdValue - immediateCost,
                      }
                    : item
            )
        );

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="party-event-modal relative overflow-hidden rounded-2xl bg-white text-gray-900 shadow-xl animate-event-in">
                <h2 className="mb-3 text-center text-2xl font-bold text-red-600">
                    Flatmate Can&apos;t Pay
                </h2>

                <img
                    src={IMG_FLATMATE_RENT}
                    alt="Diana's flatmate cannot cover rent during lockdown"
                    className="party-event-image rounded-xl mb-3"
                    draggable={false}
                />

                <p className="party-event-copy mb-4">
                    Vaccine news is moving the market fast, and the timing is awful. Diana&apos;s
                    flatmate, financially wrecked from months of lockdown, cannot cover their share
                    of this month&apos;s expenses.
                    <span className="mt-2 block text-gray-700">
                        They owe {formatWalletCurrency(COVER_RENT_COST)}. Does Diana help?
                    </span>
                </p>

                <div className="flex gap-3 mb-4">
                    <button
                        type="button"
                        onClick={() => setChoice('cover')}
                        className={`flex-1 rounded-full border py-2 text-base font-semibold transition ${
                            choice === 'cover'
                                ? 'border-green-500 bg-green-500 text-white'
                                : 'border-gray-300 bg-white text-gray-600'
                        }`}
                    >
                        cover it
                    </button>

                    <button
                        type="button"
                        onClick={() => setChoice('refuse')}
                        className={`flex-1 rounded-full border py-2 text-base font-semibold transition ${
                            choice === 'refuse'
                                ? 'border-red-500 bg-red-500 text-white'
                                : 'border-gray-300 bg-white text-gray-600'
                        }`}
                    >
                        refuse
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Immediate effect
                            </label>
                            <div className="rounded-lg border px-3 py-2 text-base font-semibold">
                                -{formatWalletCurrency(immediateCost)}
                                <span className="block text-xs font-medium text-gray-500">
                                    {choice === 'cover'
                                        ? 'Diana covers the missing rent share. Her flatmate is relieved, and life continues normally between them.'
                                        : 'The flatmate moves out and takes their things. Diana has to replace basic furniture and appliances.'}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Outcome
                            </label>
                            <p className="text-gray-700">
                                {choice === 'cover'
                                    ? 'The flatmate remembers this and may return the favour later.'
                                    : 'Diana has fewer shared basics at home and pays for replacements now.'}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-300 p-3">
                        <p className="font-semibold mb-2">Wallet</p>

                        <div className="space-y-1 text-sm text-gray-800 max-h-[120px] overflow-y-auto">
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
                            <p className="pt-1 text-red-600">
                                After decision:{' '}
                                {formatWalletCurrency((cash?.usdValue ?? 0) - immediateCost)} cash
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleConfirm}
                    className="w-full rounded-full bg-blue-600 py-3 text-base font-semibold text-white transition hover:bg-blue-500"
                >
                    confirm
                </button>
            </div>
        </div>
    );
}
