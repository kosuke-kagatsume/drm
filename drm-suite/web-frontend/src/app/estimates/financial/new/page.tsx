'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function FinancialRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customer = searchParams.get('customer');
  const [isCreating, setIsCreating] = useState(true);

  useEffect(() => {
    let isCancelled = false; // cleanup用のフラグ

    const createNewFinancialPlan = async () => {
      try {
        // 顧客情報を取得（クエリパラメータから、なければ新規顧客IDを生成）
        const customerId = customer || `cust-${Date.now()}`;
        const customerName = customer || '新規顧客';

        // APIで初回バージョンを作成
        const response = await fetch('/api/financial-plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId,
            customerName,
            buildingArea: 40,
            unitPrice: 500000,
            financialData: [], // 初期データは空
            loanInfo: {
              borrowingAmount: 0,
              selfFund: 0,
              monthlyPayment: 0,
              bonus: 0,
              years: 35,
              rate: 0.5,
            },
            changeNote: '初回作成',
          }),
        });

        if (response.ok && !isCancelled) {
          const newVersion = await response.json();
          // 作成されたバージョンのIDからfp-プレフィックスを除去してリダイレクト
          const versionId = newVersion.id.replace('fp-', '');
          router.replace(`/estimates/financial/${versionId}`);
        } else if (!response.ok) {
          console.error('Failed to create financial plan');
          alert('資金計画書の作成に失敗しました');
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error creating financial plan:', error);
          alert('資金計画書の作成に失敗しました');
        }
      } finally {
        if (!isCancelled) {
          setIsCreating(false);
        }
      }
    };

    createNewFinancialPlan();

    // cleanup関数で重複実行を防ぐ
    return () => {
      isCancelled = true;
    };
  }, [router, customer]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          {isCreating ? '資金計画書を作成中...' : 'リダイレクト中...'}
        </p>
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
