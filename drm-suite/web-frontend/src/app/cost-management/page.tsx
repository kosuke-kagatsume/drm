'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  BarChart3,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';

interface CostData {
  orderId: string;
  orderNo: string;
  projectName: string;
  partnerName: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  varianceRate: number;
  status: 'within_budget' | 'over_budget' | 'not_started';
  workProgress: {
    status: 'not_started' | 'in_progress' | 'completed';
    progressRate: number;
  };
  costDetails: {
    category: string;
    budgetAmount: number;
    actualAmount: number;
    variance: number;
  }[];
}

export default function CostManagementPage() {
  const [costData, setCostData] = useState<CostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'over_budget' | 'within_budget'>('all');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchCostData();
  }, []);

  const fetchCostData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      const data = await response.json();

      if (data.success) {
        // 原価データがある発注のみをフィルタ
        const ordersWithCosts = data.orders
          .filter((order: any) => order.costAnalysis)
          .map((order: any) => ({
            orderId: order.id,
            orderNo: order.orderNo,
            projectName: order.projectName,
            partnerName: order.partnerName,
            budgetAmount: order.costAnalysis.budgetAmount,
            actualAmount: order.costAnalysis.actualAmount,
            variance: order.costAnalysis.variance,
            varianceRate: order.costAnalysis.varianceRate,
            status: order.costAnalysis.isOverBudget ? 'over_budget' : 'within_budget',
            workProgress: order.workProgress || {
              status: 'not_started',
              progressRate: 0,
            },
            costDetails: order.costDetails || [],
          }));

        setCostData(ordersWithCosts);
      }
    } catch (error) {
      console.error('Error fetching cost data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAll = async () => {
    try {
      setSyncing(true);

      // 全ての発注に対してDWから原価データを取得
      const response = await fetch('/api/orders');
      const data = await response.json();

      if (data.success) {
        for (const order of data.orders) {
          if (order.drmOrderId && order.dwSyncStatus === 'synced') {
            // DWから最新の原価データを取得
            await fetch(`/api/orders/sync-from-dw?drmOrderId=${order.drmOrderId}`);
          }
        }
      }

      // データを再取得
      await fetchCostData();
    } catch (error) {
      console.error('Error syncing cost data:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleExportCSV = () => {
    // CSVエクスポート機能
    const csvContent = [
      ['発注番号', 'プロジェクト名', '協力会社', '予算', '実績', '差異', '差異率', '進捗率'],
      ...filteredData.map(item => [
        item.orderNo,
        item.projectName,
        item.partnerName,
        item.budgetAmount,
        item.actualAmount,
        item.variance,
        `${item.varianceRate.toFixed(2)}%`,
        `${item.workProgress.progressRate}%`,
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cost_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // 統計情報を計算
  const stats = {
    totalProjects: costData.length,
    totalBudget: costData.reduce((sum, item) => sum + item.budgetAmount, 0),
    totalActual: costData.reduce((sum, item) => sum + item.actualAmount, 0),
    overBudgetCount: costData.filter(item => item.status === 'over_budget').length,
    withinBudgetCount: costData.filter(item => item.status === 'within_budget').length,
  };

  stats.totalVariance = stats.totalBudget - stats.totalActual;
  stats.totalVarianceRate = stats.totalBudget > 0 ? (stats.totalVariance / stats.totalBudget) * 100 : 0;

  const filteredData = costData.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                原価管理ダッシュボード
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                発注の予算と実績を管理し、原価差異を監視します
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSyncAll}
                disabled={syncing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? '同期中...' : 'DWから同期'}
              </button>
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                CSV出力
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 総プロジェクト数 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総プロジェクト数</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalProjects}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* 総予算 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総予算</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  ¥{stats.totalBudget.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* 総実績 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総実績</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  ¥{stats.totalActual.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* 差異 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総差異</p>
                <p className={`text-2xl font-bold mt-2 ${stats.totalVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.totalVariance >= 0 ? '+' : ''}¥{stats.totalVariance.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.totalVarianceRate >= 0 ? '+' : ''}{stats.totalVarianceRate.toFixed(2)}%
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stats.totalVariance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {stats.totalVariance >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-600" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-600" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* アラート: 予算超過案件 */}
        {stats.overBudgetCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-red-900">予算超過アラート</h3>
                <p className="text-sm text-red-700 mt-1">
                  {stats.overBudgetCount}件のプロジェクトが予算を超過しています。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                全て ({costData.length})
              </button>
              <button
                onClick={() => setFilter('within_budget')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === 'within_budget'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                予算内 ({stats.withinBudgetCount})
              </button>
              <button
                onClick={() => setFilter('over_budget')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === 'over_budget'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                予算超過 ({stats.overBudgetCount})
              </button>
            </div>
          </div>
        </div>

        {/* 原価一覧テーブル */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    発注番号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    プロジェクト名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    協力会社
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    進捗
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    予算
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    実績
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    差異
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item) => (
                  <tr key={item.orderId} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {item.orderNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.projectName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.partnerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${item.workProgress.progressRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {item.workProgress.progressRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      ¥{item.budgetAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      ¥{item.actualAmount.toLocaleString()}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                      item.variance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.variance >= 0 ? '+' : ''}¥{item.variance.toLocaleString()}
                      <div className="text-xs mt-1">
                        {item.varianceRate >= 0 ? '+' : ''}{item.varianceRate.toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.status === 'within_budget' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          予算内
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          予算超過
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">原価データがありません</p>
              <p className="text-sm text-gray-400 mt-2">
                DWシステムから原価データを同期してください
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
