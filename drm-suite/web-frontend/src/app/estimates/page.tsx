'use client';

import dynamic from 'next/dynamic';

// 見積一覧の全機能を動的インポート
const EstimatesContent = dynamic(() => import('./EstimatesContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium text-lg">
          📋 見積管理を読み込み中...
        </p>
        <p className="text-gray-500 text-sm mt-2">
          見積データと統計情報を準備しています
        </p>
      </div>
    </div>
  ),
});

export default function EstimatesPage() {
  return <EstimatesContent />;
}
