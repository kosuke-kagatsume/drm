'use client';

import dynamic from 'next/dynamic';

// 経理ダッシュボードの全機能を動的インポート
const AccountingContent = dynamic(() => import('./AccountingContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">
          経理ダッシュボードを読み込み中...
        </p>
        <p className="text-gray-400 text-sm mt-2">財務データを準備しています</p>
      </div>
    </div>
  ),
});

interface AccountingDashboardProps {
  userEmail: string;
}

export default function AccountingDashboard({
  userEmail,
}: AccountingDashboardProps) {
  return <AccountingContent userEmail={userEmail} />;
}
