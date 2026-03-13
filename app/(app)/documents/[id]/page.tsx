'use client';

import React, { useEffect, useState } from 'react';
import { DocumentViewer } from '@/components/features/documents/DocumentViewer';
import { apiRequest } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface DocumentViewPageProps {
  params: {
    id: string;
  };
}

interface DocumentData {
  id: string;
  name: string;
  type?: string;
  folder_path?: string;
  uploaded_by?: string;
  uploaded_at?: string;
  version?: string;
  status?: string;
  total_pages?: number;
}

export default function DocumentViewPage({ params }: DocumentViewPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for share link expiration
  useEffect(() => {
    const expires = searchParams?.get('expires');
    if (expires) {
      const expirationTime = parseInt(expires, 10);
      if (Date.now() > expirationTime) {
        toast.error('This share link has expired');
        router.push('/documents');
        return;
      }
    }
  }, [searchParams, router]);

  useEffect(() => {
    fetchDocument();
  }, [params.id]);

  const fetchDocument = async () => {
    try {
      setIsLoading(true);
      const data = await apiRequest<DocumentData>(`/documents/${params.id}`, { method: 'GET' });
      console.log('Fetched document:', data);
      if (!data || !data.id) {
        console.error('Invalid document data:', data);
        toast.error('Invalid document data received');
        router.push('/documents');
        return;
      }
      setDocument(data);
    } catch (error: any) {
      console.error('Failed to fetch document', error);
      toast.error('Failed to load document');
      router.push('/documents');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Document not found</p>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get search terms from URL if coming from search
  const searchTerms = searchParams?.get('q') || undefined;

  // Ensure document.id exists before rendering
  if (!document.id) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Invalid document: Missing ID</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <DocumentViewer
        documentId={document.id}
        documentName={document.name || 'Untitled Document'}
        documentType={document.type || 'Document'}
        folderPath={document.folder_path || 'General'}
        uploader={document.uploaded_by || 'Unknown'}
        uploadDate={formatDate(document.uploaded_at)}
        version={document.version || '1'}
        status={document.status || 'Active'}
        totalPages={document.total_pages || 1}
        searchTerms={searchTerms}
      />
    </div>
  );
}
