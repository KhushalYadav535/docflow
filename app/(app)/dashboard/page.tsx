'use client';

import { useRouter } from 'next/navigation';
import { StatsCard } from '@/components/features/dashboard/StatsCard';
import { RecentDocuments } from '@/components/features/dashboard/RecentDocuments';
import { MostAccessed } from '@/components/features/dashboard/MostAccessed';
import { ActivityFeed } from '@/components/features/dashboard/ActivityFeed';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock3, FileSearch, FileUp, Search, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const { hasRole, canPerformAction } = useRoleAccess();
  const { currentTenantId } = useTenant();
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    totalDocuments: 0,
    uploadedToday: 0,
    pendingApprovals: 0,
    storageUsed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchDashboardStats();
  }, [isAuthenticated, router]);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      const data = await apiRequest<{
        totalDocuments: number;
        uploadedToday: number;
        pendingApprovals: number;
        storageUsed: number;
      }>('/dashboard/stats', { method: 'GET' });

      setStats({
        totalDocuments: data.totalDocuments || 0,
        uploadedToday: data.uploadedToday || 0,
        pendingApprovals: data.pendingApprovals || 0,
        storageUsed: data.storageUsed || 0,
      });
    } catch (error: any) {
      console.error('Failed to fetch dashboard stats', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatStorage = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) return `${gb.toFixed(1)} GB`;
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(0)} MB`;
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-border/70 bg-card/80 p-8 shadow-[0_22px_60px_rgba(15,15,20,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/6 dark:shadow-[0_22px_60px_rgba(0,0,0,0.26)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            Premium command center
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground dark:text-white">Dashboard</h1>
          <p className="mt-3 max-w-2xl text-base leading-8 text-muted-foreground dark:text-white/62">
            Welcome back. Monitor documents, approvals, and storage from a cleaner workspace built to feel faster and more refined.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {canPerformAction('upload_document') && (
              <Button asChild className="gap-2 rounded-full border border-primary/35 bg-primary px-6 text-primary-foreground shadow-[0_16px_50px_rgba(245,191,90,0.25)] hover:bg-primary/95">
                <Link href="/documents/upload">
                  <FileUp className="h-4 w-4" />
                  Upload Document
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" className="gap-2 rounded-full border-border/70 bg-card/70 px-6 text-foreground hover:border-primary/30 hover:bg-accent/35 hover:text-foreground dark:border-white/12 dark:bg-white/5 dark:text-white dark:hover:bg-white/8 dark:hover:text-white">
              <Link href="/documents">
                <Search className="h-4 w-4" />
                Search Documents
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <div className="rounded-[1.6rem] border border-border/70 bg-card/80 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/12 p-3 text-primary">
                <Clock3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground dark:text-white/45">Today</p>
                <p className="text-lg font-medium text-foreground dark:text-white">{stats.uploadedToday} uploads tracked</p>
              </div>
            </div>
          </div>
          <div className="rounded-[1.6rem] border border-border/70 bg-card/80 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/12 p-3 text-primary">
                <FileSearch className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground dark:text-white/45">Access</p>
                <p className="text-lg font-medium text-foreground dark:text-white">{stats.totalDocuments.toLocaleString()} files in scope</p>
              </div>
            </div>
          </div>
          <div className="rounded-[1.6rem] border border-border/70 bg-card/80 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/12 p-3 text-primary">
                <ArrowRight className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground dark:text-white/45">Momentum</p>
                <p className="text-lg font-medium text-foreground dark:text-white">Keep reviews and retrieval moving</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={FileUp}
          label="Total Documents"
          value={stats.totalDocuments.toLocaleString()}
          isLoading={isLoading}
          color="primary"
        />
        <StatsCard
          icon={FileUp}
          label="Uploaded Today"
          value={stats.uploadedToday}
          isLoading={isLoading}
          color="chart-1"
        />
        {hasRole(['admin', 'manager']) && (
          <StatsCard
            icon={FileUp}
            label="Pending Approvals"
            value={stats.pendingApprovals}
            isLoading={isLoading}
            color="chart-2"
          />
        )}
        {hasRole(['admin', 'manager']) && (
          <StatsCard
            icon={FileUp}
            label="Storage Used"
            value={formatStorage(stats.storageUsed)}
            isLoading={isLoading}
            color="chart-3"
          />
        )}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Documents - Takes 2 columns on large screens */}
        <div className="lg:col-span-2 space-y-6">
          <RecentDocuments tenantId={currentTenantId} />
        </div>

        {/* Activity Feed and Most Accessed - Takes 1 column */}
        <div className="lg:col-span-1 space-y-6">
          <MostAccessed tenantId={currentTenantId} />
          <ActivityFeed tenantId={currentTenantId} />
        </div>
      </div>
    </div>
  );
}
