'use client';

import dynamic from 'next/dynamic';

// 拡張見積作成の全機能を動的インポート
const EnhancedCreateContent = dynamic(() => import('./EnhancedCreateContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-600 mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium text-lg">
          ✨ 拡張見積作成を読み込み中...
        </p>
        <p className="text-gray-500 text-sm mt-2">
          テンプレートと機能を準備しています
        </p>
      </div>
    </div>
  ),
});

export default function EnhancedCreatePage() {
  return <EnhancedCreateContent />;
}
