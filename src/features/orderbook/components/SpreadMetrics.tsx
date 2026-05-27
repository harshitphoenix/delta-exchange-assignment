import { formatPriceWithPrecision } from '@/lib/format';
import { SYMBOL_CONFIG, type TradingSymbol } from '@/lib/symbols/config';

interface SpreadMetricsProps {
  symbol: TradingSymbol;
  mid?: number;
  spread?: number;
  spreadBps?: number;
  imbalance?: number;
}

export function SpreadMetrics({ symbol, mid, spread, spreadBps, imbalance }: SpreadMetricsProps) {
  const precision = SYMBOL_CONFIG[symbol].pricePrecision;
  const bidHeavy = imbalance && imbalance >= 1;

  return (
    <div className="grid grid-cols-3 gap-4 border-y border-border bg-muted/40 px-4 py-3">
      <div>
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Mid Price</div>
        <div className="mt-1 text-xl font-semibold tabular-nums">
          {mid? formatPriceWithPrecision(mid, precision):'--'}
        </div>
      </div>
      <div>
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Spread</div>
        <div className="mt-1 text-sm tabular-nums">
          <span className="font-semibold text-live">
            {spread? formatPriceWithPrecision(spread, precision):'--'}
          </span>{' '}
          <span className="text-muted-foreground">({spreadBps? spreadBps.toFixed(1):'--'}bp)</span>
        </div>
      </div>
      <div>
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Imbalance</div>
        <div className="mt-1 text-sm tabular-nums">
          <span className={`font-semibold ${bidHeavy ? 'text-buy' : 'text-sell'}`}>
            {imbalance? imbalance.toFixed(2):'--'}
          </span>{' '}
          <span className="text-muted-foreground">{bidHeavy ? 'bid heavy' : 'ask heavy'}</span>
        </div>
      </div>
    </div>
  );
}
