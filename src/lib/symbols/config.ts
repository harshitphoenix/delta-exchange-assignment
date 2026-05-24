export const SYMBOLS = ['BTCUSD', 'ETHUSD', 'XRPUSD', 'SOLUSD', 'PAXGUSD', 'DOGEUSD'] as const;
export type TradingSymbol = typeof SYMBOLS[number];

export interface SymbolConfig {
  pricePrecision: number;
  baseName: string;
}

export const SYMBOL_CONFIG: Record<TradingSymbol, SymbolConfig> = {
  BTCUSD:  { pricePrecision: 1, baseName: 'BTC' },
  ETHUSD:  { pricePrecision: 2, baseName: 'ETH' },
  XRPUSD:  { pricePrecision: 4, baseName: 'XRP' },
  SOLUSD:  { pricePrecision: 4, baseName: 'SOL' },
  PAXGUSD: { pricePrecision: 2, baseName: 'PAXG' },
  DOGEUSD: { pricePrecision: 6, baseName: 'DOGE' },
};
