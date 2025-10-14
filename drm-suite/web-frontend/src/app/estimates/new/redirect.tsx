'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewRedirect() {
  const router = useRouter();

  useEffect(() => {
    // editor-v5の新規作成ページにリダイレクト
    router.replace('/estimates/editor-v5/new');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">見積作成画面へ移動中...</p>
      </div>
    </div>
  );
}
