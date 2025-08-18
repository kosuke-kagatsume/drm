'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface MarketingDashboardProps {
  userEmail: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  type: 'newsletter' | 'promotion' | 'follow-up';
  openRate: number;
  clickRate: number;
  lastUsed: string;
}

interface SocialPost {
  id: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  content: string;
  scheduledDate: string;
  status: 'scheduled' | 'published' | 'draft';
  engagement: number;
}

interface ABTest {
  id: string;
  name: string;
  variantA: { name: string; conversion: number; visitors: number };
  variantB: { name: string; conversion: number; visitors: number };
  winner: 'A' | 'B' | 'inconclusive';
  confidenceLevel: number;
  status: 'running' | 'completed';
}

interface LandingPageMetrics {
  pageUrl: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  bounceRate: number;
  avgTimeOnPage: string;
  topSources: string[];
}

interface CustomerJourney {
  stage: string;
  count: number;
  conversionRate: number;
  avgTimeInStage: string;
  dropOffRate: number;
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
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showABModal, setShowABModal] = useState(false);

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

  const emailTemplates: EmailTemplate[] = [
    {
      id: 'ET001',
      name: '外壁塗装プロモーション',
      subject: '春の外壁塗装キャンペーン開始！',
      type: 'promotion',
      openRate: 28.5,
      clickRate: 4.2,
      lastUsed: '2024-01-15',
    },
    {
      id: 'ET002',
      name: 'フォローアップメール',
      subject: 'お見積もりのご確認はいかがですか？',
      type: 'follow-up',
      openRate: 35.8,
      clickRate: 8.1,
      lastUsed: '2024-01-20',
    },
    {
      id: 'ET003',
      name: '月次ニュースレター',
      subject: '今月の施工事例をご紹介',
      type: 'newsletter',
      openRate: 22.3,
      clickRate: 3.5,
      lastUsed: '2024-01-10',
    },
  ];

  const socialPosts: SocialPost[] = [
    {
      id: 'SP001',
      platform: 'instagram',
      content:
        '本日完成した外壁塗装の現場写真です。お客様にも大変満足いただけました！',
      scheduledDate: '2024-02-15 10:00',
      status: 'scheduled',
      engagement: 0,
    },
    {
      id: 'SP002',
      platform: 'facebook',
      content: '春の塗装キャンペーン実施中！詳細はWebサイトをご覧ください。',
      scheduledDate: '2024-02-14 09:00',
      status: 'published',
      engagement: 145,
    },
  ];

  const abTests: ABTest[] = [
    {
      id: 'ABT001',
      name: 'ランディングページヘッダー',
      variantA: { name: '従来デザイン', conversion: 2.8, visitors: 1250 },
      variantB: { name: '新デザイン', conversion: 3.4, visitors: 1280 },
      winner: 'B',
      confidenceLevel: 95,
      status: 'completed',
    },
    {
      id: 'ABT002',
      name: 'CTAボタンテキスト',
      variantA: { name: 'お見積もり依頼', conversion: 4.1, visitors: 980 },
      variantB: { name: '無料見積もり', conversion: 4.6, visitors: 1020 },
      winner: 'inconclusive',
      confidenceLevel: 87,
      status: 'running',
    },
  ];

  const landingPageMetrics: LandingPageMetrics[] = [
    {
      pageUrl: '/landing/exterior-painting',
      visitors: 2450,
      conversions: 89,
      conversionRate: 3.6,
      bounceRate: 38.2,
      avgTimeOnPage: '2:45',
      topSources: ['Google広告', 'Facebook広告', 'オーガニック検索'],
    },
    {
      pageUrl: '/landing/roof-repair',
      visitors: 1820,
      conversions: 56,
      conversionRate: 3.1,
      bounceRate: 42.1,
      avgTimeOnPage: '2:12',
      topSources: ['Google広告', 'ダイレクト'],
    },
  ];

  const customerJourney: CustomerJourney[] = [
    {
      stage: '認知',
      count: 5420,
      conversionRate: 18.5,
      avgTimeInStage: '3日',
      dropOffRate: 81.5,
    },
    {
      stage: '興味',
      count: 1003,
      conversionRate: 35.2,
      avgTimeInStage: '5日',
      dropOffRate: 64.8,
    },
    {
      stage: '検討',
      count: 353,
      conversionRate: 42.5,
      avgTimeInStage: '8日',
      dropOffRate: 57.5,
    },
    {
      stage: '購入意向',
      count: 150,
      conversionRate: 68.7,
      avgTimeInStage: '12日',
      dropOffRate: 31.3,
    },
    {
      stage: '成約',
      count: 103,
      conversionRate: 100,
      avgTimeInStage: '-',
      dropOffRate: 0,
    },
  ];

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

  const handleCampaignCreate = () => {
    setEditingCampaign(null);
    setShowCampaignForm(true);
  };

  const handleCampaignEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setShowCampaignForm(true);
  };

  const handleExport = (type: string) => {
    if (type === 'campaign-report') {
      // キャンペーンレポートの詳細データを生成
      const reportData = {
        reportType: 'campaign-performance',
        period: selectedPeriod,
        generatedAt: new Date().toISOString(),
        campaigns: campaigns.map((campaign) => ({
          id: campaign.id,
          name: campaign.name,
          type: campaign.type,
          status: campaign.status,
          budget: campaign.budget,
          spent: campaign.spent,
          leads: campaign.leads,
          conversion: campaign.conversion,
          roi: campaign.roi,
          period: `${campaign.startDate} - ${campaign.endDate}`,
        })),
        summary: {
          totalCampaigns: campaigns.length,
          totalBudget: campaigns.reduce((sum, c) => sum + c.budget, 0),
          totalSpent: campaigns.reduce((sum, c) => sum + c.spent, 0),
          totalLeads: campaigns.reduce((sum, c) => sum + c.leads, 0),
          averageROI:
            campaigns.reduce((sum, c) => sum + c.roi, 0) / campaigns.length,
        },
      };

      // CSVフォーマットでエクスポート
      const csvHeaders = [
        'キャンペーン名',
        'タイプ',
        'ステータス',
        '予算',
        '消化額',
        'リード数',
        '成約率',
        'ROI',
        '期間',
      ];
      const csvData = campaigns.map((campaign) => [
        campaign.name,
        campaign.type,
        campaign.status,
        campaign.budget,
        campaign.spent,
        campaign.leads,
        campaign.conversion + '%',
        campaign.roi + '%',
        `${campaign.startDate} - ${campaign.endDate}`,
      ]);

      const csvContent = [csvHeaders, ...csvData]
        .map((row) => row.join(','))
        .join('\n');

      // ダウンロードリンクを作成
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `campaign-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`,
      );
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert('キャンペーンレポートをダウンロードしました！');
    } else {
      // その他のレポート
      alert(`${type}レポートをエクスポートしています...`);
    }
  };

  const handleMetricClick = (metric: string) => {
    setActiveModal(metric);
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      selectedFilter === 'all' || campaign.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            📊 マーケティングダッシュボード
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => router.push('/campaigns')}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              📋 キャンペーン一覧
            </button>
            <button
              onClick={() => router.push('/campaigns/new')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              ➕ 新規キャンペーン
            </button>
            <button
              onClick={() => handleExport('marketing')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              📊 エクスポート
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
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

          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="キャンペーン検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全てのステータス</option>
              <option value="active">実施中</option>
              <option value="scheduled">予定</option>
              <option value="paused">一時停止</option>
              <option value="completed">完了</option>
            </select>
          </div>
        </div>
      </div>

      {/* Web Metrics - Now Clickable */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">🌐 Webサイト分析</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div
            className="cursor-pointer hover:bg-gray-50 p-3 rounded transition"
            onClick={() => handleMetricClick('visitors')}
          >
            <p className="text-sm text-gray-600">訪問者数</p>
            <p className="text-3xl font-bold text-blue-600">
              {webMetrics.visitors.toLocaleString()}
            </p>
            <p className="text-xs text-green-600">+15.2%</p>
          </div>
          <div
            className="cursor-pointer hover:bg-gray-50 p-3 rounded transition"
            onClick={() => handleMetricClick('pageviews')}
          >
            <p className="text-sm text-gray-600">ページビュー</p>
            <p className="text-3xl font-bold text-purple-600">
              {webMetrics.pageViews.toLocaleString()}
            </p>
            <p className="text-xs text-green-600">+8.5%</p>
          </div>
          <div
            className="cursor-pointer hover:bg-gray-50 p-3 rounded transition"
            onClick={() => handleMetricClick('bounce')}
          >
            <p className="text-sm text-gray-600">直帰率</p>
            <p className="text-3xl font-bold text-orange-600">
              {webMetrics.bounceRate}%
            </p>
            <p className="text-xs text-green-600">-2.3%</p>
          </div>
          <div
            className="cursor-pointer hover:bg-gray-50 p-3 rounded transition"
            onClick={() => handleMetricClick('duration')}
          >
            <p className="text-sm text-gray-600">平均滞在時間</p>
            <p className="text-3xl font-bold text-green-600">
              {webMetrics.avgSessionDuration}
            </p>
            <p className="text-xs text-green-600">+0:24</p>
          </div>
          <div
            className="bg-yellow-50 p-3 rounded cursor-pointer hover:bg-yellow-100 transition"
            onClick={() => handleMetricClick('conversion')}
          >
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
              {filteredCampaigns.map((campaign) => (
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
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCampaignEdit(campaign)}
                        className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
                      >
                        編集
                      </button>
                      <button
                        onClick={() =>
                          handleMetricClick(`campaign-${campaign.id}`)
                        }
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        詳細
                      </button>
                    </div>
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

          {/* 統合財務分析ダッシュボード */}
          <div className="bg-white rounded-2xl shadow-lg mt-6 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <h3 className="font-semibold">📊 マーケティング投資分析</h3>
            </div>
            <div className="p-6">
              {/* マーケティング指標 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-bold text-green-800 mb-2">💰 投資効果</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>マーケティングROI</span>
                      <span className="font-bold">420%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>顧客獲得単価</span>
                      <span className="font-bold">¥8,450</span>
                    </div>
                    <div className="flex justify-between">
                      <span>顧客生涯価値</span>
                      <span className="font-bold">¥2.8M</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-bold text-blue-800 mb-2">📈 成長指標</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>リード成長率</span>
                      <span className="font-bold text-green-600">+24.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CV率改善</span>
                      <span className="font-bold text-green-600">+18.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ブランド認知度</span>
                      <span className="font-bold">32.8%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 予算配分と実績 */}
              <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                <h5 className="font-bold text-yellow-800 mb-2">
                  💳 予算配分と実績
                </h5>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>デジタル広告</span>
                      <span>¥485K / ¥500K</span>
                    </div>
                    <div className="w-full bg-yellow-200 rounded-full h-2">
                      <div
                        className="bg-yellow-600 h-2 rounded-full"
                        style={{ width: '97%' }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>コンテンツ制作</span>
                      <span>¥165K / ¥200K</span>
                    </div>
                    <div className="w-full bg-yellow-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: '82.5%' }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>イベント・PR</span>
                      <span>¥78K / ¥150K</span>
                    </div>
                    <div className="w-full bg-yellow-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: '52%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* チャネル別ROI */}
              <div className="bg-purple-50 p-4 rounded-lg mb-4">
                <h5 className="font-bold text-purple-800 mb-2">
                  🎯 チャネル別ROI
                </h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span>Google広告</span>
                    <span className="font-bold text-green-600">320%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SEO</span>
                    <span className="font-bold text-green-600">580%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SNS広告</span>
                    <span className="font-bold text-orange-600">180%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>メール</span>
                    <span className="font-bold text-blue-600">245%</span>
                  </div>
                </div>
              </div>

              {/* クイックアクセス */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => router.push('/expenses')}
                  className="p-3 bg-red-50 rounded-lg hover:bg-red-100 transition text-center"
                >
                  <div className="text-xl mb-1">💳</div>
                  <div className="text-xs font-medium">広告費用</div>
                </button>
                <button
                  onClick={() => handleExport('roi-analysis')}
                  className="p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition text-center"
                >
                  <div className="text-xl mb-1">📊</div>
                  <div className="text-xs font-medium">ROI分析</div>
                </button>
                <button
                  onClick={() => setActiveModal('budget-allocation')}
                  className="p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition text-center"
                >
                  <div className="text-xl mb-1">💡</div>
                  <div className="text-xs font-medium">予算配分</div>
                </button>
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

          {/* Email Templates */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b bg-purple-50">
              <h3 className="font-semibold text-purple-800">
                📧 メールテンプレート
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {emailTemplates.slice(0, 3).map((template) => (
                <div
                  key={template.id}
                  className="border rounded p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-sm">{template.name}</h5>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        template.type === 'promotion'
                          ? 'bg-red-100 text-red-800'
                          : template.type === 'follow-up'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {template.type === 'promotion'
                        ? 'プロモ'
                        : template.type === 'follow-up'
                          ? 'フォロー'
                          : 'ニュース'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    {template.subject}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      開封率:{' '}
                      <span className="font-bold text-green-600">
                        {template.openRate}%
                      </span>
                    </div>
                    <div>
                      クリック率:{' '}
                      <span className="font-bold text-blue-600">
                        {template.clickRate}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setShowEmailModal(true)}
                className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 text-sm"
              >
                📧 テンプレート管理
              </button>
            </div>
          </div>

          {/* Social Media Scheduler */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b bg-pink-50">
              <h3 className="font-semibold text-pink-800">
                📱 SNS投稿スケジュール
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {socialPosts.map((post) => (
                <div
                  key={post.id}
                  className="border rounded p-3 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">
                        {post.platform === 'instagram'
                          ? '📷'
                          : post.platform === 'facebook'
                            ? '📘'
                            : post.platform === 'twitter'
                              ? '🐦'
                              : '💼'}
                      </span>
                      <span className="text-sm font-medium capitalize">
                        {post.platform}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        post.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : post.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {post.status === 'published'
                        ? '投稿済み'
                        : post.status === 'scheduled'
                          ? '予定'
                          : '下書き'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    {post.content.slice(0, 60)}...
                  </p>
                  <div className="flex justify-between text-xs">
                    <span>{post.scheduledDate}</span>
                    {post.status === 'published' && (
                      <span className="text-blue-600">
                        エンゲージ: {post.engagement}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <button
                onClick={() => setShowSocialModal(true)}
                className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 text-sm"
              >
                📅 投稿スケジュール
              </button>
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
              <button
                onClick={() => setShowLeadModal(true)}
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
              >
                📝 リード獲得フォーム作成
              </button>
              <button
                onClick={() => handleExport('campaign-report')}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                📊 キャンペーンレポート
              </button>
              <button
                onClick={() => router.push('/marketing/analytics')}
                className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700"
              >
                📈 詳細アナリティクス
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* New Marketing Features Sections */}

      {/* Landing Page Analytics */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b bg-indigo-50">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-indigo-800">
              🏠 ランディングページ分析
            </h2>
            <button
              onClick={() => setActiveModal('landing-analytics')}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              詳細を見る →
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {landingPageMetrics.map((page, idx) => (
              <div
                key={idx}
                className="border rounded-lg p-4 hover:shadow-md cursor-pointer transition"
                onClick={() => handleMetricClick(`landing-${idx}`)}
              >
                <h4 className="font-medium mb-3">{page.pageUrl}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">訪問者</p>
                    <p className="font-bold text-blue-600">
                      {page.visitors.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">コンバージョン</p>
                    <p className="font-bold text-green-600">
                      {page.conversions}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">CV率</p>
                    <p className="font-bold text-purple-600">
                      {page.conversionRate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">直帰率</p>
                    <p className="font-bold text-orange-600">
                      {page.bounceRate}%
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-gray-600 mb-1">
                    主要トラフィック:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {page.topSources.slice(0, 3).map((source, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-100 text-xs rounded"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* A/B Testing Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b bg-yellow-50">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-yellow-800">
                🧪 A/Bテスト結果
              </h2>
              <button
                onClick={() => setShowABModal(true)}
                className="text-sm text-yellow-600 hover:text-yellow-800"
              >
                全て見る →
              </button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {abTests.map((test) => (
              <div
                key={test.id}
                className="border rounded-lg p-4 hover:shadow-md cursor-pointer transition"
                onClick={() => handleMetricClick(`ab-test-${test.id}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium">{test.name}</h4>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      test.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {test.status === 'completed' ? '完了' : '実行中'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600 mb-1">
                      バリアントA: {test.variantA.name}
                    </p>
                    <p className="font-bold text-blue-600">
                      {test.variantA.conversion}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {test.variantA.visitors} visitors
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600 mb-1">
                      バリアントB: {test.variantB.name}
                    </p>
                    <p className="font-bold text-purple-600">
                      {test.variantB.conversion}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {test.variantB.visitors} visitors
                    </p>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span>
                    勝者:{' '}
                    <span className="font-bold">
                      {test.winner === 'A'
                        ? 'バリアントA'
                        : test.winner === 'B'
                          ? 'バリアントB'
                          : '結論なし'}
                    </span>
                  </span>
                  <span>
                    信頼度:{' '}
                    <span className="font-bold text-green-600">
                      {test.confidenceLevel}%
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Journey Tracking */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b bg-teal-50">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-teal-800">
                🛤️ カスタマージャーニー
              </h2>
              <button
                onClick={() => setActiveModal('customer-journey')}
                className="text-sm text-teal-600 hover:text-teal-800"
              >
                詳細分析 →
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {customerJourney.map((stage, idx) => (
                <div
                  key={idx}
                  className="cursor-pointer hover:bg-gray-50 p-3 rounded transition"
                  onClick={() => handleMetricClick(`journey-${idx}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{stage.stage}</h4>
                    <span className="text-sm font-bold text-blue-600">
                      {stage.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                    <div>
                      <span className="text-gray-600">CV率:</span>
                      <span className="font-bold text-green-600 ml-1">
                        {stage.conversionRate}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">平均滞在:</span>
                      <span className="font-bold ml-1">
                        {stage.avgTimeInStage}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">離脱率:</span>
                      <span className="font-bold text-red-600 ml-1">
                        {stage.dropOffRate}%
                      </span>
                    </div>
                  </div>
                  {/* Conversion funnel visualization */}
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stage.conversionRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Creation/Edit Modal */}
      {showCampaignForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingCampaign ? 'キャンペーン編集' : '新規キャンペーン作成'}
              </h3>
              <button
                onClick={() => setShowCampaignForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  キャンペーン名
                </label>
                <input
                  type="text"
                  defaultValue={editingCampaign?.name || ''}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    タイプ
                  </label>
                  <select
                    defaultValue={editingCampaign?.type || 'ppc'}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="web">Web広告</option>
                    <option value="seo">SEO</option>
                    <option value="ppc">PPC広告</option>
                    <option value="social">SNS広告</option>
                    <option value="email">メールマーケティング</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    ステータス
                  </label>
                  <select
                    defaultValue={editingCampaign?.status || 'draft'}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">下書き</option>
                    <option value="scheduled">予定</option>
                    <option value="active">実施中</option>
                    <option value="paused">一時停止</option>
                    <option value="completed">完了</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    開始日
                  </label>
                  <input
                    type="date"
                    defaultValue={editingCampaign?.startDate || ''}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    終了日
                  </label>
                  <input
                    type="date"
                    defaultValue={editingCampaign?.endDate || ''}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  予算 (¥)
                </label>
                <input
                  type="number"
                  defaultValue={editingCampaign?.budget || ''}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCampaignForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingCampaign ? '更新' : '作成'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Metric Detail Modals */}
      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {activeModal === 'visitors'
                  ? '訪問者詳細分析'
                  : activeModal === 'pageviews'
                    ? 'ページビュー詳細'
                    : activeModal === 'bounce'
                      ? '直帰率分析'
                      : activeModal === 'conversion'
                        ? 'コンバージョン詳細'
                        : activeModal === 'email-templates'
                          ? 'メールテンプレート管理'
                          : activeModal === 'social-scheduler'
                            ? 'SNS投稿スケジューラー'
                            : activeModal === 'lead-capture-builder'
                              ? 'リード獲得フォーム作成'
                              : activeModal === 'analytics'
                                ? '詳細アナリティクス'
                                : activeModal === 'budget-allocation'
                                  ? '予算配分最適化'
                                  : 'データ詳細'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {/* モーダル内容を種類によって切り替え */}
            {activeModal === 'visitors' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">新規訪問者</p>
                    <p className="text-2xl font-bold">8,245</p>
                    <p className="text-xs text-green-600">+12.3%</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">リピーター</p>
                    <p className="text-2xl font-bold">4,205</p>
                    <p className="text-xs text-green-600">+8.5%</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">平均滞在時間</p>
                    <p className="text-2xl font-bold">3:24</p>
                    <p className="text-xs text-green-600">+0:15</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">訪問者推移（過去7日間）</h4>
                  <div className="h-48 bg-gray-50 rounded-lg flex items-end justify-between p-4 gap-2">
                    {[65, 72, 68, 85, 78, 92, 88].map((value, idx) => (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center"
                      >
                        <div
                          className="w-full bg-blue-500 rounded-t"
                          style={{ height: `${value * 1.5}px` }}
                        />
                        <span className="text-xs mt-1">
                          {['月', '火', '水', '木', '金', '土', '日'][idx]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">トラフィックソース</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>オーガニック検索</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: '45%' }}
                          />
                        </div>
                        <span className="text-sm font-bold">45%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>Google広告</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: '30%' }}
                          />
                        </div>
                        <span className="text-sm font-bold">30%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>SNS</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: '15%' }}
                          />
                        </div>
                        <span className="text-sm font-bold">15%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>ダイレクト</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{ width: '10%' }}
                          />
                        </div>
                        <span className="text-sm font-bold">10%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'conversion' && (
              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">コンバージョンファネル</h4>
                  <div className="space-y-3">
                    <div className="relative">
                      <div
                        className="bg-blue-500 text-white p-3 rounded"
                        style={{ width: '100%' }}
                      >
                        <div className="flex justify-between">
                          <span>サイト訪問</span>
                          <span className="font-bold">12,450</span>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <div
                        className="bg-blue-400 text-white p-3 rounded"
                        style={{ width: '60%' }}
                      >
                        <div className="flex justify-between">
                          <span>フォーム表示</span>
                          <span className="font-bold">7,470</span>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <div
                        className="bg-blue-300 text-white p-3 rounded"
                        style={{ width: '35%' }}
                      >
                        <div className="flex justify-between">
                          <span>フォーム入力開始</span>
                          <span className="font-bold">4,358</span>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <div
                        className="bg-green-500 text-white p-3 rounded"
                        style={{ width: '15%' }}
                      >
                        <div className="flex justify-between">
                          <span>コンバージョン</span>
                          <span className="font-bold">349</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">デバイス別CV率</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">デスクトップ</span>
                        <span className="font-bold text-green-600">3.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">モバイル</span>
                        <span className="font-bold text-blue-600">2.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">タブレット</span>
                        <span className="font-bold text-purple-600">2.8%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">ページ別CV率</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">外壁塗装LP</span>
                        <span className="font-bold text-green-600">3.6%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">屋根修理LP</span>
                        <span className="font-bold text-blue-600">3.1%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">リフォームLP</span>
                        <span className="font-bold text-purple-600">2.4%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'budget-allocation' && (
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">予算配分最適化提案</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Google広告（現在: 50%）</span>
                        <span className="text-sm font-bold text-green-600">
                          推奨: 60%
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        ROI: 320% → 予測: 380%
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">SNS広告（現在: 30%）</span>
                        <span className="text-sm font-bold text-orange-600">
                          推奨: 20%
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        ROI: 180% → 予測: 200%
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">SEO対策（現在: 20%）</span>
                        <span className="text-sm font-bold text-blue-600">
                          推奨: 20%
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        ROI: 580% → 予測: 600%
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">予算シミュレーション</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">現在の予算配分</p>
                        <p className="text-xl font-bold">¥850,000/月</p>
                        <p className="text-sm text-gray-600 mt-1">
                          予測リード: 378件
                        </p>
                        <p className="text-sm text-gray-600">予測ROI: 320%</p>
                      </div>
                      <div className="border-l pl-4">
                        <p className="text-sm text-gray-600">最適化後</p>
                        <p className="text-xl font-bold text-green-600">
                          ¥850,000/月
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          予測リード: 425件
                        </p>
                        <p className="text-sm text-green-600">予測ROI: 385%</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  最適化案を適用
                </button>
              </div>
            )}

            {activeModal && activeModal.startsWith('landing-') && (
              <div className="space-y-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">
                    ランディングページ詳細分析
                  </h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">訪問者</p>
                      <p className="text-lg font-bold">2,450</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">コンバージョン</p>
                      <p className="text-lg font-bold text-green-600">89</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">CV率</p>
                      <p className="text-lg font-bold text-blue-600">3.6%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">直帰率</p>
                      <p className="text-lg font-bold text-orange-600">38.2%</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">ヒートマップ分析</h4>
                  <div className="bg-gradient-to-b from-red-500 via-yellow-500 to-green-500 h-48 rounded-lg opacity-30 flex items-center justify-center">
                    <p className="text-gray-700 font-medium">
                      クリックヒートマップ
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">改善提案</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>CTAボタンをファーストビューに移動</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>フォーム項目を3つに削減</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>実績・信頼性要素を追加</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeModal && activeModal.startsWith('journey-') && (
              <div className="space-y-4">
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">カスタマージャーニー詳細</h4>
                  <div className="space-y-3">
                    {customerJourney.map((stage, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-20 text-sm font-medium">
                          {stage.stage}
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-200 rounded-full h-8 relative">
                            <div
                              className="bg-teal-500 h-8 rounded-full flex items-center justify-end pr-2"
                              style={{
                                width: `${(stage.count / customerJourney[0].count) * 100}%`,
                              }}
                            >
                              <span className="text-white text-xs font-bold">
                                {stage.count}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="font-bold">
                            {stage.conversionRate}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">離脱ポイント分析</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• 認知→興味: 81.5%離脱</li>
                      <li>• 興味→検討: 64.8%離脱</li>
                      <li>• 検討→購入意向: 57.5%離脱</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">改善施策</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• リターゲティング広告強化</li>
                      <li>• メールナーチャリング</li>
                      <li>• コンテンツ最適化</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* リード獲得フォーム作成モーダル */}
      {showLeadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">📝 リード獲得フォーム作成</h3>
              <button
                onClick={() => setShowLeadModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  フォーム名
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="春のキャンペーンフォーム"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  フォームタイプ
                </label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>見積もり依頼</option>
                  <option>資料請求</option>
                  <option>無料相談</option>
                  <option>ニュースレター登録</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  フィールド設定
                </label>
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  {[
                    '名前',
                    'メールアドレス',
                    '電話番号',
                    '住所',
                    '問い合わせ内容',
                  ].map((field) => (
                    <label key={field} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked={
                          field === '名前' || field === 'メールアドレス'
                        }
                      />
                      <span className="text-sm">{field}</span>
                      {(field === '名前' || field === 'メールアドレス') && (
                        <span className="text-xs text-red-500">必須</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  CTAボタンテキスト
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="無料見積もりを依頼する"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  サンキューページURL
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="https://example.com/thank-you"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">プレビュー</h4>
                <div className="bg-white p-4 rounded border">
                  <h5 className="font-bold mb-3">無料見積もりフォーム</h5>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="お名前 *"
                      className="w-full px-3 py-2 border rounded"
                    />
                    <input
                      type="email"
                      placeholder="メールアドレス *"
                      className="w-full px-3 py-2 border rounded"
                    />
                    <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                      無料見積もりを依頼する
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  フォームを作成
                </button>
                <button
                  onClick={() => setShowLeadModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SNS投稿スケジューラーモーダル */}
      {showSocialModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">📱 SNS投稿スケジューラー</h3>
              <button
                onClick={() => setShowSocialModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  プラットフォーム選択
                </label>
                <div className="flex gap-2">
                  {[
                    { name: 'Facebook', icon: '📘', color: 'bg-blue-100' },
                    { name: 'Instagram', icon: '📷', color: 'bg-pink-100' },
                    { name: 'Twitter', icon: '🐦', color: 'bg-sky-100' },
                    { name: 'LinkedIn', icon: '💼', color: 'bg-indigo-100' },
                  ].map((platform) => (
                    <label
                      key={platform.name}
                      className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:opacity-80 ${platform.color}`}
                    >
                      <input type="checkbox" />
                      <span className="text-lg">{platform.icon}</span>
                      <span className="text-sm font-medium">
                        {platform.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  投稿内容
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={4}
                  placeholder="今日は素晴らしい施工事例をご紹介します！#リフォーム #外壁塗装"
                ></textarea>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">280文字まで</span>
                  <div className="flex gap-2">
                    <button className="text-xs text-blue-600 hover:text-blue-800">
                      ハッシュタグ提案
                    </button>
                    <button className="text-xs text-purple-600 hover:text-purple-800">
                      AI文章生成
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  画像/動画
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer">
                  <div className="text-3xl mb-2">📸</div>
                  <p className="text-sm text-gray-600">
                    クリックまたはドラッグ&ドロップ
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    投稿日時
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    投稿タイプ
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option>即時投稿</option>
                    <option>予約投稿</option>
                    <option>下書き保存</option>
                  </select>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">📊 最適投稿時間の提案</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="bg-white p-2 rounded text-center">
                    <p className="font-bold text-green-600">12:00</p>
                    <p className="text-xs text-gray-600">エンゲージメント高</p>
                  </div>
                  <div className="bg-white p-2 rounded text-center">
                    <p className="font-bold text-blue-600">18:00</p>
                    <p className="text-xs text-gray-600">リーチ最大</p>
                  </div>
                  <div className="bg-white p-2 rounded text-center">
                    <p className="font-bold text-purple-600">20:00</p>
                    <p className="text-xs text-gray-600">シェア率高</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
                  投稿をスケジュール
                </button>
                <button
                  onClick={() => setShowSocialModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* メールテンプレート管理モーダル */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">📧 メールテンプレート管理</h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  新規テンプレート作成
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  インポート
                </button>
              </div>

              <div className="space-y-3">
                {emailTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="border rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold">{template.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {template.subject}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          template.type === 'promotion'
                            ? 'bg-red-100 text-red-700'
                            : template.type === 'follow-up'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {template.type === 'promotion'
                          ? 'プロモーション'
                          : template.type === 'follow-up'
                            ? 'フォローアップ'
                            : 'ニュースレター'}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
                      <div>
                        <p className="text-gray-600">開封率</p>
                        <p className="font-bold text-green-600">
                          {template.openRate}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">クリック率</p>
                        <p className="font-bold text-blue-600">
                          {template.clickRate}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">配信数</p>
                        <p className="font-bold">1,245</p>
                      </div>
                      <div>
                        <p className="text-gray-600">最終使用</p>
                        <p className="font-bold text-xs">{template.lastUsed}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                        プレビュー
                      </button>
                      <button className="flex-1 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600">
                        配信
                      </button>
                      <button className="flex-1 px-3 py-1 border border-gray-300 text-sm rounded hover:bg-gray-50">
                        編集
                      </button>
                      <button className="px-3 py-1 text-red-600 hover:text-red-800 text-sm">
                        削除
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">📊 パフォーマンスサマリー</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">平均開封率</p>
                    <p className="font-bold text-lg">28.9%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">平均クリック率</p>
                    <p className="font-bold text-lg">5.3%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">配信成功率</p>
                    <p className="font-bold text-lg">98.7%</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* A/Bテスト管理モーダル */}
      {showABModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">🧪 A/Bテスト管理</h3>
              <button
                onClick={() => setShowABModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                  新規テスト作成
                </button>
                <select className="px-3 py-2 border rounded-lg">
                  <option>全てのテスト</option>
                  <option>実行中</option>
                  <option>完了</option>
                  <option>準備中</option>
                </select>
              </div>

              <div className="space-y-4">
                {abTests.map((test) => (
                  <div
                    key={test.id}
                    className="border rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold">{test.name}</h4>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          test.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {test.status === 'completed' ? '完了' : '実行中'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium text-sm">
                            バリアントA: {test.variantA.name}
                          </h5>
                          {test.winner === 'A' && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              勝者
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-600">CV率</p>
                            <p className="font-bold text-blue-600">
                              {test.variantA.conversion}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">訪問者</p>
                            <p className="font-bold">
                              {test.variantA.visitors.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium text-sm">
                            バリアントB: {test.variantB.name}
                          </h5>
                          {test.winner === 'B' && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              勝者
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-600">CV率</p>
                            <p className="font-bold text-purple-600">
                              {test.variantB.conversion}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">訪問者</p>
                            <p className="font-bold">
                              {test.variantB.visitors.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-3 rounded mb-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">統計的有意性</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${test.confidenceLevel >= 95 ? 'bg-green-500' : 'bg-yellow-500'}`}
                                style={{ width: `${test.confidenceLevel}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold">
                              {test.confidenceLevel}%
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">改善率</p>
                          <p className="font-bold text-green-600">
                            +
                            {(
                              ((test.variantB.conversion -
                                test.variantA.conversion) /
                                test.variantA.conversion) *
                              100
                            ).toFixed(1)}
                            %
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                        詳細レポート
                      </button>
                      {test.status === 'running' && (
                        <button className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600">
                          テスト停止
                        </button>
                      )}
                      {test.status === 'completed' && (
                        <button className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600">
                          勝者を適用
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowABModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
