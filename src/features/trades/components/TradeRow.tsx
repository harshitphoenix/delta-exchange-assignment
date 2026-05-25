import { memo } from 'react';
import type { Trade } from '../types';
import { formatPrice, formatSize } from '@/lib/format';
import { parseTradeTime } from '@/lib/utils';

interface TradeRowProps {
  trade: Trade;
  isLarge: boolean;
}

function TradeRow({ trade, isLarge }: TradeRowProps) {
  const isBuy = trade.side === 'buy';
  const priceClass = isBuy ? 'text-buy' : 'text-sell';
  return (
    <div
      className={`grid h-7 grid-cols-3 items-center px-4 text-xs tabular-nums ${
        isLarge ? 'border-l-2 border-sell bg-sell/10 font-semibold' : ''
      }`}
    >
      <span className="text-muted-foreground">{parseTradeTime(trade.timestamp)}</span>
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

export default memo(TradeRow)