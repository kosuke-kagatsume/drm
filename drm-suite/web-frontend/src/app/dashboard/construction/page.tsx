'use client';

import dynamic from 'next/dynamic';

// 工事管理ダッシュボードの全機能を動的インポート
const ConstructionDashboardContent = dynamic(
  () => import('./ConstructionDashboardContent'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-slate-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium text-lg">
            📊 工事ダッシュボードを読み込み中...
          </p>
          <p className="text-gray-500 text-sm mt-2">
            工事データと統計情報を準備しています
          </p>
        </div>
      </div>
    ),
  },
);

export default function ConstructionDashboardPage() {
  return <ConstructionDashboardContent />;
}
