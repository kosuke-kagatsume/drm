'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function FinancialRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customer = searchParams.get('customer');

  useEffect(() => {
    // 新しい資金計画書IDを生成
    const newFinancialId = `FIN-${Date.now()}`;

    // financial/[id]ページにリダイレクト
    const redirectUrl = `/estimates/financial/${newFinancialId}${customer ? `?customer=${customer}` : ''}`;
    router.replace(redirectUrl);
  }, [router, customer]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">資金計画書を作成中...</p>
      </div>
    </div>
  );
}

export default function NewFinancialRedirect() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        </div>
      }
    >
      <FinancialRedirectContent />
    </Suspense>
  );
}
