'use client';

import { useState } from 'react';
import type { WalletItem } from '../utils/walletData';

type Props = {
    wallet: WalletItem[];
    setWallet: React.Dispatch<React.SetStateAction<WalletItem[]>>;
    onClose: () => void;
};

const INSURED_COST = 200;
const FULL_COST = 2000;

export default function CarCrashModal({
                                          wallet,
                                          setWallet,
                                          onClose,
                                      }: Props) {

    /* ---------- READ FLAGS ---------- */

    // Did player buy car insurance earlier?
    const hasInsurance = (() => {
        try {
            const raw = localStorage.getItem('carInsurance');
            if (!raw) return false;
            return JSON.parse(raw).insured === true;
        } catch {
            return false;
        }
    })();

    // Did parents gift a car?
    const parentsCarAccepted = (() => {
        try {
            const raw = localStorage.getItem('parentsSupport');
            if (!raw) return false;
            return JSON.parse(raw).accepted === true;
        } catch {
            return false;
        }
    })();

    /* ---------- HOOKS ---------- */

    const [choice] = useState<'pay'>('pay');

    /* ---------- DERIVED ---------- */

    const cash = wallet.find(w => w.id === 'cash');
    const requiredAmount = hasInsurance ? INSURED_COST : FULL_COST;
    const hasEnoughCash = (cash?.usdValue ?? 0) >= requiredAmount;

    /* ---------- CONFIRM ---------- */

    const handleConfirm = () => {
        if (hasEnoughCash && cash) {
            setWallet(prev =>
                prev.map(item =>
                    item.id === 'cash'
                        ? {
                            ...item,
                            usdValue: item.usdValue - requiredAmount,
                            units: item.units - requiredAmount,
                        }
                        : item
                )
            );

            localStorage.setItem(
                'carCrash',
                JSON.stringify({
                    insured: hasInsurance,
                    cost: requiredAmount,
                    parentsCar: parentsCarAccepted,
                    date: new Date().toISOString(),
                })
            );

            onClose();
            return;
        }

        localStorage.setItem(
            'gameOver',
            JSON.stringify({
                reason: 'Could not afford car repair',
                date: new Date().toISOString(),
            })
        );

        window.location.reload();
    };

    /* ---------- UI ---------- */

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-[760px] rounded-2xl p-8 text-gray-900 shadow-xl animate-event-in">



                {/* TITLE */}
                <h2 className="text-2xl font-bold text-red-600 mb-3">
                    ! Car Crash !
                </h2>

                {/* STORY */}
                <p className="text-lg mb-6">
                    {parentsCarAccepted ? (
                        <>
                            While driving your <span className="font-semibold">brand new car</span> to campus,
                            another driver crashes into you.
                            <br />
                            The car your parents gifted you is badly damaged.
                        </>
                    ) : (
                        <>
                            While driving your <span className="font-semibold">old car</span> to campus,
                            another driver crashes into you.
                            <br />
                            Your already worn car takes serious damage.
                        </>
                    )}
                </p>

                {/* STATUS */}
                <div className="mb-6">
                    <p className="font-semibold">
                        Insurance status:{' '}
                        <span className={hasInsurance ? 'text-green-600' : 'text-red-600'}>
                            {hasInsurance ? 'Insured' : 'No insurance'}
                        </span>
                    </p>
                </div>

                {/* CONTENT */}
                <div className="grid grid-cols-2 gap-6 mb-6">

                    {/* LEFT */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">
                                Repair Cost
                            </label>
                            <div className="rounded-lg border px-4 py-3 text-lg font-semibold">
                                ${requiredAmount}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">
                                Outcome
                            </label>
                            <p className="text-gray-700">
                                {hasEnoughCash
                                    ? 'You can cover the repair costs and continue.'
                                    : 'You cannot afford the repair.'}
                            </p>
                        </div>

                        {!hasEnoughCash && (
                            <p className="text-sm text-red-500">
                                Not enough cash available.
                            </p>
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
