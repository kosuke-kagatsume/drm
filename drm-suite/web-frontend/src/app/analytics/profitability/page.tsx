'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  FileText,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// プロジェクト利益率データの型定義
interface ProjectProfitability {
  projectId: string;
  projectName: string;
  projectType: string;
  customer: string;
  revenue: number; // 売上
  cost: number; // 原価
  grossProfit: number; // 粗利額
  grossProfitRate: number; // 粗利率
  status: 'in_progress' | 'completed' | 'at_risk';
  progress: number; // 進捗率
  targetProfitRate: number; // 目標粗利率
}

// 工種別利益率データ
interface CategoryProfitability {
  category: string;
  revenue: number;
  cost: number;
  grossProfit: number;
  grossProfitRate: number;
  projectCount: number;
  averageOrderValue: number;
}

export default function ProfitabilityPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'in_progress' | 'completed' | 'at_risk'
  >('all');

  // サンプルデータ
  const projectData: ProjectProfitability[] = [
    {
      projectId: 'PRJ-001',
      projectName: '山田様邸 新築工事',
      projectType: '新築',
      customer: '山田太郎',
      revenue: 35000000,
      cost: 26250000,
      grossProfit: 8750000,
      grossProfitRate: 25.0,
      status: 'in_progress',
      progress: 65,
      targetProfitRate: 25.0,
    },
    {
      projectId: 'PRJ-002',
      projectName: '田中ビル 改修工事',
      projectType: 'リフォーム',
      customer: '田中建設',
      revenue: 65000000,
      cost: 52000000,
      grossProfit: 13000000,
      grossProfitRate: 20.0,
      status: 'in_progress',
      progress: 45,
      targetProfitRate: 22.0,
    },
    {
      projectId: 'PRJ-003',
      projectName: '鈴木工場 増築',
      projectType: '増築',
      customer: '鈴木商事',
      revenue: 125000000,
      cost: 93750000,
      grossProfit: 31250000,
      grossProfitRate: 25.0,
      status: 'completed',
      progress: 100,
      targetProfitRate: 23.0,
    },
    {
      projectId: 'PRJ-004',
      projectName: '佐藤邸 外壁塗装',
      projectType: '外壁工事',
      customer: '佐藤工業',
      revenue: 8000000,
      cost: 6400000,
      grossProfit: 1600000,
      grossProfitRate: 20.0,
      status: 'completed',
      progress: 100,
      targetProfitRate: 25.0,
    },
    {
      projectId: 'PRJ-005',
      projectName: '伊藤マンション 大規模修繕',
      projectType: 'リフォーム',
      customer: '伊藤建築',
      revenue: 48000000,
      cost: 38400000,
      grossProfit: 9600000,
      grossProfitRate: 20.0,
      status: 'at_risk',
      progress: 55,
      targetProfitRate: 22.0,
    },
    {
      projectId: 'PRJ-006',
      projectName: '高橋様邸 リノベーション',
      projectType: 'リフォーム',
      customer: '高橋次郎',
      revenue: 28000000,
      cost: 19600000,
      grossProfit: 8400000,
      grossProfitRate: 30.0,
      status: 'in_progress',
      progress: 70,
      targetProfitRate: 28.0,
    },
  ];

  // 工種別データ
  const categoryData: CategoryProfitability[] = [
    {
      category: '新築',
      revenue: 35000000,
      cost: 26250000,
      grossProfit: 8750000,
      grossProfitRate: 25.0,
      projectCount: 1,
      averageOrderValue: 35000000,
    },
    {
      category: 'リフォーム',
      revenue: 141000000,
      cost: 110000000,
      grossProfit: 31000000,
      grossProfitRate: 22.0,
      projectCount: 3,
      averageOrderValue: 47000000,
    },
    {
      category: '増築',
      revenue: 125000000,
      cost: 93750000,
      grossProfit: 31250000,
      grossProfitRate: 25.0,
      projectCount: 1,
      averageOrderValue: 125000000,
    },
    {
      category: '外壁工事',
      revenue: 8000000,
      cost: 6400000,
      grossProfit: 1600000,
      grossProfitRate: 20.0,
      projectCount: 1,
      averageOrderValue: 8000000,
    },
  ];

  // 月次トレンドデータ
  const monthlyTrend = [
    { month: '4月', 粗利率: 22.5, 売上: 45, 目標: 25 },
    { month: '5月', 粗利率: 23.8, 売上: 52, 目標: 25 },
    { month: '6月', 粗利率: 24.2, 売上: 58, 目標: 25 },
    { month: '7月', 粗利率: 23.5, 売上: 63, 目標: 25 },
    { month: '8月', 粗利率: 24.8, 売上: 68, 目標: 25 },
    { month: '9月', 粗利率: 25.2, 売上: 75, 目標: 25 },
  ];

  // サマリー計算
  const summary = {
    totalRevenue: projectData.reduce((sum, p) => sum + p.revenue, 0),
    totalCost: projectData.reduce((sum, p) => sum + p.cost, 0),
    totalProfit: projectData.reduce((sum, p) => sum + p.grossProfit, 0),
    averageProfitRate:
      projectData.reduce((sum, p) => sum + p.grossProfitRate, 0) /
      projectData.length,
    projectCount: projectData.length,
    atRiskProjects: projectData.filter((p) => p.status === 'at_risk').length,
  };

  // フィルタリング
  const filteredProjects =
    filterStatus === 'all'
      ? projectData
      : projectData.filter((p) => p.status === filterStatus);

  // カラー設定
  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'at_risk':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
        return <BarChart3 className="w-4 h-4" />;
      case 'at_risk':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6">
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">利益率分析</h1>
            <p className="text-gray-600 mt-1">Profitability Analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="month">月次</option>
              <option value="quarter">四半期</option>
              <option value="year">年次</option>
            </select>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" />
              レポート出力
            </button>
          </div>
        </div>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">平均粗利率</span>
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {summary.averageProfitRate.toFixed(1)}%
          </p>
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +2.3% vs 前期
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">粗利額</span>
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ¥{(summary.totalProfit / 1000000).toFixed(0)}M
          </p>
          <p className="text-xs text-gray-600 mt-1">
            売上: ¥{(summary.totalRevenue / 1000000).toFixed(0)}M
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">分析プロジェクト数</span>
            <PieChartIcon className="w-5 h-5 text-pink-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {summary.projectCount}
          </p>
          <p className="text-xs text-gray-600 mt-1">進行中・完了含む</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-red-100 bg-red-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-red-700 font-semibold">
              要注意プロジェクト
            </span>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-700">
            {summary.atRiskProjects}件
          </p>
          <p className="text-xs text-red-600 mt-1">目標未達リスク</p>
        </div>
      </div>

      {/* アラート */}
      {summary.atRiskProjects > 0 && (
        <div className="mb-8 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">
                利益率改善が必要なプロジェクト
              </h3>
              <p className="text-sm text-red-700">
                {summary.atRiskProjects}
                件のプロジェクトで粗利率が目標を下回っています。早急な対策が必要です。
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 工種別利益率 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">工種別利益率</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="category"
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar
                dataKey="grossProfitRate"
                fill="#8b5cf6"
                name="粗利率 (%)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 粗利率トレンド */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            粗利率トレンド（6ヶ月）
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="粗利率"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="目標"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* プロジェクト詳細テーブル */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              プロジェクト別利益率
            </h3>
            <div className="flex items-center gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">全て</option>
                <option value="in_progress">進行中</option>
                <option value="completed">完了</option>
                <option value="at_risk">要注意</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  プロジェクト
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  工種
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  売上
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  原価
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  粗利額
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  粗利率
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  目標
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  進捗
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProjects.map((project) => (
                <tr
                  key={project.projectId}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {project.projectName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {project.customer}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {project.projectType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <p className="font-semibold text-gray-900 text-sm">
                      ¥{(project.revenue / 1000000).toFixed(1)}M
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <p className="text-gray-900 text-sm">
                      ¥{(project.cost / 1000000).toFixed(1)}M
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <p className="font-semibold text-gray-900 text-sm">
                      ¥{(project.grossProfit / 1000000).toFixed(1)}M
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          project.grossProfitRate >= project.targetProfitRate
                            ? 'bg-green-100 text-green-700'
                            : project.grossProfitRate >=
                                project.targetProfitRate - 2
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {project.grossProfitRate}%
                      </span>
                      {project.grossProfitRate >= project.targetProfitRate ? (
                        <ArrowUpRight className="w-3 h-3 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-red-600" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <p className="text-gray-600 text-sm">
                      {project.targetProfitRate}%
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 justify-center ${getStatusColor(
                        project.status,
                      )}`}
                    >
                      {getStatusIcon(project.status)}
                      {project.status === 'completed'
                        ? '完了'
                        : project.status === 'in_progress'
                          ? '進行中'
                          : '要注意'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            project.progress >= 80
                              ? 'bg-green-500'
                              : project.progress >= 50
                                ? 'bg-blue-500'
                                : 'bg-yellow-500'
                          }`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-10">
                        {project.progress}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 改善提案 */}
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          💡 利益率改善の提案
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              工種別最適化
            </h4>
            <p className="text-sm text-gray-600">
              リフォーム案件の粗利率が22%と低めです。資材調達コストの見直しで2-3%の改善が見込めます。
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              好調案件の分析
            </h4>
            <p className="text-sm text-gray-600">
              高橋様邸（粗利率30%）の成功要因を他案件に展開することで、平均粗利率を27%まで向上可能です。
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              リスク案件対応
            </h4>
            <p className="text-sm text-gray-600">
              伊藤マンション案件は早急な原価見直しが必要。外注費を10%削減できれば目標達成可能です。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
