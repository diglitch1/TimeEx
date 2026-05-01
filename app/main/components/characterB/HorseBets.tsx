'use client';

import { useEffect, useMemo, useState } from 'react';
import type { WalletItem } from '../../utils/walletData';

type Props = {
    wallet: WalletItem[];
    setWallet: React.Dispatch<React.SetStateAction<WalletItem[]>>;
    onClose: () => void;
};

type HorseColor = 'purple' | 'blue' | 'yellow' | 'pink';
type Stage = 'pick' | 'reveal' | 'result';

const colors: { id: HorseColor; label: string; className: string }[] = [
    { id: 'purple', label: 'Purple', className: 'bg-purple-500' },
    { id: 'blue', label: 'Blue', className: 'bg-blue-500' },
    { id: 'yellow', label: 'Yellow', className: 'bg-yellow-400' },
    { id: 'pink', label: 'Pink', className: 'bg-pink-400' },
];

function formatWalletCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function getRandomWinner() {
    return colors[Math.floor(Math.random() * colors.length)].id;
}

export default function HorseBetsModal({ wallet, setWallet, onClose }: Props) {
    const [selectedColor, setSelectedColor] = useState<HorseColor | null>(null);
    const [betInput, setBetInput] = useState('');
    const [stage, setStage] = useState<Stage>('pick');
    const [winner, setWinner] = useState<HorseColor | null>(null);
    const [activeFlash, setActiveFlash] = useState<HorseColor>('purple');
    const cash = wallet.find(item => item.id === 'cash');
    const cashAmount = cash?.usdValue ?? 0;
    const betAmount = Number.parseFloat(betInput);
    const validBet = Number.isFinite(betAmount) && betAmount > 0 && betAmount <= cashAmount;
    const didWin = stage === 'result' && selectedColor !== null && winner === selectedColor;
    const resultDelta = didWin && Number.isFinite(betAmount) ? betAmount * 2 : -betAmount;

    const selectedLabel = useMemo(
        () => colors.find(color => color.id === selectedColor)?.label ?? '',
        [selectedColor]
    );
    const winnerLabel = useMemo(
        () => colors.find(color => color.id === winner)?.label ?? '',
        [winner]
    );

    useEffect(() => {
        if (stage !== 'reveal') return;

        let index = 0;
        const interval = window.setInterval(() => {
            index += 1;
            setActiveFlash(colors[index % colors.length].id);
        }, 160);

        const timeout = window.setTimeout(() => {
            const nextWinner = getRandomWinner();
            setWinner(nextWinner);
            setActiveFlash(nextWinner);
            setStage('result');

            const won = nextWinner === selectedColor;
            const walletDelta = won ? betAmount * 2 : -betAmount;
            setWallet(prev =>
                prev.map(item =>
                    item.id === 'cash'
                        ? {
                              ...item,
                              units: item.units + walletDelta,
                              usdValue: item.usdValue + walletDelta,
                          }
                        : item
                )
            );

            localStorage.setItem(
                'horseBets',
                JSON.stringify({
                    selectedColor,
                    winner: nextWinner,
                    betAmount,
                    won,
                    payout: won ? betAmount * 2 : 0,
                    date: new Date().toISOString(),
                })
            );
        }, 3000);

        return () => {
            window.clearInterval(interval);
            window.clearTimeout(timeout);
        };
    }, [betAmount, selectedColor, setWallet, stage]);

    const handleConfirmBet = () => {
        if (!selectedColor || !validBet) return;
        setStage('reveal');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative w-[min(820px,calc(100vw-32px))] max-h-[calc(100svh-32px)] overflow-y-auto rounded-2xl bg-white p-7 text-gray-900 shadow-xl animate-event-in">
                <h2 className="mb-3 text-center text-2xl font-bold text-red-600">
                    Racetrack Wager
                </h2>

                <img
                    src="/images/Global-financial-crisis/events/horses.png"
                    alt="Horse race"
                    className="event-story-image rounded-xl mb-5"
                />

                {stage === 'pick' ? (
                    <>
                        <p className="mb-5 text-lg leading-relaxed">
                            Cain's friend invites him to an afternoon at the racetrack. The mood is
                            loud, nervous, and strangely hopeful, so Cain decides to place one small
                            wager for fun. Pick a racing color and choose how much cash he risks.
                        </p>

                        <div className="mb-5 flex items-center justify-center gap-5">
                            {colors.map(color => (
                                <button
                                    key={color.id}
                                    type="button"
                                    onClick={() => setSelectedColor(color.id)}
                                    className={`h-16 w-16 rounded-full border-4 transition ${
                                        color.className
                                    } ${
                                        selectedColor === color.id
                                            ? 'scale-110 border-gray-950 shadow-[0_0_0_5px_rgba(15,23,42,0.12)]'
                                            : 'border-white shadow-[0_8px_18px_rgba(15,23,42,0.12)] hover:scale-105'
                                    }`}
                                    aria-label={`Bet on ${color.label}`}
                                />
                            ))}
                        </div>

                        <label className="mb-2 block text-sm font-bold uppercase tracking-[0.18em] text-gray-500">
                            Bet amount
                        </label>
                        <input
                            type="number"
                            min="1"
                            max={cashAmount}
                            step="1"
                            value={betInput}
                            onChange={event => setBetInput(event.target.value)}
                            className="mb-3 w-full rounded-xl border border-gray-300 px-4 py-3 text-lg font-semibold outline-none transition focus:border-blue-500"
                            placeholder="Enter any amount"
                        />
                        <p className="mb-6 text-sm font-medium text-gray-600">
                            Available cash: {formatWalletCurrency(cashAmount)}
                            {selectedColor ? ` · Selected: ${selectedLabel}` : ''}
                        </p>

                        <button
                            type="button"
                            disabled={!selectedColor || !validBet}
                            onClick={handleConfirmBet}
                            className={`w-full rounded-full py-4 text-lg font-semibold transition ${
                                selectedColor && validBet
                                    ? 'bg-blue-600 text-white hover:bg-blue-500'
                                    : 'cursor-not-allowed bg-gray-300 text-gray-500'
                            }`}
                        >
                            confirm bet
                        </button>
                    </>
                ) : null}

                {stage === 'reveal' ? (
                    <div className="text-center">
                        <p className="mb-5 text-lg font-semibold text-gray-800">
                            The horses are rounding the final turn...
                        </p>
                        <div className="mb-6 flex items-center justify-center gap-5">
                            {colors.map(color => (
                                <div
                                    key={color.id}
                                    className={`h-16 w-16 rounded-full border-4 transition ${color.className} ${
                                        activeFlash === color.id
                                            ? 'scale-125 border-gray-950 opacity-100'
                                            : 'border-white opacity-45'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                ) : null}

                {stage === 'result' ? (
                    <div className="text-center">
                        <div className="mb-5 flex items-center justify-center gap-5">
                            {colors.map(color => (
                                <div
                                    key={color.id}
                                    className={`h-16 w-16 rounded-full border-4 ${color.className} ${
                                        winner === color.id
                                            ? 'scale-125 border-gray-950'
                                            : 'border-white opacity-35'
                                    }`}
                                />
                            ))}
                        </div>
                        <p className="mb-2 text-xl font-bold text-gray-950">
                            Winning color: {winnerLabel}
                        </p>
                        <p className="mb-6 text-lg leading-relaxed text-gray-700">
                            {didWin
                                ? `Cain picked ${selectedLabel} and won ${formatWalletCurrency(betAmount * 2)}.`
                                : `Cain picked ${selectedLabel}, but the winning color was ${winnerLabel}. He lost ${formatWalletCurrency(betAmount)}.`}
                        </p>
                        <p className={`mb-6 text-2xl font-bold ${didWin ? 'text-green-600' : 'text-red-600'}`}>
                            {didWin ? '+' : '-'}{formatWalletCurrency(Math.abs(resultDelta))}
                        </p>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full rounded-full bg-blue-600 py-4 text-lg font-semibold text-white transition hover:bg-blue-500"
                        >
                            confirm result
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
