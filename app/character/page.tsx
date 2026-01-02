"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function Card({
                  id,
                  title,
                  selected,
                  onSelect,
                  onConfirm,
                  children,
              }: {
    id: string;
    title: string;
    selected: string | null;
    onSelect: (id: string) => void;
    onConfirm: (id: string) => void;
    children: React.ReactNode;
}) {
    const isSelected = selected === id;

    return (
        <div className="flex flex-col items-center">
            <div className={`rounded-2xl p-[2px] ${isSelected ? "bg-[#9CC8F5]" : ""}`}>
                <div
                    onClick={() => onSelect(id)}
                    className={`w-100 h-[400px] rounded-xl p-6 cursor-pointer border ${
                        isSelected ? "border-[#9CC8F5]" : "border-[#B6D8F6]"
                    }`}
                    style={{ backgroundColor: "#D9EEFF" }}
                >
                    <h2 className="text-2xl font-semibold mb-3 text-[#0A355B] text-center">
                        {title}
                    </h2>
                    <div className="text-lg text-[#0A355B] space-y-1">{children}</div>
                </div>
            </div>

            <button
                onClick={() => onConfirm(id)}
                className={`mt-6 px-20 py-5 rounded-full text-xl font-semibold border transition-all ${
                    isSelected
                        ? "border-[#9CC8F5] text-[#1E6FBF] bg-white hover:bg-[#F3F9FF]"
                        : "opacity-0 pointer-events-none"
                }`}
            >
                confirm
            </button>
        </div>
    );
}

export default function CharacterPage() {
    const [selected, setSelected] = useState<string | null>(() => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem("character");
    });

    const router = useRouter();

    const confirmCharacter = (id: string) => {
        router.push(`/scenario?character=${id}`);
    };

    return (
        <main className="min-h-screen px-10 py-16 bg-white">
            <h1 className="text-3xl font-bold text-center mb-12 text-[#0A355B]">
                Pick your character
            </h1>

            <div className="flex justify-center gap-10">
                <Card
                    id="A"
                    title="Character A"
                    selected={selected}
                    onSelect={setSelected}
                    onConfirm={confirmCharacter}
                >
                    <p>
                        <strong>Name:</strong> Sarah Novak
                    </p>
                    <p>
                        <strong>Age:</strong> 18
                    </p>
                    <p>
                        <strong>Occupation:</strong> Student
                    </p>
                    <p>
                        <strong>Background:</strong> Entering adulthood in early 2000s.
                    </p>
                    <p>
                        <strong>Motivation:</strong> Save for college.
                    </p>
                    <p>
                        <strong>Risk Level:</strong> Low–medium
                    </p>
                </Card>

                <Card
                    id="B"
                    title="Character B"
                    selected={selected}
                    onSelect={setSelected}
                    onConfirm={confirmCharacter}
                >
                    <p>
                        <strong>Name:</strong> Daniel Ruiz
                    </p>
                    <p>
                        <strong>Age:</strong> 28
                    </p>
                    <p>
                        <strong>Occupation:</strong> Junior Web Developer
                    </p>
                    <p>
                        <strong>Background:</strong> First stable tech job.
                    </p>
                    <p>
                        <strong>Motivation:</strong> Financial independence.
                    </p>
                    <p>
                        <strong>Risk Level:</strong> Medium
                    </p>
                </Card>

                <Card
                    id="C"
                    title="Character C"
                    selected={selected}
                    onSelect={setSelected}
                    onConfirm={confirmCharacter}
                >
                    <p>
                        <strong>Name:</strong> Maya Thompson
                    </p>
                    <p>
                        <strong>Age:</strong> 34
                    </p>
                    <p>
                        <strong>Occupation:</strong> Freelance Designer / Single Mom
                    </p>
                    <p>
                        <strong>Background:</strong> Balancing work and family.
                    </p>
                    <p>
                        <strong>Motivation:</strong> Long-term stability.
                    </p>
                    <p>
                        <strong>Risk Level:</strong> Medium–low
                    </p>
                </Card>
            </div>
        </main>
    );
}
