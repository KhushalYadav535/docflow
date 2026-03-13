'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, FileImage, FileArchive, Eye } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

interface Document {
  id: string;
  name: string;
  type?: string;
  access_count?: number;
}

interface MostAccessedProps {
  tenantId?: string | null;
}

const iconMap: Record<string, any> = {
  pdf: FileText,
  image: FileImage,
  archive: FileArchive,
  default: FileText,
};

const getFileType = (name: string): string => {
  const ext = name.split('.').pop()?.toLowerCase();
  if (['pdf'].includes(ext || '')) return 'pdf';
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return 'image';
  if (['zip', 'rar', '7z'].includes(ext || '')) return 'archive';
  return 'default';
};

export function MostAccessed({ tenantId }: MostAccessedProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMostAccessed();
  }, [tenantId]);

  const fetchMostAccessed = async () => {
    try {
      setIsLoading(true);
      const data = await apiRequest<Document[]>('/dashboard/most-accessed?limit=5', { method: 'GET' });
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch most accessed documents', error);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Most Accessed</h2>
        <Link href="/documents">
          <Button variant="ghost" className="text-primary hover:bg-primary/10">
            View All
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))
        ) : documents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
        ) : (
          documents.map((doc) => {
            const fileType = getFileType(doc.name);
            const Icon = iconMap[fileType] || FileText;
            return (
              <Link key={doc.id} href={`/documents/${doc.id}`}>
                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors group cursor-pointer">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary">
                      {doc.name}
                    </p>
                    {doc.access_count !== undefined && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{doc.access_count} views</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Open
                  </Button>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </Card>
  );
}
