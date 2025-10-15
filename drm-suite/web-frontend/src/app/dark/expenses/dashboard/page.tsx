'use client';

import dynamic from 'next/dynamic';

// 経費ダッシュボードの全機能を動的インポート
const DarkExpensesDashboardContent = dynamic(
  () => import('./DarkExpensesDashboardContent'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-zinc-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-400 mx-auto mb-4"></div>
          <p className="text-gray-400 font-medium text-lg tracking-wider">
            💰 EXPENSE DASHBOARD
          </p>
          <p className="text-gray-600 text-sm mt-2 tracking-wider">
            LOADING ANALYTICS...
          </p>
        </div>
      </div>
    ),
  },
);

export default function DarkExpenseDashboardPage() {
  return <DarkExpensesDashboardContent />;
}
