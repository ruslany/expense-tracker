import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  valueColor?: 'default' | 'red' | 'green' | 'amber';
  subtext?: string;
  icon?: React.ReactNode;
}

const colorClasses = {
  default: 'text-foreground',
  red: 'text-red-600 dark:text-red-400',
  green: 'text-green-600 dark:text-green-400',
  amber: 'text-amber-600 dark:text-amber-400',
};

export function StatCard({ label, value, valueColor = 'default', subtext, icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        <p className={cn('text-2xl font-bold mt-2', colorClasses[valueColor])}>{value}</p>
        {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
      </CardContent>
    </Card>
  );
}
