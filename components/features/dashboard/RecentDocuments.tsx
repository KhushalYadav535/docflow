'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, FileImage, FileArchive, Clock } from 'lucide-react';
import Link from 'next/link';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'archive';
  size: string;
  uploadedAt: string;
}

const documents: Document[] = [
  { id: '1', name: 'Q4 Financial Report.pdf', type: 'pdf', size: '2.4 MB', uploadedAt: '2 hours ago' },
  { id: '2', name: 'Project Proposal.pdf', type: 'pdf', size: '1.8 MB', uploadedAt: '1 day ago' },
  { id: '3', name: 'Team Meeting Notes.pdf', type: 'pdf', size: '892 KB', uploadedAt: '3 days ago' },
  { id: '4', name: 'Wireframes.zip', type: 'archive', size: '45.2 MB', uploadedAt: '1 week ago' },
  { id: '5', name: 'Brand Guidelines.pdf', type: 'pdf', size: '3.1 MB', uploadedAt: '2 weeks ago' },
];

const iconMap = {
  pdf: FileText,
  image: FileImage,
  archive: FileArchive,
};

export function RecentDocuments() {
  return (
    <Card className="border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Recent Documents</h2>
        <Link href="/documents">
          <Button variant="ghost" className="text-primary hover:bg-primary/10">
            View All
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {documents.map((doc) => {
          const Icon = iconMap[doc.type];
          return (
            <div
              key={doc.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors group cursor-pointer"
            >
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary">
                  {doc.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span>{doc.size}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{doc.uploadedAt}</span>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Open
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
