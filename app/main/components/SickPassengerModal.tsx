'use client';

import { useEffect, useState } from 'react';
import { formatWalletCurrency, formatWalletUnits, type WalletItem } from '../utils/walletData';

type Props = {
    wallet: WalletItem[];
    setWallet: React.Dispatch<React.SetStateAction<WalletItem[]>>;
    onClose: () => void;
    onRequestCashBreak?: () => void;
};

const FRAMES = [
    '/images/COVID-19-PANDEMIC/events/sick-passenger-walking1.png',
    '/images/COVID-19-PANDEMIC/events/sick-passenger-walking2.png',
    '/images/COVID-19-PANDEMIC/events/sick-passenger-walking3.png',
    '/images/COVID-19-PANDEMIC/events/sick-passenger-closeup.png',
];

const CLOSEUP_IMAGE = '/images/COVID-19-PANDEMIC/events/sick-passenger-closeup.png';
const ALERT_ICON = '/images/COVID-19-PANDEMIC/icons/!.png';

const ALERT_ICON_POSITION = {
    x: 70,
    y: 14,
};

const FADE_MS = 900;
const ALERT_DELAY_MS = 1000;
const LOST_SHIFT_BONUS = 150;

export default function SickPassengerModal({
                                               wallet,
                                               setWallet,
                                               onClose,
                                               onRequestCashBreak,
                                           }: Props) {
    const [displayedFrameIndex, setDisplayedFrameIndex] = useState(0);
    const [nextFrameIndex, setNextFrameIndex] = useState<number | null>(null);
    const [isFading, setIsFading] = useState(false);
    const [nextImageVisible, setNextImageVisible] = useState(false);

    const [alertMounted, setAlertMounted] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);

    const [screen, setScreen] = useState<'scene' | 'decision'>('scene');
    const [sceneVisible, setSceneVisible] = useState(true);
    const [decisionVisible, setDecisionVisible] = useState(false);

    const [choice, setChoice] = useState<'report' | 'quiet'>('report');

    useEffect(() => {
        FRAMES.forEach(src => {
            const image = new window.Image();
            image.src = src;
        });

        const alert = new window.Image();
        alert.src = ALERT_ICON;
    }, []);

    useEffect(() => {
        setAlertMounted(false);
        setAlertVisible(false);

        if (displayedFrameIndex !== 2 || isFading || screen !== 'scene') return;

        const mountTimer = window.setTimeout(() => {
            setAlertMounted(true);
        }, ALERT_DELAY_MS);

        const fadeTimer = window.setTimeout(() => {
            setAlertVisible(true);
        }, ALERT_DELAY_MS + 30);

        return () => {
            window.clearTimeout(mountTimer);
            window.clearTimeout(fadeTimer);
        };
    }, [displayedFrameIndex, isFading, screen]);

    const handleAdvanceScene = () => {
        if (isFading || screen !== 'scene') return;

        setAlertVisible(false);
        setAlertMounted(false);

        if (displayedFrameIndex >= FRAMES.length - 1) {
            setIsFading(true);
            setSceneVisible(false);

            window.setTimeout(() => {
                setScreen('decision');

                window.setTimeout(() => {
                    setDecisionVisible(true);
                    setIsFading(false);
                }, 30);
            }, FADE_MS);

            return;
        }

        const nextIndex = displayedFrameIndex + 1;

        setNextFrameIndex(nextIndex);
        setIsFading(true);
        setNextImageVisible(false);

        window.setTimeout(() => {
            setNextImageVisible(true);
        }, 30);

        window.setTimeout(() => {
            setDisplayedFrameIndex(nextIndex);
            setNextFrameIndex(null);
            setNextImageVisible(false);
            setIsFading(false);
        }, FADE_MS);
    };

    const handleConfirm = () => {
        if (choice === 'report') {
            localStorage.setItem(
                'sickPassenger',
                JSON.stringify({
                    reported: true,
                    keptQuiet: false,
                    lostShiftBonus: LOST_SHIFT_BONUS,
                    date: new Date().toISOString(),
                })
            );

            localStorage.setItem('sickPassengerReported', 'true');
            localStorage.setItem('sickPassengerKeptQuiet', 'false');

            setWallet(prev =>
                prev.map(item =>
                    item.id === 'cash'
                        ? {
                            ...item,
                            units: item.units - LOST_SHIFT_BONUS,
                            usdValue: item.usdValue - LOST_SHIFT_BONUS,
                        }
                        : item
                )
            );

            onClose();
            return;
        }

        localStorage.setItem(
            'sickPassenger',
            JSON.stringify({
                reported: false,
                keptQuiet: true,
                lostShiftBonus: 0,
                date: new Date().toISOString(),
            })
        );

        localStorage.setItem('sickPassengerReported', 'false');
        localStorage.setItem('sickPassengerKeptQuiet', 'true');

        onClose();
    };

    const showAlertIcon =
        displayedFrameIndex === 2 && !isFading && screen === 'scene';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="party-event-modal relative overflow-hidden rounded-2xl bg-white text-gray-900 shadow-xl animate-event-in">
                {onRequestCashBreak && screen === 'decision' ? (
                    <button
                        type="button"
                        onClick={onRequestCashBreak}
                        className="scenario-break-button"
                        aria-label="Exit scenario for 30 seconds to raise cash"
                        title="Exit for 30 seconds to sell assets"
                    >
                        ×
                    </button>
                ) : null}

                {screen === 'scene' ? (
                    <div
                        className="transition-opacity ease-in-out"
                        style={{
                            opacity: sceneVisible ? 1 : 0,
                            transitionDuration: `${FADE_MS}ms`,
                        }}
                    >
                        <h2 className="mb-2 text-center text-2xl font-bold text-red-600">
                            Sick Passenger
                        </h2>

                        <p className="party-event-copy mb-3 text-center text-gray-700">
                            It’s a routine flight. Diana moves through the cabin, serving drinks and food
                            as passengers settle into their journeys.
                        </p>

                        <button
                            type="button"
                            onClick={handleAdvanceScene}
                            className="group relative block aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-950"
                            aria-label="Advance sick passenger scene"
                        >
                            <img
                                src={FRAMES[displayedFrameIndex]}
                                alt="Aircraft cabin scene"
                                className="absolute inset-0 z-10 h-full w-full object-cover"
                                draggable={false}
                            />

                            {nextFrameIndex !== null && (
                                <img
                                    src={FRAMES[nextFrameIndex]}
                                    alt="Aircraft cabin scene"
                                    className="absolute inset-0 z-20 h-full w-full object-cover"
                                    style={{
                                        opacity: nextImageVisible ? 1 : 0,
                                        transition: `opacity ${FADE_MS}ms ease-in-out`,
                                    }}
                                    draggable={false}
                                />
                            )}

                            {showAlertIcon && alertMounted && (
                                <img
                                    src={ALERT_ICON}
                                    alt="Alert"
                                    className={`absolute z-30 h-14 w-14 -translate-x-1/2 -translate-y-1/2 animate-bounce object-contain drop-shadow-[0_8px_18px_rgba(239,68,68,0.45)] transition-opacity duration-500 ${
                                        alertVisible ? 'opacity-100' : 'opacity-0'
                                    }`}
                                    style={{
                                        left: `${ALERT_ICON_POSITION.x}%`,
                                        top: `${ALERT_ICON_POSITION.y}%`,
                                    }}
                                    draggable={false}
                                />
                            )}
                        </button>

                        <p className="mt-3 text-center text-sm font-semibold text-gray-600">
                            Click the image to move forward.
                        </p>
                    </div>
                ) : (
                    <div
                        className="transition-opacity ease-in-out"
                        style={{
                            opacity: decisionVisible ? 1 : 0,
                            transitionDuration: `${FADE_MS}ms`,
                        }}
                    >
                        <h2 className="mb-3 text-center text-2xl font-bold text-red-600">
                            Sick Passenger
                        </h2>

                        <img
                            src={CLOSEUP_IMAGE}
                            alt="A sick passenger on board"
                            className="party-event-image rounded-xl mb-3"
                            draggable={false}
                        />

                        <p className="party-event-copy mb-4">
                            Mid-flight, Diana notices a passenger in row 14 sweating, coughing, and
                            clearly struggling. As senior crew on this leg, she has to decide whether
                            to isolate and report the passenger, or quietly manage the situation to
                            avoid delays and protect the shift bonus.
                        </p>

                        <div className="flex gap-3 mb-4">
                            <button
                                onClick={() => setChoice('report')}
                                className={`flex-1 rounded-full py-2 text-base font-semibold border transition ${
                                    choice === 'report'
                                        ? 'bg-green-500 text-white border-green-500'
                                        : 'bg-white text-gray-600 border-gray-300'
                                }`}
                            >
                                isolate and report
                            </button>

                            <button
                                onClick={() => setChoice('quiet')}
                                className={`flex-1 rounded-full py-2 text-base font-semibold border transition ${
                                    choice === 'quiet'
                                        ? 'bg-red-500 text-white border-red-500'
                                        : 'bg-white text-gray-600 border-gray-300'
                                }`}
                            >
                                keep it quiet
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">
                                        Immediate effect
                                    </label>
                                    <div className="rounded-lg border px-3 py-2 text-base font-semibold">
                                        {choice === 'report' ? `-$${LOST_SHIFT_BONUS}` : '$0'}
                                        <span className="block text-xs font-medium text-gray-500">
                                            {choice === 'report'
                                                ? 'Lost shift bonus due to delay and paperwork'
                                                : 'No immediate financial penalty'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block">
                                        Outcome
                                    </label>
                                    <p className="text-gray-700">
                                        {choice === 'report'
                                            ? 'Diana isolates the passenger, informs the captain, and files the incident report.'
                                            : 'Diana keeps the situation quiet and continues service without creating a formal report.'}
                                    </p>
                                </div>
                            </div>

                            <div className="border border-gray-300 rounded-xl p-3">
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
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleConfirm}
                            className="w-full rounded-full py-3 text-base font-semibold transition bg-blue-600 text-white hover:bg-blue-500"
                        >
                            confirm
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}