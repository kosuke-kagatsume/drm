'use client';

import dynamic from 'next/dynamic';

// 見積エディタV4の全機能を動的インポート
const EditorV4Content = dynamic(() => import('./EditorV4Content'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium text-lg">
          ✏️ エディタV4を読み込み中...
        </p>
        <p className="text-gray-500 text-sm mt-2">
          見積データとマスタ情報を準備しています
        </p>
      </div>
    </div>
  ),
});

interface PageProps {
  params: { id: string };
}

export default function EditorV4Page({ params }: PageProps) {
  return <EditorV4Content />;
}
