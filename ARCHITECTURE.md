# DocFlow System Architecture

## High-Level System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DOCFLOW SYSTEM                              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       FRONTEND (This Delivery)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Next.js 16 Frontend                       │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │                                                              │  │
│  │  Pages (14)               Components (20+)                  │  │
│  │  ├─ Landing              ├─ Layouts                         │  │
│  │  ├─ Auth (Login/Register) ├─ Dashboard                     │  │
│  │  ├─ Dashboard            ├─ Documents                       │  │
│  │  ├─ Documents            ├─ Admin Controls                  │  │
│  │  ├─ Folders              └─ UI Components                   │  │
│  │  ├─ Viewer               (50+ from shadcn/ui)              │  │
│  │  └─ Admin Pages                                            │  │
│  │                                                              │  │
│  │  Contexts & Hooks                                           │  │
│  │  ├─ TenantContext (Multi-tenant state)                      │  │
│  │  ├─ useRoleAccess (RBAC system)                             │  │
│  │  └─ Other hooks                                            │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                 ▲                                  │
│                                 │ API Calls                        │
│                                 │ (X-Tenant-ID Header)             │
│                                 ▼                                  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                  BACKEND APIs (To Be Built)                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Authentication          Documents             Admin                │
│  ├─ POST /login         ├─ GET /documents      ├─ GET /users       │
│  ├─ POST /register      ├─ POST /documents     ├─ POST /users      │
│  ├─ POST /forgot-pwd    ├─ GET /documents/:id  ├─ GET /roles       │
│  └─ POST /reset-pwd     ├─ DELETE /documents   ├─ POST /roles      │
│                         ├─ GET /search        └─ GET /audit-logs   │
│  Tenants                ├─ GET /versions       Files               │
│  ├─ GET /tenants        └─ GET /folders        ├─ Upload           │
│  ├─ POST /tenants                              ├─ Download         │
│  └─ PUT /tenants/:id    OCR                    └─ Delete           │
│                         ├─ Process OCR                             │
│                         └─ Store text index                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       DATABASE (PostgreSQL)                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Multi-Tenant Tables (all with tenant_id):                         │
│  ├─ tenants              ├─ documents           ├─ audit_logs       │
│  ├─ users                ├─ document_versions   ├─ notifications    │
│  ├─ roles                ├─ folders             └─ search_index     │
│  ├─ permissions          ├─ metadata_fields                        │
│  └─ user_roles           └─ metadata_values                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  File Storage              Email Service         OCR Engine         │
│  (AWS S3/GCS/Azure)        (SendGrid/Mailgun)    (Tesseract/Vision) │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Layer Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  Pages (14 Route Pages)                                         │
│  ├─ /                          ├─ /dashboard                    │
│  ├─ /login                     ├─ /documents                    │
│  ├─ /register                  ├─ /documents/upload             │
│  ├─ /forgot-password           ├─ /documents/[id]               │
│  ├─ /folders                   ├─ /admin/users                  │
│  ├─ /admin/roles               ├─ /admin/audit-logs             │
│  └─ /admin/settings                                             │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────────┐
│                   COMPONENT LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  Smart Components (Container)    Dumb Components (UI)           │
│  ├─ DashboardPage               ├─ StatsCard                    │
│  ├─ DocumentPage                ├─ DocumentViewer               │
│  ├─ AdminPage                   ├─ DocumentUpload               │
│  └─ SearchPage                  ├─ DocumentSearch               │
│                                 ├─ RoleManager                  │
│                                 └─ AuditTable                   │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│  Hooks                         Contexts                         │
│  ├─ useRoleAccess()           ├─ TenantContext                 │
│  ├─ useMobile()               ├─ AuthContext (ready)           │
│  ├─ useToast()                └─ UserContext (ready)           │
│  └─ useLocalStorage()                                          │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  API Calls (to be implemented)                                  │
│  ├─ /api/auth/login            ├─ /api/documents                │
│  ├─ /api/auth/register         ├─ /api/documents/:id            │
│  ├─ /api/tenants               ├─ /api/search                   │
│  ├─ /api/users                 ├─ /api/folders                  │
│  └─ /api/admin/...             └─ /api/audit-logs               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Multi-Tenant Data Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                          USER LOGIN                                │
└────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Authentication API   │
                    │  POST /auth/login     │
                    │  (email, password)    │
                    └───────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │ Validate credentials  │
                    │ Get user record       │
                    │ Get user's tenant_id  │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Issue JWT Token      │
                    │  Include:             │
                    │  - user_id            │
                    │  - tenant_id          │
                    │  - roles[]            │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ Frontend Receives JWT │
                    │ Stores in session     │
                    └───────────┬───────────┘
                                │
                                ▼
        ┌───────────────────────────────────────────┐
        │      Initialize TenantContext             │
        │  ├─ Extract tenant_id from JWT            │
        │  ├─ Load tenant details                   │
        │  ├─ Set current organization              │
        │  └─ Propagate to entire app               │
        └───────────────┬───────────────────────────┘
                        │
        ┌───────────────┴──────────────────┐
        │   Initialize useRoleAccess       │
        │  ├─ Load user roles              │
        │  ├─ Load permissions             │
        │  └─ Check menu visibility        │
        └───────────────┬──────────────────┘
                        │
                        ▼
        ┌──────────────────────────────────┐
        │  Render Dashboard                │
        │  ├─ Menu based on roles          │
        │  ├─ Components based on perms     │
        │  └─ Tenant-specific data         │
        └──────────────────────────────────┘
```

---

## API Request Flow with Multi-Tenant

```
Frontend Component
  │
  ├─ useRoleAccess() ─────────┐
  │                           │
  ├─ useTenant() ─────────────┐
  │                           │
  └─ API Call                 │
      │                       │
      ├─ Header:              │
      │  X-Tenant-ID: {id} ◄──┤────── From useTenant()
      │  Authorization: Bearer {JWT} (contains tenant_id)
      │  Content-Type: application/json
      │
      ├─ Body: {...data...}
      │
      └─ POST /api/documents
          │
          ▼
      Backend Middleware
          │
          ├─ Extract X-Tenant-ID header
          ├─ Extract tenant_id from JWT token
          ├─ VALIDATE: header === token tenant_id
          │     └─ If mismatch → 403 Forbidden
          │
          └─ Pass tenant_id to handler
              │
              ▼
          Database Query
              │
              ├─ WHERE tenant_id = {id}
              ├─ AND user_id = {id}
              └─ AND {other filters}
                  │
                  ▼
          Return Results
              │
              └─ Only documents from this tenant
                 Only visible to this user
                 Complete data isolation
```

---

## Role-Based Access Control (RBAC) Flow

```
┌──────────────────────────────────────────────────────┐
│           User Role & Permissions                    │
└──────────────────────────────────────────────────────┘
                        │
            ┌───────────┼───────────┐
            │           │           │
            ▼           ▼           ▼
        ┌─────────┐ ┌────────┐ ┌─────────┐
        │  Admin  │ │Manager │ │  Staff  │
        └────┬────┘ └───┬────┘ └────┬────┘
             │          │           │
             ▼          ▼           ▼
        All actions   Document    Upload &
        All viewing   Approval    View
        User Mgmt     View Audit  Search
        Role Mgmt     Create Folders
        Settings      Edit Metadata
             │          │           │
             └─────────┬┴───────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │ useRoleAccess()      │
            │                      │
            │ hasPermission(x) {   │
            │  check user roles    │
            │  check permission    │
            │  return boolean      │
            │ }                    │
            └──────────┬───────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
   UI Rendering              API Calls
   ┌──────────────────┐     ┌──────────────────┐
   │ Show/Hide Items  │     │ Include Auth      │
   │ Enable/Disable   │     │ Check Backend     │
   │ Conditional      │     │ Return 403 if    │
   │ Render           │     │ user lacks perm  │
   └──────────────────┘     └──────────────────┘
```

---

## Component Hierarchy

```
┌─ App (Root)
│
├─ Layout.tsx
│  ├─ Header
│  │  ├─ OrganizationSwitcher (useTenant)
│  │  ├─ Search
│  │  ├─ Notifications
│  │  └─ UserMenu
│  │
│  ├─ Sidebar (useRoleAccess)
│  │  ├─ Logo
│  │  ├─ MenuItem[] (filtered by role)
│  │  │  ├─ Dashboard
│  │  │  ├─ Documents
│  │  │  ├─ Folders (admin/manager only)
│  │  │  └─ Admin (admin only)
│  │  └─ Logout
│  │
│  └─ Page.tsx (Dynamic)
│     │
│     ├─ (if Dashboard)
│     │  ├─ StatsCard[]
│     │  ├─ RecentDocuments
│     │  └─ ActivityFeed
│     │
│     ├─ (if Documents)
│     │  ├─ DocumentSearch (useRoleAccess)
│     │  └─ DocumentTable[]
│     │
│     ├─ (if DocumentViewer)
│     │  ├─ DocumentViewer
│     │  │  ├─ ViewerToolbar
│     │  │  ├─ DocumentCanvas
│     │  │  ├─ MetadataPanel
│     │  │  └─ VersionHistory
│     │  └─ Sidebar
│     │
│     └─ (if Admin)
│        ├─ UserTable (admin only)
│        ├─ RoleManager (admin only)
│        ├─ AuditTable
│        └─ Settings
```

---

## State Management Pattern

```
┌─────────────────────────────────────────────────┐
│         Global State (Context)                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  TenantContext                                  │
│  ├─ tenant (current organization)              │
│  ├─ tenants (list)                             │
│  ├─ currentTenantId                            │
│  └─ switchTenant()                             │
│                                                 │
│  (Ready for backend):                          │
│  ├─ AuthContext (user, login, logout)         │
│  ├─ NotificationContext (toast messages)      │
│  └─ PreferencesContext (user settings)        │
│                                                 │
└─────────────────────────────────────────────────┘
                        ▲
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────┴──────┐ ┌─────┴───────┐ ┌────┴──────┐
│ Hook-Level   │ │ Component   │ │ Server    │
│ State        │ │ State       │ │ State     │
├──────────────┤ ├─────────────┤ ├───────────┤
│useRoleAccess │ │useState()   │ │ useEffect │
│useToast()    │ │useReducer() │ │ fetch()   │
│useMobile()   │ │useCallback()│ │ API       │
└──────────────┘ └─────────────┘ └───────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────┐
│         FRONTEND SECURITY MEASURES              │
├─────────────────────────────────────────────────┤
│                                                 │
│  Input Validation                              │
│  ├─ Form validation                            │
│  ├─ Type checking (TypeScript)                │
│  └─ React auto-escaping (XSS prevention)      │
│                                                 │
│  Session Management                            │
│  ├─ JWT tokens                                 │
│  ├─ HttpOnly cookies                           │
│  └─ Automatic token refresh                    │
│                                                 │
│  Authorization                                 │
│  ├─ useRoleAccess() checks                     │
│  ├─ UI elements hidden if no permission       │
│  ├─ API calls include authorization            │
│  └─ Backend validates permissions              │
│                                                 │
│  Data Protection                               │
│  ├─ Tenant data isolation                      │
│  ├─ X-Tenant-ID header validation              │
│  ├─ HTTPS in production                        │
│  └─ No sensitive data in localStorage          │
│                                                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│         BACKEND SECURITY MEASURES               │
├─────────────────────────────────────────────────┤
│                                                 │
│  Authentication                                │
│  ├─ Password hashing (bcrypt)                  │
│  ├─ JWT token generation                       │
│  └─ Rate limiting on login                     │
│                                                 │
│  Authorization                                 │
│  ├─ Middleware validation                      │
│  ├─ Role-based checks                          │
│  ├─ Permission enforcement                     │
│  └─ Tenant isolation validation                │
│                                                 │
│  Data Security                                 │
│  ├─ Encryption at rest (AES-256)               │
│  ├─ Encryption in transit (HTTPS/TLS)         │
│  ├─ Database access controls                   │
│  └─ Audit logging (immutable)                  │
│                                                 │
│  API Security                                  │
│  ├─ Input validation/sanitization              │
│  ├─ SQL injection prevention                   │
│  ├─ CORS configuration                         │
│  └─ Rate limiting per tenant                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌──────────────────────────────────────────────────┐
│          PRODUCTION DEPLOYMENT                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  Frontend (Next.js)                            │
│  ├─ Vercel (recommended)                        │
│  ├─ AWS Amplify                                 │
│  ├─ Docker Container                           │
│  └─ Kubernetes Pod                             │
│                                                  │
│  Backend API                                    │
│  ├─ Node.js Server                              │
│  ├─ Docker Container                            │
│  ├─ Kubernetes Service                         │
│  └─ Load Balancer                              │
│                                                  │
│  Database                                       │
│  ├─ PostgreSQL (managed)                       │
│  ├─ RDS/Cloud SQL/Cloud Database               │
│  └─ Backup & Replication                       │
│                                                  │
│  File Storage                                   │
│  ├─ AWS S3                                      │
│  ├─ Google Cloud Storage                        │
│  └─ Azure Blob Storage                         │
│                                                  │
│  CDN & Caching                                  │
│  ├─ CloudFlare                                  │
│  ├─ Vercel Edge Network                         │
│  └─ Redis Cache                                 │
│                                                  │
│  Monitoring & Logging                          │
│  ├─ Sentry (error tracking)                     │
│  ├─ CloudWatch/Stackdriver                      │
│  └─ ELK Stack/Datadog                           │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 16
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui (50+)
- **Icons**: lucide-react
- **State**: React Context + Hooks
- **Package Manager**: pnpm

### Backend (To Be Built)
- **Language**: Node.js (TypeScript recommended)
- **Framework**: Express/Fastify/NestJS
- **Database**: PostgreSQL
- **Authentication**: JWT/Sessions
- **File Storage**: AWS S3/GCS/Azure
- **OCR**: Tesseract/Google Vision
- **Email**: SendGrid/Mailgun
- **Cache**: Redis
- **Logging**: Winston/Bunyan

### Infrastructure
- **Hosting**: Vercel/AWS/Azure/GCP
- **Database**: Managed PostgreSQL
- **CDN**: Cloudflare/Vercel Edge
- **Monitoring**: Sentry/Datadog
- **CI/CD**: GitHub Actions/GitLab CI

---

This architecture supports:
- ✅ Multi-tenant isolation
- ✅ Role-based access control
- ✅ Scalability to thousands of users
- ✅ High availability
- ✅ Disaster recovery
- ✅ Security best practices
- ✅ Audit compliance
