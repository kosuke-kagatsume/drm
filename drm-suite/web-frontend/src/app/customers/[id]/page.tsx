'use client';

import dynamic from 'next/dynamic';

// 顧客詳細の全機能を動的インポート
const CustomerDetailContent = dynamic(() => import('./CustomerDetailContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium text-lg">
          👤 顧客情報を読み込み中...
        </p>
        <p className="text-gray-500 text-sm mt-2">
          詳細データと履歴を準備しています
        </p>
      </div>
    </div>
  ),
});

interface PageProps {
  params: { id: string };
}

export default function CustomerDetailPage({ params }: PageProps) {
  return <CustomerDetailContent params={params} />;
}
