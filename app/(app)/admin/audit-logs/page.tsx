'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings, Search, Eye, Download, Filter } from 'lucide-react';
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

interface AuditLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  timestamp: string;
  ipAddress: string;
  status: 'success' | 'failed';
}

const mockLogs: AuditLog[] = [
  { id: '1', user: 'Sarah Chen', action: 'Document Upload', resource: 'Q4 Report.pdf', timestamp: '2024-01-20 10:30 AM', ipAddress: '192.168.1.1', status: 'success' },
  { id: '2', user: 'Mike Johnson', action: 'User Deleted', resource: 'john@company.com', timestamp: '2024-01-20 09:15 AM', ipAddress: '192.168.1.5', status: 'success' },
  { id: '3', user: 'Admin', action: 'Settings Changed', resource: 'Storage Limit', timestamp: '2024-01-20 08:45 AM', ipAddress: '192.168.1.2', status: 'success' },
  { id: '4', user: 'Emma Wilson', action: 'Document Deleted', resource: 'Old File.docx', timestamp: '2024-01-19 02:30 PM', ipAddress: '192.168.1.10', status: 'success' },
  { id: '5', user: 'System', action: 'Failed Login', resource: 'admin@company.com', timestamp: '2024-01-19 11:20 AM', ipAddress: '203.0.113.45', status: 'failed' },
];

export default function AdminAuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState(mockLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [router]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.resource.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesStatus && matchesAction;
  });

  const handleExportCSV = () => {
    const csv = [
      ['User', 'Action', 'Resource', 'Timestamp', 'IP Address', 'Status'],
      ...filteredLogs.map(log => [log.user, log.action, log.resource, log.timestamp, log.ipAddress, log.status])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit-logs.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getActionColor = (action: string) => {
    if (action.includes('Delete')) return 'text-red-400';
    if (action.includes('Upload')) return 'text-green-400';
    if (action.includes('Login')) return 'text-yellow-400';
    return 'text-blue-400';
  };

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
            <p className="text-muted-foreground mt-2">System activity and user actions</p>
          </div>
          <Button 
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleExportCSV}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-border bg-card p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="md:w-32 bg-background border-border text-foreground">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all" className="text-foreground">All</SelectItem>
                <SelectItem value="success" className="text-foreground">Success</SelectItem>
                <SelectItem value="failed" className="text-foreground">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="md:w-40 bg-background border-border text-foreground">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all" className="text-foreground">All Actions</SelectItem>
                <SelectItem value="Document Upload" className="text-foreground">Upload</SelectItem>
                <SelectItem value="User Deleted" className="text-foreground">Delete User</SelectItem>
                <SelectItem value="Settings Changed" className="text-foreground">Settings</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Logs Table */}
        <Card className="border-border bg-card overflow-hidden">
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/30">
                <TableRow className="border-border hover:bg-secondary/30">
                  <TableHead className="text-foreground">User</TableHead>
                  <TableHead className="text-foreground">Action</TableHead>
                  <TableHead className="text-foreground">Resource</TableHead>
                  <TableHead className="text-foreground">Timestamp</TableHead>
                  <TableHead className="text-foreground">IP Address</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="border-border hover:bg-secondary/20 transition-colors"
                  >
                    <TableCell className="font-medium text-foreground">{log.user}</TableCell>
                    <TableCell className={`font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{log.resource}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{log.timestamp}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">{log.ipAddress}</TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        log.status === 'success' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
        </Table>
      </Card>
    );
}
