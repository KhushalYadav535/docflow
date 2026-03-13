'use client';

import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

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

export function useRoleAccess() {
  const { user } = useAuth();
  
  // Map user roles to UserRole type
  const userRoles: UserRole[] = user?.roles?.map((r: string) => r.toLowerCase() as UserRole) || [];
  const primaryRole: UserRole = (userRoles[0] || 'viewer') as UserRole;
  
  const currentUser = user ? {
    id: user.id,
    name: user.name,
    email: user.email,
    role: primaryRole,
    roles: userRoles,
  } : null;

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!currentUser || !currentUser.role) return false;

      // Check if user has any role with this permission
      const roles = currentUser.roles || [currentUser.role];
      return roles.some((role) => RolePermissions[role]?.includes(permission));
    },
    [currentUser]
  );

  const hasRole = useCallback(
    (role: UserRole | UserRole[]): boolean => {
      if (!currentUser || !currentUser.role) return false;

      const roles = Array.isArray(role) ? role : [role];
      const userRoles = currentUser.roles || [currentUser.role];

      // Check if any user role meets the requirement
      return roles.some((r) => userRoles.includes(r));
    },
    [currentUser]
  );

  const canPerformAction = useCallback(
    (permission: string): boolean => {
      return hasPermission(permission);
    },
    [hasPermission]
  );

  const getHighestRole = useCallback((): UserRole => {
    if (!currentUser || !currentUser.roles) return currentUser?.role || 'viewer';

    let highest: UserRole = 'viewer';
    let highestLevel = RoleHierarchy[highest];

    for (const role of currentUser.roles) {
      const level = RoleHierarchy[role];
      if (level > highestLevel) {
        highestLevel = level;
        highest = role;
      }
    }

    return highest;
  }, [currentUser]);

  return {
    currentUser,
    hasPermission,
    hasRole,
    canPerformAction,
    getHighestRole,
    isAdmin: currentUser?.role === 'admin' || currentUser?.roles?.includes('admin'),
    isManager: ['admin', 'manager'].includes(currentUser?.role || '') || currentUser?.roles?.some((r) => ['admin', 'manager'].includes(r)),
    isStaff: ['admin', 'manager', 'staff'].includes(currentUser?.role || '') || currentUser?.roles?.some((r) => ['admin', 'manager', 'staff'].includes(r)),
    isViewer: true, // All roles can view
  };
}
