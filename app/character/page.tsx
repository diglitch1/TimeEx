"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

type SelectionOption = {
    id: string;
    playable: boolean;
    characterId: string;
    scenarioId: string;
    characterName: string;
    characterImage: string;
    characterStats?: { label: string; value: string }[];
    scenarioTitle: string;
    scenarioImage: string;
    scenarioPeriod?: string;
    scenarioFacts?: string[];
};

const SELECTION_OPTIONS: SelectionOption[] = [
    {
        id: "A-dotcom",
        playable: true,
        characterId: "A",
        scenarioId: "dotcom",
        characterName: "Kira Light",
        characterImage: "/images/CharacterA.png",
        characterStats: [
            { label: "Age", value: "18" },
            { label: "Occupation", value: "Student" },
            { label: "Starting capital", value: "$5,000" },
        ],
        scenarioTitle: "Dot-com Bubble",
        scenarioImage: "/images/dotcom.jpeg",
        scenarioPeriod: "Late 1990s - early 2000s",
        scenarioFacts: [
            "Late 1990s tech boom",
            "Stock prices exploded",
            "Companies with no profits",
            "Market crashed hard",
        ],
    },
    {
        id: "B-housing",
        playable: false,
        characterId: "B",
        scenarioId: "housing",
        characterName: "Future Character",
        characterImage: "/images/man.jpeg",
        scenarioTitle: "Future Scenario",
        scenarioImage: "/images/IMG.png",
    },
    {
        id: "C-pandemic",
        playable: false,
        characterId: "C",
        scenarioId: "pandemic",
        characterName: "Future Character",
        characterImage: "/images/man.jpeg",
        scenarioTitle: "Future Scenario",
        scenarioImage: "/images/IMG.png",
    },
];

function SelectionCard({
    option,
    selected,
    onSelect,
    onConfirm,
}: {
    option: SelectionOption;
    selected: string | null;
    onSelect: (id: string) => void;
    onConfirm: (option: SelectionOption) => void;
}) {
    const isSelected = selected === option.id;
    const cardTone = option.playable ? "bg-white/85" : "bg-[#F3F8FD]/85";
    const sectionTone = option.playable ? "bg-[#F7FBFF]" : "bg-[#EEF4FA]";
    const imageTone = option.playable
        ? "border-[#CFE3F8] bg-white"
        : "border-[#D7E4F0] bg-[#F7FAFD]";

    return (
        <div className="w-full max-w-6xl">
            <div
                onClick={() => option.playable && onSelect(option.id)}
                className={`
                    w-full rounded-[28px] border p-5 transition-all duration-300 md:p-7
                    flex flex-col gap-5
                    ${option.playable ? "cursor-pointer" : "cursor-not-allowed"}
                    ${
                        isSelected
                            ? "border-[#1B5D94] shadow-[0_0_0_3px_rgba(95,168,245,0.28)]"
                            : "border-[#BFD9F1]"
                    }
                `}
                style={{ backgroundColor: option.playable ? "#DCEEFF" : "#EAF2F9" }}
            >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#4D83B6]">
                        </p>
                        <h2 className="mt-2 text-2xl font-bold text-[#0A355B] md:text-3xl">
                            {option.characterName}  in the  {option.scenarioTitle}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="rounded-full border border-[#B9D5EF] bg-white/80 px-4 py-2 text-sm font-semibold text-[#2C6CA3]">
                            {option.playable ? "Available" : "Locked"}
                        </span>
                        {option.playable && isSelected && (
                            <span className="rounded-full bg-[#1E6FBF] px-4 py-2 text-sm font-semibold text-white">
                                Selected
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2 lg:items-stretch">
                    <section className={`rounded-[24px] border border-[#CFE3F8] p-4 md:p-5 ${cardTone}`}>
                        <div className="mb-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#4D83B6]">
                                Character
                            </p>
                            <h3 className="mt-2 text-2xl font-semibold text-[#0A355B]">
                                {option.characterName}
                            </h3>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                            <div className="relative w-full">
                                <div
                                    className={`
                                        relative aspect-[4/5] overflow-hidden rounded-2xl border ${imageTone}
                                        ${option.playable ? "" : "blur-[1.5px] opacity-70"}
                                    `}
                                >
                                    <Image
                                        src={option.characterImage}
                                        alt={option.characterName}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 220px"
                                        className="object-cover"
                                    />
                                </div>

                                {!option.playable && (
                                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                        <Image
                                            src="/images/lock.png"
                                            alt=""
                                            width={56}
                                            height={56}
                                            className="h-14 w-14 opacity-90 drop-shadow-[0_0_10px_rgba(120,180,255,0.4)]"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className={`rounded-2xl border border-[#D9E9F8] p-4 md:p-5 ${sectionTone}`}>
                                {option.playable && option.characterStats ? (
                                    <div className="space-y-3">
                                        {option.characterStats.map((stat) => (
                                            <div
                                                key={stat.label}
                                                className="flex items-center justify-between gap-4 border-b border-[#D6E6F5] pb-3 last:border-b-0 last:pb-0"
                                            >
                                                <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5C89B1]">
                                                    {stat.label}
                                                </span>
                                                <span className="text-right text-lg font-semibold text-[#0A355B]">
                                                    {stat.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-[#C9DBEC] px-6 text-center text-base text-[#5E7F9F]">
                                        This character path will unlock in a future update.
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className={`rounded-[24px] border border-[#CFE3F8] p-4 md:p-5 ${cardTone}`}>
                        <div className="mb-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#4D83B6]">
                                Scenario
                            </p>
                            <h3 className="mt-2 text-2xl font-semibold text-[#0A355B]">
                                {option.scenarioTitle}
                            </h3>
                            <p className="mt-2 text-sm font-medium text-[#3F6D98]">
                                {option.scenarioPeriod}
                            </p>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
                            <div className={`rounded-2xl border border-[#D9E9F8] p-4 md:p-5 ${sectionTone}`}>
                                {option.playable && option.scenarioFacts ? (
                                    <div className="space-y-3">
                                        {option.scenarioFacts.map((fact) => (
                                            <div
                                                key={fact}
                                                className="rounded-2xl border border-[#D6E6F5] bg-white/75 px-4 py-3 text-base font-medium text-[#0A355B]"
                                            >
                                                {fact}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-[#C9DBEC] px-6 text-center text-base text-[#5E7F9F]">
                                        This scenario path is reserved for a future release.
                                    </div>
                                )}
                            </div>

                            <div className="relative mx-auto w-full max-w-[220px]">
                                <div
                                    className={`
                                        relative aspect-[4/3] overflow-hidden rounded-2xl border ${imageTone}
                                        ${option.playable ? "" : "blur-[1.5px] opacity-70"}
                                    `}
                                >
                                    <Image
                                        src={option.scenarioImage}
                                        alt={option.scenarioTitle}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 220px"
                                        className="object-cover"
                                    />
                                </div>

                                {!option.playable && (
                                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                        <Image
                                            src="/images/lock.png"
                                            alt=""
                                            width={56}
                                            height={56}
                                            className="h-14 w-14 opacity-90 drop-shadow-[0_0_12px_rgba(120,180,255,0.4)]"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                <div className="flex flex-col gap-4 border-t border-[#BFD9F1] pt-5 lg:flex-row lg:items-center lg:justify-between">
                    <p className="text-sm text-[#476E94]">
                        {option.playable
                            ? "Choose this path to start directly in preview."
                            : "This combined path is visible now but not playable yet."}
                    </p>

                    <div className="flex items-center gap-4">
                        {!option.playable && (
                            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6A88A8]">
                                Coming soon
                            </p>
                        )}

                        {option.playable && (
                            <button
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onConfirm(option);
                                }}
                                className={`
                                    rounded-full border px-8 py-3 text-lg font-semibold transition-all duration-300 ease-out
                                    ${
                                        isSelected
                                            ? "border-[#5FA8F5] bg-white text-[#1E6FBF] hover:scale-[1.02] hover:bg-[#F3F9FF] hover:shadow-lg active:scale-[0.99]"
                                            : "pointer-events-none opacity-0"
                                    }
                                `}
                            >
                                Continue
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CharacterPage() {
    const [selected, setSelected] = useState<string | null>(SELECTION_OPTIONS[0]?.id ?? null);
    const router = useRouter();

    return (
        <main className="min-h-screen bg-[#F7FAFC] text-[#0A355B]">
            <div className="border-b border-[#CFE3F8] bg-gradient-to-b from-[#EAF4FF] via-[#F2F8FF] to-[#F7FAFC] px-6 pt-12 pb-14 md:px-10">
                <h1 className="text-center text-3xl font-bold md:text-4xl">
                    Character & Scenario
                </h1>
                <p className="mx-auto mt-4 max-w-3xl text-center text-[17px] leading-relaxed text-[#3F6D98]">
                    Choose the character and the matched scenario together.
                </p>
            </div>

            <div className="px-4 py-10 md:px-8 md:py-14">
                <div className="mx-auto flex max-w-6xl flex-col gap-8">
                    {SELECTION_OPTIONS.map((option) => (
                        <SelectionCard
                            key={option.id}
                            option={option}
                            selected={selected}
                            onSelect={setSelected}
                            onConfirm={(selection) =>
                                router.push(
                                    `/preview?character=${selection.characterId}&scenario=${selection.scenarioId}`
                                )
                            }
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}
