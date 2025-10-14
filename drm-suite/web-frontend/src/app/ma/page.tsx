'use client';

import dynamic from 'next/dynamic';

// react-dndとrechartsを含むメインコンテンツを動的インポート
const MAManagementContent = dynamic(() => import('./MAManagementContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">
          MA管理システムを読み込み中...
        </p>
        <p className="text-gray-400 text-sm mt-2">
          マーケティングオートメーション機能を準備しています
        </p>
      </div>
    </div>
  ),
});

export default function MAManagementPage() {
  return <MAManagementContent />;
}
