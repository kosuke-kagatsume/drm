'use client';

import dynamic from 'next/dynamic';

// MUIコンポーネントを含むメインコンテンツを動的インポート
const ABTestSettingsContent = dynamic(() => import('./ABTestSettingsContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">
          A/Bテスト設定を読み込み中...
        </p>
        <p className="text-gray-400 text-sm mt-2">テスト設定を準備しています</p>
      </div>
    </div>
  ),
});

export default function ABTestSettingsPage() {
  return <ABTestSettingsContent />;
}
