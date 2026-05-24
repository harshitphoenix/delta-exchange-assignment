import type { OrderBookLevel, Side } from '../types';
import { formatPrice, formatSize, formatTotal } from '@/lib/format';

interface OrderBookRowProps {
  level: OrderBookLevel;
  side: Side;
  maxTotal: number;
}

export function OrderBookRow({ level, side, maxTotal }: OrderBookRowProps) {
  const depthPct = Math.min(100, (level.total / maxTotal) * 100);
  const isBid = side === 'bid';

  return (
    <div className="relative grid h-6 grid-cols-3 items-center px-3 text-xs tabular-nums">
      <div
        aria-hidden
        className={`absolute inset-y-0 ${isBid ? 'left-0' : 'right-0'} ${
          isBid ? 'bg-buy/10' : 'bg-sell/10'
        }`}
        style={{ width: `${depthPct}%` }}
      />
      {isBid ? (
        <>
          <span className="relative text-buy">{formatPrice(level.price)}</span>
          <span className="relative text-center text-foreground/80">{formatSize(level.size)}</span>
          <span className="relative text-right text-foreground/60">{formatTotal(level.total)}</span>
        </>
      ) : (
        <>
          <span className="relative text-foreground/60">{formatTotal(level.total)}</span>
          <span className="relative text-center text-foreground/80">{formatSize(level.size)}</span>
          <span className="relative text-right text-sell">{formatPrice(level.price)}</span>
        </>
      )}
    </div>
  );
}
