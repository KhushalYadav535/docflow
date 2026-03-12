'use client';

import React, { createContext, useContext, ReactNode } from 'react';

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
  tenants: Tenant[];
  isLoading: boolean;
  switchTenant: (tenantId: string) => Promise<void>;
  currentTenantId: string | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  // Mock tenant data - replace with actual API call in production
  const mockTenant: Tenant = {
    id: 'tenant-001',
    name: 'Acme Corporation',
    slug: 'acme',
    logoUrl: '/logos/acme.png',
    primaryColor: '#6B3FBF', // Purple
    secondaryColor: '#1A1A2E', // Dark
    createdAt: new Date().toISOString(),
  };

  const mockTenants: Tenant[] = [
    mockTenant,
    {
      id: 'tenant-002',
      name: 'Tech Innovations Inc',
      slug: 'techinnovations',
      logoUrl: '/logos/techinnovations.png',
      createdAt: new Date().toISOString(),
    },
  ];

  const [currentTenant, setCurrentTenant] = React.useState<Tenant | null>(mockTenant);
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentTenantId, setCurrentTenantId] = React.useState<string | null>(mockTenant.id);

  const switchTenant = async (tenantId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const tenant = mockTenants.find((t) => t.id === tenantId);
      if (tenant) {
        setCurrentTenant(tenant);
        setCurrentTenantId(tenant.id);
        // In production: update session/cookies with tenant ID
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TenantContext.Provider
      value={{
        tenant: currentTenant,
        tenants: mockTenants,
        isLoading,
        switchTenant,
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
