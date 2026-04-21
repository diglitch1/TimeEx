'use client';

import { useEffect, useMemo, useState } from 'react';
import localFont from 'next/font/local'

type Props = {
    onClose: () => void;
};
const pixelFont = localFont({
    src: '../../fonts/PixelifySans-VariableFont_wght.ttf'
})
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
    const [isTyping, setIsTyping] = useState(false);
    const [showDialogue, setShowDialogue] = useState(false);

    const currentLine = useMemo(() => DIALOGUE_LINES[lineIndex] ?? '', [lineIndex]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setShowDialogue(true);
        }, DIALOGUE_DELAY_MS);

        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (!showDialogue) return;

        const resetTimer = window.setTimeout(() => {
            setVisibleText('');
            setIsTyping(true);
        }, 0);

        let i = 0;
        const interval = setInterval(() => {
            i += 1;
            setVisibleText(currentLine.slice(0, i));

            if (i >= currentLine.length) {
                clearInterval(interval);
                setIsTyping(false);
            }
        }, TYPE_SPEED);

        return () => {
            window.clearTimeout(resetTimer);
            clearInterval(interval);
        };
    }, [currentLine, showDialogue]);

    const handleDialogueAdvance = () => {
        if (!showDialogue) return;

        if (isTyping) {
            setVisibleText(currentLine);
            setIsTyping(false);
            return;
        }

        if (lineIndex < DIALOGUE_LINES.length - 1) {
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
            <div className="bg-white w-[980px] rounded-2xl p-12 text-gray-900 shadow-xl animate-event-in">
                <h2 className="text-2xl font-bold text-red-600 mb-4">
                    ! Dot-Com Frenzy !
                </h2>

                <div className="mb-6">
                    <p className="text-lg leading-relaxed mb-4">
                        The internet is exploding in popularity. New companies are going public almost
                        every week, and their stock prices skyrocket within days, even if they barely
                        make any profit.
                    </p>

                    <div className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-blue-700">
                        <span className="text-xl">→</span>
                        <span className="italic tracking-wide">
                            Let’s see what our live news has to say...
                        </span>
                    </div>

                    <div className="relative ">
                        <div className="flex justify-center">
                            <img
                                src="/images/scenario-events/news-live1.jpeg"
                                alt="Live market news broadcast"
                                className="w-full h-auto rounded-xl"
                            />
                        </div>

                        <div
                            className={`absolute left-[51%] -translate-x-1/2 bottom-2 w-[92%] transition-all duration-900 ${
                                showDialogue
                                    ? 'opacity-100 translate-y-0'
                                    : 'opacity-0 translate-y-6 pointer-events-none'
                            }`}
                        >
                            <div className="bg-[#111111] border-4 border-[#2f2f2f] shadow-[inset_0_0_0_2px_#7a7a7a] rounded-sm overflow-hidden">
                                <div className="bg-[#1a1a1a] border-b-2 border-[#3a3a3a] px-4 py-2">
                                    <p
                                        className="text-white text-xl tracking-wide"
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
                                    className="w-full text-left px-4 py-2 bg-[#0b0b0b] min-h-[150px] relative"
                                >
                                    <p className={`${pixelFont.className} text-white text-[30px] leading-[1.6]`}>
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

                <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block text-gray-700">
                        What do you want to do?
                    </label>
                    <div className="border border-gray-300 rounded-xl p-4 bg-white text-gray-800">
                        Will you follow the market hype, stay cautious, or wait and observe how the frenzy develops?
                    </div>
                </div>

                <button
                    onClick={handleConfirm}
                    disabled={!dialogueFinished}
                    className={`w-full rounded-full py-4 text-lg font-semibold transition ${
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
