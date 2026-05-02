'use client';

import { useEffect, useMemo, useState } from 'react';
import localFont from 'next/font/local';

type Props = {
    onClose: () => void;
};

type Stage = 'waiting' | 'interview' | 'checklist' | 'letter' | 'finalVisual';
type Panelist = 'HR Officer' | 'Medical Officer' | 'Training Director';

type AnswerOption = {
    text: string;
    weight: number;
    tone: 'positive' | 'neutral' | 'negative';
};

type InterviewQuestion = {
    panelist: Panelist;
    question: string;
    options: AnswerOption[];
};

type ChecklistItem = {
    label: string;
    passed: boolean;
    detailTitle: string;
    detail: string;
};

const pixelFont = localFont({
    src: '../../fonts/PixelifySans-VariableFont_wght.ttf',
});

const WAITING_ROOM_IMAGE = '/images/COVID-19-PANDEMIC/events/waiting-room.png';
const INTERVIEW_IMAGE = '/images/COVID-19-PANDEMIC/events/interview.png';
const FINAL_OUTCOME_IMAGES = {
    accepted: '/images/COVID-19-PANDEMIC/events/accepted.png',
    waitlist: '/images/COVID-19-PANDEMIC/events/waiting.png',
    declined: '/images/COVID-19-PANDEMIC/events/declined.png',
};
const AIRLINE_LOGO = '/images/COVID-19-PANDEMIC/icons/logo.png';
const CLOCK_GIF_ICON = '/images/COVID-19-PANDEMIC/icons/clock.gif';
const CLOCK_STATIC_ICON = '/images/COVID-19-PANDEMIC/icons/clock.png';
const ALERT_ICON = '/images/COVID-19-PANDEMIC/icons/!.png';

const WAITING_START_SECONDS = 12 * 60;
const WAITING_STEP_SECONDS = 12;
const WAITING_TICK_MS = 45;
const TYPE_SPEED_MS = 28;
const CHECKLIST_STEP_MS = 850;

const TIMER_TEXT_CONTROLS = {
    // Manual position controls for the waiting-room countdown text.
    x: 55,
    y: 15,
};

const CLOCK_CONTROLS = {
    // Manual position and size controls for clock.gif / clock.png in waiting-room.png.
    x: 55,
    y: 30,
    widthRem: 5.8,
    heightRem: 5.8,
};

const ALERT_CONTROLS = {
    // Manual position and size controls for !.png beside the door in waiting-room.png.
    x: 84.5,
    y: 25,
    widthRem: 5,
    heightRem: 5,
};

function formatCountdown(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function readStoredJson<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
    } catch {
        return null;
    }
}

function getApplicationHistory() {
    const covidTest = readStoredJson<{
        result?: string;
        reportedImmediately?: boolean;
        delayedReporting?: boolean;
        conductFlag?: boolean;
    }>('covidTest');
    const groundedChoice = readStoredJson<{
        onlineCourse?: boolean;
        certificateEarned?: boolean;
    }>('groundedChoice');

    const keptQuiet = localStorage.getItem('sickPassengerKeptQuiet') === 'true';
    const attendedParty = readStoredJson<{ attended?: boolean }>('goodbyeParty')?.attended === true;
    const conductFlag =
        covidTest?.conductFlag === true || localStorage.getItem('covidConductFlag') === 'true';
    const reportedImmediately =
        covidTest?.reportedImmediately === true ||
        localStorage.getItem('covidReportedImmediately') === 'true';
    const delayedReporting =
        covidTest?.delayedReporting === true ||
        localStorage.getItem('covidDelayedReporting') === 'true';
    const covidNegative =
        covidTest?.result === 'negative' || localStorage.getItem('covidTestResult') === 'negative';
    const certificateEarned =
        groundedChoice?.onlineCourse === true ||
        groundedChoice?.certificateEarned === true ||
        localStorage.getItem('pilotGroundSchoolCertificate') === 'true';
    const recklessChoices = keptQuiet || attendedParty || delayedReporting;
    const rehiringOffer = readStoredJson<{
        choice?: string;
        acceptedOffer?: boolean;
        negotiationOutcome?: string | null;
    }>('rehiringOffer');
    const rehireChoice = rehiringOffer?.choice ?? null;
    const rehired = rehiringOffer?.acceptedOffer === true;

    return {
        conductFlag,
        reportedImmediately,
        delayedReporting,
        covidNegative,
        certificateEarned,
        recklessChoices,
        keptQuiet,
        attendedParty,
        rehireChoice,
        rehired,
    };
}

function getWaitingNarrative(history: ReturnType<typeof getApplicationHistory>) {
    if (history.rehired) {
        return history.rehireChoice === 'negotiate'
            ? 'The airline took Diana back after she pushed for better terms, but the contract never felt like the end of the story. Between flights and probation meetings, she kept sending pilot training applications until one finally brought her here.'
            : 'Diana signed the return contract and went back to the airline, but stability did not quiet the bigger dream. After months of flying under new terms, she kept applying for pilot training until an interview invitation arrived.';
    }

    if (history.rehireChoice === 'decline') {
        return 'Diana turned down the airline and put everything behind the pilot path. After months of applications, self-study, and waiting for replies, one training programme finally called her in.';
    }

    return 'The airline path never settled back into what it used to be. Diana kept sending pilot training applications anyway, hoping one panel would see the person she was trying to become.';
}

function getInterviewNarrative(history: ReturnType<typeof getApplicationHistory>) {
    if (history.rehired) {
        return 'The panel has already reviewed her airline file. Today, Diana has to explain why returning to work was not the same as giving up on the cockpit.';
    }

    if (history.rehireChoice === 'decline') {
        return 'The panel knows Diana stepped away from the airline to chase this. Now she has to show that the choice was preparation, not impulse.';
    }

    return 'The interview begins with everything on the table: her aviation history, her pandemic record, and the answers she gives today.';
}

function buildInterviewQuestions(history: ReturnType<typeof getApplicationHistory>): InterviewQuestion[] {
    return [
        history.conductFlag
            ? {
                  panelist: 'HR Officer',
                  question:
                      'We noticed a gap in your compliance record - specifically a delay in reporting a positive COVID result in April 2020. Can you walk us through that?',
                  options: [
                      {
                          text: "I wasn't sure of the protocol at the time. I should have reported immediately - I know that now.",
                          weight: 1,
                          tone: 'positive',
                      },
                      {
                          text: 'It was a difficult period. I made a mistake.',
                          weight: 0,
                          tone: 'neutral',
                      },
                      {
                          text: 'The situation was more complicated than the record shows.',
                          weight: -1,
                          tone: 'negative',
                      },
                      {
                          text: 'I understand why it is on file, and I have changed how I handle safety decisions since then.',
                          weight: 2,
                          tone: 'positive',
                      },
                  ],
              }
            : {
                  panelist: 'HR Officer',
                  question:
                      "Ms. Gelus, you've spent several years as cabin crew. What's driving you to make this transition now?",
                  options: [
                      {
                          text: 'The pandemic gave me time to think about what I really want.',
                          weight: 1,
                          tone: 'positive',
                      },
                      {
                          text: "I've always wanted to fly. This feels like the right moment.",
                          weight: 2,
                          tone: 'positive',
                      },
                      {
                          text: 'Cabin crew work changed, so I started looking for a better path.',
                          weight: 0,
                          tone: 'neutral',
                      },
                      {
                          text: 'I need something more stable than waiting for airline rosters.',
                          weight: -1,
                          tone: 'negative',
                      },
                  ],
              },
        history.recklessChoices
            ? {
                  panelist: 'Medical Officer',
                  question:
                      'Your records show a COVID infection in April 2020. Were you experiencing symptoms before your final flight that month?',
                  options: [
                      {
                          text: "Yes. I should have grounded myself earlier. I didn't.",
                          weight: 1,
                          tone: 'positive',
                      },
                      {
                          text: "I wasn't sure they were COVID symptoms at the time.",
                          weight: 0,
                          tone: 'neutral',
                      },
                      {
                          text: 'I felt fine on that flight.',
                          weight: -2,
                          tone: 'negative',
                      },
                      {
                          text: 'I ignored warning signs because I was afraid of losing work. That was the wrong call.',
                          weight: 2,
                          tone: 'positive',
                      },
                  ],
              }
            : {
                  panelist: 'Medical Officer',
                  question:
                      'Your medical history looks straightforward. Are there any conditions or past illnesses we should be aware of?',
                  options: [
                      {
                          text: 'Nothing significant. I had COVID in 2020 and recovered fully.',
                          weight: 2,
                          tone: 'positive',
                      },
                      {
                          text: 'No, nothing to note.',
                          weight: 0,
                          tone: 'neutral',
                      },
                      {
                          text: 'I had one illness during the pandemic, but it never affected my work.',
                          weight: -1,
                          tone: 'negative',
                      },
                      {
                          text: 'I can provide clearance records if the panel needs them.',
                          weight: 1,
                          tone: 'positive',
                      },
                  ],
              },
        history.certificateEarned
            ? {
                  panelist: 'Training Director',
                  question:
                      "I see you completed a ground school programme during the pandemic. That's impressive given the circumstances. What motivated you?",
                  options: [
                      {
                          text: "I wanted to use the time productively. And honestly - I'd always been curious about the pilot side.",
                          weight: 2,
                          tone: 'positive',
                      },
                      {
                          text: 'It seemed like the logical thing to do.',
                          weight: 0,
                          tone: 'neutral',
                      },
                      {
                          text: 'I knew I needed proof that this was more than an idea.',
                          weight: 1,
                          tone: 'positive',
                      },
                      {
                          text: 'There was not much else to do while grounded.',
                          weight: -1,
                          tone: 'negative',
                      },
                  ],
              }
            : {
                  panelist: 'Training Director',
                  question:
                      "Your application doesn't show any formal ground training credits. The academic load in this programme is significant. What makes you confident you can handle it?",
                  options: [
                      {
                          text: "I've been self-studying. I know I'd need to work harder than others to catch up and I'm prepared for that.",
                          weight: 1,
                          tone: 'positive',
                      },
                      {
                          text: 'My years of experience in the cabin give me a strong foundation.',
                          weight: 0,
                          tone: 'neutral',
                      },
                      {
                          text: 'I learn quickly.',
                          weight: -1,
                          tone: 'negative',
                      },
                      {
                          text: 'I know this is a gap. I have already mapped out the material I need to cover before training starts.',
                          weight: 2,
                          tone: 'positive',
                      },
                  ],
              },
    ];
}

function buildChecklist(
    history: ReturnType<typeof getApplicationHistory>,
    answerWeights: number[]
): ChecklistItem[] {
    const positiveAnswers = answerWeights.filter(weight => weight > 0).length;
    const evasiveAnswers = answerWeights.filter(weight => weight < 0).length;

    return [
        {
            label: 'Conduct record',
            passed: !history.conductFlag,
            detailTitle: 'Conduct record',
            detail: history.conductFlag
                ? 'A conduct warning remained on Diana\'s file because the April 2020 COVID reporting was delayed.'
                : 'Diana had no conduct warning on file. Her prior airline record stayed clean.',
        },
        {
            label: 'COVID reporting compliance',
            passed: history.reportedImmediately,
            detailTitle: 'COVID reporting compliance',
            detail: history.reportedImmediately
                ? 'Diana reported the positive COVID result immediately, which helped her compliance review.'
                : history.delayedReporting
                  ? 'Diana delayed reporting the positive COVID result, so the panel marked this as a compliance problem.'
                  : 'The file did not show immediate positive-result reporting, so the panel could not give full compliance credit.',
        },
        {
            label: 'Ground training certificate',
            passed: history.certificateEarned,
            detailTitle: 'Ground training certificate',
            detail: history.certificateEarned
                ? 'Diana completed the online ground school course during the grounded period.'
                : 'Diana took ground shifts instead of completing the online course, so no formal training credit was attached.',
        },
        {
            label: 'Medical clearance',
            passed: history.covidNegative || (history.reportedImmediately && !history.delayedReporting),
            detailTitle: 'Medical clearance',
            detail: history.covidNegative
                ? 'Diana tested negative in April 2020, so the medical file had no unresolved infection issue.'
                : history.reportedImmediately && !history.delayedReporting
                  ? 'Diana had COVID, but she reported correctly and followed the process, so the medical review cleared it.'
                  : 'The panel saw risk in the medical file because symptoms, exposure, or reporting were not handled cleanly.',
        },
        {
            label: 'Interview performance',
            passed: positiveAnswers >= 2 && evasiveAnswers === 0,
            detailTitle: 'Interview performance',
            detail:
                positiveAnswers >= 2 && evasiveAnswers === 0
                    ? 'Most of Diana\'s answers were honest, specific, and forward-looking.'
                    : 'Too many answers sounded evasive, vague, or underprepared to the panel.',
        },
    ];
}

function resolveLetterOutcome(checklist: ChecklistItem[], answerWeights: number[]) {
    const passedCount = checklist.filter(item => item.passed).length;
    const interviewScore = answerWeights.reduce((sum, weight) => sum + weight, 0);

    if (passedCount >= 4 && interviewScore >= 3) return 'accepted';
    if (passedCount >= 3 && interviewScore >= 1) return 'waitlist';
    return 'declined';
}

function getFinalOutcomeCopy(outcome: keyof typeof FINAL_OUTCOME_IMAGES) {
    if (outcome === 'accepted') {
        return {
            title: 'Accepted',
            text: "Diana takes her seat in the simulator for the very first time. The instruments glow in front of her. It's only a training flight - but it doesn't feel like one. The headset goes on. She exhales. And then she flies.",
        };
    }

    if (outcome === 'waitlist') {
        return {
            title: 'Reserve List',
            text: "Diana sets the letter down and reads it again. Reserve list. Not a no - but not a yes either. She makes a coffee and sits by the window, watching a plane trace a line across the sky. She's not ready to stop hoping yet.",
        };
    }

    return {
        title: 'Declined',
        text: "The letter is still in her hand. She's read it twice and the words haven't changed. After everything - the pandemic, the layoff, her mom - she thought maybe she'd earned this. Maybe she still will. She folds the letter and puts it in the drawer. She doesn't throw it away.",
    };
}

export default function PilotTrainingApplicationModal({ onClose }: Props) {
    const [stage, setStage] = useState<Stage>('waiting');
    const [isFading, setIsFading] = useState(false);
    const [countdownSeconds, setCountdownSeconds] = useState(WAITING_START_SECONDS);
    const [clockVisible, setClockVisible] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);
    const [introDialogueDone, setIntroDialogueDone] = useState(false);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [visibleQuestion, setVisibleQuestion] = useState('');
    const [answerWeights, setAnswerWeights] = useState<number[]>([]);
    const [revealedChecklistCount, setRevealedChecklistCount] = useState(0);
    const [sheetCollected, setSheetCollected] = useState(false);
    const [selectedChecklistItem, setSelectedChecklistItem] = useState<ChecklistItem | null>(null);
    const [letterOpen, setLetterOpen] = useState(false);

    const history = useMemo(() => getApplicationHistory(), []);
    const questions = useMemo(() => buildInterviewQuestions(history), [history]);
    const currentQuestion = questions[questionIndex];
    const waitingNarrative = useMemo(() => getWaitingNarrative(history), [history]);
    const interviewNarrative = useMemo(() => getInterviewNarrative(history), [history]);
    const currentDialogueText = introDialogueDone
        ? currentQuestion?.question
        : 'Welcome, Ms. Gelus. The panel has reviewed your application and your airline record. We will begin with a few questions.';
    const isTyping = stage === 'interview' && visibleQuestion !== currentDialogueText;
    const checklist = useMemo(
        () => buildChecklist(history, answerWeights),
        [answerWeights, history]
    );
    const letterOutcome = useMemo(
        () => resolveLetterOutcome(checklist, answerWeights),
        [answerWeights, checklist]
    ) as keyof typeof FINAL_OUTCOME_IMAGES;
    const finalOutcomeCopy = useMemo(
        () => getFinalOutcomeCopy(letterOutcome),
        [letterOutcome]
    );

    useEffect(() => {
        [
            WAITING_ROOM_IMAGE,
            INTERVIEW_IMAGE,
            AIRLINE_LOGO,
            CLOCK_GIF_ICON,
            CLOCK_STATIC_ICON,
            ALERT_ICON,
            ...Object.values(FINAL_OUTCOME_IMAGES),
        ].forEach(src => {
            const image = new window.Image();
            image.src = src;
        });
    }, []);

    useEffect(() => {
        if (stage !== 'waiting') return;

        const clockTimer = window.setTimeout(() => setClockVisible(true), 250);
        const countdownTimer = window.setInterval(() => {
            setCountdownSeconds(prev => {
                const next = Math.max(0, prev - WAITING_STEP_SECONDS);
                if (next === 0) {
                    window.clearInterval(countdownTimer);
                    window.setTimeout(() => setAlertVisible(true), 220);
                }
                return next;
            });
        }, WAITING_TICK_MS);

        return () => {
            window.clearTimeout(clockTimer);
            window.clearInterval(countdownTimer);
        };
    }, [stage]);

    useEffect(() => {
        if (stage !== 'interview' || !currentDialogueText) return;
        if (visibleQuestion === currentDialogueText) return;

        const timeout = window.setTimeout(() => {
            setVisibleQuestion(currentDialogueText.slice(0, visibleQuestion.length + 1));
        }, TYPE_SPEED_MS);

        return () => window.clearTimeout(timeout);
    }, [currentDialogueText, stage, visibleQuestion]);

    useEffect(() => {
        if (stage !== 'checklist') return;
        if (revealedChecklistCount >= checklist.length) return;

        const timeout = window.setTimeout(() => {
            setRevealedChecklistCount(count => count + 1);
        }, CHECKLIST_STEP_MS);

        return () => window.clearTimeout(timeout);
    }, [checklist.length, revealedChecklistCount, stage]);

    const transitionToInterview = () => {
        if (!alertVisible || isFading) return;

        setIsFading(true);
        window.setTimeout(() => {
            setStage('interview');
            setIsFading(false);
        }, 650);
    };

    const handleAnswer = (option: AnswerOption) => {
        if (isTyping) {
            setVisibleQuestion(currentDialogueText);
            return;
        }

        const nextWeights = [...answerWeights, option.weight];
        setAnswerWeights(nextWeights);

        if (questionIndex >= questions.length - 1) {
            setStage('checklist');
            setRevealedChecklistCount(0);
            return;
        }

        setQuestionIndex(index => index + 1);
        setVisibleQuestion('');
    };

    const handleDialogueClick = () => {
        if (isTyping) {
            setVisibleQuestion(currentDialogueText);
            return;
        }

        if (!introDialogueDone) {
            setIntroDialogueDone(true);
            setVisibleQuestion('');
        }
    };

    const handleChecklistContinue = () => {
        setSheetCollected(true);
        window.setTimeout(() => {
            localStorage.setItem(
                'pilotTrainingApplication',
                JSON.stringify({
                    completed: true,
                    answerWeights,
                    checklist,
                    outcome: letterOutcome,
                    conductFlag: history.conductFlag,
                    reportedImmediately: history.reportedImmediately,
                    certificateEarned: history.certificateEarned,
                    date: new Date().toISOString(),
                })
            );
            setStage('letter');
        }, 520);
    };

    const handleClose = () => {
        localStorage.setItem('pilotTrainingApplicationOutcome', letterOutcome);
        onClose();
    };

    const handleLetterContinue = () => {
        localStorage.setItem('pilotTrainingApplicationOutcome', letterOutcome);
        setStage('finalVisual');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="news-event-modal relative rounded-2xl bg-white text-gray-900 shadow-xl animate-event-in">
                <style jsx>{`
                    @keyframes alertPop {
                        0% {
                            opacity: 0;
                            transform: translate(-50%, -50%) scale(0.4);
                        }
                        65% {
                            opacity: 1;
                            transform: translate(-50%, -50%) scale(1.12);
                        }
                        100% {
                            opacity: 1;
                            transform: translate(-50%, -50%) scale(1);
                        }
                    }

                    @keyframes sheetSlide {
                        from {
                            opacity: 0;
                            transform: translateY(42px) rotate(-1.5deg);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0) rotate(-0.4deg);
                        }
                    }

                    @keyframes sheetCollect {
                        to {
                            opacity: 0;
                            transform: translateY(-80px) rotate(2deg) scale(0.94);
                        }
                    }

                    @keyframes envelopeIn {
                        from {
                            opacity: 0;
                            transform: translateY(24px) scale(0.92);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                        }
                    }

                    @keyframes detailCardIn {
                        0% {
                            opacity: 0;
                            transform: translateY(18px) scale(0.94);
                        }
                        70% {
                            opacity: 1;
                            transform: translateY(-3px) scale(1.01);
                        }
                        100% {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                        }
                    }
                `}</style>

                {selectedChecklistItem ? (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                        <div
                            className="w-[min(520px,calc(100vw-56px))] rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl"
                            style={{ animation: 'detailCardIn 420ms ease-out both' }}
                        >
                            <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                                        File note
                                    </p>
                                    <h3 className="text-xl font-black text-slate-950">
                                        {selectedChecklistItem.detailTitle}
                                    </h3>
                                </div>
                                <span
                                    className={`flex h-10 w-10 items-center justify-center rounded-full text-2xl font-black ${
                                        selectedChecklistItem.passed
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}
                                >
                                    {selectedChecklistItem.passed ? '✓' : '✗'}
                                </span>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-700">
                                {selectedChecklistItem.detail}
                            </p>
                            <button
                                type="button"
                                onClick={() => setSelectedChecklistItem(null)}
                                className="mt-5 w-full rounded-full bg-blue-600 py-3 text-base font-semibold text-white transition hover:bg-blue-500"
                            >
                                close
                            </button>
                        </div>
                    </div>
                ) : null}

                {stage === 'waiting' ? (
                    <>
                        <h2 className="mb-3 text-center text-2xl font-bold text-red-600">
                            Pilot Training Application
                        </h2>
                        <p className="news-event-copy mb-3 text-center text-gray-700">
                            {waitingNarrative}
                        </p>
                        <button
                            type="button"
                            onClick={transitionToInterview}
                            className="relative block aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-950"
                            style={{
                                opacity: isFading ? 0 : 1,
                                transition: 'opacity 650ms ease-in-out',
                            }}
                            aria-label="Continue from waiting room"
                        >
                            <img
                                src={WAITING_ROOM_IMAGE}
                                alt="Pilot training waiting room"
                                className="absolute inset-0 h-full w-full object-cover"
                                draggable={false}
                            />

                            <div
                                className={`absolute z-20 rounded-full border border-blue-100 bg-white/95 px-3 py-1 text-base font-bold text-blue-900 shadow-lg transition-all duration-700 ${
                                    clockVisible ? 'opacity-100' : 'opacity-0'
                                }`}
                                style={{
                                    left: `${TIMER_TEXT_CONTROLS.x}%`,
                                    top: `${TIMER_TEXT_CONTROLS.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                }}
                            >
                                {formatCountdown(countdownSeconds)}
                            </div>

                            <img
                                src={countdownSeconds === 0 ? CLOCK_STATIC_ICON : CLOCK_GIF_ICON}
                                alt="Waiting room clock"
                                className={`absolute z-20 h-20 w-20 object-contain drop-shadow-[0_8px_16px_rgba(37,99,235,0.35)] transition-all duration-700 ${
                                    clockVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
                                }`}
                                style={{
                                    left: `${CLOCK_CONTROLS.x}%`,
                                    top: `${CLOCK_CONTROLS.y}%`,
                                    width: `${CLOCK_CONTROLS.widthRem}rem`,
                                    height: `${CLOCK_CONTROLS.heightRem}rem`,
                                    transform: 'translate(-50%, -50%)',
                                }}
                                draggable={false}
                            />

                            {alertVisible ? (
                                <img
                                    src={ALERT_ICON}
                                    alt="Interview call alert"
                                    className="absolute z-30 object-contain drop-shadow-[0_10px_18px_rgba(239,68,68,0.4)]"
                                    style={{
                                        left: `${ALERT_CONTROLS.x}%`,
                                        top: `${ALERT_CONTROLS.y}%`,
                                        width: `${ALERT_CONTROLS.widthRem}rem`,
                                        height: `${ALERT_CONTROLS.heightRem}rem`,
                                        animation:
                                            'alertPop 520ms ease-out both, bounce 1.1s 520ms infinite',
                                    }}
                                    draggable={false}
                                />
                            ) : null}
                        </button>
                        <p className="mt-3 text-center text-sm font-semibold text-gray-600">
                            {alertVisible ? 'Click to continue.' : 'Waiting for the panel to call her in.'}
                        </p>
                    </>
                ) : null}

                {stage === 'interview' ? (
                    <>
                        <h2 className="mb-3 text-center text-2xl font-bold text-red-600">
                            The Interview Panel
                        </h2>
                        <p className="news-event-copy mb-3 text-center text-gray-700">
                            {interviewNarrative}
                        </p>
                        <div className="relative mb-4">
                            <div className="news-event-frame flex justify-center">
                                <img
                                    src={INTERVIEW_IMAGE}
                                    alt="Pilot training interview panel"
                                    className="news-event-image"
                                    draggable={false}
                                />
                            </div>

                            <div className="news-dialogue absolute left-[51%] w-[92%] -translate-x-1/2">
                                <div className="news-dialogue-panel overflow-hidden border-4 border-[#2f2f2f] bg-[#111111] shadow-[inset_0_0_0_2px_#7a7a7a]">
                                    <div className="news-dialogue-heading border-b-2 border-[#3a3a3a] bg-[#1a1a1a] px-4 py-2">
                                        <p className="news-dialogue-title text-white">
                                            {introDialogueDone ? currentQuestion.panelist : 'HR Officer'}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleDialogueClick}
                                        className="news-dialogue-button relative w-full bg-[#0b0b0b] px-4 py-3 text-left"
                                    >
                                        <p className={`${pixelFont.className} news-dialogue-text text-white`}>
                                            {visibleQuestion}
                                        </p>
                                        <span
                                            className={`absolute bottom-3 right-4 text-2xl text-white ${
                                                isTyping ? 'opacity-30' : 'animate-bounce'
                                            }`}
                                        >
                                            v
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {introDialogueDone ? (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {currentQuestion.options.map(option => (
                                    <button
                                        key={option.text}
                                        type="button"
                                        onClick={() => handleAnswer(option)}
                                        className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-left text-sm font-semibold leading-snug text-slate-800 transition hover:border-blue-400 hover:bg-blue-50"
                                    >
                                        {option.text}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-sm font-semibold text-gray-600">
                                Click the dialogue box to begin the interview.
                            </p>
                        )}
                    </>
                ) : null}

                {stage === 'checklist' ? (
                    <div className="mx-auto max-w-[680px]">
                        <h2 className="mb-2 text-center text-2xl font-bold text-red-600">
                            Interview Complete
                        </h2>
                        <p className="party-event-copy mb-4 text-center text-gray-700">
                            Before you go Ms. Gelus - we&apos;d like you to take a look at your
                            application summary. We reviewed everything on file, not just today&apos;s
                            interview.
                        </p>

                        <div
                            className={`rounded-sm border border-slate-300 bg-[#fffdf6] p-6 shadow-2xl ${
                                sheetCollected ? '' : ''
                            }`}
                            style={{
                                animation: sheetCollected
                                    ? 'sheetCollect 520ms ease-in both'
                                    : 'sheetSlide 650ms ease-out both',
                            }}
                        >
                            <div className="mb-5 border-b border-slate-300 pb-3 text-center">
                                <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
                                    Pilot Training Assessment Sheet
                                </p>
                                <p className="mt-1 text-xl font-black text-slate-950">
                                    Diana Gelus
                                </p>
                            </div>

                            <div className="space-y-3">
                                {checklist.map((item, index) => {
                                    const revealed = index < revealedChecklistCount;

                                    return (
                                        <button
                                            key={item.label}
                                            type="button"
                                            onClick={() => revealed && setSelectedChecklistItem(item)}
                                            disabled={!revealed}
                                            className={`flex w-full items-center justify-between border-b border-dashed border-slate-200 pb-2 text-left text-sm font-semibold transition ${
                                                revealed
                                                    ? 'cursor-pointer rounded-lg px-2 hover:bg-slate-100'
                                                    : 'cursor-default'
                                            }`}
                                        >
                                            <span className="text-slate-700">
                                                {item.label}
                                                {revealed ? (
                                                    <span className="ml-2 text-xs font-semibold text-slate-400">
                                                        click for file note
                                                    </span>
                                                ) : null}
                                            </span>
                                            <span
                                                className={`text-2xl transition-all duration-500 ${
                                                    revealed
                                                        ? 'scale-100 opacity-100'
                                                        : 'scale-50 opacity-0'
                                                } ${item.passed ? 'text-green-600' : 'text-red-600'}`}
                                            >
                                                {item.passed ? '✓' : '✗'}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {revealedChecklistCount >= checklist.length ? (
                            <>
                                <p className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-700">
                                    We&apos;ll be in touch within 5 business days, Ms. Gelus. Thank you
                                    for coming in.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleChecklistContinue}
                                    className="mt-4 w-full rounded-full bg-blue-600 py-3 text-base font-semibold text-white transition hover:bg-blue-500"
                                >
                                    continue
                                </button>
                            </>
                        ) : null}
                    </div>
                ) : null}

                {stage === 'letter' ? (
                    <div className="mx-auto max-w-[640px] text-center">
                        <p className="mb-3 rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
                            5 business days later
                        </p>

                        {!letterOpen ? (
                            <button
                                type="button"
                                onClick={() => setLetterOpen(true)}
                                className="mx-auto flex h-44 w-72 items-center justify-center rounded-xl border border-amber-200 bg-[#fff5df] text-lg font-black uppercase tracking-[0.18em] text-amber-800 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
                                style={{ animation: 'envelopeIn 520ms ease-out both' }}
                            >
                                result letter
                            </button>
                        ) : (
                            <div
                                className="rounded-sm border border-slate-300 bg-[#fffdf7] p-6 text-left shadow-2xl"
                                style={{ animation: 'letterUnfold 520ms ease-out both' }}
                            >
                                <div className="mb-4 flex items-center gap-3 border-b border-slate-200 pb-4">
                                    <img
                                        src={AIRLINE_LOGO}
                                        alt="Airline logo"
                                        className="h-14 w-14 object-contain"
                                        draggable={false}
                                    />
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                                            Pilot Training Admissions
                                        </p>
                                        <p className="mt-1 text-lg font-black text-slate-950">
                                            AeroNova Airways
                                        </p>
                                    </div>
                                </div>
                                <p className="mb-3 font-semibold text-slate-900">Dear Ms. Gelus,</p>
                                <p className="text-sm leading-relaxed text-slate-700">
                                    {letterOutcome === 'accepted'
                                        ? 'After reviewing your full application, interview, conduct record, medical file, and training preparation, we are pleased to offer you a place in the next pilot training cohort.'
                                        : letterOutcome === 'waitlist'
                                          ? 'After reviewing your full application, interview, conduct record, medical file, and training preparation, we are placing your application on the reserve list pending final seat availability.'
                                          : 'After reviewing your full application, interview, conduct record, medical file, and training preparation, we are unable to offer you a place in this pilot training cohort.'}
                                </p>
                                <p className="mt-4 text-sm leading-relaxed text-slate-700">
                                    {letterOutcome === 'accepted'
                                        ? 'Your next chapter begins with ground instruction, simulator screening, and medical recertification.'
                                        : letterOutcome === 'waitlist'
                                          ? 'You may be contacted if a seat opens. Additional ground training credits would strengthen a future application.'
                                          : 'You may apply again after further preparation and a stronger compliance record.'}
                                </p>
                                <p className="mt-5 text-sm font-semibold text-slate-800">
                                    Regards,
                                    <br />
                                    Pilot Training Admissions Panel
                                </p>
                            </div>
                        )}

                        {letterOpen ? (
                            <button
                                type="button"
                                onClick={handleLetterContinue}
                                className="mt-5 w-full rounded-full bg-blue-600 py-3 text-base font-semibold text-white transition hover:bg-blue-500"
                            >
                                continue
                            </button>
                        ) : null}
                    </div>
                ) : null}

                {stage === 'finalVisual' ? (
                    <div className="animate-event-in">
                        <h2 className="mb-3 text-center text-2xl font-bold text-red-600">
                            {finalOutcomeCopy.title}
                        </h2>

                        <img
                            src={FINAL_OUTCOME_IMAGES[letterOutcome]}
                            alt={`Pilot training application ${finalOutcomeCopy.title.toLowerCase()} outcome`}
                            className="mb-4 h-[min(430px,55svh)] w-full rounded-xl object-cover"
                            draggable={false}
                        />

                        <p className="party-event-copy mb-5 text-center text-gray-700">
                            {finalOutcomeCopy.text}
                        </p>

                        <button
                            type="button"
                            onClick={handleClose}
                            className="w-full rounded-full bg-blue-600 py-3 text-base font-semibold text-white transition hover:bg-blue-500"
                        >
                            finish
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
