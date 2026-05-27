import { memo, useMemo } from 'react';
import {
  getGroupOptions,
  SYMBOL_CONFIG,
  type TradingSymbol,
} from '@/lib/symbols/config';
import { formatGroupIncrementLabel } from '@/lib/format';
import type { GroupIncrement } from '../types';

interface GroupingSelectorProps {
  symbol: TradingSymbol;
  value: GroupIncrement;
  onChange: (value: GroupIncrement) => void;
}

function GroupingSelector({ symbol, value, onChange }: GroupingSelectorProps) {
  const options = useMemo(() => getGroupOptions(symbol), [symbol]);
  const pricePrecision = SYMBOL_CONFIG[symbol].pricePrecision;

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">Group:</span>
      <div className="flex flex-wrap items-center gap-1">
        {options.map((opt) => {
          const active = Math.abs(opt - value) < 1e-12;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`min-w-7 rounded px-2 py-0.5 tabular-nums transition-colors ${
                active
                  ? 'bg-foreground/10 text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {formatGroupIncrementLabel(opt, pricePrecision)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(GroupingSelector);
