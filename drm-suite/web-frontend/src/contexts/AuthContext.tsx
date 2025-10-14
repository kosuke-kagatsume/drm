'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, name: string, role: string) => void;
  logout: () => void;
  isSuperAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  isSuperAdmin: () => false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// 認証不要なパス
const publicPaths = [
  '/login',
  '/',
  '/api',
  '/estimates/create-v2',
  '/estimates/editor-v5',
  '/estimates/financial',
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // 認証チェック
    const checkAuth = () => {
      try {
        const email = localStorage.getItem('userEmail');
        const name = localStorage.getItem('userName');
        const role = localStorage.getItem('userRole');

        if (email && role) {
          setUser({ email, name: name || '', role });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [mounted]);

  useEffect(() => {
    if (!mounted || isLoading) return;

    // パスが公開パスでない場合、未ログインならログインページへ
    const isPublicPath = publicPaths.some(
      (path) =>
        pathname === path ||
        pathname.startsWith(path) ||
        pathname.startsWith('/api'),
    );

    if (!isPublicPath && !user) {
      router.push('/login');
    }
  }, [pathname, user, isLoading, mounted, router]);

  const login = (email: string, name: string, role: string) => {
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', name);
    localStorage.setItem('userRole', role);
    setUser({ email, name, role });
  };

  const logout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    setUser(null);
    router.push('/login');
  };

  const isSuperAdmin = () => {
    return user?.role === 'super_admin';
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, isSuperAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}
