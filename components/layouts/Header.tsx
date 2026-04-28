'use client';

import { Bell, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function Header() {
  const { user, logout } = useAuth();
  const { getHighestRole } = useRoleAccess();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const data = await apiRequest<{ count: number }>('/notifications/unread-count', { method: 'GET' });
      setUnreadCount(data.count || 0);
    } catch (error) {
      // Silently fail - notifications are optional
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await apiRequest<any[]>('/notifications?limit=10&unreadOnly=true', { method: 'GET' });
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiRequest('/notifications/read-all', { method: 'PATCH' });
      setUnreadCount(0);
      setNotifications([]);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const userName = user?.name || 'User';
  const userRole = getHighestRole() || 'Viewer';
  const userEmail = user?.email || '';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl dark:border-white/10 dark:bg-black/25">
      <div className="flex h-18 items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex-1" />

        <div className="flex items-center gap-2 md:gap-4">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative h-11 w-11 rounded-full border border-border/60 bg-card/70 text-foreground hover:bg-accent/40 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                onClick={handleNotificationClick}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 inline-flex h-2 w-2 rounded-full bg-destructive" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 border-border/60 bg-popover/95 text-popover-foreground backdrop-blur-xl dark:border-white/10 dark:bg-[#111118]/95 dark:text-white">
              <div className="flex items-center justify-between border-b border-border/60 p-3 dark:border-white/10">
                <DropdownMenuLabel className="text-foreground dark:text-white">Notifications</DropdownMenuLabel>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllRead}
                    className="text-xs text-primary hover:bg-primary/10 hover:text-primary/80"
                  >
                    Mark all read
                  </Button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground dark:text-white/48">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <DropdownMenuItem
                      key={notif.id}
                      className="cursor-pointer p-3 text-foreground hover:bg-accent/40 dark:text-white dark:hover:bg-white/6"
                      onClick={() => {
                        if (notif.link) {
                          router.push(notif.link);
                        }
                        if (!notif.is_read) {
                          apiRequest(`/notifications/${notif.id}/read`, { method: 'PATCH' }).then(() => {
                            fetchUnreadCount();
                            fetchNotifications();
                          });
                        }
                      }}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{notif.message}</p>
                        <p className="mt-1 text-xs text-muted-foreground dark:text-white/45">
                          {new Date(notif.created_at).toLocaleString()}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-11 rounded-full border border-border/60 bg-card/70 px-2.5 text-foreground hover:bg-accent/40 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10">
                <div className="hidden text-xs md:flex md:flex-col md:items-end">
                  <div className="font-semibold text-foreground dark:text-white">{userName}</div>
                  <div className="capitalize text-muted-foreground dark:text-white/48">{userRole}</div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/18">
                  <User className="h-4 w-4 text-primary" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-border/60 bg-popover/95 backdrop-blur-xl dark:border-white/10 dark:bg-[#111118]/95">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-foreground dark:text-white">{userName}</p>
                  <p className="text-xs text-muted-foreground dark:text-white/48">{userEmail}</p>
                  <p className="text-xs capitalize text-muted-foreground dark:text-white/48">{userRole}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/70 dark:bg-white/10" />
              <DropdownMenuItem 
                className="cursor-pointer text-foreground hover:bg-accent/40 dark:text-white dark:hover:bg-white/6"
                onClick={() => router.push('/profile')}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer text-foreground hover:bg-accent/40 dark:text-white dark:hover:bg-white/6"
                onClick={() => router.push('/admin/settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/70 dark:bg-white/10" />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive hover:bg-destructive/10"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
