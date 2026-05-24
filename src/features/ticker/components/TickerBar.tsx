import { useState } from 'react';
import { DUMMY_TICKERS } from '../data/dummy';
import type { TradingSymbol } from '../types';
import { TickerCard } from './TickerCard';

export function TickerBar() {
  const [focused, setFocused] = useState<TradingSymbol>('BTCUSD');

  return (
    <nav className="flex gap-1 overflow-x-auto rounded-md border border-border bg-card px-2 py-1">
      {DUMMY_TICKERS.map((ticker) => (
        <TickerCard
          key={ticker.symbol}
          snapshot={ticker}
          isFocused={ticker.symbol === focused}
          onClick={() => setFocused(ticker.symbol)}
        />
      ))}
    </nav>
  );
}
