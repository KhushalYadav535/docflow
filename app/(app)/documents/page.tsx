'use client';

import { useRouter } from 'next/navigation';
import { DocumentSearch } from '@/components/features/documents/DocumentSearch';
import { Button } from '@/components/ui/button';
import { FileUp } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function DocumentsPage() {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground mt-2">Manage and search all your documents</p>
        </div>
        <Link href="/documents/upload">
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <FileUp className="h-4 w-4" />
            Upload New
          </Button>
        </Link>
      </div>

      {/* Document Search Component */}
      <DocumentSearch />
    </div>
  );
}
