'use client';

import dynamic from 'next/dynamic';

// framer-motionとdnd-kitを含むメインコンテンツを動的インポート
const EditorV2Content = dynamic(() => import('./EditorV2Content'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">
          見積エディタを読み込み中...
        </p>
        <p className="text-gray-400 text-sm mt-2">編集画面を準備しています</p>
      </div>
    </div>
  ),
});

export default function EditorV2Page() {
  return <EditorV2Content />;
}
