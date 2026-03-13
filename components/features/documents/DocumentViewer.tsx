'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Printer,
  FileUp,
  History,
  Share2,
  Send,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { toast } from 'sonner';
import { apiClient, getApiConfig, apiRequest } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Document, Page, pdfjs } from 'react-pdf';
// CSS imports for react-pdf (v10+)
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentViewerProps {
  documentId: string;
  documentName: string;
  documentType: string;
  folderPath: string;
  uploader: string;
  uploadDate: string;
  version: string;
  status: string;
  totalPages?: number;
  searchTerms?: string; // For highlighting search terms
}

interface Version {
  id: string;
  version_number: number;
  uploaded_by?: string;
  uploaded_at?: string;
  change_note?: string;
}

export function DocumentViewer({
  documentId,
  documentName,
  documentType,
  folderPath,
  uploader,
  uploadDate,
  version,
  status,
  totalPages = 5,
  searchTerms,
}: DocumentViewerProps) {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [docStatus, setDocStatus] = useState(status);
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const { canPerformAction, isAdmin, isManager } = useRoleAccess();
  
  // PDF rendering state
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isImage, setIsImage] = useState(false);

  useEffect(() => {
    if (showVersionHistory && documentId) {
      fetchVersions();
    } else if (showVersionHistory && !documentId) {
      toast.error('Document ID is missing');
      setShowVersionHistory(false);
    }
  }, [showVersionHistory, documentId]);

  const fetchVersions = async () => {
    if (!documentId) {
      toast.error('Document ID is required');
      return;
    }
    
    try {
      setIsLoadingVersions(true);
      const data = await apiRequest<Version[]>(`/documents/${documentId}/versions`, { method: 'GET' });
      setVersions(Array.isArray(data) ? data.sort((a, b) => b.version_number - a.version_number) : []);
    } catch (error: any) {
      console.error('Failed to fetch versions', error);
      toast.error('Failed to load version history');
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 10, 400));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 10, 25));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPagesState || 1));
  const handlePageChange = (page: number) => {
    const pageNum = Math.max(1, Math.min(page, totalPagesState || 1));
    setCurrentPage(pageNum);
  };

  const handleDownload = async () => {
    try {
      const config = getApiConfig();
      const blob = await apiClient.getDocumentFile(documentId, undefined, config);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = documentName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (error: any) {
      toast.error('Download failed');
    }
  };

  const handlePrint = () => {
    window.print();
    toast.info('Print dialog opened');
  };

  const handleUploadVersion = () => {
    // Navigate to upload page with document ID
    window.location.href = `/documents/upload?documentId=${documentId}`;
  };

  const handleShare = async () => {
    try {
      // Generate secure share link with expiration (24 hours)
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 24);
      const shareLink = `${window.location.origin}/documents/${documentId}?share=true&expires=${expirationDate.getTime()}`;
      await navigator.clipboard.writeText(shareLink);
      toast.success('Secure link copied to clipboard (expires in 24 hours)');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleRequestApproval = async () => {
    try {
      await apiRequest(`/workflow/documents/${documentId}/approval/submit`, {
        method: 'POST',
      });
      setDocStatus('Under Review');
      toast.success('Document submitted for approval');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit for approval');
    }
  };

  const handleApprove = async () => {
    try {
      await apiRequest(`/workflow/documents/${documentId}/approval/approve`, {
        method: 'POST',
      });
      setDocStatus('Approved');
      toast.success('Document approved');
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve document');
    }
  };

  const handleReject = async () => {
    const comment = prompt('Please provide a rejection reason:');
    if (!comment) {
      toast.error('Rejection comment is required');
      return;
    }
    try {
      await apiRequest(`/workflow/documents/${documentId}/approval/reject`, {
        method: 'POST',
        body: JSON.stringify({ comment }),
      });
      setDocStatus('Draft');
      toast.success('Document rejected');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject document');
    }
  };

  const handleRestoreVersion = async (versionId: string, versionNumber: number) => {
    if (!confirm(`Are you sure you want to restore version ${versionNumber}?`)) return;
    try {
      await apiRequest(`/documents/${documentId}/versions/${versionId}/restore`, {
        method: 'POST',
      });
      toast.success(`Version ${versionNumber} restored successfully`);
      fetchVersions();
      // Reload page to show updated version
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Failed to restore version');
    }
  };

  const handleTriggerOCR = async () => {
    if (!confirm('Trigger OCR processing for this document? This may take a few moments.')) return;
    try {
      const config = getApiConfig();
      await apiClient.triggerOCR(documentId, config);
      toast.success('OCR processing started. The document will be indexed shortly.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to trigger OCR');
    }
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-100px)]">
      {/* Main Viewer Area */}
      <div className="flex-1 flex flex-col bg-background rounded-lg border border-border overflow-hidden">
        {/* Toolbar */}
        <div className="bg-card border-b border-border p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            {/* Zoom Controls */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              title="Zoom out"
              className="text-foreground hover:bg-accent/20"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>

            <input
              type="number"
              min="25"
              max="400"
              step="10"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(Number(e.target.value))}
              className="w-16 px-2 py-1 text-sm border border-border rounded bg-background text-foreground text-center"
            />
            <span className="text-xs text-muted-foreground">%</span>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              title="Zoom in"
              className="text-foreground hover:bg-accent/20"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>

            <div className="h-6 w-px bg-border mx-2" />

            {/* Rotate */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRotate}
              title="Rotate 90°"
              className="text-foreground hover:bg-accent/20"
            >
              <RotateCw className="w-4 h-4" />
            </Button>

            <div className="h-6 w-px bg-border mx-2" />

            {/* Page Navigation */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="text-foreground hover:bg-accent/20 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="text-sm text-muted-foreground whitespace-nowrap px-2">
              {currentPage} / {totalPagesState || totalPages}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextPage}
              disabled={currentPage === (totalPagesState || totalPages)}
              className="text-foreground hover:bg-accent/20 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              title="Download"
              className="text-foreground hover:bg-accent/20"
            >
              <Download className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrint}
              title="Print"
              className="text-foreground hover:bg-accent/20"
            >
              <Printer className="w-4 h-4" />
            </Button>

            {canPerformAction('upload_version') && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleUploadVersion}
                title="Upload new version"
                className="text-foreground hover:bg-accent/20"
              >
                <FileUp className="w-4 h-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              title="Share secure link"
              className="text-foreground hover:bg-accent/20"
            >
              <Share2 className="w-4 h-4" />
            </Button>

            {canPerformAction('submit_approval') && docStatus !== 'Under Review' && docStatus !== 'Approved' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRequestApproval}
                title="Submit for Approval"
                className="text-foreground hover:text-primary hover:bg-primary/10"
              >
                <Send className="w-4 h-4" />
              </Button>
            )}

            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleTriggerOCR}
                title="Trigger OCR Processing"
                className="text-foreground hover:bg-accent/20"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (!documentId) {
                  toast.error('Document ID is missing');
                  return;
                }
                setShowVersionHistory(!showVersionHistory);
              }}
              disabled={!documentId}
              title="Version history"
              className="text-foreground hover:bg-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <History className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Document Render Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Thumbnail Strip */}
          {numPages !== null && numPages > 1 && (
            <div className="w-24 bg-card border-r border-border overflow-y-auto hidden md:flex flex-col gap-4 p-4 shrink-0">
              {Array.from({ length: numPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`relative aspect-[8.5/11] w-full rounded flex-shrink-0 border-2 overflow-hidden transition-all ${
                    currentPage === i + 1 ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                  }`}
                >
                  {fileUrl && !isImage && (
                    <Document file={fileUrl} onLoadSuccess={({ numPages }) => {}} loading={<div className="absolute inset-0 bg-secondary/30 flex items-center justify-center"><span className="text-xs font-medium text-muted-foreground">{i + 1}</span></div>}>
                      <Page pageNumber={i + 1} width={96} renderTextLayer={false} renderAnnotationLayer={false} />
                    </Document>
                  )}
                  {(!fileUrl || isImage) && (
                    <div className="absolute inset-0 bg-secondary/30 flex items-center justify-center">
                      <span className="text-xs font-medium text-muted-foreground">{i + 1}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Document Preview Area */}
          <div className="flex-1 overflow-auto bg-muted/20 flex items-center justify-center p-4">
            {isLoadingPdf ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-sm text-muted-foreground">Loading document...</p>
                </div>
              </div>
            ) : pdfError ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p className="text-sm mb-2">{pdfError}</p>
                  <Button variant="outline" size="sm" onClick={loadDocumentFile}>
                    Retry
                  </Button>
                </div>
              </div>
            ) : fileUrl && isImage ? (
              <div
                className="bg-white rounded border border-border flex items-center justify-center overflow-hidden"
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
              >
                <img
                  src={fileUrl}
                  alt={documentName}
                  className="max-w-full max-h-full object-contain"
                  style={{ transform: `rotate(${rotation}deg)` }}
                />
              </div>
            ) : fileUrl && documentType?.toLowerCase().includes('pdf') ? (
              <div
                className="bg-white rounded border border-border flex items-center justify-center overflow-auto"
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
              >
                <Document
                  file={fileUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Loading PDF...</p>
                    </div>
                  }
                >
                  <Page
                    pageNumber={currentPage}
                    scale={zoomLevel / 100}
                    rotate={rotation}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="shadow-lg"
                  />
                </Document>
              </div>
            ) : (
              <div
                className="bg-white rounded border border-border flex items-center justify-center"
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  width: '100%',
                  maxWidth: '800px',
                  aspectRatio: '8.5 / 11',
                }}
              >
                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 text-center p-4">
                  <div>
                    <div className="text-4xl mb-4">📄</div>
                    <p className="text-sm">Page {currentPage} of {totalPagesState || totalPages}</p>
                    <p className="text-xs mt-2 text-gray-300">
                      Preview not available for this file type. Please download to view.
                    </p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metadata & Actions Sidebar */}
      <div className="w-80 flex flex-col gap-4">
        {/* Metadata Panel */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold text-foreground mb-4">Document Details</h3>

          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Name</label>
              <p className="text-foreground mt-1">{documentName}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Type</label>
              <p className="text-foreground mt-1">{documentType}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Folder Path</label>
              <p className="text-foreground mt-1 text-xs">{folderPath}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Uploaded By</label>
              <p className="text-foreground mt-1">{uploader}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Upload Date</label>
              <p className="text-foreground mt-1">{uploadDate}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Version</label>
              <p className="text-foreground mt-1">{version}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Status</label>
              <div className="mt-1 flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  docStatus === 'Approved' ? 'bg-green-500/20 text-green-500' :
                  docStatus === 'Under Review' ? 'bg-yellow-500/20 text-yellow-500' :
                  'bg-primary/20 text-primary'
                }`}>
                  {docStatus}
                </span>
                
                {docStatus === 'Under Review' && canPerformAction('approve_reject') && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-green-500 hover:bg-green-500/10 hover:text-green-600"
                      onClick={handleApprove}
                      title="Approve"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:bg-red-500/10 hover:text-red-600"
                      onClick={handleReject}
                      title="Reject"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Version History Panel */}
        {showVersionHistory && (
          <div className="bg-card border border-border rounded-lg p-4 flex-1 overflow-hidden flex flex-col">
            <h3 className="font-semibold text-foreground mb-3">Version History</h3>

            <div className="space-y-2 overflow-y-auto flex-1">
              {isLoadingVersions ? (
                <p className="text-sm text-muted-foreground text-center py-4">Loading versions...</p>
              ) : versions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No version history</p>
              ) : (
                versions.map((v) => (
                  <div
                    key={v.id}
                    className="p-2 rounded border border-border/50 hover:bg-accent/10 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">v{v.version_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {v.uploaded_at ? new Date(v.uploaded_at).toLocaleDateString() : 'Unknown date'}
                        </p>
                        <p className="text-xs text-muted-foreground">{v.uploaded_by || 'Unknown'}</p>
                        {v.change_note && (
                          <p className="text-xs text-muted-foreground mt-1 italic">{v.change_note}</p>
                        )}
                      </div>
                      {canPerformAction('restore_version') && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs whitespace-nowrap"
                          onClick={() => handleRestoreVersion(v.id, v.version_number)}
                        >
                          Restore
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
