"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";


function Card({
                  id,
                  title,
                  period,
                  description,
                  selected,
                  onSelect,
                  onConfirm,
              }: {
    id: string;
    title: string;
    period: string;
    description: string;
    selected: string | null;
    onSelect: (id: string) => void;
    onConfirm: () => void;
}) {
    const isSelected = selected === id;

    return (
        <div className="flex flex-col items-center">
            <div className={`rounded-2xl p-[2px] ${isSelected ? "bg-[#9CC8F5]" : ""}`}>
                <div
                    onClick={() => onSelect(id)}
                    className={`w-110 h-[500px] rounded-xl p-6 cursor-pointer border ${
                        isSelected ? "border-[#9CC8F5]" : "border-[#B6D8F6]"
                    }`}
                    style={{ backgroundColor: "#D9EEFF" }}
                >
                    <h2 className="text-2xl font-semibold mb-1 text-[#0A355B] text-center">
                        {title}
                    </h2>
                    <p className="text-lg font-medium mb-3 text-[#0A355B] text-center">
                        {period}
                    </p>
                    <p className="text-lg text-[#0A355B] leading-relaxed">{description}</p>
                </div>
            </div>

            <button
                onClick={onConfirm}
                className={`mt-6 px-20 py-5 rounded-full text-xl font-semibold border ${
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

export default function ScenarioPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const character = searchParams.get("character");
    useEffect(() => {
        if (!character) router.replace("/character");
    }, [character, router]);

    const [selected, setSelected] = useState<string | null>(() => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem("scenario");
    });

    const confirm = () => {
        if (!selected || !character) return;
        router.push(`/preview?character=${character}&scenario=${selected}`);
    };

    return (
        <main className="relative min-h-screen px-10 py-16 bg-white">
            <button
                onClick={() => router.push("/character")}
                className="absolute top-6 left-6 px-8 py-3 rounded-full bg-[#1E6FBF] text-white text-lg font-semibold hover:bg-[#165AA0]"
            >
                back
            </button>

            <h1 className="text-4xl font-bold text-center mb-12 text-[#0A355B]">
                Pick scenario
            </h1>

            <div className="flex justify-center gap-10">
                <Card
                    id="dotcom"
                    title="Dot-com Bubble"
                    period="1995 – 2002"
                    description="The dot-com bubble was driven by rapid growth of internet companies and
                    massive investor optimism. Many startups received huge investments despite having no
                    clear business model or profits. Stock prices rose quickly as speculation replaced realistic
                     evaluation. When investors realized that many companies would never become profitable,
                      confidence collapsed, markets crashed, and thousands of tech companies failed."
                    selected={selected}
                    onSelect={setSelected}
                    onConfirm={confirm}
                />

                <Card
                    id="housing"
                    title="Global Financial Crisis"
                    period="2007 – 2009"
                    description="The Global Financial Crisis was caused by risky mortgages and excessive lending
                     in the housing market. These loans were turned into complex financial products and
                     spread across the global financial system. When borrowers began to default, banks suffered
                      massive losses, credit markets froze, and the world entered a deep economic recession."
                    selected={selected}
                    onSelect={setSelected}
                    onConfirm={confirm}
                />

                <Card
                    id="pandemic"
                    title="Pandemic Market Shock"
                    period="2020"
                    description="The Pandemic Market Shock was triggered by a global health crisis that caused sudden
                    lockdowns, travel restrictions, and supply chain disruptions. Financial markets crashed rapidly
                     due to uncertainty and fear. Governments and central banks responded with large stimulus programs,
                     leading to an uneven and volatile market recovery."
                    selected={selected}
                    onSelect={setSelected}
                    onConfirm={confirm}
                />
            </div>
        </main>
    );
}
