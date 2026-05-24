import { useCallback } from 'react';
import { SYMBOLS, type TradingSymbol } from '@/lib/symbols/config';
import { useFocusStore } from '@/lib/stores/focus/focus.store';
import { setFocusedSymbol } from '@/lib/stores/focus/focus.actions';
import { TickerCard } from './TickerCard';

export function TickerBar() {
  const focusedSymbol = useFocusStore((s) => s.focusedSymbol);
  const handleClick = useCallback((symbol: TradingSymbol) => {
    setFocusedSymbol(symbol);
  }, []);

  return (
    <nav className="flex gap-1 overflow-x-auto rounded-md border border-border bg-card px-2 py-1">
      {SYMBOLS.map((symbol) => (
        <TickerCard
          key={symbol}
          symbol={symbol}
          isFocused={symbol === focusedSymbol}
          onClick={() => handleClick(symbol)}
        />
      ))}
    </nav>
  );
}
