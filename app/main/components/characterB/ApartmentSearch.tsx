'use client';

import { useMemo, useState } from 'react';
import type { WalletItem } from '../../utils/walletData';

type Props = {
    wallet: WalletItem[];
    setWallet: React.Dispatch<React.SetStateAction<WalletItem[]>>;
    onClose: () => void;
    onRequestCashBreak: () => void;
};

type ApartmentOption = {
    id: 'option-1' | 'option-2' | 'option-3';
    title: string;
    image: string;
    plan: string;
    rent: number;
    moveInCost: number;
    location: string;
    floor: string;
    description: string;
    features: string[];
};

const apartmentOptions: ApartmentOption[] = [
    {
        id: 'option-1',
        title: 'Starter Flat',
        image: '/images/Global-financial-crisis/events/appartment_op1.png',
        plan: '/images/Global-financial-crisis/events/plan1.png',
        rent: 700,
        moveInCost: 1400,
        location: 'About 30 minutes from the city center',
        floor: '3rd floor',
        description:
            'The safest budget choice. It is simple, compact, and far enough from the city center to keep the rent manageable while Cain rebuilds his stability.',
        features: [
            'Living room connected with kitchen',
            'Bedroom',
            'Bathroom with toilet',
            'Small balcony where Cain can step outside',
        ],
    },
    {
        id: 'option-2',
        title: 'Skyline Residence',
        image: '/images/Global-financial-crisis/events/appartment_op2.png',
        plan: '/images/Global-financial-crisis/events/plan2.png',
        rent: 1300,
        moveInCost: 2600,
        location: 'Directly in the city center',
        floor: '20th floor',
        description:
            'The premium option. It has the best location, panoramic windows, and enough space to feel like a real reset after the housing chaos, but it puts much more pressure on Cain every month.',
        features: [
            'Huge living room and dining area',
            'Separate kitchen',
            'Bedroom plus wardrobe room',
            'Bathroom and separate toilet',
        ],
    },
    {
        id: 'option-3',
        title: 'Balanced Apartment',
        image: '/images/Global-financial-crisis/events/appartment_op3.png',
        plan: '/images/Global-financial-crisis/events/plan3.png',
        rent: 950,
        moveInCost: 1900,
        location: 'About 15 minutes from the city center',
        floor: '6th floor',
        description:
            'A steady middle-ground choice with better comfort than the cheapest flat while still keeping the monthly rent close to Cain\'s income.',
        features: [
            'Living room connected with kitchen',
            'Comfortable bedroom',
            'Bathroom and toilet',
            'Balcony with bright windows',
        ],
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

export default function ApartmentSearchModal({
    wallet,
    setWallet,
    onClose,
    onRequestCashBreak,
}: Props) {
    const displayOptions = useMemo(
        () => [...apartmentOptions].sort((left, right) => left.rent - right.rent),
        []
    );
    const [selectedId, setSelectedId] = useState<ApartmentOption['id'] | null>(null);
    const [infoOption, setInfoOption] = useState<ApartmentOption | null>(null);
    const selectedOption = apartmentOptions.find(option => option.id === selectedId) ?? null;
    const selectedApartmentNumber = selectedOption
        ? displayOptions.findIndex(option => option.id === selectedOption.id) + 1
        : null;
    const cash = wallet.find(item => item.id === 'cash');
    const hasEnoughCash = selectedOption ? (cash?.usdValue ?? 0) >= selectedOption.moveInCost : false;
    const canConfirm = selectedOption !== null && hasEnoughCash;

    const handleConfirm = () => {
        if (!selectedOption || !cash || !hasEnoughCash) return;

        setWallet(prev =>
            prev.map(item =>
                item.id === 'cash'
                    ? {
                          ...item,
                          units: item.units - selectedOption.moveInCost,
                          usdValue: item.usdValue - selectedOption.moveInCost,
                      }
                    : item
            )
        );

        localStorage.setItem(
            'apartmentSearch',
            JSON.stringify({
                optionId: selectedOption.id,
                title: selectedOption.title,
                monthlyRent: selectedOption.rent,
                moveInCost: selectedOption.moveInCost,
                date: new Date().toISOString(),
            })
        );
        localStorage.setItem('cain_rent_lastDate', '2009-03-09');

        onClose();
    };

    const openInfo = (event: React.MouseEvent, option: ApartmentOption) => {
        event.stopPropagation();
        setInfoOption(option);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative w-[min(1040px,calc(100vw-32px))] max-h-[calc(100svh-32px)] overflow-y-auto rounded-2xl bg-white p-6 text-gray-900 shadow-xl animate-event-in">
                <button
                    type="button"
                    onClick={onRequestCashBreak}
                    className="scenario-break-button"
                    aria-label="Exit scenario for 30 seconds to raise cash"
                    title="Exit for 30 seconds to sell assets"
                >
                    x
                </button>

                <h2 className="mb-2 text-center text-2xl font-bold text-red-600">
                    Apartment Search
                </h2>
                <p className="mx-auto mb-5 max-w-3xl text-center text-base leading-relaxed text-gray-700">
                    Cain finally finds three possible apartments. Click a card to flip it and review
                    the floor plan. Use the info button for the full readable details.
                </p>

                <div className="mb-5 grid gap-4 md:grid-cols-3">
                    {displayOptions.map((option, index) => {
                        const isSelected = selectedId === option.id;

                        return (
                            <div
                                key={option.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => setSelectedId(option.id)}
                                onKeyDown={event => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        setSelectedId(option.id);
                                    }
                                }}
                                className={`group min-h-[330px] cursor-pointer text-left transition ${
                                    isSelected ? 'scale-[1.01]' : 'hover:-translate-y-1'
                                }`}
                                style={{ perspective: '1200px' }}
                            >
                                <div
                                    className={`relative h-full min-h-[330px] rounded-2xl border bg-white shadow-[0_14px_34px_rgba(15,23,42,0.08)] transition duration-700 ${
                                        isSelected
                                            ? 'border-amber-600 shadow-[0_18px_38px_rgba(146,64,14,0.18)]'
                                            : 'border-gray-200'
                                    }`}
                                    style={{
                                        transformStyle: 'preserve-3d',
                                        transform: isSelected ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                    }}
                                >
                                    <div
                                        className="absolute inset-0 overflow-hidden rounded-2xl"
                                        style={{ backfaceVisibility: 'hidden' }}
                                    >
                                        <button
                                            type="button"
                                            onClick={event => openInfo(event, option)}
                                            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/95 text-sm font-black text-gray-800 shadow-[0_8px_18px_rgba(15,23,42,0.18)] transition hover:scale-105 hover:bg-amber-50"
                                            aria-label={`Read more about ${option.title}`}
                                        >
                                            i
                                        </button>
                                        <img
                                            src={option.image}
                                            alt={option.title}
                                            className="aspect-square w-full object-cover"
                                        />
                                        <div className="p-4">
                                            <h3 className="text-lg font-bold leading-tight text-gray-950">
                                                {option.title}
                                            </h3>
                                        </div>
                                    </div>

                                    <div
                                        className="absolute inset-0 overflow-hidden rounded-2xl bg-[#fffaf0]"
                                        style={{
                                            backfaceVisibility: 'hidden',
                                            transform: 'rotateY(180deg)',
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={event => openInfo(event, option)}
                                            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/95 text-sm font-black text-gray-800 shadow-[0_8px_18px_rgba(15,23,42,0.18)] transition hover:scale-105 hover:bg-amber-50"
                                            aria-label={`Read more about ${option.title}`}
                                        >
                                            i
                                        </button>
                                        <img
                                            src={option.plan}
                                            alt={`${option.title} floor plan`}
                                            className="aspect-square w-full border-b border-amber-200 bg-white object-contain p-3"
                                        />
                                        <div className="p-4">
                                            <h3 className="text-lg font-bold leading-tight text-gray-950">
                                                {option.title}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mb-5 grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-gray-500">
                            Selection
                        </p>
                        <p className="mt-2 text-base font-semibold text-gray-950">
                            {selectedOption && selectedApartmentNumber
                                ? `Apartment ${selectedApartmentNumber} - ${selectedOption.title}: ${formatWalletCurrency(selectedOption.moveInCost)} due today, ${formatWalletCurrency(selectedOption.rent)} monthly rent`
                                : 'Choose one apartment to review the move-in cost.'}
                        </p>
                        {selectedOption && !hasEnoughCash ? (
                            <p className="mt-2 text-sm font-semibold text-red-600">
                                Cain does not have enough cash for this move-in payment right now.
                            </p>
                        ) : null}
                    </div>
                    <div className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm">
                        <span className="font-semibold text-gray-500">Cash: </span>
                        <span className="font-bold text-gray-950">
                            {formatWalletCurrency(cash?.usdValue ?? 0)}
                        </span>
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
                    confirm apartment
                </button>
            </div>

            {infoOption ? (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
                    <div className="w-[min(620px,calc(100vw-32px))] max-h-[calc(100svh-48px)] overflow-y-auto rounded-2xl bg-white p-6 text-gray-900 shadow-2xl animate-event-in">
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
                                    Apartment details
                                </p>
                                <h3 className="mt-2 text-2xl font-bold text-gray-950">
                                    {infoOption.title}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setInfoOption(null)}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-lg font-bold text-gray-600 transition hover:bg-gray-50"
                                aria-label="Close apartment details"
                            >
                                x
                            </button>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <img
                                src={infoOption.image}
                                alt={infoOption.title}
                                className="aspect-square w-full rounded-xl object-cover"
                            />
                            <img
                                src={infoOption.plan}
                                alt={`${infoOption.title} floor plan`}
                                className="aspect-square w-full rounded-xl border border-amber-200 bg-white object-contain p-3"
                            />
                        </div>

                        <div className="mt-5 space-y-4 text-base leading-relaxed text-gray-700">
                            <p>{infoOption.description}</p>
                            <div className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2">
                                <p>
                                    <span className="font-bold text-gray-950">Location:</span>{' '}
                                    {infoOption.location}
                                </p>
                                <p>
                                    <span className="font-bold text-gray-950">Floor:</span>{' '}
                                    {infoOption.floor}
                                </p>
                                <p>
                                    <span className="font-bold text-gray-950">Rent:</span>{' '}
                                    {formatWalletCurrency(infoOption.rent)} / month
                                </p>
                                <p>
                                    <span className="font-bold text-gray-950">Due today:</span>{' '}
                                    {formatWalletCurrency(infoOption.moveInCost)}
                                </p>
                            </div>
                            <div>
                                <p className="mb-2 font-bold text-gray-950">Includes:</p>
                                <ul className="space-y-2">
                                    {infoOption.features.map(feature => (
                                        <li key={feature}>- {feature}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
