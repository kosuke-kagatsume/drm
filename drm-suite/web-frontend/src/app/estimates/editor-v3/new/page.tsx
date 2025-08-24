'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewEstimateRedirect() {
  const router = useRouter();

  useEffect(() => {
    // 新しい見積IDを生成
    const newEstimateId = `EST-${Date.now()}`;

    // editor-v3の[id]ページにリダイレクト
    router.replace(`/estimates/editor-v3/${newEstimateId}`);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">新規見積を作成中...</p>
      </div>
    </div>
  );
}
