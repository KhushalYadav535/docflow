'use client';

import { useRouter } from 'next/navigation';
import { StatsCard } from '@/components/features/dashboard/StatsCard';
import { RecentDocuments } from '@/components/features/dashboard/RecentDocuments';
import { MostAccessed } from '@/components/features/dashboard/MostAccessed';
import { ActivityFeed } from '@/components/features/dashboard/ActivityFeed';
import { Button } from '@/components/ui/button';
import { FileUp, Search } from 'lucide-react';
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here's your document management overview.</p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        {canPerformAction('upload_document') && (
          <Link href="/documents/upload">
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <FileUp className="h-4 w-4" />
              Upload Document
            </Button>
          </Link>
        )}
        <Link href="/documents">
          <Button variant="outline" className="gap-2 border-border text-foreground hover:bg-accent/10">
            <Search className="h-4 w-4" />
            Search Documents
          </Button>
        </Link>
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
