'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Campaign } from '@/types/campaign';

export default function CampaignDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { campaigns } = useCampaigns({ autoFetch: true });
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const found = campaigns.find((c) => c.id === params.id);
    if (found) {
      setCampaign(found);
    }
  }, [campaigns, params.id]);

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      scheduled: 'bg-blue-100 text-blue-700',
      completed: 'bg-gray-100 text-gray-700',
      paused: 'bg-yellow-100 text-yellow-700',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  // 建築業界向けのKPI計算
  const conversionRate =
    campaign.metrics.clicked > 0
      ? ((campaign.metrics.converted / campaign.metrics.clicked) * 100).toFixed(
          1,
        )
      : '0';

  const averageContractValue =
    campaign.metrics.converted > 0
      ? campaign.metrics.revenue / campaign.metrics.converted
      : 0;

  const costPerAcquisition =
    campaign.metrics.converted > 0
      ? campaign.actualCost / campaign.metrics.converted
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => router.push('/campaigns')}
                className="text-white/80 hover:text-white mb-2"
              >
                ← キャンペーン一覧
              </button>
              <h1 className="text-3xl font-bold">{campaign.name}</h1>
              <p className="text-indigo-100 mt-1">{campaign.description}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span
                className={`px-4 py-2 rounded-full font-medium ${getStatusColor(campaign.status)}`}
              >
                {campaign.status === 'active'
                  ? '実施中'
                  : campaign.status === 'scheduled'
                    ? '予約済み'
                    : campaign.status === 'completed'
                      ? '完了'
                      : '一時停止'}
              </span>
              <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50">
                編集
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* メインKPI */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-sm text-gray-600">配信数</p>
            <p className="text-3xl font-bold text-gray-900">
              {campaign.metrics.sent}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              対象: {campaign.targetCount}件
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-sm text-gray-600">開封率</p>
            <p className="text-3xl font-bold text-blue-600">
              {campaign.metrics.sent > 0
                ? Math.round(
                    (campaign.metrics.opened / campaign.metrics.sent) * 100,
                  )
                : 0}
              %
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {campaign.metrics.opened}件開封
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-sm text-gray-600">見積依頼数</p>
            <p className="text-3xl font-bold text-green-600">
              {campaign.metrics.converted}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              転換率: {conversionRate}%
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-sm text-gray-600">売上貢献</p>
            <p className="text-3xl font-bold text-purple-600">
              ¥{(campaign.metrics.revenue / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-gray-500 mt-1">
              平均: ¥{(averageContractValue / 1000000).toFixed(1)}M
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-sm text-gray-600">ROI</p>
            <p className="text-3xl font-bold text-orange-600">
              {campaign.metrics.roi}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              CPA: ¥{(costPerAcquisition / 1000).toFixed(0)}k
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* タブ */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b">
            <div className="flex space-x-8 px-6">
              {[
                'overview',
                'performance',
                'audience',
                'content',
                'schedule',
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 border-b-2 font-medium text-sm transition ${
                    activeTab === tab
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'overview' && '概要'}
                  {tab === 'performance' && 'パフォーマンス'}
                  {tab === 'audience' && 'オーディエンス'}
                  {tab === 'content' && 'コンテンツ'}
                  {tab === 'schedule' && 'スケジュール'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* 概要タブ */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">基本情報</h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm text-gray-600">配信方法</dt>
                        <dd className="text-sm font-medium">{campaign.type}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-600">
                          ターゲットセグメント
                        </dt>
                        <dd className="text-sm font-medium">
                          {campaign.targetSegment}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-600">予算</dt>
                        <dd className="text-sm font-medium">
                          ¥{(campaign.budget / 1000).toFixed(0)}k
                          <span className="text-gray-500 ml-2">
                            (消化: ¥{(campaign.actualCost / 1000).toFixed(0)}k)
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-600">期間</dt>
                        <dd className="text-sm font-medium">
                          {new Date(campaign.startDate).toLocaleDateString(
                            'ja-JP',
                          )}{' '}
                          〜{' '}
                          {new Date(campaign.endDate).toLocaleDateString(
                            'ja-JP',
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">成果サマリー</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            見積依頼獲得数
                          </span>
                          <span className="font-medium">
                            {campaign.metrics.converted}件
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            獲得単価（CPA）
                          </span>
                          <span className="font-medium">
                            ¥{(costPerAcquisition / 1000).toFixed(0)}k
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            売上貢献額
                          </span>
                          <span className="font-medium">
                            ¥{(campaign.metrics.revenue / 1000000).toFixed(1)}M
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            投資対効果（ROI）
                          </span>
                          <span className="font-medium text-green-600">
                            {campaign.metrics.roi}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 工事種別の成果 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    工事種別ごとの成果
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-600">外壁塗装</p>
                      <p className="text-2xl font-bold">8件</p>
                      <p className="text-xs text-gray-500">平均単価: ¥2.5M</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-600">屋根工事</p>
                      <p className="text-2xl font-bold">3件</p>
                      <p className="text-xs text-gray-500">平均単価: ¥1.8M</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-600">リフォーム</p>
                      <p className="text-2xl font-bold">1件</p>
                      <p className="text-xs text-gray-500">平均単価: ¥5.2M</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-600">その他</p>
                      <p className="text-2xl font-bold">0件</p>
                      <p className="text-xs text-gray-500">-</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* パフォーマンスタブ */}
            {activeTab === 'performance' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  パフォーマンス分析
                </h3>
                <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                  <p className="text-gray-500">グラフ表示エリア（実装予定）</p>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-3">日別パフォーマンス</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            日付
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                            配信
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                            開封
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                            クリック
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                            CV
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[1, 2, 3].map((day) => (
                          <tr key={day} className="border-t">
                            <td className="px-4 py-2 text-sm">
                              2024/03/{day.toString().padStart(2, '0')}
                            </td>
                            <td className="px-4 py-2 text-sm text-right">
                              150
                            </td>
                            <td className="px-4 py-2 text-sm text-right">67</td>
                            <td className="px-4 py-2 text-sm text-right">29</td>
                            <td className="px-4 py-2 text-sm text-right font-medium">
                              4
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* オーディエンスタブ */}
            {activeTab === 'audience' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  オーディエンス分析
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">セグメント別反応率</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm">
                          築10年以上の戸建て所有者
                        </span>
                        <div className="text-right">
                          <p className="font-medium">23.5%</p>
                          <p className="text-xs text-gray-500">CV率</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm">シニア世代（60歳以上）</span>
                        <div className="text-right">
                          <p className="font-medium">18.2%</p>
                          <p className="text-xs text-gray-500">CV率</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm">過去施工済み顧客</span>
                        <div className="text-right">
                          <p className="font-medium">31.7%</p>
                          <p className="text-xs text-gray-500">CV率</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">エリア別反応</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm">東京23区</span>
                        <div className="text-right">
                          <p className="font-medium">156件</p>
                          <p className="text-xs text-gray-500">開封数</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm">横浜市</span>
                        <div className="text-right">
                          <p className="font-medium">87件</p>
                          <p className="text-xs text-gray-500">開封数</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm">さいたま市</span>
                        <div className="text-right">
                          <p className="font-medium">45件</p>
                          <p className="text-xs text-gray-500">開封数</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* コンテンツタブ */}
            {activeTab === 'content' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">配信コンテンツ</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">件名</p>
                    <p className="font-medium">{campaign.content.subject}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">本文</p>
                    <div className="bg-white border rounded p-4">
                      <p className="whitespace-pre-wrap text-sm">
                        {campaign.content.body}
                      </p>
                    </div>
                  </div>
                  {campaign.content.ctaText && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">CTA</p>
                      <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg">
                        {campaign.content.ctaText}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* スケジュールタブ */}
            {activeTab === 'schedule' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">配信スケジュール</h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">キャンペーン開始</p>
                        <p className="text-sm text-gray-600">
                          {new Date(campaign.startDate).toLocaleString('ja-JP')}
                        </p>
                      </div>
                      <span className="text-green-600">✓ 完了</span>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">第1回配信</p>
                        <p className="text-sm text-gray-600">
                          2024/03/01 10:00
                        </p>
                      </div>
                      <span className="text-green-600">✓ 完了</span>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">リマインド配信</p>
                        <p className="text-sm text-gray-600">
                          2024/03/15 10:00
                        </p>
                      </div>
                      <span className="text-blue-600">予定</span>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">キャンペーン終了</p>
                        <p className="text-sm text-gray-600">
                          {new Date(campaign.endDate).toLocaleString('ja-JP')}
                        </p>
                      </div>
                      <span className="text-gray-400">-</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
