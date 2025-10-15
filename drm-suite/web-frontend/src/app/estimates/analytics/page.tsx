'use client';

import dynamic from 'next/dynamic';

// Chart.jsを含むメインコンテンツを動的インポート
const AnalyticsContent = dynamic(() => import('./AnalyticsContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">
          営業分析ダッシュボードを読み込み中...
        </p>
        <p className="text-gray-400 text-sm mt-2">
          グラフとデータを準備しています
        </p>
      </div>
    </div>
  ),
});

export default function EstimateAnalyticsPage() {
  return <AnalyticsContent />;
}
