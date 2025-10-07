'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AccountingDashboard from '../accounting';

export default function ViewAccountingPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dandori-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 経営者のみアクセス可能
  if (user.role !== '経営者' && user.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 font-bold mb-4">アクセス権限がありません</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-dandori-blue text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold whitespace-nowrap">
                経理ダッシュボード（閲覧モード）
              </h1>
              <p className="text-sm opacity-90 mt-1">
                {new Date().toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-white/20 hover:bg-white/30 px-3 sm:px-4 py-2 rounded transition text-sm sm:text-base whitespace-nowrap border border-white/30"
              >
                <span className="mr-1 sm:mr-2">←</span>
                <span>経営ダッシュボード</span>
              </button>
              <div className="text-right hidden md:block">
                <p className="text-sm opacity-90">ログイン中</p>
                <p className="font-medium text-sm">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="bg-white/20 hover:bg-white/30 px-3 sm:px-4 py-2 rounded transition text-sm sm:text-base whitespace-nowrap"
              >
                <span className="hidden sm:inline">ログアウト</span>
                <span className="sm:hidden">ログアウト</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-full-hd mx-auto px-4 lg:px-6 xl:px-8 2xl:px-12 py-8">
        <AccountingDashboard userEmail={user.email} />
      </div>
    </div>
  );
}
