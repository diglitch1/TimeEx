'use client';

import { useEffect, useMemo, useState } from 'react';
import localFont from 'next/font/local';

type Props = {
    onClose: () => void;
};
const pixelFont = localFont({
    src: '../../fonts/PixelifySans-VariableFont_wght.ttf',
});
const DIALOGUE_LINES = [
    'Welcome to Market News.',
    'Today, technology stocks are surging as investor excitement keeps building.',
    'New internet companies are going public almost every week, and prices are jumping fast.',
    'Analysts are starting to warn that valuations may be drifting away from reality.',
    'Still, for many investors, the message feels simple: this is the future.',
];

const TYPE_SPEED = 42;
const DIALOGUE_DELAY_MS = 3000;

export default function DotComFrenzyModal({ onClose }: Props) {
    const [lineIndex, setLineIndex] = useState(0);
    const [visibleText, setVisibleText] = useState('');
    const [showDialogue, setShowDialogue] = useState(false);

    const currentLine = useMemo(() => DIALOGUE_LINES[lineIndex] ?? '', [lineIndex]);
    const isTyping = showDialogue && visibleText !== currentLine;

    useEffect(() => {
        const timeout = setTimeout(() => {
            setShowDialogue(true);
        }, DIALOGUE_DELAY_MS);

        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (!showDialogue || visibleText === currentLine) return;

        const timeout = setTimeout(() => {
            setVisibleText(currentLine.slice(0, visibleText.length + 1));
        }, TYPE_SPEED);

        return () => clearTimeout(timeout);
    }, [currentLine, showDialogue, visibleText]);

    const handleDialogueAdvance = () => {
        if (!showDialogue) return;

        if (isTyping) {
            setVisibleText(currentLine);
            return;
        }

        if (lineIndex < DIALOGUE_LINES.length - 1) {
            setVisibleText('');
            setLineIndex(prev => prev + 1);
        }
    };

    const handleConfirm = () => {
        if (!dialogueFinished) return;

        localStorage.setItem(
            'dotComFrenzy',
            JSON.stringify({
                seen: true,
                date: new Date().toISOString(),
            })
        );

        onClose();
    };

    const dialogueFinished =
        showDialogue &&
        lineIndex === DIALOGUE_LINES.length - 1 &&
        !isTyping;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="news-event-modal bg-white rounded-2xl text-gray-900 shadow-xl animate-event-in">
                <h2 className="mb-3 text-center text-2xl font-bold text-red-600">
                    Dot-Com Frenzy
                </h2>

                <div className="mb-4">
                    <p className="news-event-copy mb-3">
                        The internet is exploding in popularity. New companies are going public almost
                        every week, and their stock prices skyrocket within days, even if they barely
                        make any profit.
                    </p>

                    <div className="mb-2 flex items-center gap-2 text-[14px] font-semibold text-blue-700">
                        <span className="text-lg">→</span>
                        <span className="italic tracking-wide">
                            Let’s see what our live news has to say...
                        </span>
                    </div>

                    <div className="relative ">
                        <div className="flex justify-center">
                            <img
                                src="/images/scenario-events/news-live1.jpeg"
                                alt="Live market news broadcast"
                                className="news-event-image rounded-xl"
                            />
                        </div>

                        <div
                            className={`news-dialogue absolute left-[51%] -translate-x-1/2 w-[92%] transition-all duration-900 ${
                                showDialogue
                                    ? 'opacity-100 translate-y-0'
                                    : 'opacity-0 translate-y-6 pointer-events-none'
                            }`}
                        >
                            <div className="bg-[#111111] border-4 border-[#2f2f2f] shadow-[inset_0_0_0_2px_#7a7a7a] rounded-sm overflow-hidden">
                                <div className="bg-[#1a1a1a] border-b-2 border-[#3a3a3a] px-4 py-2">
                                    <p
                                        className="news-dialogue-title text-white tracking-wide"
                                        style={{
                                            fontFamily: '"Press Start 2P", monospace',
                                            imageRendering: 'pixelated',
                                            textShadow: '2px 2px 0 #000',
                                            letterSpacing: '1px',
                                        }}
                                    >
                                        News Anchor
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleDialogueAdvance}
                                    className="news-dialogue-button w-full text-left px-4 py-3 bg-[#0b0b0b] relative"
                                >
                                    <p className={`${pixelFont.className} news-dialogue-text text-white`}>
                                        {showDialogue ? visibleText : ''}
                                    </p>

                                    <span
                                        className={`absolute bottom-3 right-4 text-white text-2xl ${
                                            isTyping ? 'opacity-30' : 'animate-bounce'
                                        }`}
                                        style={{
                                            fontFamily: '"Courier New", monospace',
                                            imageRendering: 'pixelated',
                                        }}
                                    >
                                        ▼
                                    </span>
                                </button>
                            </div>


                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="text-sm font-medium mb-2 block text-gray-700">
                        What do you want to do?
                    </label>
                    <div className="border border-gray-300 rounded-xl p-3 bg-white text-gray-800">
                        Will you follow the market hype, stay cautious, or wait and observe how the frenzy develops?
                    </div>
                </div>

                <button
                    onClick={handleConfirm}
                    disabled={!dialogueFinished}
                    className={`w-full rounded-full py-3 text-base font-semibold transition ${
                        dialogueFinished
                            ? 'bg-blue-600 text-white hover:bg-blue-500'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    continue
                </button>
            </div>
        </div>
    );
}
