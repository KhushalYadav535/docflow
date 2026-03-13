'use client';

import { useState, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, CheckCircle2, Eye } from 'lucide-react';
import { apiClient, getApiConfig } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { FilePreview } from './FilePreview';

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

interface DocumentUploadProps {
  folder?: string;
  classification?: string;
  documentType?: string;
}

export function DocumentUpload({ folder, classification, documentType }: DocumentUploadProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState({
    department: '',
    date: new Date().toISOString().split('T')[0],
  });

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
    const uploadedFiles: UploadedFile[] = newFiles.map((file) => ({
      id: Math.random().toString(36),
      file,
      name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension for editing
      size: file.size,
      progress: 0,
      status: 'pending' as const,
    }));

    setFiles((prev) => [...prev, ...uploadedFiles]);
  };

  const uploadFile = async (uploadedFile: UploadedFile) => {
    try {
      console.log('Starting upload for file:', uploadedFile.name);
      
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id ? { ...f, status: 'uploading', progress: 0 } : f
        )
      );

      const config = getApiConfig();
      console.log('API Config:', { hasTenantId: !!config.tenantId, hasAuthToken: !!config.authToken });
      
      const metadataPayload = {
        name: uploadedFile.name,
        folderId: folder && folder !== 'none' ? folder : undefined, // Convert 'none' or empty to undefined
        documentType: documentType || 'Document',
        department: metadata.department || 'General',
        date: metadata.date,
        classification: classification || 'Public',
      };
      
      console.log('Metadata payload:', metadataPayload);

      // Upload with progress tracking
      const result = await apiClient.uploadDocument(
        uploadedFile.file,
        metadataPayload,
        config,
        (progress) => {
          // Update progress in real-time
          console.log(`Upload progress for ${uploadedFile.name}:`, progress + '%');
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadedFile.id ? { ...f, progress } : f
            )
          );
        }
      );

      console.log('Upload completed:', result);

      // Ensure 100% is set on completion
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? { ...f, progress: 100, status: 'completed' }
            : f
        )
      );

      if (result.duplicate) {
        toast.warning(`Document "${uploadedFile.name}" already exists`);
      } else {
        toast.success(`"${uploadedFile.name}" uploaded successfully`);
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? { ...f, status: 'error', error: error.message || 'Upload failed', progress: 0 }
            : f
        )
      );
      toast.error(`Failed to upload "${uploadedFile.name}": ${error.message || 'Unknown error'}`);
    }
  };

  const startUpload = async () => {
    console.log('startUpload called', { files, metadata, folder });
    
    const pendingFiles = files.filter(f => f.status === 'pending');
    console.log('Pending files:', pendingFiles);
    
    if (pendingFiles.length === 0) {
      toast.error('No files to upload');
      return;
    }

    // Validate required metadata
    if (!metadata.department || !metadata.department.trim()) {
      toast.error('Please enter department');
      return;
    }

    // Validate file names
    const filesWithEmptyNames = pendingFiles.filter(f => !f.name || !f.name.trim());
    if (filesWithEmptyNames.length > 0) {
      toast.error('Please enter document names for all files');
      return;
    }

    console.log('Starting upload for', pendingFiles.length, 'files');

    // Upload files sequentially
    for (const file of pendingFiles) {
      console.log('Uploading file:', file.name);
      await uploadFile(file);
    }

    // Redirect after all uploads complete
    setTimeout(() => {
      router.push('/documents');
    }, 2000);
  };

  const updateFileName = (id: string, newName: string) => {
    setFiles((prev) => prev.map((f) => f.id === id ? { ...f, name: newName } : f));
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

      {/* Metadata Fields */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Department <span className="text-destructive">*</span>
            {!metadata.department && files.length > 0 && (
              <span className="text-xs text-destructive ml-2">(Required to upload)</span>
            )}
          </label>
          <Input
            value={metadata.department}
            onChange={(e) => setMetadata({ ...metadata, department: e.target.value })}
            placeholder="e.g., Finance, HR, Operations"
            className={`bg-background border-border ${!metadata.department && files.length > 0 ? 'border-destructive focus:border-destructive' : ''}`}
            autoFocus={files.length > 0 && !metadata.department}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Date</label>
          <Input
            type="date"
            value={metadata.date}
            onChange={(e) => setMetadata({ ...metadata, date: e.target.value })}
            className="bg-background border-border"
          />
        </div>
      </div>

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
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleInputChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.xlsx,.jpg,.png"
        />
        <Button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Select Files
        </Button>
        
        <p className="text-xs text-muted-foreground mt-4">
          Supported formats: PDF, DOC, DOCX, XLSX, JPG, PNG (Max 100MB per file)
        </p>
      </div>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="font-semibold text-foreground">Selected Files ({files.length})</h3>
          <div className="space-y-3">
            {files.map((file) => (
              <div key={file.id} className="flex flex-col gap-3 p-4 bg-secondary/30 rounded-lg border border-border/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Document Name *</label>
                      <Input 
                        value={file.name} 
                        onChange={(e) => updateFileName(file.id, e.target.value)}
                        disabled={file.status !== 'pending'}
                        className="h-8 text-sm"
                        placeholder="Enter document name"
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-2">
                      <span>Size: {formatFileSize(file.size)}</span>
                      {folder && <span>Folder: <span className="text-foreground capitalize">{folder}</span></span>}
                      {classification && <span>Class: <span className="text-foreground capitalize">{classification}</span></span>}
                      {documentType && <span>Type: <span className="text-foreground capitalize">{documentType}</span></span>}
                    </div>

                    {file.status === 'error' && (
                      <p className="text-xs text-destructive">{file.error}</p>
                    )}

                    {file.status === 'uploading' && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-foreground">Uploading...</span>
                          <span className="text-xs font-semibold text-primary whitespace-nowrap">
                            {Math.round(file.progress)}%
                          </span>
                        </div>
                        <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 ease-out shadow-sm"
                            style={{ width: `${file.progress}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-1 w-full bg-primary/10 rounded-full" />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {file.progress < 50 ? 'Preparing upload...' : 
                           file.progress < 90 ? 'Uploading file...' : 
                           'Finalizing...'}
                        </p>
                      </div>
                    )}

                    {file.status === 'completed' && (
                      <div className="flex items-center gap-1 text-sm font-semibold text-green-500">
                        <CheckCircle2 className="h-4 w-4" />
                        Uploaded successfully
                      </div>
                    )}

                    {file.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewFile(file.file)}
                        className="mt-2 text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                    )}
                  </div>

                  {file.status === 'completed' ? (
                    <div className="flex items-center gap-1 text-sm font-semibold text-green-500 mt-6">
                      <CheckCircle2 className="h-4 w-4" />
                      Done
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(file.id)}
                      disabled={file.status === 'uploading'}
                      className="text-muted-foreground hover:text-destructive mt-5"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-end pt-4 border-t border-border mt-6 gap-2">
            {/* Show validation errors */}
            {(!metadata.department || !metadata.department.trim()) && (
              <p className="text-sm text-destructive mr-auto">
                ⚠️ Please enter Department to continue
              </p>
            )}
            {files.some(f => !f.name || !f.name.trim()) && (
              <p className="text-sm text-destructive mr-auto">
                ⚠️ Please enter document names for all files
              </p>
            )}
            <Button 
              onClick={() => {
                console.log('Button clicked', { 
                  filesCount: files.length, 
                  hasUploading: files.some(f => f.status === 'uploading'),
                  allCompleted: files.every(f => f.status === 'completed'),
                  hasEmptyNames: files.some(f => !f.name.trim()),
                  department: metadata.department 
                });
                startUpload();
              }}
              disabled={
                files.length === 0 || 
                files.some(f => f.status === 'uploading') ||
                files.every(f => f.status === 'completed') ||
                files.some(f => !f.name || !f.name.trim()) ||
                !metadata.department || !metadata.department.trim()
              }
              className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {files.some(f => f.status === 'uploading') ? 'Uploading...' : 'Submit Uploads'}
            </Button>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-auto">
            <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
          </div>
        </div>
      )}
    </Card>
  );
}
