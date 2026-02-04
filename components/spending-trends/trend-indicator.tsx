import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendIndicatorProps {
  percentChange: number;
  comparisonLabel: string;
}

export function TrendIndicator({ percentChange, comparisonLabel }: TrendIndicatorProps) {
  const isPositive = percentChange > 0;
  const isNegative = percentChange < 0;
  const isNeutral = percentChange === 0;

  return (
    <div className="flex items-center gap-2 text-sm">
      {isPositive && (
        <>
          <TrendingUp className="h-4 w-4 text-red-500" />
          <span className={cn('font-medium text-red-500')}>
            +{Math.abs(percentChange).toFixed(1)}%
          </span>
        </>
      )}
      {isNegative && (
        <>
          <TrendingDown className="h-4 w-4 text-green-500" />
          <span className={cn('font-medium text-green-500')}>
            -{Math.abs(percentChange).toFixed(1)}%
          </span>
        </>
      )}
      {isNeutral && (
        <>
          <Minus className="h-4 w-4 text-muted-foreground" />
          <span className={cn('font-medium text-muted-foreground')}>0%</span>
        </>
      )}
      <span className="text-muted-foreground">{comparisonLabel}</span>
    </div>
  );
}
