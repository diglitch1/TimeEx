'use client';

import { useRouter } from 'next/navigation';

export default function LandingPage() {
    const router = useRouter();

    return (
        <main
            className="min-h-screen flex flex-col items-center justify-center px-6"
            style={{ backgroundColor: "#CCE7FF" }}
        >
            <h1 className="text-5xl font-bold mb-6 text-[#0A355B]">
                TimeEx
            </h1>

            <p className="max-w-xl text-center text-lg mb-12 text-[#0A355B]">
                TimeEx is a financial time-travel simulation game where you step into
                different historical eras and crises. Make investment decisions,
                manage risk, and see how your choices shape your financial future.
            </p>

            <button
                onClick={() => {
                    localStorage.setItem('gameStarted', 'true');
                    router.push('/character');
                }}
                className="
                    px-14 py-5
                    rounded-2xl
                    font-semibold
                    text-xl
                    shadow-lg
                    transition-all
                    duration-300
                    ease-out
                    hover:scale-110
                    hover:-translate-y-1
                    active:scale-105
                "
                style={{
                    backgroundColor: "#FFFFFF",
                    color: "#0A355B",
                }}
            >
                Play
            </button>
        </main>
    );
}
