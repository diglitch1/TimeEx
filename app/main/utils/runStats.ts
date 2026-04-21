import { ALL_ASSET_CATALOG } from './marketData';
import type { WalletItem } from './walletData';

export const RUN_STATS_KEY = 'timeex_run_stats';
export const GAME_OVER_SUMMARY_KEY = 'timeex_game_over_summary';

export type TrackedPosition = {
    symbol: string;
    units: number;
    costBasis: number;
};

export type InvestmentLot = {
    id: string;
    symbol: string;
    name: string;
    date: string;
    unitsPurchased: number;
    unitsRemaining: number;
    totalCost: number;
    realizedProceeds: number;
};

export type ActionType = 'BUY' | 'SELL' | 'EVENT';

export type ActionSummaryEntry = {
    id: string;
    date: string;
    type: ActionType;
    name: string;
    symbol?: string;
    amount: number;
    units?: number;
    direction: 'spent' | 'received' | 'neutral';
};

export type RunStats = {
    startingCash: number;
    totalMoneyEarned: number;
    totalMoneySpent: number;
    investmentCount: number;
    totalInvestedAmount: number;
    sellCount: number;
    totalSoldAmount: number;
    eventsTriggered: number;
    moneySpentOnEvents: number;
    positions: Record<string, TrackedPosition>;
    investments: InvestmentLot[];
    actions: ActionSummaryEntry[];
};

export type GameOverSummary = {
    startingCash: number;
    totalMoneyEarned: number;
    totalMoneySpent: number;
    finalBalance: number;
    investmentCount: number;
    totalInvestedAmount: number;
    sellCount: number;
    totalSoldAmount: number;
    eventsTriggered: number;
    moneySpentOnEvents: number;
    actionSummary: ActionSummaryEntry[];
    completedAt: string;
};

function isBrowser() {
    return typeof window !== 'undefined';
}

function safeParse<T>(raw: string | null): T | null {
    if (!raw) return null;

    try {
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
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

export function createRunStats(startingCash: number): RunStats {
    return {
        startingCash,
        totalMoneyEarned: 0,
        totalMoneySpent: 0,
        investmentCount: 0,
        totalInvestedAmount: 0,
        sellCount: 0,
        totalSoldAmount: 0,
        eventsTriggered: 0,
        moneySpentOnEvents: 0,
        positions: {},
        investments: [],
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
        totalMoneySpent: parsed.totalMoneySpent ?? 0,
        investmentCount: parsed.investmentCount ?? 0,
        totalInvestedAmount: parsed.totalInvestedAmount ?? 0,
        sellCount: parsed.sellCount ?? 0,
        totalSoldAmount: parsed.totalSoldAmount ?? 0,
        eventsTriggered: parsed.eventsTriggered ?? 0,
        moneySpentOnEvents: parsed.moneySpentOnEvents ?? 0,
        positions: parsed.positions ?? {},
        investments: parsed.investments ?? [],
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

export function recordBuy(
    stats: RunStats,
    details: {
        symbol: string;
        units: number;
        totalCost: number;
        date: string;
    }
) {
    const symbol = details.symbol.toUpperCase();
    const current = stats.positions[symbol] ?? {
        symbol,
        units: 0,
        costBasis: 0,
    };

    stats.totalMoneySpent += details.totalCost;
    stats.investmentCount += 1;
    stats.totalInvestedAmount += details.totalCost;
    stats.positions[symbol] = {
        symbol,
        units: current.units + details.units,
        costBasis: current.costBasis + details.totalCost,
    };
    stats.investments.push({
        id: `${symbol}-${details.date}-${stats.investmentCount}`,
        symbol,
        name: getAssetName(symbol),
        date: details.date,
        unitsPurchased: details.units,
        unitsRemaining: details.units,
        totalCost: details.totalCost,
        realizedProceeds: 0,
    });
    stats.actions.push({
        id: `buy-${symbol}-${details.date}-${stats.investmentCount}`,
        date: details.date,
        type: 'BUY',
        name: getAssetName(symbol),
        symbol,
        amount: roundCurrency(details.totalCost),
        units: Math.round(details.units * 10000) / 10000,
        direction: 'spent',
    });
}

export function recordSell(
    stats: RunStats,
    details: {
        symbol: string;
        units: number;
        totalReceived: number;
        date?: string;
    }
) {
    const symbol = details.symbol.toUpperCase();
    const current = stats.positions[symbol];

    stats.totalMoneyEarned += details.totalReceived;
    stats.sellCount += 1;
    stats.totalSoldAmount += details.totalReceived;
    stats.actions.push({
        id: `sell-${symbol}-${details.date ?? ''}-${stats.sellCount}`,
        date: details.date ?? new Date(0).toISOString(),
        type: 'SELL',
        name: getAssetName(symbol),
        symbol,
        amount: roundCurrency(details.totalReceived),
        units: Math.round(details.units * 10000) / 10000,
        direction: 'received',
    });

    if (!current || current.units <= 0) {
        return;
    }

    let unitsToAllocate = details.units;
    const lots = stats.investments
        .filter(investment => investment.symbol === symbol && investment.unitsRemaining > 0)
        .sort((left, right) => left.date.localeCompare(right.date));

    for (const lot of lots) {
        if (unitsToAllocate <= 0) break;

        const unitsFromLot = Math.min(lot.unitsRemaining, unitsToAllocate);
        const proceedsShare = details.totalReceived * (unitsFromLot / details.units);

        lot.unitsRemaining = Math.max(0, lot.unitsRemaining - unitsFromLot);
        lot.realizedProceeds += proceedsShare;
        unitsToAllocate -= unitsFromLot;
    }

    const soldRatio = Math.min(1, details.units / current.units);
    const nextUnits = Math.max(0, current.units - details.units);
    const nextCostBasis = Math.max(0, current.costBasis - (current.costBasis * soldRatio));

    if (nextUnits <= 0.000001) {
        delete stats.positions[symbol];
        return;
    }

    stats.positions[symbol] = {
        symbol,
        units: nextUnits,
        costBasis: nextCostBasis,
    };
}

export function recordEventImpact(
    stats: RunStats,
    details: {
        eventId: string;
        eventName: string;
        date: string;
        valueDelta: number;
    }
) {
    stats.eventsTriggered += 1;
    const roundedAmount = roundCurrency(Math.abs(details.valueDelta));

    stats.actions.push({
        id: `event-${details.eventId}-${details.date}-${stats.eventsTriggered}`,
        date: details.date,
        type: 'EVENT',
        name: details.eventName,
        amount: roundedAmount,
        direction:
            details.valueDelta < 0
                ? 'spent'
                : details.valueDelta > 0
                    ? 'received'
                    : 'neutral',
    });

    if (details.valueDelta < 0) {
        const spent = roundedAmount;
        stats.totalMoneySpent += spent;
        stats.moneySpentOnEvents += spent;
        return;
    }

    if (details.valueDelta > 0) {
        stats.totalMoneyEarned += roundedAmount;
    }
}

export function buildGameOverSummary(
    stats: RunStats,
    wallet: WalletItem[],
    completedAt: Date
): GameOverSummary {
    const finalBalance = wallet.reduce((sum, item) => sum + item.usdValue, 0);
    const actionSummary = [...stats.actions].sort((left, right) =>
        left.date.localeCompare(right.date)
    );

    return {
        startingCash: roundCurrency(stats.startingCash),
        totalMoneyEarned: roundCurrency(stats.totalMoneyEarned),
        totalMoneySpent: roundCurrency(stats.totalMoneySpent),
        finalBalance: roundCurrency(finalBalance),
        investmentCount: stats.investmentCount,
        totalInvestedAmount: roundCurrency(stats.totalInvestedAmount),
        sellCount: stats.sellCount,
        totalSoldAmount: roundCurrency(stats.totalSoldAmount),
        eventsTriggered: stats.eventsTriggered,
        moneySpentOnEvents: roundCurrency(stats.moneySpentOnEvents),
        actionSummary,
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
        totalMoneyEarned: parsed.totalMoneyEarned ?? 0,
        totalMoneySpent: parsed.totalMoneySpent ?? 0,
        finalBalance: parsed.finalBalance ?? 0,
        investmentCount: parsed.investmentCount ?? 0,
        totalInvestedAmount: parsed.totalInvestedAmount ?? 0,
        sellCount: parsed.sellCount ?? 0,
        totalSoldAmount: parsed.totalSoldAmount ?? 0,
        eventsTriggered: parsed.eventsTriggered ?? 0,
        moneySpentOnEvents: parsed.moneySpentOnEvents ?? 0,
        actionSummary: parsed.actionSummary ?? [],
        completedAt: parsed.completedAt ?? new Date(0).toISOString(),
    };
}
