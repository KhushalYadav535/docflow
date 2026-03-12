'use client';

import { useRouter } from 'next/navigation';
import { DocumentUpload } from '@/components/features/documents/DocumentUpload';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const [folder, setFolder] = useState('general');

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [router]);

  return (
      <div className="space-y-6">
        {/* Back Button */}
        <Link href="/documents" className="inline-flex">
          <Button variant="ghost" className="gap-2 text-primary hover:bg-primary/10">
            <ChevronLeft className="h-4 w-4" />
            Back to Documents
          </Button>
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Upload Documents</h1>
          <p className="text-muted-foreground mt-2">Upload and organize your files with ease</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Upload Area */}
          <div className="lg:col-span-2">
            <DocumentUpload />
          </div>

          {/* Sidebar - Upload Options */}
          <div className="space-y-6">
            {/* Folder Selection */}
            <Card className="border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Upload Options</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="folder" className="text-foreground font-medium">Select Folder</Label>
                  <Select value={folder} onValueChange={setFolder}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="general" className="text-foreground">General</SelectItem>
                      <SelectItem value="finance" className="text-foreground">Finance</SelectItem>
                      <SelectItem value="hr" className="text-foreground">HR</SelectItem>
                      <SelectItem value="projects" className="text-foreground">Projects</SelectItem>
                      <SelectItem value="archive" className="text-foreground">Archive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Document Classification</Label>
                  <Select defaultValue="public">
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="public" className="text-foreground">Public</SelectItem>
                      <SelectItem value="internal" className="text-foreground">Internal</SelectItem>
                      <SelectItem value="confidential" className="text-foreground">Confidential</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Tips Card */}
            <Card className="border-border bg-card p-6 border-primary/20 bg-primary/5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Upload Tips</h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex gap-2">
                  <span className="flex-shrink-0">•</span>
                  <span>Files up to 100MB are supported</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0">•</span>
                  <span>Use descriptive file names</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0">•</span>
                  <span>Batch upload multiple files at once</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0">•</span>
                  <span>Documents are auto-scanned for OCR</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    );
}
