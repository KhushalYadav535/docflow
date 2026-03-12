'use client';

import { Card } from '@/components/ui/card';
import { Upload, Download, Share2, Trash2, Lock, Clock } from 'lucide-react';

interface Activity {
  id: string;
  action: 'upload' | 'download' | 'share' | 'delete' | 'lock';
  user: string;
  target: string;
  timestamp: string;
}

const activities: Activity[] = [
  { id: '1', action: 'upload', user: 'Sarah Chen', target: 'Q4 Report.pdf', timestamp: '10 mins ago' },
  { id: '2', action: 'download', user: 'Mike Johnson', target: 'Budget Document.xlsx', timestamp: '45 mins ago' },
  { id: '3', action: 'share', user: 'You', target: 'Project Proposal.pdf', timestamp: '2 hours ago' },
  { id: '4', action: 'upload', user: 'Emma Wilson', target: 'Design Assets.zip', timestamp: '4 hours ago' },
  { id: '5', action: 'lock', user: 'Admin', target: 'Financial Records.pdf', timestamp: '1 day ago' },
];

const actionIcons = {
  upload: { icon: Upload, color: 'text-green-500', bg: 'bg-green-500/10' },
  download: { icon: Download, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  share: { icon: Share2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  delete: { icon: Trash2, color: 'text-red-500', bg: 'bg-red-500/10' },
  lock: { icon: Lock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
};

export function ActivityFeed() {
  return (
    <Card className="border-border bg-card p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Activity Feed</h2>

      <div className="space-y-4">
        {activities.map((activity) => {
          const actionConfig = actionIcons[activity.action];
          const Icon = actionConfig.icon;

          const actionText = {
            upload: 'uploaded',
            download: 'downloaded',
            share: 'shared',
            delete: 'deleted',
            lock: 'locked',
          };

          return (
            <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-border/50 last:border-0 last:pb-0">
              <div className={`flex-shrink-0 p-2 rounded-lg ${actionConfig.bg}`}>
                <Icon className={`h-4 w-4 ${actionConfig.color}`} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  <span className="font-medium">{activity.user}</span>
                  {' '}
                  <span className="text-muted-foreground">
                    {actionText[activity.action]}
                  </span>
                  {' '}
                  <span className="font-medium text-foreground truncate">
                    {activity.target}
                  </span>
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  <span>{activity.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
