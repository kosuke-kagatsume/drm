'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SalesDashboard from './sales';
import ManagerDashboard from './manager';
import ExecutiveDashboard from './executive';
import MarketingDashboard from './marketing';
import AccountingDashboard from './accounting';

export default function DashboardPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for login information
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole');
      const email = localStorage.getItem('userEmail');
      const name = localStorage.getItem('userName');

      if (!role || !email) {
        router.push('/login');
      } else {
        setUserRole(role);
        setUserEmail(email);
        setIsLoading(false);
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    router.push('/login');
  };

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

  if (isLoading) {
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
        className={`bg-gradient-to-r ${getRoleColor(userRole)} text-white shadow-lg`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{getRoleTitle(userRole)}</h1>
              <p className="text-sm opacity-90 mt-1">
                {new Date().toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm opacity-90">ログイン中</p>
                <p className="font-medium">{userEmail}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded transition"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {getRoleMapping(userRole) === 'sales' && (
          <SalesDashboard userEmail={userEmail} />
        )}
        {getRoleMapping(userRole) === 'manager' && (
          <ManagerDashboard userEmail={userEmail} />
        )}
        {getRoleMapping(userRole) === 'executive' && (
          <ExecutiveDashboard userEmail={userEmail} />
        )}
        {getRoleMapping(userRole) === 'marketing' && (
          <MarketingDashboard userEmail={userEmail} />
        )}
        {getRoleMapping(userRole) === 'accounting' && (
          <AccountingDashboard userEmail={userEmail} />
        )}
      </div>
    </div>
  );
}
