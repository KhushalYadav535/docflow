'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

export function DocumentUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles: File[]) => {
    const uploadedFiles = newFiles.map((file) => ({
      id: Math.random().toString(36),
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading' as const,
    }));

    setFiles((prev) => [...prev, ...uploadedFiles]);

    // Simulate upload progress
    uploadedFiles.forEach((file) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, progress: 100, status: 'completed' } : f
            )
          );
        } else {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, progress: Math.min(progress, 99) } : f
            )
          );
        }
      }, 200);
    });
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card className="border-border bg-card p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Upload Documents</h2>

      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border bg-secondary/30'
        }`}
      >
        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Drag and drop files here</h3>
        <p className="text-sm text-muted-foreground mb-4">or click below to select files</p>
        
        <label>
          <input
            type="file"
            multiple
            onChange={handleInputChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.xlsx,.jpg,.png"
          />
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Select Files
          </Button>
        </label>
        
        <p className="text-xs text-muted-foreground mt-4">
          Supported formats: PDF, DOC, DOCX, XLSX, JPG, PNG (Max 100MB per file)
        </p>
      </div>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="font-semibold text-foreground">Uploading ({files.length})</h3>
          {files.map((file) => (
            <div key={file.id} className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden mr-3">
                    <div
                      className={`h-full rounded-full transition-all ${
                        file.status === 'completed' ? 'bg-green-500' : 'bg-primary'
                      }`}
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {file.progress}%
                  </span>
                </div>
              </div>

              {file.status === 'completed' ? (
                <div className="text-xs font-semibold text-green-500">✓ Done</div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
