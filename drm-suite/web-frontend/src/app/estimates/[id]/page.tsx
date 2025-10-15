'use client';

import dynamic from 'next/dynamic';

// 見積詳細の全機能を動的インポート
const EstimateDetailContent = dynamic(() => import('./EstimateDetailContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium text-lg">
          📋 見積詳細を読み込み中...
        </p>
        <p className="text-gray-500 text-sm mt-2">
          見積データと関連情報を準備しています
        </p>
      </div>
    </div>
  ),
});

interface PageProps {
  params: { id: string };
}

export default function EstimateDetailPage({ params }: PageProps) {
  return <EstimateDetailContent params={params} />;
}
