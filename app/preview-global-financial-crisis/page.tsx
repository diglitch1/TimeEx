"use client";

import Image from "next/image";
import type React from "react";
import { useRouter } from "next/navigation";

import { resetGame } from "../main/utils/save";

const CAIN_STARTING_CASH = 20000;
const CHARACTER_SELECTION_SOURCE_KEY = "timeex:selection-source";

const GFC_SOURCES = [
    {
        label: "Federal Reserve History: Subprime Mortgage Crisis",
        href: "https://www.federalreservehistory.org/essays/subprime-mortgage-crisis",
        description:
            "A primary-source overview of how subprime lending and falling house prices fed the crisis.",
    },
    {
        label: "Federal Reserve History: Support for Specific Institutions",
        href: "https://www.federalreservehistory.org/essays/support-for-specific-institutions",
        description:
            "Covers Bear Stearns, Lehman Brothers, AIG, and the emergency interventions of 2008.",
    },
    {
        label: "Britannica: Financial Crisis of 2007-08",
        href: "https://www.britannica.com/money/financial-crisis-of-2007-2008",
        description:
            "A broad summary of the causes, major events, and global fallout of the crisis.",
    },
];

export default function GlobalFinancialCrisisPreviewPage() {
    const router = useRouter();

    return (
        <main suppressHydrationWarning className="min-h-screen bg-[#F7FAFC] text-[#0A355B]">
            <div className="border-b border-[#CFE3F8] bg-gradient-to-b from-[#EAF4FF] to-[#F7FAFC] px-8 pt-12 pb-10">
                <header className="mx-auto max-w-[1300px]">
                    <button
                        onClick={() => {
                            localStorage.setItem(CHARACTER_SELECTION_SOURCE_KEY, "return");
                            router.push("/character");
                        }}
                        className="mb-6 inline-flex items-center gap-2 font-medium text-blue-700 hover:underline"
                    >
                        <span aria-hidden>&larr;</span>
                        Back to selection
                    </button>

                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#CFE3F8] bg-white px-3 py-1 text-sm font-semibold text-blue-700">
                                Preview
                                <span className="text-blue-300">&bull;</span>
                                Scenario: Global Financial Crisis
                            </div>

                            <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
                                Global Financial Crisis - Preview
                            </h1>

                            <p className="mt-5 max-w-[850px] text-[17px] leading-relaxed text-[#0A355B]">
                                This scenario places you inside the housing-and-credit collapse of
                                2007-2009, when falling home prices, failing banks, and frozen
                                lending turned a U.S. housing slump into a global crisis.
                            </p>
                        </div>
                    </div>
                </header>
            </div>

            <div className="px-8 py-12">
                <div className="mx-auto grid max-w-[1300px] grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
                    <section className="space-y-14">
                        <article aria-label="Key metrics">
                            <SectionHeader
                                title="At-a-glance"
                                subtitle="Four quick signals that define the Global Financial Crisis."
                            />

                            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                                <MetricIconCard
                                    icon="/images/arrowD.png"
                                    title="S&P 500 drawdown"
                                    value="≈ -57%"
                                    note="U.S. stocks fell sharply from the October 2007 peak to the March 2009 low."
                                />
                                <MetricIconCard
                                    icon="/images/warning.png"
                                    title="Warning sign"
                                    value="Subprime mortgages"
                                    note="Risky lending and securitized debt spread housing losses across the financial system."
                                />
                                <MetricIconCard
                                    icon="/images/loss.png"
                                    title="Lehman collapse"
                                    value="Sep 15, 2008"
                                    note="The bankruptcy became the defining panic moment of the crisis."
                                />
                                <MetricIconCard
                                    icon="/images/arrowU.png"
                                    title="Emergency response"
                                    value="$700B TARP"
                                    note="Congress approved a major rescue package to stabilize banks and credit markets."
                                />
                            </div>
                        </article>

                        <article id="causes" className="scroll-mt-24">
                            <SectionHeader
                                title="What caused this crisis?"
                                subtitle="The panic in 2008 came from years of cheap credit, housing speculation, and fragile financial engineering."
                            />

                            <div className="mt-6 space-y-5">
                                <Card>
                                    <h3 className="text-2xl font-bold tracking-tight">
                                        1. A housing boom built on risky lending
                                    </h3>
                                    <p className="mt-3 leading-relaxed text-[#0A355B]">
                                        Mortgage credit expanded aggressively in the early 2000s,
                                        including to borrowers with weaker credit. As long as home
                                        prices kept rising, the system looked profitable and
                                        manageable.
                                    </p>
                                </Card>

                                <Card>
                                    <h3 className="text-2xl font-bold tracking-tight">
                                        2. Mortgage risk was spread everywhere
                                    </h3>
                                    <p className="mt-3 leading-relaxed text-[#0A355B]">
                                        Banks and investors bundled mortgages into complex financial
                                        products. That meant housing losses did not stay local; they
                                        moved through balance sheets across the global system.
                                    </p>
                                </Card>

                                <Card>
                                    <h3 className="text-2xl font-bold tracking-tight">
                                        3. Confidence vanished faster than expected
                                    </h3>
                                    <p className="mt-3 leading-relaxed text-[#0A355B]">
                                        Once defaults rose and home prices fell, institutions stopped
                                        trusting one another. Funding dried up, major firms failed,
                                        and panic spread from Wall Street to the broader economy.
                                    </p>
                                </Card>
                            </div>

                            <Card className="mt-6 bg-[#F7FBFF]">
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
                                    Key idea
                                </p>
                                <p className="mt-3 text-lg leading-relaxed text-[#0A355B]">
                                    The Global Financial Crisis was not just a stock-market crash.
                                </p>
                                <p className="mt-2 text-lg leading-relaxed text-[#0A355B]">
                                    It was a breakdown in trust across housing, credit, banking, and
                                    the real economy all at once.
                                </p>
                            </Card>
                        </article>

                        <article id="visual-overview" className="scroll-mt-24">
                            <SectionHeader
                                title="Visual overview"
                                subtitle="Market collapse during the Global Financial Crisis"
                            />

                            <Card className="mt-6">
                                <div className="overflow-hidden rounded-2xl border border-[#D6E6F5] bg-white p-4">
                                    <Image
                                        src="/images/Global-financial-crisis/graph.png?v=2"
                                        alt="Market graph during the Global Financial Crisis"
                                        width={1200}
                                        height={700}
                                        unoptimized
                                        className="h-auto w-full rounded-xl object-contain"
                                    />
                                </div>

                                <div className="mt-6 grid gap-4 md:grid-cols-3">
                                    <MiniInsight
                                        title="Housing stress spread outward"
                                        text="Problems started in mortgages, but they quickly infected banks, credit markets, and household confidence."
                                    />
                                    <MiniInsight
                                        title="Bank failures changed the tone"
                                        text="Once major institutions began to fail or need rescue, fear accelerated and selling deepened."
                                    />
                                    <MiniInsight
                                        title="Policy support mattered"
                                        text="Rescue programs and rate cuts helped stop the panic, but the economic damage lasted far longer."
                                    />
                                </div>

                                <p className="mt-6 text-sm text-blue-600">
                                    What to remember?: In the game, leverage, bank stress, and
                                    confidence shocks can change the value of decisions very quickly.
                                </p>
                            </Card>
                        </article>

                        <article id="sources" className="scroll-mt-24">
                            <SectionHeader
                                title="Further reading"
                                subtitle="Optional links if you want to explore this scenario in more detail."
                            />

                            <Card className="mt-6">
                                <div className="space-y-8 text-sm text-[#0A355B]">
                                    {GFC_SOURCES.map((source) => (
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
                    </section>

                    <aside className="sticky top-8 h-fit space-y-6">
                        <h3 className="mb-3 text-lg font-bold">
                            Overview of your previous choices
                        </h3>

                        <div className="rounded-2xl border border-[#9CC8F5] bg-[#D9EEFF] p-6">
                            <p className="mb-3 text-xl font-semibold text-blue-700">Character</p>

                            <div className="flex items-start gap-4">
                                <Image
                                    src="/images/Global-financial-crisis/characterB.png"
                                    alt="Cain Amane"
                                    width={120}
                                    height={128}
                                    className="rounded-lg border border-[#B6D8F6] bg-white object-cover"
                                />

                                <div>
                                    <h3 className="text-xl font-bold text-[#0A355B]">
                                        Cain Amane
                                    </h3>
                                    <p className="text-sm text-[#0A355B]">Age: 46</p>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                <Badge label="Occupation" value="Real Estate Agent" />
                                <Badge label="Budget" value="$20,000" />
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[#9CC8F5] bg-[#D9EEFF] p-6">
                            <p className="mb-3 text-xl font-semibold text-blue-700">Scenario</p>

                            <div className="flex items-start gap-4">
                                <img
                                    src="/images/Global-financial-crisis/globalCrisis.png"
                                    alt="Global Financial Crisis"
                                    className="h-24 w-[120px] rounded-lg border border-[#B6D8F6] bg-white object-cover"
                                />

                                <div>
                                    <h3 className="text-xl font-bold text-[#0A355B]">
                                        Global Financial Crisis
                                    </h3>

                                    <p className="text-sm font-semibold text-[#0A355B]">
                                        2007 - 2009
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                resetGame(CAIN_STARTING_CASH);
                                router.push("/main?character=B&scenario=housing");
                            }}
                            className="
                                w-full rounded-2xl bg-blue-700 py-4 text-lg font-semibold text-white
                                transition-all duration-300 ease-out
                                hover:scale-105 hover:bg-blue-600 hover:shadow-xl
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
                            ? "mt-2 text-[15px] text-[#0A355B]"
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
        <div className={`rounded-2xl border border-[#CFE3F8] bg-white p-6 shadow-sm ${className}`}>
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
            <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F3F9FF]">
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

            <p className="text-2xl font-extrabold leading-none text-[#0A355B]">
                {value}
            </p>

            <p className="mt-2 text-xs leading-snug text-[#0A355B]">
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
