'use client';

import { useState } from 'react';
import { formatWalletCurrency, formatWalletUnits, type WalletItem } from '../utils/walletData';

type Props = {
    wallet: WalletItem[];
    setWallet: React.Dispatch<React.SetStateAction<WalletItem[]>>;
    onClose: () => void;
    onRequestCashBreak: () => void;
};

type Choice = 'online-course' | 'ground-shifts';

const IMG_GROUNDED = '/images/COVID-19-PANDEMIC/events/waking%20up.png';
const GROUND_SHIFT_INCOME = 600;
const ONLINE_COURSE_FEE = 299;

function getCurrentMonthlyIncome(wallet: WalletItem[]) {
    return wallet.find(item => item.id === 'monthly-income')?.units ?? 0;
}

function isTerminatedPath() {
    if (typeof window === 'undefined') return false;

    const covidTestRaw = localStorage.getItem('covidTest');
    if (!covidTestRaw) return localStorage.getItem('employmentStatus') === 'terminated';

    try {
        const covidTest = JSON.parse(covidTestRaw) as {
            result?: string;
            employmentStatus?: string;
        };

        return covidTest.result === 'positive' && covidTest.employmentStatus === 'terminated';
    } catch {
        return localStorage.getItem('employmentStatus') === 'terminated';
    }
}

export default function GroundedChoiceModal({
    wallet,
    setWallet,
    onClose,
    onRequestCashBreak,
}: Props) {
    const [choice, setChoice] = useState<Choice>('online-course');
    const [certificateOpen, setCertificateOpen] = useState(false);
    const terminatedPath = isTerminatedPath();
    const cash = wallet.find(item => item.id === 'cash');

    const handleConfirm = () => {
        const takesCourse = choice === 'online-course';
        const takesGroundShifts = choice === 'ground-shifts';

        localStorage.setItem(
            'groundedChoice',
            JSON.stringify({
                choice,
                onlineCourse: takesCourse,
                groundShifts: takesGroundShifts,
                certificateEarned: takesCourse,
                onlineCourseFee: takesCourse ? ONLINE_COURSE_FEE : 0,
                groundShiftMonthlyIncome: takesGroundShifts ? GROUND_SHIFT_INCOME : 0,
                furloughPath: !terminatedPath,
                terminatedPath,
                pilotApplicationCredit: takesCourse,
                acceleratedTrackPrereq: takesCourse,
                date: new Date().toISOString(),
            })
        );

        localStorage.setItem('groundedOnlineCourse', String(takesCourse));
        localStorage.setItem('groundedGroundShifts', String(takesGroundShifts));
        localStorage.setItem('pilotGroundSchoolCertificate', String(takesCourse));
        localStorage.setItem('groundShiftMonthlyIncome', String(takesGroundShifts ? GROUND_SHIFT_INCOME : 0));

        if (takesCourse) {
            setWallet(prev =>
                prev.map(item =>
                    item.id === 'cash'
                        ? {
                              ...item,
                              units: item.units - ONLINE_COURSE_FEE,
                              usdValue: item.usdValue - ONLINE_COURSE_FEE,
                          }
                        : item
                )
            );
            setCertificateOpen(true);
            return;
        }

        if (takesGroundShifts) {
            setWallet(prev =>
                prev.some(item => item.id === 'monthly-income')
                    ? prev.map(item =>
                          item.id === 'monthly-income'
                              ? {
                                    ...item,
                                    units: item.units + GROUND_SHIFT_INCOME,
                                    usdValue: item.usdValue + GROUND_SHIFT_INCOME,
                                }
                              : item
                      )
                    : [
                          ...prev,
                          {
                              id: 'monthly-income',
                              label: 'Monthly income',
                              units: GROUND_SHIFT_INCOME,
                              unitLabel: '$/month',
                              usdValue: GROUND_SHIFT_INCOME,
                          },
                      ]
            );
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="party-event-modal relative overflow-hidden rounded-2xl bg-white text-gray-900 shadow-xl animate-event-in">
                {choice === 'online-course' && !certificateOpen ? (
                    <button
                        type="button"
                        onClick={onRequestCashBreak}
                        className="scenario-break-button"
                        aria-label="Exit scenario for 30 seconds to raise cash"
                        title="Exit for 30 seconds to sell assets"
                    >
                        x
                    </button>
                ) : null}

                {certificateOpen ? (
                    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/35 px-4">
                        <div
                            className="w-[min(520px,calc(100vw-56px))] rounded-xl border-4 border-amber-300 bg-[#fffdf2] p-6 text-center text-gray-900 shadow-2xl"
                            style={{
                                animation: 'certificate-soft-pop 520ms ease-out both',
                            }}
                        >
                            <style jsx>{`
                                @keyframes certificate-soft-pop {
                                    0% {
                                        opacity: 0;
                                        transform: translateY(14px) scale(0.96);
                                    }
                                    65% {
                                        opacity: 1;
                                        transform: translateY(-3px) scale(1.01);
                                    }
                                    100% {
                                        opacity: 1;
                                        transform: translateY(0) scale(1);
                                    }
                                }
                            `}</style>
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-700">
                                Certificate of Completion
                            </p>

                            <div className="my-4 border-y border-amber-200 py-5">
                                <h3 className="text-2xl font-black text-gray-950">
                                    Ground School Basics
                                </h3>
                                <p className="mt-3 text-sm leading-relaxed text-gray-700">
                                    This certifies that
                                </p>
                                <p className="mt-2 text-3xl font-black text-red-600">
                                    Diana Gelus
                                </p>
                                <p className="mt-3 text-sm leading-relaxed text-gray-700">
                                    has completed the introductory online course covering aviation
                                    fundamentals, flight operations, weather basics, and pilot-path
                                    preparation.
                                </p>
                            </div>

                            <p className="text-sm font-semibold text-gray-700">
                                Certificate earned. Pilot application credit unlocked.
                            </p>
                            <p className="mt-1 text-xs font-semibold text-gray-500">
                                Course fee paid: {formatWalletCurrency(ONLINE_COURSE_FEE)}
                            </p>

                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-5 w-full rounded-full bg-blue-600 py-3 text-base font-semibold text-white transition hover:bg-blue-500"
                            >
                                confirm
                            </button>
                        </div>
                    </div>
                ) : null}

                <h2 className="mb-3 text-center text-2xl font-bold text-red-600">
                    What Now?
                </h2>

                <img
                    src={IMG_GROUNDED}
                    alt="Diana alone at home during the grounded flight period"
                    className="party-event-image rounded-xl mb-3"
                    draggable={false}
                />

                <p className="party-event-copy mb-4">
                    {terminatedPath
                        ? 'Six weeks since the termination letter. The flat is quiet. Diana has never not had a job before.'
                        : "The airline has Diana on furlough. She's still on the roster, technically. But the flights are almost gone. She hasn't worn her uniform in three weeks."}
                    <span className="mt-2 block text-gray-700">
                        {terminatedPath
                            ? 'What do you do when the thing that defined you is just gone?'
                            : 'Does she use this unexpected free time to build toward something, or just get through it day by day?'}
                    </span>
                </p>

                <div className="flex gap-3 mb-4">
                    <button
                        type="button"
                        onClick={() => setChoice('online-course')}
                        className={`flex-1 rounded-full border py-2 text-base font-semibold transition ${
                            choice === 'online-course'
                                ? 'border-green-500 bg-green-500 text-white'
                                : 'border-gray-300 bg-white text-gray-600'
                        }`}
                    >
                        do the online course
                    </button>

                    <button
                        type="button"
                        onClick={() => setChoice('ground-shifts')}
                        className={`flex-1 rounded-full border py-2 text-base font-semibold transition ${
                            choice === 'ground-shifts'
                                ? 'border-red-500 bg-red-500 text-white'
                                : 'border-gray-300 bg-white text-gray-600'
                        }`}
                    >
                        take ground shifts
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Immediate effect
                            </label>
                            <div className="rounded-lg border px-3 py-2 text-base font-semibold">
                                {choice === 'online-course'
                                    ? `-${formatWalletCurrency(ONLINE_COURSE_FEE)}`
                                    : `+${formatWalletCurrency(GROUND_SHIFT_INCOME)}/month`}
                                <span className="block text-xs font-medium text-gray-500">
                                    {choice === 'online-course'
                                        ? terminatedPath
                                            ? 'Diana pays for the course and studies from home. It feels less like filling time and more like rebuilding.'
                                            : 'Diana pays for the course and studies between rare shifts. The days are slow, but life starts to feel purposeful again.'
                                        : terminatedPath
                                          ? 'Diana goes back to the airport that let her go and takes basic monthly ground work.'
                                          : 'Diana picks up monthly luggage and check-in shifts on her off days.'}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Outcome
                            </label>
                            <p className="text-gray-700">
                                {choice === 'online-course'
                                    ? 'No extra income now. Diana earns a basic ground-school certificate after three months.'
                                    : 'New monthly airport ground-work income. No qualification toward the pilot path.'}
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
                            {choice === 'online-course' ? (
                                <p className="pt-1 text-red-600">
                                    After course fee:{' '}
                                    {formatWalletCurrency((cash?.usdValue ?? 0) - ONLINE_COURSE_FEE)} cash
                                </p>
                            ) : null}
                            {choice === 'ground-shifts' ? (
                                <p className="pt-1 text-green-600">
                                    Monthly income after shifts:{' '}
                                    {formatWalletCurrency(getCurrentMonthlyIncome(wallet) + GROUND_SHIFT_INCOME)}/month
                                </p>
                            ) : null}
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleConfirm}
                    className="w-full rounded-full bg-blue-600 py-3 text-base font-semibold text-white transition hover:bg-blue-500"
                >
                    confirm
                </button>
            </div>
        </div>
    );
}
