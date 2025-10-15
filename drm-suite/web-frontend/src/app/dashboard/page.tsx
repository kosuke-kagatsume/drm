'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';

// 動的インポートで各ダッシュボードを遅延ロード
const SalesDashboard = dynamic(() => import('./sales'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">
          営業ダッシュボードを読み込み中...
        </p>
        <p className="text-gray-400 text-sm mt-2">データを準備しています</p>
      </div>
    </div>
  ),
});

const ManagerDashboard = dynamic(() => import('./manager'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">
          支店長ダッシュボードを読み込み中...
        </p>
        <p className="text-gray-400 text-sm mt-2">データを準備しています</p>
      </div>
    </div>
  ),
});

const ExecutiveDashboard = dynamic(() => import('./executive'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-sky-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">
          経営ダッシュボードを読み込み中...
        </p>
        <p className="text-gray-400 text-sm mt-2">データを準備しています</p>
      </div>
    </div>
  ),
});

const MarketingDashboard = dynamic(() => import('./marketing'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">
          マーケティングダッシュボードを読み込み中...
        </p>
        <p className="text-gray-400 text-sm mt-2">データを準備しています</p>
      </div>
    </div>
  ),
});

const AccountingDashboard = dynamic(() => import('./accounting'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">
          経理ダッシュボードを読み込み中...
        </p>
        <p className="text-gray-400 text-sm mt-2">データを準備しています</p>
      </div>
    </div>
  ),
});

export default function DashboardPage() {
  const { user, isLoading, logout, isSuperAdmin } = useAuth();
  const router = useRouter();

  const getRoleMapping = (role: string) => {
    // Map Japanese role names to dashboard types
    if (role === 'super_admin') return 'executive'; // スーパー管理者は経営者ダッシュボードを表示
    if (role === '経営者') return 'executive';
    if (role === '支店長') return 'manager';
    if (role === '営業担当') return 'sales';
    if (role === '経理担当') return 'accounting';
    if (role === 'マーケティング') return 'marketing';
    if (role === '施工管理') return 'construction';
    if (role === '事務員') return 'office';
    if (role === 'アフター担当') return 'aftercare';
    // Return original if already in English format
    return role;
  };

  useEffect(() => {
    if (user) {
      const roleMapping = getRoleMapping(user.role);
      // Redirect to specific dashboards for new roles
      if (roleMapping === 'construction') {
        router.replace('/dashboard/construction');
      } else if (roleMapping === 'office') {
        router.replace('/dashboard/office');
      } else if (roleMapping === 'aftercare') {
        router.replace('/dashboard/aftercare');
      }
    }
  }, [user, router]);

  const getRoleTitle = (role: string) => {
    if (role === 'super_admin') return 'スーパー管理者ダッシュボード';
    const mappedRole = getRoleMapping(role);
    switch (mappedRole) {
      case 'sales':
        return '営業ダッシュボード';
      case 'manager':
        return '支店長ダッシュボード';
      case 'marketing':
        return 'マーケティングダッシュボード';
      case 'accounting':
        return '経理ダッシュボード';
      case 'executive':
        return '経営ダッシュボード';
      default:
        return 'ダッシュボード';
    }
  };

  const getRoleColor = (role: string) => {
    if (role === 'super_admin') return 'from-red-500 to-orange-500'; // スーパー管理者は赤系
    const mappedRole = getRoleMapping(role);
    switch (mappedRole) {
      case 'sales':
        return 'from-dandori-orange to-dandori-yellow';
      case 'manager':
        return 'from-dandori-blue to-dandori-sky';
      case 'marketing':
        return 'from-dandori-yellow to-green-400';
      case 'accounting':
        return 'from-purple-500 to-dandori-pink';
      case 'executive':
        return 'from-dandori-blue to-dandori-sky';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

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

  // 専用ダッシュボードページがある役職は何も表示せずリダイレクト
  const roleMapping = getRoleMapping(user.role);
  if (
    roleMapping === 'construction' ||
    roleMapping === 'office' ||
    roleMapping === 'aftercare'
  ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dandori-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav
        className={`bg-gradient-to-r ${getRoleColor(user.role)} text-white shadow-lg`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold whitespace-nowrap">
                {getRoleTitle(user.role)}
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
                onClick={() => router.push('/settings/notifications')}
                className="bg-white/20 hover:bg-white/30 px-3 sm:px-4 py-2 rounded transition text-sm sm:text-base whitespace-nowrap border border-white/30"
                title="通知設定"
              >
                <span className="mr-1 sm:mr-2">🔔</span>
                <span className="hidden sm:inline">通知設定</span>
              </button>
              {isSuperAdmin() && (
                <button
                  onClick={() => router.push('/admin')}
                  className="bg-red-500/20 hover:bg-red-500/30 px-3 sm:px-4 py-2 rounded transition text-sm sm:text-base whitespace-nowrap border border-white/30"
                >
                  <span className="mr-1 sm:mr-2">⚡</span>
                  <span>管理コンソール</span>
                </button>
              )}
              {(getRoleMapping(user.role) === 'sales' ||
                getRoleMapping(user.role) === 'manager' ||
                getRoleMapping(user.role) === 'executive') && (
                <button
                  onClick={() => router.push('/estimates/create-v2')}
                  className="bg-white/20 hover:bg-white/30 px-3 sm:px-4 py-2 rounded transition text-sm sm:text-base whitespace-nowrap border border-white/30"
                >
                  <span className="mr-1 sm:mr-2">📝</span>
                  <span>見積作成</span>
                </button>
              )}
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
        {getRoleMapping(user.role) === 'sales' && (
          <SalesDashboard userEmail={user.email} />
        )}
        {getRoleMapping(user.role) === 'manager' && (
          <ManagerDashboard userEmail={user.email} />
        )}
        {getRoleMapping(user.role) === 'executive' && (
          <ExecutiveDashboard userEmail={user.email} />
        )}
        {getRoleMapping(user.role) === 'marketing' && (
          <MarketingDashboard userEmail={user.email} />
        )}
        {getRoleMapping(user.role) === 'accounting' && (
          <AccountingDashboard userEmail={user.email} />
        )}
      </div>
    </div>
  );
}
