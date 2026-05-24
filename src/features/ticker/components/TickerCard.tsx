import { memo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { SYMBOL_CONFIG, type TradingSymbol } from '@/lib/symbols/config';
import { formatPriceWithPrecision, formatChangePercent } from '@/lib/format';
import { useTickerStore } from '@/lib/stores/ticker/ticker.store';
import { setTicker } from '@/lib/stores/ticker/ticker.actions';
import { StressWsClient } from '@/lib/stress-ws/client';

interface TickerCardProps {
  symbol: TradingSymbol;
  isFocused: boolean;
  onClick: () => void;
}

export const TickerCard = memo(function TickerCard({ symbol, isFocused, onClick }: TickerCardProps) {
  const client = StressWsClient.getInstance();
  const snapshot = useTickerStore((s) => s.bySymbol[symbol]);
  const config = SYMBOL_CONFIG[symbol];

  useEffect(() => {
    // client.subscribe('v2/ticker', [symbol]);

    // const unsub = client.on('v2/ticker', (raw) => {
    //   const msg = raw as Record<string, unknown>;
    //   if (msg.symbol !== symbol) return;

    //   const lastPrice = (msg.close ?? msg.mark_price) as  string;
    //   const changePercent24h = msg.ltp_change_24h as string;
    //   setTicker({ symbol, lastPrice, changePercent24h });
    // });

    return () => {
      // unsub();
      // client.unsubscribe('v2/ticker', [symbol]);
    };
  }, [ symbol]);

  const isPositive = (Number(snapshot?.changePercent24h) ?? 0) >= 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-start gap-0.5 rounded-sm border-b-2 px-4 py-3 text-left transition-colors',
        isFocused
          ? 'border-blue-500 bg-blue-500/5'
          : 'border-transparent hover:bg-muted/40',
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold">{symbol}</span>
        <span className="text-xs text-muted-foreground">Perp</span>
      </div>
      <span className="font-mono text-sm tabular-nums">
        {snapshot
          ? formatPriceWithPrecision(Number(snapshot.lastPrice), config.pricePrecision)
          : '—'}
      </span>
      <span className={cn('text-xs tabular-nums', isPositive ? 'text-buy' : 'text-sell')}>
        {snapshot ? formatChangePercent(Number(snapshot.changePercent24h)) : '—'}
      </span>
    </button>
  );
});
