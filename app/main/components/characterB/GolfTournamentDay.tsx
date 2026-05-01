'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { WalletItem } from '../../utils/walletData';

type Props = {
    wallet: WalletItem[];
    setWallet: React.Dispatch<React.SetStateAction<WalletItem[]>>;
    onClose: () => void;
};

type Stage = 'confetti' | 'outfit' | 'equipment' | 'instructions' | 'countdown' | 'game' | 'result';

const EVENT_IMAGE_ROOT = '/images/Global-financial-crisis/events';
const CORRECT_OUTFIT = 3;
const CORRECT_EQUIPMENT = 2;
const ROUND_TARGETS = [58, 34, 72];
const ROUND_SPEEDS = [1.05, 1.22, 1.38];
const PREP_BONUS = 500;

const outfits = [
    {
        id: 1,
        label: 'Outfit 1',
        src: `${EVENT_IMAGE_ROOT}/outfit%201.png`,
        detail: 'Long pants, long sleeves, cap, and shoes.',
    },
    {
        id: 2,
        label: 'Outfit 2',
        src: `${EVENT_IMAGE_ROOT}/outfit%202.png`,
        detail: 'Shorts, shirt, shoes, and socks, but no cap.',
    },
    {
        id: 3,
        label: 'Outfit 3',
        src: `${EVENT_IMAGE_ROOT}/outfit%203.png`,
        detail: 'Short-sleeve shirt, shorts, socks, shoes, and cap.',
    },
];

const equipment = [
    {
        id: 1,
        label: 'Equipment 1',
        src: `${EVENT_IMAGE_ROOT}/equipment1.png`,
    },
    {
        id: 2,
        label: 'Equipment 2',
        src: `${EVENT_IMAGE_ROOT}/equipment2.png`,
    },
    {
        id: 3,
        label: 'Equipment 3',
        src: `${EVENT_IMAGE_ROOT}/equipment3.png`,
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

function getRoundScore(marker: number, target: number) {
    const distance = Math.abs(marker - target);
    return Math.max(0, Math.round(100 - distance * 3.1));
}

function makeConfettiPieces() {
    const colors = ['#ef4444', '#f59e0b', '#facc15', '#22c55e', '#3b82f6'];

    return Array.from({ length: 42 }, (_, index) => ({
        id: index,
        left: 4 + Math.random() * 92,
        delay: Math.random() * 0.6,
        duration: 1.8 + Math.random() * 1.2,
        color: colors[index % colors.length],
        rotate: Math.round(Math.random() * 180),
    }));
}

export default function GolfTournamentDayModal({ wallet, setWallet, onClose }: Props) {
    const [stage, setStage] = useState<Stage>('confetti');
    const [selectedOutfit, setSelectedOutfit] = useState<number | null>(null);
    const [selectedEquipment, setSelectedEquipment] = useState<number | null>(null);
    const [countdown, setCountdown] = useState(3);
    const [roundIndex, setRoundIndex] = useState(0);
    const [marker, setMarker] = useState(0);
    const [roundScores, setRoundScores] = useState<number[]>([]);
    const [roundLocked, setRoundLocked] = useState(false);
    const confettiPieces = useMemo(makeConfettiPieces, []);
    const animationRef = useRef<number | null>(null);
    const markerRef = useRef(0);
    const directionRef = useRef(1);

    const totalScore = roundScores.reduce((sum, score) => sum + score, 0);
    const currentTarget = ROUND_TARGETS[roundIndex] ?? ROUND_TARGETS[0];
    const outfitReady = selectedOutfit !== null;
    const equipmentReady = selectedEquipment !== null;
    const outfitCorrect = selectedOutfit === CORRECT_OUTFIT;
    const equipmentCorrect = selectedEquipment === CORRECT_EQUIPMENT;
    const prepBonus = outfitCorrect && equipmentCorrect ? PREP_BONUS : 0;
    const shotAward = roundScores.reduce((sum, score) => sum + Math.round(score * 5), 0);
    const award = prepBonus + shotAward;

    useEffect(() => {
        if (stage !== 'confetti') return;

        const timer = window.setTimeout(() => setStage('outfit'), 3000);
        return () => window.clearTimeout(timer);
    }, [stage]);

    useEffect(() => {
        if (stage !== 'countdown') return;

        setCountdown(3);
        const interval = window.setInterval(() => {
            setCountdown(value => {
                if (value <= 1) {
                    window.clearInterval(interval);
                    setRoundIndex(0);
                    setRoundScores([]);
                    setRoundLocked(false);
                    markerRef.current = 0;
                    directionRef.current = 1;
                    setMarker(0);
                    setStage('game');
                    return 0;
                }

                return value - 1;
            });
        }, 900);

        return () => window.clearInterval(interval);
    }, [stage]);

    useEffect(() => {
        if (stage !== 'game' || roundLocked) return;

        const tick = () => {
            const speed = ROUND_SPEEDS[roundIndex] ?? ROUND_SPEEDS[0];
            let next = markerRef.current + directionRef.current * speed;

            if (next >= 100) {
                next = 100;
                directionRef.current = -1;
            } else if (next <= 0) {
                next = 0;
                directionRef.current = 1;
            }

            markerRef.current = next;
            setMarker(next);

            animationRef.current = window.requestAnimationFrame(tick);
        };

        animationRef.current = window.requestAnimationFrame(tick);

        return () => {
            if (animationRef.current !== null) {
                window.cancelAnimationFrame(animationRef.current);
            }
        };
    }, [roundIndex, roundLocked, stage]);

    const stopRound = () => {
        if (stage !== 'game' || roundLocked) return;

        const score = getRoundScore(markerRef.current, currentTarget);
        const nextScores = [...roundScores, score];
        setRoundScores(nextScores);
        setRoundLocked(true);

        window.setTimeout(() => {
            if (nextScores.length >= 3) {
                setStage('result');
                return;
            }

            setRoundIndex(index => index + 1);
            markerRef.current = 0;
            directionRef.current = 1;
            setMarker(0);
            setRoundLocked(false);
        }, 1100);
    };

    useEffect(() => {
        if (stage !== 'game') return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.code !== 'Space') return;

            event.preventDefault();
            stopRound();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    });

    const handleAcceptAward = () => {
        setWallet(prev =>
            prev.map(item =>
                item.id === 'cash'
                    ? {
                          ...item,
                          units: item.units + award,
                          usdValue: item.usdValue + award,
                      }
                    : item
            )
        );

        localStorage.setItem(
            'golfTournamentDay',
            JSON.stringify({
                outfit: selectedOutfit,
                equipment: selectedEquipment,
                outfitCorrect,
                equipmentCorrect,
                points: totalScore,
                prepBonus,
                shotAward,
                award,
                date: new Date().toISOString(),
            })
        );

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative w-[min(920px,calc(100vw-32px))] max-h-[calc(100svh-32px)] overflow-y-auto rounded-2xl bg-white p-7 text-gray-900 shadow-xl animate-event-in">
                {stage === 'confetti' && (
                    <div className="relative flex min-h-[430px] items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-slate-950">
                        <img
                            src={`${EVENT_IMAGE_ROOT}/golf_field.png`}
                            alt="Golf field"
                            className="absolute inset-0 h-full w-full object-cover opacity-45"
                        />
                        {confettiPieces.map(piece => (
                            <span
                                key={piece.id}
                                className="golf-confetti-piece"
                                style={{
                                    left: `${piece.left}%`,
                                    backgroundColor: piece.color,
                                    animationDelay: `${piece.delay}s`,
                                    animationDuration: `${piece.duration}s`,
                                    transform: `rotate(${piece.rotate}deg)`,
                                }}
                            />
                        ))}
                        <div className="relative z-10 max-w-xl rounded-2xl border border-white/40 bg-white/95 px-10 py-8 text-center shadow-2xl">
                            <p className="mb-2 text-xs font-bold uppercase tracking-[0.32em] text-gray-500">
                                September 15
                            </p>
                            <h2 className="mb-3 text-4xl font-bold text-red-600">Tournament Day</h2>
                            <p className="text-lg text-gray-700">
                                Cain arrives at Grandfather Golf & Country Club. The course is ready,
                                the crowd is gathering, and the first tee is waiting.
                            </p>
                        </div>
                    </div>
                )}

                {stage === 'outfit' && (
                    <>
                        <h2 className="mb-3 text-center text-2xl font-bold text-red-600">
                            Tournament Preparations
                        </h2>
                        <p className="mb-5 text-center text-lg text-gray-700">
                            Pick Cain's outfit and keep the invitation recommendations in mind.
                        </p>

                        <div className="mb-6 grid gap-4 md:grid-cols-3">
                            {outfits.map(outfit => (
                                <button
                                    key={outfit.id}
                                    type="button"
                                    onClick={() => setSelectedOutfit(outfit.id)}
                                    className={`rounded-2xl border-4 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
                                        selectedOutfit === outfit.id
                                            ? 'border-sky-400 shadow-lg ring-4 ring-sky-100'
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <img
                                        src={outfit.src}
                                        alt={outfit.label}
                                        className="mb-3 h-[270px] w-full rounded-xl object-contain"
                                    />
                                    <p className="font-bold">{outfit.label}</p>
                                    <p className="mt-1 text-sm leading-relaxed text-gray-600">
                                        {outfit.detail}
                                    </p>
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            disabled={!outfitReady}
                            onClick={() => setStage('equipment')}
                            className={`w-full rounded-full py-4 text-lg font-semibold transition ${
                                outfitReady
                                    ? 'bg-blue-600 text-white hover:bg-blue-500'
                                    : 'cursor-not-allowed bg-gray-300 text-gray-500'
                            }`}
                        >
                            confirm outfit
                        </button>
                    </>
                )}

                {stage === 'equipment' && (
                    <>
                        <h2 className="mb-3 text-center text-2xl font-bold text-red-600">
                            Tournament Preparations
                        </h2>
                        <p className="mb-5 text-center text-lg text-gray-700">
                            Choose the equipment Cain should bring to the course.
                        </p>

                        <div className="mb-6 grid gap-4 md:grid-cols-3">
                            {equipment.map(item => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setSelectedEquipment(item.id)}
                                    className={`rounded-2xl border-4 bg-white p-3 text-center transition hover:-translate-y-0.5 hover:shadow-lg ${
                                        selectedEquipment === item.id
                                            ? 'border-sky-400 shadow-lg ring-4 ring-sky-100'
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <img
                                        src={item.src}
                                        alt={item.label}
                                        className="mb-3 h-[270px] w-full rounded-xl object-contain"
                                    />
                                    <p className="font-bold">{item.label}</p>
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setStage('outfit')}
                                className="flex-1 rounded-full border border-gray-300 bg-white py-4 text-lg font-semibold text-gray-700 transition hover:bg-gray-50"
                            >
                                back
                            </button>
                            <button
                                type="button"
                                disabled={!equipmentReady}
                                onClick={() => setStage('instructions')}
                                className={`flex-1 rounded-full py-4 text-lg font-semibold transition ${
                                    equipmentReady
                                        ? 'bg-blue-600 text-white hover:bg-blue-500'
                                        : 'cursor-not-allowed bg-gray-300 text-gray-500'
                                }`}
                            >
                                confirm equipment
                            </button>
                        </div>
                    </>
                )}

                {stage === 'instructions' && (
                    <>
                        <h2 className="mb-4 text-center text-2xl font-bold text-red-600">
                            Golf Tournament (Mini Game)
                        </h2>
                        <img
                            src={`${EVENT_IMAGE_ROOT}/golf_field.png`}
                            alt="Golf field"
                            className="mb-5 h-[260px] w-full rounded-xl object-cover"
                        />
                        <div className="mx-auto mb-6 max-w-2xl rounded-xl border border-gray-300 bg-gray-50 p-5 text-center">
                            <p className="text-lg leading-relaxed text-gray-700">
                                A small marker will slide across the power bar. Press the
                                <span className="font-bold text-blue-600"> spacebar </span>
                                when it is as close as possible to the
                                <span className="rounded-md bg-red-100 px-2 py-0.5 font-bold text-red-600"> warm red target zone</span>.
                                You get three shots, and each shot can win up to
                                <span className="font-bold text-green-600"> $500</span>.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setStage('countdown')}
                            className="w-full rounded-full bg-blue-600 py-4 text-lg font-semibold text-white transition hover:bg-blue-500"
                        >
                            ready to play
                        </button>
                    </>
                )}

                {stage === 'countdown' && (
                    <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                        <h2 className="mb-4 text-2xl font-bold text-red-600">Get ready</h2>
                        <p className="text-8xl font-black text-blue-600">{countdown}</p>
                    </div>
                )}

                {stage === 'game' && (
                    <>
                        <h2 className="mb-4 text-center text-2xl font-bold text-red-600">
                            Golf Tournament
                        </h2>
                        <img
                            src={`${EVENT_IMAGE_ROOT}/golf_field.png`}
                            alt="Golf field"
                            className="mb-5 h-[240px] w-full rounded-xl object-cover"
                        />

                        <div className="mb-3 flex items-center justify-between text-sm font-semibold text-gray-600">
                            <span>Round {roundIndex + 1} of 3</span>
                            <span>Total: {totalScore} pts</span>
                        </div>

                        <div className="relative -mx-2 mb-5 h-16 border border-gray-300 bg-gradient-to-r from-green-500 via-yellow-300 to-green-500 shadow-inner">
                            <div
                                className="absolute top-0 h-full w-[22%] -translate-x-1/2 bg-gradient-to-r from-yellow-300 via-orange-500 to-yellow-300"
                                style={{ left: `${currentTarget}%` }}
                            />
                            <div
                                className="absolute top-0 h-full w-[9%] -translate-x-1/2 bg-red-600"
                                style={{ left: `${currentTarget}%` }}
                            />
                            <div
                                className="absolute -top-2 h-20 w-2 -translate-x-1/2 bg-slate-950 shadow-lg"
                                style={{ left: `${marker}%` }}
                            />
                        </div>

                        {roundLocked ? (
                            <p className="text-center text-lg font-semibold text-blue-600">
                                Shot scored {roundScores[roundScores.length - 1]} points
                                ({formatWalletCurrency(Math.round((roundScores[roundScores.length - 1] ?? 0) * 5))}).
                            </p>
                        ) : (
                            <button
                                type="button"
                                onClick={stopRound}
                                className="w-full rounded-full bg-blue-600 py-4 text-lg font-semibold text-white transition hover:bg-blue-500"
                            >
                                stop shot (or press space)
                            </button>
                        )}
                    </>
                )}

                {stage === 'result' && (
                    <>
                        <h2 className="mb-4 text-center text-2xl font-bold text-red-600">
                            Tournament Results
                        </h2>
                        <div className="mb-5 rounded-xl border border-gray-300 bg-gray-50 p-5 text-center">
                            <p className="text-lg text-gray-700">Final score</p>
                            <p className="mt-2 text-5xl font-black text-blue-600">{totalScore}</p>
                            <p className="mt-3 text-lg font-semibold text-green-600">
                                Award: {formatWalletCurrency(award)}
                            </p>
                            <p className="mt-2 text-sm text-gray-600">
                                Preparation bonus: {formatWalletCurrency(prepBonus)} · Shot bonus: {formatWalletCurrency(shotAward)}
                            </p>
                            <div className="mx-auto mt-4 max-w-xl space-y-2 text-sm leading-relaxed text-gray-700">
                                <p>
                                    {outfitCorrect
                                        ? 'You picked the outfit according to the recommendations.'
                                        : 'You did not pick the outfit according to the recommendations.'}
                                </p>
                                <p>
                                    {equipmentCorrect
                                        ? 'You brought the recommended Silvergate Eagle equipment.'
                                        : 'You did not bring the recommended Silvergate Eagle equipment.'}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleAcceptAward}
                            className="w-full rounded-full bg-blue-600 py-4 text-lg font-semibold text-white transition hover:bg-blue-500"
                        >
                            confirm award
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
