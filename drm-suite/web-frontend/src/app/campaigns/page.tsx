'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCampaigns } from '@/hooks/useCampaigns';
import { CampaignStatus, CampaignType } from '@/types/campaign';

export default function CampaignsPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<CampaignStatus | 'all'>(
    'all',
  );
  const [selectedType, setSelectedType] = useState<CampaignType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);

  const { campaigns, loading, total } = useCampaigns({
    filter: {
      status: selectedStatus !== 'all' ? [selectedStatus] : undefined,
      type: selectedType !== 'all' ? [selectedType] : undefined,
      search: searchTerm,
    },
    autoFetch: true,
  });

  const getStatusBadge = (status: CampaignStatus) => {
    const config = {
      draft: { label: '下書き', class: 'bg-gray-100 text-gray-700' },
      scheduled: { label: '予約済み', class: 'bg-blue-100 text-blue-700' },
      active: { label: '実施中', class: 'bg-green-100 text-green-700' },
      paused: { label: '一時停止', class: 'bg-yellow-100 text-yellow-700' },
      completed: { label: '完了', class: 'bg-gray-100 text-gray-700' },
      cancelled: { label: 'キャンセル', class: 'bg-red-100 text-red-700' },
    };
    const cfg = config[status];
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.class}`}
      >
        {cfg.label}
      </span>
    );
  };

  const getTypeIcon = (type: CampaignType) => {
    const icons = {
      email: '📧',
      sms: '💬',
      line: '📱',
      dm: '📮',
      web: '🌐',
      event: '🎪',
      other: '📌',
    };
    return icons[type] || '📌';
  };

  const getSegmentLabel = (segment: string) => {
    const labels: Record<string, string> = {
      all: '全顧客',
      new: '新規顧客',
      existing: '既存顧客',
      dormant: '休眠顧客',
      vip: 'VIP顧客',
      custom: 'カスタム',
    };
    return labels[segment] || segment;
  };

  // 建築業界特有のKPI計算
  const calculateConstructionKPIs = (campaign: any) => {
    const conversionRate =
      campaign.metrics.clicked > 0
        ? (
            (campaign.metrics.converted / campaign.metrics.clicked) *
            100
          ).toFixed(1)
        : '0';

    const averageContractValue =
      campaign.metrics.converted > 0
        ? Math.round(campaign.metrics.revenue / campaign.metrics.converted)
        : 0;

    const costPerAcquisition =
      campaign.metrics.converted > 0
        ? Math.round(campaign.actualCost / campaign.metrics.converted)
        : 0;

    return {
      conversionRate,
      averageContractValue,
      costPerAcquisition,
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">キャンペーン管理</h1>
              <p className="text-indigo-100 mt-1">
                建築・リフォーム業界向けマーケティング施策
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
              >
                📊 分析ビュー
              </button>
              <button
                onClick={() => router.push('/campaigns/new')}
                className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-medium hover:bg-indigo-50 transition"
              >
                ＋ 新規キャンペーン
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 業界特化のクイック統計 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">今月の見込み獲得</p>
                <p className="text-2xl font-bold text-gray-900">127件</p>
                <p className="text-xs text-green-600 mt-1">前月比 +23%</p>
              </div>
              <span className="text-3xl">🎯</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">平均成約単価</p>
                <p className="text-2xl font-bold text-gray-900">¥2.8M</p>
                <p className="text-xs text-gray-500 mt-1">外壁・屋根工事</p>
              </div>
              <span className="text-3xl">💰</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">見積り転換率</p>
                <p className="text-2xl font-bold text-gray-900">18.5%</p>
                <p className="text-xs text-blue-600 mt-1">業界平均: 15%</p>
              </div>
              <span className="text-3xl">📈</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">施工待ち案件</p>
                <p className="text-2xl font-bold text-gray-900">43件</p>
                <p className="text-xs text-orange-600 mt-1">平均待機: 2.3週</p>
              </div>
              <span className="text-3xl">⏰</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* フィルター */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="🔍 キャンペーン名、工事種別で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as CampaignStatus | 'all')
              }
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">全ステータス</option>
              <option value="draft">下書き</option>
              <option value="scheduled">予約済み</option>
              <option value="active">実施中</option>
              <option value="paused">一時停止</option>
              <option value="completed">完了</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) =>
                setSelectedType(e.target.value as CampaignType | 'all')
              }
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">全種別</option>
              <option value="email">メール</option>
              <option value="sms">SMS</option>
              <option value="line">LINE</option>
              <option value="dm">DM郵送</option>
              <option value="web">Web広告</option>
              <option value="event">イベント</option>
            </select>

            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
              🏗️ 工事種別
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
              📍 エリア
            </button>
          </div>
        </div>

        {/* キャンペーンリスト */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <span className="text-6xl">📭</span>
              <p className="mt-4 text-gray-600">キャンペーンが見つかりません</p>
              <button
                onClick={() => router.push('/campaigns/new')}
                className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                最初のキャンペーンを作成
              </button>
            </div>
          ) : (
            campaigns.map((campaign) => {
              const kpis = calculateConstructionKPIs(campaign);
              return (
                <div
                  key={campaign.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/campaigns/${campaign.id}`)}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start space-x-4">
                        <span className="text-3xl">
                          {getTypeIcon(campaign.type)}
                        </span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {campaign.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {campaign.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            {getStatusBadge(campaign.status)}
                            <span className="text-sm text-gray-500">
                              {getSegmentLabel(campaign.targetSegment)} •{' '}
                              {campaign.targetCount}件
                            </span>
                            <span className="text-sm text-gray-500">
                              期間:{' '}
                              {new Date(campaign.startDate).toLocaleDateString(
                                'ja-JP',
                              )}{' '}
                              〜{' '}
                              {new Date(campaign.endDate).toLocaleDateString(
                                'ja-JP',
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500">予算消化率</p>
                        <p className="text-xl font-bold text-gray-900">
                          {campaign.budget > 0
                            ? Math.round(
                                (campaign.actualCost / campaign.budget) * 100,
                              )
                            : 0}
                          %
                        </p>
                        <p className="text-sm text-gray-600">
                          ¥{(campaign.actualCost / 1000).toFixed(0)}k / ¥
                          {(campaign.budget / 1000).toFixed(0)}k
                        </p>
                      </div>
                    </div>

                    {/* 建築業界向けKPI */}
                    <div className="grid grid-cols-6 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-gray-500">配信数</p>
                        <p className="text-lg font-semibold">
                          {campaign.metrics.sent}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">開封率</p>
                        <p className="text-lg font-semibold">
                          {campaign.metrics.sent > 0
                            ? Math.round(
                                (campaign.metrics.opened /
                                  campaign.metrics.sent) *
                                  100,
                              )
                            : 0}
                          %
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">クリック率</p>
                        <p className="text-lg font-semibold">
                          {campaign.metrics.opened > 0
                            ? Math.round(
                                (campaign.metrics.clicked /
                                  campaign.metrics.opened) *
                                  100,
                              )
                            : 0}
                          %
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">見積依頼</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {campaign.metrics.converted}件
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">平均単価</p>
                        <p className="text-lg font-semibold text-green-600">
                          ¥{(kpis.averageContractValue / 1000000).toFixed(1)}M
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">ROI</p>
                        <p className="text-lg font-semibold text-purple-600">
                          {campaign.metrics.roi}%
                        </p>
                      </div>
                    </div>

                    {/* 工事種別タグ */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                        外壁塗装
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        屋根工事
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        リフォーム
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ページネーション */}
        {total > 10 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                前へ
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
                1
              </button>
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                2
              </button>
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                3
              </button>
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                次へ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
