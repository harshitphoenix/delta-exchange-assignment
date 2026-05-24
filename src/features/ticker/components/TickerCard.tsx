import { memo } from 'react';
import { cn } from '@/lib/utils';
import { SYMBOL_CONFIG } from '@/lib/symbols/config';
import { formatPriceWithPrecision, formatChangePercent } from '@/lib/format';
import type { TickerSnapshot } from '../types';

interface TickerCardProps {
  snapshot: TickerSnapshot;
  isFocused: boolean;
  onClick: () => void;
}

export const TickerCard = memo(function TickerCard({ snapshot, isFocused, onClick }: TickerCardProps) {
  const config = SYMBOL_CONFIG[snapshot.symbol];
  const isPositive = snapshot.changePercent24h >= 0;

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
        <span className="text-sm font-semibold">{snapshot.symbol}</span>
        <span className="text-xs text-muted-foreground">Perp</span>
      </div>
      <span className="font-mono text-sm tabular-nums">
        {formatPriceWithPrecision(snapshot.lastPrice, config.pricePrecision)}
      </span>
      <span className={cn('text-xs tabular-nums', isPositive ? 'text-buy' : 'text-sell')}>
        {formatChangePercent(snapshot.changePercent24h)}
      </span>
    </button>
  );
});
