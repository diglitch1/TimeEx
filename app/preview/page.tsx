"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { resetGame } from '../main/utils/save';

import Image from "next/image";
import type React from "react";

type CharacterId = "A" | "B" | "C";
type ScenarioId = "dotcom" | "housing" | "pandemic";

type CharacterInfo = {
    id: CharacterId;
    name: string;
    age: string;
    occupation: string;
    background: string;
    risk: string;
    motivation: string;
    experience: string;
    budget: string;
    image: string;
};

type ScenarioInfo = {
    id: ScenarioId;
    title: string;
    period: string;
    description: string; // used in sticky bar (same text as selection card)
    heroSubtitle: string; // the 1–2 sentences under the title on preview page
    image: string;
};

const CHARACTERS: Record<CharacterId, CharacterInfo> = {
    A: {
        id: "A",
        name: "Kira Light",
        age: "18",
        occupation: "Student",
        background: "Entering adulthood in early 2000s.",
        motivation: "saving up for College",
        risk: "Low-Medium",
        experience: "None",
        budget: "$5,000",
        image: "/images/CharacterA.png",
    },

    B: {
        id: "B",
        name: "Daniel Ruiz",
        age: "28",
        occupation: 'Junior Web Developer',
        background: "First stable tech job.",
        motivation: "financial independence",
        risk: "Medium",
        experience: "Beginner",
        budget: "$12,000",
        image: "/images/CharacterA.png",

    },
    C: {
        id: "C",
        name: "Maya Thompson",
        age: "34",
        occupation: "Freelance Designer / Single Mom",
        background: "Balancing work and family.",
        motivation: "long-term stability",
        risk: "Medium-low",
        experience: "Low",
        budget: "$9,000",
        image: "/images/CharacterA.png",

    },
};

const SCENARIOS: Record<ScenarioId, ScenarioInfo> = {
    dotcom: {
        id: "dotcom",
        title: "Dot-com Bubble",
        period: "Late 1990s – early 2000s",
        image: "/images/dotcom.jpeg",
        description:
            "The dot-com bubble was a period when internet-related companies grew very fast and investors poured money into them based\n" +
            "on future hopes instead of solid profits. Between the mid-1990s and around 2000, stock prices of many internet businesses\n" +
            "rose sharply as people expected huge returns. When it became clear that many of these companies could not make money,\n" +
            "confidence collapsed, prices fell hard, and many startups failed.",
        heroSubtitle:
            "This scenario takes place in a market shaped by excessive expectations and rapid repricing. The overview below explains how it all unfolded.",
    },
    housing: {
        id: "housing",
        title: "Global Financial Crisis",
        period: "2007 – 2009",
        image: "/images/dotcom.jpeg",
        description:
            "The Global Financial Crisis was caused by risky mortgages and excessive lending\n" +
            " in the housing market. These loans were turned into complex financial products and\n" +
            " spread across the global financial system. When borrowers began to default, banks suffered\n" +
            " massive losses, credit markets froze, and the world entered a deep economic recession.",
        heroSubtitle:
            "This scenario is not finished yet. Your selection will still show up in the sidebar, but the main overview content is coming soon.",
    },
    pandemic: {
        id: "pandemic",
        title: "Pandemic Market Shock",
        period: "2020",
        image: "/images/dotcom.jpeg",

        description:
            "The Pandemic Market Shock was triggered by a global health crisis that caused sudden\n" +
            " lockdowns, travel restrictions, and supply chain disruptions. Financial markets crashed rapidly\n" +
            " due to uncertainty and fear. Governments and central banks responded with large stimulus programs,\n" +
            " leading to an uneven and volatile market recovery.",
        heroSubtitle:
            "This scenario is not finished yet. Your selection will still show up in the sidebar, but the main overview content is coming soon.",
    },
};

const DOTCOM_SOURCES = [
    {
        label: "NASDAQ Composite historical prices (Yahoo Finance)",
        href: "https://finance.yahoo.com/quote/%5EIXIC/history/?period1=757382400&period2=1104537600",
        description:
            "Daily index levels showing the rise and fall of tech stocks during the dot-com period.",
    },
    {
        label: "Dot-com bubble explained (Investopedia)",
        href: "https://www.investopedia.com/terms/d/dotcom-bubble.asp",
        description:
            "A clear, beginner-friendly explanation of what caused the bubble and why it collapsed.",
    },
    {
        label: "“Irrational exuberance” – background and context",
        href: "https://en.wikipedia.org/wiki/Irrational_exuberance",
        description:
            "The origin and meaning of the phrase often linked to the dot-com bubble.",
    },
];

const CHARACTER_STARTING_CASH: Record<CharacterId, number> = {
    A: 5000,
    B: 12000,
    C: 9000,
};

export default function PreviewPage() {
    return (
        <Suspense fallback={null}>
            <PreviewPageContent />
        </Suspense>
    );
}

function PreviewPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const character = searchParams.get("character") as CharacterId | null;
    const scenario = searchParams.get("scenario") as ScenarioId | null;

    if (!character || !scenario) {
        router.replace("/");
        return null;
    }
    const characterInfo = CHARACTERS[character] ?? CHARACTERS.A;
    const scenarioInfo = SCENARIOS[scenario] ?? SCENARIOS.dotcom;

    const isDotcom = scenarioInfo.id === "dotcom";

    // Evidence-backed anchor numbers (dotcom only)
    const nasdaqPeak = 5048.62; // close at peak (Mar 10, 2000)
    const nasdaqTrough = 1114.11; // close at trough (Oct 9, 2002)
    const drawdownPct = Math.round((1 - nasdaqTrough / nasdaqPeak) * 100); // ~78%

    return (
        <main suppressHydrationWarning
            className="min-h-screen bg-[#F7FAFC] text-[#0A355B]"
        >
            {/* HERO */}
            <div className="px-8 pt-12 pb-10 bg-gradient-to-b from-[#EAF4FF] to-[#F7FAFC] border-b border-[#CFE3F8]">
                <header className="max-w-[1300px] mx-auto">
                    <button
                        onClick={() => router.push("/character")}
                        className="mb-6 inline-flex items-center gap-2 text-blue-700 font-medium hover:underline"
                    >
                        <span aria-hidden>←</span> Back to selection
                    </button>

                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#CFE3F8] text-blue-700 text-sm font-semibold">
                                Preview
                                <span className="text-blue-300">•</span>
                                Scenario: {scenarioInfo.title}
                            </div>

                            <h1 className="text-4xl md:text-5xl font-extrabold mt-4 tracking-tight">
                                {scenarioInfo.title} - Preview
                            </h1>

                            <p className="mt-5 max-w-[850px] leading-relaxed text-[17px] text-[#0A355B]">
                                {scenarioInfo.heroSubtitle}
                            </p>
                        </div>
                    </div>
                </header>
            </div>

            {/* BODY */}
            <div className="px-8 py-12">
                <div className="max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
                    {/* LEFT: content */}
                    <section className="space-y-14">
                        {isDotcom ? (
                            <>
                                {/* Key metrics */}
                                <section aria-label="Key metrics">
                                    <div className="flex items-end justify-between gap-6">
                                        <h2 className="text-2xl font-bold">At-a-glance</h2>
                                    </div>

                                    <p className="mt-2 text-[15px] text-[#0A355B]">
                                        All values refer to the NASDAQ Composite index, which
                                        represents the overall level of major technology stocks.
                                    </p>

                                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                                        <MetricIconCard
                                            icon="/images/arrowU.png"
                                            title="Market peak"
                                            value="5,048"
                                            note="Highest tech market level before the crash (Mar 2000)."
                                        />

                                        <MetricIconCard
                                            icon="/images/arrowD.png"
                                            title="Market low"
                                            value="1,114"
                                            note="Lowest point after confidence collapsed (Oct 2002)."
                                        />

                                        <MetricIconCard
                                            icon="/images/loss.png"
                                            title="Total loss"
                                            value="≈ 78%"
                                            note="Share of market value wiped out in the downturn."
                                        />

                                        <MetricIconCard
                                            icon="/images/warning.png"
                                            title="Warning sign"
                                            value="Irrational exuberance"
                                            note="Term warning prices had detached from reality (1996)."
                                        />
                                    </div>

                                </section>

                                {/* Context */}
                                <article id="context" className="scroll-mt-24">
                                    <SectionHeader title="What made this bubble possible?" />

                                    <div className="mt-6 rounded-2xl border border-[#CFE3F8] bg-white p-8">
                                        <div className="space-y-8">
                                            <div>
                                                <h3 className="text-lg font-bold mb-2">
                                                    1. A real technological breakthrough
                                                </h3>
                                                <p className="text-[#0A355B] leading-relaxed">
                                                    In the late 1990s, the internet spread rapidly into
                                                    everyday life. New companies promised to change how
                                                    people worked, shopped, and communicated. The growth
                                                    was real, but the business models were often untested.
                                                </p>
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-bold mb-2">
                                                    2. Expectations replaced profits
                                                </h3>
                                                <p className="text-[#0A355B] leading-relaxed">
                                                    Investors focused on how big companies might become in
                                                    the future, rather than whether they were making money
                                                    in the present. As long as prices kept rising, this
                                                    approach seemed justified.
                                                </p>
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-bold mb-2">
                                                    3. Confidence held everything together
                                                </h3>
                                                <p className="text-[#0A355B] leading-relaxed">
                                                    High prices depended on continued belief. When
                                                    investors began to doubt and sell, there was little
                                                    financial support underneath the prices, which made
                                                    them drop quickly once confidence broke.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-8 rounded-xl bg-[#F3F9FF] p-4 text-[#0A355B]">
                                            <strong>Key idea:</strong> The bubble didn’t form because
                                            people were irrational, but because optimism lasted longer
                                            than company profits could support.
                                        </div>
                                        <p className="text-[#0A355B] leading-relaxed">.</p>
                                        <SectionHeader subtitle="Visual overview" />

                                        <Card>
                                            <h3 className="text-lg font-semibold mb-4">
                                                NASDAQ rise and fall during the dot-com bubble
                                            </h3>

                                            <div className="rounded-xl border border-[#CFE3F8] bg-white p-4">
                                                <Image
                                                    src="/images/chart2.png"
                                                    alt="NASDAQ rise and fall during the dot-com bubble"
                                                    width={1100}
                                                    height={550}
                                                    className="rounded-lg w-full h-auto"
                                                    priority
                                                />
                                            </div>

                                            <div className="mt-5 grid md:grid-cols-3 gap-4">
                                                <MiniInsight
                                                    title="Fast price growth"
                                                    text="Prices rose faster and faster, which often signals growing risk."
                                                />

                                                <MiniInsight
                                                    title="Unstable peak"
                                                    text="Near the top, prices were fragile, small doubts led to large drops."
                                                />

                                                <MiniInsight
                                                    title="Large losses"
                                                    text={`From the peak to the bottom, the market lost about ${drawdownPct}% of its value.`}
                                                />
                                            </div>

                                            <p className="mt-6 text-sm text-blue-600">
                                                What to remember?: In the game, fast price increases
                                                usually come with higher risk.
                                            </p>
                                        </Card>
                                    </div>
                                </article>

                                <article id="sources" className="scroll-mt-24">
                                    <SectionHeader
                                        title="Further reading"
                                        subtitle="Optional links if you want to explore this scenario in more detail."
                                    />

                                    <Card>
                                        <div className="space-y-8 text-sm text-[#0A355B]">
                                            {DOTCOM_SOURCES.map(source => (
                                                <div key={source.href}>
                                                    <ul className="space-y-2">
                                                        <li>
                                                            <a
                                                                href={source.href}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-blue-700 hover:underline"
                                                            >
                                                                {source.label}
                                                            </a>
                                                            <p className="text-xs">
                                                                {source.description}
                                                            </p>
                                                        </li>
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                </article>
                            </>
                        ) : (
                            // NON-DOTCOM: keep layout, but main content intentionally "blank / not finished"
                            <article id="context" className="scroll-mt-24">
                                <SectionHeader title="Scenario overview" />

                                <div className="mt-6 rounded-2xl border border-[#CFE3F8] bg-white p-8">
                                    <Card>
                                        <h3 className="text-lg font-semibold mb-2">
                                            {scenarioInfo.title} — content coming soon
                                        </h3>
                                        <p className="text-[#0A355B] leading-relaxed">
                                            You already selected a character and scenario — those
                                            choices show up on the right. The detailed walkthrough for
                                            this scenario is not implemented yet, so this area stays
                                            intentionally empty for now.
                                        </p>
                                    </Card>
                                </div>
                            </article>
                        )}
                    </section>

                    {/* RIGHT: sticky sidebar */}
                    <aside className="sticky top-8 h-fit space-y-6">
                        <h3 className="text-lg font-bold mb-3">
                            Overview of your previous choices
                        </h3>

                        {/* Character */}
                        <div className="rounded-2xl border border-[#9CC8F5] bg-[#D9EEFF] p-6">
                            <p className="text-xl font-semibold text-blue-700 mb-3">
                                Character
                            </p>

                            <div className="flex gap-4 items-start">
                                <Image
                                    src={characterInfo.image}
                                    alt={characterInfo.name}
                                    width={120}
                                    height={128}
                                    className="rounded-lg border border-[#B6D8F6] bg-white object-cover"
                                />

                                <div>
                                    <h3 className="text-xl font-bold text-[#0A355B]">
                                        {characterInfo.name}
                                    </h3>



                                    <p className="text-sm text-[#0A355B]">
                                        Age: {characterInfo.age}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                <Badge label="Occupation" value={characterInfo.occupation} />
                                <Badge label="Budget" value={characterInfo.budget} />
                            </div>
                        </div>


                        {/* Scenario */}
                        <div className="rounded-2xl border border-[#9CC8F5] bg-[#D9EEFF] p-6">
                            <p className="text-xl font-semibold text-blue-700 mb-3">
                                Scenario
                            </p>

                            <div className="flex gap-4 items-start">
                                <Image
                                    src={scenarioInfo.image}
                                    alt={scenarioInfo.title}
                                    width={120}
                                    height={96}
                                    className="rounded-lg border border-[#B6D8F6] bg-white object-cover"
                                />

                                <div>
                                    <h3 className="text-xl font-bold text-[#0A355B]">
                                        {scenarioInfo.title}
                                    </h3>

                                    <p className="text-sm text-[#0A355B] font-semibold">
                                        {scenarioInfo.period}
                                    </p>
                                </div>
                            </div>
                        </div>


                        <button
                            onClick={() => {
                                const startingCash = CHARACTER_STARTING_CASH[characterInfo.id];
                                resetGame(startingCash);
                                router.push(`/main?character=${characterInfo.id}&scenario=${scenarioInfo.id}`);
                            }}
                            className="
                                w-full py-4 rounded-2xl
                                bg-blue-700 text-white text-lg font-semibold
                                transition-all duration-300 ease-out
                                transform
                                hover:bg-blue-600 hover:scale-105 hover:shadow-xl
                                active:scale-95 active:shadow-md
                                "

                        >
                            Start Simulation
                        </button>

                    </aside>
                </div>
            </div>
        </main>
    );
}

/* ---------- UI building blocks ---------- */
function SectionHeader({
                           title,
                           subtitle,
                       }: {
    title?: string;
    subtitle?: string;
}) {
    return (
        <div>
            {title && (
                <h2 className="text-3xl font-extrabold tracking-tight">{title}</h2>
            )}

            {subtitle && (
                <p
                    className={
                        title
                            ? "mt-2 text-[#0A355B] text-[15px]"
                            : "text-2xs font tracking-tight text-[#0A355B]"
                    }
                >
                    {subtitle}
                </p>
            )}
        </div>
    );
}

function Card({
                  children,
                  className = "",
              }: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`rounded-2xl border border-[#CFE3F8] bg-white p-6 shadow-sm ${className}`}
        >
            {children}
        </div>
    );
}

function MetricIconCard({
                            icon,
                            title,
                            value,
                            note,
                        }: {
    icon: string;
    title: string;
    value: string;
    note: string;
}) {
    return (
        <div className="rounded-2xl border border-[#CFE3F8] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-[#F3F9FF] flex items-center justify-center">
                    <Image
                        src={icon}
                        alt=""
                        width={50}
                        height={50}
                        className="opacity-80"
                    />
                </div>

                <p className="text-sm font-semibold text-blue-700">{title}</p>
            </div>

            <p className="text-2xl font-extrabold text-[#0A355B] leading-none">
                {value}
            </p>

            <p className="mt-2 text-xs text-[#0A355B] leading-snug">
                {note}
            </p>
        </div>
    );
}

function MiniInsight({ title, text }: { title: string; text: string }) {
    return (
        <div className="rounded-xl border border-[#CFE3F8] bg-[#F7FAFC] p-4">
            <p className="text-sm font-bold text-[#0A355B]">{title}</p>
            <p className="mt-1 text-sm text-[#0A355B]">{text}</p>
        </div>
    );
}

function Badge({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-[#CFE3F8] bg-white px-3 py-2">
            <p className="text-[11px] font-bold text-blue-700">{label}</p>
            <p className="text-sm font-semibold text-[#0A355B]">{value}</p>
        </div>
    );
}
