export type WalletItem = {
  id: string;
  label: string;
  units: number;   // how much you own
  unitLabel: string; // shares, oz, bbl, etc.
  usdValue: number;  // total USD value
};

