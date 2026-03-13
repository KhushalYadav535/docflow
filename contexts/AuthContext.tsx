'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, getApiConfig } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  tenantId: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, organizationName: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const inactivityTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  const logout = () => {
    setUser(null);
    setToken(null);
    setTenantId(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tenantId');
    localStorage.removeItem('isAuthenticated');
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    router.push('/login');
  };

  // Track user activity
  const resetInactivityTimer = React.useCallback(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    if (token && user) {
      inactivityTimeoutRef.current = setTimeout(() => {
        // Session expired due to inactivity
        logout();
        if (typeof window !== 'undefined') {
          alert('Your session has expired due to inactivity. Please log in again.');
        }
      }, INACTIVITY_TIMEOUT);
    }
  }, [token, user]);

  // Set up activity listeners
  useEffect(() => {
    if (!token || !user) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true);
    });

    resetInactivityTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer, true);
      });
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [token, user, resetInactivityTimer]);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    const storedTenantId = localStorage.getItem('tenantId');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setTenantId(storedTenantId);
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('tenantId');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }, {});

      const { user: userData, token: authToken, tenantId: userTenantId } = response as any;

      setUser(userData);
      setToken(authToken);
      setTenantId(userTenantId);

      // Store in localStorage
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('tenantId', userTenantId);
      localStorage.setItem('isAuthenticated', 'true');

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login failed', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string, organizationName: string) => {
    try {
      const response = await apiClient.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, organizationName }),
      }, {});

      const { user: userData, token: authToken, tenantId: userTenantId, tenant } = response as any;

      setUser(userData);
      setToken(authToken);
      setTenantId(userTenantId);

      // Store in localStorage
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('tenantId', userTenantId);
      localStorage.setItem('isAuthenticated', 'true');

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Registration failed', error);
      throw new Error(error.message || 'Registration failed');
    }
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        tenantId,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
