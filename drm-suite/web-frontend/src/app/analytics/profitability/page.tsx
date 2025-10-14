'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// 動的インポート（rechartsを含むため）
const ProjectProfitability = dynamic(
  () => import('@/components/analytics/ProjectProfitability'),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-pulse">
          <div className="text-4xl mb-4">📊</div>
          <div className="text-gray-400">分析データを読み込み中...</div>
        </div>
      </div>
    ),
  },
);

/**
 * 工事収益分析ページ
 * 詳細な収益性分析とフィルタリング機能を提供
 */
export default function ProfitabilityAnalyticsPage() {
  const router = useRouter();
  const [tenantId] = useState('demo-tenant');
  const [period, setPeriod] = useState<'all' | 'current' | 'past'>('all');
  const [status, setStatus] = useState<'all' | 'in_progress' | 'completed'>(
    'all',
  );
  const [branch, setBranch] = useState<string>('all');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-dandori-orange to-dandori-yellow text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
              >
                <span>←</span>
                <span>戻る</span>
              </button>
              <h1 className="text-3xl font-bold mb-2">💰 工事収益分析</h1>
              <p className="text-white/90">
                工事案件ごとの収益性とアラート管理
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* フィルターコントロール */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900">
            🔍 フィルター
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 期間選択 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                対象期間
              </label>
              <select
                value={period}
                onChange={(e) =>
                  setPeriod(e.target.value as 'all' | 'current' | 'past')
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-orange focus:border-transparent transition-all"
              >
                <option value="all">全期間</option>
                <option value="current">進行中</option>
                <option value="past">完了済み</option>
              </select>
            </div>

            {/* ステータス選択 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                工事ステータス
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as 'all' | 'in_progress' | 'completed',
                  )
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-orange focus:border-transparent transition-all"
              >
                <option value="all">すべて</option>
                <option value="in_progress">施工中</option>
                <option value="completed">完了</option>
              </select>
            </div>

            {/* 支店選択 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                担当支店
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-orange focus:border-transparent transition-all"
              >
                <option value="all">全社</option>
                <option value="tokyo">東京本店</option>
                <option value="yokohama">横浜支店</option>
                <option value="chiba">千葉支店</option>
                <option value="saitama">埼玉支店</option>
              </select>
            </div>
          </div>

          {/* アクティブフィルター表示 */}
          <div className="mt-4 flex flex-wrap gap-2">
            {period !== 'all' && (
              <span className="px-3 py-1 bg-dandori-orange/10 text-dandori-orange rounded-full text-sm font-semibold">
                期間: {period === 'current' ? '進行中' : '完了済み'}
              </span>
            )}
            {status !== 'all' && (
              <span className="px-3 py-1 bg-dandori-yellow/10 text-dandori-orange rounded-full text-sm font-semibold">
                ステータス: {status === 'in_progress' ? '施工中' : '完了'}
              </span>
            )}
            {branch !== 'all' && (
              <span className="px-3 py-1 bg-dandori-pink/10 text-dandori-pink rounded-full text-sm font-semibold">
                支店:{' '}
                {branch === 'tokyo'
                  ? '東京本店'
                  : branch === 'yokohama'
                    ? '横浜支店'
                    : branch === 'chiba'
                      ? '千葉支店'
                      : '埼玉支店'}
              </span>
            )}
          </div>
        </div>

        {/* 分析コンテンツ */}
        <ProjectProfitability
          tenantId={tenantId}
          period={period}
          status={status}
        />

        {/* 補足情報 */}
        <div className="mt-6 bg-gradient-to-r from-dandori-orange/5 to-dandori-yellow/5 rounded-xl p-6 border border-dandori-orange/20">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            💡 収益改善のポイント
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-dandori-orange mt-1">•</span>
              <span>
                <strong>粗利率目標</strong>:
                建設業界の標準は15-25%。工事種別により適正値は異なる
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-dandori-yellow mt-1">•</span>
              <span>
                <strong>原価管理</strong>:
                予算超過が頻発する場合は見積精度の改善と進捗管理の強化が必要
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-dandori-pink mt-1">•</span>
              <span>
                <strong>アラート対応</strong>:
                重大アラートは即座に対策会議を実施。早期発見が収益改善の鍵
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-dandori-blue mt-1">•</span>
              <span>
                <strong>ワースト案件</strong>:
                失敗事例から学び、同じミスを繰り返さない仕組みづくりが重要
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
