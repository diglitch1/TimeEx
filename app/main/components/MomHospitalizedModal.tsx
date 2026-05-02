'use client';

import { useEffect, useState } from 'react';
import { formatWalletCurrency, formatWalletUnits, type WalletItem } from '../utils/walletData';

type Props = {
    wallet: WalletItem[];
    setWallet: React.Dispatch<React.SetStateAction<WalletItem[]>>;
    onClose: () => void;
};

type Stage = 'call' | 'main' | 'followup';
type Choice = 'hospital' | 'phone';

const PHONE_GIF = '/images/COVID-19-PANDEMIC/icons/phone.gif';
const PHONE_ICON = '/images/COVID-19-PANDEMIC/icons/phone2.png';
const HOSPITAL_ICON = '/images/COVID-19-PANDEMIC/icons/hospital.png';
const ARROW_ICON = '/images/COVID-19-PANDEMIC/icons/arrow.png';
const EVENT_IMAGE = '/images/COVID-19-PANDEMIC/events/mom-hospitalized.png';
const FADE_MS = 700;
const BILL_HELP_AMOUNT = 800;
const SHOW_PICKUP_HOTSPOT = true;

const PICKUP_HOTSPOT = {
    // Manual position and size controls for the clickable pickup area over phone.gif.
    // Set SHOW_PICKUP_HOTSPOT to true while positioning, then false when done.
    x: 46.9,
    y: 45.3,
    width: 7,
    height: 7,
};

const PICKUP_ARROW = {
    // Manual position and rotation controls for the visible animated arrow over phone.gif.
    x: -90,
    y: -20,
    rotationDeg: 90,
    widthRem: 2.8,
    heightRem: 2.8,
};

function isLongHaulRoute() {
    if (typeof window === 'undefined') return false;

    const routeRaw = localStorage.getItem('routeAssignment');
    if (!routeRaw) return false;

    try {
        const route = JSON.parse(routeRaw) as { route?: string; longHaul?: boolean };
        return route.route === 'long-haul' || route.longHaul === true;
    } catch {
        return localStorage.getItem('routeLongHaul') === 'true';
    }
}

export default function MomHospitalizedModal({ wallet, setWallet, onClose }: Props) {
    const [stage, setStage] = useState<Stage>('call');
    const [visible, setVisible] = useState(true);
    const [choice, setChoice] = useState<Choice>('hospital');
    const [helpBills, setHelpBills] = useState(false);
    const longHaul = isLongHaulRoute();
    const cash = wallet.find(item => item.id === 'cash');
    const billCost = helpBills ? BILL_HELP_AMOUNT : 0;

    useEffect(() => {
        [PHONE_GIF, PHONE_ICON, HOSPITAL_ICON, ARROW_ICON, EVENT_IMAGE].forEach(src => {
            const image = new window.Image();
            image.src = src;
        });
    }, []);

    useEffect(() => {
        if (longHaul && choice === 'hospital') {
            setChoice('phone');
        }
    }, [choice, longHaul]);

    const transitionTo = (nextStage: Stage) => {
        setVisible(false);

        window.setTimeout(() => {
            setStage(nextStage);
            window.setTimeout(() => setVisible(true), 30);
        }, FADE_MS);
    };

    const handleConfirmMain = () => {
        const effectiveChoice = longHaul ? 'phone' : choice;

        localStorage.setItem(
            'momHospitalized',
            JSON.stringify({
                route: longHaul ? 'long-haul' : 'short-haul',
                wentToHospital: effectiveChoice === 'hospital',
                stayedOnPhone: effectiveChoice === 'phone',
                helpedWithBills: helpBills,
                billHelpAmount: billCost,
                momStable: true,
                date: new Date().toISOString(),
            })
        );

        localStorage.setItem('momHospitalizedChoice', effectiveChoice);
        localStorage.setItem('momHospitalizedHelpedBills', String(helpBills));

        if (helpBills) {
            setWallet(prev =>
                prev.map(item =>
                    item.id === 'cash'
                        ? {
                              ...item,
                              units: item.units - BILL_HELP_AMOUNT,
                              usdValue: item.usdValue - BILL_HELP_AMOUNT,
                          }
                        : item
                )
            );
        }

        transitionTo('followup');
    };

    const handleClose = () => {
        localStorage.setItem('momHospitalizedFollowupSeen', 'true');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="party-event-modal relative overflow-hidden rounded-2xl bg-white text-gray-900 shadow-xl animate-event-in">
                <div
                    className="transition-opacity ease-in-out"
                    style={{
                        opacity: visible ? 1 : 0,
                        transitionDuration: `${FADE_MS}ms`,
                    }}
                >
                    {stage === 'call' ? (
                        <>
                            <h2 className="mb-3 text-center text-2xl font-bold text-red-600">
                                The Phone Call
                            </h2>

                            <div className="relative mx-auto mb-3 aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-950">
                                <img
                                    src={PHONE_GIF}
                                    alt="Incoming phone call"
                                    className="absolute inset-0 h-full w-full object-contain"
                                    draggable={false}
                                />
                                <div
                                    className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                                    style={{
                                        left: `${PICKUP_HOTSPOT.x}%`,
                                        top: `${PICKUP_HOTSPOT.y}%`,
                                        width: `${PICKUP_HOTSPOT.width}%`,
                                        height: `${PICKUP_HOTSPOT.height}%`,
                                    }}
                                >
                                    <img
                                        src={ARROW_ICON}
                                        alt=""
                                        className="absolute animate-bounce object-contain drop-shadow-[0_8px_14px_rgba(239,68,68,0.35)]"
                                        style={{
                                            left: `${PICKUP_ARROW.x - PICKUP_HOTSPOT.x + 50}%`,
                                            top: `${PICKUP_ARROW.y - PICKUP_HOTSPOT.y + 50}%`,
                                            width: `${PICKUP_ARROW.widthRem}rem`,
                                            height: `${PICKUP_ARROW.heightRem}rem`,
                                            transform: `translate(-50%, -50%) rotate(${PICKUP_ARROW.rotationDeg}deg)`,
                                        }}
                                        draggable={false}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => transitionTo('main')}
                                        className={`absolute inset-0 h-full w-full ${
                                            SHOW_PICKUP_HOTSPOT
                                                ? 'rounded-lg border-2 border-dashed border-red-500 bg-red-500/20'
                                                : 'opacity-0'
                                        }`}
                                        style={{ cursor: 'pointer' }}
                                        aria-label="Pick up incoming call"
                                    />
                                </div>
                            </div>

                            <p className="party-event-copy text-center text-gray-700">
                                An incoming call. Something feels different about this one.
                            </p>
                        </>
                    ) : null}

                    {stage === 'main' ? (
                        <>
                            <h2 className="mb-1 text-center text-2xl font-bold text-red-600">
                                Mom is in the Hospital
                            </h2>

                            <img
                                src={EVENT_IMAGE}
                                alt="Diana receiving news that her mother is hospitalized"
                                className="party-event-image rounded-xl mb-3"
                                draggable={false}
                            />

                            <p className="party-event-copy mb-4">
                                It&apos;s 6am. Diana&apos;s phone rang once and she knew. Her mom has
                                been taken to the ICU with severe COVID pneumonia. She&apos;s critical.
                                <span className="mt-2 block text-gray-700">
                                    {longHaul
                                        ? 'Diana is in a hotel room on another continent. Borders are closed. There are no flights home. All she has is this call.'
                                        : 'Diana is two hours away by car. She can be there.'}
                                </span>
                            </p>

                            <div className="mb-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => !longHaul && setChoice('hospital')}
                                    disabled={longHaul}
                                    className={`flex-1 rounded-full border py-2 text-base font-semibold transition ${
                                        longHaul
                                            ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                                            : choice === 'hospital'
                                              ? 'border-green-500 bg-green-500 text-white'
                                              : 'border-gray-300 bg-white text-gray-600'
                                    }`}
                                    title={
                                        longHaul
                                            ? 'Locked: Diana is too far away to drive to the hospital.'
                                            : undefined
                                    }
                                >
                                    drive to the hospital
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setChoice('phone')}
                                    className={`flex-1 rounded-full border py-2 text-base font-semibold transition ${
                                        choice === 'phone'
                                            ? 'border-blue-500 bg-blue-500 text-white'
                                            : 'border-gray-300 bg-white text-gray-600'
                                    }`}
                                >
                                    stay on the line
                                </button>
                            </div>

                            <label className="mb-4 flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={helpBills}
                                    onChange={event => setHelpBills(event.target.checked)}
                                    className="mt-1 h-4 w-4"
                                />
                                <span>
                                    <span className="block font-semibold text-gray-900">
                                        Help with medical bills ({formatWalletCurrency(BILL_HELP_AMOUNT)})
                                    </span>
                                    Diana can send money toward the hospital expenses. It may not fix
                                    anything, but it feels like doing something.
                                </span>
                            </label>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="space-y-3">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium">
                                            Immediate effect
                                        </label>
                                        <div className="rounded-lg border px-3 py-2 text-base font-semibold">
                                            {helpBills
                                                ? `-${formatWalletCurrency(BILL_HELP_AMOUNT)}`
                                                : '$0'}
                                            <span className="block text-xs font-medium text-gray-500">
                                                {longHaul || choice === 'phone'
                                                    ? 'Diana stays on the line and does everything she can from far away.'
                                                    : 'Diana drives immediately and sits with her mom through the worst of it.'}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium">
                                            Outcome
                                        </label>
                                        <p className="text-gray-700">
                                            {longHaul || choice === 'phone'
                                                ? 'She keeps the phone pressed to her ear until her voice goes quiet.'
                                                : 'The airline grants standard compassionate leave. No work penalty.'}
                                        </p>
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
                                        {helpBills ? (
                                            <p className="pt-1 text-red-600">
                                                After bill help:{' '}
                                                {formatWalletCurrency(
                                                    (cash?.usdValue ?? 0) - BILL_HELP_AMOUNT
                                                )}{' '}
                                                cash
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleConfirmMain}
                                className="w-full rounded-full bg-blue-600 py-3 text-base font-semibold text-white transition hover:bg-blue-500"
                            >
                                confirm
                            </button>
                        </>
                    ) : null}

                    {stage === 'followup' ? (
                        <>
                            <div className="mb-4 flex justify-center">
                                <img
                                    src={longHaul ? PHONE_ICON : HOSPITAL_ICON}
                                    alt=""
                                    className="h-20 w-20 object-contain drop-shadow-lg"
                                    draggable={false}
                                />
                            </div>

                            <h2 className="mb-3 text-center text-2xl font-bold text-red-600">
                                Some Time Passes...
                            </h2>

                            <p className="party-event-copy mb-5 text-center text-gray-700">
                                {longHaul
                                    ? "Diana's phone rings again. Same number as before. Her mom's voice is weak, but it's there. She's been moved out of ICU. She's stable. She's going to be okay. Diana is alone in the hotel room."
                                    : "Diana is sitting beside her mom's bed when the doctor comes in. She's been moved out of ICU. She's stable. She's going to be okay. Diana holds her hand and doesn't say anything for a long time."}
                            </p>

                            <button
                                type="button"
                                onClick={handleClose}
                                className="w-full rounded-full bg-blue-600 py-3 text-base font-semibold text-white transition hover:bg-blue-500"
                            >
                                close
                            </button>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
