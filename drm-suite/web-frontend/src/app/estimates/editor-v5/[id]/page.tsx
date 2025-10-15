'use client';

import dynamic from 'next/dynamic';

// V5エディタクライアントを動的インポート
const EditorClient = dynamic(() => import('./EditorClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">
          📝 V5エディタを読み込み中...
        </p>
        <p className="text-gray-400 text-sm mt-2">
          高度なエディタ機能を準備しています
        </p>
      </div>
    </div>
  ),
});

interface PageProps {
  params: { id: string };
}

export default function EstimateEditorV5Page({ params }: PageProps) {
  return <EditorClient estimateId={params.id} />;
}
