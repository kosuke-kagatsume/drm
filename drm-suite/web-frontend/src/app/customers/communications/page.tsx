'use client';

import dynamic from 'next/dynamic';

// rechartsを含むメインコンテンツを動的インポート
const CustomersContent = dynamic(() => import('./CustomersContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">
          コミュニケーション履歴を読み込み中...
        </p>
        <p className="text-gray-400 text-sm mt-2">履歴データを準備しています</p>
      </div>
    </div>
  ),
});

export default function CommunicationsPage() {
  return <CustomersContent />;
}
