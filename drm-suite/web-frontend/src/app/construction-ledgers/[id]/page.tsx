'use client';

import dynamic from 'next/dynamic';

// 工事台帳詳細の全機能を動的インポート
const ConstructionLedgerDetailContent = dynamic(
  () => import('./ConstructionLedgerDetailContent'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium text-lg">
            🏗️ 工事台帳を読み込み中...
          </p>
          <p className="text-gray-500 text-sm mt-2">
            原価データと進捗情報を準備しています
          </p>
        </div>
      </div>
    ),
  },
);

interface PageProps {
  params: { id: string };
}

export default function ConstructionLedgerDetailPage({ params }: PageProps) {
  return <ConstructionLedgerDetailContent params={params} />;
}
