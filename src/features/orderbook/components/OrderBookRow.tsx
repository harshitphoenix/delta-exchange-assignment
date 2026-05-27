import { memo } from 'react';
import type { Side } from '../types';
import { formatPriceWithPrecision, formatSize, formatTotal } from '@/lib/format';
import { SYMBOL_CONFIG, type TradingSymbol } from '@/lib/symbols/config';

interface OrderBookRowProps {
  symbol: TradingSymbol;
  price: number;
  size: number;
  total: number;
  maxTotal: number;
  side: Side;
}

function OrderBookRow({ symbol, price, size, total, maxTotal, side }: OrderBookRowProps) {
  const priceLabel = formatPriceWithPrecision(price, SYMBOL_CONFIG[symbol].pricePrecision);
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
          <span className="relative text-buy">{priceLabel}</span>
          <span className="relative text-center text-foreground/80">{formatSize(size)}</span>
          <span className="relative text-right text-foreground/60">{formatTotal(total)}</span>
        </>
      ) : (
        <>
          <span className="relative text-foreground/60">{formatTotal(total)}</span>
          <span className="relative text-center text-foreground/80">{formatSize(size)}</span>
          <span className="relative text-right text-sell">{priceLabel}</span>
        </>
      )}
    </div>
  );
}

export default memo(OrderBookRow);
