import { ALL_ASSET_CATALOG } from './marketData';
import { TIMELINE } from './timeline';
import type { WalletItem } from './walletData';

export const RUN_STATS_KEY = 'timeex_run_stats';
export const GAME_OVER_SUMMARY_KEY = 'timeex_game_over_summary';

export type ActionSummaryEntry = {
    id: string;
    date: string;
    type: 'BUY' | 'SELL' | 'EVENT';
    name: string;
    symbol?: string;
    amount: number;
    units?: number;
    direction: 'spent' | 'received' | 'neutral';
};

export type RunStats = {
    startingCash: number;
    totalMoneyEarned: number;
    totalInvestedAmount: number;
    moneySpentOnEvents: number;
    eventsTriggered: number;
    investmentCount: number;
    actions: ActionSummaryEntry[];
};

export type GameOverSummary = {
    startingCash: number;
    finalBalance: number;
    totalInvestedAmount: number;
    moneySpentOnEvents: number;
    totalMoneyEarned: number;
    eventsTriggered: number;
    actionSummary: ActionSummaryEntry[];
    completedAt: string;
};

function isBrowser() {
    return typeof window !== 'undefined';
}

function roundCurrency(value: number) {
    return Math.round(value * 100) / 100;
}

function getAssetName(symbol: string) {
    return (
        ALL_ASSET_CATALOG.find(asset => asset.symbol === symbol.toUpperCase())?.name ??
        symbol.toUpperCase()
    );
}

function safeParse<T>(raw: string | null): T | null {
    if (!raw) return null;

    try {
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

export function createRunStats(startingCash: number): RunStats {
    return {
        startingCash,
        totalMoneyEarned: 0,
        totalInvestedAmount: 0,
        moneySpentOnEvents: 0,
        eventsTriggered: 0,
        investmentCount: 0,
        actions: [],
    };
}

export function loadRunStats() {
    if (!isBrowser()) return null;

    const parsed = safeParse<Partial<RunStats>>(localStorage.getItem(RUN_STATS_KEY));
    if (!parsed) return null;

    return {
        startingCash: parsed.startingCash ?? 0,
        totalMoneyEarned: parsed.totalMoneyEarned ?? 0,
        totalInvestedAmount: parsed.totalInvestedAmount ?? 0,
        moneySpentOnEvents: parsed.moneySpentOnEvents ?? 0,
        eventsTriggered: parsed.eventsTriggered ?? 0,
        investmentCount: parsed.investmentCount ?? 0,
        actions: parsed.actions ?? [],
    };
}

export function saveRunStats(stats: RunStats) {
    if (!isBrowser()) return;
    localStorage.setItem(RUN_STATS_KEY, JSON.stringify(stats));
}

export function resetRunStats(startingCash: number) {
    saveRunStats(createRunStats(startingCash));
}

export function clearRunStats() {
    if (!isBrowser()) return;
    localStorage.removeItem(RUN_STATS_KEY);
    localStorage.removeItem(GAME_OVER_SUMMARY_KEY);
}

export function recordBuyAction(
    stats: RunStats,
    details: {
        symbol: string;
        totalCost: number;
        units: number;
        date: string;
    }
) {
    stats.investmentCount += 1;
    stats.totalInvestedAmount += details.totalCost;
    stats.actions.push({
        id: `buy-${details.symbol}-${details.date}-${stats.investmentCount}`,
        date: details.date,
        type: 'BUY',
        name: getAssetName(details.symbol),
        symbol: details.symbol,
        amount: roundCurrency(details.totalCost),
        units: Math.round(details.units * 10000) / 10000,
        direction: 'spent',
    });
}

export function recordSellAction(
    stats: RunStats,
    details: {
        symbol: string;
        totalReceived: number;
        units: number;
        date: string;
    }
) {
    stats.totalMoneyEarned += details.totalReceived;
    stats.actions.push({
        id: `sell-${details.symbol}-${details.date}-${stats.actions.length + 1}`,
        date: details.date,
        type: 'SELL',
        name: getAssetName(details.symbol),
        symbol: details.symbol,
        amount: roundCurrency(details.totalReceived),
        units: Math.round(details.units * 10000) / 10000,
        direction: 'received',
    });
}

function getEventName(eventId: string) {
    return (
        TIMELINE.find(marker => marker.kind === 'event' && marker.eventId === eventId)?.title ??
        eventId
    );
}

export function recordEventAction(
    stats: RunStats,
    details: {
        eventId: string;
        valueDelta: number;
        date: string;
    }
) {
    stats.eventsTriggered += 1;
    const amount = roundCurrency(Math.abs(details.valueDelta));

    stats.actions.push({
        id: `event-${details.eventId}-${details.date}-${stats.eventsTriggered}`,
        date: details.date,
        type: 'EVENT',
        name: getEventName(details.eventId),
        amount,
        direction:
            details.valueDelta < 0
                ? 'spent'
                : details.valueDelta > 0
                    ? 'received'
                    : 'neutral',
    });

    if (details.valueDelta < 0) {
        stats.moneySpentOnEvents += amount;
    } else if (details.valueDelta > 0) {
        stats.totalMoneyEarned += amount;
    }
}

export function buildGameOverSummary(
    stats: RunStats,
    wallet: WalletItem[],
    completedAt: Date
): GameOverSummary {
    return {
        startingCash: roundCurrency(stats.startingCash),
        finalBalance: roundCurrency(wallet.reduce((sum, item) => sum + item.usdValue, 0)),
        totalInvestedAmount: roundCurrency(stats.totalInvestedAmount),
        moneySpentOnEvents: roundCurrency(stats.moneySpentOnEvents),
        totalMoneyEarned: roundCurrency(stats.totalMoneyEarned),
        eventsTriggered: stats.eventsTriggered,
        actionSummary: [...stats.actions].sort((left, right) => left.date.localeCompare(right.date)),
        completedAt: completedAt.toISOString(),
    };
}

export function saveGameOverSummary(summary: GameOverSummary) {
    if (!isBrowser()) return;
    localStorage.setItem(GAME_OVER_SUMMARY_KEY, JSON.stringify(summary));
}

export function loadGameOverSummary() {
    if (!isBrowser()) return null;

    const parsed = safeParse<Partial<GameOverSummary>>(localStorage.getItem(GAME_OVER_SUMMARY_KEY));
    if (!parsed) return null;

    return {
        startingCash: parsed.startingCash ?? 0,
        finalBalance: parsed.finalBalance ?? 0,
        totalInvestedAmount: parsed.totalInvestedAmount ?? 0,
        moneySpentOnEvents: parsed.moneySpentOnEvents ?? 0,
        totalMoneyEarned: parsed.totalMoneyEarned ?? 0,
        eventsTriggered: parsed.eventsTriggered ?? 0,
        actionSummary: parsed.actionSummary ?? [],
        completedAt: parsed.completedAt ?? new Date(0).toISOString(),
    };
}
