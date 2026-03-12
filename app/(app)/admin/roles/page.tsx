'use client';

import React, { useState } from 'react';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  userCount: number;
}

const mockRoles: Role[] = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full system access, all operations',
    permissions: [
      'upload_document',
      'manage_users',
      'manage_roles',
      'view_audit_logs',
      'export_audit_logs',
    ],
    userCount: 2,
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Document management and approvals',
    permissions: ['upload_document', 'approve_reject', 'view_audit_logs'],
    userCount: 5,
  },
  {
    id: 'staff',
    name: 'Staff',
    description: 'Can upload and view documents',
    permissions: ['upload_document', 'view_document', 'download_document'],
    userCount: 15,
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access',
    permissions: ['view_document', 'download_document'],
    userCount: 8,
  },
];

const allPermissions: RolePermission[] = [
  {
    id: 'upload_document',
    name: 'Upload Document',
    category: 'Document Management',
  },
  {
    id: 'bulk_upload',
    name: 'Bulk Upload',
    category: 'Document Management',
  },
  {
    id: 'view_document',
    name: 'View Document',
    category: 'Document Management',
  },
  {
    id: 'download_document',
    name: 'Download Document',
    category: 'Document Management',
  },
  {
    id: 'edit_metadata',
    name: 'Edit Metadata',
    category: 'Document Management',
  },
  {
    id: 'delete_document',
    name: 'Delete Document',
    category: 'Document Management',
  },
  {
    id: 'approve_reject',
    name: 'Approve/Reject Documents',
    category: 'Workflow',
  },
  {
    id: 'manage_users',
    name: 'Manage Users',
    category: 'Administration',
  },
  {
    id: 'manage_roles',
    name: 'Manage Roles',
    category: 'Administration',
  },
  {
    id: 'view_audit_logs',
    name: 'View Audit Logs',
    category: 'Administration',
  },
  {
    id: 'export_audit_logs',
    name: 'Export Audit Logs',
    category: 'Administration',
  },
];

export default function RoleManagementPage() {
  const [roles, setRoles] = useState(mockRoles);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleDelete = (roleId: string) => {
    if (confirm('Are you sure? Users with this role must be reassigned first.')) {
      setRoles(roles.filter((r) => r.id !== roleId));
    }
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Role Management</h1>
          <p className="text-muted-foreground mt-1">
            Define roles and manage permissions across the system
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <Plus className="w-4 h-4" />
          Create Role
        </Button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-foreground text-lg">{role.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(role)}
                  className="text-foreground hover:bg-accent/20"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                {role.userCount === 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(role.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* User Count */}
            <div className="mb-3 p-2 bg-background rounded text-sm">
              <span className="text-muted-foreground">Users assigned: </span>
              <span className="font-semibold text-foreground">{role.userCount}</span>
            </div>

            {/* Permissions */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Key Permissions
              </p>
              <div className="flex flex-wrap gap-1">
                {role.permissions.slice(0, 3).map((perm) => (
                  <span
                    key={perm}
                    className="px-2 py-1 rounded text-xs bg-primary/10 text-primary font-medium"
                  >
                    {allPermissions.find((p) => p.id === perm)?.name}
                  </span>
                ))}
                {role.permissions.length > 3 && (
                  <span className="px-2 py-1 rounded text-xs text-muted-foreground">
                    +{role.permissions.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Permission Matrix */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground text-lg">Permission Matrix</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Complete overview of role permissions
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Permission</th>
                {roles.map((role) => (
                  <th
                    key={role.id}
                    className="px-4 py-3 text-center font-semibold text-foreground whitespace-nowrap"
                  >
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allPermissions.map((perm) => (
                <tr
                  key={perm.id}
                  className="border-b border-border/50 hover:bg-background/50 transition-colors"
                >
                  <td className="px-4 py-3 text-foreground">
                    <div>
                      <p className="font-medium">{perm.name}</p>
                      <p className="text-xs text-muted-foreground">{perm.category}</p>
                    </div>
                  </td>
                  {roles.map((role) => (
                    <td
                      key={`${role.id}-${perm.id}`}
                      className="px-4 py-3 text-center"
                    >
                      {role.permissions.includes(perm.id) ? (
                        <Check className="w-4 h-4 text-primary mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground mx-auto opacity-30" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
        <p className="text-sm text-primary font-medium">
          💡 Roles are immutable if users are assigned. Deactivate all users first to modify or delete a role.
        </p>
      </div>
    </div>
  );
}
