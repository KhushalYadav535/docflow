'use client';

import { Card } from '@/components/ui/card';
import { Upload, Download, Share2, Trash2, Lock, Clock, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

interface Activity {
  id: string;
  action: string;
  user_name?: string;
  document_name?: string;
  timestamp: string;
}

interface ActivityFeedProps {
  tenantId?: string | null;
}

const actionIcons: Record<string, { icon: any; color: string; bg: string; text: string }> = {
  DOCUMENT_UPLOADED: { icon: Upload, color: 'text-green-500', bg: 'bg-green-500/10', text: 'uploaded' },
  DOCUMENT_DOWNLOADED: { icon: Download, color: 'text-blue-500', bg: 'bg-blue-500/10', text: 'downloaded' },
  DOCUMENT_VIEWED: { icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10', text: 'viewed' },
  DOCUMENT_DELETED: { icon: Trash2, color: 'text-red-500', bg: 'bg-red-500/10', text: 'deleted' },
  DOCUMENT_APPROVED: { icon: Lock, color: 'text-green-500', bg: 'bg-green-500/10', text: 'approved' },
  DOCUMENT_REJECTED: { icon: Lock, color: 'text-red-500', bg: 'bg-red-500/10', text: 'rejected' },
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

export function ActivityFeed({ tenantId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivityFeed();
  }, [tenantId]);

  const fetchActivityFeed = async () => {
    try {
      setIsLoading(true);
      const data = await apiRequest<Activity[]>('/dashboard/activity?limit=20', { method: 'GET' });
      setActivities(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch activity feed', error);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border bg-card p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Activity Feed</h2>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 pb-4">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))
        ) : activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
        ) : (
          activities.map((activity) => {
            const actionConfig = actionIcons[activity.action] || {
              icon: FileText,
              color: 'text-muted-foreground',
              bg: 'bg-muted/10',
              text: activity.action.toLowerCase().replace(/_/g, ' '),
            };
            const Icon = actionConfig.icon;

            return (
              <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                <div className={`flex-shrink-0 p-2 rounded-lg ${actionConfig.bg}`}>
                  <Icon className={`h-4 w-4 ${actionConfig.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{activity.user_name || 'System'}</span>
                    {' '}
                    <span className="text-muted-foreground">
                      {actionConfig.text}
                    </span>
                    {' '}
                    {activity.document_name && (
                      <span className="font-medium text-foreground truncate">
                        {activity.document_name}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimestamp(activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
