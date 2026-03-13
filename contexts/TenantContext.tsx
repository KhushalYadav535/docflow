'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '@/lib/api';
import { useAuth } from './AuthContext';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  createdAt: string;
}

export interface TenantContextType {
  tenant: Tenant | null;
  isLoading: boolean;
  currentTenantId: string | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { tenantId } = useAuth();
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(tenantId);

  useEffect(() => {
    setCurrentTenantId(tenantId);
    if (tenantId) {
      fetchTenant(tenantId);
    } else {
      // Try to get from localStorage
      const storedTenantId = localStorage.getItem('tenantId');
      if (storedTenantId) {
        setCurrentTenantId(storedTenantId);
        fetchTenant(storedTenantId);
      } else {
        setIsLoading(false);
      }
    }
  }, [tenantId]);

  const fetchTenant = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await apiRequest<Tenant>(`/tenants/${id}`, { method: 'GET' });
      setCurrentTenant(data);
    } catch (error: any) {
      console.error('Failed to fetch tenant', error);
      // Fallback to default tenant if API fails
      setCurrentTenant({
        id: id,
        name: 'Default Tenant',
        slug: 'default',
        createdAt: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TenantContext.Provider
      value={{
        tenant: currentTenant,
        isLoading,
        currentTenantId,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
}
