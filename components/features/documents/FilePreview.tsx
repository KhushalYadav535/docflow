'use client';

import { useState, useEffect } from 'react';
import { X, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface FilePreviewProps {
  file: File;
  onClose: () => void;
}

export function FilePreview({ file, onClose }: FilePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | 'other'>('other');

  useEffect(() => {
    const fileType = file.type.toLowerCase();
    
    if (fileType.startsWith('image/')) {
      setPreviewType('image');
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (fileType === 'application/pdf') {
      setPreviewType('pdf');
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewType('other');
      setPreviewUrl(null);
    }
  }, [file]);

  return (
    <Card className="border-border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">File Preview</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2 mb-4">
        <p className="text-sm text-foreground font-medium">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          Size: {(file.size / 1024 / 1024).toFixed(2)} MB | Type: {file.type || 'Unknown'}
        </p>
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-secondary/30 min-h-[300px] flex items-center justify-center">
        {previewType === 'image' && previewUrl ? (
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="max-w-full max-h-[500px] object-contain"
          />
        ) : previewType === 'pdf' && previewUrl ? (
          <iframe
            src={previewUrl}
            className="w-full h-[500px] border-0"
            title="PDF Preview"
          />
        ) : (
          <div className="text-center p-8">
            {file.type?.includes('word') || file.type?.includes('document') ? (
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            ) : (
              <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            )}
            <p className="text-sm text-muted-foreground">
              Preview not available for this file type
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              File will be processed after upload
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
