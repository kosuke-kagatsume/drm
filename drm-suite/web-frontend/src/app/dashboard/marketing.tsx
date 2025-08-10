'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface MarketingDashboardProps {
  userEmail: string;
}

interface Campaign {
  id: string;
  name: string;
  type: 'web' | 'seo' | 'ppc' | 'social' | 'email';
  status: 'active' | 'scheduled' | 'completed' | 'paused';
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  leads: number;
  conversion: number;
  roi: number;
}

interface LeadSource {
  source: string;
  count: number;
  quality: number;
  conversion: number;
  trend: 'up' | 'down' | 'stable';
}

interface WebMetrics {
  visitors: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: string;
  conversionRate: number;
}

export default function MarketingDashboard({
  userEmail,
}: MarketingDashboardProps) {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<
    'day' | 'week' | 'month'
  >('week');

  const campaigns: Campaign[] = [
    {
      id: 'C001',
      name: '外壁塗装キャンペーン2024',
      type: 'ppc',
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-03-31',
      budget: 500000,
      spent: 320000,
      leads: 145,
      conversion: 12.5,
      roi: 320,
    },
    {
      id: 'C002',
      name: 'SEO対策 - 地域最適化',
      type: 'seo',
      status: 'active',
      startDate: '2024-01-15',
      endDate: '2024-12-31',
      budget: 200000,
      spent: 45000,
      leads: 89,
      conversion: 8.2,
      roi: 580,
    },
    {
      id: 'C003',
      name: 'Instagram広告',
      type: 'social',
      status: 'paused',
      startDate: '2024-01-10',
      endDate: '2024-02-10',
      budget: 150000,
      spent: 120000,
      leads: 67,
      conversion: 5.5,
      roi: 180,
    },
    {
      id: 'C004',
      name: 'メールマーケティング',
      type: 'email',
      status: 'scheduled',
      startDate: '2024-02-15',
      endDate: '2024-03-15',
      budget: 50000,
      spent: 0,
      leads: 0,
      conversion: 0,
      roi: 0,
    },
  ];

  const leadSources: LeadSource[] = [
    {
      source: 'Google広告',
      count: 145,
      quality: 4.2,
      conversion: 12.5,
      trend: 'up',
    },
    {
      source: 'オーガニック検索',
      count: 89,
      quality: 4.5,
      conversion: 15.2,
      trend: 'up',
    },
    {
      source: 'SNS',
      count: 67,
      quality: 3.8,
      conversion: 8.5,
      trend: 'stable',
    },
    {
      source: '紹介',
      count: 45,
      quality: 4.8,
      conversion: 35.5,
      trend: 'up',
    },
    {
      source: 'ダイレクト',
      count: 32,
      quality: 4.0,
      conversion: 10.2,
      trend: 'down',
    },
  ];

  const webMetrics: WebMetrics = {
    visitors: 12450,
    pageViews: 45230,
    bounceRate: 42.5,
    avgSessionDuration: '3:24',
    conversionRate: 2.8,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'web':
        return '🌐';
      case 'seo':
        return '🔍';
      case 'ppc':
        return '💰';
      case 'social':
        return '📱';
      case 'email':
        return '📧';
      default:
        return '📊';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '→';
    }
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            📊 マーケティングダッシュボード
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedPeriod('day')}
              className={`px-4 py-2 rounded ${selectedPeriod === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              日次
            </button>
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`px-4 py-2 rounded ${selectedPeriod === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              週次
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-4 py-2 rounded ${selectedPeriod === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              月次
            </button>
            <button
              onClick={() => router.push('/map')}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              🗺️ 地図分析
            </button>
          </div>
        </div>
      </div>

      {/* Web Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">🌐 Webサイト分析</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div>
            <p className="text-sm text-gray-600">訪問者数</p>
            <p className="text-3xl font-bold text-blue-600">
              {webMetrics.visitors.toLocaleString()}
            </p>
            <p className="text-xs text-green-600">+15.2%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">ページビュー</p>
            <p className="text-3xl font-bold text-purple-600">
              {webMetrics.pageViews.toLocaleString()}
            </p>
            <p className="text-xs text-green-600">+8.5%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">直帰率</p>
            <p className="text-3xl font-bold text-orange-600">
              {webMetrics.bounceRate}%
            </p>
            <p className="text-xs text-green-600">-2.3%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">平均滞在時間</p>
            <p className="text-3xl font-bold text-green-600">
              {webMetrics.avgSessionDuration}
            </p>
            <p className="text-xs text-green-600">+0:24</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded">
            <p className="text-sm text-yellow-800 font-medium">CV率</p>
            <p className="text-3xl font-bold text-yellow-600">
              {webMetrics.conversionRate}%
            </p>
            <p className="text-xs text-green-600">+0.3%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Campaigns */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b bg-blue-50">
              <h2 className="text-lg font-semibold text-blue-800">
                🚀 実施中キャンペーン
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="border rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">
                          {getTypeIcon(campaign.type)}
                        </span>
                        <h4 className="font-medium text-gray-900">
                          {campaign.name}
                        </h4>
                        <span
                          className={`ml-3 px-2 py-1 rounded text-xs font-medium ${getStatusColor(campaign.status)}`}
                        >
                          {campaign.status === 'active'
                            ? '実施中'
                            : campaign.status === 'scheduled'
                              ? '予定'
                              : campaign.status === 'completed'
                                ? '完了'
                                : '一時停止'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">予算消化</p>
                          <p className="font-bold">
                            ¥{campaign.spent.toLocaleString()} / ¥
                            {campaign.budget.toLocaleString()}
                          </p>
                          <div className="mt-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${(campaign.spent / campaign.budget) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-600">獲得リード</p>
                          <p className="font-bold text-green-600">
                            {campaign.leads}件
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">コンバージョン率</p>
                          <p className="font-bold">{campaign.conversion}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">ROI</p>
                          <p
                            className={`font-bold ${campaign.roi >= 200 ? 'text-green-600' : 'text-orange-600'}`}
                          >
                            {campaign.roi}%
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        期間: {campaign.startDate} 〜 {campaign.endDate}
                      </p>
                    </div>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                      詳細
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lead Sources */}
          <div className="bg-white rounded-lg shadow mt-6">
            <div className="px-6 py-4 border-b bg-green-50">
              <h2 className="text-lg font-semibold text-green-800">
                📈 リード獲得ソース
              </h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        ソース
                      </th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                        リード数
                      </th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                        品質
                      </th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                        CV率
                      </th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                        トレンド
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leadSources.map((source, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="px-4 py-3 font-medium">
                          {source.source}
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-blue-600">
                          {source.count}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center">
                            {'⭐'.repeat(Math.floor(source.quality))}
                            <span className="ml-1 text-sm text-gray-600">
                              ({source.quality})
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`font-bold ${source.conversion >= 15 ? 'text-green-600' : 'text-gray-600'}`}
                          >
                            {source.conversion}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-lg">
                          <span
                            className={
                              source.trend === 'up'
                                ? 'text-green-600'
                                : source.trend === 'down'
                                  ? 'text-red-600'
                                  : 'text-gray-600'
                            }
                          >
                            {getTrendIcon(source.trend)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Today's Tasks */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b bg-orange-50">
              <h3 className="font-semibold text-orange-800">📋 本日のタスク</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start space-x-2">
                <input type="checkbox" className="mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Google広告レポート作成</p>
                  <p className="text-xs text-gray-500">10:00まで</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <input type="checkbox" className="mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium">SEOキーワード分析</p>
                  <p className="text-xs text-gray-500">14:00まで</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <input type="checkbox" className="mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium">SNS投稿スケジュール</p>
                  <p className="text-xs text-gray-500">17:00まで</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold">⚡ クイック統計</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">今月のリード</span>
                <span className="font-bold text-blue-600">378件</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">商談化率</span>
                <span className="font-bold text-green-600">24.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">成約率</span>
                <span className="font-bold text-purple-600">12.3%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">CPA</span>
                <span className="font-bold">¥8,450</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">LTV</span>
                <span className="font-bold text-orange-600">¥2.8M</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold">🚀 クイックアクション</h3>
            </div>
            <div className="p-4 space-y-2">
              <button
                onClick={() => router.push('/map')}
                className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
              >
                🗺️ 地図分析を開く
              </button>
              <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                📊 レポート作成
              </button>
              <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                🚀 新規キャンペーン
              </button>
              <button className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700">
                📈 アナリティクス
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
