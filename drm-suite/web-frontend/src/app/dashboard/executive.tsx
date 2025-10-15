'use client';

import dynamic from 'next/dynamic';

// 経営ダッシュボードの全機能を動的インポート
const ExecutiveContent = dynamic(() => import('./ExecutiveContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-sky-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">
          経営ダッシュボードを読み込み中...
        </p>
        <p className="text-gray-400 text-sm mt-2">経営データを準備しています</p>
      </div>
    </div>
  ),
});

interface ExecutiveDashboardProps {
  userEmail: string;
}

export default function ExecutiveDashboard({
  userEmail,
}: ExecutiveDashboardProps) {
  return <ExecutiveContent userEmail={userEmail} />;
}
