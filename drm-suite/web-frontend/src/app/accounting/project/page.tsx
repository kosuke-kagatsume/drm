'use client';

import dynamic from 'next/dynamic';

// プロジェクト経理の全機能を動的インポート
const ProjectAccountingContent = dynamic(
  () => import('./ProjectAccountingContent'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium text-lg">
            📈 プロジェクト経理を読み込み中...
          </p>
          <p className="text-gray-500 text-sm mt-2">
            会計データと分析情報を準備しています
          </p>
        </div>
      </div>
    ),
  },
);

export default function ProjectAccountingPage() {
  return <ProjectAccountingContent />;
}
