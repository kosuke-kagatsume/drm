'use client';

import dynamic from 'next/dynamic';

// ダークダッシュボードの全機能を動的インポート
const DarkDashboardContent = dynamic(() => import('./DarkDashboardContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-400 mx-auto mb-4"></div>
        <p className="text-gray-300 font-medium text-lg">
          🌙 ダークダッシュボードを読み込み中...
        </p>
        <p className="text-gray-500 text-sm mt-2">統計情報を準備しています</p>
      </div>
    </div>
  ),
});

export default function DarkDashboardPage() {
  return <DarkDashboardContent />;
}
