'use client';

import { useEffect, useState } from 'react';
import type { WalletItem } from '../../utils/walletData';

type Props = {
    wallet: WalletItem[];
    setWallet: React.Dispatch<React.SetStateAction<WalletItem[]>>;
    onClose: () => void;
};
type InterviewAnswer = { text: string; score: number };
type InterviewQuestion = { question: string; answers: InterviewAnswer[] };

const INTERVIEW: InterviewQuestion[] = [
    {
        question: 'Why do you want to study at our university?',
        answers: [
            { text: 'I want to grow academically and personally.', score: 2 },
            { text: 'It aligns well with my long-term goals.', score: 1 },
            { text: 'It seemed like a good opportunity.', score: 0 },
            { text: 'It has a strong reputation.', score: 0 },
        ],
    },
    {
        question: 'How do you handle pressure?',
        answers: [
            { text: 'I stay calm and break problems down.', score: 2 },
            { text: 'I push through and adapt.', score: 1 },
            { text: 'I rely on others for support.', score: 1 },
            { text: 'I avoid stressful situations.', score: 0 },
        ],
    },
    {
        question: 'What matters most to you in your studies?',
        answers: [
            { text: 'Learning deeply and understanding concepts.', score: 2 },
            { text: 'Career opportunities after graduation.', score: 1 },
            { text: 'Grades and exams.', score: 0 },
            { text: 'Keeping options open.', score: 0 },
        ],
    },
    {
        question: 'How do you approach difficult feedback?',
        answers: [
            { text: 'I reflect and improve.', score: 2 },
            { text: 'I accept it and move on.', score: 1 },
            { text: 'I find it discouraging.', score: 0 },
            { text: 'I usually ignore it.', score: 0 },
        ],
    },
];

const FALLBACK_SCHOOL = 'State University';



const IMG_CLOSED = '/images/events/laptop-closed.png';
const IMG_HALF = '/images/events/laptop-half.png';
const IMG_OPEN = '/images/events/laptop-open.png';
const IMG_DESKTOP = '/images/events/desktop.png';
const IMG_INTERVIEWER = '/images/events/man.png';
const IMG_ACCEPTED_GREEN = '/images/events/accepted_green.png';
const IMG_ACCEPTED_BLUE = '/images/events/accepted_blue.png';
const IMG_DECLINED_RED = '/images/events/declined_red.png';

export default function CollegeResultsModal({ wallet, setWallet, onClose }: Props) {
    let application: {
        schoolName: string;
        type: 'elite' | 'regular';
        logo?: string;
    } | null = null;

    try {
        const raw =
            typeof window !== 'undefined'
                ? localStorage.getItem('collegeApplication')
                : null;

        application = raw ? JSON.parse(raw) : null;
    } catch {
        application = null;
    }

    const schoolName = application?.schoolName ?? 'University';
    const isElite = application?.type === 'elite';
    const TUITION_FEE = 1200;

    const deductTuition = () => {
        setWallet(prev =>
            prev.map(item =>
                item.id === 'cash'
                    ? {
                        ...item,
                        usdValue: Math.max(0, item.usdValue - TUITION_FEE),
                        units: Math.max(0, item.units - TUITION_FEE),
                    }
                    : item
            )
        );
    };

    const [stage, setStage] = useState<
        'laptop-closed' |
        'laptop-half' |
        'laptop-open' |
        'zoom' |
        'desktop' |
        'email' |
        'interview-fade' |
        'interview' |
        'result'
    >('laptop-closed');

    const [mailOpened, setMailOpened] = useState(false);
    const [answers, setAnswers] = useState<number[]>([]);
    const [outcome, setOutcome] = useState<string | null>(null);

    /* ---------- TIMING ---------- */

    useEffect(() => {
        if (stage !== 'laptop-half') return;
        const t = setTimeout(() => setStage('laptop-open'), 1000);
        return () => clearTimeout(t);
    }, [stage]);

    useEffect(() => {
        if (stage !== 'zoom') return;
        const t = setTimeout(() => setStage('desktop'), 720);
        return () => clearTimeout(t);
    }, [stage]);
    useEffect(() => {
        if (stage !== 'interview-fade') return;
        const t = setTimeout(() => setStage('interview'), 600);
        return () => clearTimeout(t);
    }, [stage]);

    /* ---------- INTERVIEW ---------- */

    const handleAnswer = (score: number) => {
        const updated = [...answers, score];
        setAnswers(updated);

        if (updated.length === INTERVIEW.length) {
            const total = updated.reduce((a, b) => a + b, 0);

            let result: string;
            if (total >= 6) result = 'accepted-flying';
            else if (total >= 4) result = 'accepted';
            else result = 'fallback';

            localStorage.setItem(
                'collegeResult',
                JSON.stringify({
                    result,
                    fallback: result === 'fallback' ? FALLBACK_SCHOOL : null,
                })
            );

            setOutcome(result);

            if (result === 'accepted') {
                deductTuition();
            }

            setStage('result');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-[900px] min-h-[560px] rounded-2xl p-8 shadow-xl relative">

                {/* LOGO */}
                {application?.logo && (
                    <img
                        src={application.logo}
                        className="absolute top-6 right-6 h-12 object-contain"
                        draggable={false}
                    />
                )}

                {/* ---------- HEADER / STORY ---------- */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-red-600">
                        ! College Results !
                    </h2>

                    {[
                        'laptop-closed',
                        'laptop-half',
                        'laptop-open',
                        'zoom',
                    ].includes(stage) && (
                        <p className="mt-2 text-l text-gray-800 max-w-[720px]">
                            Today is finally the day. After weeks of waiting, refreshing your inbox,
                            and imagining every possible outcome, your college application results
                            have arrived.
                            <br />
                            <span className="text-gray-600">
                Take a deep breath… and check your email.
            </span>
                        </p>
                    )}
                </div>

                {/* ---------- LAPTOP / DESKTOP ---------- */}
                {['laptop-closed', 'laptop-half', 'laptop-open', 'zoom', 'desktop', 'email'].includes(stage) && (
                    <div className="flex justify-center mt-6">
                        <div className="relative w-[740px] h-[360px]">

                            {/* CLOSED */}
                            <img
                                src={IMG_CLOSED}
                                onClick={() => stage === 'laptop-closed' && setStage('laptop-half')}
                                className={`absolute inset-0 mx-auto max-h-[340px] object-contain transition-opacity
                                    ${stage === 'laptop-closed' ? 'opacity-100 cursor-pointer' : 'opacity-0 pointer-events-none'}
                                `}
                            />

                            {/* HALF */}
                            <img
                                src={IMG_HALF}
                                className={`absolute inset-0 mx-auto max-h-[340px] object-contain transition-opacity
                                    ${stage === 'laptop-half' ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                                `}
                            />

                            {/* OPEN */}
                            <img
                                src={IMG_OPEN}
                                onClick={() => stage === 'laptop-open' && setStage('zoom')}
                                className={`absolute inset-0 mx-auto max-h-[340px] object-contain transition-opacity
                                    ${stage === 'laptop-open' ? 'opacity-100 cursor-pointer' : 'opacity-0 pointer-events-none'}
                                `}
                            />

                            {/* ZOOM */}
                            <img
                                src={IMG_OPEN}
                                className={`absolute inset-0 mx-auto max-h-[340px] object-contain animate-zoom-screen
                                    ${stage === 'zoom' ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                                `}
                            />

                            {/* DESKTOP */}
                            {(stage === 'desktop' || stage === 'email') && (
                                <div className="absolute inset-0 flex justify-center">
                                    <div className="relative w-[700px]">
                                        <img
                                            src={IMG_DESKTOP}
                                            className="w-full rounded-xl border"
                                            draggable={false}
                                        />

                                        {/* MAIL ICON */}
                                        <button
                                            onClick={() => setStage('email')}
                                            className="absolute"
                                            style={{ left: 40, top: 200, width: 90, height: 90 }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ---------- EMAIL OVERLAY (NO DESKTOP DUPLICATION) ---------- */}
                {stage === 'email' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="pointer-events-auto animate-email-pop bg-white w-[560px] h-[290px] rounded-xl shadow-2xl border flex overflow-hidden">

                            {/* INBOX */}
                            <div className="w-[220px] bg-gradient-to-b from-blue-50 to-white border-r">
                                <div className="px-4 py-3 font-semibold text-sm text-blue-700 border-b">
                                    Inbox
                                </div>
                                <button
                                    onClick={() => setMailOpened(true)}
                                    className={`
            w-full text-left px-4 py-3 transition
            ${!mailOpened
                                        ? 'bg-blue-100 text-blue-800 font-semibold'
                                        : 'hover:bg-blue-50'}
          `}
                                >
                                    <div className="flex items-center justify-between">
            <span className="text-sm truncate">
              {application?.schoolName ?? 'University'}
            </span>

                                        {!mailOpened && (
                                            <span className="h-2 w-2 rounded-full bg-blue-600" />
                                        )}
                                    </div>

                                    {!mailOpened && (
                                        <div className="text-xs text-blue-600 mt-1">
                                            Unread
                                        </div>
                                    )}
                                </button>
                            </div>

                            {/* MAIL CONTENT */}
                            <div className="flex-1 p-6 flex flex-col">
                                {!mailOpened && (
                                    <p className="text-gray-400 italic text-sm">
                                        Select an email to read.
                                    </p>
                                )}

                                {mailOpened && (
                                    <>
                                        <div className="mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {!isElite ? 'Admission Decision' : 'Application Update'}
                                            </h3>

                                            <p className="text-xs text-gray-500 mt-1">
                                                From: admissions@
                                                {schoolName.toLowerCase().replace(/\s/g, '')}
                                                .edu
                                            </p>

                                            <p className="text-xs text-gray-400">
                                                Received today
                                            </p>
                                        </div>

                                        <div className="flex-1 text-gray-800 leading-relaxed text-sm">
                                            {!isElite && (
                                                <>
                                                    <p className="mb-4">Congratulations!</p>
                                                    <p>
                                                        We are pleased to inform you that you have been accepted
                                                        into <strong>{schoolName}</strong>.
                                                    </p>
                                                </>
                                            )}

                                            {isElite && (
                                                <>
                                                    <p className="mb-4">
                                                        Thank you for your interest in <strong>{schoolName}</strong>.
                                                    </p>
                                                    <p>
                                                        We would like to invite you to an interview.
                                                    </p>
                                                </>
                                            )}
                                        </div>

                                        <div className="pt-4">
                                            {!isElite ? (
                                                <button
                                                    onClick={onClose}
                                                    className="px-6 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-500 transition"
                                                >
                                                    continue
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setStage('interview')}
                                                    className="px-6 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-500 transition"
                                                >
                                                    accept interview
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ---------- FADE ---------- */}
                {stage === 'interview-fade' && (
                    <div className="fixed inset-0 bg-black animate-fade-in" />
                )}

                {/* ---------- INTERVIEW ---------- */}
                {stage === 'interview' && (
                    <div className="mt-6 flex flex-col items-center animate-fade-in">
                        <div className="w-full max-w-[760px] mb-4">
                            <p className="text-base font-medium text-gray-700">
                                A short time later, you join an online interview.
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                This conversation will help determine your admission.
                            </p>
                        </div>
                        <img src={IMG_INTERVIEWER} className="h-[350px] mb-6" />

                        <div className="w-full max-w-[760px] bg-gradient-to-b from-white to-blue-50 border border-blue-300 rounded-2xl shadow-lg p-6">
                            <p className="font-semibold text-lg text-blue-900 mb-6">
                                {INTERVIEW[answers.length].question}
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                {INTERVIEW[answers.length].answers.map(a => {
                                    const colorClass =
                                        a.score === 2
                                            ? 'border-blue-200 bg-white text-blue-800 hover:bg-blue-50'
                                            : a.score === 1
                                                ? 'border-blue-200 bg-white text-blue-800 hover:bg-blue-50'
                                                : 'border-blue-200 bg-white text-blue-800 hover:bg-blue-50';

                                    return (
                                        <button
                                            key={a.text}
                                            onClick={() => handleAnswer(a.score)}
                                            className={`
                    rounded-xl py-4 px-4 text-left transition
                    border ${colorClass}
                `}
                                        >
                                            {a.text}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}


                {/* ---------- RESULT ---------- */}
                {stage === 'result' && (
                    <div className="mt-8 flex flex-col items-center gap-6 animate-fade-in">

                        {/* RESULT STAMP */}
                        <img
                            src={
                                outcome === 'accepted-flying'
                                    ? IMG_ACCEPTED_GREEN
                                    : outcome === 'accepted'
                                        ? IMG_ACCEPTED_BLUE
                                        : IMG_DECLINED_RED
                            }
                            alt="result"
                            className="h-[120px]"
                            draggable={false}
                        />

                        {/* RESULT PANEL */}
                        <div className="w-full max-w-[760px] bg-gradient-to-b from-white to-blue-50 border border-blue-300 rounded-2xl shadow-lg p-6 text-center">

                            {/* TEXT */}
                            {outcome === 'accepted-flying' && (
                                <>
                                    <p className="text-lg font-semibold text-green-700 mb-2">
                                        Accepted with flying colors
                                    </p>
                                    <p className="text-gray-700">
                                        You have been awarded a full scholarship.
                                        <br />
                                        No tuition fees are required.
                                    </p>
                                </>
                            )}

                            {outcome === 'accepted' && (
                                <>
                                    <p className="text-lg font-semibold text-blue-700 mb-2">
                                        Accepted
                                    </p>
                                    <p className="text-gray-700 mb-4">
                                        You have been accepted into <strong>{schoolName}</strong>.
                                        <br />
                                        Tuition fees apply.
                                    </p>

                                    {/* Tuition deduction (same pattern as other events) */}
                                    <div className="text-red-600 font-semibold mb-2">
                                        − $1,200 tuition fee
                                    </div>
                                </>
                            )}

                            {outcome === 'fallback' && (
                                <>
                                    <p className="text-lg font-semibold text-red-700 mb-2">
                                        Application declined
                                    </p>
                                    <p className="text-gray-700">
                                        You were not accepted into <strong>{schoolName}</strong>.
                                        <br />
                                        However, you received an offer from{' '}
                                        <strong>
                                            {JSON.parse(localStorage.getItem('collegeResult') || '{}')
                                                .fallback}
                                        </strong>.
                                    </p>
                                </>
                            )}

                            {/* CONTINUE */}
                            <button
                                onClick={onClose}
                                className="mt-6 w-full rounded-full py-3 bg-blue-600 text-white hover:bg-blue-500 transition"
                            >
                                continue
                            </button>
                        </div>
                    </div>
                )}


                {/* ---------- ANIMATIONS ---------- */}
                <style jsx global>{`
                    @keyframes zoomScreen {
                        from { transform: scale(1); }
                        to { transform: scale(1.18); }
                    }
                    .animate-zoom-screen {
                        animation: zoomScreen 520ms ease-in-out forwards;
                    }

                    @keyframes emailPop {
                        from { transform: scale(0.92); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                    }
                    .animate-email-pop {
                        animation: emailPop 280ms ease-out forwards;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    .animate-fade-in {
                        animation: fadeIn 400ms ease-out forwards;
                    }

                `}</style>
            </div>
        </div>
    );
}
