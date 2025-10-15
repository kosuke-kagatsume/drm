'use client';

import dynamic from 'next/dynamic';

// rechartsを含むメインコンテンツを動的インポート
const AnalyticsContent = dynamic(() => import('./AnalyticsContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">
          顧客別売上分析を読み込み中...
        </p>
        <p className="text-gray-400 text-sm mt-2">売上データを準備しています</p>
      </div>
    </div>
  ),
});

export default function CustomerRevenuePage() {
  return <AnalyticsContent />;
}
