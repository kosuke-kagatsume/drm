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
      id: '1',
      name: 'SUMMER CAMPAIGN 2024',
      type: 'ppc',
      status: 'active',
      startDate: '2024-07-01',
      endDate: '2024-08-31',
      budget: 500000,
      spent: 285000,
      leads: 145,
      conversion: 8.2,
      roi: 3.2,
    },
    {
      id: '2',
      name: 'SEO OPTIMIZATION PROJECT',
      type: 'seo',
      status: 'active',
      startDate: '2024-06-15',
      endDate: '2024-12-15',
      budget: 300000,
      spent: 120000,
      leads: 89,
      conversion: 12.5,
      roi: 4.1,
    },
    {
      id: '3',
      name: 'EMAIL NEWSLETTER SERIES',
      type: 'email',
      status: 'scheduled',
      startDate: '2024-08-15',
      endDate: '2024-10-15',
      budget: 150000,
      spent: 0,
      leads: 0,
      conversion: 0,
      roi: 0,
    },
  ];

  const leadSources: LeadSource[] = [
    {
      source: 'GOOGLE ADS',
      count: 145,
      quality: 8.2,
      conversion: 12.4,
      trend: 'up',
    },
    {
      source: 'FACEBOOK',
      count: 89,
      quality: 6.8,
      conversion: 8.9,
      trend: 'up',
    },
    {
      source: 'ORGANIC SEARCH',
      count: 234,
      quality: 9.1,
      conversion: 15.2,
      trend: 'stable',
    },
    {
      source: 'EMAIL MARKETING',
      count: 67,
      quality: 7.5,
      conversion: 18.3,
      trend: 'down',
    },
    {
      source: 'REFERRAL',
      count: 43,
      quality: 8.9,
      conversion: 22.1,
      trend: 'up',
    },
  ];

  const webMetrics: WebMetrics = {
    visitors: 12543,
    pageViews: 45231,
    bounceRate: 42.3,
    avgSessionDuration: '3:24',
    conversionRate: 4.8,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-emerald-500 border-emerald-500/50';
      case 'scheduled':
        return 'text-blue-500 border-blue-500/50';
      case 'completed':
        return 'text-zinc-400 border-zinc-600';
      case 'paused':
        return 'text-amber-500 border-amber-500/50';
      default:
        return 'text-zinc-500 border-zinc-700';
    }
  };

  const getTrendIndicator = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      default:
        return '→';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-emerald-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-zinc-500';
    }
  };

  const getTypeIndicator = (type: string) => {
    switch (type) {
      case 'ppc':
        return '01';
      case 'seo':
        return '02';
      case 'email':
        return '03';
      case 'social':
        return '04';
      case 'web':
        return '05';
      default:
        return '00';
    }
  };

  return (
    <div className="space-y-6">
      {/* MARKETING KPI DASHBOARD */}
      <div className="bg-zinc-950 border border-zinc-800 p-6">
        <h2 className="text-sm font-normal text-white tracking-widest mb-6">
          MARKETING PERFORMANCE
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="border border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 tracking-wider mb-2">
              TOTAL VISITORS
            </p>
            <p className="text-3xl font-thin text-white">
              {webMetrics.visitors.toLocaleString()}
            </p>
            <p className="text-xs text-emerald-500 tracking-wider mt-2">
              +12.3%
            </p>
          </div>
          <div className="border border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 tracking-wider mb-2">
              PAGE VIEWS
            </p>
            <p className="text-3xl font-thin text-white">
              {webMetrics.pageViews.toLocaleString()}
            </p>
            <p className="text-xs text-blue-500 tracking-wider mt-2">+8.7%</p>
          </div>
          <div className="border border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 tracking-wider mb-2">
              BOUNCE RATE
            </p>
            <p className="text-3xl font-thin text-amber-500">
              {webMetrics.bounceRate}%
            </p>
            <p className="text-xs text-emerald-500 tracking-wider mt-2">
              -2.1%
            </p>
          </div>
          <div className="border border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 tracking-wider mb-2">
              SESSION TIME
            </p>
            <p className="text-3xl font-thin text-white">
              {webMetrics.avgSessionDuration}
            </p>
            <p className="text-xs text-emerald-500 tracking-wider mt-2">
              +15.2%
            </p>
          </div>
          <div className="border border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 tracking-wider mb-2">
              CONVERSION
            </p>
            <p className="text-3xl font-thin text-emerald-500">
              {webMetrics.conversionRate}%
            </p>
            <p className="text-xs text-emerald-500 tracking-wider mt-2">
              +0.3%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CAMPAIGNS */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-sm font-normal text-white tracking-widest">
                ACTIVE CAMPAIGNS
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {campaigns.map((campaign, idx) => (
                  <div
                    key={campaign.id}
                    className="border border-zinc-800 p-4 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-sm">
                          {getTypeIndicator(campaign.type)}
                        </div>
                        <div>
                          <h4 className="text-white font-light tracking-wider">
                            {campaign.name}
                          </h4>
                          <p className="text-xs text-zinc-500 tracking-wider mt-1">
                            TYPE: {campaign.type.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 border text-xs tracking-wider ${getStatusColor(campaign.status)}`}
                      >
                        {campaign.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-xs">
                      <div>
                        <p className="text-zinc-500 tracking-wider">BUDGET</p>
                        <p className="text-white font-light">
                          ¥{(campaign.budget / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div>
                        <p className="text-zinc-500 tracking-wider">SPENT</p>
                        <p className="text-white font-light">
                          ¥{(campaign.spent / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div>
                        <p className="text-zinc-500 tracking-wider">LEADS</p>
                        <p className="text-white font-light">
                          {campaign.leads}
                        </p>
                      </div>
                      <div>
                        <p className="text-zinc-500 tracking-wider">ROI</p>
                        <p
                          className={`font-light ${campaign.roi > 2 ? 'text-emerald-500' : 'text-amber-500'}`}
                        >
                          {campaign.roi.toFixed(1)}x
                        </p>
                      </div>
                    </div>

                    {campaign.status === 'active' && (
                      <div className="mt-3 bg-zinc-900 h-1">
                        <div
                          className="bg-blue-500/50 h-1 transition-all duration-500"
                          style={{
                            width: `${(campaign.spent / campaign.budget) * 100}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* LEAD SOURCES ANALYSIS */}
          <div className="bg-zinc-950 border border-zinc-800 mt-6">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-normal text-white tracking-widest">
                LEAD SOURCES ANALYSIS
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {leadSources.map((source, idx) => (
                  <div key={idx} className="border border-zinc-800 p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                            {String(idx + 1).padStart(2, '0')}
                          </div>
                          <h4 className="text-white font-light tracking-wider">
                            {source.source}
                          </h4>
                          <span
                            className={`text-sm ${getTrendColor(source.trend)}`}
                          >
                            {getTrendIndicator(source.trend)}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-4 gap-4 text-xs">
                          <div>
                            <p className="text-zinc-500 tracking-wider">
                              LEADS
                            </p>
                            <p className="text-white font-light">
                              {source.count}
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-500 tracking-wider">
                              QUALITY
                            </p>
                            <p className="text-white font-light">
                              {source.quality}/10
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-500 tracking-wider">
                              CONVERSION
                            </p>
                            <p className="text-emerald-500 font-light">
                              {source.conversion}%
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-500 tracking-wider">
                              TREND
                            </p>
                            <p
                              className={`font-light ${getTrendColor(source.trend)}`}
                            >
                              {source.trend.toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* QUICK ACCESS TOOLS */}
          <div className="bg-zinc-950 border border-zinc-800 mt-6">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-normal text-white tracking-widest">
                MARKETING TOOLS
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => router.push('/marketing/templates')}
                  className="p-4 border border-zinc-800 hover:bg-zinc-900 transition text-center"
                >
                  <div className="text-xs text-zinc-500 tracking-wider mb-2">
                    01
                  </div>
                  <div className="text-xs text-white tracking-wider">
                    EMAIL TEMPLATES
                  </div>
                </button>
                <button
                  onClick={() => router.push('/marketing/scheduler')}
                  className="p-4 border border-zinc-800 hover:bg-zinc-900 transition text-center"
                >
                  <div className="text-xs text-zinc-500 tracking-wider mb-2">
                    02
                  </div>
                  <div className="text-xs text-white tracking-wider">
                    SOCIAL SCHEDULER
                  </div>
                </button>
                <button className="p-4 border border-zinc-800 hover:bg-zinc-900 transition text-center">
                  <div className="text-xs text-zinc-500 tracking-wider mb-2">
                    03
                  </div>
                  <div className="text-xs text-white tracking-wider">
                    ANALYTICS
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="lg:col-span-1">
          {/* PERIOD SELECTOR */}
          <div className="bg-zinc-950 border border-zinc-800 mb-6">
            <div className="p-4">
              <h3 className="text-sm font-normal text-white tracking-widest mb-4">
                TIME PERIOD
              </h3>
              <div className="space-y-2">
                {['day', 'week', 'month'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period as any)}
                    className={`w-full text-left px-4 py-2 text-xs tracking-wider transition-colors ${
                      selectedPeriod === period
                        ? 'bg-white text-black'
                        : 'border border-zinc-800 text-white hover:bg-zinc-900'
                    }`}
                  >
                    {period.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CAMPAIGN METRICS */}
          <div className="bg-zinc-950 border border-zinc-800 mb-6">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-normal text-white tracking-widest">
                CAMPAIGN METRICS
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div className="border border-zinc-800 p-3">
                  <p className="text-xs text-zinc-500 tracking-wider">
                    TOTAL BUDGET
                  </p>
                  <p className="text-xl font-thin text-white">¥950K</p>
                  <p className="text-xs text-zinc-600 tracking-wider mt-1">
                    ALLOCATED
                  </p>
                </div>
                <div className="border border-zinc-800 p-3">
                  <p className="text-xs text-zinc-500 tracking-wider">
                    TOTAL SPENT
                  </p>
                  <p className="text-xl font-thin text-amber-500">¥405K</p>
                  <p className="text-xs text-amber-500/70 tracking-wider mt-1">
                    42.6% USED
                  </p>
                </div>
                <div className="border border-zinc-800 p-3">
                  <p className="text-xs text-zinc-500 tracking-wider">
                    TOTAL LEADS
                  </p>
                  <p className="text-xl font-thin text-emerald-500">234</p>
                  <p className="text-xs text-emerald-500/70 tracking-wider mt-1">
                    +18.2%
                  </p>
                </div>
                <div className="border border-zinc-800 p-3">
                  <p className="text-xs text-zinc-500 tracking-wider">
                    AVG ROI
                  </p>
                  <p className="text-xl font-thin text-blue-500">3.6x</p>
                  <p className="text-xs text-blue-500/70 tracking-wider mt-1">
                    EXCELLENT
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* MARKETING AI ASSISTANT */}
          <div className="bg-zinc-950 border border-zinc-800 sticky top-6">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-normal text-white tracking-widest">
                MARKETING AI
              </h3>
            </div>
            <div className="p-4">
              <div className="border border-zinc-800 p-4 mb-4">
                <p className="text-xs text-zinc-500 tracking-wider mb-3">
                  OPTIMIZATION RECOMMENDATIONS
                </p>
                <div className="space-y-3 text-xs text-zinc-400">
                  <p className="tracking-wider">
                    • INCREASE BUDGET FOR HIGH-ROI CAMPAIGNS
                  </p>
                  <p className="tracking-wider">
                    • OPTIMIZE FACEBOOK AD TARGETING
                  </p>
                  <p className="tracking-wider">
                    • A/B TEST EMAIL SUBJECT LINES
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                  MARKETING QUERY
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                  rows={3}
                  placeholder="Enter your marketing question..."
                />
                <button className="mt-3 w-full border border-zinc-800 text-white py-3 text-xs tracking-wider hover:bg-zinc-900 transition-colors">
                  ANALYZE
                </button>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="text-xs text-zinc-500 tracking-wider mb-3">
                  QUICK INSIGHTS
                </h4>
                <div className="space-y-2">
                  <button className="w-full text-left text-xs border border-zinc-800 p-3 hover:bg-zinc-900 transition-colors text-zinc-400 tracking-wider">
                    CAMPAIGN PERFORMANCE
                  </button>
                  <button className="w-full text-left text-xs border border-zinc-800 p-3 hover:bg-zinc-900 transition-colors text-zinc-400 tracking-wider">
                    LEAD QUALITY ANALYSIS
                  </button>
                  <button className="w-full text-left text-xs border border-zinc-800 p-3 hover:bg-zinc-900 transition-colors text-zinc-400 tracking-wider">
                    CONVERSION OPTIMIZATION
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
