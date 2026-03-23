"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ScenarioCard({
                          id,
                          title,
                          selected,
                          playable,
                          image,
                          quickFacts,
                          story,
                          onSelect,
                          onConfirm,
                      }: {
    id: string;
    title: string;
    selected: string | null;
    playable: boolean;
    image: string;
    quickFacts?: string[];
    story?: string[];
    onSelect: (id: string) => void;
    onConfirm: (id: string) => void;
}) {
    const isSelected = selected === id;
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="flex flex-col items-center">
            {/* CARD */}
            <div
                onClick={() => playable && onSelect(id)}
                className={`
          w-[400px] rounded-2xl p-5 border transition-all duration-300
          flex flex-col gap-5
          ${playable ? "cursor-pointer" : "cursor-not-allowed"}
          ${
                    isSelected
                        ? "border-blue-900 shadow-[0_0_0_3px_rgba(95,168,245,0.35)]"
                        : "border-[#B6D8F6]"
                }
        `}
                style={{ backgroundColor: "#D9EEFF" }}
            >
                {/* TITLE */}
                <h2 className="text-2xl font-semibold text-[#0A355B] text-center">
                    {title}
                </h2>

                {/* IMAGE FRAME */}
                <div className="relative w-full rounded-xl border border-[#B6D8F6] bg-white p-3 overflow-hidden">
                    <img
                        src={image}
                        alt={title}
                        className={`w-full h-auto object-contain rounded-lg ${
                            playable ? "" : "blur-[1.5px] opacity-70"
                        }`}
                    />

                    {/* CENTERED LOCK */}
                    {!playable && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <img
                                src="/images/lock.png"
                                className="w-14 h-14 opacity-90 drop-shadow-[0_0_12px_rgba(120,180,255,0.4)]"
                            />
                        </div>
                    )}
                </div>

                {/* QUICK FACTS */}
                {playable && quickFacts && (
                    <div className="rounded-xl bg-white/80 border border-[#CFE3F8] p-4 space-y-2 text-[#0A355B]">
                        {quickFacts.map((f, i) => (
                            <p key={i} className="text-lg">• {f}</p>
                        ))}
                    </div>
                )}

                {/* READ MORE */}
                {playable && story && (
                    <div className="text-[#0A355B]">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setExpanded(!expanded);
                            }}
                            className="text-blue-700 text-sm font-semibold hover:underline mt-2"
                        >
                            {expanded ? "Hide details" : "Read more"}
                        </button>

                        {expanded && (
                            <div className="mt-4 rounded-xl bg-white/90 border border-[#CFE3F8] p-5 space-y-3 leading-relaxed text-[15px]">
                                {story.map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* COMING SOON */}
            {!playable && (
                <p className="mt-4 text-sm tracking-wide uppercase text-gray">
                    Coming soon…
                </p>
            )}

            {/* CONFIRM */}
            {playable && (
                <button
                    onClick={() => onConfirm(id)}
                    className={`
  mt-6 px-20 py-5 rounded-full text-xl font-semibold border
  transition-all duration-300 ease-out
  transform
  ${isSelected
                        ? "border-[#5FA8F5] text-[#1E6FBF] bg-white hover:bg-[#F3F9FF] hover:scale-105 hover:shadow-lg active:scale-95 active:shadow-md"
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

export default function ScenarioPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const character = searchParams.get("character");

    useEffect(() => {
        if (!character) router.replace("/character");
    }, [character, router]);

    const [selected, setSelected] = useState("dotcom");

    return (
        <main className="min-h-screen bg-[#F7FAFC] text-[#0A355B]">
            {/* HERO */}
            <div className="relative px-10 pt-12 pb-14 bg-gradient-to-b from-[#EAF4FF] to-[#F7FAFC] border-b border-[#CFE3F8]">
                <button
                    onClick={() => router.push("/character")}
                    className="absolute top-6 left-6 px-8 py-3 rounded-full bg-[#1E6FBF] text-white text-lg font-semibold hover:bg-[#165AA0]"
                >
                    back
                </button>

                <h1 className="text-3xl font-bold text-center">Pick a scenario</h1>
            </div>

            {/* BODY */}
            <div className="px-10 py-16">
                <div className="flex justify-center gap-10">

                    <ScenarioCard
                        id="dotcom"
                        title="Dot-com Bubble"
                        selected={selected}
                        playable
                        image="/images/dotcom.jpeg"
                        quickFacts={[
                            "Late 1990s tech boom",
                            "Stock prices exploded",
                            "Companies with no profits",
                            "Market crashed hard"
                        ]}
                        story={[
                            "In the late 1990s, the internet felt like a gold rush. Every new website promised to change the world — and investors rushed in.",
                            "Stock prices climbed far faster than real profits ever could. Even tiny startups became billion-dollar companies overnight.",
                            "When reality caught up, the bubble burst. Thousands of companies vanished, and fortunes were wiped out."
                        ]}
                        onSelect={setSelected}
                        onConfirm={(id) =>
                            router.push(`/preview?character=${character}&scenario=${id}`)
                        }
                    />

                    <ScenarioCard
                        id="housing"
                        title="Future Scenario"
                        selected={null}
                        playable={false}
                        image="/images/IMG.png"
                        onSelect={() => {}}
                        onConfirm={() => {}}
                    />

                    <ScenarioCard
                        id="pandemic"
                        title="Future Scenario"
                        selected={null}
                        playable={false}
                        image="/images/IMG.png"
                        onSelect={() => {}}
                        onConfirm={() => {}}
                    />

                </div>
            </div>
        </main>
    );
}
