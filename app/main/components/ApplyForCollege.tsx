'use client';

import { useState } from 'react';
import type { WalletItem } from '../utils/walletData';

type Props = {
    wallet: WalletItem[];
    setWallet: React.Dispatch<React.SetStateAction<WalletItem[]>>;
    onClose: () => void;
    onRequestCashBreak: () => void;
};

type School = {
    id: string;
    name: string;
    description: string;
    price: number;
    majors: string[];
    logo: string; // path under /public
};

const ELITE_SCHOOLS: School[] = [
    {
        id: 'ivy-tech',
        name: 'Ivy Tech University',
        description:
            'Prestigious institution with strong alumni networks and elite research facilities.',
        price: 300,
        majors: ['Economics', 'Computer Science', 'Law', 'Political Science'],
        logo: '/images/logos/ivy.png',
    },
    {
        id: 'northbridge',
        name: 'Northbridge College',
        description:
            'Globally respected college with a strong focus on science and leadership.',
        price: 280,
        majors: ['Engineering', 'Finance', 'Medicine', 'Mathematics'],
        logo: '/images/logos/north.svg',
    },
    {
        id: 'atlas',
        name: 'Atlas Institute',
        description:
            'Private elite school emphasizing innovation and entrepreneurship.',
        price: 310,
        majors: ['Business', 'Design', 'Artificial Intelligence', 'Entrepreneurship'],
        logo: '/images/logos/atlas.png',
    },
];


const REGULAR_SCHOOLS: School[] = [
    {
        id: 'state-university',
        name: 'State University',
        description:
            'Affordable public university with broad academic coverage.',
        price: 120,
        majors: ['Education', 'Biology', 'History', 'Sociology'],
        logo: '/images/logos/state.png',
    },
    {
        id: 'city-college',
        name: 'City College',
        description:
            'Solid education with strong local industry ties.',
        price: 95,
        majors: ['Information Technology', 'Marketing', 'Architecture', 'Media Studies'],
        logo: '/images/logos/city.png',
    },
    {
        id: 'community-college',
        name: 'Community College',
        description:
            'Low-cost option with flexible programs and transfer opportunities.',
        price: 75,
        majors: ['General Studies', 'Nursing', 'Accounting', 'Business Basics'],
        logo: '/images/logos/community.png',
    },
];



export default function ApplyForCollegeModal({
                                                 wallet,
                                                 setWallet,
                                                 onClose,
                                                 onRequestCashBreak,
                                             }: Props) {
    const [choice, setChoice] = useState<'elite' | 'regular'>('elite');
    const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
    const [selectedMajor, setSelectedMajor] = useState<string | null>(null);
    const [detailSchool, setDetailSchool] = useState<School | null>(null);

    const schools = choice === 'elite' ? ELITE_SCHOOLS : REGULAR_SCHOOLS;
    const COST = selectedSchool?.price ?? 0;

    const cash = wallet.find(w => w.id === 'cash');
    const canConfirm =
        !!selectedSchool &&
        !!selectedMajor &&
        (cash?.usdValue ?? 0) >= COST;

    const handleConfirm = () => {
        if (!canConfirm || !selectedSchool || !selectedMajor) return;

        // 💾 SAVE COLLEGE CHOICE
        const collegeApplication = {
            type: choice,
            schoolId: selectedSchool.id,
            schoolName: selectedSchool.name,
            major: selectedMajor,
            price: COST,
            date: new Date().toISOString(),
        };

        localStorage.setItem(
            'collegeApplication',
            JSON.stringify(collegeApplication)
        );

        // 💸 DEDUCT CASH
        setWallet(prev =>
            prev.map(item =>
                item.id === 'cash'
                    ? {
                        ...item,
                        usdValue: item.usdValue - COST,
                        units: item.units - COST,
                    }
                    : item
            )
        );

        onClose();
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative overflow-hidden bg-white w-[760px] rounded-2xl p-8 text-gray-900 shadow-xl animate-event-in">
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
                    Apply for Colleges
                </h2>

                <p className="text-lg mb-6">
                    After working and saving for about a year, it’s time to apply for college.
                    Which schools will you apply to?
                </p>

                {/* CHOICE */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => {
                            setChoice('elite');
                            setSelectedSchool(null);
                            setSelectedMajor(null);
                        }}
                        className={`flex-1 rounded-full py-3 text-lg font-semibold border transition ${
                            choice === 'elite'
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white text-gray-600 border-gray-300'
                        }`}
                    >
                        elite schools
                    </button>

                    <button
                        onClick={() => {
                            setChoice('regular');
                            setSelectedSchool(null);
                            setSelectedMajor(null);
                        }}
                        className={`flex-1 rounded-full py-3 text-lg font-semibold border transition ${
                            choice === 'regular'
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white text-gray-600 border-gray-300'
                        }`}
                    >
                        regular schools
                    </button>
                </div>

                {/* SCHOOL GRID */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {schools.map(school => (
                        <div
                            key={school.id}
                            onClick={() => setDetailSchool(school)}
                            className={`cursor-pointer rounded-xl border p-4 text-center transition ${
                                selectedSchool?.id === school.id
                                    ? 'border-blue-500 ring-2 ring-blue-400'
                                    : 'border-gray-300 hover:border-blue-400'
                            }`}
                        >
                            <div className="h-16 mb-3 flex items-center justify-center">
                                <img
                                    src={school.logo}
                                    alt={`${school.name} logo`}
                                    className="h-14 object-contain"
                                />
                            </div>

                            <p className="font-semibold">{school.name}</p>

                            {selectedSchool?.id === school.id && selectedMajor && (
                                <p className="text-sm text-gray-500 mt-1">
                                    {selectedMajor}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* CONTENT */}
                <div className="grid grid-cols-2 gap-6 mb-6">

                    {/* LEFT */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">
                                Application Fee
                            </label>
                            <div className="rounded-lg border px-4 py-3 text-lg font-semibold">
                                ${COST || '--'}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">
                                Selected
                            </label>
                            <p className="text-gray-700">
                                {selectedSchool
                                    ? `${selectedSchool.name} – ${selectedMajor}`
                                    : 'No school selected'}
                            </p>
                        </div>

                        {!canConfirm && (
                            <p className="text-sm text-red-500">
                                Select a school and major, and ensure enough cash.
                            </p>
                        )}
                    </div>

                    {/* RIGHT – WALLET (MATCHES FAMILY MODAL) */}
                    <div className="border border-gray-300 rounded-xl p-4">
                        <p className="font-semibold mb-2">Wallet</p>

                        <div className="space-y-1 text-gray-800 max-h-[180px] overflow-y-auto">
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
                    className={`w-full rounded-full py-4 text-lg font-semibold transition ${
                        canConfirm
                            ? 'bg-blue-600 text-white hover:bg-blue-500'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    confirm
                </button>
            </div>

            {/* DETAIL MODAL */}
            {detailSchool && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
                    <div className="overflow-hidden bg-white w-[600px] rounded-2xl p-6 text-gray-900 shadow-xl animate-event-in border border-gray-300">

                        {/* HEADER */}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 flex items-center justify-center">
                                <img
                                    src={detailSchool.logo}
                                    alt={`${detailSchool.name} logo`}
                                    className="h-14 object-contain"
                                />
                            </div>

                            <div>
                                <h3 className="text-xl font-bold">
                                    {detailSchool.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Application overview
                                </p>
                            </div>
                        </div>

                        {/* DESCRIPTION */}
                        <p className="mb-6 text-gray-700 leading-relaxed">
                            {detailSchool.description}
                        </p>

                        {/* MAJORS */}
                        <p className="font-semibold mb-3 text-gray-800">
                            Choose a major
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            {detailSchool.majors.map(major => (
                                <button
                                    key={major}
                                    onClick={() => {
                                        setSelectedSchool(detailSchool);
                                        setSelectedMajor(major);
                                        setDetailSchool(null);
                                    }}
                                    className="
                            rounded-lg border border-gray-300 py-2 px-3
                            text-center font-medium text-gray-800
                            hover:border-blue-500 hover:bg-blue-50
                            transition
                        "
                                >
                                    {major}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
