'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * キャッシュフロー管理画面
 *
 * 入金予定・支払予定を統合したキャッシュフロー予定表と、
 * 将来のキャッシュフロー予測を表示します。
 */

// ============================================================================
// 型定義
// ============================================================================

interface DailyCashFlow {
  date: string;
  inflow: number;
  outflow: number;
  netFlow: number;
  balance: number;
  items: any[];
}

interface MonthlyCashFlow {
  month: string;
  inflow: number;
  outflow: number;
  netFlow: number;
  balance: number;
}

interface MonthlyForecast {
  month: string;
  scenarios: {
    optimistic: { inflow: number; outflow: number; netFlow: number; balance: number };
    realistic: { inflow: number; outflow: number; netFlow: number; balance: number };
    pessimistic: { inflow: number; outflow: number; netFlow: number; balance: number };
  };
  confidence: number;
  factors: string[];
}

interface RiskAssessment {
  level: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  potentialShortfall: number;
  shortfallMonth?: string;
  mitigationActions: string[];
}

interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  category: 'collection' | 'payment' | 'financing' | 'cost_reduction';
  action: string;
  expectedImpact: number;
  timeline: string;
}

// ============================================================================
// コンポーネント
// ============================================================================

export default function CashFlowPage() {
  const router = useRouter();

  // 状態管理
  const [activeTab, setActiveTab] = useState<'schedule' | 'forecast'>('schedule');
  const [loading, setLoading] = useState(false);

  // キャッシュフロー予定表データ
  const [scheduleData, setScheduleData] = useState<{
    monthlyFlows: MonthlyCashFlow[];
    summary: any;
  } | null>(null);

  // キャッシュフロー予測データ
  const [forecastData, setForecastData] = useState<{
    monthlyForecasts: MonthlyForecast[];
    summary: any;
    riskAssessment: RiskAssessment;
    recommendations: Recommendation[];
    assumptions: string[];
  } | null>(null);

  const [selectedScenario, setSelectedScenario] = useState<
    'optimistic' | 'realistic' | 'pessimistic'
  >('realistic');

  // データ取得
  useEffect(() => {
    fetchScheduleData();
    fetchForecastData();
  }, []);

  const fetchScheduleData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cashflow/schedule?periodType=monthly');
      const result = await response.json();
      if (result.success) {
        setScheduleData({
          monthlyFlows: result.data.monthlyFlows || [],
          summary: result.data.summary,
        });
      }
    } catch (error) {
      console.error('Failed to fetch schedule data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchForecastData = async () => {
    try {
      const response = await fetch('/api/cashflow/forecast?months=6');
      const result = await response.json();
      if (result.success) {
        setForecastData({
          monthlyForecasts: result.data.monthlyForecasts,
          summary: result.data.summary,
          riskAssessment: result.data.riskAssessment,
          recommendations: result.data.recommendations,
          assumptions: result.data.assumptions,
        });
      }
    } catch (error) {
      console.error('Failed to fetch forecast data:', error);
    }
  };

  // ============================================================================
  // ヘルパー関数
  // ============================================================================

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'collection':
        return '入金促進';
      case 'payment':
        return '支払管理';
      case 'financing':
        return '資金調達';
      case 'cost_reduction':
        return 'コスト削減';
      default:
        return category;
    }
  };

  // ============================================================================
  // レンダリング
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">キャッシュフロー管理</h1>
          <p className="text-gray-600 mt-2">資金繰り表と予測でキャッシュフローを可視化</p>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('schedule')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'schedule'
                    ? 'border-dandori-blue text-dandori-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📅 資金繰り予定表
              </button>
              <button
                onClick={() => setActiveTab('forecast')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'forecast'
                    ? 'border-dandori-blue text-dandori-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📈 キャッシュフロー予測
              </button>
            </nav>
          </div>
        </div>

        {/* 予定表タブ */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            {/* サマリーカード */}
            {scheduleData && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-600">入金予定</div>
                  <div className="text-2xl font-bold text-green-600 mt-1">
                    {formatCurrency(scheduleData.summary.totalInflow)}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-600">支払予定</div>
                  <div className="text-2xl font-bold text-red-600 mt-1">
                    {formatCurrency(scheduleData.summary.totalOutflow)}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-600">純キャッシュフロー</div>
                  <div
                    className={`text-2xl font-bold mt-1 ${
                      scheduleData.summary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(scheduleData.summary.netCashFlow)}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-600">期末残高</div>
                  <div className="text-2xl font-bold text-dandori-blue mt-1">
                    {formatCurrency(scheduleData.summary.closingBalance)}
                  </div>
                </div>
              </div>
            )}

            {/* 月次テーブル */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">月次キャッシュフロー</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        月
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        入金
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        支払
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        純増減
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        残高
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {scheduleData?.monthlyFlows.map((flow) => (
                      <tr key={flow.month} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {flow.month}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                          {formatCurrency(flow.inflow)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                          {formatCurrency(flow.outflow)}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                            flow.netFlow >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {flow.netFlow >= 0 ? '+' : ''}
                          {formatCurrency(flow.netFlow)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-dandori-blue">
                          {formatCurrency(flow.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 予測タブ */}
        {activeTab === 'forecast' && forecastData && (
          <div className="space-y-6">
            {/* リスク評価 */}
            <div
              className={`p-6 rounded-lg border-2 ${getRiskLevelColor(
                forecastData.riskAssessment.level
              )}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    リスク評価:{' '}
                    {forecastData.riskAssessment.level === 'low' && '低リスク'}
                    {forecastData.riskAssessment.level === 'medium' && '中リスク'}
                    {forecastData.riskAssessment.level === 'high' && '高リスク'}
                    {forecastData.riskAssessment.level === 'critical' && '⚠️ 要注意'}
                  </h3>
                  <p className="text-sm">{forecastData.riskAssessment.description}</p>
                  {forecastData.riskAssessment.potentialShortfall > 0 && (
                    <p className="text-sm mt-2 font-semibold">
                      潜在的な資金不足額:{' '}
                      {formatCurrency(forecastData.riskAssessment.potentialShortfall)}
                      {forecastData.riskAssessment.shortfallMonth && (
                        <span className="ml-2">
                          ({forecastData.riskAssessment.shortfallMonth})
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">推奨対策:</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {forecastData.riskAssessment.mitigationActions.map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* シナリオ選択 */}
            <div className="bg-white p-4 rounded-lg shadow">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                予測シナリオ:
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedScenario('optimistic')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedScenario === 'optimistic'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  楽観的シナリオ
                </button>
                <button
                  onClick={() => setSelectedScenario('realistic')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedScenario === 'realistic'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  現実的シナリオ
                </button>
                <button
                  onClick={() => setSelectedScenario('pessimistic')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedScenario === 'pessimistic'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  悲観的シナリオ
                </button>
              </div>
            </div>

            {/* 予測サマリー */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600">月間平均入金</div>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(
                    Math.round(forecastData.summary[selectedScenario].averageMonthlyInflow)
                  )}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600">月間平均支払</div>
                <div className="text-2xl font-bold text-red-600 mt-1">
                  {formatCurrency(
                    Math.round(forecastData.summary[selectedScenario].averageMonthlyOutflow)
                  )}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600">予測期末残高</div>
                <div className="text-2xl font-bold text-dandori-blue mt-1">
                  {formatCurrency(forecastData.summary[selectedScenario].projectedEndingBalance)}
                </div>
              </div>
            </div>

            {/* 月次予測テーブル */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">月次予測</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        月
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        入金予測
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        支払予測
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        純増減
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        残高予測
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        信頼度
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {forecastData.monthlyForecasts.map((forecast) => {
                      const scenario = forecast.scenarios[selectedScenario];
                      return (
                        <tr key={forecast.month} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {forecast.month}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                            {formatCurrency(scenario.inflow)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                            {formatCurrency(scenario.outflow)}
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                              scenario.netFlow >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {scenario.netFlow >= 0 ? '+' : ''}
                            {formatCurrency(scenario.netFlow)}
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${
                              scenario.balance < 0 ? 'text-red-600' : 'text-dandori-blue'
                            }`}
                          >
                            {formatCurrency(scenario.balance)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                            <span className="inline-block bg-gray-200 rounded px-2 py-1 text-xs">
                              {forecast.confidence}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 推奨アクション */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">推奨アクション</h2>
              </div>
              <div className="p-6 space-y-4">
                {forecastData.recommendations.map((rec, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityBadge(
                            rec.priority
                          )}`}
                        >
                          {rec.priority === 'high' && '高優先度'}
                          {rec.priority === 'medium' && '中優先度'}
                          {rec.priority === 'low' && '低優先度'}
                        </span>
                        <span className="text-sm font-medium text-gray-600">
                          {getCategoryLabel(rec.category)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{rec.timeline}</span>
                    </div>
                    <p className="text-sm text-gray-800 mb-2">{rec.action}</p>
                    <p className="text-xs text-gray-600">
                      期待効果: {formatCurrency(rec.expectedImpact)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 前提条件 */}
            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">予測の前提条件:</h3>
              <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                {forecastData.assumptions.map((assumption, idx) => (
                  <li key={idx}>{assumption}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
