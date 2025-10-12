'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Activity,
} from 'lucide-react';

interface ProjectProfitabilityProps {
  tenantId?: string;
  period?: 'all' | 'monthly' | 'quarterly';
  status?: 'all' | 'completed' | 'in_progress';
}

interface AnalyticsData {
  summary: {
    totalProjects: number;
    completedProjects: number;
    inProgressProjects: number;
    totalContractAmount: number;
    totalBudget: number;
    totalActualCost: number;
    totalExpectedProfit: number;
    totalActualProfit: number;
    avgProfitRate: number;
    profitVariance: number;
    lossProjects: number;
  };
  profitabilityRanking: {
    topByProfitRate: Array<{
      constructionNo: string;
      constructionName: string;
      constructionType: string;
      customerName: string;
      contractAmount: number;
      actualProfit: number;
      actualProfitRate: number;
      actualCost: number;
    }>;
    topByProfitAmount: Array<{
      constructionNo: string;
      constructionName: string;
      constructionType: string;
      customerName: string;
      contractAmount: number;
      actualProfit: number;
      actualProfitRate: number;
      actualCost: number;
    }>;
    worstProjects: Array<{
      constructionNo: string;
      constructionName: string;
      constructionType: string;
      customerName: string;
      contractAmount: number;
      actualProfit: number;
      actualProfitRate: number;
      actualCost: number;
      alerts: Array<{
        type: string;
        severity: string;
        message: string;
      }>;
    }>;
  };
  monthlyTrend: Array<{
    month: string;
    totalProjects: number;
    completedProjects: number;
    contractAmount: number;
    actualCost: number;
    actualProfit: number;
    expectedProfit: number;
    actualProfitRate: number;
  }>;
  typeAnalysis: Array<{
    type: string;
    count: number;
    completedCount: number;
    contractAmount: number;
    actualProfit: number;
    expectedProfit: number;
    avgProfitRate: number;
  }>;
  alertProjects: {
    critical: Array<{
      constructionNo: string;
      constructionName: string;
      customerName: string;
      status: string;
      progressRate: number;
      contractAmount: number;
      actualProfit: number;
      actualProfitRate: number;
      alerts: Array<{
        type: string;
        severity: string;
        message: string;
      }>;
    }>;
    warning: Array<{
      constructionNo: string;
      constructionName: string;
      customerName: string;
      status: string;
      progressRate: number;
      contractAmount: number;
      actualProfit: number;
      actualProfitRate: number;
      alerts: Array<{
        type: string;
        severity: string;
        message: string;
      }>;
    }>;
    totalAlerts: number;
  };
}

export default function ProjectProfitability({
  tenantId = 'demo-tenant',
  period = 'all',
  status = 'all',
}: ProjectProfitabilityProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [tenantId, period, status]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ period });
      if (status !== 'all') params.append('status', status);

      const response = await fetch(
        `/api/analytics/project-profitability?${params}`,
      );
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'データ取得に失敗しました');
      }
    } catch (err) {
      console.error('工事収益分析データ取得エラー:', err);
      setError('データ取得中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dandori-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">分析データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error || 'データがありません'}</p>
      </div>
    );
  }

  const {
    summary,
    profitabilityRanking,
    monthlyTrend,
    typeAnalysis,
    alertProjects,
  } = data;

  return (
    <div className="space-y-6">
      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 総工事数 */}
        <div className="bg-gradient-to-br from-dandori-blue to-dandori-sky text-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/80 text-sm">総工事数</p>
            <Activity className="w-5 h-5 text-white/80" />
          </div>
          <p className="text-4xl font-bold">{summary.totalProjects}</p>
          <p className="text-xs text-white/60 mt-2">
            完了: {summary.completedProjects}件 / 進行中:{' '}
            {summary.inProgressProjects}件
          </p>
        </div>

        {/* 平均粗利率 */}
        <div className="bg-gradient-to-br from-dandori-orange to-dandori-yellow text-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/80 text-sm">平均粗利率</p>
            {summary.avgProfitRate >= 10 ? (
              <TrendingUp className="w-5 h-5 text-green-300" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-300" />
            )}
          </div>
          <p className="text-4xl font-bold">
            {summary.avgProfitRate.toFixed(1)}%
          </p>
          <p className="text-xs text-white/60 mt-2">
            完了工事: {summary.completedProjects}件
          </p>
        </div>

        {/* 総粗利額 */}
        <div className="bg-gradient-to-br from-dandori-pink to-dandori-orange text-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/80 text-sm">総粗利額</p>
            <DollarSign className="w-5 h-5 text-white/80" />
          </div>
          <p className="text-4xl font-bold">
            ¥{(summary.totalActualProfit / 1000000).toFixed(0)}M
          </p>
          <p className="text-xs text-white/60 mt-2">
            予定: ¥{(summary.totalExpectedProfit / 1000000).toFixed(0)}M
            {summary.profitVariance >= 0 ? (
              <span className="text-green-300 ml-1">
                (+¥{(summary.profitVariance / 1000000).toFixed(1)}M)
              </span>
            ) : (
              <span className="text-red-300 ml-1">
                (¥{(summary.profitVariance / 1000000).toFixed(1)}M)
              </span>
            )}
          </p>
        </div>

        {/* 赤字案件 */}
        <div
          className={`bg-gradient-to-br ${
            summary.lossProjects > 0
              ? 'from-red-500 to-red-600'
              : 'from-green-500 to-green-600'
          } text-white rounded-2xl shadow-lg p-6`}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/80 text-sm">赤字案件</p>
            {summary.lossProjects > 0 ? (
              <AlertTriangle className="w-5 h-5 text-white/80" />
            ) : (
              <CheckCircle className="w-5 h-5 text-white/80" />
            )}
          </div>
          <p className="text-4xl font-bold">{summary.lossProjects}</p>
          <p className="text-xs text-white/60 mt-2">
            {summary.lossProjects > 0 ? '要対策案件あり' : '全工事健全'}
          </p>
        </div>
      </div>

      {/* グラフセクション */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 期間別収益推移 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            📈 期間別収益推移（月次）
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="actualProfit"
                stroke="#0099CC"
                strokeWidth={3}
                name="実績粗利(万円)"
                dot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="expectedProfit"
                stroke="#FF9933"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="予定粗利(万円)"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 工事種別別収益 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            📊 工事種別別収益
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typeAnalysis}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="type"
                stroke="#6b7280"
                style={{ fontSize: '11px' }}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar
                dataKey="contractAmount"
                fill="#0099CC"
                name="契約金額(万円)"
              />
              <Bar dataKey="actualProfit" fill="#FF9933" name="粗利(万円)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 収益性ランキング */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          🏆 収益性ランキング（完了工事）
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 粗利率TOP5 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-3">
              粗利率 TOP5
            </h4>
            <div className="space-y-2">
              {profitabilityRanking.topByProfitRate.map((project, index) => (
                <div
                  key={project.constructionNo}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0
                          ? 'bg-yellow-500'
                          : index === 1
                            ? 'bg-gray-400'
                            : index === 2
                              ? 'bg-orange-600'
                              : 'bg-gray-300'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {project.constructionName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {project.constructionType} | {project.customerName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-dandori-blue">
                      {project.actualProfitRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      ¥{(project.actualProfit / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 粗利額TOP5 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-3">
              粗利額 TOP5
            </h4>
            <div className="space-y-2">
              {profitabilityRanking.topByProfitAmount.map((project, index) => (
                <div
                  key={project.constructionNo}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0
                          ? 'bg-yellow-500'
                          : index === 1
                            ? 'bg-gray-400'
                            : index === 2
                              ? 'bg-orange-600'
                              : 'bg-gray-300'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {project.constructionName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {project.constructionType} | {project.customerName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-dandori-orange">
                      ¥{(project.actualProfit / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-xs text-gray-500">
                      粗利率: {project.actualProfitRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* アラート案件 */}
      {alertProjects.totalAlerts > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            ⚠️ 要注意案件（{alertProjects.totalAlerts}件）
          </h3>
          <div className="space-y-4">
            {/* 重大アラート */}
            {alertProjects.critical.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-red-600 mb-2">
                  🚨 重大（{alertProjects.critical.length}件）
                </h4>
                <div className="space-y-2">
                  {alertProjects.critical.map((project) => (
                    <div
                      key={project.constructionNo}
                      className="p-4 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            {project.constructionName}
                            <span className="ml-2 text-xs text-gray-500">
                              ({project.constructionNo})
                            </span>
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            顧客: {project.customerName} | 進捗:{' '}
                            {project.progressRate}%
                          </p>
                          <div className="mt-2 space-y-1">
                            {project.alerts.map((alert, idx) => (
                              <p key={idx} className="text-sm text-red-600">
                                • {alert.message}
                              </p>
                            ))}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-lg font-bold text-red-600">
                            {project.actualProfitRate.toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-500">
                            ¥{(project.actualProfit / 1000000).toFixed(1)}M
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 警告アラート */}
            {alertProjects.warning.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-yellow-600 mb-2">
                  ⚠️ 警告（{alertProjects.warning.length}件）
                </h4>
                <div className="space-y-2">
                  {alertProjects.warning.map((project) => (
                    <div
                      key={project.constructionNo}
                      className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            {project.constructionName}
                            <span className="ml-2 text-xs text-gray-500">
                              ({project.constructionNo})
                            </span>
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            顧客: {project.customerName} | 進捗:{' '}
                            {project.progressRate}%
                          </p>
                          <div className="mt-2 space-y-1">
                            {project.alerts.map((alert, idx) => (
                              <p key={idx} className="text-sm text-yellow-700">
                                • {alert.message}
                              </p>
                            ))}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-lg font-bold text-yellow-600">
                            {project.actualProfitRate.toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-500">
                            ¥{(project.actualProfit / 1000000).toFixed(1)}M
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 低収益案件 */}
      {profitabilityRanking.worstProjects.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            📉 低収益案件（完了工事ワースト3）
          </h3>
          <div className="space-y-2">
            {profitabilityRanking.worstProjects.map((project, index) => (
              <div
                key={project.constructionNo}
                className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {project.constructionName}
                        <span className="ml-2 text-xs text-gray-500">
                          ({project.constructionNo})
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {project.constructionType} | 顧客:{' '}
                        {project.customerName}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        契約金額: ¥
                        {(project.contractAmount / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p
                      className={`text-2xl font-bold ${
                        project.actualProfitRate < 0
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {project.actualProfitRate.toFixed(1)}%
                    </p>
                    <p
                      className={`text-sm ${
                        project.actualProfit < 0
                          ? 'text-red-600'
                          : 'text-gray-500'
                      }`}
                    >
                      ¥{(project.actualProfit / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
