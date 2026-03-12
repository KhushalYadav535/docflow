import React from 'react';
import { DocumentViewer } from '@/components/features/documents/DocumentViewer';

interface DocumentViewPageProps {
  params: {
    id: string;
  };
}

export default function DocumentViewPage({ params }: DocumentViewPageProps) {
  // Mock data - in production, fetch from API using params.id
  const mockDocument = {
    id: params.id,
    documentName: 'Q1 2026 Financial Report - Acme Corporation.pdf',
    documentType: 'PDF - Report',
    folderPath: 'Finance > Reports > 2026',
    uploader: 'Sarah Wilson',
    uploadDate: 'March 10, 2026 • 2:45 PM',
    version: '3',
    status: 'Indexed',
    totalPages: 5,
  };

  return (
    <div className="h-full">
      <DocumentViewer {...mockDocument} />
    </div>
  );
}
