'use client';

import dynamic from 'next/dynamic';

// rechartsを含むメインコンテンツを動的インポート
const EmailManagementContent = dynamic(
  () => import('./EmailManagementContent'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium text-lg">
            メール管理システムを読み込み中...
          </p>
          <p className="text-gray-400 text-sm mt-2">
            メールマーケティング機能を準備しています
          </p>
        </div>
      </div>
    ),
  },
);

export default function EmailManagementPage() {
  return <EmailManagementContent />;
}
