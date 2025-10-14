'use client';

import dynamic from 'next/dynamic';

// framer-motionを含むメインコンテンツを動的インポート
const FinancialPlansListContent = dynamic(
  () => import('./FinancialPlansListContent'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            資金計画書一覧を読み込み中...
          </p>
        </div>
      </div>
    ),
  },
);

export default function FinancialPlansListPage() {
  return <FinancialPlansListContent />;
}
