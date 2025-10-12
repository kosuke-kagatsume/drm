'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCustomers } from '@/hooks/useCustomers';
import { useEstimates } from '@/hooks/useEstimates';
import { useFinancialMetrics } from '@/hooks/useFinancialMetrics';
const CustomerDetailModal = ({ isOpen, onClose }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
        <h3 className="text-xl font-bold mb-4">顧客詳細</h3>
        <p className="text-gray-600 mb-4">顧客詳細機能は準備中です</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};

interface TodoItem {
  id: string;
  title: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  type:
    | 'estimate'
    | 'contract'
    | 'visit'
    | 'create-estimate'
    | 'follow-estimate';
  customer: string;
  amount?: number;
  customerId?: string;
  estimateId?: string;
  contractId?: string;
}

interface SalesDashboardProps {
  userEmail: string;
}

export default function SalesDashboard({ userEmail }: SalesDashboardProps) {
  const router = useRouter();
  const [todayTodos, setTodayTodos] = useState<TodoItem[]>([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showRAGModal, setShowRAGModal] = useState(false);
  const [stats, setStats] = useState({
    monthlyRevenue: 0,
    newLeads: 0,
    pendingEstimates: 0,
    conversionRate: 0,
  });

  // API hooks
  const { customers, loading: customersLoading } = useCustomers({
    filter: { assignee: userEmail },
    autoFetch: true,
  });

  const { estimates, loading: estimatesLoading } = useEstimates({
    filter: { assignee: userEmail, status: ['draft', 'pending'] },
    autoFetch: true,
  });

  const { metrics: financialMetrics, loading: metricsLoading } =
    useFinancialMetrics({
      userId: userEmail,
      autoFetch: true,
    });

  // Build todos from real data
  useEffect(() => {
    const todos: TodoItem[] = [];

    // Add customers with next actions
    customers?.forEach((customer) => {
      if (customer.nextActionDate) {
        const nextDate = new Date(customer.nextActionDate);
        const today = new Date();
        const isToday = nextDate.toDateString() === today.toDateString();
        const isSoon =
          nextDate.getTime() - today.getTime() < 7 * 24 * 60 * 60 * 1000;

        if (isToday || isSoon) {
          // 見積作成タスクかフォローアップタスクかを判定
          const isCreateEstimate =
            customer.nextAction?.includes('初回見積') ||
            customer.nextAction?.includes('見積もり作成') ||
            customer.nextAction?.includes('見積作成');

          todos.push({
            id: `customer-${customer.id}`,
            title: customer.nextAction || '顧客フォローアップ',
            deadline: isToday
              ? `本日 ${nextDate.getHours()}:00`
              : nextDate.toLocaleDateString('ja-JP'),
            priority:
              customer.priority > 3
                ? 'high'
                : customer.priority > 1
                  ? 'medium'
                  : 'low',
            type: isCreateEstimate ? 'create-estimate' : 'visit',
            customer: customer.company || customer.name,
            customerId: customer.id,
          });
        }
      }
    });

    // Add pending estimates
    estimates?.forEach((estimate) => {
      const validUntil = new Date(estimate.validUntil);
      const today = new Date();
      const daysLeft = Math.floor(
        (validUntil.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
      );

      if (daysLeft <= 7) {
        todos.push({
          id: `estimate-${estimate.id}`,
          title: `${estimate.projectName} 見積フォロー`,
          deadline: `あと${daysLeft}日`,
          priority: daysLeft <= 3 ? 'high' : 'medium',
          type: 'follow-estimate',
          customer: estimate.customerName,
          amount: estimate.totals?.total || 0,
          estimateId: estimate.id,
        });
      }
    });

    // Sort by priority and deadline
    todos.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    setTodayTodos(todos.slice(0, 5));
  }, [customers, estimates]);

  // Calculate stats from real data
  useEffect(() => {
    const monthlyRevenue =
      estimates
        ?.filter((e) => e.status === 'accepted')
        ?.reduce((sum, e) => sum + (e.totals?.total || 0), 0) || 0;

    const newLeads =
      customers?.filter((c) => {
        const created = new Date(c.createdAt);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return created > monthAgo && c.status === 'lead';
      }).length || 0;

    const pendingEstimates =
      estimates?.filter((e) => e.status === 'draft' || e.status === 'pending')
        .length || 0;

    const totalLeads =
      customers?.filter((c) => c.status === 'lead').length || 0;
    const totalCustomers =
      customers?.filter((c) => c.status === 'customer').length || 0;
    const conversionRate =
      totalLeads > 0
        ? (totalCustomers / (totalLeads + totalCustomers)) * 100
        : 0;

    setStats({
      monthlyRevenue,
      newLeads,
      pendingEstimates,
      conversionRate,
    });
  }, [customers, estimates]);

  // Show loading state if data is still loading
  if (customersLoading || estimatesLoading || metricsLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dandori-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  // Mock data as fallback
  const mockTodos: TodoItem[] = [
    {
      id: '1',
      title: '田中様邸 見積提出',
      deadline: '本日 15:00',
      priority: 'high',
      type: 'estimate',
      customer: '田中建設',
      amount: 2500000,
    },
    {
      id: '2',
      title: '山田様 来店予定',
      deadline: '本日 16:00',
      priority: 'medium',
      type: 'visit',
      customer: '山田工務店',
    },
    {
      id: '3',
      title: '契約書確認',
      deadline: '明日 10:00',
      priority: 'low',
      type: 'contract',
      customer: '佐藤リフォーム',
      amount: 1800000,
    },
  ];

  // Use real data if available, otherwise fallback to mock
  const displayTodos = todayTodos.length > 0 ? todayTodos : mockTodos;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-orange-500 bg-orange-50';
      default:
        return 'border-green-500 bg-green-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'estimate':
        return '📝';
      case 'create-estimate':
        return '✏️';
      case 'follow-estimate':
        return '📄';
      case 'contract':
        return '📋';
      case 'visit':
        return '🏠';
      default:
        return '📌';
    }
  };

  return (
    <div className="space-y-6">
      {/* 今日のアラート */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              緊急：本日15時締切
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>田中様邸の見積提出期限が4時間後です。</p>
              <button
                onClick={() => router.push('/estimates')}
                className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                見積一覧へ →
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 今日のタスク */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold flex items-center">
                📌 今日やること
                <span className="ml-2 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                  {displayTodos.length}件
                </span>
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {customersLoading || estimatesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">データを読み込み中...</p>
                </div>
              ) : (
                displayTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`border-l-4 p-4 rounded cursor-pointer hover:shadow-md transition-shadow ${getPriorityColor(todo.priority)}`}
                    onClick={() => {
                      if (todo.type === 'visit' && todo.customerId) {
                        router.push(`/customers/${todo.customerId}`);
                      } else if (
                        todo.type === 'create-estimate' &&
                        todo.customerId
                      ) {
                        router.push(
                          `/estimates/create-v2?customer=${todo.customerId}`,
                        );
                      } else if (
                        todo.type === 'follow-estimate' &&
                        todo.estimateId
                      ) {
                        router.push(`/estimates/editor-v3/${todo.estimateId}`);
                      } else if (todo.type === 'estimate' && todo.estimateId) {
                        router.push(`/estimates/editor-v3/${todo.estimateId}`);
                      } else if (todo.type === 'contract' && todo.contractId) {
                        router.push(`/contracts/${todo.contractId}`);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">
                            {getTypeIcon(todo.type)}
                          </span>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {todo.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              顧客: {todo.customer}
                              {todo.amount && (
                                <span className="ml-3">
                                  金額: ¥{todo.amount.toLocaleString()}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {todo.deadline}
                        </p>
                        <button
                          className="mt-2 text-blue-600 hover:text-blue-800 text-sm inline-flex items-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (todo.type === 'visit' && todo.customerId) {
                              router.push(`/customers/${todo.customerId}`);
                            } else if (
                              todo.type === 'create-estimate' &&
                              todo.customerId
                            ) {
                              router.push(
                                `/estimates/create-v2?customer=${todo.customerId}`,
                              );
                            } else if (
                              todo.type === 'follow-estimate' &&
                              todo.estimateId
                            ) {
                              router.push(
                                `/estimates/editor-v3/${todo.estimateId}`,
                              );
                            } else if (
                              todo.type === 'estimate' &&
                              todo.estimateId
                            ) {
                              router.push(
                                `/estimates/editor-v3/${todo.estimateId}`,
                              );
                            } else if (
                              todo.type === 'contract' &&
                              todo.contractId
                            ) {
                              router.push(`/contracts/${todo.contractId}`);
                            }
                          }}
                        >
                          詳細を見る
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* KPI進捗 */}
          <div className="bg-white rounded-lg shadow mt-6">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">📊 今月の成績</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">月間売上</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ¥{stats.monthlyRevenue.toLocaleString()}
                  </p>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min((stats.monthlyRevenue / 10000000) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">成約率</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.conversionRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.conversionRate > 30 ? '良好' : '改善余地あり'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">新規リード</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.newLeads}件
                  </p>
                  <p className="text-xs text-gray-500 mt-1">今月獲得</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">保留見積</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.pendingEstimates}件
                  </p>
                  <p className="text-xs text-gray-500 mt-1">フォロー必要</p>
                </div>
              </div>
            </div>
          </div>

          {/* 営業分析ダッシュボード */}
          <div className="bg-white rounded-lg shadow mt-6">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-dandori-blue/5 to-dandori-sky/5">
              <h2 className="text-lg font-semibold text-gray-900">
                📊 営業分析ダッシュボード
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                データドリブンな営業戦略をサポート
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 営業パフォーマンス分析 */}
                <button
                  onClick={() => router.push('/analytics/sales-performance')}
                  className="p-4 border-2 border-green-200 bg-green-50 rounded-lg hover:bg-green-100 text-left transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white text-lg">
                      📈
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900">
                        営業パフォーマンス分析
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-green-700">
                    受注実績・パイプライン・目標達成率を分析
                  </p>
                </button>

                {/* 顧客別収益分析 */}
                <button
                  onClick={() => router.push('/analytics/customer-revenue')}
                  className="p-4 border-2 border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 text-left transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-lg">
                      💰
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900">
                        顧客別収益分析
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-blue-700">
                    売上・粗利・LTV・成長率を顧客別に可視化
                  </p>
                </button>

                {/* AI受注予測 */}
                <button
                  onClick={() => router.push('/analytics/win-prediction')}
                  className="p-4 border-2 border-orange-200 bg-orange-50 rounded-lg hover:bg-orange-100 text-left transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white text-lg">
                      🤖
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-orange-900">
                        AI受注予測
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-orange-700">
                    機械学習による見積案件の受注確度予測
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* 統合財務分析ダッシュボード */}
          <div className="bg-white rounded-2xl shadow-lg mt-6 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-dandori-pink to-dandori-orange text-white">
              <h3 className="font-semibold">📊 営業財務分析</h3>
            </div>
            <div className="p-6">
              {/* 営業成果指標 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-bold text-green-800 mb-2">💰 収益指標</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>営業利益</span>
                      <span className="font-bold">
                        ¥
                        {(
                          (financialMetrics?.profit.amount || 0) / 1000000
                        ).toFixed(1)}
                        M
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>粗利率</span>
                      <span className="font-bold">
                        {financialMetrics?.profit.margin.toFixed(1) || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>受注単価</span>
                      <span className="font-bold">
                        ¥
                        {(
                          (financialMetrics?.efficiency.avgDealSize || 0) /
                          1000000
                        ).toFixed(1)}
                        M
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-bold text-blue-800 mb-2">📈 営業効率</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>成約率</span>
                      <span
                        className={`font-bold ${(financialMetrics?.efficiency.conversionRate || 0) > 30 ? 'text-green-600' : 'text-orange-600'}`}
                      >
                        {financialMetrics?.efficiency.conversionRate.toFixed(
                          1,
                        ) || 0}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>リードタイム</span>
                      <span className="font-bold">
                        {financialMetrics?.efficiency.salesCycle || 0}日
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>月間売上</span>
                      <span className="font-bold">
                        ¥
                        {(
                          (financialMetrics?.revenue.monthly || 0) / 1000000
                        ).toFixed(1)}
                        M
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 目標達成状況 */}
              <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                <h5 className="font-bold text-yellow-800 mb-2">🎯 目標進捗</h5>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>月次売上目標</span>
                      <span>
                        ¥
                        {(
                          (financialMetrics?.revenue.monthly || 0) / 1000000
                        ).toFixed(1)}
                        M / ¥
                        {(
                          (financialMetrics?.projections.monthlyTarget ||
                            10000000) / 1000000
                        ).toFixed(0)}
                        M
                      </span>
                    </div>
                    <div className="w-full bg-yellow-200 rounded-full h-2">
                      <div
                        className="bg-yellow-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(financialMetrics?.projections.currentProgress || 0, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>四半期目標</span>
                      <span>
                        ¥
                        {(
                          (financialMetrics?.revenue.quarterly || 0) / 1000000
                        ).toFixed(1)}
                        M / ¥
                        {(
                          (financialMetrics?.projections.quarterlyTarget ||
                            30000000) / 1000000
                        ).toFixed(0)}
                        M
                      </span>
                    </div>
                    <div className="w-full bg-yellow-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            ((financialMetrics?.revenue.quarterly || 0) /
                              (financialMetrics?.projections.quarterlyTarget ||
                                30000000)) *
                              100,
                            100,
                          )}%`,
                        }}
                      ></div>
                    </div>
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
                  <div className="text-xs font-medium">経費申請</div>
                </button>
                <button
                  onClick={() => router.push('/inventory')}
                  className="p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition text-center"
                >
                  <div className="text-xl mb-1">📦</div>
                  <div className="text-xs font-medium">在庫確認</div>
                </button>
                <button className="p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition text-center">
                  <div className="text-xl mb-1">📊</div>
                  <div className="text-xs font-medium">売上分析</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RAGアシスタント */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow sticky top-6">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-dandori-pink to-dandori-orange text-white rounded-t-lg">
              <h2 className="text-lg font-semibold">🤖 RAGアシスタント</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded">
                  <p className="text-sm font-medium text-purple-900 mb-2">
                    💡 おすすめ質問
                  </p>
                  <div className="space-y-2">
                    <button className="w-full text-left text-sm bg-white p-2 rounded hover:bg-purple-100">
                      「田中様邸に似た過去案件は？」
                    </button>
                    <button className="w-full text-left text-sm bg-white p-2 rounded hover:bg-purple-100">
                      「外壁塗装の標準見積項目は？」
                    </button>
                    <button className="w-full text-left text-sm bg-white p-2 rounded hover:bg-purple-100">
                      「粗利20%確保の価格設定は？」
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    質問を入力
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    rows={3}
                    placeholder="例: 築20年木造の外壁塗装の相場は？"
                  />
                  <button
                    onClick={() => setShowRAGModal(true)}
                    className="mt-2 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
                  >
                    RAGに聞く
                  </button>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    最近の検索
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>• 屋根リフォーム 見積項目</p>
                    <p>• 協力会社A 過去実績</p>
                    <p>• 原価率 改善方法</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 営業活動センター */}
      <div className="bg-gradient-to-r from-dandori-blue to-dandori-sky text-white rounded-2xl shadow-xl p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <span className="text-3xl mr-3">🎯</span>
          営業活動センター
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => router.push('/customers')}
            className="bg-white/20 backdrop-blur-sm p-4 rounded-xl hover:bg-white/30 transform hover:scale-105 transition-all duration-200 border border-white/30"
          >
            <span className="text-3xl">👥</span>
            <p className="mt-2 font-bold">顧客管理</p>
            <p className="text-xs text-white/80">CRM</p>
          </button>
          <button
            onClick={() => router.push('/estimates/editor-v3/new')}
            className="bg-white/20 backdrop-blur-sm p-4 rounded-xl hover:bg-white/30 transform hover:scale-105 transition-all duration-200 border border-white/30"
          >
            <span className="text-3xl">📝</span>
            <p className="mt-2 font-bold">新規見積</p>
            <p className="text-xs text-white/80">作成</p>
          </button>
          <button
            onClick={() => router.push('/estimates')}
            className="bg-white/20 backdrop-blur-sm p-4 rounded-xl hover:bg-white/30 transform hover:scale-105 transition-all duration-200 border border-white/30"
          >
            <span className="text-3xl">📊</span>
            <p className="mt-2 font-bold">見積一覧</p>
            <p className="text-xs text-white/80">管理</p>
          </button>
          <button
            onClick={() => setShowMapModal(true)}
            className="bg-white/20 backdrop-blur-sm p-4 rounded-xl hover:bg-white/30 transform hover:scale-105 transition-all duration-200 border border-white/30"
          >
            <span className="text-3xl">🗺️</span>
            <p className="mt-2 font-bold">地図分析</p>
            <p className="text-xs text-white/80">エリア</p>
          </button>
          <button
            onClick={() => router.push('/construction-ledgers')}
            className="bg-white/20 backdrop-blur-sm p-4 rounded-xl hover:bg-white/30 transform hover:scale-105 transition-all duration-200 border border-white/30"
          >
            <span className="text-3xl">🏗️</span>
            <p className="mt-2 font-bold">工事台帳</p>
            <p className="text-xs text-white/80">管理</p>
          </button>
        </div>
      </div>

      {/* 契約管理 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">契約管理</h3>
        <p className="text-sm text-gray-600 mb-4">
          受注済み見積から作成された契約を管理
        </p>
        <button
          onClick={() => router.push('/contracts')}
          className="w-full bg-gradient-to-r from-dandori-blue to-dandori-sky text-white py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <span className="text-xl">📄</span>
          <span className="font-medium">契約一覧を見る</span>
        </button>
      </div>

      {/* 顧客管理モーダル */}
      <CustomerDetailModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
      />

      {/* 地図分析モーダル */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">🗺️ エリア地図分析</h3>
              <button
                onClick={() => setShowMapModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* 地図プレースホルダー */}
              <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">🗺️</div>
                  <p className="text-gray-600">営業エリアマップ</p>
                  <p className="text-sm text-gray-500">
                    顧客分布・案件密度を表示
                  </p>
                </div>
              </div>

              {/* エリア統計 */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">45</div>
                  <div className="text-xs text-gray-600">世田谷区</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">32</div>
                  <div className="text-xs text-gray-600">目黒区</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">28</div>
                  <div className="text-xs text-gray-600">渋谷区</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">21</div>
                  <div className="text-xs text-gray-600">杉並区</div>
                </div>
              </div>

              {/* フィルター */}
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  見込み客
                </button>
                <button className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  既存顧客
                </button>
                <button className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                  施工中
                </button>
                <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  完了案件
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowMapModal(false);
                    router.push('/map');
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  詳細地図を開く
                </button>
                <button
                  onClick={() => setShowMapModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RAGアシスタントモーダル */}
      {showRAGModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">🤖 RAGアシスタント回答</h3>
              <button
                onClick={() => setShowRAGModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* 質問 */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-medium mb-1">
                  質問:
                </p>
                <p className="text-gray-800">築20年木造の外壁塗装の相場は？</p>
              </div>

              {/* 回答 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-medium mb-2">
                  RAGアシスタントの回答:
                </p>
                <div className="space-y-3 text-gray-800">
                  <p>
                    築20年の木造住宅の外壁塗装について、過去の実績データから以下の情報をご提供します：
                  </p>

                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-bold mb-2">📊 価格相場</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• 30坪（100㎡）: 80万円〜120万円</li>
                      <li>• 40坪（132㎡）: 100万円〜150万円</li>
                      <li>• 50坪（165㎡）: 120万円〜180万円</li>
                    </ul>
                  </div>

                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-bold mb-2">🎨 塗料グレード別価格</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• シリコン塗料: 2,300〜3,000円/㎡</li>
                      <li>• フッ素塗料: 3,800〜4,800円/㎡</li>
                      <li>• 無機塗料: 4,500〜5,500円/㎡</li>
                    </ul>
                  </div>

                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-bold mb-2">📝 類似案件実績</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• 田中様邸（築22年、35坪）: 105万円</li>
                      <li>• 山田様邸（築18年、40坪）: 128万円</li>
                      <li>• 佐藤様邸（築20年、38坪）: 115万円</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 関連情報 */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-2">
                  💡 追加のアドバイス:
                </p>
                <p className="text-sm text-gray-700">
                  築20年の場合、シーリング打ち替えや下地補修が必要なケースが多いため、
                  現地調査時に詳細確認することをお勧めします。
                </p>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
                  関連質問をする
                </button>
                <button
                  onClick={() => setShowRAGModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
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
