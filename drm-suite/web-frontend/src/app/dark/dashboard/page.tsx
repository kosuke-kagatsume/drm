'use client';

import { useAuth } from '@/contexts/AuthContext';
import SalesDashboard from './sales';
import ManagerDashboard from './manager';
import ExecutiveDashboard from './executive';
import MarketingDashboard from './marketing';
import AccountingDashboard from './accounting';

export default function DarkDashboardPage() {
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
        return '経営者ダッシュボード';
      default:
        return 'ダッシュボード';
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-500 mx-auto"></div>
          <p className="mt-4 text-zinc-500 text-xs tracking-wider">
            LOADING...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <nav className="bg-zinc-950 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-thin text-white tracking-widest">
                {getRoleTitle(user.role)}
              </h1>
              <p className="text-xs text-zinc-500 tracking-wider mt-1">
                {new Date()
                  .toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })
                  .toUpperCase()}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/dashboard"
                className="border border-zinc-800 text-white px-6 py-2 text-xs tracking-wider hover:bg-zinc-900 transition-colors flex items-center"
              >
                COLORFUL MODE
              </a>
              <div className="text-right">
                <p className="text-xs text-zinc-500 tracking-wider">
                  LOGGED IN AS
                </p>
                <p className="font-light text-white">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="border border-zinc-800 hover:bg-zinc-900 px-6 py-2 text-white text-xs tracking-wider transition-colors"
              >
                LOGOUT
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
