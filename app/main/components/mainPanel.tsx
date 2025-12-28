'use client';

import { useState, useEffect} from 'react';

export default function MainTradePanel() {

    const timelineDates = [
        new Date("2000-03-06"),
        new Date("2000-03-21"),
        new Date("2000-03-25"),
        new Date("2000-04-14"),
        new Date("2000-04-20"),
        new Date("2000-05-03"),
        new Date("2000-06-27"),
        new Date("2000-07-02"),
        new Date("2000-07-13"),
        new Date("2000-07-16"),
        new Date("2000-07-15"),
        new Date("2000-07-19")
    ];

    const TOTAL_SECONDS = 12 * 60; // 12 minutes

    const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentDate, setCurrentDate] = useState(timelineDates[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev === 1) {
                    setCurrentIndex(i => {
                        const nextIndex = i + 1;

                        if (nextIndex < timelineDates.length) {
                            setCurrentDate(timelineDates[nextIndex]);
                            return nextIndex;
                        }

                        clearInterval(interval);
                        return i;
                    });

                    return TOTAL_SECONDS;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // how many real seconds have passed in this 12-min round
    const elapsedSeconds = TOTAL_SECONDS - secondsLeft;

    // 30 real seconds = 1 in-game hour
    const gameHour = Math.min(
        Math.floor(elapsedSeconds / 30),
        23
    );

    // format HH:00
    const gameTime = `${gameHour.toString().padStart(2, '0')}:00`;

    // date WITHOUT time
    const gameDate = currentDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });


    return (
        <div className="flex-1 w-full bg-white px-10 py-8">

            {/* TIME INFO */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <p className="text-lg text-gray-800">
                        Time now:{' '}
                        <span className="font-semibold">{gameDate} at {gameTime}</span>
                    </p>


                    <p className={`text-xl font-semibold ${secondsLeft <= 180 ? 'text-red-500' : 'text-green-600'}`}>
                        Time remaining: {minutes}:{seconds.toString().padStart(2, '0')}
                    </p>
                </div>

                <button
                    className="w-14 h-14 rounded-full bg-[#e6f0ff] flex items-center justify-center border border-blue-200 hover:bg-blue-100 transition cursor-pointer">
                    <img src="/bell.png" alt="Notifications" className="w-10 h-10"/>
                </button>
            </div>

        </div>
    );

}

// mini graph in assets carousel
function MiniSparkline({data, positive,}: {
    data: number[];
    positive: boolean;
}) {
    const max = Math.max(...data);
    const min = Math.min(...data);

    const points = data
        .map((v, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((v - min) / (max - min)) * 100;
            return `${x},${y}`;
        })
        .join(' ');

    return (
        <svg
            viewBox="0 0 100 100"
            className="w-16 h-8"
            preserveAspectRatio="none"
        >
            <polyline
                points={points}
                fill="none"
                stroke={positive ? '#22c55e' : '#ef4444'}
                strokeWidth="3"
                strokeLinecap="round"
            />
        </svg>
    );
}

// picked asset chart
function FakeChart({data, positive,}: {
    data: number[];
    positive: boolean;
}) {
    if (!data || data.length === 0) {
        return null;
    }

    const max = Math.max(...data);
    const min = Math.min(...data);


    const padding = (max - min) * 0.15;
    const safeMax = max + padding;
    const safeMin = min - padding;

    const points = data
        .map((v, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y =
                100 - ((v - safeMin) / (safeMax - safeMin)) * 100;
            return `${x},${y}`;
        })
        .join(' ');

    return (
        <svg
            suppressHydrationWarning
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ display: 'block' }}
        >
            <polyline
                points={points}
                fill="none"
                stroke={positive ? '#22c55e' : '#ef4444'}
                strokeWidth="0.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
