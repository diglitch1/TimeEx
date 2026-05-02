'use client';

import { useMemo, useState } from 'react';
import { formatWalletCurrency, formatWalletUnits, type WalletItem } from '../utils/walletData';

type Props = {
    wallet: WalletItem[];
    setWallet: React.Dispatch<React.SetStateAction<WalletItem[]>>;
    onDecisionComplete: () => void;
    onClose: () => void;
};

type Choice = 'accept' | 'negotiate' | 'decline';
type NegotiationOutcome = 'success' | 'failure' | null;

const AIRLINE_LOGO = '/images/COVID-19-PANDEMIC/icons/logo.png';
const AIRLINE_STAMP = '/images/COVID-19-PANDEMIC/icons/stamp.png';
const BASE_FLIGHT_ATTENDANT_SALARY = 3200;
const FAILURE_SAVINGS_DIP = 1800;

function getStoredRouteSalary() {
    if (typeof window === 'undefined') {
        return {
            previousSalary: BASE_FLIGHT_ATTENDANT_SALARY,
            previousRoute: 'short-haul',
        };
    }

    try {
        const routeAssignment = JSON.parse(localStorage.getItem('routeAssignment') ?? '{}') as {
            route?: string;
            monthlyBaseSalary?: number;
            monthlyBonus?: number;
        };
        const base = Number.isFinite(routeAssignment.monthlyBaseSalary)
            ? routeAssignment.monthlyBaseSalary ?? BASE_FLIGHT_ATTENDANT_SALARY
            : BASE_FLIGHT_ATTENDANT_SALARY;
        const bonus = Number.isFinite(routeAssignment.monthlyBonus)
            ? routeAssignment.monthlyBonus ?? 0
            : 0;

        return {
            previousSalary: base + bonus,
            previousRoute: routeAssignment.route ?? 'short-haul',
        };
    } catch {
        return {
            previousSalary: BASE_FLIGHT_ATTENDANT_SALARY,
            previousRoute: 'short-haul',
        };
    }
}

function isTerminatedPath() {
    if (typeof window === 'undefined') return false;

    const rehireRaw = localStorage.getItem('rehiringOffer');
    if (rehireRaw) {
        try {
            const rehire = JSON.parse(rehireRaw) as { employmentStatus?: string };
            if (rehire.employmentStatus === 'active') return false;
        } catch {
            // Ignore malformed storage and fall back to the COVID status.
        }
    }

    try {
        const covidTest = JSON.parse(localStorage.getItem('covidTest') ?? '{}') as {
            result?: string;
            employmentStatus?: string;
        };
        return covidTest.result === 'positive' && covidTest.employmentStatus === 'terminated';
    } catch {
        return localStorage.getItem('employmentStatus') === 'terminated';
    }
}

function withMonthlyIncome(wallet: WalletItem[], monthlyIncome: number) {
    const withoutOldIncome = wallet.filter(
        item =>
            item.id !== 'monthly-income' &&
            item.id !== 'flight-attendant-salary' &&
            item.id !== 'long-haul-bonus'
    );

    return [
        ...withoutOldIncome,
        {
            id: 'monthly-income',
            label: 'Monthly income',
            units: monthlyIncome,
            unitLabel: '$/month',
            usdValue: monthlyIncome,
        },
    ];
}

function withoutMonthlyIncome(wallet: WalletItem[]) {
    return wallet.filter(
        item =>
            item.id !== 'monthly-income' &&
            item.id !== 'flight-attendant-salary' &&
            item.id !== 'long-haul-bonus'
    );
}

export default function RehiringOfferModal({
    wallet,
    setWallet,
    onDecisionComplete,
    onClose,
}: Props) {
    const [choice, setChoice] = useState<Choice>('accept');
    const [contractOpen, setContractOpen] = useState(false);
    const [wheelOpen, setWheelOpen] = useState(false);
    const [wheelSpinning, setWheelSpinning] = useState(false);
    const [wheelRotation, setWheelRotation] = useState(0);
    const [negotiationOutcome, setNegotiationOutcome] = useState<NegotiationOutcome>(null);
    const [negotiationRoll] = useState(() => Math.random());
    const [routeRoll] = useState(() => Math.random());
    const terminatedPath = isTerminatedPath();
    const { previousSalary, previousRoute } = useMemo(() => getStoredRouteSalary(), []);
    const cash = wallet.find(item => item.id === 'cash');
    const hasGroundSchoolCertificate =
        typeof window !== 'undefined' &&
        localStorage.getItem('pilotGroundSchoolCertificate') === 'true';

    const acceptSalary = Math.round(previousSalary * 0.8);
    const negotiatedSalary = Math.round(previousSalary * 0.9);
    const projectedSalary =
        choice === 'negotiate'
            ? negotiatedSalary
            : choice === 'decline'
              ? 0
              : acceptSalary;

    const resolveNegotiationOutcome = (): Exclude<NegotiationOutcome, null> =>
        negotiationRoll < 0.5 ? 'success' : 'failure';

    const finalizeDecision = (finalNegotiationOutcome: NegotiationOutcome) => {
        const acceptedOffer =
            choice === 'accept' || (choice === 'negotiate' && finalNegotiationOutcome === 'success');
        const newRoute = acceptedOffer
            ? routeRoll < 0.5
                ? 'long-haul'
                : 'short-haul'
            : null;
        const monthlySalary =
            choice === 'accept'
                ? acceptSalary
                : finalNegotiationOutcome === 'success'
                  ? negotiatedSalary
                  : 0;

        const decision = {
            choice,
            negotiationOutcome: finalNegotiationOutcome,
            acceptedOffer,
            declinedForPilotTraining: choice === 'decline',
            offerPulled: finalNegotiationOutcome === 'failure',
            previousSalary,
            previousRoute,
            monthlySalary,
            payCutPercent:
                choice === 'accept' ? 20 : finalNegotiationOutcome === 'success' ? 10 : null,
            randomRoute: newRoute,
            noRoutePreference: acceptedOffer,
            probationMonths: acceptedOffer ? 6 : 0,
            stableIncomeBaseForPilotApplication: acceptedOffer,
            acceleratedPilotTrackUnlocked: choice === 'decline' && hasGroundSchoolCertificate,
            pilotApplicationHarder:
                choice === 'decline' && !hasGroundSchoolCertificate,
            event10FinancialDifficulty:
                choice === 'decline' || finalNegotiationOutcome === 'failure',
            employmentStatus: acceptedOffer ? 'active' : 'inactive',
            date: new Date().toISOString(),
        };

        localStorage.setItem('rehiringOffer', JSON.stringify(decision));
        localStorage.setItem('employmentStatus', acceptedOffer ? 'active' : 'inactive');
        localStorage.setItem('routeMapLocked', acceptedOffer ? 'false' : 'true');
        localStorage.setItem('rehiringStableIncomeBase', String(acceptedOffer));
        localStorage.setItem('pilotAcceleratedTrackUnlocked', String(decision.acceleratedPilotTrackUnlocked));
        localStorage.setItem('pilotApplicationHarder', String(decision.pilotApplicationHarder));

        if (acceptedOffer && newRoute) {
            const routeAssignment = {
                route: newRoute,
                longHaul: newRoute === 'long-haul',
                shortHaul: newRoute === 'short-haul',
                monthlyBaseSalary: monthlySalary,
                monthlyBonus: 0,
                randomAssignment: true,
                probationMonths: 6,
                date: new Date().toISOString(),
            };

            localStorage.setItem('routeAssignment', JSON.stringify(routeAssignment));
            localStorage.setItem('routeLongHaul', String(newRoute === 'long-haul'));
            localStorage.setItem('routeShortHaul', String(newRoute === 'short-haul'));
            localStorage.setItem('payroll_flight_attendant_lastDate', '2021-03-11');
            setWallet(prev => withMonthlyIncome(prev, monthlySalary));
        } else {
            setWallet(prev => {
                const withoutIncome = withoutMonthlyIncome(prev);

                if (finalNegotiationOutcome !== 'failure') return withoutIncome;

                return withoutIncome.map(item =>
                    item.id === 'cash'
                        ? {
                              ...item,
                              units: item.units - FAILURE_SAVINGS_DIP,
                              usdValue: item.usdValue - FAILURE_SAVINGS_DIP,
                          }
                        : item
                );
            });
        }

        if (choice === 'negotiate') {
            setNegotiationOutcome(finalNegotiationOutcome);
            onDecisionComplete();
            return;
        }

        onDecisionComplete();
        onClose();
    };

    const handleConfirm = () => {
        if (choice === 'negotiate') {
            setWheelOpen(true);
            return;
        }

        finalizeDecision(null);
    };

    const handleSpinWheel = () => {
        if (wheelSpinning) return;

        const finalNegotiationOutcome = resolveNegotiationOutcome();
        const landingAngle = finalNegotiationOutcome === 'success' ? 48 : 226;
        const fullSpins = 360 * 7;

        setWheelSpinning(true);
        setWheelRotation(fullSpins + landingAngle);

        window.setTimeout(() => {
            finalizeDecision(finalNegotiationOutcome);
            setWheelOpen(false);
            setWheelSpinning(false);
        }, 3900);
    };

    const closeAfterNegotiation = () => {
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="party-event-modal relative overflow-hidden rounded-2xl bg-white text-gray-900 shadow-xl animate-event-in">
                {contractOpen ? (
                    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/35 px-4">
                        <div className="max-h-[88svh] w-[min(620px,calc(100vw-56px))] overflow-y-auto rounded-xl border border-slate-300 bg-[#fffdf7] p-5 text-slate-900 shadow-2xl animate-letter-unfold">
                            <div className="mb-4 flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={AIRLINE_LOGO}
                                        alt="Airline logo"
                                        className="h-14 w-14 object-contain"
                                        draggable={false}
                                    />
                                    <div>
                                        <p className="text-lg font-black leading-tight text-slate-950">
                                            AeroNova Airways
                                        </p>
                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                            Human Resources
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                                        Crew Return Agreement
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-slate-700">
                                        Effective March 11, 2021
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm leading-relaxed text-slate-700">
                                <p>
                                    This agreement confirms the proposed return of{' '}
                                    <strong>Diana Gelus</strong> to cabin crew duties under revised
                                    operational terms.
                                </p>
                                <p>
                                    The employee accepts a revised monthly salary of{' '}
                                    <strong>{formatWalletCurrency(acceptSalary)}</strong>, reflecting a{' '}
                                    <strong>20% reduction</strong> from the previous recorded salary of{' '}
                                    <strong>{formatWalletCurrency(previousSalary)}</strong>.
                                </p>
                                <p>
                                    Route assignment will be made according to operational need. The
                                    employee has <strong>no route preference guarantee</strong> and may
                                    be assigned to <strong>long-haul or short-haul duty</strong>.
                                </p>
                                <p>
                                    The first <strong>6 months</strong> of return service are a formal{' '}
                                    <strong>probationary period</strong>. Salary, route stability, and
                                    working terms may not be renegotiated before that period ends.
                                </p>
                                <p>
                                    The company acknowledges vaccine rollout conditions and the
                                    gradual restart of schedules, but confirms that all terms remain
                                    subject to <strong>pandemic recovery staffing policy</strong>.
                                </p>
                            </div>

                            <div className="mt-5 flex items-end justify-between gap-4 border-t border-slate-200 pt-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                                        Airline HR Department
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-slate-800">
                                        Signature pending employee response
                                    </p>
                                </div>
                                <img
                                    src={AIRLINE_STAMP}
                                    alt="Airline approval stamp"
                                    className="h-30 w-30 object-contain opacity-90"
                                    draggable={false}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => setContractOpen(false)}
                                className="mt-5 w-full rounded-full bg-blue-600 py-3 text-base font-semibold text-white transition hover:bg-blue-500"
                            >
                                close contract
                            </button>
                        </div>
                    </div>
                ) : null}

                {wheelOpen ? (
                    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/45 px-4">
                        <div className="w-[min(560px,calc(100vw-56px))] rounded-2xl border border-amber-200 bg-white p-5 text-center text-slate-900 shadow-2xl animate-event-in">
                            <style jsx>{`
                                @keyframes wheelGlow {
                                    0%,
                                    100% {
                                        box-shadow: 0 0 0 rgba(245, 158, 11, 0);
                                    }
                                    50% {
                                        box-shadow: 0 0 34px rgba(245, 158, 11, 0.45);
                                    }
                                }

                                @keyframes pointerTick {
                                    0%,
                                    100% {
                                        transform: translateX(-50%) rotate(0deg);
                                    }
                                    50% {
                                        transform: translateX(-50%) rotate(8deg);
                                    }
                                }
                            `}</style>

                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-600">
                                Negotiation Review
                            </p>
                            <h3 className="mt-1 text-2xl font-black text-slate-950">
                                Spin for HR&apos;s response
                            </h3>

                            <div className="relative mx-auto mt-5 h-72 w-72">
                                <div className="absolute left-1/2 top-[-10px] z-20 h-0 w-0 -translate-x-1/2 border-l-[18px] border-r-[18px] border-t-[34px] border-l-transparent border-r-transparent border-t-slate-950 drop-shadow-lg" />

                                <div
                                    className="absolute inset-0 rounded-full border-[10px] border-slate-900 shadow-[0_20px_42px_rgba(15,23,42,0.28)]"
                                    style={{
                                        animation: wheelSpinning
                                            ? 'wheelGlow 700ms ease-in-out infinite'
                                            : undefined,
                                        background:
                                            'conic-gradient(from -90deg, #22c55e 0deg 180deg, #ef4444 180deg 360deg)',
                                        transform: `rotate(${wheelRotation}deg)`,
                                        transition: wheelSpinning
                                            ? 'transform 3800ms cubic-bezier(0.12, 0.72, 0.08, 1)'
                                            : 'transform 280ms ease-out',
                                    }}
                                >
                                    <div className="absolute inset-[18px] rounded-full border-4 border-white/80" />
                                    <div className="absolute left-1/2 top-8 -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-sm font-black uppercase tracking-wide text-green-700 shadow">
                                        10% cut
                                    </div>
                                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-sm font-black uppercase tracking-wide text-red-700 shadow">
                                        offer pulled
                                    </div>
                                    <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-slate-900 bg-white text-sm font-black text-slate-950 shadow-xl">
                                        HR
                                    </div>
                                </div>
                            </div>

                            <p className="mt-4 text-sm leading-relaxed text-slate-600">
                                Diana sends the counteroffer. HR either meets her halfway or pulls
                                the offer completely.
                            </p>

                            <button
                                type="button"
                                onClick={handleSpinWheel}
                                disabled={wheelSpinning}
                                className={`mt-5 w-full rounded-full py-3 text-base font-semibold transition ${
                                    wheelSpinning
                                        ? 'cursor-not-allowed bg-amber-200 text-amber-700'
                                        : 'bg-amber-500 text-white hover:bg-amber-400'
                                }`}
                            >
                                {wheelSpinning ? 'spinning...' : 'spin the wheel'}
                            </button>
                        </div>
                    </div>
                ) : null}

                {negotiationOutcome ? (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/35 px-4">
                        <div className="w-[min(520px,calc(100vw-56px))] rounded-xl bg-white p-5 text-center shadow-2xl animate-event-in">
                            <h3
                                className={`text-xl font-black ${
                                    negotiationOutcome === 'success'
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                }`}
                            >
                                {negotiationOutcome === 'success'
                                    ? 'Negotiation accepted'
                                    : 'Offer withdrawn'}
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-gray-700">
                                {negotiationOutcome === 'success'
                                    ? `HR meets Diana halfway. Her new monthly salary is ${formatWalletCurrency(negotiatedSalary)}, and her route is assigned randomly.`
                                    : `HR decides not to continue the offer. Diana covers two more months from savings: -${formatWalletCurrency(FAILURE_SAVINGS_DIP)}.`}
                            </p>
                            <button
                                type="button"
                                onClick={closeAfterNegotiation}
                                className="mt-5 w-full rounded-full bg-blue-600 py-3 text-base font-semibold text-white transition hover:bg-blue-500"
                            >
                                continue
                            </button>
                        </div>
                    </div>
                ) : null}

                <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
                    <div className="mb-3 flex items-center gap-3 border-b border-slate-200 pb-3">
                        <img
                            src={AIRLINE_LOGO}
                            alt="Airline logo"
                            className="h-12 w-12 object-contain"
                            draggable={false}
                        />
                        <div className="min-w-0">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                                Airline HR Department
                            </p>
                            <h2 className="text-lg font-black text-slate-950">
                                Return-to-Service Offer
                            </h2>
                        </div>
                    </div>

                    <div className="space-y-2 text-sm leading-relaxed text-slate-700">
                        <p>Dear Ms. Gelus,</p>
                        <p>
                            {terminatedPath
                                ? 'As schedules rebuild, we are contacting selected former cabin crew about returning to service.'
                                : 'Your furlough period is ending as full schedules resume across the network.'}
                        </p>
                        <p>
                            Return requires signing the attached revised contract. The terms reflect
                            the current recovery phase of the airline industry.
                        </p>
                        <p className="pt-1 font-semibold text-slate-900">
                            Attachment:{' '}
                            <button
                                type="button"
                                onClick={() => setContractOpen(true)}
                                className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white transition hover:bg-blue-500"
                            >
                                see contract
                            </button>
                        </p>
                    </div>
                </div>

                <p className="party-event-copy mb-4">
                    The vaccine rollout is giving everyone cautious optimism. Diana has to decide
                    whether stability is worth the new terms.
                </p>

                <div className="mb-4 grid gap-3 sm:grid-cols-3">
                    <button
                        type="button"
                        onClick={() => setChoice('accept')}
                        className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                            choice === 'accept'
                                ? 'border-green-500 bg-green-500 text-white'
                                : 'border-gray-300 bg-white text-gray-700'
                        }`}
                    >
                        accept terms
                    </button>
                    <button
                        type="button"
                        onClick={() => setChoice('negotiate')}
                        className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                            choice === 'negotiate'
                                ? 'border-amber-500 bg-amber-500 text-white'
                                : 'border-gray-300 bg-white text-gray-700'
                        }`}
                    >
                        negotiate
                    </button>
                    <button
                        type="button"
                        onClick={() => setChoice('decline')}
                        className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                            choice === 'decline'
                                ? 'border-red-500 bg-red-500 text-white'
                                : 'border-gray-300 bg-white text-gray-700'
                        }`}
                    >
                        decline
                    </button>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Immediate effect
                            </label>
                            <div className="rounded-lg border px-3 py-2 text-base font-semibold">
                                {choice === 'accept'
                                    ? `${formatWalletCurrency(acceptSalary)}/month`
                                    : choice === 'negotiate'
                                      ? '50/50 outcome'
                                      : '$0/month'}
                                <span className="block text-xs font-medium text-gray-500">
                                    {choice === 'accept'
                                        ? 'Income resumes now, with random route assignment.'
                                        : choice === 'negotiate'
                                          ? `${formatWalletCurrency(negotiatedSalary)}/month if successful, offer withdrawn if not.`
                                          : 'No airline income. Diana commits fully to pilot training.'}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">Outcome</label>
                            <p className="text-gray-700">
                                {choice === 'accept'
                                    ? 'A stable income base returns before the pilot application, but the contract limits her leverage.'
                                    : choice === 'negotiate'
                                      ? 'Diana pushes back. Success improves her Event 10 financial base; failure makes the next step harder.'
                                      : hasGroundSchoolCertificate
                                        ? 'Accelerated pilot track is unlocked because Diana completed the online course.'
                                        : 'Without the online course, the pilot application becomes more expensive and harder.'}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-300 p-3">
                        <p className="mb-2 font-semibold">Wallet</p>
                        <div className="max-h-[120px] space-y-1 overflow-y-auto text-sm text-gray-800">
                            {wallet.map(item => (
                                <p key={item.id}>
                                    {item.label}:{' '}
                                    <span className="font-medium">{formatWalletUnits(item)}</span>
                                    <span className="text-gray-500">
                                        {' '}({formatWalletCurrency(item.usdValue)})
                                    </span>
                                </p>
                            ))}
                            {choice === 'decline' ? (
                                <p className="pt-1 text-red-600">
                                    Monthly airline income after decision: {formatWalletCurrency(0)}
                                </p>
                            ) : null}
                            {choice === 'negotiate' ? (
                                <p className="pt-1 text-amber-600">
                                    Failure cash after savings dip:{' '}
                                    {formatWalletCurrency((cash?.usdValue ?? 0) - FAILURE_SAVINGS_DIP)}
                                </p>
                            ) : (
                                <p className="pt-1 text-green-600">
                                    Projected monthly income: {formatWalletCurrency(projectedSalary)}
                                </p>
                            )}
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
