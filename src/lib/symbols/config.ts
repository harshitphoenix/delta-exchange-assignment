export const SYMBOLS = ['BTCUSD', 'ETHUSD', 'XRPUSD', 'SOLUSD', 'PAXGUSD', 'DOGEUSD'];
export type TradingSymbol = typeof SYMBOLS[number];

export interface SymbolConfig {
  pricePrecision: number;
  baseName: string;
  groupOptions: number[];
}

export const SYMBOL_CONFIG: Record<TradingSymbol, SymbolConfig> = {
  BTCUSD:  { pricePrecision: 1, baseName: 'BTC',  groupOptions: [1, 5, 10, 50, 100, 500] },
  ETHUSD:  { pricePrecision: 2, baseName: 'ETH',  groupOptions: [0.5, 1, 5, 10, 50] },
  XRPUSD:  { pricePrecision: 4, baseName: 'XRP',  groupOptions: [0.0001, 0.001, 0.01, 0.1] },
  SOLUSD:  { pricePrecision: 4, baseName: 'SOL',  groupOptions: [0.01, 0.1, 0.5, 1, 5] },
  PAXGUSD: { pricePrecision: 2, baseName: 'PAXG', groupOptions: [0.5, 1, 5, 10, 50] },
  DOGEUSD: { pricePrecision: 6, baseName: 'DOGE', groupOptions: [0.000001, 0.00001, 0.0001, 0.001, 0.01] },
};

export function getGroupOptions(symbol: TradingSymbol): number[] {
  return SYMBOL_CONFIG[symbol].groupOptions;
}

export function getDefaultGroupIncrement(symbol: TradingSymbol): number {
  return SYMBOL_CONFIG[symbol].groupOptions[0];
}

export function isValidGroupIncrement(symbol: TradingSymbol, increment: number): boolean {
  return SYMBOL_CONFIG[symbol].groupOptions.some(
    (opt) => Math.abs(opt - increment) < 1e-12,
  );
}

export function resolveGroupIncrement(
  symbol: TradingSymbol,
  stored: number | undefined,
): number {
  if (stored !== undefined && isValidGroupIncrement(symbol, stored)) {
    return stored;
  }
  return getDefaultGroupIncrement(symbol);
}
