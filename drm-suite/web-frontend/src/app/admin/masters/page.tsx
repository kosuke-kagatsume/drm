'use client';

import dynamic from 'next/dynamic';

// マスタ管理の全機能を動的インポート
const MastersContent = dynamic(() => import('./MastersContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-rose-600 mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium text-lg">
          ⚙️ マスタ管理を読み込み中...
        </p>
        <p className="text-gray-500 text-sm mt-2">
          マスタデータを準備しています
        </p>
      </div>
    </div>
  ),
});

export default function MastersPage() {
  return <MastersContent />;
}
