export type WalletItem = {
  id: string;
  label: string;
  units: number;   // how much you own
  unitLabel: string; // shares, oz, bbl, etc.
  usdValue: number;  // total USD value
};

export const INITIAL_WALLET: WalletItem[] = [
  { id: 'cash', label: 'Cash', units: 2456, unitLabel: '$', usdValue: 2456 },

  { id: 'btc', label: 'BTC', units: 0.005, unitLabel: 'BTC', usdValue: 350 },
  { id: 'eth', label: 'ETH', units: 1.24, unitLabel: 'ETH', usdValue: 3980 },

  { id: 'oil', label: 'Oil', units: 1.8, unitLabel: 'bbl', usdValue: 108 },
  { id: 'silver', label: 'Silver', units: 2.3, unitLabel: 'oz', usdValue: 54 },
  { id: 'gold', label: 'Gold', units: 0.49, unitLabel: 'oz', usdValue: 2000 },

  { id: 'aapl', label: 'AAPL', units: 0.4, unitLabel: 'shares', usdValue: 60 },
  { id: 'msft', label: 'MSFT', units: 0.25, unitLabel: 'shares', usdValue: 95 },
  { id: 'nvda', label: 'NVDA', units: 0.12, unitLabel: 'shares', usdValue: 62 },
  { id: 'tsla', label: 'TSLA', units: 0.18, unitLabel: 'shares', usdValue: 47 },
];
