'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  BarChart3,
  Activity,
  Target,
  Clock,
  RefreshCw,
  Filter,
  Download,
  Bell,
  Zap,
  Eye,
} from 'lucide-react';
import {
  constructionLedgerService,
  ConstructionLedger,
  ProfitAnalysis,
} from '@/services/construction-ledger.service';

interface MonitoringAlert {
  id: string;
  type:
    | 'cost_overrun'
    | 'profit_warning'
    | 'schedule_delay'
    | 'budget_exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  projectName: string;
  contractId: string;
  message: string;
  value: number;
  threshold: number;
  timestamp: string;
  acknowledged: boolean;
}

interface KPIMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  status: 'good' | 'warning' | 'critical';
}

export default function ConstructionMonitoringPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [ledgers, setLedgers] = useState<ConstructionLedger[]>([]);
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [kpiMetrics, setKPIMetrics] = useState<KPIMetric[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('today'); // today, week, month, quarter
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!isLoading && user) {
      loadMonitoringData();
    }
  }, [user, isLoading, selectedTimeframe]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadMonitoringData();
      }, 30000); // 30秒ごとに更新
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadMonitoringData = async () => {
    setLoading(true);
    try {
      const ledgerData = await constructionLedgerService.getLedgers();
      setLedgers(ledgerData);

      // アラートとKPI指標を生成
      const generatedAlerts = await generateAlerts(ledgerData);
      const generatedKPIs = await generateKPIMetrics(ledgerData);

      setAlerts(generatedAlerts);
      setKPIMetrics(generatedKPIs);
    } catch (error) {
      console.error('Failed to load monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAlerts = async (
    ledgerData: ConstructionLedger[],
  ): Promise<MonitoringAlert[]> => {
    const alerts: MonitoringAlert[] = [];

    for (const ledger of ledgerData) {
      const profitAnalysis =
        await constructionLedgerService.analyzeProfitability(ledger.contractId);

      if (profitAnalysis) {
        // コスト超過アラート
        if (profitAnalysis.costOverrunPercent > 10) {
          alerts.push({
            id: `alert_cost_${ledger.id}`,
            type: 'cost_overrun',
            severity:
              profitAnalysis.costOverrunPercent > 20 ? 'critical' : 'high',
            projectName: ledger.projectName,
            contractId: ledger.contractId,
            message: `予算を${profitAnalysis.costOverrunPercent.toFixed(1)}%超過しています`,
            value: profitAnalysis.costOverrunPercent,
            threshold: 10,
            timestamp: new Date().toISOString(),
            acknowledged: false,
          });
        }

        // 利益警告アラート
        if (profitAnalysis.profitMarginActual < 5) {
          alerts.push({
            id: `alert_profit_${ledger.id}`,
            type: 'profit_warning',
            severity:
              profitAnalysis.profitMarginActual < 0 ? 'critical' : 'high',
            projectName: ledger.projectName,
            contractId: ledger.contractId,
            message: `利益率が${profitAnalysis.profitMarginActual.toFixed(1)}%まで低下しています`,
            value: profitAnalysis.profitMarginActual,
            threshold: 5,
            timestamp: new Date().toISOString(),
            acknowledged: false,
          });
        }
      }

      // スケジュール遅延アラート
      if (ledger.status === 'in_progress') {
        const today = new Date();
        const plannedEnd = new Date(ledger.plannedEndDate);
        const daysDiff = Math.ceil(
          (today.getTime() - plannedEnd.getTime()) / (1000 * 3600 * 24),
        );

        if (daysDiff > 0 && ledger.progressRate < 90) {
          alerts.push({
            id: `alert_schedule_${ledger.id}`,
            type: 'schedule_delay',
            severity:
              daysDiff > 14 ? 'critical' : daysDiff > 7 ? 'high' : 'medium',
            projectName: ledger.projectName,
            contractId: ledger.contractId,
            message: `完成予定日から${daysDiff}日遅延中（進捗率: ${ledger.progressRate}%）`,
            value: daysDiff,
            threshold: 0,
            timestamp: new Date().toISOString(),
            acknowledged: false,
          });
        }
      }
    }

    return alerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  };

  const generateKPIMetrics = async (
    ledgerData: ConstructionLedger[],
  ): Promise<KPIMetric[]> => {
    const activeProjects = ledgerData.filter((l) => l.status === 'in_progress');
    const completedProjects = ledgerData.filter(
      (l) => l.status === 'completed',
    );

    // 全体の利益率
    const totalRevenue = ledgerData.reduce(
      (sum, l) => sum + l.contractAmount,
      0,
    );
    const totalActualCost = ledgerData.reduce(
      (sum, l) => sum + l.actualCosts.total,
      0,
    );
    const overallProfitMargin =
      totalRevenue > 0
        ? ((totalRevenue - totalActualCost) / totalRevenue) * 100
        : 0;

    // 平均進捗率
    const avgProgress =
      activeProjects.length > 0
        ? activeProjects.reduce((sum, l) => sum + l.progressRate, 0) /
          activeProjects.length
        : 0;

    // コスト効率（予算内プロジェクトの割合）
    let onBudgetCount = 0;
    for (const ledger of ledgerData) {
      const profitAnalysis =
        await constructionLedgerService.analyzeProfitability(ledger.contractId);
      if (profitAnalysis && profitAnalysis.costOverrunPercent <= 0) {
        onBudgetCount++;
      }
    }
    const costEfficiency =
      ledgerData.length > 0 ? (onBudgetCount / ledgerData.length) * 100 : 0;

    // プロジェクト完成率
    const completionRate =
      ledgerData.length > 0
        ? (completedProjects.length / ledgerData.length) * 100
        : 0;

    return [
      {
        id: 'profit_margin',
        name: '全体利益率',
        value: overallProfitMargin,
        target: 15,
        unit: '%',
        trend:
          overallProfitMargin >= 15
            ? 'up'
            : overallProfitMargin >= 10
              ? 'stable'
              : 'down',
        change: 2.3, // 前期比（簡略化）
        status:
          overallProfitMargin >= 15
            ? 'good'
            : overallProfitMargin >= 10
              ? 'warning'
              : 'critical',
      },
      {
        id: 'avg_progress',
        name: '平均進捗率',
        value: avgProgress,
        target: 75,
        unit: '%',
        trend: avgProgress >= 75 ? 'up' : avgProgress >= 50 ? 'stable' : 'down',
        change: 5.2,
        status:
          avgProgress >= 75
            ? 'good'
            : avgProgress >= 50
              ? 'warning'
              : 'critical',
      },
      {
        id: 'cost_efficiency',
        name: '予算遵守率',
        value: costEfficiency,
        target: 80,
        unit: '%',
        trend:
          costEfficiency >= 80
            ? 'up'
            : costEfficiency >= 60
              ? 'stable'
              : 'down',
        change: -1.5,
        status:
          costEfficiency >= 80
            ? 'good'
            : costEfficiency >= 60
              ? 'warning'
              : 'critical',
      },
      {
        id: 'completion_rate',
        name: 'プロジェクト完成率',
        value: completionRate,
        target: 70,
        unit: '%',
        trend:
          completionRate >= 70
            ? 'up'
            : completionRate >= 50
              ? 'stable'
              : 'down',
        change: 8.7,
        status:
          completionRate >= 70
            ? 'good'
            : completionRate >= 50
              ? 'warning'
              : 'critical',
      },
    ];
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert,
      ),
    );
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'cost_overrun':
        return <TrendingUp className="h-5 w-5" />;
      case 'profit_warning':
        return <TrendingDown className="h-5 w-5" />;
      case 'schedule_delay':
        return <Clock className="h-5 w-5" />;
      case 'budget_exceeded':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string, status: string) => {
    if (trend === 'up') {
      return (
        <TrendingUp
          className={`h-4 w-4 ${status === 'good' ? 'text-green-500' : 'text-red-500'}`}
        />
      );
    }
    if (trend === 'down') {
      return (
        <TrendingDown
          className={`h-4 w-4 ${status === 'critical' ? 'text-red-500' : 'text-green-500'}`}
        />
      );
    }
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dandori-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  const unacknowledgedAlerts = alerts.filter((alert) => !alert.acknowledged);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-dandori-blue" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  リアルタイム収益性モニタリング
                </h1>
                <p className="text-gray-600 mt-1">
                  プロジェクトの収益性をリアルタイムで監視
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="autoRefresh" className="text-sm text-gray-700">
                  自動更新
                </label>
              </div>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="today">今日</option>
                <option value="week">今週</option>
                <option value="month">今月</option>
                <option value="quarter">四半期</option>
              </select>
              <button
                onClick={loadMonitoringData}
                disabled={loading}
                className="bg-dandori-blue text-white px-4 py-2 rounded-lg hover:bg-dandori-blue-dark disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                />
                <span>更新</span>
              </button>
            </div>
          </div>
        </div>

        {/* アラートバナー */}
        {unacknowledgedAlerts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-red-600" />
              <div className="flex-grow">
                <h3 className="text-sm font-medium text-red-800">
                  {unacknowledgedAlerts.length}件の重要なアラートがあります
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  至急確認が必要なプロジェクトがあります
                </p>
              </div>
              <button
                onClick={() =>
                  document
                    .getElementById('alerts-section')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
              >
                確認する
              </button>
            </div>
          </div>
        )}

        {/* KPI メトリクス */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiMetrics.map((metric) => (
            <div
              key={metric.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">
                  {metric.name}
                </h3>
                {getTrendIcon(metric.trend, metric.status)}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p
                    className={`text-3xl font-bold ${
                      metric.status === 'good'
                        ? 'text-green-600'
                        : metric.status === 'warning'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                  >
                    {metric.value.toFixed(1)}
                    {metric.unit}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    目標: {metric.target}
                    {metric.unit}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-medium ${
                      metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {metric.change >= 0 ? '+' : ''}
                    {metric.change.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">前期比</p>
                </div>
              </div>
              {/* プログレスバー */}
              <div className="mt-4">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className={`rounded-full h-2 ${
                      metric.status === 'good'
                        ? 'bg-green-500'
                        : metric.status === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min((metric.value / metric.target) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* プロジェクト一覧 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                プロジェクト収益性
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {ledgers.slice(0, 6).map((ledger) => {
                  const profitMargin =
                    ledger.contractAmount > 0
                      ? ((ledger.contractAmount - ledger.actualCosts.total) /
                          ledger.contractAmount) *
                        100
                      : 0;

                  return (
                    <div
                      key={ledger.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-grow">
                        <h3 className="font-medium text-gray-900 text-sm">
                          {ledger.projectName}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-600">
                          <span>進捗: {ledger.progressRate}%</span>
                          <span>
                            契約額: {formatCurrency(ledger.contractAmount)}
                          </span>
                          <span>
                            実績原価: {formatCurrency(ledger.actualCosts.total)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-bold ${
                            profitMargin >= 15
                              ? 'text-green-600'
                              : profitMargin >= 5
                                ? 'text-yellow-600'
                                : 'text-red-600'
                          }`}
                        >
                          {profitMargin.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">利益率</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* アラート一覧 */}
          <div
            id="alerts-section"
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  アラート
                </h2>
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {unacknowledgedAlerts.length}件未確認
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {alerts.slice(0, 8).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${getAlertColor(alert.severity)} ${
                      alert.acknowledged ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-medium text-sm">
                            {alert.projectName}
                          </h4>
                          <p className="text-sm mt-1">{alert.message}</p>
                          <p className="text-xs mt-2 opacity-75">
                            {new Date(alert.timestamp).toLocaleString('ja-JP')}
                          </p>
                        </div>
                      </div>
                      {!alert.acknowledged && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="text-xs bg-white bg-opacity-50 hover:bg-opacity-75 px-2 py-1 rounded border"
                        >
                          確認済み
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {alerts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-400" />
                    <p>現在アラートはありません</p>
                    <p className="text-sm">
                      すべてのプロジェクトが正常に進行中です
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
