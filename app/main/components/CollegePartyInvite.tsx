'use client';

import { useState } from 'react';
import type { WalletItem } from '../utils/walletData';

type Props = {
    wallet: WalletItem[];
    setWallet: React.Dispatch<React.SetStateAction<WalletItem[]>>;
    onClose: () => void;
    onRequestCashBreak: () => void;
};

const PARTY_COST = 120;
const IMG_GANG = '/images/events/gang.png';

export default function CollegePartyInvite({
                                               wallet,
                                               setWallet,
                                               onClose,
                                               onRequestCashBreak,
                                           }: Props) {
    const [choice, setChoice] = useState<'attend' | 'decline'>('attend');

    const cash = wallet.find(w => w.id === 'cash');
    const canConfirm =
        choice === 'decline' || (cash?.usdValue ?? 0) >= PARTY_COST;

    const handleConfirm = () => {
        if (choice === 'decline') {
            localStorage.setItem(
                'collegeParty',
                JSON.stringify({
                    attended: false,
                    date: new Date().toISOString(),
                })
            );

            onClose();
            return;
        }

        if (!cash || cash.usdValue < PARTY_COST) return;

        // log party attendance
        localStorage.setItem(
            'collegeParty',
            JSON.stringify({
                attended: true,
                cost: PARTY_COST,
                date: new Date().toISOString(),
            })
        );

        // unlock future trouble event
        localStorage.setItem('partyTroubleUnlocked', 'true');

        // subtract money
        setWallet(prev =>
            prev.map(item =>
                item.id === 'cash'
                    ? {
                        ...item,
                        usdValue: item.usdValue - PARTY_COST,
                        units: item.units - PARTY_COST,
                    }
                    : item
            )
        );

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="party-event-modal relative bg-white rounded-2xl text-gray-900 shadow-xl animate-event-in">
                <button
                    type="button"
                    onClick={onRequestCashBreak}
                    className="scenario-break-button"
                    aria-label="Exit scenario for 30 seconds to raise cash"
                    title="Exit for 30 seconds to sell assets"
                >
                    ×
                </button>

                {/* TITLE */}
                <h2 className="mb-3 text-center text-2xl font-bold text-red-600">
                    College Party Invite
                </h2>
                {/* STORY IMAGE */}
                <img
                    src={IMG_GANG}
                    alt="Students approaching you"
                    className="party-event-image rounded-xl mb-3"
                    draggable={false}
                />
                <p className="party-event-copy mb-4">
                    A connected student group invites you to a private networking night with alumni,
                    startup founders, and recruiters.
                    <span className="mt-2 block text-gray-700">
                        The buy-in fee is <strong>$120</strong>. What do you do?
                    </span>
                </p>

                {/* CHOICES */}
                <div className="flex gap-3 mb-4">
                    <button
                        onClick={() => setChoice('attend')}
                        className={`flex-1 rounded-full py-2 text-base font-semibold border transition ${
                            choice === 'attend'
                                ? 'bg-green-500 text-white border-green-500'
                                : 'bg-white text-gray-600 border-gray-300'
                        }`}
                    >
                        attend party
                    </button>

                    <button
                        onClick={() => setChoice('decline')}
                        className={`flex-1 rounded-full py-2 text-base font-semibold border transition ${
                            choice === 'decline'
                                ? 'bg-red-500 text-white border-red-500'
                                : 'bg-white text-gray-600 border-gray-300'
                        }`}
                    >
                        decline invite
                    </button>
                </div>

                {/* CONTENT */}
                <div className="grid grid-cols-2 gap-4 mb-4">

                    {/* LEFT */}
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium mb-1 block">
                                Cost
                            </label>
                            <div className="rounded-lg border px-3 py-2 text-base font-semibold">
                                {choice === 'attend' ? `$${PARTY_COST}` : '$0'}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">
                                Outcome
                            </label>
                            <p className="text-gray-700">
                                {choice === 'attend'
                                    ? 'You gain social connections and can have a fun time.'
                                    : 'No cost and no risk, but you miss out on networking and a fun time.'}
                            </p>
                        </div>

                        {!canConfirm && (
                            <p className="text-sm text-red-500">
                                Not enough cash available.
                            </p>
                        )}
                    </div>

                    {/* RIGHT – WALLET */}
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
                    disabled={!canConfirm}
                    onClick={handleConfirm}
                    className={`w-full rounded-full py-3 text-base font-semibold transition ${
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
