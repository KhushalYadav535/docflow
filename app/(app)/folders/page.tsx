'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder, FolderPlus, MoreVertical, Trash2, Edit2, Shield, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderPermissionsDialog } from '@/components/features/folders/FolderPermissionsDialog';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import Link from 'next/link';

interface FolderItem {
  id: string;
  name: string;
  document_count?: number;
  documentsCount?: number;
  created_at?: string;
  createdAt?: string;
  level: number;
  parent_id?: string | null;
  parentId?: string | null;
}

export default function FoldersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { hasRole } = useRoleAccess();
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingFolder, setEditingFolder] = useState<FolderItem | null>(null);
  const [editName, setEditName] = useState('');
  const [permissionsFolderId, setPermissionsFolderId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchFolders();
    if (currentFolderId) {
      fetchDocumentsInFolder(currentFolderId);
    } else {
      setDocuments([]);
    }
  }, [isAuthenticated, router, currentFolderId]);

  const fetchFolders = async () => {
    try {
      setIsLoading(true);
      const params = currentFolderId ? `?parentId=${currentFolderId}` : '';
      const data = await apiRequest<FolderItem[]>(`/folders${params}`, { method: 'GET' });
      setFolders(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch folders', error);
      toast.error('Failed to load folders');
      setFolders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocumentsInFolder = async (folderId: string) => {
    try {
      setIsLoadingDocuments(true);
      const data = await apiRequest<any[]>(`/documents?folderId=${folderId}`, { method: 'GET' });
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch documents in folder', error);
      setDocuments([]);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const currentFolder = folders.find(f => f.id === currentFolderId);
  const currentLevel = currentFolder ? currentFolder.level + 1 : 0;
  
  // Breadcrumbs
  const getBreadcrumbs = () => {
    let breadcrumbs: FolderItem[] = [];
    let curr = currentFolder;
    while (curr) {
      breadcrumbs.unshift(curr);
      curr = folders.find(f => f.id === (curr!.parentId || curr!.parent_id));
    }
    return breadcrumbs;
  };

  const displayedFolders = folders.filter(f => (f.parentId || f.parent_id) === currentFolderId);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Folder name is required');
      return;
    }
    if (currentLevel >= 3) {
      toast.error("Maximum folder depth (3 levels) reached.");
      return;
    }
    try {
      await apiRequest('/folders', {
        method: 'POST',
        body: JSON.stringify({
          name: newFolderName,
          parentId: currentFolderId,
        }),
      });
      toast.success('Folder created successfully');
      setNewFolderName('');
      fetchFolders();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create folder');
    }
  };

  const handleRenameFolder = async (folder: FolderItem) => {
    if (!editName.trim()) {
      toast.error('Folder name is required');
      return;
    }
    try {
      await apiRequest(`/folders/${folder.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: editName }),
      });
      toast.success('Folder renamed successfully');
      setEditingFolder(null);
      setEditName('');
      fetchFolders();
    } catch (error: any) {
      toast.error(error.message || 'Failed to rename folder');
    }
  };

  const handleDeleteFolder = async (id: string) => {
    const folderToDelete = folders.find(f => f.id === id);
    if (!folderToDelete) return;
    
    const hasChildren = folders.some(f => (f.parentId || f.parent_id) === id);
    const docCount = folderToDelete.documentsCount || folderToDelete.document_count || 0;
    
    if (docCount > 0 || hasChildren) {
      toast.error('Cannot delete non-empty folder. Please remove all contents first.');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this folder?')) return;
    
    try {
      await apiRequest(`/folders/${id}`, { method: 'DELETE' });
      toast.success('Folder deleted successfully');
      fetchFolders();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete folder');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Folder Management</h1>
        <p className="text-muted-foreground mt-2">Organize and manage your document folders in up to 3 levels</p>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg border border-border">
        <button 
          onClick={() => setCurrentFolderId(null)}
          className="hover:text-primary transition-colors font-medium"
        >
          Root (Departments)
        </button>
        {getBreadcrumbs().map((crumb, idx) => (
          <div key={crumb.id} className="flex items-center gap-2">
            <span>/</span>
            <button 
              onClick={() => setCurrentFolderId(crumb.id)}
              className={`transition-colors font-medium ${idx === getBreadcrumbs().length - 1 ? 'text-primary' : 'hover:text-primary'}`}
            >
              {crumb.name}
            </button>
          </div>
        ))}
      </div>

      {/* Create New Folder */}
      <Card className="border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          {currentLevel < 3 ? 'Create New Folder' : 'Maximum Depth Reached'}
        </h2>
        <div className="flex gap-3">
          <Input
            placeholder="Folder name..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
            disabled={currentLevel >= 3}
            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
          <Button 
            onClick={handleCreateFolder}
            disabled={currentLevel >= 3 || !newFolderName.trim()}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <FolderPlus className="h-4 w-4" />
            Create
          </Button>
        </div>
      </Card>

      {/* Folders Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-border bg-card p-4">
              <Skeleton className="h-24 w-full" />
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedFolders.map((folder) => (
              <Card
                key={folder.id}
                className="border-border bg-card p-4 hover:border-primary/50 transition-colors cursor-pointer group flex flex-col"
                onClick={() => setCurrentFolderId(folder.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Folder className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground truncate">{folder.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {folder.documentsCount || folder.document_count || 0} documents
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border" onClick={(e) => e.stopPropagation()}>
                      {hasRole(['admin', 'manager']) && (
                        <>
                          <DropdownMenuItem 
                            className="text-foreground cursor-pointer hover:bg-accent/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPermissionsFolderId(folder.id);
                            }}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            <span>Permissions</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border" />
                        </>
                      )}
                      <DropdownMenuItem 
                        className="text-foreground cursor-pointer hover:bg-accent/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingFolder(folder);
                          setEditName(folder.name);
                        }}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        <span>Rename</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder.id);
                        }}
                        className="text-destructive cursor-pointer hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground border-t border-border mt-auto pt-3">
                  <p>Created: {new Date(folder.createdAt || folder.created_at || '').toLocaleDateString()}</p>
                  <p>Level: {folder.level + 1} ({['Department', 'Project', 'File Type'][folder.level] || 'Subfolder'})</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Empty State for Folders */}
          {displayedFolders.length === 0 && !currentFolderId && (
            <Card className="border-border bg-card p-12 text-center">
              <Folder className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-foreground font-medium mb-1">No folders found</p>
              <p className="text-muted-foreground text-sm">Create a new folder to get started in this directory.</p>
            </Card>
          )}
        </>
      )}

      {/* Documents in Current Folder */}
      {currentFolderId && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Documents in {currentFolder?.name || 'this folder'}
          </h2>
          {isLoadingDocuments ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border-border bg-card p-4">
                  <Skeleton className="h-20 w-full" />
                </Card>
              ))}
            </div>
          ) : documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <Card key={doc.id} className="border-border bg-card p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/documents/${doc.id}`}>
                          <h3 className="font-semibold text-foreground truncate hover:text-primary cursor-pointer">
                            {doc.name}
                          </h3>
                        </Link>
                        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                          {doc.uploaded_by && <p>By: {doc.uploaded_by}</p>}
                          {doc.file_size && <p>Size: {(doc.file_size / 1024).toFixed(2)} KB</p>}
                          {doc.created_at && (
                            <p>Uploaded: {new Date(doc.created_at).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-border bg-card p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-foreground font-medium mb-1">No documents in this folder</p>
              <p className="text-muted-foreground text-sm">Upload documents to this folder to see them here.</p>
            </Card>
          )}
        </div>
      )}

      {/* Rename Dialog */}
      {editingFolder && (
        <Card className="border-border bg-card p-6 fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-foreground mb-4">Rename Folder</h3>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleRenameFolder(editingFolder)}
              className="mb-4 bg-background border-border"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setEditingFolder(null); setEditName(''); }}>
                Cancel
              </Button>
              <Button onClick={() => handleRenameFolder(editingFolder)} className="bg-primary text-primary-foreground">
                Save
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Folder Permissions Dialog */}
      {permissionsFolderId && (
        <FolderPermissionsDialog
          folderId={permissionsFolderId}
          folderName={folders.find(f => f.id === permissionsFolderId)?.name || 'Folder'}
          open={!!permissionsFolderId}
          onClose={() => setPermissionsFolderId(null)}
          onUpdate={() => fetchFolders()}
        />
      )}
    </div>
  );
}
