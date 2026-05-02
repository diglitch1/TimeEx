'use client';

import { useEffect, useMemo, useState } from 'react';
import localFont from 'next/font/local';

type FinancialCrisisNewsVariant = 'subprime-lender-collapse' | 'banking-crisis-deepens';

type Props = {
    variant: FinancialCrisisNewsVariant;
    onClose: () => void;
};

const pixelFont = localFont({
    src: '../../fonts/PixelifySans-VariableFont_wght.ttf',
});

const NEWS_CONFIG: Record<
    FinancialCrisisNewsVariant,
    {
        title: string;
        copy: string;
        impactLabel: string;
        impactText: string;
        imageSrc: string;
        imageAlt: string;
        storageKey: string;
        dialogueLines: string[];
    }
> = {
    'subprime-lender-collapse': {
        title: 'Subprime Lender Collapse',
        copy: 'Mortgage stress is moving from warning signs into visible damage. Defaults are rising, lenders are failing, and investors are starting to question the strength of the housing market.',
        impactLabel: 'Market impact',
        impactText: 'Banks and mortgage-linked assets are under pressure as risky home loans begin turning into real losses.',
        imageSrc: '/images/Global-financial-crisis/news/newsMarch.png',
        imageAlt: 'Live news broadcast about subprime lenders collapsing',
        storageKey: 'subprimeLenderCollapseNews',
        dialogueLines: [
            'Breaking news: Subprime mortgage lenders are beginning to collapse.',
            'Rising defaults are exposing cracks in the U.S. housing market.',
            'Banks face growing losses tied to risky home loans.',
            'Investors are now questioning the stability of financial institutions.',
        ],
    },
    'banking-crisis-deepens': {
        title: 'Banking Crisis Deepens',
        copy: 'The financial crisis is no longer contained to housing. After the shock from major bank failures, governments are expanding rescue efforts to keep the system from freezing completely.',
        impactLabel: 'Market impact',
        impactText: 'Credit remains tight, confidence is low, and financial institutions are struggling to survive the peak of the crisis.',
        imageSrc: '/images/Global-financial-crisis/news/newsNovember.png',
        imageAlt: 'Live news broadcast about the global financial crisis deepening',
        storageKey: 'bankingCrisisDeepensNews',
        dialogueLines: [
            'Breaking news: The global financial crisis is deepening as banks struggle to survive.',
            'Governments are expanding bailouts to stabilize collapsing institutions.',
            'Credit markets remain frozen, slowing economic activity worldwide.',
            'Confidence in the financial system has fallen to historic lows.',
        ],
    },
};

const TYPE_SPEED = 42;
const DIALOGUE_DELAY_MS = 3000;

export default function FinancialCrisisNewsModal({ variant, onClose }: Props) {
    const config = NEWS_CONFIG[variant];
    const [lineIndex, setLineIndex] = useState(0);
    const [visibleText, setVisibleText] = useState('');
    const [showDialogue, setShowDialogue] = useState(false);

    const currentLine = useMemo(
        () => config.dialogueLines[lineIndex] ?? '',
        [config.dialogueLines, lineIndex]
    );
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

        if (lineIndex < config.dialogueLines.length - 1) {
            setVisibleText('');
            setLineIndex(prev => prev + 1);
        }
    };

    const dialogueFinished =
        showDialogue &&
        lineIndex === config.dialogueLines.length - 1 &&
        !isTyping;

    const handleConfirm = () => {
        if (!dialogueFinished) return;

        localStorage.setItem(
            config.storageKey,
            JSON.stringify({
                seen: true,
                date: new Date().toISOString(),
            })
        );

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="news-event-modal bg-white rounded-2xl text-gray-900 shadow-xl animate-event-in">
                <h2 className="mb-3 text-center text-2xl font-bold text-red-600">
                    {config.title}
                </h2>

                <div className="mb-4">
                    <p className="news-event-copy mb-3">
                        {config.copy}
                    </p>

                    <div className="mb-2 flex items-center gap-2 text-[14px] font-semibold text-blue-700">
                        <span className="text-lg">&rarr;</span>
                        <span className="italic tracking-wide">
                            Let&apos;s see what our live news has to say...
                        </span>
                    </div>

                    <div className="relative">
                        <div className="news-event-frame flex justify-center">
                            <img
                                src={config.imageSrc}
                                alt={config.imageAlt}
                                className="news-event-image"
                            />
                        </div>

                        <div
                            className={`news-dialogue absolute left-[51%] -translate-x-1/2 w-[92%] transition-all duration-900 ${
                                showDialogue
                                    ? 'opacity-100 translate-y-0'
                                    : 'opacity-0 translate-y-6 pointer-events-none'
                            }`}
                        >
                            <div className="news-dialogue-panel bg-[#111111] border-4 border-[#2f2f2f] shadow-[inset_0_0_0_2px_#7a7a7a] overflow-hidden">
                                <div className="news-dialogue-heading bg-[#1a1a1a] border-b-2 border-[#3a3a3a] px-4 py-2">
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
                                        &#9660;
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="text-sm font-medium mb-2 block text-gray-700">
                        {config.impactLabel}
                    </label>
                    <div className="border border-gray-300 rounded-xl p-3 bg-white text-gray-800">
                        {config.impactText}
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
