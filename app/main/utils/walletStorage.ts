import type { WalletItem } from './walletData'; // or wherever WalletItem lives

export const WALLET_KEY = 'timeex_wallet';

export function loadWallet(): WalletItem[] | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(WALLET_KEY);
    return raw ? JSON.parse(raw) : null;
}

export function saveWallet(wallet: WalletItem[]) {
    localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
}

export function clearWallet() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(WALLET_KEY);
}
