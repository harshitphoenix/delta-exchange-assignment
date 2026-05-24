import type { Trade } from '../types';
import { formatPrice, formatSize } from '../lib/format';

interface TradeRowProps {
  trade: Trade;
}

export function TradeRow({ trade }: TradeRowProps) {
  const isBuy = trade.side === 'buy';
  const priceClass = isBuy ? 'text-buy' : 'text-sell';

  return (
    <div
      className={`grid h-7 grid-cols-3 items-center px-4 text-xs tabular-nums ${
        trade.isLarge ? 'border-l-2 border-sell bg-sell/10 font-semibold' : ''
      }`}
    >
      <span className="text-muted-foreground">{trade.time}</span>
      <span className={`text-center ${priceClass}`}>{formatPrice(trade.price)}</span>
      <span className="text-right text-foreground/80">
        {formatSize(trade.size)}
        {trade.aggregatedCount ? (
          <span className="ml-1 text-muted-foreground">({trade.aggregatedCount})</span>
        ) : null}
      </span>
    </div>
  );
}
