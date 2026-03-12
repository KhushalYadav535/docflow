# Multi-Tenant System Implementation Guide

## System Architecture Overview

The Document Management System is now designed as a **multi-tenant SaaS platform** where each organization (tenant) has isolated data, users, and configurations.

---

## Multi-Tenant Components Implemented

### 1. Tenant Context (`contexts/TenantContext.tsx`)
✅ Provides tenant information to entire application
- Tenant ID, name, slug, logo, colors
- Tenant switching capability
- Organization context propagation

**Usage:**
```tsx
const { tenant, tenants, switchTenant } = useTenant();
```

### 2. Organization Switcher (`components/layouts/OrganizationSwitcher.tsx`)
✅ Displays current organization in header
- Dropdown to switch between organizations user has access to
- Shows organization name and logo
- Mobile responsive

### 3. Role-Based Access Control (`hooks/useRoleAccess.ts`)
✅ Enforces permissions across the application
- 4 roles: Admin, Manager, Staff, Viewer
- Hierarchical role system
- Permission-based action validation

**Usage:**
```tsx
const { hasPermission, hasRole, isAdmin } = useRoleAccess();

if (hasPermission('upload_document')) {
  // Show upload button
}

if (hasRole(['admin', 'manager'])) {
  // Show admin controls
}
```

### 4. Updated Sidebar (`components/layouts/Sidebar.tsx`)
✅ Role-based menu visibility
- Menu items shown/hidden based on user role
- Dynamic admin section
- Permission-enforced navigation

### 5. Header Organization Display (`components/layouts/Header.tsx`)
✅ Organization context in header
- Organization switcher visible to all users
- Tenant-aware operations

---

## New Pages & Features Added

### Document Viewer (`components/features/documents/DocumentViewer.tsx`)
✅ Complete document viewing interface
- **Features:**
  - Zoom in/out (25% - 400%)
  - Page navigation
  - Rotate 90 degrees
  - Version history panel
  - Metadata display
  - Download, print buttons
  - Upload new version (role-based)

**Implementation Location:**
- Component: `components/features/documents/DocumentViewer.tsx`
- Page: `app/(app)/documents/[id]/page.tsx`
- Example: `/documents/doc-001`

### Advanced Search (`components/features/documents/AdvancedSearch.tsx`)
✅ Full-featured search interface
- **Filters:**
  - Keyword search
  - Date range (from/to)
  - Document type
  - Department
  - Uploaded by
  - Status
  - Folder path
- Real-time filter application
- Results count and timing display

**Implementation Location:**
- Component: `components/features/documents/AdvancedSearch.tsx`
- Can be integrated into search/documents pages

### Role Management Page (`app/(app)/admin/roles/page.tsx`)
✅ Complete role administration
- **Features:**
  - View all roles and permissions
  - Create/edit roles
  - Permission matrix view
  - User count per role
  - Delete role (if no users assigned)

**Access:** Admin only → `/admin/roles`

---

## Multi-Tenant Data Model

### Required Database Schema

```sql
-- Core Tenant Table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Users (Tenant-scoped)
ALTER TABLE users ADD COLUMN tenant_id UUID NOT NULL REFERENCES tenants(id);
CREATE INDEX idx_users_tenant ON users(tenant_id);

-- Documents (Tenant-scoped)
ALTER TABLE documents ADD COLUMN tenant_id UUID NOT NULL REFERENCES tenants(id);
CREATE INDEX idx_documents_tenant ON documents(tenant_id);

-- Folders (Tenant-scoped)
ALTER TABLE folders ADD COLUMN tenant_id UUID NOT NULL REFERENCES tenants(id);
CREATE INDEX idx_folders_tenant ON folders(tenant_id);

-- Audit Logs (Tenant-scoped)
ALTER TABLE audit_logs ADD COLUMN tenant_id UUID NOT NULL REFERENCES tenants(id);
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);

-- All queries MUST filter by tenant_id
SELECT * FROM documents WHERE tenant_id = $1 AND user_id = $2;
```

---

## API Integration Points

### Headers Required for All API Calls

```typescript
// Client-side request example
const headers = {
  'Content-Type': 'application/json',
  'X-Tenant-ID': tenantId, // From TenantContext
  'Authorization': `Bearer ${authToken}`,
};

fetch('/api/documents', {
  method: 'GET',
  headers,
});
```

### Backend API Response Pattern

```typescript
// All responses should include tenant context
interface ApiResponse {
  success: boolean;
  data: any;
  tenantId: string; // Confirm tenant isolation
  timestamp: string;
}

// All queries must be scoped
async function getDocuments(tenantId: string, userId: string) {
  // Validate tenant access in middleware
  return db.query(
    'SELECT * FROM documents WHERE tenant_id = $1 AND created_by = $2',
    [tenantId, userId]
  );
}
```

---

## Frontend Implementation Checklist

### ✅ Completed Components

- [x] Tenant context provider setup
- [x] Organization switcher component
- [x] Role-based access control hook
- [x] Updated sidebar with role-based menu
- [x] Document viewer component (full-featured)
- [x] Advanced search component
- [x] Role management page
- [x] Header with organization display

### ⚠️ Needs Backend Integration

- [ ] API calls to fetch tenant data
- [ ] API calls to fetch user documents filtered by tenant
- [ ] API calls to switch tenants
- [ ] Tenant ID propagation in all API requests
- [ ] Backend validation of tenant access
- [ ] Audit log capture with tenant context

### 📋 TODO: Advanced Features (Phase 2)

- [ ] Tenant settings page (branding, logo upload, color customization)
- [ ] Tenant analytics dashboard
- [ ] Multi-tenant billing integration
- [ ] Tenant invitation system for team members
- [ ] Tenant activity audit dashboard
- [ ] Custom domain per tenant support
- [ ] SSO (Single Sign-On) per tenant

---

## How Multi-Tenancy Works

### User Login Flow
1. User logs in with email/password
2. System authenticates user
3. User's `tenant_id` stored in session/JWT
4. TenantContext initialized with user's current tenant
5. All API requests include `X-Tenant-ID` header

### Data Isolation
1. All tables have `tenant_id` column
2. All queries filtered by `tenant_id`
3. Backend middleware validates `X-Tenant-ID` matches session
4. API returns 403 Forbidden for cross-tenant access attempts

### Switching Organizations
1. User clicks organization in header switcher
2. `switchTenant()` called from TenantContext
3. Session tenant_id updated
4. All subsequent requests use new tenant_id
5. Page automatically re-renders with new tenant's data

---

## Role Permissions Reference

### Admin
- ✅ All permissions
- View: All documents, users, audit logs
- Actions: Upload, delete, manage users, manage roles, settings

### Manager
- ✅ Upload, view, download documents
- ✅ Create/rename folders
- ✅ Approve/reject documents
- ✅ View audit logs (no export)
- ❌ Manage users, roles, settings

### Staff
- ✅ Upload, view, download documents
- ✅ Upload new versions
- ✅ Submit for approval
- ❌ Delete, approve, manage users, view audit logs

### Viewer
- ✅ View, download documents only
- ❌ Upload, delete, edit, approve

---

## Integration Steps for Backend Team

1. **Create Tenant Table**
   ```sql
   CREATE TABLE tenants (...);
   ```

2. **Add tenant_id to Existing Tables**
   ```sql
   ALTER TABLE users ADD COLUMN tenant_id UUID;
   ALTER TABLE documents ADD COLUMN tenant_id UUID;
   -- etc for all tables
   ```

3. **Add Middleware for Tenant Validation**
   ```typescript
   middleware.ts - Validate X-Tenant-ID header matches session
   ```

4. **Update All API Endpoints**
   ```typescript
   // Extract tenant from header
   const tenantId = req.headers['x-tenant-id'];
   
   // Validate user has access to tenant
   const user = await getUser(userId);
   if (user.tenant_id !== tenantId) {
     return res.status(403).json({ error: 'Forbidden' });
   }
   
   // Filter all queries by tenant
   const data = await db.query(
     'SELECT * FROM documents WHERE tenant_id = $1',
     [tenantId]
   );
   ```

5. **Test Cross-Tenant Access Prevention**
   - Ensure user from Tenant A cannot access Tenant B's data
   - Ensure API returns 403 for unauthorized tenant access

---

## Security Considerations

### Data Isolation
- ✅ All queries filtered by tenant_id
- ✅ Frontend validates permissions (UX)
- ✅ Backend MUST validate tenant access (security)
- ✅ Audit logs track all cross-tenant access attempts

### Session Management
- Tenant ID stored in JWT or session cookie
- X-Tenant-ID header validated on every request
- Session invalidation clears tenant context
- Logout clears all tenant data

### API Security
- All endpoints require authentication
- All endpoints validate tenant access
- Rate limiting per tenant
- Input validation on all fields
- SQL injection prevention via parameterized queries

---

## Deployment Considerations

### Environment Configuration
```env
# Frontend
NEXT_PUBLIC_API_URL=https://api.docflow.com
NEXT_PUBLIC_ENABLE_MULTI_TENANT=true

# Backend
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=secure_random_key_32_chars_min
TENANT_ISOLATION_ENFORCED=true
```

### Database Backups
- Separate backup strategy per tenant (optional)
- Document storage per tenant isolation
- Audit log retention per tenant

### Monitoring
- Log all tenant switches
- Monitor cross-tenant access attempts
- Alert on unusual activity patterns

---

## Testing Checklist

- [ ] Create 2+ test tenants
- [ ] Create users in each tenant with different roles
- [ ] Verify users cannot access other tenant's documents
- [ ] Verify UI shows/hides features based on role
- [ ] Verify organization switcher works
- [ ] Verify document viewer features work
- [ ] Verify search filters work correctly
- [ ] Verify audit logs capture tenant context
- [ ] Verify API returns 403 for unauthorized access
- [ ] Test tenant data isolation under load

---

**Status**: Phase 1B Enhancement Complete
**Next Phase**: Backend Integration & Testing
**Estimated Backend Work**: 20-30 hours
