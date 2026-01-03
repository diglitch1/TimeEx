'use client';

import { useState } from 'react';
import { INITIAL_WALLET, type WalletItem } from '../utils/walletData';

type Props = {
    wallet: WalletItem[];
    setWallet: React.Dispatch<React.SetStateAction<WalletItem[]>>;
    onClose: () => void;
};

// this event happens March 21 at 14:00

export default function FamilyHelpModal({wallet, setWallet, onClose,}: Props) {

    const [choice, setChoice] = useState<'help' | 'decline'>('help');
    const [source, setSource] = useState(wallet[0]?.id ?? '');

    const REQUIRED_AMOUNT = 500;

    const selectedAsset = wallet.find(w => w.id === source);
    const canConfirm =
        choice === 'help' && (selectedAsset?.usdValue ?? 0) >= REQUIRED_AMOUNT;


    const handleConfirm = () => {
        if (choice === 'decline') {
            localStorage.setItem(
                'familyHelpEvent',
                JSON.stringify({
                    helped: false,
                    date: new Date().toISOString(),
                })
            );

            onClose();
            return;
        }

        const selected = wallet.find(w => w.id === source);
        if (!selected || selected.usdValue < REQUIRED_AMOUNT) return;

        localStorage.setItem(
            'familyHelpEvent',
            JSON.stringify({
                helped: true,
                amount: REQUIRED_AMOUNT,
                source,
                date: new Date().toISOString(),
            })
        );

        setWallet(prev =>
            prev.map(item =>
                item.id === source
                    ? {
                        ...item,
                        usdValue: item.usdValue - REQUIRED_AMOUNT,
                        units:
                            item.id === 'cash'
                                ? item.units - REQUIRED_AMOUNT
                                : item.units -
                                (REQUIRED_AMOUNT / item.usdValue) * item.units,
                    }
                    : item
            )
        );

        onClose();
    };



    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-[760px] rounded-2xl p-8 text-gray-900 shadow-xl
      animate-event-in">

                {/* TITLE */}
                <h2 className="text-2xl font-bold text-red-600 mb-3">
                    ! Family Member in Need !
                </h2>

                <p className="text-lg mb-6">
                    Your sister asks you to send her <span className="font-semibold">$500</span>.
                </p>

                {/* HELP / DECLINE */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setChoice('help')}
                        className={`flex-1 rounded-full py-3 text-lg font-semibold border transition ${
                            choice === 'help'
                                ? 'bg-green-500 text-white border-green-500'
                                : 'bg-white text-gray-600 border-gray-300'
                        }`}
                    >
                        help
                    </button>

                    <button
                        onClick={() => setChoice('decline')}
                        className={`flex-1 rounded-full py-3 text-lg font-semibold border transition ${
                            choice === 'decline'
                                ? 'bg-red-500 text-white border-red-500'
                                : 'bg-white text-gray-600 border-gray-300'
                        }`}
                    >
                        decline
                    </button>
                </div>

                {/* CONTENT */}
                <div className="grid grid-cols-2 gap-6 mb-6">

                    {/* LEFT */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Source</label>

                            <select
                                value={source}
                                onChange={e => setSource(e.target.value)}
                                disabled={choice === 'decline'}
                                className={`w-full rounded-lg border px-4 py-3 ${
                                    choice === 'decline'
                                        ? 'bg-gray-100 text-gray-400'
                                        : 'bg-white text-gray-900'
                                }`}
                            >
                                {wallet.map(item => (
                                    <option key={item.id} value={item.id}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>

                            {!canConfirm && choice === 'help' && (
                                <p className="text-sm text-red-500 mt-2">
                                    Not enough funds. Choose another asset.
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Amount</label>
                            <div className="rounded-lg border px-4 py-3 text-lg font-semibold">
                                $500
                            </div>
                        </div>
                    </div>

                    {/* RIGHT */}
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
                    disabled={!canConfirm && choice === 'help'}
                    onClick={handleConfirm}
                    className={`w-full rounded-full py-4 text-lg font-semibold transition ${
                        canConfirm || choice === 'decline'
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
