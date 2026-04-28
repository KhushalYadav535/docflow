'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Files, 
  Folder, 
  Settings, 
  Users,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Shield,
  FileText,
  Clock,
  FolderTree,
  List,
  HardDrive
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useTenant } from '@/contexts/TenantContext';

interface SidebarProps {
  onLogout?: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const { hasRole, hasPermission } = useRoleAccess();
  const { tenant } = useTenant();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', badge: null, show: true },
    { icon: Files, label: 'Documents', href: '/documents', badge: null, show: true },
    { icon: Folder, label: 'Folders', href: '/folders', badge: null, show: hasRole(['admin', 'manager']) },
    { icon: FileText, label: 'Version History', href: '/documents/versions', badge: null, show: true },
    { icon: Clock, label: 'Pending Approvals', href: '/workflow/pending-approvals', badge: null, show: hasRole(['admin', 'manager']) },
  ];

  const adminItems = [
    { icon: Users, label: 'Users', href: '/admin/users', badge: null, show: hasRole('admin') },
    { icon: Shield, label: 'Roles', href: '/admin/roles', badge: null, show: hasRole('admin') },
    { icon: FolderTree, label: 'Categories', href: '/admin/categories', badge: null, show: hasRole('admin') },
    { icon: List, label: 'Metadata Fields', href: '/admin/metadata', badge: null, show: hasRole('admin') },
    { icon: HardDrive, label: 'Storage', href: '/admin/storage', badge: null, show: hasRole('admin') },
    { icon: Clock, label: 'Audit Logs', href: '/admin/audit-logs', badge: null, show: hasRole(['admin', 'manager']) },
    { icon: Settings, label: 'Settings', href: '/admin/settings', badge: null, show: hasRole('admin') },
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  const handleMenuClick = (label: string) => {
    setExpandedMenu(expandedMenu === label ? null : label);
  };

  return (
    <>
      {/* Mobile Toggle */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-black/35 md:hidden">
        <div className="flex flex-col">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground dark:text-white">DocFlow</div>
          {tenant && <div className="text-xs text-muted-foreground dark:text-white/50">{tenant.name}</div>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="text-foreground hover:bg-accent/50 dark:text-white dark:hover:bg-white/10"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`${
        isOpen ? 'block' : 'hidden'
      } md:block fixed md:static left-0 top-0 z-40 h-full w-72 overflow-y-auto border-r border-border/60 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-black/30 md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform pt-0 md:pt-6`}>
        
        {/* Logo */}
        <div className="hidden px-6 pb-8 md:flex md:flex-col">
          <div className="rounded-[1.6rem] border border-border/70 bg-background/80 p-4 shadow-[0_18px_50px_rgba(15,15,20,0.08)] dark:border-white/10 dark:bg-white/5 dark:shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
            <h1 className="text-xl font-semibold uppercase tracking-[0.18em] text-foreground dark:text-white">DocFlow</h1>
            <p className="mt-1 text-xs text-primary/85">Premium workspace shell</p>
            {tenant && <span className="mt-4 block text-xs font-medium text-muted-foreground dark:text-white/52">{tenant.name}</span>}
          </div>
        </div>

        {/* Menu Sections */}
        <nav className="space-y-4 px-3 pb-24 md:px-4">
          {/* Main Menu */}
          <div className="space-y-1.5">
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground dark:text-white/38">
              Main
            </div>
            {menuItems.filter(item => item.show).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={active ? 'default' : 'ghost'}
                    className={`h-11 w-full justify-start rounded-2xl border text-foreground dark:text-white ${
                      active 
                        ? 'border-primary/25 bg-primary/12 shadow-[0_12px_30px_rgba(245,191,90,0.12)] hover:bg-primary/16 dark:bg-primary/15 dark:text-white dark:hover:bg-primary/18' 
                        : 'border-transparent bg-transparent hover:border-border/60 hover:bg-accent/40 dark:hover:border-white/8 dark:hover:bg-white/6'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    <span className="flex-1 text-left">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Admin Menu */}
          {adminItems.filter(item => item.show).length > 0 && (
            <div className="space-y-1.5 border-t border-border/60 pt-4 dark:border-white/10">
              <button
                onClick={() => handleMenuClick('admin')}
                className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground dark:text-white/38 dark:hover:text-white/70"
              >
                Admin
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${expandedMenu === 'admin' ? 'rotate-180' : ''}`}
                />
              </button>
              {expandedMenu === 'admin' && (
                <div className="space-y-1">
                  {adminItems.filter(item => item.show).map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant={active ? 'default' : 'ghost'}
                          className={`h-11 w-full justify-start rounded-2xl border text-foreground dark:text-white ${
                            active 
                              ? 'border-primary/25 bg-primary/12 shadow-[0_12px_30px_rgba(245,191,90,0.12)] hover:bg-primary/16 dark:bg-primary/15 dark:text-white dark:hover:bg-primary/18' 
                              : 'border-transparent bg-transparent hover:border-border/60 hover:bg-accent/40 dark:hover:border-white/8 dark:hover:bg-white/6'
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <Icon className="h-4 w-4 mr-3" />
                          <span className="flex-1 text-left">{item.label}</span>
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border/60 bg-background/80 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
          <Button
            variant="ghost"
            className="h-11 w-full justify-start rounded-2xl border border-border/60 bg-card/70 text-foreground hover:bg-accent/40 dark:border-white/8 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            onClick={() => {
              setIsOpen(false);
              onLogout?.();
            }}
          >
            <LogOut className="h-4 w-4 mr-3" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm dark:bg-black/60 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
