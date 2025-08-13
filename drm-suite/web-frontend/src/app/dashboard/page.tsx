'use client';

import { useAuth } from '@/contexts/AuthContext';
import SalesDashboard from './sales';
import ManagerDashboard from './manager';
import ExecutiveDashboard from './executive';
import MarketingDashboard from './marketing';
import AccountingDashboard from './accounting';

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();

  const getRoleMapping = (role: string) => {
    // Map Japanese role names to dashboard types
    if (role === '経営者') return 'executive';
    if (role === '支店長') return 'manager';
    if (role === '営業担当') return 'sales';
    if (role === '経理担当') return 'accounting';
    if (role === 'マーケティング') return 'marketing';
    // Return original if already in English format
    return role;
  };

  const getRoleTitle = (role: string) => {
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
              <a
                href="/dark/dashboard"
                className="bg-black text-white px-3 sm:px-4 py-2 rounded hover:bg-zinc-900 transition flex items-center text-sm sm:text-base whitespace-nowrap"
              >
                <span className="mr-1 sm:mr-2">🌙</span>
                <span className="hidden md:inline">ダークモード</span>
                <span className="md:hidden">ダーク</span>
              </a>
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
