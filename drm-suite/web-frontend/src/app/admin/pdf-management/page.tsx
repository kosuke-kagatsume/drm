'use client';

import dynamic from 'next/dynamic';

// PDF管理システムの全機能を動的インポート
const PdfManagementContent = dynamic(() => import('./PdfManagementContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium text-lg">
          📄 PDF管理システムを読み込み中...
        </p>
        <p className="text-gray-500 text-sm mt-2">
          テンプレートとブランディング設定を準備しています
        </p>
      </div>
    </div>
  ),
});

export default function PdfManagementPage() {
  return <PdfManagementContent />;
}
