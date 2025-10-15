'use client';

import dynamic from 'next/dynamic';

// 請求書一覧の全機能を動的インポート
const InvoicesContent = dynamic(() => import('./InvoicesContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium text-lg">
          💰 請求書管理を読み込み中...
        </p>
        <p className="text-gray-500 text-sm mt-2">
          請求データと入金状況を準備しています
        </p>
      </div>
    </div>
  ),
});

export default function InvoicesPage() {
  return <InvoicesContent />;
}
