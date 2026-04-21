'use client';

type Props = {
    reason: string;
    onReturnHome: () => void;
};

export default function GameOverModal({ reason, onReturnHome }: Props) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 px-6">
            <div className="w-full max-w-xl rounded-[28px] border border-red-200 bg-white p-8 shadow-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-500">
                    Run Ended
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                    Game Over
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-600">
                    {reason}
                </p>
                <p className="mt-3 text-sm text-slate-500">
                    Return to the home screen to start a new simulation.
                </p>

                <button
                    type="button"
                    onClick={onReturnHome}
                    className="mt-8 w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                    Return Home
                </button>
            </div>
        </div>
    );
}
