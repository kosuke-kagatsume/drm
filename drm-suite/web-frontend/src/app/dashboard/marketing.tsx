'use client';

import dynamic from 'next/dynamic';

// マーケティングダッシュボードの全機能を動的インポート
const MarketingContent = dynamic(() => import('./MarketingContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">
          マーケティングダッシュボードを読み込み中...
        </p>
        <p className="text-gray-400 text-sm mt-2">
          マーケティングデータを準備しています
        </p>
      </div>
    </div>
  ),
});

interface MarketingDashboardProps {
  userEmail: string;
}

export default function MarketingDashboard({
  userEmail,
}: MarketingDashboardProps) {
  return <MarketingContent userEmail={userEmail} />;
}
