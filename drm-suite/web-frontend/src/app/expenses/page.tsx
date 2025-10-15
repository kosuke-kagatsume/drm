'use client';

import dynamic from 'next/dynamic';

// 経費管理の全機能を動的インポート
const ExpensesContent = dynamic(() => import('./ExpensesContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">
          💰 経費管理を読み込み中...
        </p>
        <p className="text-gray-400 text-sm mt-2">経費データを準備しています</p>
      </div>
    </div>
  ),
});

export default function ExpensesDashboard() {
  return <ExpensesContent />;
}
