'use client';

import React, { useState } from 'react';
import { ChevronDown, Building2, Check } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';

export function OrganizationSwitcher() {
  const { tenant, tenants, switchTenant, isLoading } = useTenant();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectTenant = async (tenantId: string) => {
    await switchTenant(tenantId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-sidebar-border bg-sidebar-accent/50 hover:bg-sidebar-accent text-sidebar-foreground text-sm font-medium transition-colors disabled:opacity-50"
      >
        <Building2 className="w-4 h-4" />
        <span className="max-w-[120px] truncate">{tenant?.name}</span>
        <ChevronDown className="w-4 h-4 ml-auto" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-sidebar rounded-lg border border-sidebar-border shadow-lg z-50">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wide">
              Organizations
            </div>
            {tenants.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectTenant(t.id)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-sidebar-foreground hover:bg-sidebar-accent/30 transition-colors text-left"
              >
                {t.id === tenant?.id ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <div className="w-4 h-4" />
                )}
                <span className="flex-1">{t.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
