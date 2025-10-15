'use client';

import dynamic from 'next/dynamic';

// MUIコンポーネントを含むメインコンテンツを動的インポート
const ABTestContent = dynamic(() => import('./ABTestContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">
          A/Bテスト管理を読み込み中...
        </p>
        <p className="text-gray-400 text-sm mt-2">テスト機能を準備しています</p>
      </div>
    </div>
  ),
});

export default function ABTestPage() {
  return <ABTestContent />;
}
