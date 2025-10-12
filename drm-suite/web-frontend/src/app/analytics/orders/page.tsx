'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OrderAnalytics from '@/components/analytics/OrderAnalytics';

/**
 * 受注率分析ページ
 * 詳細な受注分析とフィルタリング機能を提供
 */
export default function OrdersAnalyticsPage() {
  const router = useRouter();
  const [tenantId] = useState('demo-tenant');
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>(
    'monthly',
  );
  const [branch, setBranch] = useState<string>('all');
  const [assignee, setAssignee] = useState<string>('all');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-dandori-blue to-dandori-sky text-white shadow-xl">
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
              <h1 className="text-3xl font-bold mb-2">📊 受注率分析</h1>
              <p className="text-white/90">
                見積提出から受注までの詳細な分析データ
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
                集計期間
              </label>
              <select
                value={period}
                onChange={(e) =>
                  setPeriod(
                    e.target.value as 'monthly' | 'quarterly' | 'yearly',
                  )
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue focus:border-transparent transition-all"
              >
                <option value="monthly">月次</option>
                <option value="quarterly">四半期</option>
                <option value="yearly">年次</option>
              </select>
            </div>

            {/* 支店選択 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                支店
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue focus:border-transparent transition-all"
              >
                <option value="all">全社</option>
                <option value="tokyo">東京本店</option>
                <option value="yokohama">横浜支店</option>
                <option value="chiba">千葉支店</option>
                <option value="saitama">埼玉支店</option>
              </select>
            </div>

            {/* 担当者選択 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                担当者
              </label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue focus:border-transparent transition-all"
              >
                <option value="all">全員</option>
                <option value="user-001">営業太郎</option>
                <option value="user-002">営業花子</option>
                <option value="user-003">営業次郎</option>
              </select>
            </div>
          </div>

          {/* アクティブフィルター表示 */}
          <div className="mt-4 flex flex-wrap gap-2">
            {period !== 'monthly' && (
              <span className="px-3 py-1 bg-dandori-blue/10 text-dandori-blue rounded-full text-sm font-semibold">
                期間: {period === 'quarterly' ? '四半期' : '年次'}
              </span>
            )}
            {branch !== 'all' && (
              <span className="px-3 py-1 bg-dandori-orange/10 text-dandori-orange rounded-full text-sm font-semibold">
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
            {assignee !== 'all' && (
              <span className="px-3 py-1 bg-dandori-pink/10 text-dandori-pink rounded-full text-sm font-semibold">
                担当者:{' '}
                {assignee === 'user-001'
                  ? '営業太郎'
                  : assignee === 'user-002'
                    ? '営業花子'
                    : '営業次郎'}
              </span>
            )}
          </div>
        </div>

        {/* 分析コンテンツ */}
        <OrderAnalytics tenantId={tenantId} period={period} />

        {/* 補足情報 */}
        <div className="mt-6 bg-gradient-to-r from-dandori-blue/5 to-dandori-sky/5 rounded-xl p-6 border border-dandori-blue/20">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            💡 分析のヒント
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-dandori-blue mt-1">•</span>
              <span>
                <strong>受注率</strong>:
                業界平均は20-30%。これを下回る場合は見積精度や提案内容の見直しが必要
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-dandori-orange mt-1">•</span>
              <span>
                <strong>失注理由</strong>:
                「価格」が多い場合は原価管理の改善、「仕様」が多い場合はヒアリング強化
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-dandori-pink mt-1">•</span>
              <span>
                <strong>営業別分析</strong>:
                受注率の高い営業のノウハウを横展開して全体のレベルアップを図る
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
