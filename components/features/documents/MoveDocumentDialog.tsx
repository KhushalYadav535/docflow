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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchFolders();
      setSelectedFolderId(currentFolderId || null);
    }
  }, [open, currentFolderId]);

  const fetchFolders = async () => {
    try {
      const data = await apiRequest<Folder[]>('/folders', { method: 'GET' });
      setFolders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch folders', error);
      toast.error('Failed to load folders');
    }
  };

  const handleMove = async () => {
    try {
      setIsLoading(true);
      const config = getApiConfig();
      await apiClient.moveDocument(documentId, selectedFolderId || '', config);
      toast.success(`Document "${documentName}" moved successfully`);
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to move document');
    } finally {
      setIsLoading(false);
    }
  };

  const buildFolderTree = (folders: Folder[]): Folder[] => {
    const folderMap = new Map<string, Folder & { children?: Folder[] }>();
    const roots: Folder[] = [];

    // Create map
    folders.forEach(folder => {
      folderMap.set(folder.id, { ...folder, children: [] });
    });

    // Build tree
    folders.forEach(folder => {
      const folderWithChildren = folderMap.get(folder.id)!;
      if (folder.parent_id && folderMap.has(folder.parent_id)) {
        const parent = folderMap.get(folder.parent_id)!;
        if (!parent.children) parent.children = [];
        parent.children.push(folderWithChildren);
      } else {
        roots.push(folderWithChildren);
      }
    });

    return roots;
  };

  const renderFolderTree = (folderList: Folder[], level = 0): JSX.Element[] => {
    return folderList.map((folder) => (
      <div key={folder.id} className="space-y-1">
        <label className="flex items-center gap-2 p-2 rounded hover:bg-accent/10 cursor-pointer">
          <input
            type="radio"
            name="folder"
            value={folder.id}
            checked={selectedFolderId === folder.id}
            onChange={() => setSelectedFolderId(folder.id)}
            className="w-4 h-4"
          />
          <FolderTree className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground" style={{ paddingLeft: `${level * 20}px` }}>
            {folder.name}
          </span>
        </label>
        {(folder as any).children && renderFolderTree((folder as any).children, level + 1)}
      </div>
    ));
  };

  const treeFolders = buildFolderTree(folders);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Move Document</DialogTitle>
          <DialogDescription>
            Select a folder to move "{documentName}" to
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto border border-border rounded-lg p-4 space-y-1">
          <label className="flex items-center gap-2 p-2 rounded hover:bg-accent/10 cursor-pointer">
            <input
              type="radio"
              name="folder"
              value=""
              checked={selectedFolderId === null}
              onChange={() => setSelectedFolderId(null)}
              className="w-4 h-4"
            />
            <span className="text-sm text-foreground font-medium">Root (No Folder)</span>
          </label>
          {renderFolderTree(treeFolders)}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={isLoading}>
            {isLoading ? 'Moving...' : 'Move Document'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
