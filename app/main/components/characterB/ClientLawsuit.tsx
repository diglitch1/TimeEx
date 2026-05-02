'use client';

import { useEffect, useMemo, useState } from 'react';
import type { WalletItem } from '../../utils/walletData';

type Props = {
    wallet: WalletItem[];
    setWallet: React.Dispatch<React.SetStateAction<WalletItem[]>>;
    onClose: () => void;
    onRequestCashBreak: () => void;
    onGameOver: (reason: string) => void;
};

type Stage = 'notice' | 'lawyer' | 'briefing' | 'memorize' | 'question' | 'result';
type LawyerChoice = 'daughter' | 'outside';

type DaughterRentHelpDecision = {
    daughterHelped?: boolean;
};

type MemoryRound = {
    title: string;
    facts: string[];
    question: string;
    options: string[];
    correct: string;
};

const OUTSIDE_LAWYER_COST = 7500;
const FULL_CLAIM_AMOUNT = 40000;
const PENDING_LAWSUIT_KEY = 'clientLawsuitPending';
const GAME_OVER_RESULT_DELAY_MS = 3500;

type PendingLawsuitState = {
    lawyer: LawyerChoice;
    lawyerCost: number;
    correctAnswers: number;
    damages: number;
    totalCost: number;
    answers: { question: string; selected: string; correct: string }[];
    cashBreakStartedAt?: number;
};

const rounds: MemoryRound[] = [
    {
        title: 'Round 1: The contract clause',
        facts: [
            'The buyer initialed the inspection waiver.',
            'The purchase contract included an as-is condition clause.',
            'The mortgage estimate warned that payments could reset.',
            'Renovation plans were submitted after closing.',
            'Cain recommended independent legal review before signing.',
        ],
        question: 'Which clause was included in the purchase contract?',
        options: [
            'Guaranteed resale value',
            'As-is condition clause',
            'Free renovation coverage',
            'Fixed profit protection',
        ],
        correct: 'As-is condition clause',
    },
    {
        title: 'Round 2: The buyer claim',
        facts: [
            'The buyer says he lost the apartment after mortgage payments jumped.',
            'He spent heavily on kitchen and basement renovations.',
            'The renovation receipts total nearly $50,000.',
            'He argues Cain pushed the deal too aggressively.',
            'His filing asks the court to recover the renovation losses.',
        ],
        question: 'What money is the buyer trying to recover?',
        options: [
            'A missed salary payment',
            'Renovation losses',
            'Golf tournament fees',
            'A car insurance bill',
        ],
        correct: 'Renovation losses',
    },
    {
        title: 'Round 3: Cain’s old notes',
        facts: [
            'Cain wrote that the loan terms were unstable.',
            'He noted that monthly payments could reset higher.',
            'He marked the client as nervous before closing.',
            'He saved the signed disclosure packet.',
            'He did not save a follow-up phone transcript.',
        ],
        question: 'Which warning appears in Cain’s old notes?',
        options: [
            'The building would be demolished.',
            'Monthly payments could reset higher.',
            'The client had already sued before.',
            'The renovations were guaranteed.',
        ],
        correct: 'Monthly payments could reset higher.',
    },
];

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

function getDamages(correctAnswers: number) {
    if (correctAnswers >= 3) return 0;
    if (correctAnswers === 2) return FULL_CLAIM_AMOUNT / 2;
    return FULL_CLAIM_AMOUNT;
}

function getWalletTotalValue(wallet: WalletItem[]) {
    return wallet.reduce((sum, item) => sum + item.usdValue, 0);
}

function readPendingLawsuit() {
    if (typeof window === 'undefined') return null;

    try {
        const raw = localStorage.getItem(PENDING_LAWSUIT_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as PendingLawsuitState;
    } catch {
        localStorage.removeItem(PENDING_LAWSUIT_KEY);
        return null;
    }
}

export default function ClientLawsuitModal({
    wallet,
    setWallet,
    onClose,
    onRequestCashBreak,
    onGameOver,
}: Props) {
    const daughterHelped = useMemo(readDaughterHelped, []);
    const pendingAtOpen = useMemo(readPendingLawsuit, []);
    const [stage, setStage] = useState<Stage>(pendingAtOpen ? 'result' : 'notice');
    const [lawyerChoice, setLawyerChoice] = useState<LawyerChoice>(
        pendingAtOpen?.lawyer ?? (daughterHelped ? 'daughter' : 'outside')
    );
    const [roundIndex, setRoundIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [correctAnswers, setCorrectAnswers] = useState(pendingAtOpen?.correctAnswers ?? 0);
    const [answers, setAnswers] = useState<{ question: string; selected: string; correct: string }[]>(
        pendingAtOpen?.answers ?? []
    );
    const walletNeedsScroll = wallet.length > 3;
    const cash = wallet.find(item => item.id === 'cash');
    const lawyerCost = pendingAtOpen?.lawyerCost ?? (lawyerChoice === 'outside' ? OUTSIDE_LAWYER_COST : 0);
    const damages = pendingAtOpen?.damages ?? (stage === 'result' ? getDamages(correctAnswers) : 0);
    const totalCost = pendingAtOpen?.totalCost ?? lawyerCost + damages;
    const totalValue = getWalletTotalValue(wallet);
    const hasEnoughCash = (cash?.usdValue ?? 0) >= totalCost;
    const canCoverWithNetWorth = totalValue >= totalCost;
    const canLeaveToRaiseCash = stage === 'result' && !hasEnoughCash && canCoverWithNetWorth;
    const currentRound = rounds[roundIndex];

    useEffect(() => {
        if (!pendingAtOpen?.cashBreakStartedAt) return;
        if (Date.now() - pendingAtOpen.cashBreakStartedAt < 30000) return;
        if (hasEnoughCash) return;

        onGameOver(`Could not raise enough cash for court costs of ${formatWalletCurrency(totalCost)}.`);
    }, [hasEnoughCash, onGameOver, pendingAtOpen, totalCost]);

    useEffect(() => {
        if (stage !== 'result' || canCoverWithNetWorth) return;

        const timer = window.setTimeout(() => {
            onGameOver(`Cain's total net worth could not cover court costs of ${formatWalletCurrency(totalCost)}.`);
        }, GAME_OVER_RESULT_DELAY_MS);

        return () => window.clearTimeout(timer);
    }, [canCoverWithNetWorth, onGameOver, stage, totalCost]);

    const startMemoryGame = () => {
        setRoundIndex(0);
        setSelectedAnswer(null);
        setCorrectAnswers(0);
        setAnswers([]);
        setStage('memorize');
    };

    const submitAnswer = () => {
        if (!selectedAnswer) return;

        const isCorrect = selectedAnswer === currentRound.correct;
        const nextAnswers = [
            ...answers,
            {
                question: currentRound.question,
                selected: selectedAnswer,
                correct: currentRound.correct,
            },
        ];

        setAnswers(nextAnswers);
        setCorrectAnswers(value => value + (isCorrect ? 1 : 0));
        setSelectedAnswer(null);

        if (roundIndex >= rounds.length - 1) {
            setStage('result');
            return;
        }

        setRoundIndex(index => index + 1);
        setStage('memorize');
    };

    const handleConfirmResult = () => {
        if (!canCoverWithNetWorth) {
            onGameOver(`Could not cover court costs of ${formatWalletCurrency(totalCost)}.`);
            return;
        }

        if (!hasEnoughCash) {
            localStorage.setItem(
                PENDING_LAWSUIT_KEY,
                JSON.stringify({
                    lawyer: lawyerChoice,
                    lawyerCost,
                    correctAnswers,
                    damages,
                    totalCost,
                    answers,
                    cashBreakStartedAt: Date.now(),
                })
            );

            onRequestCashBreak();
            return;
        }

        if (totalCost > 0) {
            setWallet(prev =>
                prev.map(item =>
                    item.id === 'cash'
                        ? {
                              ...item,
                              units: item.units - totalCost,
                              usdValue: item.usdValue - totalCost,
                          }
                        : item
                )
            );
        }

        localStorage.setItem(
            'clientLawsuit',
            JSON.stringify({
                lawyer: lawyerChoice,
                lawyerCost,
                correctAnswers,
                damages,
                totalCost,
                outcome:
                    damages === 0
                        ? 'won'
                        : damages === FULL_CLAIM_AMOUNT / 2
                          ? 'settled-half'
                          : 'lost',
                answers,
                date: new Date().toISOString(),
            })
        );
        localStorage.removeItem(PENDING_LAWSUIT_KEY);

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative w-[min(900px,calc(100vw-32px))] max-h-[calc(100svh-32px)] overflow-y-auto rounded-2xl bg-white p-7 text-gray-900 shadow-xl animate-event-in">
                {canLeaveToRaiseCash ? (
                    <button
                        type="button"
                        onClick={handleConfirmResult}
                        className="scenario-break-button"
                        aria-label="Exit scenario for 30 seconds to raise cash"
                        title="Exit for 30 seconds to sell assets"
                    >
                        x
                    </button>
                ) : null}

                {stage === 'notice' && (
                    <>
                        <h2 className="mb-3 text-center text-2xl font-bold text-red-600">
                            Client Lawsuit
                        </h2>
                        <img
                            src="/images/Global-financial-crisis/events/judge_hammer.png"
                            alt="Judge hammer"
                            className="event-story-image rounded-xl mb-5"
                        />
                        <p className="mb-6 text-lg leading-relaxed">
                            A former buyer from Cain's August 9, 2007 risky deal has filed a lawsuit.
                            More than a year later, after losing the apartment during the housing
                            crash, the client claims Cain pushed him into a deal he could not afford
                            and failed to properly warn him. He spent heavily on renovations and now
                            wants the court to force Cain to repay the full
                            {' '}{formatWalletCurrency(FULL_CLAIM_AMOUNT)}.
                        </p>
                        <button
                            type="button"
                            onClick={() => setStage('lawyer')}
                            className="w-full rounded-full bg-blue-600 py-4 text-lg font-semibold text-white transition hover:bg-blue-500"
                        >
                            continue
                        </button>
                    </>
                )}

                {stage === 'lawyer' && (
                    <>
                        <h2 className="mb-3 text-center text-2xl font-bold text-red-600">
                            Choose Legal Help
                        </h2>
                        <img
                            src="/images/Global-financial-crisis/events/judge_hammer.png"
                            alt="Judge hammer"
                            className="event-story-image rounded-xl mb-5"
                        />
                        <p className="mb-6 text-lg leading-relaxed">
                            Court starts in one hour. Cain needs someone who can organize the old
                            contract, the disclosure packet, and his notes before the hearing begins.
                        </p>

                        <div className="mb-6 flex gap-4">
                            <button
                                type="button"
                                disabled={!daughterHelped}
                                onClick={() => daughterHelped && setLawyerChoice('daughter')}
                                className={`flex-1 rounded-full border py-3 text-lg font-semibold transition ${
                                    lawyerChoice === 'daughter'
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
                                onClick={() => setLawyerChoice('outside')}
                                className={`flex-1 rounded-full border py-3 text-lg font-semibold transition ${
                                    lawyerChoice === 'outside'
                                        ? 'border-red-500 bg-red-500 text-white'
                                        : 'border-gray-300 bg-white text-gray-600'
                                }`}
                            >
                                hire urgent lawyer
                            </button>
                        </div>

                        {!daughterHelped && (
                            <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                                Cain cannot ask his daughter because he refused to help her when she needed rent support.
                            </p>
                        )}

                        <div className="mb-6 grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-semibold">Outcome</label>
                                    <p className="leading-relaxed text-gray-700">
                                        {lawyerChoice === 'daughter'
                                            ? 'His daughter helps prepare the defense for free and focuses on the contract details.'
                                            : 'Cain hires an emergency attorney on short notice. The retainer is painfully expensive.'}
                                    </p>
                                </div>
                                <div className={`font-semibold ${lawyerChoice === 'daughter' ? 'text-green-600' : 'text-red-600'}`}>
                                    {lawyerChoice === 'daughter'
                                        ? '$0 legal help'
                                        : `- ${formatWalletCurrency(OUTSIDE_LAWYER_COST)} urgent retainer`}
                                </div>
                            </div>

                            <div className="rounded-xl border border-gray-300 p-4">
                                <p className="mb-2 font-semibold">Wallet</p>
                                <div className={`space-y-1 pr-1 text-gray-800 ${walletNeedsScroll ? 'max-h-[92px] overflow-y-auto' : ''}`}>
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
                            onClick={() => setStage('briefing')}
                            className="w-full rounded-full bg-blue-600 py-4 text-lg font-semibold text-white transition hover:bg-blue-500"
                        >
                            continue
                        </button>
                    </>
                )}

                {stage === 'briefing' && (
                    <>
                        <h2 className="mb-3 text-center text-2xl font-bold text-red-600">
                            Court Memory Briefing
                        </h2>
                        <img
                            src="/images/Global-financial-crisis/events/in_court.png"
                            alt="Courtroom"
                            className="event-story-image rounded-xl mb-5"
                        />
                        <div className="mb-6 space-y-4 text-lg leading-relaxed">
                            <p>
                                The buyer says Cain ignored obvious warning signs and pushed him
                                into a fragile apartment purchase on August 9, 2007. He lost the
                                apartment after the loan reset, then sued Cain for the renovation
                                money he says he never would have spent if he had been properly warned.
                            </p>
                            <p>
                                Next, you will see <strong>five case facts</strong> before each
                                question. Memorize them carefully. The judge will ask one detail
                                from the file. Your answers decide whether Cain pays
                                <strong> nothing, half, or the full {formatWalletCurrency(FULL_CLAIM_AMOUNT)}</strong>.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={startMemoryGame}
                            className="w-full rounded-full bg-blue-600 py-4 text-lg font-semibold text-white transition hover:bg-blue-500"
                        >
                            start memory game
                        </button>
                    </>
                )}

                {stage === 'memorize' && (
                    <>
                        <h2 className="mb-3 text-center text-2xl font-bold text-red-600">
                            {currentRound.title}
                        </h2>
                        <p className="mb-4 text-center text-lg text-gray-700">
                            Study the file. When you are ready, continue to the judge's question.
                        </p>
                        <div className="mb-6 grid gap-3">
                            {currentRound.facts.map((fact, index) => (
                                <div
                                    key={fact}
                                    className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3"
                                >
                                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-500">
                                        Fact {index + 1}
                                    </p>
                                    <p className="mt-1 text-lg text-gray-800">{fact}</p>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => setStage('question')}
                            className="w-full rounded-full bg-blue-600 py-4 text-lg font-semibold text-white transition hover:bg-blue-500"
                        >
                            I'm ready
                        </button>
                    </>
                )}

                {stage === 'question' && (
                    <>
                        <h2 className="mb-3 text-center text-2xl font-bold text-red-600">
                            Judge's Question
                        </h2>
                        <img
                            src="/images/Global-financial-crisis/events/in_court.png"
                            alt="Courtroom"
                            className="event-story-image rounded-xl mb-5"
                        />
                        <p className="mb-5 text-center text-xl font-semibold text-gray-800">
                            {currentRound.question}
                        </p>
                        <div className="mb-6 grid gap-3 sm:grid-cols-2">
                            {currentRound.options.map(option => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setSelectedAnswer(option)}
                                    className={`rounded-2xl border-4 px-4 py-4 text-left text-base font-semibold transition ${
                                        selectedAnswer === option
                                            ? 'border-sky-400 bg-sky-50 ring-4 ring-sky-100'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            disabled={!selectedAnswer}
                            onClick={submitAnswer}
                            className={`w-full rounded-full py-4 text-lg font-semibold transition ${
                                selectedAnswer
                                    ? 'bg-blue-600 text-white hover:bg-blue-500'
                                    : 'cursor-not-allowed bg-gray-300 text-gray-500'
                            }`}
                        >
                            submit answer
                        </button>
                    </>
                )}

                {stage === 'result' && (
                    <>
                        <h2 className="mb-3 text-center text-2xl font-bold text-red-600">
                            Court Decision
                        </h2>
                        <img
                            src="/images/Global-financial-crisis/events/in_court.png"
                            alt="Courtroom"
                            className="event-story-image rounded-xl mb-5"
                        />

                        <div className="mb-6 rounded-xl border border-gray-300 bg-gray-50 p-5 text-center">
                            <p className="text-lg text-gray-700">
                                You remembered {correctAnswers} of {rounds.length} key facts.
                            </p>
                            <p className="mt-2 text-2xl font-bold text-red-600">
                                Damages: {formatWalletCurrency(damages)}
                            </p>
                            <p className="mt-2 text-lg font-semibold text-gray-800">
                                Total cost with legal help: {formatWalletCurrency(totalCost)}
                            </p>
                            <p className="mt-3 text-sm leading-relaxed text-gray-600">
                                {damages === 0
                                    ? 'Cain wins the case and pays no damages.'
                                    : damages === FULL_CLAIM_AMOUNT / 2
                                      ? 'The court splits responsibility, so Cain pays half the claim.'
                                      : 'Cain loses the case and must pay the full claim.'}
                            </p>
                        </div>

                        {!hasEnoughCash && (
                            <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                                {canCoverWithNetWorth
                                    ? `Cain needs ${formatWalletCurrency(totalCost)} in cash. Confirming will give you 30 seconds to sell assets and raise the money.`
                                    : `Cain's total net worth is not enough to cover ${formatWalletCurrency(totalCost)}.`}
                            </p>
                        )}

                        <button
                            type="button"
                            disabled={!canCoverWithNetWorth}
                            onClick={handleConfirmResult}
                            className={`w-full rounded-full py-4 text-lg font-semibold transition ${
                                canCoverWithNetWorth
                                    ? 'bg-blue-600 text-white hover:bg-blue-500'
                                    : 'cursor-not-allowed bg-gray-300 text-gray-500'
                            }`}
                        >
                            {hasEnoughCash ? 'confirm decision' : 'raise cash'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
