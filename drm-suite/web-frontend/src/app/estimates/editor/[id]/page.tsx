'use client';

import dynamic from 'next/dynamic';

// 見積エディタの全機能を動的インポート
const EditorContent = dynamic(() => import('./EditorContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">
          📝 見積エディタを読み込み中...
        </p>
        <p className="text-gray-400 text-sm mt-2">エディタを準備しています</p>
      </div>
    </div>
  ),
});

interface EstimateEditorPageProps {
  params: { id: string };
}

export default function EstimateEditorPage({
  params,
}: EstimateEditorPageProps) {
  return <EditorContent params={params} />;
}
