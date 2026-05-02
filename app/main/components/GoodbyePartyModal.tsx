'use client';

import { useState } from 'react';
import { formatWalletCurrency, formatWalletUnits, type WalletItem } from '../utils/walletData';

type Props = {
    wallet: WalletItem[];
    setWallet: React.Dispatch<React.SetStateAction<WalletItem[]>>;
    onClose: () => void;
};

const IMG_PARTY = '/images/COVID-19-PANDEMIC/events/party.png';
const SNACK_COST = 35;

export default function GoodbyePartyModal({ wallet, setWallet, onClose }: Props) {
    const [choice, setChoice] = useState<'attend' | 'stay-home'>('stay-home');

    const cash = wallet.find(item => item.id === 'cash');

    const handleConfirm = () => {
        const attended = choice === 'attend';

        localStorage.setItem(
            'goodbyeParty',
            JSON.stringify({
                attended,
                stayedHome: !attended,
                snackCost: attended ? SNACK_COST : 0,
                exposed: attended,
                conductWarning: attended,
                date: new Date().toISOString(),
            })
        );

        if (attended) {
            setWallet(prev =>
                prev.map(item =>
                    item.id === 'cash'
                        ? {
                              ...item,
                              units: item.units - SNACK_COST,
                              usdValue: item.usdValue - SNACK_COST,
                          }
                        : item
                )
            );
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="party-event-modal relative overflow-hidden rounded-2xl bg-white text-gray-900 shadow-xl animate-event-in">
                <h2 className="mb-3 text-center text-2xl font-bold text-red-600">
                    The Goodbye Party
                </h2>

                <img
                    src={IMG_PARTY}
                    alt="Diana's crew colleagues gather for one last goodbye party"
                    className="party-event-image rounded-xl mb-3"
                    draggable={false}
                />

                <p className="party-event-copy mb-4">
                    Layoff notices just dropped. Diana&apos;s crew colleagues are organising one last
                    get-together before everyone scatters. It is technically against the new rules,
                    but it is just 8 people in someone&apos;s flat.
                    <span className="mt-2 block text-gray-700">
                        She has not seen anyone in weeks. Does she go?
                    </span>
                </p>

                <div className="flex gap-3 mb-4">
                    <button
                        type="button"
                        onClick={() => setChoice('attend')}
                        className={`flex-1 rounded-full border py-2 text-base font-semibold transition ${
                            choice === 'attend'
                                ? 'border-red-500 bg-red-500 text-white'
                                : 'border-gray-300 bg-white text-gray-600'
                        }`}
                    >
                        go to the party
                    </button>

                    <button
                        type="button"
                        onClick={() => setChoice('stay-home')}
                        className={`flex-1 rounded-full border py-2 text-base font-semibold transition ${
                            choice === 'stay-home'
                                ? 'border-green-500 bg-green-500 text-white'
                                : 'border-gray-300 bg-white text-gray-600'
                        }`}
                    >
                        stay home
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Immediate effect
                            </label>
                            <div className="rounded-lg border px-3 py-2 text-base font-semibold">
                                {choice === 'attend' ? `-${formatWalletCurrency(SNACK_COST)}` : '$0'}
                                <span className="block text-xs font-medium text-gray-500">
                                    {choice === 'attend'
                                        ? 'Diana buys snacks to bring along and gets the emotional boost she needed.'
                                        : 'Diana stays home and video-calls one colleague instead. Her record stays clean.'}
                                </span>
                            </div>
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
                            {choice === 'attend' ? (
                                <p className="pt-1 text-red-600">
                                    After snacks: {formatWalletCurrency((cash?.usdValue ?? 0) - SNACK_COST)} cash
                                </p>
                            ) : null}
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
