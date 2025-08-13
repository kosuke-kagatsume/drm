'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCustomers } from '@/hooks/useCustomers';
import { useEstimates } from '@/hooks/useEstimates';
import { useFinancialMetrics } from '@/hooks/useFinancialMetrics';

interface TodoItem {
  id: string;
  title: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  type: 'estimate' | 'contract' | 'visit';
  customer: string;
  amount?: number;
}

interface SalesDashboardProps {
  userEmail: string;
}

export default function SalesDashboard({ userEmail }: SalesDashboardProps) {
  const router = useRouter();
  const [todayTodos, setTodayTodos] = useState<TodoItem[]>([]);
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
            type: 'visit',
            customer: customer.companyName || customer.name,
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
          type: 'estimate',
          customer: estimate.customerName,
          amount: estimate.totalAmount,
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
        ?.filter((e) => e.status === 'approved')
        ?.reduce((sum, e) => sum + e.totalAmount, 0) || 0;

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
                onClick={() => router.push('/estimates/create')}
                className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                見積作成へ →
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
                    className={`border-l-4 p-4 rounded ${getPriorityColor(todo.priority)}`}
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
                        <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm">
                          詳細 →
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

          {/* 統合財務分析ダッシュボード */}
          <div className="bg-white rounded-2xl shadow-lg mt-6 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
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
            <div className="px-6 py-4 border-b bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
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
                  <button className="mt-2 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
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
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl shadow-xl p-6 mb-6">
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
            onClick={() => router.push('/estimates/create')}
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
            onClick={() => router.push('/map')}
            className="bg-white/20 backdrop-blur-sm p-4 rounded-xl hover:bg-white/30 transform hover:scale-105 transition-all duration-200 border border-white/30"
          >
            <span className="text-3xl">🗺️</span>
            <p className="mt-2 font-bold">地図分析</p>
            <p className="text-xs text-white/80">エリア</p>
          </button>
        </div>
      </div>

      {/* その他のツール */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => router.push('/contracts')}
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <span className="text-2xl">📄</span>
          <p className="mt-2 font-medium">契約管理</p>
        </button>
        <button
          onClick={() => router.push('/vendors')}
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <span className="text-2xl">👷</span>
          <p className="mt-2 font-medium">協力会社</p>
        </button>
        <button
          onClick={() => router.push('/invoices')}
          className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <span className="text-2xl">💰</span>
          <p className="mt-2 font-medium">請求書</p>
        </button>
        <button
          onClick={() => router.push('/expenses')}
          className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <span className="text-2xl">💳</span>
          <p className="mt-2 font-medium">経費精算</p>
        </button>
      </div>
    </div>
  );
}
