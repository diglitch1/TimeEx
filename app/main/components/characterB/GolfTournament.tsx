'use client';

import { useState } from 'react';
import { formatWalletUnits, type WalletItem } from '../../utils/walletData';

type Props = {
    wallet: WalletItem[];
    setWallet: React.Dispatch<React.SetStateAction<WalletItem[]>>;
    onClose: () => void;
    onRequestCashBreak: () => void;
};

const TOURNAMENT_FEE = 500;
const ENVELOPE_IMAGE = '/images/Global-financial-crisis/events/envelope_golf.png';

function formatWalletCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export default function GolfTournamentModal({
    wallet,
    setWallet,
    onClose,
    onRequestCashBreak,
}: Props) {
    const [letterOpen, setLetterOpen] = useState(false);
    const [letterClosing, setLetterClosing] = useState(false);
    const [letterRead, setLetterRead] = useState(
        () =>
            typeof window !== 'undefined' &&
            localStorage.getItem('golfTournamentResumeDecision') === 'true'
    );
    const [choice, setChoice] = useState<'accept' | 'decline'>('accept');
    const walletNeedsScroll = wallet.length > 3;
    const cash = wallet.find(item => item.id === 'cash');
    const hasEnoughCash = (cash?.usdValue ?? 0) >= TOURNAMENT_FEE;
    const canConfirm = choice === 'decline' || hasEnoughCash;

    const handleOpenLetter = () => {
        setLetterClosing(false);
        setLetterOpen(true);
    };

    const handleCloseLetter = () => {
        if (letterClosing) return;

        setLetterClosing(true);
        window.setTimeout(() => {
            setLetterOpen(false);
            setLetterClosing(false);
            setLetterRead(true);
        }, 420);
    };

    const handleConfirm = () => {
        if (choice === 'decline') {
            localStorage.removeItem('golfTournamentResumeDecision');
            localStorage.setItem(
                'golfTournament',
                JSON.stringify({
                    accepted: false,
                    paidEntryFee: 0,
                    futureOpportunity: 'missed',
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
                          usdValue: item.usdValue - TOURNAMENT_FEE,
                          units: item.units - TOURNAMENT_FEE,
                      }
                    : item
            )
        );

        localStorage.setItem(
            'golfTournament',
            JSON.stringify({
                accepted: true,
                paidEntryFee: TOURNAMENT_FEE,
                futureOpportunity: 'networking',
                date: new Date().toISOString(),
            })
        );

        localStorage.removeItem('golfTournamentResumeDecision');
        onClose();
    };

    const handleRequestDecisionCashBreak = () => {
        localStorage.setItem('golfTournamentResumeDecision', 'true');
        onRequestCashBreak();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative w-[min(820px,calc(100vw-32px))] max-h-[calc(100svh-32px)] overflow-y-auto rounded-2xl bg-white p-7 text-gray-900 shadow-xl animate-event-in">
                {letterRead && choice === 'accept' ? (
                    <button
                        type="button"
                        onClick={handleRequestDecisionCashBreak}
                        className="scenario-break-button"
                        aria-label="Exit scenario for 30 seconds to raise cash"
                        title="Exit for 30 seconds to sell assets"
                    >
                        x
                    </button>
                ) : null}

                <h2 className="mb-3 text-center text-2xl font-bold text-red-600">
                    Golf Tournament Invitation
                </h2>

                <div className="relative mb-5 flex justify-center rounded-xl bg-gray-100 p-5">
                    <button
                        type="button"
                        onClick={handleOpenLetter}
                        className="relative rounded-xl border border-gray-300 bg-white p-3 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                        aria-label="Open golf invitation envelope"
                    >
                        <img
                            src={ENVELOPE_IMAGE}
                            alt="Golf tournament invitation envelope"
                            className="event-story-image max-w-[560px] rounded-xl object-cover"
                        />
                    </button>

                </div>

                {letterRead ? (
                    <>
                        <p className="mb-6 text-lg leading-relaxed">
                            Cain has read the invitation. Joining may help him meet useful people,
                            but the tournament fee is expensive during an already tense market.
                        </p>

                        <div className="mb-6 flex gap-4">
                            <button
                                type="button"
                                onClick={() => setChoice('accept')}
                                className={`flex-1 rounded-full border py-3 text-lg font-semibold transition ${
                                    choice === 'accept'
                                        ? 'border-green-500 bg-green-500 text-white'
                                        : 'border-gray-300 bg-white text-gray-600'
                                }`}
                            >
                                accept
                            </button>

                            <button
                                type="button"
                                onClick={() => setChoice('decline')}
                                className={`flex-1 rounded-full border py-3 text-lg font-semibold transition ${
                                    choice === 'decline'
                                        ? 'border-red-500 bg-red-500 text-white'
                                        : 'border-gray-300 bg-white text-gray-600'
                                }`}
                            >
                                decline
                            </button>
                        </div>

                        <div className="mb-6 grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-semibold">Outcome</label>
                                    <p className="leading-relaxed text-gray-700">
                                        {choice === 'accept'
                                            ? hasEnoughCash
                                                ? 'Cain joins the tournament and pays the entry fee.'
                                                : 'Cain does not have enough cash available to accept.'
                                            : 'Cain politely declines and keeps his cash, but misses the networking chance.'}
                                    </p>
                                </div>

                                <div
                                    className={`font-semibold ${
                                        choice === 'accept' ? 'text-red-600' : 'text-amber-600'
                                    }`}
                                >
                                    {choice === 'accept'
                                        ? `- ${formatWalletCurrency(TOURNAMENT_FEE)} tournament fee`
                                        : '- networking opportunity'}
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
                    </>
                ) : (
                    <p className="text-center text-lg leading-relaxed text-gray-700">
                        Click the envelope to open Cain's invitation.
                    </p>
                )}
            </div>

            {letterOpen && (
                <div
                    className={`fixed inset-0 z-[60] flex items-center justify-center px-4 py-6 transition-colors duration-300 ${
                        letterClosing ? 'bg-black/0' : 'bg-black/45'
                    }`}
                >
                    <div
                        className={`w-[min(640px,calc(100vw-48px))] max-h-[calc(100svh-48px)] origin-top overflow-y-auto rounded-sm border border-amber-200 bg-[#fffaf0] px-7 py-6 text-gray-900 shadow-2xl ${
                            letterClosing ? 'animate-letter-fold-back' : 'animate-letter-unfold'
                        }`}
                    >
                        <button
                            type="button"
                            onClick={handleCloseLetter}
                            className="float-right -mr-2 -mt-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-lg font-bold leading-none text-gray-700 transition hover:bg-gray-100"
                            aria-label="Close invitation letter"
                        >
                            x
                        </button>

                        <p className="mb-2 text-center text-xs font-bold uppercase tracking-[0.3em] text-gray-500">
                            Invitation
                        </p>
                        <h3 className="mb-4 text-center text-2xl font-bold text-amber-800">
                            Grandfather Golf & Country Club
                        </h3>

                        <p className="text-lg leading-relaxed">
                            Dear Cain,
                            <br />
                            Grandfather Golf & Country Club warmly invites you to a private
                            golf tournament on September 15th, hosted for local business leaders,
                            lenders, and friends of the club. The day includes breakfast on the
                            terrace, a relaxed tournament, quiet networking, and an awards dinner
                            overlooking the course.
                            <br />
                            <br />
                            Your presence would be a pleasure, and we believe the afternoon
                            will offer a welcome chance to step away from the pressure of
                            the market while meeting people who understand the moment. We
                            hope you will join us for a day of good company, calm focus,
                            and a little friendly competition.
                            <br />
                            <br />
                            Kind regards,
                            <br />
                            Grandfather Golf & Country Club Committee
                        </p>

                        <div className="mt-5 text-sm leading-relaxed text-gray-700">
                            <p className="mb-2 font-bold">Recommendation:</p>
                            <p>1. Do not forget your cap. September sun still bites.</p>
                            <p>2. Bring a polished set of Silvergate Eagle clubs.</p>
                            <p>3. Wear comfortable shorts so you can focus on the game.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
