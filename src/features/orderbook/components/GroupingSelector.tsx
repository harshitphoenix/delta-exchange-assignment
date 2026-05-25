import { memo } from 'react';
import type { GroupIncrement } from '../types';

const OPTIONS: GroupIncrement[] = [1, 5, 10, 50, 100, 500];

interface GroupingSelectorProps {
  value: GroupIncrement;
  onChange: (value: GroupIncrement) => void;
}

function GroupingSelector({ value, onChange }: GroupingSelectorProps) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">Group:</span>
      <div className="flex items-center gap-1">
        {OPTIONS.map((opt) => {
          const active = opt === value;
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
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(GroupingSelector)
