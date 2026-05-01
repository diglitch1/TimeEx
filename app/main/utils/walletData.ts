export type WalletItem = {
  id: string;
  label: string;
  units: number;   // how much you own
  unitLabel: string; // shares, oz, bbl, etc.
  usdValue: number;  // total USD value
};

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const unitFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
});

export function formatWalletCurrency(value: number) {
  return usdFormatter.format(value);
}

export function formatWalletUnits(item: WalletItem) {
  if (item.unitLabel.includes('$')) {
    return item.unitLabel === '$'
      ? formatWalletCurrency(item.units)
      : `${formatWalletCurrency(item.units)}/${item.unitLabel.split('/').at(-1) ?? 'month'}`;
  }

  return `${unitFormatter.format(item.units)} ${item.unitLabel}`;
}

