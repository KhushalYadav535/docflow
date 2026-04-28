'use client';

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ 
  children
}: AppLayoutProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,191,90,0.12),_transparent_22%),linear-gradient(180deg,rgba(255,250,242,1)_0%,rgba(248,244,237,1)_48%,rgba(243,239,233,1)_100%)] text-foreground dark:bg-[radial-gradient(circle_at_top,_rgba(245,191,90,0.12),_transparent_25%),linear-gradient(180deg,_rgba(10,10,14,1)_0%,_rgba(12,12,18,1)_45%,_rgba(8,8,12,1)_100%)]">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />

      {/* Main Content */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(24,24,28,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,28,0.05)_1px,transparent_1px)] bg-[size:120px_120px] opacity-[0.5] dark:bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] dark:opacity-[0.04]" />
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="relative z-10 flex-1 overflow-auto">
          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
