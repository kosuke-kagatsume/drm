'use client';

import dynamic from 'next/dynamic';

// 在庫管理の全機能を動的インポート
const InventoryContent = dynamic(() => import('./InventoryContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">
          📦 在庫管理を読み込み中...
        </p>
        <p className="text-gray-400 text-sm mt-2">在庫データを準備しています</p>
      </div>
    </div>
  ),
});

export default function InventoryDashboard() {
  return <InventoryContent />;
}
