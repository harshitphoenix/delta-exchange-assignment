import { memo } from 'react';
import type { Side } from '../types';
import { formatPrice, formatSize, formatTotal } from '@/lib/format';

interface OrderBookRowProps {
  price: number;
  size: number;
  total: number;
  maxTotal: number;
  side: Side;
}

function OrderBookRow({ price, size, total, maxTotal, side }: OrderBookRowProps) {
  const depthPct = maxTotal > 0 ? Math.min(100, (total / maxTotal) * 100) : 0;
  const isBid = side === 'bid';
  return (
    <div className="relative grid h-6 grid-cols-3 items-center px-3 text-xs tabular-nums">
      <div
        aria-hidden
        className={`absolute inset-y-0 w-full ${isBid ? 'left-0 origin-left rounded-r-sm bg-buy/10' : 'right-0 origin-right rounded-l-sm bg-sell/10'}`}
        style={{ transform: `scaleX(${depthPct / 100})` }}
      />
      {isBid ? (
        <>
          <span className="relative text-buy">{formatPrice(price)}</span>
          <span className="relative text-center text-foreground/80">{formatSize(size)}</span>
          <span className="relative text-right text-foreground/60">{formatTotal(total)}</span>
        </>
      ) : (
        <>
          <span className="relative text-foreground/60">{formatTotal(total)}</span>
          <span className="relative text-center text-foreground/80">{formatSize(size)}</span>
          <span className="relative text-right text-sell">{formatPrice(price)}</span>
        </>
      )}
    </div>
  );
}

export default memo(OrderBookRow);
