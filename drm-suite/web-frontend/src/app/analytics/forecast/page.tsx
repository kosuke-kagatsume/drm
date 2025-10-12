'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ForecastAnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/analytics/forecast?tenantId=demo-tenant')
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <div className="p-8">読み込み中...</div>;

  const { summary, pipeline } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-gradient-to-r from-dandori-yellow to-dandori-orange text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.back()}
            className="text-white/80 hover:text-white mb-4"
          >
            ← 戻る
          </button>
          <h1 className="text-3xl font-bold">💰 売上予測</h1>
          <p className="text-white/90 mt-2">
            月次・四半期売上予測とパイプライン分析
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              今月予測
            </h3>
            <p className="text-4xl font-bold text-dandori-yellow">
              ¥{(summary.currentMonthForecast / 1000000).toFixed(0)}M
            </p>
            <p className="text-sm text-gray-600 mt-2">
              目標達成率: {summary.achievementRate}%
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              来月予測
            </h3>
            <p className="text-4xl font-bold text-dandori-orange">
              ¥{(summary.nextMonthForecast / 1000000).toFixed(0)}M
            </p>
            <p className="text-sm text-gray-600 mt-2">前月比: +8.0%</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              パイプライン総額
            </h3>
            <p className="text-4xl font-bold text-dandori-pink">
              ¥{(summary.pipelineValue / 1000000).toFixed(0)}M
            </p>
            <p className="text-sm text-gray-600 mt-2">
              受注確率: {summary.wonRate}%
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            🎯 パイプライン分析
          </h3>
          <div className="space-y-3">
            {pipeline.map((stage: any, i: number) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-32 text-sm font-semibold text-gray-700">
                  {stage.stage}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="h-8 rounded-full bg-gradient-to-r from-dandori-yellow to-dandori-orange flex items-center justify-end px-3"
                    style={{ width: `${stage.probability}%` }}
                  >
                    <span className="text-white text-xs font-bold">
                      {stage.probability}%
                    </span>
                  </div>
                </div>
                <div className="w-32 text-right">
                  <p className="text-sm font-bold text-gray-900">
                    ¥{(stage.value / 1000000).toFixed(0)}M
                  </p>
                  <p className="text-xs text-gray-600">{stage.count}件</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-dandori-yellow/5 to-dandori-orange/5 rounded-xl p-6 border border-dandori-yellow/20">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            💡 売上予測改善のポイント
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-dandori-yellow mt-1">•</span>
              <span>
                <strong>パイプライン管理</strong>: ¥
                {(summary.pipelineValue / 1000000).toFixed(0)}
                Mの案件を適切に管理し、受注率{summary.wonRate}%を維持
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-dandori-orange mt-1">•</span>
              <span>
                <strong>目標達成</strong>: 現在{summary.achievementRate}%。あと¥
                {(150 - summary.currentMonthForecast / 1000000).toFixed(0)}
                Mで目標達成
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-dandori-pink mt-1">•</span>
              <span>
                <strong>成長トレンド</strong>:
                来月は前月比+8.0%の成長予測。この勢いを維持しましょう
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
