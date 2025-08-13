'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AnalyticsData {
  period: 'week' | 'month' | 'quarter' | 'year';
  metrics: {
    leads: {
      total: number;
      qualified: number;
      converted: number;
      conversionRate: number;
      trend: number;
    };
    campaigns: {
      active: number;
      completed: number;
      totalBudget: number;
      totalSpent: number;
      averageROI: number;
    };
    channels: {
      name: string;
      leads: number;
      cost: number;
      cpl: number; // Cost Per Lead
      conversionRate: number;
      roi: number;
    }[];
    demographics: {
      ageGroups: { range: string; percentage: number }[];
      locations: { name: string; percentage: number }[];
      interests: { name: string; count: number }[];
    };
    performance: {
      bestPerformingCampaign: string;
      bestPerformingChannel: string;
      peakHours: string[];
      peakDays: string[];
    };
  };
}

export default function MarketingAnalyticsPage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<
    'week' | 'month' | 'quarter' | 'year'
  >('month');
  const [selectedView, setSelectedView] = useState<
    'overview' | 'channels' | 'campaigns' | 'demographics'
  >('overview');

  // モックデータ
  const analyticsData: AnalyticsData = {
    period: selectedPeriod,
    metrics: {
      leads: {
        total: 1247,
        qualified: 892,
        converted: 156,
        conversionRate: 12.5,
        trend: 18.3,
      },
      campaigns: {
        active: 8,
        completed: 24,
        totalBudget: 2500000,
        totalSpent: 1840000,
        averageROI: 285,
      },
      channels: [
        {
          name: 'Google広告',
          leads: 456,
          cost: 680000,
          cpl: 1491,
          conversionRate: 15.2,
          roi: 320,
        },
        {
          name: 'Facebook広告',
          leads: 234,
          cost: 420000,
          cpl: 1795,
          conversionRate: 8.9,
          roi: 180,
        },
        {
          name: 'SEO',
          leads: 198,
          cost: 150000,
          cpl: 758,
          conversionRate: 22.1,
          roi: 580,
        },
        {
          name: 'LINE広告',
          leads: 187,
          cost: 280000,
          cpl: 1497,
          conversionRate: 11.2,
          roi: 245,
        },
        {
          name: 'DM郵送',
          leads: 132,
          cost: 240000,
          cpl: 1818,
          conversionRate: 6.8,
          roi: 120,
        },
        {
          name: 'イベント',
          leads: 40,
          cost: 70000,
          cpl: 1750,
          conversionRate: 35.0,
          roi: 450,
        },
      ],
      demographics: {
        ageGroups: [
          { range: '25-34', percentage: 28 },
          { range: '35-44', percentage: 35 },
          { range: '45-54', percentage: 22 },
          { range: '55-64', percentage: 12 },
          { range: '65+', percentage: 3 },
        ],
        locations: [
          { name: '東京都', percentage: 24 },
          { name: '大阪府', percentage: 18 },
          { name: '愛知県', percentage: 12 },
          { name: '福岡県', percentage: 8 },
          { name: '神奈川県', percentage: 15 },
          { name: 'その他', percentage: 23 },
        ],
        interests: [
          { name: '外壁塗装', count: 456 },
          { name: 'リフォーム', count: 332 },
          { name: '屋根工事', count: 245 },
          { name: 'バリアフリー', count: 189 },
          { name: '増築', count: 87 },
        ],
      },
      performance: {
        bestPerformingCampaign: '春の外壁塗装キャンペーン',
        bestPerformingChannel: 'SEO',
        peakHours: ['10:00-11:00', '14:00-15:00', '19:00-20:00'],
        peakDays: ['火曜日', '水曜日', '土曜日'],
      },
    },
  };

  const getChannelIcon = (channelName: string) => {
    const icons: { [key: string]: string } = {
      Google広告: '🔍',
      Facebook広告: '📘',
      SEO: '📊',
      LINE広告: '📱',
      DM郵送: '📮',
      イベント: '🎪',
    };
    return icons[channelName] || '📊';
  };

  const formatCurrency = (amount: number) => {
    return `¥${(amount / 1000).toFixed(0)}K`;
  };

  const exportReport = () => {
    const reportData = {
      period: selectedPeriod,
      generatedAt: new Date().toISOString(),
      ...analyticsData.metrics,
    };

    // CSV形式でエクスポートのシミュレーション
    console.log('Exporting report:', reportData);
    alert(`${selectedPeriod}の詳細レポートをエクスポートしています...`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-white/80 hover:text-white"
              >
                ← ダッシュボードに戻る
              </button>
              <div>
                <h1 className="text-3xl font-bold">
                  📈 マーケティング詳細分析
                </h1>
                <p className="text-purple-100 mt-1">
                  包括的なマーケティングパフォーマンス分析
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white"
              >
                <option value="week">週次</option>
                <option value="month">月次</option>
                <option value="quarter">四半期</option>
                <option value="year">年次</option>
              </select>
              <button
                onClick={exportReport}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
              >
                📊 レポート出力
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ナビゲーションタブ */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b">
            <div className="flex">
              {[
                { key: 'overview', label: '概要', icon: '📊' },
                { key: 'channels', label: 'チャネル分析', icon: '📈' },
                { key: 'campaigns', label: 'キャンペーン', icon: '🚀' },
                { key: 'demographics', label: '顧客属性', icon: '👥' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedView(tab.key as any)}
                  className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 ${
                    selectedView === tab.key
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 概要ビュー */}
        {selectedView === 'overview' && (
          <div className="space-y-6">
            {/* KPI カード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">総リード数</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {analyticsData.metrics.leads.total.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      +{analyticsData.metrics.leads.trend}%
                    </p>
                  </div>
                  <span className="text-4xl">🎯</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">成約率</p>
                    <p className="text-3xl font-bold text-green-600">
                      {analyticsData.metrics.leads.conversionRate}%
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {analyticsData.metrics.leads.converted}件成約
                    </p>
                  </div>
                  <span className="text-4xl">💰</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">平均ROI</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {analyticsData.metrics.campaigns.averageROI}%
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {analyticsData.metrics.campaigns.active}個のキャンペーン
                    </p>
                  </div>
                  <span className="text-4xl">📊</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">予算消化率</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {Math.round(
                        (analyticsData.metrics.campaigns.totalSpent /
                          analyticsData.metrics.campaigns.totalBudget) *
                          100,
                      )}
                      %
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatCurrency(
                        analyticsData.metrics.campaigns.totalSpent,
                      )}{' '}
                      /{' '}
                      {formatCurrency(
                        analyticsData.metrics.campaigns.totalBudget,
                      )}
                    </p>
                  </div>
                  <span className="text-4xl">💳</span>
                </div>
              </div>
            </div>

            {/* パフォーマンス概要 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold">
                    🏆 トップパフォーマンス
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      最高ROIチャネル
                    </span>
                    <span className="font-bold text-green-600">
                      {analyticsData.metrics.performance.bestPerformingChannel}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      最優秀キャンペーン
                    </span>
                    <span className="font-bold">
                      {analyticsData.metrics.performance.bestPerformingCampaign}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">ピーク時間帯</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {analyticsData.metrics.performance.peakHours.map(
                        (hour, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                          >
                            {hour}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">ピーク曜日</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {analyticsData.metrics.performance.peakDays.map(
                        (day, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded"
                          >
                            {day}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold">📍 地域別分析</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {analyticsData.metrics.demographics.locations.map(
                      (location, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm">{location.name}</span>
                          <div className="flex items-center space-x-3">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${location.percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-8">
                              {location.percentage}%
                            </span>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* チャネル分析ビュー */}
        {selectedView === 'channels' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">📈 チャネル別詳細分析</h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                        チャネル
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">
                        リード数
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">
                        費用
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">
                        CPL
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">
                        成約率
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">
                        ROI
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.metrics.channels
                      .sort((a, b) => b.roi - a.roi)
                      .map((channel, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">
                                {getChannelIcon(channel.name)}
                              </span>
                              <span className="font-medium">
                                {channel.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-blue-600">
                            {channel.leads}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {formatCurrency(channel.cost)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            ¥{channel.cpl.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`font-bold ${
                                channel.conversionRate >= 15
                                  ? 'text-green-600'
                                  : channel.conversionRate >= 10
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                              }`}
                            >
                              {channel.conversionRate}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`font-bold ${
                                channel.roi >= 300
                                  ? 'text-green-600'
                                  : channel.roi >= 200
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                              }`}
                            >
                              {channel.roi}%
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 顧客属性ビュー */}
        {selectedView === 'demographics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">👥 年齢層別分布</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {analyticsData.metrics.demographics.ageGroups.map(
                    (age, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium">
                          {age.range}歳
                        </span>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-purple-500 h-3 rounded-full"
                              style={{
                                width: `${(age.percentage / 35) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-bold w-10">
                            {age.percentage}%
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">🏗️ 関心領域別</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {analyticsData.metrics.demographics.interests.map(
                    (interest, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium">
                          {interest.name}
                        </span>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full"
                              style={{
                                width: `${(interest.count / 456) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-bold w-12">
                            {interest.count}件
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
