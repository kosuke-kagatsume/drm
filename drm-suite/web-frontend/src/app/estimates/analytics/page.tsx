'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Users,
  Award,
  AlertCircle,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  ChevronRight,
  Download,
  Filter,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// Chart.js登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface EstimateAnalytics {
  id: string;
  estimateNo: string;
  customerName: string;
  projectName: string;
  totalAmount: number;
  status:
    | 'draft'
    | 'submitted'
    | 'negotiating'
    | 'won'
    | 'lost'
    | 'expired'
    | 'cancelled';
  createdAt: string;
  wonDate?: string;
  lostDate?: string;
  lostReason?: 'price' | 'spec' | 'delivery' | 'competitor' | 'other';
  competitorName?: string;
  salesPerson: string;
  profitRate?: number;
}

export default function EstimateAnalyticsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [estimates, setEstimates] = useState<EstimateAnalytics[]>([]);

  useEffect(() => {
    // LocalStorageから見積データを読み込み
    const loadEstimates = () => {
      const savedEstimates = localStorage.getItem('estimates');
      if (savedEstimates) {
        const parsed = JSON.parse(savedEstimates);
        setEstimates(
          parsed.map((est: any) => ({
            ...est,
            salesPerson: est.createdBy || 'システム',
          })),
        );
      }

      // デモデータも追加
      const demoData: EstimateAnalytics[] = [
        {
          id: '1',
          estimateNo: 'EST-2024-001',
          customerName: '田中建設',
          projectName: '田中様邸新築工事',
          totalAmount: 15500000,
          status: 'won',
          createdAt: '2024-08-01',
          wonDate: '2024-08-15',
          salesPerson: '佐藤次郎',
          profitRate: 25,
        },
        {
          id: '2',
          estimateNo: 'EST-2024-002',
          customerName: '山田商事',
          projectName: '山田ビル外壁改修',
          totalAmount: 3200000,
          status: 'lost',
          createdAt: '2024-08-03',
          lostDate: '2024-08-20',
          lostReason: 'price',
          competitorName: 'ABC建設',
          salesPerson: '鈴木一郎',
        },
        {
          id: '3',
          estimateNo: 'EST-2024-003',
          customerName: '鈴木不動産',
          projectName: 'マンションリフォーム',
          totalAmount: 8500000,
          status: 'negotiating',
          createdAt: '2024-08-05',
          salesPerson: '佐藤次郎',
        },
        {
          id: '4',
          estimateNo: 'EST-2024-004',
          customerName: '高橋工務店',
          projectName: '店舗改装工事',
          totalAmount: 5000000,
          status: 'won',
          createdAt: '2024-07-20',
          wonDate: '2024-08-05',
          salesPerson: '山田太郎',
          profitRate: 30,
        },
        {
          id: '5',
          estimateNo: 'EST-2024-005',
          customerName: '渡辺商店',
          projectName: '倉庫増築工事',
          totalAmount: 12000000,
          status: 'lost',
          createdAt: '2024-07-15',
          lostDate: '2024-08-01',
          lostReason: 'delivery',
          salesPerson: '鈴木一郎',
        },
      ];

      setEstimates((prev) => [...prev, ...demoData]);
    };

    loadEstimates();
  }, []);

  // 統計計算
  const calculateStats = () => {
    const total = estimates.length;
    const won = estimates.filter((e) => e.status === 'won').length;
    const lost = estimates.filter((e) => e.status === 'lost').length;
    const pending = estimates.filter((e) =>
      ['submitted', 'negotiating'].includes(e.status),
    ).length;

    const wonAmount = estimates
      .filter((e) => e.status === 'won')
      .reduce((sum, e) => sum + e.totalAmount, 0);

    const lostAmount = estimates
      .filter((e) => e.status === 'lost')
      .reduce((sum, e) => sum + e.totalAmount, 0);

    const totalAmount = estimates.reduce((sum, e) => sum + e.totalAmount, 0);

    const winRate = won + lost > 0 ? (won / (won + lost)) * 100 : 0;

    const avgDealSize = won > 0 ? wonAmount / won : 0;

    // 失注理由の集計
    const lostReasons = estimates
      .filter((e) => e.status === 'lost' && e.lostReason)
      .reduce(
        (acc, e) => {
          acc[e.lostReason!] = (acc[e.lostReason!] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

    // 営業担当別の成績
    const salesPerformance = estimates.reduce(
      (acc, e) => {
        if (!acc[e.salesPerson]) {
          acc[e.salesPerson] = { total: 0, won: 0, lost: 0, amount: 0 };
        }
        acc[e.salesPerson].total++;
        if (e.status === 'won') {
          acc[e.salesPerson].won++;
          acc[e.salesPerson].amount += e.totalAmount;
        } else if (e.status === 'lost') {
          acc[e.salesPerson].lost++;
        }
        return acc;
      },
      {} as Record<
        string,
        { total: number; won: number; lost: number; amount: number }
      >,
    );

    return {
      total,
      won,
      lost,
      pending,
      wonAmount,
      lostAmount,
      totalAmount,
      winRate,
      avgDealSize,
      lostReasons,
      salesPerformance,
    };
  };

  const stats = calculateStats();

  // 月別推移データ
  const monthlyData = {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月'],
    datasets: [
      {
        label: '受注額',
        data: [
          12000000, 15000000, 8000000, 18000000, 22000000, 19000000, 20500000,
          15500000,
        ],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
      },
      {
        label: '失注額',
        data: [
          5000000, 3000000, 7000000, 4000000, 6000000, 8000000, 9000000,
          15200000,
        ],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
      },
    ],
  };

  // 失注理由の円グラフデータ
  const lostReasonData = {
    labels: ['価格', '仕様', '納期', '競合他社', 'その他'],
    datasets: [
      {
        data: [
          stats.lostReasons.price || 0,
          stats.lostReasons.spec || 0,
          stats.lostReasons.delivery || 0,
          stats.lostReasons.competitor || 0,
          stats.lostReasons.other || 0,
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(107, 114, 128, 0.8)',
        ],
      },
    ],
  };

  // 営業担当別成績
  const salesData = {
    labels: Object.keys(stats.salesPerformance),
    datasets: [
      {
        label: '受注件数',
        data: Object.values(stats.salesPerformance).map((p) => p.won),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: '失注件数',
        data: Object.values(stats.salesPerformance).map((p) => p.lost),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
    ],
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/estimates')}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                ← 戻る
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  営業分析ダッシュボード
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  見積の成約状況と営業パフォーマンス分析
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="month">今月</option>
                <option value="quarter">今四半期</option>
                <option value="year">今年度</option>
              </select>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Download className="w-4 h-4" />
                レポート出力
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPIカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-green-600">
                {stats.winRate.toFixed(1)}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">受注率</h3>
            <p className="text-xs text-gray-500 mt-1">
              受注{stats.won}件 / 失注{stats.lost}件
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-blue-600">
                ¥{(stats.wonAmount / 1000000).toFixed(1)}M
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">受注金額</h3>
            <p className="text-xs text-gray-500 mt-1">
              平均単価: ¥{(stats.avgDealSize / 1000000).toFixed(1)}M
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">商談中</h3>
            <p className="text-xs text-gray-500 mt-1">提出済み・交渉中の案件</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-2xl font-bold text-red-600">
                ¥{(stats.lostAmount / 1000000).toFixed(1)}M
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">失注金額</h3>
            <p className="text-xs text-gray-500 mt-1">機会損失額</p>
          </div>
        </div>

        {/* グラフエリア */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 月別推移 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              月別受注・失注推移
            </h3>
            <Line
              data={monthlyData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function (value) {
                        return '¥' + (Number(value) / 1000000).toFixed(0) + 'M';
                      },
                    },
                  },
                },
              }}
            />
          </div>

          {/* 失注理由分析 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              失注理由分析
            </h3>
            <Doughnut
              data={lostReasonData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'right' as const,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* 営業担当別成績 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            営業担当別成績
          </h3>
          <Bar
            data={salesData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>

        {/* 詳細テーブル */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-bold text-gray-900">案件詳細</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    案件情報
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    金額
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    ステータス
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    営業担当
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    備考
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {estimates.slice(0, 10).map((estimate) => (
                  <tr key={estimate.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {estimate.projectName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {estimate.customerName} / {estimate.estimateNo}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-gray-900">
                        ¥{estimate.totalAmount.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          estimate.status === 'won'
                            ? 'bg-green-100 text-green-800'
                            : estimate.status === 'lost'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {estimate.status === 'won'
                          ? '受注'
                          : estimate.status === 'lost'
                            ? '失注'
                            : '商談中'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">
                        {estimate.salesPerson}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {estimate.lostReason && (
                        <p className="text-xs text-gray-500">
                          失注理由: {estimate.lostReason}
                          {estimate.competitorName &&
                            ` (${estimate.competitorName})`}
                        </p>
                      )}
                      {estimate.profitRate && (
                        <p className="text-xs text-green-600">
                          粗利率: {estimate.profitRate}%
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 改善提案 */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            📊 分析サマリー
          </h3>
          <div className="space-y-3">
            {stats.winRate < 30 && (
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    受注率が低下しています
                  </p>
                  <p className="text-xs text-gray-600">
                    価格競争力の見直しや、提案内容の改善を検討してください。
                  </p>
                </div>
              </div>
            )}
            {stats.lostReasons.price > 2 && (
              <div className="flex items-start gap-3">
                <TrendingDown className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    価格での失注が多い
                  </p>
                  <p className="text-xs text-gray-600">
                    原価の見直しや、付加価値の訴求を強化することをお勧めします。
                  </p>
                </div>
              </div>
            )}
            {stats.avgDealSize > 10000000 && (
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    大型案件の獲得に成功
                  </p>
                  <p className="text-xs text-gray-600">
                    平均単価が高く、収益性の高い案件を獲得できています。
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
