'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const CHARACTER_SELECTION_SOURCE_KEY = 'timeex:selection-source';

export default function LandingPage() {
    const router = useRouter();
    const [clicked, setClicked] = useState(false);

    const handlePlay = () => {
        setClicked(true);
        localStorage.setItem(CHARACTER_SELECTION_SOURCE_KEY, 'landing');
        setTimeout(() => {
            router.push('/character');
        }, 850);
    };

    return (
        <main className={`landing ${clicked ? 'slide-out' : ''}`}>
            {/* BACKGROUND */}
            <div className="bg" />
            <div className="fade-layer" />

            {/* CONTENT */}
            <div className="content">
                <img src="/images/Logo_sep.png" alt="TimeEx logo" className="logo" />
                <img src="/images/TEXT.png" alt="TimeEx title" className="title" />

                {/* TIMELINE */}
                <div className="timeline-wrap">
                    <div className="timeline-line" />
                    <div className="timeline">
                        {Array.from({ length: 60 }).map((_, i) => {
                            const year = 1980 + (i % 30);
                            const major = i % 5 === 0;

                            return (
                                <div key={i} className={`tick ${major ? 'major' : 'minor'}`}>
                                    {major && <span className="year">{year}</span>}
                                    <div className="bar" />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* PLAY BUTTON */}
                <button onClick={handlePlay} className="play" aria-label="Play">
                    <img src="/images/Button.png" alt="Play button" />
                </button>
            </div>

            {/* CREDITS */}
            <div className="credits">
                <div>HTL Spengergasse</div>
                <div>Anastasiia Chaban · Lara Kordic · Divyanshi Gupta</div>
            </div>

            {/* STYLES */}
            <style jsx>{`
                .landing {
                    position: relative;
                    width: 100%;
                    min-height: 100vh;
                    min-height: 100svh;
                    overflow: hidden;
                    background: black;
                }

                .bg {
                    position: absolute;
                    inset: 0;
                    background-image: url('/images/theIMAGE.jpeg');
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    animation: drift 55s linear infinite;
                }

                @keyframes drift {
                    0% { background-position: 0% 0%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 0%; }
                }

                .content {
                    position: relative;
                    z-index: 10;
                    min-height: 100vh;
                    min-height: 100svh;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: clamp(8px, 1.7svh, 18px);
                    padding: clamp(18px, 3svh, 42px) 24px clamp(88px, 13svh, 124px);
                }

                .logo {
                    width: clamp(145px, 24svh, 280px);
                    image-rendering: pixelated;
                    animation: float 4s ease-in-out infinite;
                }

                @keyframes float {
                    0% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0); }
                }

                .title {
                    width: clamp(340px, min(52vw, 58svh), 650px);
                    image-rendering: pixelated;
                    margin-top: clamp(-8px, -1svh, -4px);
                }

                .play {
                    background: none;
                    border: none;
                    padding: 0;
                    cursor: pointer;
                    margin-top: clamp(4px, 1svh, 12px);
                    flex: 0 0 auto;
                }

                .play img {
                    width: clamp(220px, min(30vw, 38svh), 340px);
                    image-rendering: pixelated;
                    transition: filter 0.15s ease, transform 0.15s ease;
                }

                .play:hover img {
                    filter: brightness(0.8);
                    transform: translateY(2px) scale(0.99);
                }

                .play:active img {
                    filter: brightness(0.72);
                    transform: translateY(4px) scale(0.985);
                }

                /* TIMELINE */
                .timeline-wrap {
                    position: relative;
                    width: min(82vw, 1000px);
                    max-width: 1000px;
                    height: clamp(46px, 8svh, 70px);
                    overflow: hidden;
                    margin: clamp(6px, 1.5svh, 14px) 0 clamp(4px, 1.2svh, 12px);
                    mask-image: linear-gradient(
                        to right,
                        transparent,
                        black 12%,
                        black 88%,
                        transparent
                    );
                }

                .timeline-line {
                    position: absolute;
                    top: 50%;
                    width: 200%;
                    height: 2px;
                    background: linear-gradient(
                        to right,
                        rgba(120,180,255,0.2),
                        rgba(160,210,255,0.6),
                        rgba(120,180,255,0.2)
                    );
                    transform: translateY(-50%);
                }

                .timeline {
                    position: absolute;
                    top: 50%;
                    display: flex;
                    gap: clamp(28px, 4vw, 48px);
                    transform: translateY(-50%);
                    animation: timelineDrift 60s linear infinite;
                }

                @keyframes timelineDrift {
                    from { transform: translateY(-50%) translateX(0); }
                    to { transform: translateY(-50%) translateX(-50%); }
                }

                .tick {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .tick.major .year {
                    font-family: monospace;
                    font-size: clamp(11px, 1.7svh, 14px);
                    color: rgba(190,225,255,0.95);
                    margin-bottom: clamp(3px, 0.8svh, 6px);
                }

                .bar {
                    width: 2px;
                    background: rgba(180,220,255,0.8);
                }

                .tick.major .bar { height: 22px; }
                .tick.minor .bar { height: 10px; opacity: 0.45; }

                /* FADE OUT */
                .fade-layer {
                    position: absolute;
                    inset: 0;
                    background: white;
                    opacity: 0;
                    pointer-events: none;
                    z-index: 5;
                }

                .slide-out .fade-layer {
                    animation: fadeToWhite 0.9s ease forwards;
                }

                @keyframes fadeToWhite {
                    to { opacity: 1; }
                }

                .slide-out .content {
                    animation: slideUpFade 0.9s ease forwards;
                }

                @keyframes slideUpFade {
                    to {
                        transform: translateY(-160px);
                        opacity: 0;
                    }
                }

                .slide-out .bg {
                    animation: bgFade 0.9s ease forwards;
                }

                @keyframes bgFade {
                    to { filter: brightness(0.6); }
                }

                .credits {
                    position: absolute;
                    bottom: clamp(12px, 2.4svh, 22px);
                    width: 100%;
                    box-sizing: border-box;
                    padding: 0 24px;
                    text-align: center;
                    font-size: clamp(12px, 1.9svh, 17px);
                    line-height: 1.35;
                    color: white;
                    z-index: 6;
                }
            `}</style>
        </main>
    );
}
