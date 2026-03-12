'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRoleAccess } from '@/hooks/useRoleAccess';

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
}: DocumentViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const { canPerformAction, isAdmin, isManager } = useRoleAccess();

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 10, 400));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 10, 25));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

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
              {currentPage} / {totalPages}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
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
              title="Download"
              className="text-foreground hover:bg-accent/20"
            >
              <Download className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              title="Print"
              className="text-foreground hover:bg-accent/20"
            >
              <Printer className="w-4 h-4" />
            </Button>

            {canPerformAction('upload_version') && (
              <Button
                variant="ghost"
                size="icon"
                title="Upload new version"
                className="text-foreground hover:bg-accent/20"
              >
                <FileUp className="w-4 h-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowVersionHistory(!showVersionHistory)}
              title="Version history"
              className="text-foreground hover:bg-accent/20"
            >
              <History className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Document Preview Area */}
        <div className="flex-1 overflow-auto bg-card flex items-center justify-center p-4">
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
                <p className="text-sm">Page {currentPage} of {totalPages}</p>
                <p className="text-xs mt-2 text-gray-300">
                  Document viewer - placeholder for PDF/image rendering
                </p>
              </div>
            </div>
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
              <div className="mt-1 inline-block">
                <span className="px-2 py-1 rounded text-xs font-medium bg-primary/20 text-primary">
                  {status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Version History Panel */}
        {showVersionHistory && (
          <div className="bg-card border border-border rounded-lg p-4 flex-1 overflow-hidden flex flex-col">
            <h3 className="font-semibold text-foreground mb-3">Version History</h3>

            <div className="space-y-2 overflow-y-auto flex-1">
              {[
                { num: 3, date: 'Mar 10, 2026', uploader: 'You', note: 'Final revision' },
                { num: 2, date: 'Mar 8, 2026', uploader: 'Alice Smith', note: 'Initial draft' },
                { num: 1, date: 'Mar 5, 2026', uploader: 'Bob Johnson', note: 'Original' },
              ].map((v) => (
                <div
                  key={v.num}
                  className="p-2 rounded border border-border/50 hover:bg-accent/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">v{v.num}</p>
                      <p className="text-xs text-muted-foreground">{v.date}</p>
                      <p className="text-xs text-muted-foreground">{v.uploader}</p>
                      <p className="text-xs text-muted-foreground mt-1 italic">{v.note}</p>
                    </div>
                    {(isAdmin || isManager) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs whitespace-nowrap"
                      >
                        Restore
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
