'use client';

import { useState } from 'react';
import type { WalletItem } from '../utils/walletData';

type Props = {
    wallet: WalletItem[];
    setWallet: React.Dispatch<React.SetStateAction<WalletItem[]>>;
    onClose: () => void;
    onGameOver: (reason: string) => void;
    onRequestCashBreak: () => void;
};

const BAIL_COST = 600;

export default function PartyConsequencesModal({
                                                   wallet,
                                                   setWallet,
                                                   onClose,
                                                   onGameOver,
                                                   onRequestCashBreak,
                                               }: Props) {

    /* ---------- READ FLAGS (NO EARLY RETURN YET) ---------- */

    const attendedParty = (() => {
        try {
            const raw = localStorage.getItem('collegeParty');
            if (!raw) return false;
            return JSON.parse(raw).attended === true;
        } catch {
            return false;
        }
    })();

    const sisterHelped = (() => {
        try {
            const raw = localStorage.getItem('familyHelpEvent');
            if (!raw) return false;
            return JSON.parse(raw).helped === true;
        } catch {
            return false;
        }
    })();

    /* ---------- HOOKS (MUST ALWAYS RUN) ---------- */

    const [choice, setChoice] = useState<'pay' | 'sister'>(
        sisterHelped ? 'sister' : 'pay'
    );

    /* ---------- NOW SAFE TO EARLY-EXIT ---------- */

    if (!attendedParty) {
        onClose();
        return null;
    }

    /* ---------- DERIVED STATE ---------- */

    const cash = wallet.find(w => w.id === 'cash');
    const hasEnoughCash = (cash?.usdValue ?? 0) >= BAIL_COST;

    // confirm always allowed → punishment after
    const canConfirm = choice === 'sister' ? sisterHelped : true;

    /* ---------- CONFIRM HANDLER ---------- */

    const handleConfirm = () => {
        // Sister bails you out
        if (choice === 'sister' && sisterHelped) {
            localStorage.setItem(
                'partyConsequences',
                JSON.stringify({
                    bailedOut: 'sister',
                    date: new Date().toISOString(),
                })
            );

            onClose();
            return;
        }

        // Pay bail yourself
        if (choice === 'pay') {
            if (hasEnoughCash && cash) {
                setWallet(prev =>
                    prev.map(item =>
                        item.id === 'cash'
                            ? {
                                ...item,
                                usdValue: item.usdValue - BAIL_COST,
                                units: item.units - BAIL_COST,
                            }
                            : item
                    )
                );

                localStorage.setItem(
                    'partyConsequences',
                    JSON.stringify({
                        bailedOut: 'self',
                        cost: BAIL_COST,
                        date: new Date().toISOString(),
                    })
                );

                onClose();
                return;
            }

            // ❌ cannot afford → GAME OVER
            onGameOver('Could not afford bail.');
            return;
        }
    };

    /* ---------- UI ---------- */

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

                {/* IMAGE */}
                <img
                    src="/images/events/jail.png"
                    alt="Jail cell"
                    className="event-story-image rounded-xl mb-5"
                />

                {/* TITLE */}
                <h2 className="mb-3 text-center text-2xl font-bold text-red-600">
                    Party Consequences
                </h2>

                <p className="text-lg mb-6">
                    After the party, everything is a blur.
                    <br />
                    You wake up in a temporary jail cell after causing a disturbance.
                    <br />
                    <span className="text-gray-600">
                        You must be bailed out.
                    </span>
                </p>

                {/* CHOICES */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setChoice('pay')}
                        className={`flex-1 rounded-full py-3 text-lg font-semibold border transition ${
                            choice === 'pay'
                                ? 'bg-green-500 text-white border-green-500'
                                : 'bg-white text-gray-600 border-gray-300'
                        }`}
                    >
                        pay bail yourself
                    </button>

                    <button
                        onClick={() => setChoice('sister')}
                        disabled={!sisterHelped}
                        className={`flex-1 rounded-full py-3 text-lg font-semibold border transition ${
                            choice === 'sister'
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white text-gray-600 border-gray-300'
                        } ${!sisterHelped ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        ask your sister for help
                        {!sisterHelped && (
                            <span className="block text-xs mt-1 text-gray-500">
                                (You did not help her earlier)
                            </span>
                        )}
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
                                {choice === 'pay'
                                    ? hasEnoughCash
                                        ? 'You pay the bail and are released.'
                                        : 'You cannot afford bail.'
                                    : sisterHelped
                                        ? 'Your sister helps you get released.'
                                        : 'Your sister refuses to help.'}
                            </p>
                        </div>

                        {choice === 'pay' && (
                            <div className="text-red-600 font-semibold">
                                − ${BAIL_COST} bail cost
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
