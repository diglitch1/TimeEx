/* eslint-disable @typescript-eslint/no-require-imports */

import { findIndexAtOrBeforeDate } from './findIndexAtOrBeforeDate';

export type MarketRow = {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    'adj close'?: number;
    volume: number;
};

const DELLData = require('../data/DELL.json') as MarketRow[];
const AMGNData = require('../data/imp-stocks/AMGN.json') as MarketRow[];
const ANSSData = require('../data/imp-stocks/ANSS.json') as MarketRow[];
const ASMLData = require('../data/imp-stocks/ASML.json') as MarketRow[];
const AXPData = require('../data/imp-stocks/AXP.json') as MarketRow[];
const CATData = require('../data/imp-stocks/CAT.json') as MarketRow[];
const CDNSData = require('../data/imp-stocks/CDNS.json') as MarketRow[];
const CHKPData = require('../data/imp-stocks/CHKP.json') as MarketRow[];
const CIENData = require('../data/imp-stocks/CIEN.json') as MarketRow[];
const CLData = require('../data/imp-stocks/CL.json') as MarketRow[];
const CLXData = require('../data/imp-stocks/CLX.json') as MarketRow[];
const CTSHData = require('../data/imp-stocks/CTSH.json') as MarketRow[];
const DISData = require('../data/imp-stocks/DIS.json') as MarketRow[];
const EMRData = require('../data/imp-stocks/EMR.json') as MarketRow[];
const ERICData = require('../data/imp-stocks/ERIC.json') as MarketRow[];
const EXCData = require('../data/imp-stocks/EXC.json') as MarketRow[];
const GEData = require('../data/imp-stocks/GE.json') as MarketRow[];
const GILDData = require('../data/imp-stocks/GILD.json') as MarketRow[];
const GLWData = require('../data/imp-stocks/GLW.json') as MarketRow[];
const HALData = require('../data/imp-stocks/HAL.json') as MarketRow[];
const HONData = require('../data/imp-stocks/HON.json') as MarketRow[];
const HPQData = require('../data/imp-stocks/HPQ.json') as MarketRow[];
const IBMData = require('../data/imp-stocks/IBM.json') as MarketRow[];
const INTCData = require('../data/imp-stocks/INTC.json') as MarketRow[];
const INTUData = require('../data/imp-stocks/INTU.json') as MarketRow[];
const ITWData = require('../data/imp-stocks/ITW.json') as MarketRow[];
const IWMData = require('../data/imp-stocks/IWM.json') as MarketRow[];
const KLACData = require('../data/imp-stocks/KLAC.json') as MarketRow[];
const KOData = require('../data/imp-stocks/KO.json') as MarketRow[];
const MCDData = require('../data/imp-stocks/MCD.json') as MarketRow[];
const MCHPData = require('../data/imp-stocks/MCHP.json') as MarketRow[];
const MMMData = require('../data/imp-stocks/MMM.json') as MarketRow[];
const MOData = require('../data/imp-stocks/MO.json') as MarketRow[];
const MRKData = require('../data/imp-stocks/MRK.json') as MarketRow[];
const MSData = require('../data/imp-stocks/MS.json') as MarketRow[];
const MSFTData = require('../data/imp-stocks/MSFT.json') as MarketRow[];
const NKEData = require('../data/imp-stocks/NKE.json') as MarketRow[];
const ORCLData = require('../data/imp-stocks/ORCL.json') as MarketRow[];
const OXYData = require('../data/imp-stocks/OXY.json') as MarketRow[];
const SAPData = require('../data/imp-stocks/SAP.json') as MarketRow[];
const TGTData = require('../data/imp-stocks/TGT.json') as MarketRow[];
const UNPData = require('../data/imp-stocks/UNP.json') as MarketRow[];
const WFCData = require('../data/imp-stocks/WFC.json') as MarketRow[];
const WMTData = require('../data/imp-stocks/WMT.json') as MarketRow[];
const XLFData = require('../data/imp-stocks/XLF.json') as MarketRow[];
const XLKData = require('../data/imp-stocks/XLK.json') as MarketRow[];
const XLPData = require('../data/imp-stocks/XLP.json') as MarketRow[];
const XLYData = require('../data/imp-stocks/XLY.json') as MarketRow[];
const nokData = require('../data/imp-stocks/nok.json') as MarketRow[];
const nvdaData = require('../data/imp-stocks/nvda.json') as MarketRow[];
const vodData = require('../data/imp-stocks/vod.json') as MarketRow[];

type AssetBase = {
    symbol: string;
    name: string;
    data: MarketRow[];
};

export type AssetCatalogEntry = AssetBase;

export type AssetWithoutData = AssetBase & {
    hasData: false;
};

export type AssetWithData = AssetBase & {
    hasData: true;
    today: MarketRow;
    previous: MarketRow | null;
    price: number;
    change: number;
    positive: boolean;
    spark: number[];
};

export type AssetMarket = AssetWithData | AssetWithoutData;

function sortMarketData(data: MarketRow[]) {
    return [...data].sort((a, b) => a.date.localeCompare(b.date));
}

function createAsset(symbol: string, name: string, data: MarketRow[]): AssetBase {
    return {
        symbol: symbol.toUpperCase(),
        name,
        data: sortMarketData(data),
    };
}

function mergeCatalogs(...catalogs: AssetBase[][]) {
    const seen = new Set<string>();

    return catalogs.flatMap(catalog =>
        catalog.filter(asset => {
            const symbol = asset.symbol.toUpperCase();
            if (seen.has(symbol)) return false;
            seen.add(symbol);
            return true;
        })
    );
}

const AVAILABLE_ASSET_LOGOS = new Set([
    'DELL',
    'ERIC',
    'GE',
    'HPQ',
    'IBM',
    'INTC',
    'MSFT',
    'NOK',
    'ORCL',
]);

export const FEATURED_ASSET_CATALOG: AssetBase[] = [
    createAsset('KO', 'Coca-Cola', KOData as MarketRow[]),
    createAsset('NKE', 'Nike', NKEData as MarketRow[]),
    createAsset('ERIC', 'Ericsson', ERICData as MarketRow[]),
    createAsset('GE', 'General Electric', GEData as MarketRow[]),
    createAsset('HPQ', 'Hewlett-Packard', HPQData as MarketRow[]),
    createAsset('IBM', 'IBM', IBMData as MarketRow[]),
    createAsset('INTC', 'Intel', INTCData as MarketRow[]),
];

export const BROWSE_ASSET_CATALOG: AssetBase[] = [
    createAsset('AMGN', 'Amgen', AMGNData as MarketRow[]),
    createAsset('ANSS', 'Ansys', ANSSData as MarketRow[]),
    createAsset('ASML', 'ASML Holding', ASMLData as MarketRow[]),
    createAsset('AXP', 'American Express', AXPData as MarketRow[]),
    createAsset('CAT', 'Caterpillar', CATData as MarketRow[]),
    createAsset('CDNS', 'Cadence Design Systems', CDNSData as MarketRow[]),
    createAsset('CHKP', 'Check Point Software', CHKPData as MarketRow[]),
    createAsset('CIEN', 'Ciena', CIENData as MarketRow[]),
    createAsset('CL', 'Colgate-Palmolive', CLData as MarketRow[]),
    createAsset('CLX', 'Clorox', CLXData as MarketRow[]),
    createAsset('CTSH', 'Cognizant', CTSHData as MarketRow[]),
    createAsset('DIS', 'Disney', DISData as MarketRow[]),
    createAsset('EMR', 'Emerson Electric', EMRData as MarketRow[]),
    createAsset('ERIC', 'Ericsson', ERICData as MarketRow[]),
    createAsset('EXC', 'Exelon', EXCData as MarketRow[]),
    createAsset('GE', 'General Electric', GEData as MarketRow[]),
    createAsset('GILD', 'Gilead Sciences', GILDData as MarketRow[]),
    createAsset('GLW', 'Corning', GLWData as MarketRow[]),
    createAsset('HAL', 'Halliburton', HALData as MarketRow[]),
    createAsset('HON', 'Honeywell', HONData as MarketRow[]),
    createAsset('HPQ', 'Hewlett-Packard', HPQData as MarketRow[]),
    createAsset('IBM', 'IBM', IBMData as MarketRow[]),
    createAsset('INTC', 'Intel', INTCData as MarketRow[]),
    createAsset('INTU', 'Intuit', INTUData as MarketRow[]),
    createAsset('ITW', 'Illinois Tool Works', ITWData as MarketRow[]),
    createAsset('IWM', 'iShares Russell 2000 ETF', IWMData as MarketRow[]),
    createAsset('KLAC', 'KLA', KLACData as MarketRow[]),
    createAsset('KO', 'Coca-Cola', KOData as MarketRow[]),
    createAsset('MCD', "McDonald's", MCDData as MarketRow[]),
    createAsset('MCHP', 'Microchip Technology', MCHPData as MarketRow[]),
    createAsset('MMM', '3M', MMMData as MarketRow[]),
    createAsset('MO', 'Altria', MOData as MarketRow[]),
    createAsset('MRK', 'Merck', MRKData as MarketRow[]),
    createAsset('MS', 'Morgan Stanley', MSData as MarketRow[]),
    createAsset('MSFT', 'Microsoft', MSFTData as MarketRow[]),
    createAsset('NKE', 'Nike', NKEData as MarketRow[]),
    createAsset('ORCL', 'Oracle', ORCLData as MarketRow[]),
    createAsset('OXY', 'Occidental Petroleum', OXYData as MarketRow[]),
    createAsset('SAP', 'SAP', SAPData as MarketRow[]),
    createAsset('TGT', 'Target', TGTData as MarketRow[]),
    createAsset('UNP', 'Union Pacific', UNPData as MarketRow[]),
    createAsset('WFC', 'Wells Fargo', WFCData as MarketRow[]),
    createAsset('WMT', 'Walmart', WMTData as MarketRow[]),
    createAsset('XLF', 'Financial Select Sector SPDR', XLFData as MarketRow[]),
    createAsset('XLK', 'Technology Select Sector SPDR', XLKData as MarketRow[]),
    createAsset('XLP', 'Consumer Staples Select Sector SPDR', XLPData as MarketRow[]),
    createAsset('XLY', 'Consumer Discretionary Select Sector SPDR', XLYData as MarketRow[]),
    createAsset('NOK', 'Nokia', nokData as MarketRow[]),
    createAsset('NVDA', 'Nvidia', nvdaData as MarketRow[]),
    createAsset('VOD', 'Vodafone', vodData as MarketRow[]),
];

const LEGACY_ASSET_CATALOG: AssetBase[] = [
    // Keep legacy holdings priceable even though Dell is no longer featured.
    createAsset('DELL', 'Dell', DELLData),
];

export const ALL_ASSET_CATALOG: AssetBase[] = mergeCatalogs(
    FEATURED_ASSET_CATALOG,
    BROWSE_ASSET_CATALOG,
    LEGACY_ASSET_CATALOG
);

export const PANDEMIC_FEATURED_ASSET_CATALOG: AssetBase[] = [
    createAsset('MSFT', 'Microsoft', MSFTData as MarketRow[]),
    createAsset('NVDA', 'Nvidia', nvdaData as MarketRow[]),
    createAsset('GILD', 'Gilead Sciences', GILDData as MarketRow[]),
    createAsset('WMT', 'Walmart', WMTData as MarketRow[]),
    createAsset('XLF', 'Financial Select Sector SPDR', XLFData as MarketRow[]),
    createAsset('XLK', 'Technology Select Sector SPDR', XLKData as MarketRow[]),
    createAsset('DIS', 'Disney', DISData as MarketRow[]),
];

export const PANDEMIC_BROWSE_ASSET_CATALOG: AssetBase[] = [
    createAsset('AMGN', 'Amgen', AMGNData as MarketRow[]),
    createAsset('CLX', 'Clorox', CLXData as MarketRow[]),
    createAsset('DIS', 'Disney', DISData as MarketRow[]),
    createAsset('GILD', 'Gilead Sciences', GILDData as MarketRow[]),
    createAsset('IBM', 'IBM', IBMData as MarketRow[]),
    createAsset('KO', 'Coca-Cola', KOData as MarketRow[]),
    createAsset('MCD', "McDonald's", MCDData as MarketRow[]),
    createAsset('MRK', 'Merck', MRKData as MarketRow[]),
    createAsset('MSFT', 'Microsoft', MSFTData as MarketRow[]),
    createAsset('NVDA', 'Nvidia', nvdaData as MarketRow[]),
    createAsset('OXY', 'Occidental Petroleum', OXYData as MarketRow[]),
    createAsset('SAP', 'SAP', SAPData as MarketRow[]),
    createAsset('TGT', 'Target', TGTData as MarketRow[]),
    createAsset('UNP', 'Union Pacific', UNPData as MarketRow[]),
    createAsset('WFC', 'Wells Fargo', WFCData as MarketRow[]),
    createAsset('WMT', 'Walmart', WMTData as MarketRow[]),
    createAsset('XLF', 'Financial Select Sector SPDR', XLFData as MarketRow[]),
    createAsset('XLK', 'Technology Select Sector SPDR', XLKData as MarketRow[]),
    createAsset('XLP', 'Consumer Staples Select Sector SPDR', XLPData as MarketRow[]),
    createAsset('XLY', 'Consumer Discretionary Select Sector SPDR', XLYData as MarketRow[]),
];

export const PANDEMIC_ALL_ASSET_CATALOG: AssetBase[] = mergeCatalogs(
    PANDEMIC_FEATURED_ASSET_CATALOG,
    PANDEMIC_BROWSE_ASSET_CATALOG
);

export const HOUSING_FEATURED_ASSET_CATALOG: AssetBase[] = [
    createAsset('WFC', 'Wells Fargo', WFCData as MarketRow[]),
    createAsset('MS', 'Morgan Stanley', MSData as MarketRow[]),
    createAsset('GE', 'General Electric', GEData as MarketRow[]),
    createAsset('XLF', 'Financial Select Sector SPDR', XLFData as MarketRow[]),
    createAsset('XLP', 'Consumer Staples Select Sector SPDR', XLPData as MarketRow[]),
    createAsset('XLY', 'Consumer Discretionary Select Sector SPDR', XLYData as MarketRow[]),
    createAsset('WMT', 'Walmart', WMTData as MarketRow[]),
];

export const HOUSING_BROWSE_ASSET_CATALOG: AssetBase[] = [
    createAsset('AXP', 'American Express', AXPData as MarketRow[]),
    createAsset('CAT', 'Caterpillar', CATData as MarketRow[]),
    createAsset('CL', 'Colgate-Palmolive', CLData as MarketRow[]),
    createAsset('CLX', 'Clorox', CLXData as MarketRow[]),
    createAsset('DIS', 'Disney', DISData as MarketRow[]),
    createAsset('EXC', 'Exelon', EXCData as MarketRow[]),
    createAsset('GE', 'General Electric', GEData as MarketRow[]),
    createAsset('HAL', 'Halliburton', HALData as MarketRow[]),
    createAsset('HON', 'Honeywell', HONData as MarketRow[]),
    createAsset('IBM', 'IBM', IBMData as MarketRow[]),
    createAsset('KO', 'Coca-Cola', KOData as MarketRow[]),
    createAsset('MCD', "McDonald's", MCDData as MarketRow[]),
    createAsset('MMM', '3M', MMMData as MarketRow[]),
    createAsset('MO', 'Altria', MOData as MarketRow[]),
    createAsset('MRK', 'Merck', MRKData as MarketRow[]),
    createAsset('MS', 'Morgan Stanley', MSData as MarketRow[]),
    createAsset('OXY', 'Occidental Petroleum', OXYData as MarketRow[]),
    createAsset('TGT', 'Target', TGTData as MarketRow[]),
    createAsset('UNP', 'Union Pacific', UNPData as MarketRow[]),
    createAsset('WFC', 'Wells Fargo', WFCData as MarketRow[]),
    createAsset('WMT', 'Walmart', WMTData as MarketRow[]),
    createAsset('XLF', 'Financial Select Sector SPDR', XLFData as MarketRow[]),
    createAsset('XLP', 'Consumer Staples Select Sector SPDR', XLPData as MarketRow[]),
    createAsset('XLY', 'Consumer Discretionary Select Sector SPDR', XLYData as MarketRow[]),
];

export const HOUSING_ALL_ASSET_CATALOG: AssetBase[] = mergeCatalogs(
    HOUSING_FEATURED_ASSET_CATALOG,
    HOUSING_BROWSE_ASSET_CATALOG
);

export function getScenarioAssetCatalogs(scenarioId?: string | null) {
    if (scenarioId === 'pandemic') {
        return {
            featuredCatalog: PANDEMIC_FEATURED_ASSET_CATALOG,
            browseCatalog: PANDEMIC_BROWSE_ASSET_CATALOG,
            allCatalog: PANDEMIC_ALL_ASSET_CATALOG,
        };
    }

    if (scenarioId === 'housing') {
        return {
            featuredCatalog: HOUSING_FEATURED_ASSET_CATALOG,
            browseCatalog: HOUSING_BROWSE_ASSET_CATALOG,
            allCatalog: HOUSING_ALL_ASSET_CATALOG,
        };
    }

    return {
        featuredCatalog: FEATURED_ASSET_CATALOG,
        browseCatalog: BROWSE_ASSET_CATALOG,
        allCatalog: ALL_ASSET_CATALOG,
    };
}

export function findRowAtOrBefore(data: MarketRow[], dateStr: string): MarketRow | null {
    if (!data || data.length === 0) return null;
    const index = findIndexAtOrBeforeDate(data, dateStr);
    return index >= 0 ? data[index] : null;
}

export function toLocalDateStr(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getAssetsWithMarket(
    dateStr: string,
    sparkLength = 20,
    catalog: AssetBase[] = ALL_ASSET_CATALOG
): AssetMarket[] {
    return catalog.map(asset => {
        const todayIndex = findIndexAtOrBeforeDate(asset.data, dateStr);

        if (todayIndex < 0) {
            return {
                ...asset,
                hasData: false,
            };
        }

        const today = asset.data[todayIndex];
        const previous = todayIndex > 0 ? asset.data[todayIndex - 1] : null;
        const sparkStart = Math.max(0, todayIndex - Math.max(2, sparkLength) + 1);
        const spark = asset.data.slice(sparkStart, todayIndex + 1).map(row => row.close);
        const price = today.close;
        const change = previous && previous.close !== 0
            ? ((price - previous.close) / previous.close) * 100
            : 0;

        return {
            ...asset,
            hasData: true,
            today,
            previous,
            price,
            change,
            positive: change >= 0,
            spark,
        };
    });
}

export function hasAssetLogo(symbol: string) {
    return AVAILABLE_ASSET_LOGOS.has(symbol.toUpperCase());
}

export function getAssetLogo(symbol: string) {
    return `/images/assets/${symbol.toLowerCase()}.png`;
}
