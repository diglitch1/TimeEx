"use client";

import Image from "next/image";
import type React from "react";
import { useRouter } from "next/navigation";

import { resetGame } from "../main/utils/save";

const DIANA_STARTING_CASH = 12000;

const COVID_SOURCES = [
    {
        label: "COVID-19 market crash explained",
        href: "https://www.investopedia.com/timeline-of-stock-market-crashes-5217820",
        description:
            "A concise overview of major crashes, including the speed and scale of the February-March 2020 selloff.",
    },
    {
        label: "How governments responded (stimulus)",
        href: "https://www.imf.org/en/Topics/imf-and-covid19/Policy-Responses-to-COVID-19",
        description:
            "Shows global economic response. Good for understanding why recovery happened.",
    },
    {
        label: "Sector winners and losers during the pandemic",
        href: "https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/the-great-acceleration",
        description:
            "Looks at how the pandemic widened gaps across industries, with some sectors collapsing while digital leaders surged.",
    },
];

export default function PandemicPreviewPage() {
    const router = useRouter();

    return (
        <main suppressHydrationWarning className="min-h-screen bg-[#F7FAFC] text-[#0A355B]">
            <div className="border-b border-[#CFE3F8] bg-gradient-to-b from-[#EAF4FF] to-[#F7FAFC] px-8 pt-12 pb-10">
                <header className="mx-auto max-w-[1300px]">
                    <button
                        onClick={() => router.push("/character")}
                        className="mb-6 inline-flex items-center gap-2 text-blue-700 font-medium hover:underline"
                    >
                        <span aria-hidden>&larr;</span>
                        Back to selection
                    </button>

                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#CFE3F8] bg-white px-3 py-1 text-sm font-semibold text-blue-700">
                                Preview
                                <span className="text-blue-300">&bull;</span>
                                Scenario: COVID-19 Crisis
                            </div>

                            <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
                                COVID-19 Crisis - Preview
                            </h1>

                            <p className="mt-5 max-w-[850px] text-[17px] leading-relaxed text-[#0A355B]">
                                This scenario takes place during a global crisis that disrupted
                                economies, markets, and everyday life. The overview below explains
                                how events unfolded and why markets reacted so strongly.
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
                                subtitle="Four quick signals that define the COVID-19 market shock."
                            />

                            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                                <MetricIconCard
                                    icon="/images/arrowD.png"
                                    title="Market crash"
                                    value="≈ -34%"
                                    note="Fastest drop in modern market history (Feb-Mar 2020)"
                                />
                                <MetricIconCard
                                    icon="/images/arrowU.png"
                                    title="Market recovery"
                                    value="≈ +70%+"
                                    note="Strong rebound driven by stimulus and tech growth"
                                />
                                <MetricIconCard
                                    icon="/images/loss.png"
                                    title="Economic impact"
                                    value="Millions unemployed"
                                    note="Businesses and industries shut down worldwide"
                                />
                                <MetricIconCard
                                    icon="/images/warning.png"
                                    title="Warning sign"
                                    value="Uncertainty"
                                    note="Sudden global events can break stable markets instantly"
                                />
                            </div>
                        </article>

                        <article id="causes" className="scroll-mt-24">
                            <SectionHeader
                                title="What caused this crisis?"
                                subtitle="The market shock came from a sudden external event, not from a classic asset bubble."
                            />

                            <div className="mt-6 space-y-5">
                                <Card>
                                    <h3 className="text-2xl font-bold tracking-tight">
                                        1. A global health crisis
                                    </h3>
                                    <p className="mt-3 leading-relaxed text-[#0A355B]">
                                        A new virus spread rapidly across the world, overwhelming
                                        healthcare systems and leading to widespread lockdowns.
                                        Governments acted to protect public health, which directly
                                        impacted economic activity.
                                    </p>
                                </Card>

                                <Card>
                                    <h3 className="text-2xl font-bold tracking-tight">
                                        2. Economic activity stopped
                                    </h3>
                                    <p className="mt-3 leading-relaxed text-[#0A355B]">
                                        Businesses closed, travel halted, and supply chains were
                                        disrupted. Many companies lost revenue almost overnight,
                                        creating panic in financial markets.
                                    </p>
                                </Card>

                                <Card>
                                    <h3 className="text-2xl font-bold tracking-tight">
                                        3. Government intervention changed everything
                                    </h3>
                                    <p className="mt-3 leading-relaxed text-[#0A355B]">
                                        Central banks and governments introduced massive stimulus
                                        programs to stabilize the economy. This support helped
                                        markets recover faster than expected.
                                    </p>
                                </Card>
                            </div>

                            <Card className="mt-6 bg-[#F7FBFF]">
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
                                    Key idea
                                </p>
                                <p className="mt-3 text-lg leading-relaxed text-[#0A355B]">
                                    This crash was not caused by a financial bubble, but by a
                                    sudden external shock.
                                </p>
                                <p className="mt-2 text-lg leading-relaxed text-[#0A355B]">
                                    The recovery was largely driven by government intervention and
                                    changing market expectations.
                                </p>
                            </Card>
                        </article>

                        <article id="visual-overview" className="scroll-mt-24">
                            <SectionHeader
                                title="Visual overview"
                                subtitle="Market crash and recovery during the COVID-19 crisis"
                            />

                            <Card className="mt-6">
                                <div className="overflow-hidden rounded-2xl border border-[#D6E6F5] bg-[#F7FBFF] p-4">
                                    <Image
                                        src="/images/COVID-19-PANDEMIC/preview%20page/GRAPH.png"
                                        alt="S&P 500 graph during the COVID-19 crisis"
                                        width={1200}
                                        height={700}
                                        className="h-auto w-full rounded-xl object-contain"
                                    />
                                </div>

                                <div className="mt-6 grid gap-4 md:grid-cols-3">
                                    <MiniInsight
                                        title="Sharp crash"
                                        text="Markets dropped extremely fast as global uncertainty spread."
                                    />
                                    <MiniInsight
                                        title="Fast recovery"
                                        text="Stimulus and policy support pushed markets upward again."
                                    />
                                    <MiniInsight
                                        title="Uneven impact"
                                        text="Some industries collapsed, while others grew rapidly."
                                    />
                                </div>

                                <p className="mt-6 text-sm text-blue-600">
                                    What to remember?: In the game, sudden global events can create
                                    both risk and opportunity. Fast recoveries are possible, but not
                                    guaranteed.
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
                                    {COVID_SOURCES.map((source) => (
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
                                    src="/images/COVID-19-PANDEMIC/scenario-character-selection/Character.png"
                                    alt="Diana Gelus"
                                    width={120}
                                    height={128}
                                    className="rounded-lg border border-[#B6D8F6] bg-white object-cover"
                                />

                                <div>
                                    <h3 className="text-xl font-bold text-[#0A355B]">
                                        Diana Gelus
                                    </h3>
                                    <p className="text-sm text-[#0A355B]">Age: 26</p>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                <Badge label="Occupation" value="Flight Attendant" />
                                <Badge label="Budget" value="$12,000" />
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[#9CC8F5] bg-[#D9EEFF] p-6">
                            <p className="mb-3 text-xl font-semibold text-blue-700">Scenario</p>

                            <div className="flex items-start gap-4">
                                <Image
                                    src="/images/COVID-19-PANDEMIC/scenario-character-selection/scenario-COVID-19-PANDEMIC.png"
                                    alt="COVID-19 Crisis"
                                    width={120}
                                    height={96}
                                    className="rounded-lg border border-[#B6D8F6] bg-white object-cover"
                                />

                                <div>
                                    <h3 className="text-xl font-bold text-[#0A355B]">
                                        COVID-19 Crisis
                                    </h3>

                                    <p className="text-sm font-semibold text-[#0A355B]">
                                        2020 - 2021
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                resetGame(DIANA_STARTING_CASH);
                                router.push("/main?character=D&scenario=pandemic");
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
