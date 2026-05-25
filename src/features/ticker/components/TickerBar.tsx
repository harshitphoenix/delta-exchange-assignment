import { useCallback, useEffect } from 'react';
import { SYMBOLS, type TradingSymbol } from '@/lib/symbols/config';
import { useFocusStore } from '@/lib/stores/focus/focus.store';
import { setFocusedSymbol } from '@/lib/stores/focus/focus.actions';
import { TickerCard } from './TickerCard';
import { stressWsClient } from '@/lib/stress-ws/client';
import { pushTicker } from '@/lib/stress-ws/batcher';

export function TickerBar() {
  const focusedSymbol = useFocusStore((s) => s.focusedSymbol);
  const handleClick = useCallback((symbol: TradingSymbol) => {
    setFocusedSymbol(symbol);
  }, []);
  useEffect(() => {
    const client = stressWsClient;
    client.subscribe('v2/ticker', SYMBOLS);

    const unsub = client.on('v2/ticker', (raw) => {
      const msg = raw as Record<string, unknown>;
      if (!msg.symbol) return;
      const symbol = msg.symbol as TradingSymbol;

      const lastPrice = (msg.close ?? msg.mark_price) as  string;
      const changePercent24h = msg.ltp_change_24h as string;
      pushTicker({ symbol, lastPrice, changePercent24h });
    });

    return () => {
      unsub();
      client.unsubscribe('v2/ticker', SYMBOLS);
    };
  }, []);
  return (
    <nav className="flex gap-1 overflow-x-auto rounded-md border border-border bg-card px-2 py-1">
      {SYMBOLS.map((symbol, index) => (
        <TickerCard
          key={`${symbol}_${index}`}
          symbol={symbol}
          isFocused={symbol === focusedSymbol}
          onClick={handleClick}
        />
      ))}
    </nav>
  );
}
