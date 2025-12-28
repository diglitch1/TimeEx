"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PreviewPage() {
    const router = useRouter();

    const character =
        typeof window !== "undefined" ? localStorage.getItem("character") : null;
    const scenario =
        typeof window !== "undefined" ? localStorage.getItem("scenario") : null;

    useEffect(() => {
        if (!character || !scenario) router.replace("/");
    }, [character, scenario]);

    if (!character || !scenario) return null;

    return (
        <main className="min-h-screen px-8 py-16 bg-white">
            <h1 className="text-4xl font-bold text-center mb-10 text-[#0A355B]">
                Review your choices
            </h1>

            <div className="flex flex-col gap-16 max-w-[1000px] mx-auto">

                <section
                    className="rounded-2xl border border-[#9CC8F5] p-10 text-[#0A355B]"
                    style={{ backgroundColor: "#D9EEFF" }}
                >
                    <h2 className="text-3xl font-semibold mb-6">
                        Character A — Sarah Novak
                    </h2>

                    <div className="space-y-4 text-base leading-relaxed max-w-[900px]">
                        <p>
                            <strong>Age:</strong> 18
                        </p>
                        <p>
                            <strong>Background:</strong> Sarah Novak is a young student who has
                            just finished high school in the early 2000s. She comes from a
                            middle-income family where financial stability matters, but money
                            is never guaranteed. Her parents work full-time and strongly value
                            education as a path to a better future.
                        </p>
                        <p>
                            Sarah has a younger sibling, which means family resources are
                            shared. Because of this, she feels responsible not only for
                            herself, but also for how her financial decisions could impact her
                            family.
                        </p>
                        <p>
                            <strong>Education & goals:</strong> She plans to apply for college,
                            with an interest in studying economics or business. Tuition fees
                            and living costs are a concern, so saving money and making smart
                            financial choices is essential.
                        </p>
                        <p>
                            <strong>Financial mindset:</strong> Sarah is cautious and
                            inexperienced with investing. She prefers stability and
                            long-term security, but is curious to learn how markets work.
                        </p>
                        <p>
                            <strong>Start Budget:</strong> 7.000 $
                        </p>
                        <p>
                            <strong>Risk level:</strong> Low–medium
                        </p>
                    </div>
                </section>

                <section
                    className="rounded-2xl border border-[#9CC8F5] p-10 text-[#0A355B]"
                    style={{ backgroundColor: "#D9EEFF" }}
                >
                    <h2 className="text-3xl font-semibold mb-6">
                        Scenario — Dot-com Bubble (1995–2002)
                    </h2>

                    <div className="space-y-4 text-base leading-relaxed max-w-[900px]">
                        <p>
                            <strong>Overview:</strong> The dot-com bubble occurred during the
                            rapid expansion of the internet. Investors believed that
                            technology and online companies would dominate the future economy,
                            leading to massive investments in startups—often without proven
                            business models.
                        </p>
                        <p>
                            <strong>Main causes:</strong> Speculation replaced careful market
                            analysis. Many companies spent large amounts of money while
                            generating little or no revenue, yet their stock prices continued
                            to rise.
                        </p>
                        <p>
                            <strong>Key events:</strong> As more tech companies went public,
                            market valuations became unrealistic. When investors lost
                            confidence, stock prices collapsed, companies went bankrupt, and
                            billions in market value were lost.
                        </p>
                        <p>
                            <strong>Market behavior:</strong> The market experienced extreme
                            volatility, with rapid rises followed by sudden and deep crashes.
                            Timing and risk management were crucial.
                        </p>
                        <p>
                            <strong>Why this matters:</strong> This scenario teaches how hype,
                            optimism, and innovation can distort markets, and why long-term
                            thinking is essential—especially for inexperienced investors.
                        </p>
                    </div>
                </section>
            </div>

            <div className="flex justify-center gap-12 mt-10">
                <button
                    onClick={() => router.push("/scenario")}
                    className="px-20 py-4 rounded-full text-lg font-semibold border border-[#9CC8F5] text-[#1E6FBF] bg-white hover:bg-[#F3F9FF]"
                >
                    back
                </button>

                <button
                    onClick={() => router.push("/main")}
                    className="px-20 py-4 rounded-full text-lg font-semibold border border-[#9CC8F5] text-[#1E6FBF] bg-white hover:bg-[#F3F9FF]"
                >
                    start game
                </button>
            </div>
        </main>
    );
}
