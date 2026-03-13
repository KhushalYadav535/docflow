'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, FileText, Clock, User } from 'lucide-react';
import Link from 'next/link';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useRouter } from 'next/navigation';

interface PendingDocument {
  id: string;
  name: string;
  doc_number?: string;
  status: string;
  created_at: string;
  uploader_name?: string;
  folder_name?: string;
}

export default function PendingApprovalsPage() {
  const router = useRouter();
  const { hasRole } = useRoleAccess();
  const [documents, setDocuments] = useState<PendingDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has permission
    if (!hasRole(['admin', 'manager'])) {
      router.push('/dashboard');
      return;
    }
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setIsLoading(true);
      const data = await apiRequest<PendingDocument[]>('/workflow/documents/pending-approvals', { method: 'GET' });
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch pending approvals', error);
      toast.error('Failed to load pending approvals');
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (documentId: string, documentName: string) => {
    try {
      await apiRequest(`/workflow/documents/${documentId}/approval/approve`, {
        method: 'POST',
      });
      toast.success(`"${documentName}" approved successfully`);
      fetchPendingApprovals();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve document');
    }
  };

  const handleReject = async (documentId: string, documentName: string) => {
    const comment = prompt('Please provide a rejection reason:');
    if (!comment || !comment.trim()) {
      toast.error('Rejection comment is required');
      return;
    }
    try {
      await apiRequest(`/workflow/documents/${documentId}/approval/reject`, {
        method: 'POST',
        body: JSON.stringify({ comment }),
      });
      toast.success(`"${documentName}" rejected`);
      fetchPendingApprovals();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject document');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pending Approvals</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve documents submitted for approval
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {documents.length} document{documents.length !== 1 ? 's' : ''} pending
        </div>
      </div>

      {documents.length === 0 ? (
        <Card className="border-border bg-card p-12 text-center">
          <CheckCircle2 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Pending Approvals</h3>
          <p className="text-muted-foreground">
            All documents have been reviewed. Check back later for new submissions.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="border-border bg-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <Link href={`/documents/${doc.id}`}>
                        <h3 className="text-lg font-semibold text-foreground hover:text-primary cursor-pointer">
                          {doc.name}
                        </h3>
                      </Link>
                      {doc.doc_number && (
                        <p className="text-xs text-muted-foreground mt-1">#{doc.doc_number}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    {doc.uploader_name && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{doc.uploader_name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(doc.created_at)}</span>
                    </div>
                    {doc.folder_name && (
                      <div className="text-muted-foreground">
                        Folder: <span className="text-foreground">{doc.folder_name}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-500">
                      Under Review
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReject(doc.id, doc.name)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(doc.id, doc.name)}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
