"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function CharacterCard({
                           id,
                           name,
                           selected,
                           playable,
                           image,
                           stats,
                           onSelect,
                           onConfirm,
                       }: {
    id: string;
    name: string;
    selected: string | null;
    playable: boolean;
    image: string;
    stats?: { label: string; value: string }[];
    onSelect: (id: string) => void;
    onConfirm: (id: string) => void;
}) {
    const isSelected = selected === id;

    return (
        <div className="flex flex-col items-center">
            {/* CARD */}
            <div
                onClick={() => playable && onSelect(id)}
                className={`
          w-[400px] rounded-2xl p-5 border transition-all duration-300
          flex flex-col gap-5
          ${playable ? "cursor-pointer" : "cursor-not-allowed"}
          ${isSelected
                    ? "border-blue-900 shadow-[0_0_0_3px_rgba(95,168,245,0.35)]"
                    : "border-[#B6D8F6]"
                }
        `}
                style={{ backgroundColor: "#D9EEFF" }}
            >
                {/* NAME (TITLE ONLY) */}
                <h2 className="text-2xl font-semibold text-[#0A355B] text-center">
                    {name}
                </h2>

                {/* IMAGE FRAME */}
                <div className="relative w-full">
                    <div
                        className={`
              w-full aspect-[3/4] rounded-lg overflow-hidden
              border border-[#B6D8F6] bg-white
              ${playable ? "" : "blur-[1.5px] opacity-70"}
            `}
                    >
                        <img
                            src={image}
                            alt={name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* LOCK OVERLAY */}
                    {!playable && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <img
                                src="/lock.png"
                                className="w-14 h-14 opacity-90 drop-shadow-[0_0_10px_rgba(120,180,255,0.4)]"
                            />
                        </div>
                    )}

                </div>

                {/* STATS */}
                {playable && stats && (
                    <div className="rounded-xl bg-white/80 border border-[#CFE3F8] p-4 space-y-2 text-[#0A355B]">
                        {stats.map(s => (
                            <p key={s.label} className="text-lg">
                                <strong>{s.label}:</strong> {s.value}
                            </p>
                        ))}
                    </div>
                )}
            </div>
            {/* COMING SOON LABEL */}
            {!playable && (
                <p className="mt-4 text-sm tracking-wide text-grey uppercase">
                    Coming soon...
                </p>
            )}
            {/* CONFIRM BUTTON */}
            {playable && (
                <button
                    onClick={() => onConfirm(id)}
                    className={`
            mt-6 px-20 py-5 rounded-full text-xl font-semibold border transition-all
            ${isSelected
                        ? "border-[#5FA8F5] text-[#1E6FBF] bg-white hover:bg-[#F3F9FF]"
                        : "opacity-0 pointer-events-none"
                    }
          `}
                >
                    confirm
                </button>
            )}
        </div>
    );
}

export default function CharacterPage() {
    const [selected, setSelected] = useState<string>("A");
    const router = useRouter();

    return (
        <main className="min-h-screen bg-[#F7FAFC] text-[#0A355B]">
            {/* HERO */}
            <div className="px-10 pt-12 pb-14 bg-gradient-to-b from-[#EAF4FF] to-[#F7FAFC] border-b border-[#CFE3F8]">
                <h1 className="text-3xl font-bold text-center">
                    Pick your character
                </h1>
            </div>

            {/* BODY */}
            <div className="px-10 py-16">
                <div className="flex justify-center gap-10">

                    {/* PLAYABLE CHARACTER */}
                    <CharacterCard
                        id="A"
                        name="Kira Light"
                        selected={selected}
                        playable
                        image="/CharacterA.png"
                        stats={[
                            { label: "Age", value: "18" },
                            { label: "Occupation", value: "Student" },
                            { label: "Starting capital", value: "$7,000" },
                        ]}
                        onSelect={setSelected}
                        onConfirm={(id) => router.push(`/scenario?character=${id}`)}
                    />

                    {/* LOCKED */}
                    <CharacterCard
                        id="B"
                        name="Future Character"
                        selected={null}
                        playable={false}
                        image="/man.jpeg"
                        onSelect={() => {}}
                        onConfirm={() => {}}
                    />


                    {/* LOCKED */}
                    <CharacterCard
                        id="C"
                        name="Future Character"
                        selected={null}
                        playable={false}
                        image="/man.jpeg"
                        onSelect={() => {}}
                        onConfirm={() => {}}
                    />

                </div>
            </div>
        </main>
    );
}
