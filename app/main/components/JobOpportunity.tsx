'use client';

import { useEffect, useMemo, useState } from 'react';
import type { WalletItem } from '../utils/walletData';

type Props = {
    wallet: WalletItem[];
    setWallet: React.Dispatch<React.SetStateAction<WalletItem[]>>;
    onClose: () => void;
};

type Stage = 'invite' | 'challenge' | 'result';
type InviteChoice = 'accept' | 'decline';
type Outcome = 'success' | 'partial' | 'failure';

type Ticket = {
    id: string;
    title: string;
    context: string;
    impact: string;
    effort: 'S' | 'M' | 'L';
};

const PARTIAL_BONUS = 250;
const SUCCESS_BONUS = 500;

// monthly income placeholder (no logic yet)
const JOB_MONTHLY_INCOME = 900;

export default function JobOpportunityModal({ wallet, setWallet, onClose }: Props) {
    /* ---------- GATE: ONLY IF FREELANCE GIG WAS ACCEPTED ---------- */
    const gigAccepted = useMemo(() => {
        try {
            const raw = localStorage.getItem('freelanceGig');
            if (!raw) return false;
            return JSON.parse(raw).accepted === true;
        } catch {
            return false;
        }
    }, []);

    useEffect(() => {
        if (!gigAccepted) onClose();
    }, [gigAccepted, onClose]);

    /* ---------- STATE ---------- */
    const [stage, setStage] = useState<Stage>('invite');
    const [inviteChoice, setInviteChoice] = useState<InviteChoice>('accept');

    // selected ticket IDs (order matters)
    const [selected, setSelected] = useState<string[]>([]);
    const [dragFromIndex, setDragFromIndex] = useState<number | null>(null);

    const [outcome, setOutcome] = useState<Outcome | null>(null);


    /* ---------- TICKETS (REALISTIC TRIAGE BOARD) ---------- */
    const TICKETS: Ticket[] = useMemo(
        () => [
            {
                id: 'checkout-502',
                title: 'Intermittent 502 on checkout',
                context: 'Some users report checkout failing during peak hours.',
                impact: 'Some customers cannot complete purchases.',
                effort: 'M',
            },
            {
                id: 'signup-email',
                title: 'Sign-up verification emails delayed',
                context: 'New users sometimes wait minutes for verification emails.',
                impact: 'New sign-ups drop during spikes.',
                effort: 'S',
            },
            {
                id: 'dashboard-slow',
                title: 'Dashboard latency regression',
                context: 'The logged-in dashboard becomes slow when many users are active.',
                impact: 'Users experience slow pages and timeouts.',
                effort: 'M',
            },
            {
                id: 'cache-hit-rate',
                title: 'Cache hit rate dropped after last release',
                context: 'Performance improved before, but now the cache is barely being used.',
                impact: 'Infrastructure cost rises and pages slow down.',
                effort: 'M',
            },
            {
                id: 'report-export',
                title: 'CSV export fails on large datasets',
                context: 'Internal team cannot export reports above ~10k rows.',
                impact: 'Internal workflows are blocked.',
                effort: 'L',
            },
            {
                id: 'search-duplicates',
                title: 'Search shows duplicate results',
                context: 'Some queries show repeated items or inconsistent ordering.',
                impact: 'Users get confusing results.',
                effort: 'M',
            },
            {
                id: 'footer-link',
                title: 'Broken link in footer',
                context: 'Privacy policy link points to an old route.',
                impact: 'Minor usability issue.',
                effort: 'S',
            },
            {
                id: 'safari-ui',
                title: 'UI misalignment on Safari',
                context: 'Dark mode toggle alignment is off in Safari.',
                impact: 'Cosmetic issue.',
                effort: 'S',
            },
        ],
        []
    );

    const selectedTickets = selected
        .map(id => TICKETS.find(t => t.id === id))
        .filter(Boolean) as Ticket[];

    /* ---------- HELPERS ---------- */
    const isSelected = (id: string) => selected.includes(id);

    const toggleSelect = (id: string) => {
        setSelected(prev => {
            if (prev.includes(id)) return prev.filter(x => x !== id);
            if (prev.length >= 3) return prev; // max 3
            return [...prev, id];
        });
    };

    const removeSelected = (id: string) => {
        setSelected(prev => prev.filter(x => x !== id));
    };

    // drag within selected list
    const onDragStart = (index: number) => setDragFromIndex(index);

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // required to allow drop
    };

    const onDrop = (toIndex: number) => {
        setSelected(prev => {
            if (dragFromIndex === null) return prev;
            if (dragFromIndex === toIndex) return prev;

            const copy = [...prev];
            const [moved] = copy.splice(dragFromIndex, 1);
            copy.splice(toIndex, 0, moved);
            return copy;
        });
        setDragFromIndex(null);
    };

    /* ---------- SCORING (HIDDEN) ---------- */
    const evaluateOutcome = (orderedIds: string[]): Outcome => {
        const first = orderedIds[0];

        let score = 0;

        const includes = (id: string) => orderedIds.includes(id);

        if (first === 'checkout-502') score += 2;
        else if (includes('checkout-502')) score += 1;

        if (includes('signup-email')) score += 1;

        if (includes('dashboard-slow')) score += 1;
        if (includes('cache-hit-rate')) score += 1;

        if (includes('report-export')) score += 1;

        if (includes('footer-link')) score -= 1;
        if (includes('safari-ui')) score -= 1;

        const cosmeticIndex = Math.min(
            orderedIds.indexOf('footer-link') === -1 ? 999 : orderedIds.indexOf('footer-link'),
            orderedIds.indexOf('safari-ui') === -1 ? 999 : orderedIds.indexOf('safari-ui')
        );
        const systemicIndex = Math.min(
            orderedIds.indexOf('dashboard-slow') === -1 ? 999 : orderedIds.indexOf('dashboard-slow'),
            orderedIds.indexOf('cache-hit-rate') === -1 ? 999 : orderedIds.indexOf('cache-hit-rate')
        );
        if (cosmeticIndex < systemicIndex) score -= 1;

        if (score >= 4) return 'success';
        if (score >= 2) return 'partial';
        return 'failure';
    };

    /* ---------- ACTIONS ---------- */
    const handleInviteConfirm = () => {
        if (inviteChoice === 'decline') {
            localStorage.setItem(
                'jobOpportunity',
                JSON.stringify({
                    acceptedChallenge: false,
                    date: new Date().toISOString(),
                })
            );
            onClose();
            return;
        }

        localStorage.setItem(
            'jobOpportunity',
            JSON.stringify({
                acceptedChallenge: true,
                date: new Date().toISOString(),
            })
        );

        setStage('challenge');
    };

    const handleChallengeConfirm = () => {
        if (selected.length !== 3) return;

        const result = evaluateOutcome(selected);
        setOutcome(result);

        if (result === 'partial' || result === 'success') {
            const amount = result === 'success' ? SUCCESS_BONUS : PARTIAL_BONUS;

            setWallet(prev =>
                prev.map(item =>
                    item.id === 'cash'
                        ? {
                            ...item,
                            usdValue: item.usdValue + amount,
                            units: item.units + amount,
                        }
                        : item
                )
            );
        }

        if (result === 'success') {
            setWallet(prev => {
                const alreadyHasJob = prev.some(w => w.id === 'job-income');
                if (alreadyHasJob) return prev;

                const jobItem: WalletItem = {
                    id: 'job-income',
                    label: 'Job (monthly income)',
                    units: JOB_MONTHLY_INCOME,
                    unitLabel: '/month',
                    usdValue: JOB_MONTHLY_INCOME,
                };

                return [...prev, jobItem];
            });
        }

        localStorage.setItem(
            'jobOpportunityResult',
            JSON.stringify({
                outcome: result,
                bonus: result === 'success' ? SUCCESS_BONUS : result === 'partial' ? PARTIAL_BONUS : 0,
                jobUnlocked: result === 'success',
                date: new Date().toISOString(),
                chosen: selected,
            })
        );

        setStage('result');
    };

    const handleResultContinue = () => {
        onClose();
    };

    /* ---------- RENDER GATE ---------- */
    if (!gigAccepted) return null;

    const cash = wallet.find(w => w.id === 'cash');

    /* ---------- UI ---------- */
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-[900px] rounded-2xl p-8 text-gray-900 shadow-xl animate-event-in">

                {/* TOP BAR / BRAND */}
                <div className="flex items-center gap-3 mb-6">
                    <img
                        src="/events/company_logo.png"
                        alt="Company logo"
                        className="h-10 w-10 object-contain"
                        draggable={false}
                    />
                    <div>
                        <p className="text-sm text-gray-500">Startup follow-up</p>
                        <h2 className="text-2xl font-bold text-red-600">
                            Job Opportunity
                        </h2>
                    </div>
                </div>

                {/* ---------------- INVITE STAGE ---------------- */}
                {stage === 'invite' && (
                    <>
                        <p className="text-lg mb-6">
                            The startup you worked with recently reaches out again.
                            <br />
                            They mention that your previous work helped them unblock a few things faster than expected.
                            <br />
                            <span className="text-gray-600">
They’re dealing with a busy sprint and ask if you’d be available for a short, paid follow-up task.
                            </span>
                        </p>

                        <div className="flex gap-4 mb-6">
                            <button
                                onClick={() => setInviteChoice('accept')}
                                className={`flex-1 rounded-full py-3 text-lg font-semibold border transition ${
                                    inviteChoice === 'accept'
                                        ? 'bg-green-500 text-white border-green-500'
                                        : 'bg-white text-gray-600 border-gray-300'
                                }`}
                            >
                                accept gig
                            </button>

                            <button
                                onClick={() => setInviteChoice('decline')}
                                className={`flex-1 rounded-full py-3 text-lg font-semibold border transition ${
                                    inviteChoice === 'decline'
                                        ? 'bg-red-500 text-white border-red-500'
                                        : 'bg-white text-gray-600 border-gray-300'
                                }`}
                            >
                                decline
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">
                                        What they want to see
                                    </label>
                                    <p className="text-gray-700">
                                        How you approach prioritization under time pressure, explain your reasoning, and make pragmatic engineering decisions.
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block">
                                        Time window
                                    </label>
                                    <div className="rounded-lg border px-4 py-3 text-lg font-semibold">
                                        Roughly an hour
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block">
                                        Payment
                                    </label>
                                    <div className="rounded-lg border px-4 py-3 text-lg font-semibold">
                                        Paid freelance work (scope-dependent)
                                    </div>
                                </div>
                            </div>

                            <div className="border border-gray-300 rounded-xl p-4">
                                <p className="font-semibold mb-2">Wallet</p>
                                <div className="space-y-1 text-gray-800 max-h-[180px] overflow-y-auto">
                                    {wallet.map(item => (
                                        <p key={item.id}>
                                            {item.label}:{' '}
                                            <span className="font-medium">
                                                {item.units} {item.unitLabel}
                                            </span>
                                            <span className="text-gray-500">
                                                {' '}(${item.usdValue})
                                            </span>
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleInviteConfirm}
                            className="w-full rounded-full py-4 text-lg font-semibold transition bg-blue-600 text-white hover:bg-blue-500"
                        >
                            confirm
                        </button>
                    </>
                )}

                {/* ---------------- CHALLENGE STAGE ---------------- */}
                {stage === 'challenge' && (
                    <>
                        <div className="mb-6">
                            <p className="text-lg">
                                Challenge: You’re handed a short backlog of open issues from their current sprint.

                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                                Select 3 tickets, then drag them into the order you’d tackle first.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-6">
                            {/* BACKLOG */}
                            <div className="border border-gray-300 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="font-semibold">Backlog</p>
                                    <p className="text-sm text-gray-600">
                                        Selected: <span className="font-semibold">{selected.length}</span>/3
                                    </p>
                                </div>

                                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                                    {TICKETS.map(t => {
                                        const picked = isSelected(t.id);
                                        return (
                                            <button
                                                key={t.id}
                                                onClick={() => toggleSelect(t.id)}
                                                className={`w-full text-left rounded-xl border p-3 transition ${
                                                    picked
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 bg-white hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{t.title}</p>
                                                        <p className="text-xs text-gray-600 mt-1">{t.context}</p>
                                                    </div>
                                                    <div className="text-xs text-gray-500 whitespace-nowrap">
                                                        Effort: <span className="font-semibold">{t.effort}</span>
                                                    </div>
                                                </div>

                                                <div className="mt-2 text-xs text-gray-700">
                                                    <span className="font-semibold">Impact:</span> {t.impact}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {selected.length >= 3 && (
                                    <p className="text-xs text-gray-500 mt-3">
                                        You’ve selected 3. Click one again to remove it.
                                    </p>
                                )}
                            </div>

                            {/* PRIORITY ORDER */}
                            <div className="border border-gray-300 rounded-xl p-4">
                                <p className="font-semibold mb-1">Your priority order</p>
                                <p className="text-sm text-gray-600 mb-4">
                                    Drag the selected tickets into the order you would tackle first.
                                </p>

                                <div className="space-y-3 min-h-[220px]">
                                    {selectedTickets.length === 0 && (
                                        <div className="rounded-xl border border-dashed p-6 text-gray-500 text-sm">
                                            Select tickets from the backlog to build your shortlist.
                                        </div>
                                    )}

                                    {selectedTickets.map((t, idx) => (
                                        <div
                                            key={t.id}
                                            draggable
                                            onDragStart={() => onDragStart(idx)}
                                            onDragOver={onDragOver}
                                            onDrop={() => onDrop(idx)}
                                            className="rounded-xl border border-blue-200 bg-white p-3 shadow-sm cursor-move"
                                            title="Drag to reorder"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-semibold">
                                                        {idx + 1}. {t.title}
                                                    </p>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {t.context}
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => removeSelected(t.id)}
                                                    className="text-xs text-gray-500 hover:text-red-600 transition"
                                                    type="button"
                                                >
                                                    remove
                                                </button>
                                            </div>

                                            <div className="mt-2 grid grid-cols-2 gap-3 text-xs text-gray-700">
                                                <div>
                                                    <span className="font-semibold">Impact:</span> {t.impact}
                                                </div>
                                                <div className="text-right text-gray-500">
                                                    Effort: <span className="font-semibold">{t.effort}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4">
                                    <p className="text-xs text-gray-500">
                                        Tip: There’s no single correct answer — they’re interested in how you think and what you prioritize.

                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">
                                        Your submission
                                    </label>
                                    <p className="text-gray-700">
                                        {selected.length === 3
                                            ? 'You’re ready to submit your triage order.'
                                            : 'Select exactly three tickets to submit.'}
                                    </p>
                                </div>

                                {selected.length !== 3 && (
                                    <p className="text-sm text-red-500">
                                        You must choose 3 tickets before submitting.
                                    </p>
                                )}
                            </div>


                        </div>

                        <button
                            disabled={selected.length !== 3}
                            onClick={handleChallengeConfirm}
                            className={`w-full rounded-full py-4 text-lg font-semibold transition ${
                                selected.length === 3
                                    ? 'bg-blue-600 text-white hover:bg-blue-500'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            submit triage order
                        </button>
                    </>
                )}

                {/* ---------------- RESULT STAGE ---------------- */}
                {stage === 'result' && (
                    <>
                        <div className="mt-2 mb-6">
                            {outcome === 'success' && (
                                <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
                                    <p className="text-xl font-semibold text-green-700 mb-2">
                                        Outcome: Follow-up offer
                                    </p>
                                    <p className="text-gray-700">
                                        They’re happy with how you approached the backlog and explained your decisions.
                                        <br />
                                        They offer you a role going forward and pay you for the challenge work.
                                    </p>
                                    <div className="text-green-700 font-semibold mt-3">
                                        + ${SUCCESS_BONUS} payment
                                    </div>
                                </div>
                            )}

                            {outcome === 'partial' && (
                                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
                                    <p className="text-xl font-semibold text-blue-700 mb-2">
                                        Outcome: Task completed
                                    </p>
                                    <p className="text-gray-700">
                                        Your input helps them make progress on a few problem areas.
                                        <br />
                                        They don’t have immediate follow-up work, but they thank you and pay you for the time you spent.
                                    </p>
                                    <div className="text-green-700 font-semibold mt-3">
                                        + ${PARTIAL_BONUS} bonus
                                    </div>
                                </div>
                            )}

                            {outcome === 'failure' && (
                                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                                    <p className="text-xl font-semibold text-red-700 mb-2">
                                        Outcome: Task failed
                                    </p>
                                    <p className="text-gray-700">
                                        They decide to handle the remaining work internally for now.
                                        <br />
                                        You part on polite terms, but there’s no follow-up or payment beyond the original agreement.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">
                                        Next steps
                                    </label>
                                    <p className="text-gray-700">
                                        {outcome === 'success'
                                            ? 'A new income source now appears in your wallet.'
                                            : outcome === 'partial'
                                                ? 'You receive payment for this task, but there’s no further commitment.'
                                                : 'This collaboration ends here.'}
                                    </p>
                                </div>
                            </div>



                        </div>

                        <button
                            onClick={handleResultContinue}
                            className="w-full rounded-full py-4 text-lg font-semibold transition bg-blue-600 text-white hover:bg-blue-500"
                        >
                            continue
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
