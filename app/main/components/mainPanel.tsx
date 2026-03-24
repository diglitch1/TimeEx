'use client';

import {useState, useEffect, useMemo, useRef, useId} from 'react';
import { type WalletItem } from '../utils/walletData';
import { getChartData, type RangeKey } from '../utils/chartSelector';
import {
    BROWSE_ASSET_CATALOG,
    FEATURED_ASSET_CATALOG,
    getAssetsWithMarket,
    toLocalDateStr,
    type AssetMarket,
} from '../utils/marketData';
import type { GameNotification } from '../utils/notifications';
import NotificationCenter from './NotificationCenter';
import AssetAvatar from './AssetAvatar';

function resolveCatalogAssets(
    catalog: Array<{ symbol: string }>,
    assetBySymbol: Map<string, AssetMarket>
) {
    return catalog
        .map(asset => assetBySymbol.get(asset.symbol))
        .filter((asset): asset is AssetMarket => asset !== undefined);
}

type TradeRequest = {
    wallet: WalletItem[];
    symbol: string;
    price: number;
    side: 'buy' | 'sell';
    dollarAmount: number;
    unitAmount: number;
};

type TradeOutcome =
    | {
        nextWallet: WalletItem[];
        units: number;
        totalValue: number;
    }
    | {
        error: string;
    };

function executeTrade({
    wallet,
    symbol,
    price,
    side,
    dollarAmount,
    unitAmount,
}: TradeRequest): TradeOutcome {
    const cash = wallet.find(item => item.label === 'Cash');
    if (!cash) {
        return { error: 'Cash balance unavailable' };
    }

    const position = wallet.find(item => item.label === symbol);

    if (side === 'buy') {
        if (cash.units < dollarAmount) {
            return { error: 'Not enough cash' };
        }

        const boughtUnits = dollarAmount / price;
        let hasPosition = false;

        const nextWallet = wallet.map(item => {
            if (item.label === 'Cash') {
                const nextCashUnits = item.units - dollarAmount;
                return {
                    ...item,
                    units: nextCashUnits,
                    usdValue: nextCashUnits,
                };
            }

            if (item.label === symbol) {
                hasPosition = true;
                const nextUnits = item.units + boughtUnits;
                return {
                    ...item,
                    units: nextUnits,
                    usdValue: nextUnits * price,
                };
            }

            return item;
        });

        if (!hasPosition) {
            nextWallet.push({
                id: crypto.randomUUID(),
                label: symbol,
                units: boughtUnits,
                unitLabel: symbol,
                usdValue: boughtUnits * price,
            });
        }

        return {
            nextWallet,
            units: boughtUnits,
            totalValue: dollarAmount,
        };
    }

    if (!position || position.units < unitAmount) {
        return { error: 'Not enough asset' };
    }

    const cashReceived = unitAmount * price;

    const nextWallet = wallet
        .map(item => {
            if (item.label === 'Cash') {
                const nextCashUnits = item.units + cashReceived;
                return {
                    ...item,
                    units: nextCashUnits,
                    usdValue: nextCashUnits,
                };
            }

            if (item.label === symbol) {
                const nextUnits = item.units - unitAmount;
                return {
                    ...item,
                    units: nextUnits,
                    usdValue: nextUnits * price,
                };
            }

            return item;
        })
        .filter(item => item.units > 0);

    return {
        nextWallet,
        units: unitAmount,
        totalValue: cashReceived,
    };
}

export default function MainTradePanel({
    currentDate,
    secondsLeft,
    wallet,
    setWallet,
    gameHour,
    onSkip30,
    onSkipDay,
    notifications,
    activeToastIds,
    historyOpen,
    onSetHistoryOpen,
    onDismissToast,
    onBuyNotification,
    onSellNotification,
}: {
    currentDate: Date;
    secondsLeft: number;
    wallet: WalletItem[];
    setWallet: React.Dispatch<React.SetStateAction<WalletItem[]>>;
    gameHour: number;
    onSkip30: () => void;
    onSkipDay: () => void;
    notifications: GameNotification[];
    activeToastIds: string[];
    historyOpen: boolean;
    onSetHistoryOpen: (open: boolean) => void;
    onDismissToast: (id: string) => void;
    onBuyNotification: (details: {
        symbol: string;
        units: number;
        totalCost: number;
        price: number;
        timestamp: Date;
    }) => void;
    onSellNotification: (details: {
        symbol: string;
        units: number;
        totalReceived: number;
        price: number;
        timestamp: Date;
    }) => void;
}) {

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    const gameDate = currentDate.toLocaleDateString('en-CA', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const dateStr = toLocalDateStr(currentDate);

    const allAssetsWithMarket = useMemo<AssetMarket[]>(
        () => getAssetsWithMarket(dateStr, 12),
        [dateStr]
    );

    const assetBySymbol = useMemo(
        () => new Map(allAssetsWithMarket.map(asset => [asset.symbol, asset])),
        [allAssetsWithMarket]
    );

    const walletByLabel = useMemo(
        () => new Map(wallet.map(item => [item.label, item])),
        [wallet]
    );

    const ownedSymbols = useMemo(
        () =>
            new Set(
                wallet
                    .filter(item => item.id !== 'cash' && item.units > 0)
                    .map(item => item.label)
            ),
        [wallet]
    );

    const featuredAssets = useMemo<AssetMarket[]>(
        () => resolveCatalogAssets(FEATURED_ASSET_CATALOG, assetBySymbol),
        [assetBySymbol]
    );

    const browseAssets = useMemo<AssetMarket[]>(
        () => resolveCatalogAssets(BROWSE_ASSET_CATALOG, assetBySymbol),
        [assetBySymbol]
    );

    useEffect(() => {
        setWallet(prev =>
            prev.map(item => {
                if (item.label === 'Cash') {
                    return {
                        ...item,
                        usdValue: item.units,
                    };
                }
                const asset = assetBySymbol.get(item.label);

                if (!asset?.hasData) return item;

                return {
                    ...item,
                    usdValue: item.units * asset.price,
                };
            })
        );
    }, [assetBySymbol, setWallet]);


    const [range, setRange] = useState<RangeKey>('1W');
    const [marketSearch, setMarketSearch] = useState('');

    const [activeSymbol, setActiveSymbol] = useState<string | null>(null);

    const activeAsset = useMemo(() => {
        if (activeSymbol) {
            return assetBySymbol.get(activeSymbol) ?? null;
        }
        return allAssetsWithMarket.find(a => a.hasData) ?? null;
    }, [activeSymbol, allAssetsWithMarket, assetBySymbol]);

    const chartData = useMemo(() => {
        if (!activeAsset || !activeAsset.hasData) return [];
        return getChartData(activeAsset.data, range, dateStr);
    }, [activeAsset, range, dateStr]);

    const rangeSummary = useMemo(() => {
        return calculateRangeSummary(chartData);
    }, [chartData]);

    const rangeLabel = getRangeLabel(range);

    const hasActiveData = activeAsset?.hasData === true;

    const [side, setSide] = useState<'buy' | 'sell'>('buy');

    const [amount, setAmount] = useState(''); // $
    const [units, setUnits] = useState('');   // shares

    const price = activeAsset?.hasData ? activeAsset.price : 0;

    const lastEdited = useRef<'amount' | 'units' | null>(null);

    const cashBalance = walletByLabel.get('Cash')?.units ?? 0;

    const filteredAssets = useMemo(() => {
        const query = marketSearch.trim().toLowerCase();
        if (!query) return browseAssets;

        return browseAssets.filter(asset =>
            asset.symbol.toLowerCase().includes(query) ||
            asset.name.toLowerCase().includes(query)
        );
    }, [browseAssets, marketSearch]);

    const resetTradeDraft = () => {
        setAmount('');
        setUnits('');
        lastEdited.current = null;
    };

    const handleSelectAsset = (asset: AssetMarket) => {
        if (!asset.hasData) return;
        resetTradeDraft();
        setActiveSymbol(asset.symbol);
        if (!ownedSymbols.has(asset.symbol)) {
            setSide('buy');
        }
    };

    const handleAmountChange = (val: string) => {
        lastEdited.current = 'amount';
        const num = Number(val);
        if (!price || isNaN(num)) {
            setAmount(val);
            setUnits('');
            return;
        }

        if (tradeSide === 'sell') {
            const boundedUnits = Math.min(num / price, ownedUnits);
            setUnits(boundedUnits.toFixed(4));
            setAmount((boundedUnits * price).toFixed(2));
            return;
        }

        setAmount(val);
        setUnits((num / price).toFixed(4));
    };

    const handleUnitsChange = (val: string) => {
        lastEdited.current = 'units';
        const num = Number(val);
        if (!price || isNaN(num)) {
            setUnits(val);
            setAmount('');
            return;
        }

        if (tradeSide === 'sell') {
            const boundedUnits = Math.min(num, ownedUnits);
            setUnits(boundedUnits.toFixed(4));
            setAmount((boundedUnits * price).toFixed(2));
            return;
        }

        setUnits(val);
        setAmount((num * price).toFixed(2));
    };

    const handleConfirmTrade = () => {
        if (!activeAsset || !activeAsset.hasData) {
            alert('No market data available');
            return;
        }

        const price = activeAsset.price;

        const dollarAmount = Number(amount);
        const unitAmount = Number(units);

        if (tradeSide === 'buy' && (isNaN(dollarAmount) || dollarAmount <= 0)) {
            alert('Enter dollar amount');
            return;
        }

        if (tradeSide === 'sell' && (isNaN(unitAmount) || unitAmount <= 0)) {
            alert('Enter units');
            return;
        }

        const trade = executeTrade({
            wallet,
            symbol: activeAsset.symbol,
            price,
            side: tradeSide,
            dollarAmount,
            unitAmount,
        });

        if ('error' in trade) {
            alert(trade.error);
            return;
        }

        setWallet(trade.nextWallet);

        if (tradeSide === 'buy') {
            onBuyNotification({
                symbol: activeAsset.symbol,
                units: Number(trade.units.toFixed(4)),
                totalCost: trade.totalValue,
                price,
                timestamp: currentDate,
            });
        } else {
            onSellNotification({
                symbol: activeAsset.symbol,
                units: Number(trade.units.toFixed(4)),
                totalReceived: trade.totalValue,
                price,
                timestamp: currentDate,
            });
        }

        resetTradeDraft();
    };

    useEffect(() => {
        if (!price) return;

        if (lastEdited.current === 'amount' && amount !== '') {
            const num = Number(amount);
            if (!isNaN(num)) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setUnits((num / price).toFixed(4));
            }
        }

        if (lastEdited.current === 'units' && units !== '') {
            const num = Number(units);
            if (!isNaN(num)) {
                setAmount((num * price).toFixed(2));
            }
        }
    }, [price, amount, units]);

    const ownedAsset = useMemo(() => {
        if (!activeAsset) return null;
        return walletByLabel.get(activeAsset.symbol) ?? null;
    }, [activeAsset, walletByLabel]);

    const ownedUnits = ownedAsset?.units ?? 0;
    const ownedValue = ownedUnits * price;
    const tradeSide: 'buy' | 'sell' = side === 'sell' && ownedUnits <= 0 ? 'buy' : side;
    const marketStatus = gameHour >= 9 && gameHour < 16
        ? { label: 'Market Open', tone: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
        : { label: 'Market Closed', tone: 'bg-gray-100 text-gray-600 border-gray-200' };
    const amountValue = Number(amount);
    const unitsValue = Number(units);
    const validAmount = Number.isFinite(amountValue) ? amountValue : 0;
    const validUnits = Number.isFinite(unitsValue) ? unitsValue : 0;
    const estimatedValue = tradeSide === 'buy' ? validAmount : validUnits * price;
    const canAffordTrade = tradeSide === 'buy' ? validAmount > 0 && validAmount <= cashBalance : validUnits > 0 && validUnits <= ownedUnits;
    const isTradeReady = hasActiveData && canAffordTrade;

    const applyBuyPreset = (preset: number) => {
        if (!price) return;
        const nextAmount = Math.min(preset, cashBalance);
        if (nextAmount <= 0) return;
        lastEdited.current = 'amount';
        setAmount(nextAmount.toFixed(2));
        setUnits((nextAmount / price).toFixed(4));
    };

    const applySellPreset = (ratio: number) => {
        if (!price || ownedUnits <= 0) return;
        const nextUnits = ownedUnits * ratio;
        lastEdited.current = 'units';
        setUnits(nextUnits.toFixed(4));
        setAmount((nextUnits * price).toFixed(2));
    };



    return (
        <div className="flex-1 w-full bg-transparent px-4 py-4">

            {/* TIME INFO */}
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <p className="text-lg text-gray-800">
                        Time now:{' '}
                        <span className="font-semibold">{gameDate} </span>
                    </p>
                    <p className={`text-xl font-semibold ${secondsLeft <= 180 ? 'text-red-500' : 'text-green-600'}`}>
                        Time remaining: {minutes}:{seconds.toString().padStart(2, '0')}
                    </p>

                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onSkip30}
                        className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 cursor-pointer"
                        title="Skip 30 seconds"
                    >
                        +30s
                    </button>

                    <button
                        onClick={onSkipDay}
                        className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 cursor-pointer"
                        title="Skip to next day"
                    >
                        Next Day
                    </button>

                    <NotificationCenter
                        notifications={notifications}
                        activeToastIds={activeToastIds}
                        historyOpen={historyOpen}
                        onSetHistoryOpen={onSetHistoryOpen}
                        onDismissToast={onDismissToast}
                    />
                </div>
            </div>

            {/* ASSET CAROUSEL */}
            <div className="w-full">
                <div className="relative rounded-[28px] border border-gray-200 bg-white px-5 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                    <div className="mb-4 flex items-center justify-between gap-4 px-1">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-400">
                                Featured Stocks
                            </p>
                            <p className="mt-1 text-lg font-semibold text-gray-950">
                                Quick picks for the active market
                            </p>
                        </div>
                        <p className="text-sm text-gray-500">
                            {browseAssets.length} names in market browser
                        </p>
                    </div>

                    <div className="flex gap-5 overflow-x-auto px-1 pb-1">
                        {featuredAssets.map(asset => {
                            const isActive = activeAsset !== null && asset.symbol === activeAsset.symbol;

                            return (
                                <div
                                    key={asset.symbol}
                                    onClick={() => handleSelectAsset(asset)}

                                    className={`min-w-[300px] cursor-pointer rounded-[24px] border px-6 py-5 transition shadow-[0_8px_24px_rgba(15,23,42,0.04)]
                    ${isActive
                                        ? 'border-blue-500 bg-blue-50/80'
                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/70'}
                  `}
                                >
                                    <div className="flex items-start justify-between gap-6">
                                        <div className="flex min-w-0 flex-col gap-1.5">
                                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">
                                                {asset.symbol}
                                            </p>
                                            <p className="truncate text-lg font-semibold text-gray-950">
                                                {asset.name}
                                            </p>
                                            <p className="text-3xl font-semibold tracking-tight text-gray-950">
                                                {asset.hasData ? formatCurrency(asset.price) : '—'}
                                            </p>
                                            <p className={`text-sm font-semibold ${
                                                !asset.hasData ? 'text-gray-400' :
                                                    asset.positive ? 'text-emerald-700' : 'text-red-700'
                                            }`}>
                                                {asset.hasData
                                                    ? `${asset.change >= 0 ? '+' : ''}${asset.change.toFixed(2)}% today`
                                                    : 'No data'}
                                            </p>
                                        </div>

                                        {asset.hasData && (
                                            <div className="w-28 shrink-0 pt-3">
                                                <MiniSparkline
                                                    data={asset.spark}
                                                    positive={asset.positive}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-gray-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                <div className="flex flex-col gap-4 border-b border-gray-200 pb-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-400">
                            All Stocks
                        </p>
                        <p className="mt-1 text-lg font-semibold text-gray-950">
                            Browse the full market list
                        </p>
                    </div>

                    <div className="w-full md:max-w-xs">
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                            Search
                        </label>
                        <input
                            type="text"
                            value={marketSearch}
                            onChange={event => setMarketSearch(event.target.value)}
                            placeholder="Search ticker or company"
                            className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-300 focus:bg-white"
                        />
                    </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-[24px] border border-gray-200">
                    <div className="grid grid-cols-[minmax(0,1.5fr)_120px_120px_110px] gap-3 bg-gray-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                        <span>Stock</span>
                        <span>Price</span>
                        <span>Move</span>
                        <span>Status</span>
                    </div>

                    <div className="max-h-[360px] overflow-y-auto">
                        {filteredAssets.length === 0 ? (
                            <div className="px-5 py-10 text-center text-sm text-gray-500">
                                No stocks match that search.
                            </div>
                        ) : (
                            filteredAssets.map(asset => {
                                const isActive = activeAsset !== null && asset.symbol === activeAsset.symbol;
                                const isOwned = ownedSymbols.has(asset.symbol);

                                return (
                                    <button
                                        key={`all-${asset.symbol}`}
                                        type="button"
                                        onClick={() => handleSelectAsset(asset)}
                                        disabled={!asset.hasData}
                                        className={`grid w-full grid-cols-[minmax(0,1.5fr)_120px_120px_110px] gap-3 border-t border-gray-100 px-5 py-4 text-left transition ${
                                            isActive
                                                ? 'bg-blue-50/80'
                                                : 'bg-white hover:bg-gray-50'
                                        } ${!asset.hasData ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <AssetAvatar
                                                symbol={asset.symbol}
                                                name={asset.name}
                                                size={28}
                                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-gray-200 bg-white p-2 shadow-[0_6px_16px_rgba(15,23,42,0.06)]"
                                                imageClassName="h-7 w-7 object-contain"
                                                fallbackTextClassName="text-[10px]"
                                            />

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-gray-950">
                                                    {asset.name}
                                                </p>
                                                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                                                    {asset.symbol}
                                                </p>
                                            </div>
                                        </div>

                                        <span className="text-sm font-semibold text-gray-950">
                                            {asset.hasData ? formatCurrency(asset.price) : '—'}
                                        </span>

                                        <span className={`text-sm font-semibold ${
                                            !asset.hasData
                                                ? 'text-gray-400'
                                                : asset.positive
                                                    ? 'text-emerald-700'
                                                    : 'text-red-700'
                                        }`}>
                                            {asset.hasData
                                                ? `${asset.change >= 0 ? '+' : ''}${asset.change.toFixed(2)}%`
                                                : 'No data'}
                                        </span>

                                        <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                            isOwned
                                                ? 'bg-amber-100 text-amber-700'
                                                : isActive
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {isOwned ? 'Owned' : isActive ? 'Selected' : 'Browse'}
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
            {/* ================= TRADE PANEL ================= */}

            <div className="mt-10 grid grid-cols-[minmax(0,1fr)_360px] items-start gap-8">


                {/* LEFT: CHART */}
                <div className="min-w-0 self-start rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">

                    {/* HEADER */}
                    <div className="mb-5 border-b border-gray-200 pb-5">
                        {hasActiveData && (
                            <div className="mb-4 flex items-center gap-4">
                                <AssetAvatar
                                    symbol={activeAsset.symbol}
                                    name={activeAsset.name}
                                    size={36}
                                    className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-200 bg-white p-2"
                                    imageClassName="h-9 w-9 object-contain"
                                    fallbackTextClassName="text-xs"
                                />
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">
                                        {activeAsset.symbol}
                                    </p>
                                    <p className="text-[2rem] font-semibold tracking-tight text-gray-950">
                                        {activeAsset.name}
                                    </p>
                                </div>
                            </div>
                        )}

                        {hasActiveData ? (
                            <div className="flex flex-wrap items-end gap-3">
                                <p className="text-5xl font-semibold tracking-tight text-gray-950">
                                    {formatCurrency(activeAsset.price)}
                                </p>

                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-base font-semibold ${
                                    rangeSummary.positive
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-red-100 text-red-700'
                                }`}>
                                    {rangeSummary.percent >= 0 ? '+' : ''}
                                    {rangeSummary.percent.toFixed(2)}%
                                </span>

                                <p className={`pb-1 text-xl font-semibold ${
                                    rangeSummary.positive ? 'text-emerald-700' : 'text-red-700'
                                }`}>
                                    {rangeSummary.absolute >= 0 ? '+' : '-'}
                                    {formatCurrency(Math.abs(rangeSummary.absolute))} {rangeLabel}
                                </p>
                            </div>
                        ) : (
                            <p className="text-red-500 font-semibold">
                                Not enough data found
                            </p>
                        )}
                        {hasActiveData && (
                            <p className="mt-2 text-sm text-gray-500">
                                {gameDate} · USD
                            </p>
                        )}
                    </div>

                    <div className="mb-5 flex gap-2 text-sm">
                        {(['1W', '1M', '6M', '1Y'] as const).map(r => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                className={`rounded-full px-3 py-1.5 font-semibold transition ${
                                    range === r
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>

                    <div className={`rounded-[28px] border p-4 ${
                        rangeSummary.positive
                            ? 'border-emerald-100 bg-gradient-to-b from-emerald-50 via-white to-white'
                            : 'border-red-100 bg-gradient-to-b from-red-50 via-white to-white'
                    }`}>
                        <div
                            style={{height: '430px'}}
                            className="mx-auto w-full max-w-[1080px] rounded-[24px] bg-white p-3"
                        >
                            {hasActiveData && chartData.length > 1 ? (
                                <HoverChart
                                    rows={chartData}
                                    positive={rangeSummary.positive}
                                    range={range}
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-gray-400">
                                    No data found for this date
                                </div>
                            )}
                        </div>
                    </div>

                </div>


                {/* RIGHT */}
                <div className="self-start rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">

                    <div className={`mb-6 rounded-[24px] border p-4 ${
                        tradeSide === 'buy'
                            ? 'border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white'
                            : 'border-red-100 bg-gradient-to-br from-red-50 via-white to-white'
                    }`}>
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-400">
                                    Trade Ticket
                                </p>
                                <p className="mt-1 text-2xl font-semibold tracking-tight text-gray-950">
                                    {activeAsset?.symbol ?? 'Select Asset'}
                                </p>
                            </div>
                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${marketStatus.tone}`}>
                                {marketStatus.label}
                            </span>
                        </div>

                        <div className="mb-4 grid grid-cols-2 gap-3">
                            <div className="rounded-[18px] border border-gray-200 bg-white p-3">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                                    Price
                                </p>
                                <p className="mt-1 text-lg font-semibold text-gray-950">
                                    {hasActiveData ? formatCurrency(price) : 'N/A'}
                                </p>
                            </div>
                            <div className="rounded-[18px] border border-gray-200 bg-white p-3">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                                    {tradeSide === 'buy' ? 'Cash Available' : 'Units Owned'}
                                </p>
                                <p className="mt-1 text-lg font-semibold text-gray-950">
                                    {tradeSide === 'buy'
                                        ? formatCurrency(cashBalance)
                                        : `${ownedUnits.toFixed(4)} ${activeAsset?.symbol ?? ''}`.trim()}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-center gap-3">
                            <div className="flex h-[52px] w-full rounded-full border border-gray-200 bg-white p-1">
                            <button
                                onClick={() => {
                                    if (tradeSide === 'buy') return;
                                    resetTradeDraft();
                                    setSide('buy');
                                }}
                                className={`flex-1 rounded-full font-semibold text-lg transition
                                    ${tradeSide === 'buy'
                                    ? 'bg-emerald-500 text-white shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}>
                                Buy
                            </button>

                            <button
                                onClick={() => {
                                    if (ownedUnits === 0 || tradeSide === 'sell') return;
                                    resetTradeDraft();
                                    setSide('sell');
                                }}
                                disabled={ownedUnits === 0}
                                className={`flex-1 py-2 rounded-full text-lg font-semibold transition ${tradeSide === 'sell'
                                    ? 'bg-red-500 text-white shadow-sm'
                                    : ownedUnits === 0
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                            >
                                Sell
                            </button>

                        </div>
                    </div>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                        {(tradeSide === 'buy'
                            ? [50, 250, 500, 1000].map(preset => ({
                                key: String(preset),
                                label: formatCurrency(preset),
                                action: () => applyBuyPreset(preset),
                                disabled: cashBalance <= 0,
                            }))
                            : [0.25, 0.5, 0.75, 1].map(ratio => ({
                                key: String(ratio),
                                label: `${Math.round(ratio * 100)}%`,
                                action: () => applySellPreset(ratio),
                                disabled: ownedUnits <= 0,
                            }))
                        ).map(preset => (
                            <button
                                key={preset.key}
                                type="button"
                                disabled={preset.disabled}
                                onClick={preset.action}
                                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-600 transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:text-gray-300"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    {tradeSide === 'sell' && ownedUnits > 0 && (
                        <div className="mb-4 rounded-[20px] border border-red-100 bg-red-50/60 p-4 text-sm">
                            <p className="text-red-600">Your position</p>
                            <p className="font-semibold text-gray-900">
                                {ownedUnits.toFixed(4)} {activeAsset?.symbol}
                                <span className="text-gray-500">
                                    {' '}({formatCurrency(ownedValue)})
                                </span>
                            </p>
                        </div>
                    )}


                    {/* AMOUNT ($) */}
                    <div className={`mb-4 rounded-[22px] border p-4 transition ${
                        tradeSide === 'buy'
                            ? 'border-emerald-100 bg-emerald-50/40 focus-within:border-emerald-300'
                            : 'border-red-100 bg-red-50/35 focus-within:border-red-300'
                    }`}>
                        <label className="mb-1 block text-sm text-gray-500">
                            {tradeSide === 'buy' ? 'Order Amount (USD)' : 'Target Proceeds (USD)'}
                        </label>

                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => handleAmountChange(e.target.value)}
                            className="w-full bg-transparent text-2xl font-semibold text-black outline-none"
                            placeholder="0.00"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            {tradeSide === 'buy'
                                ? `Cash available: ${formatCurrency(cashBalance)}`
                                : `Maximum you can sell: ${formatCurrency(ownedValue)}`}
                        </p>
                    </div>

                    {/* UNITS */}
                    <div className={`mb-4 rounded-[22px] border p-4 transition ${
                        tradeSide === 'buy'
                            ? 'border-blue-100 bg-blue-50/35 focus-within:border-blue-300'
                            : 'border-amber-100 bg-amber-50/40 focus-within:border-amber-300'
                    }`}>
                        <label className="mb-1 block text-sm text-gray-500">
                            Units
                        </label>

                        <input
                            type="number"
                            value={units}
                            max={tradeSide === 'sell' ? ownedUnits : undefined}
                            onChange={(e) => {
                                const val = e.target.value;
                                handleUnitsChange(val);
                            }}
                            className="w-full bg-transparent text-2xl font-semibold text-black outline-none"
                            placeholder="0.0000"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            {tradeSide === 'buy'
                                ? `Estimated units at current price`
                                : `Owned units: ${ownedUnits.toFixed(4)} ${activeAsset?.symbol ?? ''}`.trim()}
                        </p>
                    </div>

                    <div className="rounded-[24px] border border-gray-200 bg-gray-50 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-400">
                            Trade Preview
                        </p>
                        <div className="mt-3 space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Action</span>
                                <span className="font-semibold text-gray-900">
                                    {tradeSide === 'buy' ? 'Buy' : 'Sell'} {activeAsset?.symbol ?? ''}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Estimated Value</span>
                                <span className="font-semibold text-gray-900">
                                    {formatCurrency(estimatedValue || 0)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Units</span>
                                <span className="font-semibold text-gray-900">
                                    {validUnits > 0 ? validUnits.toFixed(4) : '0.0000'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Status</span>
                                <span className={`font-semibold ${isTradeReady ? 'text-emerald-700' : 'text-amber-600'}`}>
                                    {isTradeReady ? 'Ready to submit' : tradeSide === 'buy' ? 'Enter a valid affordable amount' : 'Enter sellable units'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleConfirmTrade}
                        disabled={!isTradeReady}
                        className={`mt-6 w-full rounded-full py-4 text-lg font-semibold transition ${
                            isTradeReady
                                ? tradeSide === 'buy'
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-400 cursor-pointer'
                                    : 'bg-red-500 text-white hover:bg-red-400 cursor-pointer'
                                : 'cursor-not-allowed bg-gray-200 text-gray-400'
                        }`}>
                        {tradeSide === 'buy' ? `Buy ${activeAsset?.symbol ?? ''}`.trim() : `Sell ${activeAsset?.symbol ?? ''}`.trim()}
                    </button>

                </div>

            </div>
            {/* ================= END TRADE PANEL ================= */}

        </div>
    );

}

// mini graph in assets carousel
function MiniSparkline({data, positive,}: {
    data: number[];
    positive: boolean;
}) {
    if (data.length === 0) {
        return <div className="h-12 w-full" />;
    }

    const safeData = data.length === 1 ? [data[0], data[0]] : data;
    const max = Math.max(...safeData);
    const min = Math.min(...safeData);
    const span = Math.max(max - min, 1);

    const points = safeData
        .map((v, i) => {
            const x = (i / (safeData.length - 1)) * 100;
            const y = 100 - ((v - min) / span) * 100;
            return `${x},${y}`;
        })
        .join(' ');

    return (
        <svg
            viewBox="0 0 100 100"
            className="h-12 w-full"
            preserveAspectRatio="none"
        >
            <polyline
                points={points}
                fill="none"
                stroke={positive ? '#22c55e' : '#ef4444'}
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

function calculateRangeSummary(rows: { date: string; close: number }[]) {
    if (!rows || rows.length < 2) {
        return { absolute: 0, percent: 0, positive: true };
    }

    const start = rows[0].close;
    const end = rows[rows.length - 1].close;
    const absolute = end - start;
    const percent = start === 0 ? 0 : (absolute / start) * 100;

    return {
        absolute,
        percent,
        positive: absolute >= 0,
    };
}

function getRangeLabel(range: RangeKey) {
    if (range === '1W') return '1W';
    if (range === '1M') return '1M';
    if (range === '6M') return '6M';
    return '1Y';
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function formatAxisValue(value: number) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: value < 10 ? 2 : 0,
        maximumFractionDigits: value < 10 ? 2 : 0,
    }).format(value);
}

function formatChartDate(dateStr: string, range: RangeKey) {
    const date = new Date(`${dateStr}T00:00:00`);

    return new Intl.DateTimeFormat(
        'en-US',
        range === '1W' || range === '1M'
            ? { month: 'short', day: 'numeric' }
            : { month: 'short', year: '2-digit' }
    ).format(date);
}

function buildDateTicks(
    rows: { date: string; close: number }[],
    range: RangeKey
) {
    if (rows.length === 0) return [];

    const rawIndices = [0, Math.floor((rows.length - 1) / 3), Math.floor(((rows.length - 1) * 2) / 3), rows.length - 1];
    const indices = Array.from(new Set(rawIndices));

    return indices.map(index => ({
        index,
        label: formatChartDate(rows[index].date, range),
    }));
}

function HoverChart({
    rows,
    positive,
    range,
}: {
    rows: { date: string; close: number }[];
    positive: boolean;
    range: RangeKey;
}) {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const gradientId = useId();

    if (rows.length === 0) return null;

    const values = rows.map(r => r.close);
    const max = Math.max(...values);
    const min = Math.min(...values);

    const spread = Math.max(max - min, max * 0.08, 1);
    const padding = spread * 0.2;
    const safeMax = max + padding;
    const safeMin = min - padding;

    const viewWidth = 1000;
    const viewHeight = 420;
    const chartLeft = 96;
    const chartRight = 970;
    const chartTop = 34;
    const chartBottom = 326;

    const points = values.map((v, i) => {
        const x = chartLeft + (i / (values.length - 1)) * (chartRight - chartLeft);
        const y =
            chartBottom - ((v - safeMin) / (safeMax - safeMin)) * (chartBottom - chartTop);
        return { x, y };
    });

    const linePath = points
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
        .join(' ');
    const areaPath = [
        `M ${points[0].x} ${chartBottom}`,
        ...points.map((point, index) => `${index === 0 ? 'L' : 'L'} ${point.x} ${point.y}`),
        `L ${points[points.length - 1].x} ${chartBottom}`,
        'Z',
    ].join(' ');

    const yTicks = Array.from({ length: 5 }, (_, index) => {
        const ratio = index / 4;
        const y = chartTop + ratio * (chartBottom - chartTop);
        const value = safeMax - ratio * (safeMax - safeMin);
        return { y, value };
    });

    const xTicks = buildDateTicks(rows, range);
    const activeIndex = hoverIndex ?? rows.length - 1;
    const activePoint = points[activeIndex];
    const lineColor = positive ? '#16a34a' : '#dc2626';

    return (
        <div className="relative w-full h-full">
            <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${viewWidth} ${viewHeight}`}
                preserveAspectRatio="none"
                className="overflow-visible"
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const clampedX = Math.max(chartLeft / viewWidth, Math.min(chartRight / viewWidth, x / rect.width));
                    const pct = (clampedX - chartLeft / viewWidth) / ((chartRight - chartLeft) / viewWidth);
                    const index = Math.round(pct * (rows.length - 1));
                    setHoverIndex(
                        Math.max(0, Math.min(rows.length - 1, index))
                    );
                }}
                onMouseLeave={() => setHoverIndex(null)}
            >
                <defs>
                    <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={lineColor} stopOpacity="0.22" />
                        <stop offset="65%" stopColor={lineColor} stopOpacity="0.08" />
                        <stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
                    </linearGradient>
                </defs>

                {yTicks.map(tick => (
                    <g key={tick.y}>
                        <line
                            x1={chartLeft}
                            x2={chartRight}
                            y1={tick.y}
                            y2={tick.y}
                            stroke="#e5e7eb"
                            strokeWidth="1"
                            vectorEffect="non-scaling-stroke"
                        />
                        <text
                            x={chartLeft - 18}
                            y={tick.y + 4}
                            fontSize="12"
                            fill="#94a3b8"
                            textAnchor="end"
                        >
                            {formatAxisValue(tick.value)}
                        </text>
                    </g>
                ))}

                <path d={areaPath} fill={`url(#${gradientId})`} />
                <path
                    d={linePath}
                    fill="none"
                    stroke={lineColor}
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                />

                <line
                    x1={activePoint.x}
                    x2={activePoint.x}
                    y1={chartTop}
                    y2={chartBottom}
                    stroke={lineColor}
                    strokeWidth="1.5"
                    strokeDasharray="4 5"
                    opacity={hoverIndex === null ? 0.35 : 0.7}
                    vectorEffect="non-scaling-stroke"
                />

                <circle
                    cx={activePoint.x}
                    cy={activePoint.y}
                    r={8}
                    fill="#ffffff"
                    stroke={lineColor}
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                />

                <circle
                    cx={activePoint.x}
                    cy={activePoint.y}
                    r={3.5}
                    fill={lineColor}
                />

                {xTicks.map(tick => {
                    const point = points[tick.index];
                    return (
                        <text
                            key={`${tick.index}-${tick.label}`}
                            x={point.x}
                            y={387}
                            fontSize="12"
                            fill="#94a3b8"
                            textAnchor={tick.index === 0 ? 'start' : tick.index === rows.length - 1 ? 'end' : 'middle'}
                        >
                            {tick.label}
                        </text>
                    );
                })}
            </svg>

            {/* TOOLTIP */}
            {activeIndex !== null && (
                <div
                    className="absolute rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 shadow-[0_14px_30px_rgba(15,23,42,0.14)]"
                    style={{
                        left: `${(activePoint.x / viewWidth) * 100}%`,
                        top: `${(activePoint.y / viewHeight) * 100}%`,
                        transform: activePoint.x > viewWidth * 0.8 ? 'translate(-105%, -120%)' : 'translate(-10%, -120%)',
                        pointerEvents: 'none',
                    }}
                >
                    <div className="font-semibold text-gray-500">
                        {formatChartDate(rows[activeIndex].date, range)}
                    </div>
                    <div className="mt-1 text-sm font-bold text-gray-950">
                        {formatCurrency(values[activeIndex])}
                    </div>
                </div>
            )}
        </div>
    );
}
