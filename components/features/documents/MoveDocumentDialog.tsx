'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { apiRequest, apiClient, getApiConfig } from '@/lib/api';
import { toast } from 'sonner';
import { FolderTree } from 'lucide-react';

interface Folder {
  id: string;
  name: string;
  parent_id?: string;
  parentId?: string;
  path?: string;
}

interface MoveDocumentDialogProps {
  documentId: string;
  documentName: string;
  currentFolderId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function MoveDocumentDialog({
  documentId,
  documentName,
  currentFolderId,
  open,
  onOpenChange,
  onSuccess,
}: MoveDocumentDialogProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(currentFolderId || null);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    if (open) {
      fetchFolders();
      setSelectedFolderId(currentFolderId || null);
    }
  }, [open, currentFolderId]);

  const fetchFolders = async () => {
    try {
      setIsLoadingFolders(true);
      const data = await apiRequest<Folder[]>('/folders', { method: 'GET' });
      setFolders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch folders', error);
      toast.error('Failed to load folders');
      setFolders([]);
    } finally {
      setIsLoadingFolders(false);
    }
  };

  const handleMove = async () => {
    try {
      setIsMoving(true);
      const config = getApiConfig();
      await apiRequest(`/documents/${documentId}/move`, {
        method: 'PATCH',
        body: JSON.stringify({ folderId: selectedFolderId || null }),
      });
      toast.success(`Document "${documentName}" moved successfully`);
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to move document');
    } finally {
      setIsMoving(false);
    }
  };

  const getFolderLabel = (folder: Folder) => {
    if (folder.path) return folder.path;
    return folder.name;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border/70 bg-popover/95 backdrop-blur-xl dark:border-white/10 dark:bg-[#111118]/95">
        <DialogHeader>
          <DialogTitle className="text-foreground dark:text-white">Move Document</DialogTitle>
          <DialogDescription className="text-muted-foreground dark:text-white/55">
            Select a folder to move "{documentName}" to
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 rounded-xl border border-border/70 p-4 dark:border-white/10">
          <label className="text-sm font-medium text-foreground dark:text-white">
            Select destination folder
          </label>
          {isLoadingFolders ? (
            <p className="text-sm text-muted-foreground">Loading folders...</p>
          ) : (
            <select
              value={selectedFolderId ?? ''}
              onChange={(e) => setSelectedFolderId(e.target.value || null)}
              className="w-full rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-sm text-foreground dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="">Root (No Folder)</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {getFolderLabel(folder)}
                </option>
              ))}
            </select>
          )}
          {!isLoadingFolders && folders.length === 0 && (
            <p className="text-xs text-muted-foreground">No folders found. Create a folder first.</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={isMoving || isLoadingFolders}
            className="rounded-full border border-primary/35 bg-primary text-primary-foreground hover:bg-primary/95"
          >
            {isMoving ? 'Moving...' : 'Move Document'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
