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

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const role = sessionStorage.getItem('userRole') || 'sales';
    const email = sessionStorage.getItem('userEmail') || '';

    if (!isLoggedIn) {
      router.push('/login');
    } else {
      setUserRole(role);
      setUserEmail(email);
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userRole');
    router.push('/login');
  };

  const getRoleTitle = (role: string) => {
    switch (role) {
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
    switch (role) {
      case 'sales':
        return 'from-blue-600 to-blue-700';
      case 'manager':
        return 'from-green-600 to-green-700';
      case 'marketing':
        return 'from-purple-600 to-purple-700';
      case 'accounting':
        return 'from-orange-600 to-orange-700';
      case 'executive':
        return 'from-gray-800 to-gray-900';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

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
        {userRole === 'sales' && <SalesDashboard userEmail={userEmail} />}
        {userRole === 'manager' && <ManagerDashboard userEmail={userEmail} />}
        {userRole === 'executive' && (
          <ExecutiveDashboard userEmail={userEmail} />
        )}
        {userRole === 'marketing' && (
          <MarketingDashboard userEmail={userEmail} />
        )}
        {userRole === 'accounting' && (
          <AccountingDashboard userEmail={userEmail} />
        )}
      </div>
    </div>
  );
}
