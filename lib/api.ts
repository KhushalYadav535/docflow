/**
 * API Service Layer
 * Centralized API client for Document Management System
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiConfig {
  tenantId?: string;
  authToken?: string;
}

class ApiClient {
  getHeaders(config?: ApiConfig): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (config?.tenantId) {
      headers['X-Tenant-ID'] = config.tenantId;
    }

    if (config?.authToken) {
      headers['Authorization'] = `Bearer ${config.authToken}`;
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    config?: ApiConfig
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.getHeaders(config);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Document APIs
  async uploadDocument(
    file: File,
    metadata: {
      name: string;
      folderId?: string;
      documentType: string;
      department: string;
      date: string;
      [key: string]: any;
    },
    config?: ApiConfig,
    onProgress?: (progress: number) => void
  ): Promise<{ documentId: string; checksum: string; duplicate?: boolean }> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metadata', JSON.stringify(metadata));

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          onProgress(percentComplete);
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response from server'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.message || `Upload failed: ${xhr.statusText}`));
          } catch {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      // Start upload - MUST call open() first, then set headers, then send()
      xhr.open('POST', `${API_BASE_URL}/documents/upload`);
      
      // Set headers AFTER open() but BEFORE send()
      if (config?.tenantId) {
        xhr.setRequestHeader('X-Tenant-ID', config.tenantId);
      }
      if (config?.authToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${config.authToken}`);
      }
      
      xhr.send(formData);
    });
  }

  async getDocument(documentId: string, config?: ApiConfig) {
    return this.request(`/documents/${documentId}`, { method: 'GET' }, config);
  }

  async getDocumentFile(documentId: string, versionId?: string, config?: ApiConfig): Promise<Blob> {
    const url = versionId 
      ? `${API_BASE_URL}/documents/${documentId}/versions/${versionId}/file`
      : `${API_BASE_URL}/documents/${documentId}/file`;

    const headers: HeadersInit = {};
    if (config?.tenantId) headers['X-Tenant-ID'] = config.tenantId;
    if (config?.authToken) headers['Authorization'] = `Bearer ${config.authToken}`;

    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error('Failed to fetch document file');
    return await response.blob();
  }

  async searchDocuments(
    query: string,
    filters?: {
      dateFrom?: string;
      dateTo?: string;
      documentType?: string;
      department?: string;
      uploadedBy?: string;
      folderId?: string;
      status?: string;
      naturalLanguage?: boolean;
    },
    config?: ApiConfig
  ) {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    return this.request(`/documents/search?${params}`, { method: 'GET' }, config);
  }

  async moveDocument(documentId: string, targetFolderId: string, config?: ApiConfig) {
    return this.request(
      `/documents/${documentId}/move`,
      {
        method: 'PATCH',
        body: JSON.stringify({ folderId: targetFolderId }),
      },
      config
    );
  }

  async getDocumentVersions(documentId: string, config?: ApiConfig) {
    return this.request(`/documents/${documentId}/versions`, { method: 'GET' }, config);
  }

  async uploadNewVersion(
    documentId: string,
    file: File,
    changeNote: string,
    config?: ApiConfig
  ) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('changeNote', changeNote);

    const headers: HeadersInit = {};
    if (config?.tenantId) headers['X-Tenant-ID'] = config.tenantId;
    if (config?.authToken) headers['Authorization'] = `Bearer ${config.authToken}`;

    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/versions`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'Version upload failed');
    }

    return await response.json();
  }

  async restoreVersion(documentId: string, versionId: string, config?: ApiConfig) {
    return this.request(
      `/documents/${documentId}/versions/${versionId}/restore`,
      { method: 'POST' },
      config
    );
  }

  // OCR APIs
  async triggerOCR(documentId: string, config?: ApiConfig) {
    return this.request(`/documents/${documentId}/ocr/trigger`, { method: 'POST' }, config);
  }

  async getOCRStatus(documentId: string, config?: ApiConfig) {
    return this.request(`/documents/${documentId}/ocr/status`, { method: 'GET' }, config);
  }

  // Folder APIs
  async getFolders(config?: ApiConfig) {
    return this.request('/folders', { method: 'GET' }, config);
  }

  async createFolder(name: string, parentId?: string, config?: ApiConfig) {
    return this.request(
      '/folders',
      {
        method: 'POST',
        body: JSON.stringify({ name, parentId }),
      },
      config
    );
  }

  // User & Role APIs
  async getUsers(config?: ApiConfig) {
    return this.request('/admin/users', { method: 'GET' }, config);
  }

  async getAuditLogs(
    filters?: { dateFrom?: string; dateTo?: string; userId?: string; action?: string },
    config?: ApiConfig
  ) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    return this.request(`/admin/audit-logs?${params}`, { method: 'GET' }, config);
  }

  // Dashboard APIs
  async getDashboardStats(config?: ApiConfig) {
    return this.request('/dashboard/stats', { method: 'GET' }, config);
  }

  async getRecentDocuments(limit = 10, config?: ApiConfig) {
    return this.request(`/dashboard/recent?limit=${limit}`, { method: 'GET' }, config);
  }

  async getMostAccessedDocuments(limit = 5, config?: ApiConfig) {
    return this.request(`/dashboard/most-accessed?limit=${limit}`, { method: 'GET' }, config);
  }

  async getActivityFeed(limit = 20, config?: ApiConfig) {
    return this.request(`/dashboard/activity?limit=${limit}`, { method: 'GET' }, config);
  }

  // Workflow APIs
  async submitForApproval(documentId: string, config?: ApiConfig) {
    return this.request(
      `/documents/${documentId}/approval/submit`,
      { method: 'POST' },
      config
    );
  }

  async approveDocument(documentId: string, config?: ApiConfig) {
    return this.request(
      `/documents/${documentId}/approval/approve`,
      { method: 'POST' },
      config
    );
  }

  async rejectDocument(documentId: string, comment: string, config?: ApiConfig) {
    return this.request(
      `/documents/${documentId}/approval/reject`,
      {
        method: 'POST',
        body: JSON.stringify({ comment }),
      },
      config
    );
  }

  async getPendingApprovals(config?: ApiConfig) {
    return this.request('/documents/pending-approvals', { method: 'GET' }, config);
  }

  // Metadata Fields APIs
  async getMetadataFields(config?: ApiConfig) {
    return this.request('/metadata-fields', { method: 'GET' }, config);
  }

  async createMetadataField(field: any, config?: ApiConfig) {
    return this.request('/metadata-fields', {
      method: 'POST',
      body: JSON.stringify(field),
    }, config);
  }

  async updateMetadataField(id: string, field: any, config?: ApiConfig) {
    return this.request(`/metadata-fields/${id}`, {
      method: 'PUT',
      body: JSON.stringify(field),
    }, config);
  }

  async deleteMetadataField(id: string, config?: ApiConfig) {
    return this.request(`/metadata-fields/${id}`, { method: 'DELETE' }, config);
  }

  // Categories APIs
  async getCategories(config?: ApiConfig) {
    return this.request('/categories', { method: 'GET' }, config);
  }

  async createCategory(category: any, config?: ApiConfig) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    }, config);
  }

  async updateCategory(id: string, category: any, config?: ApiConfig) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    }, config);
  }

  async deleteCategory(id: string, config?: ApiConfig) {
    return this.request(`/categories/${id}`, { method: 'DELETE' }, config);
  }

  // Notifications APIs
  async getNotifications(limit?: number, unreadOnly?: boolean, config?: ApiConfig) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (unreadOnly) params.append('unreadOnly', 'true');
    return this.request(`/notifications?${params.toString()}`, { method: 'GET' }, config);
  }

  async markNotificationRead(id: string, config?: ApiConfig) {
    return this.request(`/notifications/${id}/read`, { method: 'PATCH' }, config);
  }

  async markAllNotificationsRead(config?: ApiConfig) {
    return this.request('/notifications/read-all', { method: 'PATCH' }, config);
  }

  async getUnreadNotificationCount(config?: ApiConfig) {
    return this.request('/notifications/unread-count', { method: 'GET' }, config);
  }

  // Storage APIs
  async getStorageStats(config?: ApiConfig) {
    return this.request('/storage/stats', { method: 'GET' }, config);
  }

  async cleanupStorage(config?: ApiConfig) {
    return this.request('/storage/cleanup', { method: 'POST' }, config);
  }

  // Password Reset
  async requestPasswordReset(email: string, tenantId?: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email, tenantId }),
    }, {});
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }, {});
  }
}

export const apiClient = new ApiClient();

// Helper to get current config from context
export function getApiConfig(): ApiConfig {
  if (typeof window === 'undefined') return {};

  const tenantId = localStorage.getItem('tenantId');
  const authToken = localStorage.getItem('authToken');

  return {
    tenantId: tenantId || undefined,
    authToken: authToken || undefined,
  };
}

// Helper to make authenticated requests easily
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const config = getApiConfig();
  return apiClient.request<T>(endpoint, options, config);
}
