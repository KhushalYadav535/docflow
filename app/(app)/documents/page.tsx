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
      <div className="flex items-center justify-between gap-4 rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-[0_18px_50px_rgba(15,15,20,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/6 dark:shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
        <div>
          <h1 className="text-3xl font-semibold text-foreground dark:text-white">Documents</h1>
          <p className="mt-2 text-muted-foreground">Manage and search all your documents</p>
        </div>
        <Button asChild className="gap-2 rounded-full border border-primary/35 bg-primary px-5 text-primary-foreground shadow-[0_16px_50px_rgba(245,191,90,0.25)] hover:bg-primary/95">
          <Link href="/documents/upload">
            <FileUp className="h-4 w-4" />
            Upload New
          </Link>
        </Button>
      </div>

      <DocumentSearch />
    </div>
  );
}
