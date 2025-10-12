'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomerAnalytics from '@/components/analytics/CustomerAnalytics';

/**
 * 顧客分析ページ
 * 詳細な顧客分析とフィルタリング機能を提供
 */
export default function CustomersAnalyticsPage() {
  const router = useRouter();
  const [tenantId] = useState('demo-tenant');
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>(
    'monthly',
  );
  const [customerType, setCustomerType] = useState<
    'all' | 'new' | 'existing' | 'repeat'
  >('all');
  const [status, setStatus] = useState<
    'all' | 'active' | 'inactive' | 'at_risk'
  >('all');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-dandori-pink to-dandori-orange text-white shadow-xl">
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
              <h1 className="text-3xl font-bold mb-2">👥 顧客分析</h1>
              <p className="text-white/90">顧客の生涯価値とリスク管理</p>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-pink focus:border-transparent transition-all"
              >
                <option value="monthly">月次</option>
                <option value="quarterly">四半期</option>
                <option value="yearly">年次</option>
              </select>
            </div>

            {/* 顧客タイプ選択 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                顧客タイプ
              </label>
              <select
                value={customerType}
                onChange={(e) =>
                  setCustomerType(
                    e.target.value as 'all' | 'new' | 'existing' | 'repeat',
                  )
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-pink focus:border-transparent transition-all"
              >
                <option value="all">すべて</option>
                <option value="new">新規顧客</option>
                <option value="existing">既存顧客</option>
                <option value="repeat">リピート顧客</option>
              </select>
            </div>

            {/* ステータス選択 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                顧客ステータス
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as 'all' | 'active' | 'inactive' | 'at_risk',
                  )
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-pink focus:border-transparent transition-all"
              >
                <option value="all">すべて</option>
                <option value="active">アクティブ</option>
                <option value="inactive">休眠中</option>
                <option value="at_risk">リスク</option>
              </select>
            </div>
          </div>

          {/* アクティブフィルター表示 */}
          <div className="mt-4 flex flex-wrap gap-2">
            {period !== 'monthly' && (
              <span className="px-3 py-1 bg-dandori-pink/10 text-dandori-pink rounded-full text-sm font-semibold">
                期間: {period === 'quarterly' ? '四半期' : '年次'}
              </span>
            )}
            {customerType !== 'all' && (
              <span className="px-3 py-1 bg-dandori-orange/10 text-dandori-orange rounded-full text-sm font-semibold">
                タイプ:{' '}
                {customerType === 'new'
                  ? '新規顧客'
                  : customerType === 'existing'
                    ? '既存顧客'
                    : 'リピート顧客'}
              </span>
            )}
            {status !== 'all' && (
              <span className="px-3 py-1 bg-dandori-blue/10 text-dandori-blue rounded-full text-sm font-semibold">
                ステータス:{' '}
                {status === 'active'
                  ? 'アクティブ'
                  : status === 'inactive'
                    ? '休眠中'
                    : 'リスク'}
              </span>
            )}
          </div>
        </div>

        {/* 分析コンテンツ */}
        <CustomerAnalytics
          tenantId={tenantId}
          period={period}
          customerType={customerType}
          status={status}
        />

        {/* 補足情報 */}
        <div className="mt-6 bg-gradient-to-r from-dandori-pink/5 to-dandori-orange/5 rounded-xl p-6 border border-dandori-pink/20">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            💡 顧客管理のポイント
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-dandori-pink mt-1">•</span>
              <span>
                <strong>LTV向上</strong>:
                顧客生涯価値を高めるため、リピート率の改善と取引単価の向上に注力
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-dandori-orange mt-1">•</span>
              <span>
                <strong>リスク顧客</strong>:
                最終取引から3ヶ月経過した顧客には積極的なフォローアップが必要
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-dandori-yellow mt-1">•</span>
              <span>
                <strong>新規獲得</strong>:
                新規顧客獲得コストとLTVのバランスを常に意識。紹介制度の活用も有効
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-dandori-blue mt-1">•</span>
              <span>
                <strong>優良顧客</strong>:
                TOP10顧客には専任担当を配置し、VIP対応で長期関係を構築
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
