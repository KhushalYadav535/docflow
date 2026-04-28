'use client';

import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'secondary' | 'accent' | 'chart-1' | 'chart-2' | 'chart-3';
  isLoading?: boolean;
}

export function StatsCard({ 
  icon: Icon, 
  label, 
  value, 
  trend,
  color = 'primary',
  isLoading = false
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
    <Card className="rounded-[1.75rem] border border-border/70 bg-card/80 p-6 shadow-[0_18px_50px_rgba(15,15,20,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/6 dark:shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium text-muted-foreground dark:text-white/52">{label}</p>
          {isLoading ? (
            <Skeleton className="h-9 w-24" />
          ) : (
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-semibold text-foreground dark:text-white">{value}</p>
              {trend && (
                <span className={`text-xs font-semibold ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
                </span>
              )}
            </div>
          )}
        </div>
        <div className={`rounded-2xl border border-border/60 p-3 dark:border-white/8 ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
