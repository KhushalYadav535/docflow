'use client';

import React, { useEffect, useState } from 'react';
import { HardDrive, Server, AlertTriangle, Trash2, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiRequest, apiClient, getApiConfig } from '@/lib/api';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';

interface StorageStats {
  totalSize: number;
  totalFiles: number;
  byType: Array<{ type: string; count: number; size: number }>;
  byFolder: Array<{ folderId: string; folderName: string; count: number; size: number }>;
  largestDocuments: Array<{ id: string; name: string; size: number }>;
}

export default function StorageManagementPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { hasRole } = useRoleAccess();
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCleaning, setIsCleaning] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!hasRole('admin')) {
      router.push('/dashboard');
      return;
    }
    fetchStorageStats();
  }, [isAuthenticated, router]);

  const fetchStorageStats = async () => {
    try {
      setIsLoading(true);
      const data = await apiRequest<StorageStats>('/storage/stats', { method: 'GET' });
      setStats(data);
    } catch (error: any) {
      console.error('Failed to fetch storage stats', error);
      toast.error('Failed to load storage statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanup = async () => {
    if (!confirm('This will delete orphaned files. Are you sure?')) return;
    try {
      setIsCleaning(true);
      const result = await apiRequest<{ deleted: number; freed: number }>('/storage/cleanup', {
        method: 'POST',
      });
      toast.success(`Cleanup complete: ${result.deleted} files deleted, ${formatBytes(result.freed)} freed`);
      fetchStorageStats();
    } catch (error: any) {
      toast.error(error.message || 'Cleanup failed');
    } finally {
      setIsCleaning(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatPercentage = (used: number, total: number) => {
    if (total === 0) return '0%';
    return Math.round((used / total) * 100) + '%';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load storage statistics</p>
      </div>
    );
  }

  const usagePercentage = stats.totalSize > 0 ? (stats.totalSize / (1000 * 1024 * 1024 * 1024)) * 100 : 0; // Assuming 1TB limit

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Storage Management</h1>
          <p className="text-muted-foreground mt-2">Monitor storage usage and manage files</p>
        </div>
        <Button
          variant="outline"
          onClick={handleCleanup}
          disabled={isCleaning}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {isCleaning ? 'Cleaning...' : 'Cleanup Orphaned Files'}
        </Button>
      </div>

      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary/20 rounded-full text-primary">
              <HardDrive className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Total Usage</p>
              <h2 className="text-2xl font-bold text-foreground">{formatBytes(stats.totalSize)}</h2>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalFiles} file{stats.totalFiles !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{formatPercentage(stats.totalSize, 1000 * 1024 * 1024 * 1024)} used</p>
          </div>
        </Card>

        <Card className="bg-card border-border p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-green-500/20 rounded-full text-green-500">
              <Server className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Files</p>
              <h2 className="text-2xl font-bold text-foreground">{stats.totalFiles.toLocaleString()}</h2>
              <p className="text-xs text-muted-foreground mt-1">Documents stored</p>
            </div>
          </div>
        </Card>

        <Card className="bg-card border-border p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-yellow-500/20 rounded-full text-yellow-500">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <h2 className="text-2xl font-bold text-foreground">
                {usagePercentage > 85 ? 'Warning' : 'Normal'}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {usagePercentage > 85 ? 'Storage nearly full' : 'Storage healthy'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Storage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage by Type */}
        <Card className="bg-card border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Storage by File Type</h3>
          <div className="space-y-3">
            {stats.byType && stats.byType.length > 0 ? (
              stats.byType.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{item.type || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{item.count} files</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{formatBytes(item.size)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPercentage(item.size, stats.totalSize)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
            )}
          </div>
        </Card>

        {/* Storage by Folder */}
        <Card className="bg-card border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Storage by Folder</h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {stats.byFolder && stats.byFolder.length > 0 ? (
              stats.byFolder.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.folderName || 'Root'}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.count} files</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold text-foreground">{formatBytes(item.size)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPercentage(item.size, stats.totalSize)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
            )}
          </div>
        </Card>
      </div>

      {/* Largest Documents */}
      <Card className="bg-card border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Largest Documents</h3>
        <div className="space-y-2">
          {stats.largestDocuments && stats.largestDocuments.length > 0 ? (
            stats.largestDocuments.map((doc, index) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/10"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">Document ID: {doc.id.substring(0, 8)}...</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-semibold text-foreground">{formatBytes(doc.size)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No documents found</p>
          )}
        </div>
      </Card>
    </div>
  );
}
