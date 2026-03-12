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
  Clock
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRoleAccess } from '@/hooks/useRoleAccess';

interface SidebarProps {
  onLogout?: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const { hasRole, hasPermission } = useRoleAccess();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', badge: null, show: true },
    { icon: Files, label: 'Documents', href: '/documents', badge: null, show: true },
    { icon: Folder, label: 'Folders', href: '/folders', badge: null, show: hasRole(['admin', 'manager']) },
    { icon: FileText, label: 'Version History', href: '/documents/versions', badge: null, show: true },
  ];

  const adminItems = [
    { icon: Users, label: 'Users', href: '/admin/users', badge: null, show: hasRole('admin') },
    { icon: Shield, label: 'Roles', href: '/admin/roles', badge: null, show: hasRole('admin') },
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
      <div className="sticky top-0 z-50 flex items-center justify-between bg-sidebar border-b border-sidebar-border px-4 py-3 md:hidden">
        <div className="text-sm font-semibold text-sidebar-foreground">DocFlow</div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="text-sidebar-foreground"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`${
        isOpen ? 'block' : 'hidden'
      } md:block fixed md:static left-0 top-0 z-40 h-full w-64 bg-sidebar border-r border-sidebar-border overflow-y-auto md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform pt-0 md:pt-6`}>
        
        {/* Logo */}
        <div className="hidden md:flex px-6 pb-8">
          <h1 className="text-2xl font-bold text-sidebar-foreground">DocFlow</h1>
        </div>

        {/* Menu Sections */}
        <nav className="space-y-2 px-3 md:px-4">
          {/* Main Menu */}
          <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
              Main
            </div>
            {menuItems.filter(item => item.show).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={active ? 'default' : 'ghost'}
                    className={`w-full justify-start text-sidebar-foreground ${
                      active 
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90' 
                        : 'hover:bg-sidebar-accent'
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
            <div className="space-y-1 pt-4 border-t border-sidebar-border">
              <button
                onClick={() => handleMenuClick('admin')}
                className="w-full px-3 py-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider flex items-center justify-between hover:text-sidebar-foreground transition-colors"
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
                          className={`w-full justify-start text-sidebar-foreground ${
                            active 
                              ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90' 
                              : 'hover:bg-sidebar-accent'
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
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border bg-sidebar">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
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
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
