'use client';

import { useState } from 'react';
import type { WalletItem } from '../utils/walletData';

type Props = {
    wallet: WalletItem[];
    setWallet: React.Dispatch<React.SetStateAction<WalletItem[]>>;
    onLongHaulIncomeIncrease: () => void;
    onClose: () => void;
};

const IMG_ROUTE = '/images/COVID-19-PANDEMIC/events/Short-Long-Haul.png';
const BASE_FLIGHT_ATTENDANT_SALARY = 3200;
const LONG_HAUL_BONUS = 400;
const ROUTE_ASSIGNMENT_HELP =
    'A route assignment is the type of flights Diana is scheduled to work. Long-haul means longer international trips with extra monthly pay; short-haul means shorter domestic flights with the base flight-attendant salary.';

export default function RouteAssignmentModal({
                                                 wallet,
                                                 setWallet,
                                                 onLongHaulIncomeIncrease,
                                                 onClose,
                                             }: Props) {
    const [choice, setChoice] = useState<'long-haul' | 'short-haul'>('long-haul');

    const handleConfirm = () => {
        const assignment = {
            route: choice,
            longHaul: choice === 'long-haul',
            shortHaul: choice === 'short-haul',
            monthlyBaseSalary: BASE_FLIGHT_ATTENDANT_SALARY,
            monthlyBonus: choice === 'long-haul' ? LONG_HAUL_BONUS : 0,
            date: new Date().toISOString(),
        };

        if (choice === 'long-haul') {
            localStorage.setItem('routeAssignment', JSON.stringify(assignment));

            localStorage.setItem('routeLongHaul', 'true');
            localStorage.setItem('routeShortHaul', 'false');

            setWallet(prev => {
                const monthlyIncome = BASE_FLIGHT_ATTENDANT_SALARY + LONG_HAUL_BONUS;
                const withoutOldIncome = prev.filter(
                    item => item.id !== 'monthly-income' && item.id !== 'flight-attendant-salary' && item.id !== 'long-haul-bonus'
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
            });

            onLongHaulIncomeIncrease();
            onClose();
            return;
        }

        localStorage.setItem('routeAssignment', JSON.stringify(assignment));

        localStorage.setItem('routeLongHaul', 'false');
        localStorage.setItem('routeShortHaul', 'true');

        setWallet(prev => {
            const withoutOldIncome = prev.filter(
                item => item.id !== 'monthly-income' && item.id !== 'flight-attendant-salary' && item.id !== 'long-haul-bonus'
            );

            return [
                ...withoutOldIncome,
                {
                    id: 'monthly-income',
                    label: 'Monthly income',
                    units: BASE_FLIGHT_ATTENDANT_SALARY,
                    unitLabel: '$/month',
                    usdValue: BASE_FLIGHT_ATTENDANT_SALARY,
                },
            ];
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="party-event-modal relative overflow-hidden bg-white rounded-2xl text-gray-900 shadow-xl animate-event-in">
                <div className="mb-3 flex items-center justify-center gap-2">
                    <h2 className="text-center text-2xl font-bold text-red-600">
                        Route Assignment
                    </h2>
                    <button
                        type="button"
                        aria-label={ROUTE_ASSIGNMENT_HELP}
                        title={ROUTE_ASSIGNMENT_HELP}
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-red-200 bg-red-50 text-sm font-bold text-red-600"
                    >
                        i
                    </button>
                </div>

                <img
                    src={IMG_ROUTE}
                    alt="Diana choosing between short-haul and long-haul flight routes"
                    className="party-event-image rounded-xl mb-3"
                    draggable={false}
                />

                <p className="party-event-copy mb-4">
                    Diana gets her first full-time assignment as a flight attendant. The airline is
                    filling two rosters: intercontinental long-haul flights with higher pay and
                    longer layovers abroad, or short-haul domestic routes with more time at home.
                    <span className="mt-2 block text-gray-700">
                        Slots are filling fast. Which route should she choose?
                    </span>
                </p>

                <div className="flex gap-3 mb-4">
                    <button
                        onClick={() => setChoice('long-haul')}
                        className={`flex-1 rounded-full py-2 text-base font-semibold border transition ${
                            choice === 'long-haul'
                                ? 'bg-green-500 text-white border-green-500'
                                : 'bg-white text-gray-600 border-gray-300'
                        }`}
                    >
                        long-haul
                    </button>

                    <button
                        onClick={() => setChoice('short-haul')}
                        className={`flex-1 rounded-full py-2 text-base font-semibold border transition ${
                            choice === 'short-haul'
                                ? 'bg-red-500 text-white border-red-500'
                                : 'bg-white text-gray-600 border-gray-300'
                        }`}
                    >
                        short-haul
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium mb-1 block">
                                Income
                            </label>
                            <div className="rounded-lg border px-3 py-2 text-base font-semibold">
                                {choice === 'long-haul'
                                    ? `$${(BASE_FLIGHT_ATTENDANT_SALARY + LONG_HAUL_BONUS).toLocaleString()}/month`
                                    : `$${BASE_FLIGHT_ATTENDANT_SALARY.toLocaleString()}/month`}
                                <span className="block text-xs font-medium text-gray-500">
                                    {choice === 'long-haul'
                                        ? `Base salary + $${LONG_HAUL_BONUS}/month route bonus`
                                        : 'Base flight-attendant salary'}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">
                                Outcome
                            </label>
                            <p className="text-gray-700">
                                {choice === 'long-haul'
                                    ? 'Diana accepts international routes with higher pay, longer flights, and more time abroad.'
                                    : 'Diana accepts domestic routes with steadier routines and more time close to home.'}
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

                <button
                    onClick={handleConfirm}
                    className="w-full rounded-full py-3 text-base font-semibold transition bg-blue-600 text-white hover:bg-blue-500"
                >
                    confirm
                </button>
            </div>
        </div>
    );
}
