'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ActivitiesAnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/analytics/activities?tenantId=demo-tenant')
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <div className="p-8">読み込み中...</div>;

  const { summary } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-gradient-to-r from-dandori-blue to-dandori-pink text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.back()}
            className="text-white/80 hover:text-white mb-4"
          >
            ← 戻る
          </button>
          <h1 className="text-3xl font-bold">📊 営業活動分析</h1>
          <p className="text-white/90 mt-2">
            商談件数・訪問件数推移と営業プロセス分析
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              総活動数
            </h3>
            <p className="text-4xl font-bold text-dandori-blue">
              {summary.totalActivities}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              完了: {summary.completedActivities}件
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              コンバージョン率
            </h3>
            <p className="text-4xl font-bold text-dandori-orange">
              {summary.conversionRate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600 mt-2">
              受注につながった活動の割合
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              平均リードタイム
            </h3>
            <p className="text-4xl font-bold text-dandori-pink">
              {summary.totalLeadTime}日
            </p>
            <p className="text-sm text-gray-600 mt-2">初回接触から受注まで</p>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-r from-dandori-blue/5 to-dandori-pink/5 rounded-xl p-6 border border-dandori-blue/20">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            💡 営業活動改善のポイント
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-dandori-blue mt-1">•</span>
              <span>
                <strong>高コンバージョン</strong>:{' '}
                {summary.conversionRate.toFixed(0)}
                %は優秀な数値。このノウハウを他メンバーに展開
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-dandori-orange mt-1">•</span>
              <span>
                <strong>リードタイム</strong>: {summary.totalLeadTime}
                日は業界標準。さらに短縮するには初回ヒアリングの質を向上
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-dandori-pink mt-1">•</span>
              <span>
                <strong>活動量</strong>: 平均{summary.averageDuration}
                分/件。効率的な活動を継続しましょう
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
