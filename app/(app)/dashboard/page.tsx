'use client';

import { useRouter } from 'next/navigation';
import { StatsCard } from '@/components/features/dashboard/StatsCard';
import { RecentDocuments } from '@/components/features/dashboard/RecentDocuments';
import { ActivityFeed } from '@/components/features/dashboard/ActivityFeed';
import { Button } from '@/components/ui/button';
import { FileUp, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [router]);

  return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back! Here's your document management overview.</p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Link href="/documents/upload">
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <FileUp className="h-4 w-4" />
              Upload Document
            </Button>
          </Link>
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
            value="1,248"
            trend={{ value: 12, isPositive: true }}
            color="primary"
          />
          <StatsCard
            icon={FileUp}
            label="Uploaded Today"
            value="23"
            trend={{ value: 8, isPositive: true }}
            color="chart-1"
          />
          <StatsCard
            icon={FileUp}
            label="Pending Approvals"
            value="5"
            trend={{ value: 2, isPositive: false }}
            color="chart-2"
          />
          <StatsCard
            icon={FileUp}
            label="Storage Used"
            value="64 GB"
            trend={{ value: 5, isPositive: true }}
            color="chart-3"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Documents - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <RecentDocuments />
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-1">
            <ActivityFeed />
          </div>
        </div>
      </div>
    );
}
