'use client';

import dynamic from 'next/dynamic';

// rechartsを含むメインコンテンツを動的インポート
const AnalyticsContent = dynamic(() => import('./AnalyticsContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">
          営業パフォーマンス分析を読み込み中...
        </p>
        <p className="text-gray-400 text-sm mt-2">分析データを準備しています</p>
      </div>
    </div>
  ),
});

export default function SalesPerformancePage() {
  return <AnalyticsContent />;
}
