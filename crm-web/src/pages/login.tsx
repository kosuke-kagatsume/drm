import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import { mockApi, isMockMode } from '@/lib/mock-api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      // モックモードの場合はモックAPIを使用
      if (isMockMode()) {
        return await mockApi.login(data.email, data.password);
      }
      const response = await api.post('/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Remember Me機能: localStorageに保存期間を設定
      if (rememberMe) {
        localStorage.setItem('auth-remember', 'true');
      } else {
        localStorage.setItem('auth-remember', 'false');
      }

      setAuth(data);
      toast({
        title: 'ログイン成功',
        description: 'ダッシュボードへリダイレクトします',
      });
      navigate('/dashboard');
    },
    onError: () => {
      toast({
        title: 'ログインエラー',
        description: 'メールアドレスまたはパスワードが正しくありません',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-6 md:p-8 shadow">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">CRM System</h2>
          <p className="mt-2 text-sm text-gray-600">ログインしてください</p>
        </div>
        <form className="mt-6 md:mt-8 space-y-5 md:space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                placeholder="admin@crm.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード
              </label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                ログイン状態を保持する
              </label>
            </div>
          </div>
          <Button type="submit" className="w-full h-10 md:h-11" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'ログイン中...' : 'ログイン'}
          </Button>
        </form>

        {/* デモ情報 */}
        <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm">
          <p className="font-medium text-gray-700 mb-2">デモアカウント</p>
          <p className="text-gray-600">Email: admin@crm.com</p>
          <p className="text-gray-600">Password: password123</p>
        </div>
      </div>
    </div>
  );
}
