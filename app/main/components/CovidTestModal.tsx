'use client';

import { useEffect, useState } from 'react';
import { formatWalletCurrency, formatWalletUnits, type WalletItem } from '../utils/walletData';

type Props = {
    wallet: WalletItem[];
    onRouteMapLocked: () => void;
    onClose: () => void;
};

type Stage =
    | 'wake'
    | 'testStart'
    | 'order'
    | 'waiting'
    | 'positive'
    | 'negative'
    | 'decision'
    | 'outcome';
type SlotKey = 'swab' | 'cassette' | 'tube';
type ResultOutcome = 'positive' | 'negative';

const STAGE_IMAGES: Record<Stage, string> = {
    wake: '/images/COVID-19-PANDEMIC/events/waking%20up.png',
    testStart: '/images/COVID-19-PANDEMIC/events/covid-test1.png',
    order: '/images/COVID-19-PANDEMIC/events/covid-test2.png',
    waiting: '/images/COVID-19-PANDEMIC/events/covid-test3.png',
    positive: '/images/COVID-19-PANDEMIC/events/covid-positive.png',
    negative: '/images/COVID-19-PANDEMIC/events/covid-negative.png',
    decision: '/images/COVID-19-PANDEMIC/events/covid-test3.png',
    outcome: '/images/COVID-19-PANDEMIC/events/covid-test3.png',
};

const FADE_MS = 900;
const MANUAL_POP_DELAY_MS = 600;
const CLOCK_GIF_ICON = '/images/COVID-19-PANDEMIC/icons/clock.gif';
const CLOCK_STATIC_ICON = '/images/COVID-19-PANDEMIC/icons/clock.png';
const COUNTDOWN_START_SECONDS = 15 * 60;

const COUNTDOWN_CONTROLS = {
    // Higher step or lower tick speed makes the countdown finish faster.
    stepSeconds: 8,
    tickMs: 50,
};

const CLOCK_CONTROLS = {
    // Manual position and size controls for clock.gif on covid-test3.png.
    x: 79,
    y: 52,
    widthRem: 7,
    heightRem: 7,
};

const TIMER_TEXT_CONTROLS = {
    // Manual position controls for the countdown text on covid-test3.png.
    x: 79,
    y: 42,
};

const CHECK_RESULTS_BUTTON_CONTROLS = {
    // Manual position controls for the check results button on covid-test3.png.
    x: 79,
    y: 75,
};

const ORDER_BOX_COORDINATES: Record<
    SlotKey,
    { x: number; y: number; width: number; height: number; label: string }
> = {
    // Manual position controls for the numbered drop boxes on covid-test2.png.
    // x/y are the center point in percent. width/height are CSS rem values.
    swab: { x: 47, y: 31, width: 3, height: 3, label: 'swab' },
    cassette: { x: 56.3, y: 31, width: 3, height: 3, label: 'device' },
    tube: { x: 66, y: 31, width: 3, height: 3, label: 'tube' },
};

const CORRECT_ORDER: Record<SlotKey, string> = {
    swab: '1',
    tube: '2',
    cassette: '3',
};

const NUMBERS = ['1', '2', '3'];

function createEmptyPlacements(): Record<SlotKey, string | null> {
    return {
        swab: null,
        cassette: null,
        tube: null,
    };
}

function formatCountdown(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function resolveCovidResult(): ResultOutcome {
    const keptQuiet = localStorage.getItem('sickPassengerKeptQuiet') === 'true';
    const goodbyePartyRaw = localStorage.getItem('goodbyeParty');
    let attendedParty = false;

    if (goodbyePartyRaw) {
        try {
            attendedParty = Boolean(JSON.parse(goodbyePartyRaw)?.attended);
        } catch {
            attendedParty = false;
        }
    }

    return keptQuiet || attendedParty ? 'positive' : 'negative';
}

export default function CovidTestModal({ wallet, onRouteMapLocked, onClose }: Props) {
    const [stage, setStage] = useState<Stage>('wake');
    const [nextStage, setNextStage] = useState<Stage | null>(null);
    const [nextImageVisible, setNextImageVisible] = useState(false);
    const [isFading, setIsFading] = useState(false);

    const [manualState, setManualState] = useState<'hidden' | 'closed' | 'open'>('hidden');
    const [manualVisible, setManualVisible] = useState(false);

    const [placements, setPlacements] = useState<Record<SlotKey, string | null>>(
        createEmptyPlacements
    );
    const [orderError, setOrderError] = useState('');
    const [countdownSeconds, setCountdownSeconds] = useState(COUNTDOWN_START_SECONDS);
    const [clockVisible, setClockVisible] = useState(false);
    const [checkResultsVisible, setCheckResultsVisible] = useState(false);
    const [resultOutcome, setResultOutcome] = useState<ResultOutcome>('negative');
    const [choice, setChoice] = useState<'responsible' | 'careless'>('responsible');
    const [confirmedChoice, setConfirmedChoice] = useState<'responsible' | 'careless'>('responsible');

    useEffect(() => {
        Object.values(STAGE_IMAGES).forEach(src => {
            const image = new window.Image();
            image.src = src;
        });

        [CLOCK_GIF_ICON, CLOCK_STATIC_ICON].forEach(src => {
            const clock = new window.Image();
            clock.src = src;
        });
    }, []);

    useEffect(() => {
        if (stage !== 'waiting' || isFading) return;

        setCountdownSeconds(COUNTDOWN_START_SECONDS);
        setClockVisible(false);
        setCheckResultsVisible(false);

        const clockTimer = window.setTimeout(() => {
            setClockVisible(true);
        }, 350);

        const countdownTimer = window.setInterval(() => {
            setCountdownSeconds(prev => {
                const next = Math.max(0, prev - COUNTDOWN_CONTROLS.stepSeconds);

                if (next === 0) {
                    window.clearInterval(countdownTimer);
                    window.setTimeout(() => setCheckResultsVisible(true), 250);
                }

                return next;
            });
        }, COUNTDOWN_CONTROLS.tickMs);

        return () => {
            window.clearTimeout(clockTimer);
            window.clearInterval(countdownTimer);
        };
    }, [isFading, stage]);

    const transitionTo = (targetStage: Stage) => {
        if (isFading || targetStage === stage) return;

        setManualVisible(false);
        setManualState('hidden');
        setOrderError('');
        setNextStage(targetStage);
        setNextImageVisible(false);
        setIsFading(true);

        window.setTimeout(() => {
            setNextImageVisible(true);
        }, 30);

        window.setTimeout(() => {
            setStage(targetStage);
            setNextStage(null);
            setNextImageVisible(false);
            setIsFading(false);
        }, FADE_MS);
    };

    const handleImageClick = () => {
        if (isFading) return;

        if (stage === 'wake') {
            transitionTo('testStart');
            return;
        }

        if (stage === 'testStart' && manualState === 'hidden') {
            window.setTimeout(() => {
                setManualState('closed');
                window.setTimeout(() => setManualVisible(true), 30);
            }, MANUAL_POP_DELAY_MS);
            return;
        }

        if (stage === 'positive' || stage === 'negative') {
            setIsFading(true);

            window.setTimeout(() => {
                setStage('decision');
                setIsFading(false);
            }, FADE_MS);
        }
    };

    const handleOpenManual = () => {
        setManualVisible(false);

        window.setTimeout(() => {
            setManualState('open');
            window.setTimeout(() => setManualVisible(true), 30);
        }, 180);
    };

    const handleContinueFromManual = () => {
        transitionTo('order');
    };

    const handleDrop = (slot: SlotKey, number: string) => {
        if (!NUMBERS.includes(number)) return;

        setOrderError('');
        setPlacements(prev => {
            const next = createEmptyPlacements();

            (Object.keys(prev) as SlotKey[]).forEach(key => {
                next[key] = prev[key] === number ? null : prev[key];
            });

            next[slot] = number;
            return next;
        });
    };

    const handleConfirmOrder = () => {
        const isCorrect = (Object.keys(CORRECT_ORDER) as SlotKey[]).every(
            key => placements[key] === CORRECT_ORDER[key]
        );

        if (!isCorrect) {
            setOrderError('Try again. Check the instruction order.');
            return;
        }

        localStorage.setItem(
            'covidTestOrder',
            JSON.stringify({
                swab: placements.swab,
                tube: placements.tube,
                cassette: placements.cassette,
                date: new Date().toISOString(),
            })
        );

        transitionTo('waiting');
    };

    const handleCheckResults = () => {
        const outcome = resolveCovidResult();
        setResultOutcome(outcome);
        transitionTo(outcome);
    };

    const handleDecisionConfirm = () => {
        const positive = resultOutcome === 'positive';
        const reportedImmediately = positive && choice === 'responsible';
        const delayedReporting = positive && choice === 'careless';
        const becameCareful = !positive && choice === 'responsible';
        const routeMapLocked = positive;

        setConfirmedChoice(choice);

        localStorage.setItem(
            'covidTest',
            JSON.stringify({
                completed: true,
                result: resultOutcome,
                reportedImmediately,
                delayedReporting,
                becameCareful,
                shruggedOffNegative: !positive && choice === 'careless',
                conductFlag: delayedReporting,
                carefulFlag: !positive ? becameCareful : null,
                employmentStatus: positive ? 'terminated' : 'active',
                routeMapLocked,
                date: new Date().toISOString(),
            })
        );

        localStorage.setItem('covidTestResult', resultOutcome);
        localStorage.setItem('covidReportedImmediately', String(reportedImmediately));
        localStorage.setItem('covidDelayedReporting', String(delayedReporting));
        localStorage.setItem('covidBecameCareful', String(becameCareful));
        localStorage.setItem('covidConductFlag', String(delayedReporting));
        localStorage.setItem('covidCarefulFlag', String(!positive ? becameCareful : false));
        localStorage.setItem('employmentStatus', positive ? 'terminated' : 'active');
        localStorage.setItem('routeMapLocked', String(routeMapLocked));
        localStorage.setItem('routeMapLockedDate', positive ? '2020-04-20' : '');

        if (positive) {
            onRouteMapLocked();
        }

        setStage('outcome');
    };

    const usedNumbers = Object.values(placements).filter(Boolean);
    const availableNumbers = NUMBERS.filter(number => !usedNumbers.includes(number));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="party-event-modal relative overflow-hidden rounded-2xl bg-white text-gray-900 shadow-xl animate-event-in">
                <h2 className="mb-2 text-center text-2xl font-bold text-red-600">
                    COVID Test?
                </h2>

                {stage !== 'decision' && stage !== 'outcome' ? (
                    <p className="party-event-copy mb-3 text-center text-gray-700">
                        Diana wakes up feeling wrong. Her throat scratches, her head feels heavy,
                        and the coffee on her bedside table has no smell at all.
                    </p>
                ) : null}

                {stage !== 'order' && stage !== 'decision' && stage !== 'outcome' ? (
                    <button
                        type="button"
                        onClick={handleImageClick}
                        className="relative block aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-950"
                        style={{
                            opacity:
                                isFading &&
                                nextStage === null &&
                                (stage === 'positive' || stage === 'negative')
                                    ? 0
                                    : 1,
                            transition: `opacity ${FADE_MS}ms ease-in-out`,
                        }}
                        aria-label="Advance COVID test scene"
                    >
                        <img
                            src={STAGE_IMAGES[stage]}
                            alt="Diana COVID test scene"
                            className="absolute inset-0 z-10 h-full w-full object-cover"
                            draggable={false}
                        />

                        {nextStage !== null && (
                            <img
                                src={STAGE_IMAGES[nextStage]}
                                alt="Diana COVID test scene"
                                className="absolute inset-0 z-20 h-full w-full object-cover"
                                style={{
                                    opacity: nextImageVisible ? 1 : 0,
                                    transition: `opacity ${FADE_MS}ms ease-in-out`,
                                }}
                                draggable={false}
                            />
                        )}

                        {stage === 'testStart' && manualState === 'closed' && !isFading ? (
                            <span
                                role="button"
                                tabIndex={0}
                                onClick={event => {
                                    event.stopPropagation();
                                    handleOpenManual();
                                }}
                                onKeyDown={event => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        handleOpenManual();
                                    }
                                }}
                                className={`absolute left-1/2 top-1/2 z-30 flex h-28 w-40 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg border-2 border-red-200 bg-white text-center text-sm font-bold uppercase tracking-wide text-red-600 shadow-[0_18px_34px_rgba(15,23,42,0.28)] transition-all duration-700 ease-out ${
                                    manualVisible
                                        ? 'scale-100 opacity-100 animate-bounce'
                                        : 'scale-75 opacity-0'
                                }`}
                            >
                                Test instructions
                            </span>
                        ) : null}

                        {stage === 'waiting' && !isFading ? (
                            <>
                                <div
                                    className={`absolute z-30 rounded-full border border-red-100 bg-white/95 px-3 py-1 text-base font-bold text-red-600 shadow-lg transition-all duration-700 ${
                                        clockVisible ? 'opacity-100' : 'opacity-0'
                                    }`}
                                    style={{
                                        left: `${TIMER_TEXT_CONTROLS.x}%`,
                                        top: `${TIMER_TEXT_CONTROLS.y}%`,
                                        transform: clockVisible
                                            ? 'translate(-50%, -150%) scale(1)'
                                            : 'translate(-50%, -120%) scale(0.9)',
                                    }}
                                >
                                    {formatCountdown(countdownSeconds)}
                                </div>

                                <img
                                    src={CLOCK_GIF_ICON}
                                    alt="Timer running"
                                    className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_8px_16px_rgba(239,68,68,0.35)] transition-all duration-700 ${
                                        clockVisible && countdownSeconds > 0
                                            ? 'scale-100 opacity-100'
                                            : 'scale-75 opacity-0'
                                    }`}
                                    style={{
                                        left: `${CLOCK_CONTROLS.x}%`,
                                        top: `${CLOCK_CONTROLS.y}%`,
                                        width: `${CLOCK_CONTROLS.widthRem}rem`,
                                        height: `${CLOCK_CONTROLS.heightRem}rem`,
                                    }}
                                    draggable={false}
                                />

                                <img
                                    src={CLOCK_STATIC_ICON}
                                    alt="Timer finished"
                                    className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_8px_16px_rgba(239,68,68,0.35)] transition-all duration-700 ${
                                        clockVisible && countdownSeconds === 0
                                            ? 'scale-100 opacity-100'
                                            : 'scale-75 opacity-0'
                                    }`}
                                    style={{
                                        left: `${CLOCK_CONTROLS.x}%`,
                                        top: `${CLOCK_CONTROLS.y}%`,
                                        width: `${CLOCK_CONTROLS.widthRem}rem`,
                                        height: `${CLOCK_CONTROLS.heightRem}rem`,
                                    }}
                                    draggable={false}
                                />

                                {checkResultsVisible ? (
                                    <span
                                        role="button"
                                        tabIndex={0}
                                        onClick={event => {
                                            event.stopPropagation();
                                            handleCheckResults();
                                        }}
                                        onKeyDown={event => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                event.stopPropagation();
                                                handleCheckResults();
                                            }
                                        }}
                                        className="absolute z-40 flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center whitespace-nowrap rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-[0_14px_28px_rgba(15,23,42,0.28)] animate-bounce"
                                        style={{
                                            left: `${CHECK_RESULTS_BUTTON_CONTROLS.x}%`,
                                            top: `${CHECK_RESULTS_BUTTON_CONTROLS.y}%`,
                                        }}
                                    >
                                        check results
                                    </span>
                                ) : null}
                            </>
                        ) : null}
                    </button>
                ) : null}

                {stage === 'testStart' && manualState === 'open' && !isFading ? (
                    <div
                        className={`absolute inset-0 z-40 flex items-center justify-center bg-black/35 px-4 transition-opacity duration-500 ${
                            manualVisible ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        <div
                            className={`max-h-[88svh] w-[min(560px,calc(100vw-56px))] overflow-y-auto rounded-xl border border-red-100 bg-[#fffdf7] p-5 text-gray-900 shadow-2xl transition-all duration-700 ease-out ${
                                manualVisible
                                    ? 'translate-y-0 scale-100 opacity-100'
                                    : 'translate-y-8 scale-90 opacity-0'
                            }`}
                        >
                            <div className="mb-4 border-b border-red-100 pb-3 text-center">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-500">
                                    Home Antigen Self-Test
                                </p>
                                <h3 className="mt-1 text-xl font-bold text-red-600">
                                    Patient Instruction Leaflet
                                </h3>
                                <p className="mt-1 text-xs font-semibold text-gray-500">
                                    Read all instructions before starting the test.
                                </p>
                            </div>

                            <div className="space-y-3 text-sm leading-relaxed text-gray-700">
                                <p>
                                    Wash and dry your hands before opening the kit. Place all parts on
                                    a clean, flat surface with enough light to see the sample well. Do
                                    not begin if the pouch is torn, the tube is leaking, or any part
                                    appears missing.
                                </p>

                                <p>
                                    Open the sealed wrapper and remove the <strong>swab</strong> by the
                                    handle only. Do not touch the soft tip. Gently insert the soft tip
                                    into one nostril until you feel light resistance, rotate several
                                    times, then repeat in the other nostril using the same swab.
                                </p>

                                <p>
                                    Place the used swab tip into the liquid <strong>tube</strong>.
                                    Stir and squeeze the sides of the tube so the sample mixes with the
                                    solution. Keep the tube upright after mixing and attach the dropper
                                    cap firmly.
                                </p>

                                <p>
                                    Open the foil pouch and lay the{' '}
                                    <strong>test cassette/device</strong> on the table. Add the
                                    prepared drops into the sample well only. Do not move the device
                                    while the result develops.
                                </p>

                                <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                                    Remember the correct handling order from the leaflet before you
                                    continue.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleContinueFromManual}
                                className="mt-5 w-full rounded-full bg-blue-600 py-3 text-base font-semibold text-white transition hover:bg-blue-500"
                            >
                                continue
                            </button>
                        </div>
                    </div>
                ) : null}

                {stage === 'order' ? (
                    <div className="mt-3">
                        <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-slate-950">
                            <img
                                src={STAGE_IMAGES.order}
                                alt="COVID test kit with swab, tube, and test device"
                                className="absolute inset-0 z-10 h-full w-full object-cover"
                                draggable={false}
                            />

                            {nextStage !== null && (
                                <img
                                    src={STAGE_IMAGES[nextStage]}
                                    alt="Diana COVID test result scene"
                                    className="absolute inset-0 z-20 h-full w-full object-cover"
                                    style={{
                                        opacity: nextImageVisible ? 1 : 0,
                                        transition: `opacity ${FADE_MS}ms ease-in-out`,
                                    }}
                                    draggable={false}
                                />
                            )}

                            {!isFading
                                ? (Object.keys(ORDER_BOX_COORDINATES) as SlotKey[]).map(slot => (
                                      <div
                                          key={slot}
                                          onDragOver={event => event.preventDefault()}
                                          onDrop={event => {
                                              event.preventDefault();
                                              handleDrop(
                                                  slot,
                                                  event.dataTransfer.getData('text/plain')
                                              );
                                          }}
                                          className="absolute z-30 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border-2 border-dashed border-red-400 bg-white/80 text-lg font-bold text-red-600 shadow-lg"
                                          style={{
                                              left: `${ORDER_BOX_COORDINATES[slot].x}%`,
                                              top: `${ORDER_BOX_COORDINATES[slot].y}%`,
                                              width: `${ORDER_BOX_COORDINATES[slot].width}rem`,
                                              height: `${ORDER_BOX_COORDINATES[slot].height}rem`,
                                          }}
                                          aria-label={`${ORDER_BOX_COORDINATES[slot].label} order slot`}
                                      >
                                          {placements[slot] ? (
                                              <button
                                                  type="button"
                                                  onClick={() =>
                                                      setPlacements(prev => ({
                                                          ...prev,
                                                          [slot]: null,
                                                      }))
                                                  }
                                                  className="flex h-full w-full items-center justify-center rounded-md bg-red-500 text-white"
                                                  aria-label={`Remove number ${placements[slot]}`}
                                              >
                                                  {placements[slot]}
                                              </button>
                                          ) : null}
                                      </div>
                                  ))
                                : null}
                        </div>

                        {!isFading ? (
                            <>
                                <p className="mt-3 text-center text-sm font-semibold text-gray-600">
                                    Place the test steps in the correct order.
                                </p>

                                <div className="mt-3 flex justify-center gap-3">
                                    {availableNumbers.map(number => (
                                        <button
                                            key={number}
                                            type="button"
                                            draggable
                                            onDragStart={event => {
                                                event.dataTransfer.setData('text/plain', number);
                                            }}
                                            className="flex h-12 w-12 cursor-grab items-center justify-center rounded-full bg-red-500 text-lg font-bold text-white shadow-lg active:cursor-grabbing"
                                        >
                                            {number}
                                        </button>
                                    ))}
                                </div>

                                {orderError ? (
                                    <p className="mt-3 text-center text-sm font-semibold text-red-600">
                                        {orderError}
                                    </p>
                                ) : null}

                                <button
                                    type="button"
                                    onClick={handleConfirmOrder}
                                    className="mt-4 w-full rounded-full bg-blue-600 py-3 text-base font-semibold text-white transition hover:bg-blue-500"
                                >
                                    confirm
                                </button>
                            </>
                        ) : null}
                    </div>
                ) : (
                    <p
                        className={`mt-3 text-center text-sm font-semibold ${
                            stage === 'positive' || stage === 'negative'
                                ? 'text-red-600'
                                : 'text-gray-600'
                        }`}
                    >
                        {stage === 'wake'
                            ? 'Click the image to proceed.'
                            : stage === 'testStart'
                              ? manualState === 'hidden'
                                  ? 'Click the image to look for the instructions.'
                                  : 'Click the instruction manual.'
                              : stage === 'waiting'
                                ? checkResultsVisible
                                    ? 'Open the result when the timer is done.'
                                    : 'Wait for the test result.'
                                : stage === 'positive'
                                  ? 'Test comes back POSITIVE.'
                                  : stage === 'negative'
                                    ? 'Test comes back NEGATIVE.'
                                    : stage === 'decision'
                                      ? ''
                                      : ''}
                    </p>
                )}

                {stage === 'decision' ? (
                    <div
                        className="transition-opacity ease-in-out"
                        style={{
                            opacity: isFading ? 0 : 1,
                            transitionDuration: `${FADE_MS}ms`,
                        }}
                    >
                        <h3 className="mb-3 text-center text-lg font-bold text-gray-900">
                            {resultOutcome === 'positive'
                                ? 'Test comes back POSITIVE'
                                : 'Test comes back NEGATIVE'}
                        </h3>

                        <img
                            src={
                                resultOutcome === 'positive'
                                    ? STAGE_IMAGES.positive
                                    : STAGE_IMAGES.negative
                            }
                            alt={
                                resultOutcome === 'positive'
                                    ? 'Positive COVID test result'
                                    : 'Negative COVID test result'
                            }
                            className="party-event-image rounded-xl mb-3"
                            draggable={false}
                        />

                        <p className="party-event-copy mb-4">
                            {resultOutcome === 'positive'
                                ? "The airline's reporting portal is open on her phone. Reporting seems like the right thing to do... doesn't it?"
                                : "One line. Diana exhales slowly and sits down on the bathroom floor. She's negative. She got lucky. That was close. Does this change anything for Diana?"}
                        </p>

                        <div className="flex gap-3 mb-4">
                            <button
                                onClick={() => setChoice('responsible')}
                                className={`flex-1 rounded-full py-2 text-base font-semibold border transition ${
                                    choice === 'responsible'
                                        ? 'bg-green-500 text-white border-green-500'
                                        : 'bg-white text-gray-600 border-gray-300'
                                }`}
                            >
                                {resultOutcome === 'positive'
                                    ? 'Report the positive result'
                                    : 'Time to take this more seriously.'}
                            </button>

                            <button
                                onClick={() => setChoice('careless')}
                                className={`flex-1 rounded-full py-2 text-base font-semibold border transition ${
                                    choice === 'careless'
                                        ? 'bg-red-500 text-white border-red-500'
                                        : 'bg-white text-gray-600 border-gray-300'
                                }`}
                            >
                                {resultOutcome === 'positive'
                                    ? "Leave it. She'll deal with it later."
                                    : 'She tested negative. Life goes on.'}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">
                                        Immediate effect
                                    </label>
                                    <div className="rounded-lg border px-3 py-2 text-base font-semibold">
                                        {resultOutcome === 'positive' ? 'Unknown' : '$0'}
                                        <span className="block text-xs font-medium text-gray-500">
                                            {resultOutcome === 'positive'
                                                ? 'The airline portal may trigger a formal response'
                                                : 'No immediate financial effect'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block">
                                        Outcome
                                    </label>
                                    <p className="text-gray-700">
                                        {resultOutcome === 'positive'
                                            ? choice === 'responsible'
                                                ? 'Diana can file the report now and get it over with.'
                                                : 'Diana can put the phone down and deal with the portal later.'
                                            : choice === 'responsible'
                                              ? "Diana starts masking up properly and keeping distance in the crew room. It's lonelier, but she feels in control."
                                              : 'Diana puts the test in the bin and goes to make another coffee. Same as yesterday.'}
                                    </p>
                                </div>
                            </div>

                            <div className="border border-gray-300 rounded-xl p-3">
                                <p className="font-semibold mb-2">Wallet</p>

                                <div className="space-y-1 text-sm text-gray-800 max-h-[120px] overflow-y-auto">
                                    {wallet.map(item => (
                                        <p key={item.id}>
                                            {item.label}:{' '}
                                            <span className="font-medium">
                                                {formatWalletUnits(item)}
                                            </span>
                                            <span className="text-gray-500">
                                                {' '}({formatWalletCurrency(item.usdValue)})
                                            </span>
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleDecisionConfirm}
                            className="w-full rounded-full py-3 text-base font-semibold transition bg-blue-600 text-white hover:bg-blue-500"
                        >
                            confirm
                        </button>
                    </div>
                ) : null}

                {stage === 'outcome' ? (
                    <div className="animate-event-in max-h-[calc(100svh-80px)] overflow-y-auto pr-1">
                        {resultOutcome === 'positive' ? (
                            <>
                                {confirmedChoice === 'careless' ? (
                                    <p className="mb-3 rounded-full bg-slate-100 px-4 py-2 text-center text-sm font-bold text-slate-700">
                                        3 days later
                                    </p>
                                ) : null}

                                <div className="mb-3 rounded-xl border border-slate-300 bg-white px-5 py-4 text-sm leading-relaxed text-slate-800 shadow-inner">
                                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                                        Airline HR Department
                                    </p>
                                    <p className="mb-3 font-bold text-slate-950">
                                        SUBJECT:{' '}
                                        {confirmedChoice === 'responsible'
                                            ? 'Contract Suspension - COVID-19 Protocol'
                                            : 'Contract Termination + Formal Warning - COVID-19 Breach'}
                                    </p>

                                    {confirmedChoice === 'responsible' ? (
                                        <>
                                            <p>Dear Ms. Gelus,</p>
                                            <p className="mt-3">
                                                Following your reported positive COVID-19 result, your
                                                flying duties are suspended effective immediately in
                                                accordance with aviation health protocols.
                                            </p>
                                            <p className="mt-3">
                                                Your employment contract, which was already under
                                                review as part of our operational restructuring, will
                                                be formally terminated at the end of your isolation
                                                period.
                                            </p>
                                            <p className="mt-3">
                                                We appreciate your transparency in reporting.
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <p>Dear Ms. Gelus,</p>
                                            <p className="mt-3">
                                                It has come to our attention that you continued flying
                                                duties while exhibiting COVID-19 symptoms and failed
                                                to report a confirmed or suspected positive result as
                                                required by mandatory aviation health protocols.
                                            </p>
                                            <p className="mt-3">
                                                This is a serious breach of crew conduct policy. A
                                                formal written warning has been added to your
                                                employment record.
                                            </p>
                                            <p className="mt-3">
                                                Failure to report symptoms places passengers, crew,
                                                and the public at risk. This behaviour will have
                                                serious consequences for any future aviation
                                                employment applications.
                                            </p>
                                            <p className="mt-3">
                                                Your contract is terminated with immediate effect.
                                            </p>
                                        </>
                                    )}

                                    <p className="mt-4">
                                        Regards,
                                        <br />
                                        Airline HR Department
                                    </p>
                                </div>

                                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center">
                                    <p className="text-sm font-semibold text-red-700">
                                        Employment Status
                                    </p>
                                    <p className="text-xl font-black tracking-wide text-red-700">
                                        TERMINATED
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-center text-gray-800">
                                <p className="text-base font-semibold">
                                    {confirmedChoice === 'responsible'
                                        ? "Diana starts masking up properly, keeping her distance in the crew room. It's lonelier. But she feels in control."
                                        : 'Diana puts the test in the bin and goes to make another coffee. Same as yesterday.'}
                                </p>
                                <p className="mt-2 text-sm text-gray-500">
                                    No financial effect. Diana continues flying normally.
                                </p>
                            </div>
                        )}

                        <button
                            onClick={onClose}
                            className="w-full rounded-full py-3 text-base font-semibold transition bg-blue-600 text-white hover:bg-blue-500"
                        >
                            continue
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
