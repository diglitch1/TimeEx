'use client';

import { useMemo } from 'react';

type ConfettiPiece = {
    left: number;
    delay: number;
    duration: number;
    size: number;
    rotate: number;
    color: string;
    drift: number;
};

const CONFETTI_COLORS = ['#5FA8F5', '#BFE0FF', '#D9EEFF', '#93C5FD', '#FDE68A'];

export default function EndGameOverlay({
    visible,
}: {
    visible: boolean;
}) {
    const pieces = useMemo<ConfettiPiece[]>(
        () =>
            Array.from({ length: 28 }, (_, index) => ({
                left: (index / 28) * 100 + ((index % 3) - 1) * 1.4,
                delay: (index % 7) * 0.14,
                duration: 2.9 + (index % 5) * 0.35,
                size: 8 + (index % 4) * 4,
                rotate: (index * 31) % 360,
                color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
                drift: ((index % 2 === 0 ? 1 : -1) * (24 + (index % 5) * 12)),
            })),
        []
    );

    return (
        <div
            className={`fixed inset-0 z-[120] flex items-center justify-center overflow-hidden transition-all duration-700 ${
                visible ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
        >
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(234,244,255,0.72)_0%,rgba(247,250,252,0.94)_44%,rgba(255,255,255,0.98)_100%)] backdrop-blur-sm" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(95,168,245,0.18),transparent_52%)]" />

            {pieces.map((piece, index) => (
                <span
                    key={`${piece.left}-${index}`}
                    className={`absolute top-[-12%] rounded-sm shadow-[0_6px_14px_rgba(95,168,245,0.22)] ${
                        visible ? 'animate-[timeex-confetti_var(--duration)_ease-in_forwards]' : ''
                    }`}
                    style={{
                        left: `${piece.left}%`,
                        width: `${piece.size}px`,
                        height: `${Math.max(10, piece.size * 1.7)}px`,
                        backgroundColor: piece.color,
                        transform: `rotate(${piece.rotate}deg)`,
                        animationDelay: `${piece.delay}s`,
                        ['--duration' as string]: `${piece.duration}s`,
                        ['--drift' as string]: `${piece.drift}px`,
                    }}
                />
            ))}

            <div
                className={`relative rounded-[36px] border border-[#CFE3F8] bg-white/72 px-10 py-10 text-center shadow-[0_26px_70px_rgba(15,23,42,0.10)] backdrop-blur-md transition-all duration-700 ${
                    visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-6 scale-95 opacity-0'
                }`}
            >
                <p className="text-xs font-semibold uppercase tracking-[0.5em] text-[#1E6FBF]">
                    TimeEx
                </p>
                <h1 className="mt-5 text-5xl font-black uppercase tracking-[0.32em] text-[#0A355B] md:text-7xl">
                    Game Over
                </h1>
                <p className="mt-5 text-sm font-medium text-[#335B7E] md:text-base">
                    The timeline has reached its final chapter.
                </p>
            </div>

            <style jsx>{`
                @keyframes timeex-confetti {
                    0% {
                        transform: translate3d(0, 0, 0) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    100% {
                        transform: translate3d(var(--drift), 120vh, 0) rotate(560deg);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
}
