import type { TradingSymbol } from '@/lib/symbols/config';
import type { Trade } from '@/features/trades/types';
import { addTrades } from '@/lib/stores/trades/trades.actions';

// Lazy singleton — created on first trade dispatch
let tradesWorker: Worker | null = null;

function getTradesWorker(): Worker {
  if (!tradesWorker) {
    tradesWorker = new Worker(
      new URL('../trades/aggregate.worker.ts', import.meta.url),
      { type: 'module' },
    );
    tradesWorker.onmessage = ({ data }: MessageEvent<{ symbol: TradingSymbol; aggregated: Trade[] }>) => {
      addTrades(data.symbol, data.aggregated);
    };
  }
  return tradesWorker;
}

export function dispatchToTradesWorker(symbol: TradingSymbol, trades: Trade[]): void {
  getTradesWorker().postMessage({ symbol, trades });
}

export function cancelPendingFlush(): void {
  tradesWorker?.terminate();
  tradesWorker = null;
}
