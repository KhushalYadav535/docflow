'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder, FolderPlus, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FolderItem {
  id: string;
  name: string;
  documentsCount: number;
  createdAt: string;
  level: number;
}

export default function FoldersPage() {
  const router = useRouter();
  const [folders, setFolders] = useState<FolderItem[]>([
    { id: '1', name: 'Finance', documentsCount: 42, createdAt: '2024-01-01', level: 0 },
    { id: '2', name: 'HR', documentsCount: 28, createdAt: '2024-01-01', level: 0 },
    { id: '3', name: 'Projects', documentsCount: 156, createdAt: '2024-01-05', level: 0 },
    { id: '4', name: 'Marketing', documentsCount: 67, createdAt: '2024-01-08', level: 0 },
    { id: '5', name: 'General', documentsCount: 89, createdAt: '2024-01-01', level: 0 },
  ]);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [router]);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: FolderItem = {
        id: Math.random().toString(36),
        name: newFolderName,
        documentsCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        level: 0,
      };
      setFolders([...folders, newFolder]);
      setNewFolderName('');
    }
  };

  const handleDeleteFolder = (id: string) => {
    setFolders(folders.filter(f => f.id !== id));
  };

  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Folder Management</h1>
          <p className="text-muted-foreground mt-2">Organize and manage your document folders</p>
        </div>

        {/* Create New Folder */}
        <Card className="border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Create New Folder</h2>
          <div className="flex gap-3">
            <Input
              placeholder="Folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
            <Button 
              onClick={handleCreateFolder}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <FolderPlus className="h-4 w-4" />
              Create
            </Button>
          </div>
        </Card>

        {/* Folders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder) => (
            <Card
              key={folder.id}
              className="border-border bg-card p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Folder className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground truncate">{folder.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {folder.documentsCount} documents
                    </p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-border">
                    <DropdownMenuItem className="text-foreground cursor-pointer hover:bg-accent/10">
                      <Edit2 className="h-4 w-4 mr-2" />
                      <span>Rename</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteFolder(folder.id)}
                      className="text-destructive cursor-pointer hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground border-t border-border pt-3">
                <p>Created: {folder.createdAt}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {folders.length === 0 && (
          <Card className="border-border bg-card p-12 text-center">
            <Folder className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No folders yet. Create one to get started!</p>
          </Card>
        )}
      </div>
    );
}
