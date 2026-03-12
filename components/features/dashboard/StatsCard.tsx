import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'secondary' | 'accent' | 'chart-1' | 'chart-2' | 'chart-3';
}

export function StatsCard({ 
  icon: Icon, 
  label, 
  value, 
  trend,
  color = 'primary'
}: StatsCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent',
    'chart-1': 'bg-[var(--color-chart-1)]/10 text-[var(--color-chart-1)]',
    'chart-2': 'bg-[var(--color-chart-2)]/10 text-[var(--color-chart-2)]',
    'chart-3': 'bg-[var(--color-chart-3)]/10 text-[var(--color-chart-3)]',
  };

  return (
    <Card className="border-border bg-card p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {trend && (
              <span className={`text-xs font-semibold ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
              </span>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
