'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { apiRequest, getApiConfig } from '@/lib/api';
import { Shield, X, Save } from 'lucide-react';

interface FolderPermission {
  id?: string;
  role_id?: string;
  user_id?: string;
  role_name?: string;
  user_name?: string;
  user_email?: string;
  can_view: boolean;
  can_upload: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_manage: boolean;
}

interface Role {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface FolderPermissionsDialogProps {
  folderId: string;
  folderName: string;
  open: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export function FolderPermissionsDialog({
  folderId,
  folderName,
  open,
  onClose,
  onUpdate,
}: FolderPermissionsDialogProps) {
  const [permissions, setPermissions] = useState<FolderPermission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<'role' | 'user'>('role');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [newPermission, setNewPermission] = useState({
    can_view: true,
    can_upload: false,
    can_edit: false,
    can_delete: false,
    can_manage: false,
  });

  useEffect(() => {
    if (open && folderId) {
      fetchPermissions();
      fetchRoles();
      fetchUsers();
    }
  }, [open, folderId]);

  const fetchPermissions = async () => {
    try {
      const data = await apiRequest<FolderPermission[]>(`/folders/${folderId}/permissions`, { method: 'GET' });
      setPermissions(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch permissions', error);
      toast.error('Failed to load folder permissions');
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await apiRequest<Role[]>('/admin/roles', { method: 'GET' });
      setRoles(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch roles', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await apiRequest<User[]>('/users', { method: 'GET' });
      setUsers(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch users', error);
    }
  };

  const handleAddPermission = async () => {
    if (selectedType === 'role' && !selectedRoleId) {
      toast.error('Please select a role');
      return;
    }
    if (selectedType === 'user' && !selectedUserId) {
      toast.error('Please select a user');
      return;
    }

    try {
      setIsLoading(true);
      await apiRequest(`/folders/${folderId}/permissions`, {
        method: 'POST',
        body: JSON.stringify({
          roleId: selectedType === 'role' ? selectedRoleId : null,
          userId: selectedType === 'user' ? selectedUserId : null,
          ...newPermission,
        }),
      });
      toast.success('Permission added successfully');
      fetchPermissions();
      setSelectedRoleId('');
      setSelectedUserId('');
      setNewPermission({
        can_view: true,
        can_upload: false,
        can_edit: false,
        can_delete: false,
        can_manage: false,
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to add permission');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePermission = async (permissionId: string) => {
    if (!confirm('Are you sure you want to remove this permission?')) return;
    try {
      await apiRequest(`/folders/${folderId}/permissions/${permissionId}`, { method: 'DELETE' });
      toast.success('Permission removed successfully');
      fetchPermissions();
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove permission');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Shield className="h-5 w-5" />
            Folder Permissions: {folderName}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Override role-based permissions for this folder. Folder permissions take precedence over global role permissions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Permission */}
          <div className="border border-border rounded-lg p-4 bg-secondary/30">
            <h3 className="font-semibold text-foreground mb-4">Add Permission</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label className="text-foreground">Type</Label>
                  <Select value={selectedType} onValueChange={(value: 'role' | 'user') => setSelectedType(value)}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="role">Role</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label className="text-foreground">{selectedType === 'role' ? 'Role' : 'User'}</Label>
                  {selectedType === 'role' ? (
                    <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can_view"
                    checked={newPermission.can_view}
                    onCheckedChange={(checked) => setNewPermission({ ...newPermission, can_view: !!checked })}
                  />
                  <Label htmlFor="can_view" className="text-sm text-foreground cursor-pointer">View</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can_upload"
                    checked={newPermission.can_upload}
                    onCheckedChange={(checked) => setNewPermission({ ...newPermission, can_upload: !!checked })}
                  />
                  <Label htmlFor="can_upload" className="text-sm text-foreground cursor-pointer">Upload</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can_edit"
                    checked={newPermission.can_edit}
                    onCheckedChange={(checked) => setNewPermission({ ...newPermission, can_edit: !!checked })}
                  />
                  <Label htmlFor="can_edit" className="text-sm text-foreground cursor-pointer">Edit</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can_delete"
                    checked={newPermission.can_delete}
                    onCheckedChange={(checked) => setNewPermission({ ...newPermission, can_delete: !!checked })}
                  />
                  <Label htmlFor="can_delete" className="text-sm text-foreground cursor-pointer">Delete</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can_manage"
                    checked={newPermission.can_manage}
                    onCheckedChange={(checked) => setNewPermission({ ...newPermission, can_manage: !!checked })}
                  />
                  <Label htmlFor="can_manage" className="text-sm text-foreground cursor-pointer">Manage</Label>
                </div>
              </div>

              <Button onClick={handleAddPermission} disabled={isLoading} className="w-full bg-primary text-primary-foreground">
                <Save className="h-4 w-4 mr-2" />
                Add Permission
              </Button>
            </div>
          </div>

          {/* Existing Permissions */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Current Permissions</h3>
            {permissions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No custom permissions set. Using default role permissions.</p>
            ) : (
              <div className="space-y-2">
                {permissions.map((perm) => (
                  <div
                    key={perm.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg bg-card hover:bg-accent/10"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {perm.role_name || perm.user_name || 'Unknown'}
                      </p>
                      {perm.user_email && (
                        <p className="text-xs text-muted-foreground">{perm.user_email}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-xs">
                        <span className={perm.can_view ? 'text-green-500' : 'text-muted-foreground'}>View</span>
                        <span className={perm.can_upload ? 'text-green-500' : 'text-muted-foreground'}>Upload</span>
                        <span className={perm.can_edit ? 'text-green-500' : 'text-muted-foreground'}>Edit</span>
                        <span className={perm.can_delete ? 'text-green-500' : 'text-muted-foreground'}>Delete</span>
                        <span className={perm.can_manage ? 'text-green-500' : 'text-muted-foreground'}>Manage</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => perm.id && handleDeletePermission(perm.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
