'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings, Search, Eye, Download, Filter, CalendarIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface AuditLog {
  id: string;
  user_name?: string;
  user?: string;
  action: string;
  resource_name?: string;
  resource?: string;
  timestamp: string;
  ip_address?: string;
  ipAddress?: string;
  status?: 'success' | 'failed';
}

export default function AdminAuditLogsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  // Date Range Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchAuditLogs();
  }, [isAuthenticated, router]);

  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (filterAction !== 'all') params.append('action', filterAction);
      if (filterStatus !== 'all') params.append('status', filterStatus);

      const data = await apiRequest<AuditLog[]>(`/admin/audit-logs?${params.toString()}`, { method: 'GET' });
      setLogs(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch audit logs', error);
      toast.error('Failed to load audit logs');
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [filterStatus, filterAction, startDate, endDate]);

  const filteredLogs = logs.filter((log) => {
    const userName = log.user_name || log.user || 'Unknown';
    const resource = log.resource_name || log.resource || '';
    const matchesSearch = userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          resource.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleExportCSV = () => {
    const csv = [
      ['User', 'Action', 'Resource', 'Timestamp', 'IP Address', 'Status'],
      ...filteredLogs.map(log => [
        log.user_name || log.user || 'Unknown',
        log.action,
        log.resource_name || log.resource || '',
        log.timestamp,
        log.ip_address || log.ipAddress || 'N/A',
        log.status || 'success'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Audit logs exported');
  };

  const getActionColor = (action: string) => {
    if (action.toLowerCase().includes('delete') || action.toLowerCase().includes('failed')) {
      return 'text-red-500';
    }
    if (action.toLowerCase().includes('upload') || action.toLowerCase().includes('create')) {
      return 'text-green-500';
    }
    if (action.toLowerCase().includes('update') || action.toLowerCase().includes('edit')) {
      return 'text-blue-500';
    }
    return 'text-muted-foreground';
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-muted-foreground mt-2">Monitor system activities and user actions</p>
        </div>
        <Button onClick={handleExportCSV} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-border bg-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            placeholder="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-background border-border"
          />
          <Input
            type="date"
            placeholder="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-background border-border"
          />
        </div>
      </Card>

      {/* Audit Logs Table */}
      <Card className="border-border bg-card">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-foreground">User</TableHead>
                <TableHead className="text-foreground">Action</TableHead>
                <TableHead className="text-foreground">Resource</TableHead>
                <TableHead className="text-foreground">Timestamp</TableHead>
                <TableHead className="text-foreground">IP Address</TableHead>
                <TableHead className="text-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="border-border">
                    <TableCell className="font-medium text-foreground">
                      {log.user_name || log.user || 'System'}
                    </TableCell>
                    <TableCell className={getActionColor(log.action)}>
                      {log.action}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.resource_name || log.resource || 'N/A'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatTimestamp(log.timestamp)}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {log.ip_address || log.ipAddress || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {log.status === 'failed' ? (
                        <span className="text-red-500">Failed</span>
                      ) : (
                        <span className="text-green-500">Success</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
