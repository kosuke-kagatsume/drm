'use client';

import dynamic from 'next/dynamic';

// framer-motionを含むメインコンテンツを動的インポート
const FinancialPlanContent = dynamic(() => import('./FinancialPlanContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">
          資金計画書を読み込み中...
        </p>
        <p className="text-gray-400 text-sm mt-2">データを準備しています</p>
      </div>
    </div>
  ),
});

export default function FinancialPlanPage({
  params,
}: {
  params: { id: string };
}) {
  return <FinancialPlanContent params={params} />;
}
