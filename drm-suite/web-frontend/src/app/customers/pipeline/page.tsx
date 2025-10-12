'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Activity,
  BarChart3,
  Download,
} from 'lucide-react';

// ステージ定義
type PipelineStage =
  | 'lead'
  | 'contact'
  | 'negotiation'
  | 'proposal'
  | 'quoted'
  | 'won'
  | 'lost';

// 案件情報の型
interface Deal {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  stage: PipelineStage;
  value: number;
  probability: number;
  expectedCloseDate: string;
  assignee: string;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  notes: string;
}

interface StageStats {
  stage: PipelineStage;
  count: number;
  totalValue: number;
  averageProbability: number;
  weightedValue: number;
}

interface OverallStats {
  totalDeals: number;
  activeDeals: number;
  wonDeals: number;
  lostDeals: number;
  totalValue: number;
  activeValue: number;
  wonValue: number;
  lostValue: number;
  weightedValue: number;
  winRate: number;
}

interface Stats {
  byStage: StageStats[];
  overall: OverallStats;
}

export default function PipelinePage() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  useEffect(() => {
    fetchPipeline();
  }, [filterAssignee]);

  const fetchPipeline = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterAssignee !== 'all') {
        params.append('assignee', filterAssignee);
      }

      const response = await fetch(`/api/customers/pipeline?${params}`);
      const data = await response.json();

      if (data.success) {
        setDeals(data.deals);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch pipeline:', error);
    } finally {
      setLoading(false);
    }
  };

  // ステージの定義
  const stageConfig: Record<
    PipelineStage,
    { label: string; color: string; icon: React.ReactNode }
  > = {
    lead: {
      label: 'リード',
      color: 'from-gray-400 to-gray-500',
      icon: <Target className="w-5 h-5" />,
    },
    contact: {
      label: '初回接触',
      color: 'from-blue-400 to-blue-500',
      icon: <User className="w-5 h-5" />,
    },
    negotiation: {
      label: '商談中',
      color: 'from-purple-400 to-purple-500',
      icon: <Activity className="w-5 h-5" />,
    },
    proposal: {
      label: '提案',
      color: 'from-yellow-400 to-orange-400',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    quoted: {
      label: '見積提出',
      color: 'from-indigo-400 to-indigo-500',
      icon: <DollarSign className="w-5 h-5" />,
    },
    won: {
      label: '受注',
      color: 'from-green-500 to-emerald-500',
      icon: <CheckCircle className="w-5 h-5" />,
    },
    lost: {
      label: '失注',
      color: 'from-red-400 to-red-500',
      icon: <XCircle className="w-5 h-5" />,
    },
  };

  // ステージごとに案件をグループ化
  const dealsByStage: Record<PipelineStage, Deal[]> = {
    lead: [],
    contact: [],
    negotiation: [],
    proposal: [],
    quoted: [],
    won: [],
    lost: [],
  };

  deals.forEach((deal) => {
    dealsByStage[deal.stage].push(deal);
  });

  // 担当者リスト
  const uniqueAssignees = Array.from(new Set(deals.map((d) => d.assignee)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-dandori-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-600">案件データ読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* ヘッダー with Blue Gradient */}
      <div className="bg-gradient-dandori text-white shadow-xl">
        <div className="max-w-full-hd mx-auto px-4 lg:px-6 xl:px-8 2xl:px-12 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/customers')}
                className="text-white/80 hover:text-white transition-colors"
              >
                ← 顧客一覧に戻る
              </button>
              <div>
                <h1 className="text-3xl font-bold flex items-center">
                  <span className="text-4xl mr-3">🎯</span>
                  案件パイプライン管理
                </h1>
                <p className="text-dandori-yellow/80 text-sm mt-1">
                  営業プロセスの可視化と案件進捗管理
                </p>
              </div>
            </div>

            <button className="bg-white text-dandori-blue px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2">
              <Download className="w-5 h-5" />
              パイプラインレポート出力
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-full-hd mx-auto px-4 lg:px-6 xl:px-8 2xl:px-12 py-8">
        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">アクティブ案件</span>
              <Activity className="w-5 h-5 text-dandori-blue" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.overall.activeDeals}件
            </p>
            <p className="text-xs text-gray-600 mt-1">進行中</p>
          </div>

          <div className="bg-gradient-to-br from-dandori-blue to-dandori-sky text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/90">アクティブ総額</span>
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold">
              ¥{((stats?.overall.activeValue || 0) / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-white/90 mt-1">進行中案件</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/90">予想売上</span>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold">
              ¥{((stats?.overall.weightedValue || 0) / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-white/90 mt-1">確度加味</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/90">受注</span>
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold">{stats?.overall.wonDeals}件</p>
            <p className="text-xs text-white/90 mt-1">
              ¥{((stats?.overall.wonValue || 0) / 1000000).toFixed(1)}M
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">受注率</span>
              <Award className="w-5 h-5 text-dandori-blue" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.overall.winRate.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-600 mt-1">受注/失注比</p>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              案件カンバンボード
            </h3>
            <div className="flex items-center gap-3">
              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue focus:border-transparent transition-all duration-200 font-medium"
              >
                <option value="all">全ての担当者</option>
                {uniqueAssignees.map((assignee) => (
                  <option key={assignee} value={assignee}>
                    {assignee}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* カンバンボード */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {/* アクティブステージのみ表示 (won/lostは別セクション) */}
          {(
            ['lead', 'contact', 'negotiation', 'proposal', 'quoted'] as const
          ).map((stage) => {
            const config = stageConfig[stage];
            const stageDeals = dealsByStage[stage];
            const stageStats = stats?.byStage.find((s) => s.stage === stage);

            return (
              <div
                key={stage}
                className="bg-gray-100 rounded-xl p-4 min-h-[500px]"
              >
                {/* ステージヘッダー */}
                <div className="mb-4">
                  <div
                    className={`bg-gradient-to-r ${config.color} text-white rounded-lg p-3 flex items-center justify-between shadow-lg`}
                  >
                    <div className="flex items-center gap-2">
                      {config.icon}
                      <span className="font-bold">{config.label}</span>
                    </div>
                    <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-bold">
                      {stageDeals.length}
                    </span>
                  </div>
                  <div className="mt-2 px-2 text-xs text-gray-600">
                    総額: ¥
                    {((stageStats?.totalValue || 0) / 1000000).toFixed(1)}M
                  </div>
                </div>

                {/* 案件カード */}
                <div className="space-y-3">
                  {stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-dandori-blue"
                      onClick={() => setSelectedDeal(deal)}
                    >
                      <h4 className="font-bold text-gray-900 text-sm mb-1">
                        {deal.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        {deal.customerName}
                      </p>

                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-dandori-blue">
                          ¥{(deal.value / 1000000).toFixed(1)}M
                        </span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                          {deal.probability}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(deal.expectedCloseDate).toLocaleDateString(
                          'ja-JP',
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <User className="w-3 h-3" />
                        {deal.assignee}
                      </div>

                      {deal.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {deal.tags.slice(0, 2).map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-dandori-blue/10 text-dandori-blue text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* 受注・失注セクション */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* 受注 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-bold text-gray-900">
                受注案件 ({dealsByStage.won.length}件)
              </h3>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {dealsByStage.won.map((deal) => (
                <div
                  key={deal.id}
                  className="border-l-4 border-green-500 bg-green-50 rounded-lg p-3 hover:bg-green-100 transition-colors cursor-pointer"
                  onClick={() => setSelectedDeal(deal)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">
                        {deal.title}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {deal.customerName}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-green-700">
                      ¥{(deal.value / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 失注 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-bold text-gray-900">
                失注案件 ({dealsByStage.lost.length}件)
              </h3>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {dealsByStage.lost.map((deal) => (
                <div
                  key={deal.id}
                  className="border-l-4 border-red-500 bg-red-50 rounded-lg p-3 hover:bg-red-100 transition-colors cursor-pointer"
                  onClick={() => setSelectedDeal(deal)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">
                        {deal.title}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {deal.customerName}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-red-700">
                      ¥{(deal.value / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 案件詳細モーダル */}
      {selectedDeal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDeal(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedDeal.title}
                </h3>
                <p className="text-gray-600">{selectedDeal.customerName}</p>
              </div>
              <button
                onClick={() => setSelectedDeal(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  案件金額
                </h4>
                <p className="text-2xl font-bold text-dandori-blue">
                  ¥{(selectedDeal.value / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  受注確度
                </h4>
                <p className="text-2xl font-bold text-green-600">
                  {selectedDeal.probability}%
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  予想受注日
                </h4>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(selectedDeal.expectedCloseDate).toLocaleDateString(
                    'ja-JP',
                  )}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  担当者
                </h4>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedDeal.assignee}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                現在のステージ
              </h4>
              <div
                className={`inline-block px-4 py-2 rounded-lg bg-gradient-to-r ${stageConfig[selectedDeal.stage].color} text-white font-bold`}
              >
                {stageConfig[selectedDeal.stage].label}
              </div>
            </div>

            {selectedDeal.notes && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">メモ</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {selectedDeal.notes}
                </p>
              </div>
            )}

            {selectedDeal.tags.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">タグ</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDeal.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-dandori-blue/10 text-dandori-blue text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() =>
                  router.push(`/customers/${selectedDeal.customerId}`)
                }
                className="flex-1 py-3 bg-gradient-dandori text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                顧客詳細を見る
              </button>
              <button
                onClick={() => setSelectedDeal(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
