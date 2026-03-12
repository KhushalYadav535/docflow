'use client';

import { useCallback } from 'react';

export type UserRole = 'admin' | 'manager' | 'staff' | 'viewer';

export const RoleHierarchy: Record<UserRole, number> = {
  admin: 4,
  manager: 3,
  staff: 2,
  viewer: 1,
};

export const RolePermissions: Record<UserRole, string[]> = {
  admin: [
    'upload_document',
    'bulk_upload',
    'view_document',
    'download_document',
    'edit_metadata',
    'delete_document',
    'upload_version',
    'restore_version',
    'create_folder',
    'rename_folder',
    'delete_folder',
    'submit_approval',
    'approve_reject',
    'manage_users',
    'manage_roles',
    'view_audit_logs',
    'export_audit_logs',
    'manage_categories',
    'manage_metadata_fields',
    'storage_management',
  ],
  manager: [
    'upload_document',
    'bulk_upload',
    'view_document',
    'download_document',
    'edit_metadata',
    'upload_version',
    'restore_version',
    'create_folder',
    'rename_folder',
    'submit_approval',
    'approve_reject',
    'view_audit_logs',
    'manage_categories',
  ],
  staff: [
    'upload_document',
    'bulk_upload',
    'view_document',
    'download_document',
    'edit_metadata',
    'upload_version',
    'submit_approval',
  ],
  viewer: [
    'view_document',
    'download_document',
  ],
};

// Mock current user - replace with actual auth context
const mockUser = {
  id: 'user-001',
  name: 'John Admin',
  email: 'john@acme.com',
  role: 'admin' as UserRole,
  roles: ['admin'] as UserRole[],
};

export function useRoleAccess() {
  // In production, get this from auth context/session
  const user = mockUser;

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user || !user.role) return false;

      // Check if user has any role with this permission
      const userRoles = user.roles || [user.role];
      return userRoles.some((role) => RolePermissions[role]?.includes(permission));
    },
    [user]
  );

  const hasRole = useCallback(
    (role: UserRole | UserRole[]): boolean => {
      if (!user || !user.role) return false;

      const roles = Array.isArray(role) ? role : [role];
      const userRoles = user.roles || [user.role];

      // Check if any user role meets the requirement
      return roles.some((r) => userRoles.includes(r));
    },
    [user]
  );

  const canPerformAction = useCallback(
    (permission: string): boolean => {
      return hasPermission(permission);
    },
    [hasPermission]
  );

  const getHighestRole = useCallback((): UserRole => {
    if (!user || !user.roles) return user?.role || 'viewer';

    let highest: UserRole = 'viewer';
    let highestLevel = RoleHierarchy[highest];

    for (const role of user.roles) {
      const level = RoleHierarchy[role];
      if (level > highestLevel) {
        highestLevel = level;
        highest = role;
      }
    }

    return highest;
  }, [user]);

  return {
    currentUser: user,
    hasPermission,
    hasRole,
    canPerformAction,
    getHighestRole,
    isAdmin: user?.role === 'admin' || user?.roles?.includes('admin'),
    isManager: ['admin', 'manager'].includes(user?.role || '') || user?.roles?.some((r) => ['admin', 'manager'].includes(r)),
    isStaff: ['admin', 'manager', 'staff'].includes(user?.role || '') || user?.roles?.some((r) => ['admin', 'manager', 'staff'].includes(r)),
    isViewer: true, // All roles can view
  };
}
