'use client';

import dynamic from 'next/dynamic';

// 契約管理の全機能を動的インポート
const ContractsContent = dynamic(() => import('./ContractsContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium text-lg">
          📋 契約管理を読み込み中...
        </p>
        <p className="text-gray-500 text-sm mt-2">
          契約データと統計情報を準備しています
        </p>
      </div>
    </div>
  ),
});

export default function ContractsPage() {
  return <ContractsContent />;
}
