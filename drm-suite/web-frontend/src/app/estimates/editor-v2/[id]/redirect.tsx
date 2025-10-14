'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditorV2Redirect() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    // editor-v5の同じIDページにリダイレクト
    router.replace(`/estimates/editor-v5/${params.id}`);
  }, [router, params.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">最新版エディタへ移動中...</p>
      </div>
    </div>
  );
}
