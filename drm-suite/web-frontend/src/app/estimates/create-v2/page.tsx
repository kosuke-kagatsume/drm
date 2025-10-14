'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// framer-motionを含むメインコンテンツを動的インポート
const CreateEstimateV2Content = dynamic(
  () => import('./CreateEstimateV2Content'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            見積作成画面を読み込み中...
          </p>
        </div>
      </div>
    ),
  },
);

// Suspenseでラップしたメインコンポーネント
export default function EstimateCreateV2Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">
              見積作成画面を読み込み中...
            </p>
          </div>
        </div>
      }
    >
      <CreateEstimateV2Content />
    </Suspense>
  );
}
