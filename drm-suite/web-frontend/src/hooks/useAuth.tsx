'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  email: string;
  name: string;
  role: string;
}

export function useAuth(requireAuth: boolean = true) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window === 'undefined') {
      return;
    }

    const checkAuth = () => {
      try {
        const email = localStorage.getItem('userEmail');
        const name = localStorage.getItem('userName');
        const role = localStorage.getItem('userRole');

        if (email && role) {
          setUser({ email, name: name || '', role });
          setIsLoading(false);
        } else if (requireAuth) {
          // 認証が必要なページで未ログインの場合
          router.push('/login');
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (requireAuth) {
          router.push('/login');
        }
      }
    };

    // 少し遅延を入れて、ハイドレーションエラーを防ぐ
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [requireAuth, router]);

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

  return { user, isLoading, login, logout };
}
