'use client';

import dynamic from 'next/dynamic';

// ダークモード経費管理の全機能を動的インポート
const DarkExpensesContent = dynamic(() => import('./DarkExpensesContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-zinc-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-500 mx-auto mb-4"></div>
        <p className="text-gray-100 font-medium text-lg">
          💰 経費管理を読み込み中...
        </p>
        <p className="text-gray-400 text-sm mt-2">
          ダークモードで経費データを準備しています
        </p>
      </div>
    </div>
  ),
});

export default function DarkExpensesDashboard() {
  return <DarkExpensesContent />;
}
