'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface RolePermission {
  id: string;
  name: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  user_count?: number;
  userCount?: number;
}

const allPermissions: RolePermission[] = [
  { id: 'upload_document', name: 'Upload Document', category: 'Document Management' },
  { id: 'bulk_upload', name: 'Bulk Upload', category: 'Document Management' },
  { id: 'view_document', name: 'View Document', category: 'Document Management' },
  { id: 'download_document', name: 'Download Document', category: 'Document Management' },
  { id: 'edit_metadata', name: 'Edit Metadata', category: 'Document Management' },
  { id: 'delete_document', name: 'Delete Document', category: 'Document Management' },
  { id: 'upload_version', name: 'Upload Version', category: 'Version Control' },
  { id: 'restore_version', name: 'Restore Version', category: 'Version Control' },
  { id: 'create_folder', name: 'Create Folder', category: 'Folder Management' },
  { id: 'rename_folder', name: 'Rename Folder', category: 'Folder Management' },
  { id: 'delete_folder', name: 'Delete Folder', category: 'Folder Management' },
  { id: 'submit_approval', name: 'Submit for Approval', category: 'Workflow' },
  { id: 'approve_reject', name: 'Approve/Reject', category: 'Workflow' },
  { id: 'manage_users', name: 'Manage Users', category: 'Administration' },
  { id: 'manage_roles', name: 'Manage Roles', category: 'Administration' },
  { id: 'view_audit_logs', name: 'View Audit Logs', category: 'Administration' },
  { id: 'export_audit_logs', name: 'Export Audit Logs', category: 'Administration' },
  { id: 'manage_categories', name: 'Manage Categories', category: 'Administration' },
  { id: 'manage_metadata_fields', name: 'Manage Metadata Fields', category: 'Administration' },
  { id: 'storage_management', name: 'Storage Management', category: 'Administration' },
];

export default function AdminRolesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<{name: string, description: string, permissions: string[]}>({
    name: '',
    description: '',
    permissions: [],
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchRoles();
  }, [isAuthenticated, router]);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const data = await apiRequest<Role[]>('/admin/roles', { method: 'GET' });
      setRoles(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch roles', error);
      toast.error('Failed to load roles');
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => setFormData({ name: '', description: '', permissions: [] });

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Role name is required');
      return;
    }
    try {
      await apiRequest('/admin/roles', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      toast.success('Role created successfully');
      setIsAddOpen(false);
      resetForm();
      fetchRoles();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create role');
    }
  };

  const handleEditRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    try {
      await apiRequest(`/admin/roles/${editingRole.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      toast.success('Role updated successfully');
      setIsEditOpen(false);
      setEditingRole(null);
      resetForm();
      fetchRoles();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update role');
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      await apiRequest(`/admin/roles/${id}`, { method: 'DELETE' });
      toast.success('Role deleted successfully');
      fetchRoles();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete role');
    }
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions || [],
    });
    setIsEditOpen(true);
  };

  const togglePermission = (permissionId: string) => {
    setFormData({
      ...formData,
      permissions: formData.permissions.includes(permissionId)
        ? formData.permissions.filter(p => p !== permissionId)
        : [...formData.permissions, permissionId],
    });
  };

  const permissionsByCategory = allPermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, RolePermission[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Role Management</h1>
          <p className="text-muted-foreground mt-2">Define roles and their permissions</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create New Role</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddRole} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Role Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-background border-border"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-4">
                <Label className="text-foreground">Permissions</Label>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {Object.entries(permissionsByCategory).map(([category, perms]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-semibold text-sm text-foreground">{category}</h4>
                      <div className="space-y-2 pl-4">
                        {perms.map((perm) => (
                          <div key={perm.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={perm.id}
                              checked={formData.permissions.includes(perm.id)}
                              onCheckedChange={() => togglePermission(perm.id)}
                            />
                            <Label htmlFor={perm.id} className="text-sm text-foreground cursor-pointer">
                              {perm.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-primary text-primary-foreground">Create Role</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-border bg-card p-6">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-4 w-24" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <Card key={role.id} className="border-border bg-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{role.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditModal(role)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteRole(role.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {role.userCount || role.user_count || 0} users assigned
                </p>
                <p className="text-xs text-muted-foreground">
                  {role.permissions?.length || 0} permissions
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) { setEditingRole(null); resetForm(); } }}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Role</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditRole} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-foreground">Role Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-background border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-foreground">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-4">
              <Label className="text-foreground">Permissions</Label>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(permissionsByCategory).map(([category, perms]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-semibold text-sm text-foreground">{category}</h4>
                    <div className="space-y-2 pl-4">
                      {perms.map((perm) => (
                        <div key={perm.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-${perm.id}`}
                            checked={formData.permissions.includes(perm.id)}
                            onCheckedChange={() => togglePermission(perm.id)}
                          />
                          <Label htmlFor={`edit-${perm.id}`} className="text-sm text-foreground cursor-pointer">
                            {perm.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary text-primary-foreground">Update Role</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
