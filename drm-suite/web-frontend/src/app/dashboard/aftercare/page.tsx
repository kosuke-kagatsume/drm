'use client';

import dynamic from 'next/dynamic';

// アフターサービスダッシュボードの全機能を動的インポート
const AftercareDashboardContent = dynamic(
  () => import('./AftercareDashboardContent'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium text-lg">
            🔧 アフターサービスダッシュボードを読み込み中...
          </p>
          <p className="text-gray-500 text-sm mt-2">
            点検予定と顧客満足度データを準備しています
          </p>
        </div>
      </div>
    ),
  },
);

export default function AftercareDashboardPage() {
  return <AftercareDashboardContent />;
}
