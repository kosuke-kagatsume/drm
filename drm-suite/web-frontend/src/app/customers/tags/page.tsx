'use client';

import dynamic from 'next/dynamic';

// rechartsを含むメインコンテンツを動的インポート
const CustomersContent = dynamic(() => import('./CustomersContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">
          顧客タグ管理を読み込み中...
        </p>
        <p className="text-gray-400 text-sm mt-2">タグデータを準備しています</p>
      </div>
    </div>
  ),
});

export default function CustomerTagsPage() {
  return <CustomersContent />;
}
