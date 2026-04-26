import type { WalletItem } from './walletData';

export type GameOverState = {
    reason: string;
    date: string;
};

export const WALLET_KEY = 'timeex_wallet';
export const LEGACY_WALLET_KEY = 'wallet';
export const STARTING_CASH_KEY = 'timeex_starting_cash';
export const GAME_OVER_KEY = 'gameOver';
export const DEFAULT_STARTING_CASH = 5000;

function isWalletItem(value: unknown): value is WalletItem {
    if (!value || typeof value !== 'object') return false;

    const candidate = value as Partial<WalletItem>;
    return (
        typeof candidate.id === 'string' &&
        typeof candidate.label === 'string' &&
        typeof candidate.unitLabel === 'string' &&
        typeof candidate.units === 'number' &&
        Number.isFinite(candidate.units) &&
        typeof candidate.usdValue === 'number' &&
        Number.isFinite(candidate.usdValue)
    );
}

export function readStoredJson<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    const raw = localStorage.getItem(key);
    if (!raw) return null;

    try {
        return JSON.parse(raw) as T;
    } catch {
        localStorage.removeItem(key);
        return null;
    }
}

export function loadWallet(): WalletItem[] | null {
    if (typeof window === 'undefined') return null;

    const wallet =
        readStoredJson<unknown>(WALLET_KEY) ??
        readStoredJson<unknown>(LEGACY_WALLET_KEY);

    if (!Array.isArray(wallet) || !wallet.every(isWalletItem)) {
        localStorage.removeItem(WALLET_KEY);
        localStorage.removeItem(LEGACY_WALLET_KEY);
        return null;
    }

    localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
    localStorage.removeItem(LEGACY_WALLET_KEY);
    return wallet;
}

export function saveWallet(wallet: WalletItem[]) {
    localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
    localStorage.removeItem(LEGACY_WALLET_KEY);
}

export function loadStartingCash(fallback = DEFAULT_STARTING_CASH) {
    if (typeof window === 'undefined') return fallback;

    const raw = localStorage.getItem(STARTING_CASH_KEY);
    const parsed = Number.parseFloat(raw ?? '');

    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function saveStartingCash(startingCash: number) {
    localStorage.setItem(STARTING_CASH_KEY, String(startingCash));
}

export function loadGameOver() {
    const value = readStoredJson<GameOverState>(GAME_OVER_KEY);

    if (!value || typeof value.reason !== 'string' || typeof value.date !== 'string') {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(GAME_OVER_KEY);
        }
        return null;
    }

    return value;
}

export function saveGameOver(reason: string): GameOverState {
    const nextState: GameOverState = {
        reason,
        date: new Date().toISOString(),
    };

    localStorage.setItem(GAME_OVER_KEY, JSON.stringify(nextState));
    return nextState;
}

export function clearGameOver() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(GAME_OVER_KEY);
}
