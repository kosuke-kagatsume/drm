import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId: string;
  companyName: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (data: { user: User; accessToken: string; refreshToken: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (data) =>
        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
        }),
      logout: () => {
        // Clear remember me flag on logout
        localStorage.removeItem('auth-remember');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      getStorage: () => {
        // カスタムストレージ実装
        return {
          getItem: (name: string) => {
            const str = localStorage.getItem(name);
            if (!str) return null;

            // Remember Meがfalseの場合、セッションストレージのように扱う
            const rememberMe = localStorage.getItem('auth-remember') !== 'false';

            if (!rememberMe) {
              // ブラウザを閉じたら認証情報をクリア
              const lastActive = localStorage.getItem('last-active');
              const now = new Date().getTime();
              const hoursSinceActive = lastActive
                ? (now - parseInt(lastActive)) / (1000 * 60 * 60)
                : 0;

              // 12時間以上経過していたらクリア
              if (hoursSinceActive > 12) {
                localStorage.removeItem(name);
                return null;
              }
            }

            // 最終アクティブ時刻を更新
            localStorage.setItem('last-active', new Date().getTime().toString());

            return JSON.parse(str);
          },
          setItem: (name: string, value: any) => {
            localStorage.setItem(name, JSON.stringify(value));
            localStorage.setItem('last-active', new Date().getTime().toString());
          },
          removeItem: (name: string) => {
            localStorage.removeItem(name);
            localStorage.removeItem('last-active');
            localStorage.removeItem('auth-remember');
          },
        };
      },
    },
  ),
);
