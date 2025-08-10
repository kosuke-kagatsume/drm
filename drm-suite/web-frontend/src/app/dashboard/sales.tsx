'use client';

import { useRouter } from 'next/navigation';

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

  const todayTodos: TodoItem[] = [
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

  const kpiData = {
    monthlyTarget: 10,
    currentContracts: 7,
    conversionRate: 35,
    averageAmount: 2100000,
  };

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
                  {todayTodos.length}件
                </span>
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {todayTodos.map((todo) => (
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
              ))}
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
                  <p className="text-sm text-gray-600">契約件数</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {kpiData.currentContracts}/{kpiData.monthlyTarget}
                  </p>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(kpiData.currentContracts / kpiData.monthlyTarget) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">成約率</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {kpiData.conversionRate}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">先月比 +5%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">平均契約金額</p>
                  <p className="text-xl font-bold text-gray-900">
                    ¥{kpiData.averageAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">目標達成率</p>
                  <p className="text-2xl font-bold text-green-600">70%</p>
                </div>
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

      {/* クイックアクション */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => router.push('/estimates/create')}
          className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition"
        >
          <span className="text-2xl">📝</span>
          <p className="mt-2 font-medium">新規見積</p>
        </button>
        <button
          onClick={() => router.push('/estimates')}
          className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition"
        >
          <span className="text-2xl">📊</span>
          <p className="mt-2 font-medium">見積一覧</p>
        </button>
        <button
          onClick={() => router.push('/vendors')}
          className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition"
        >
          <span className="text-2xl">👷</span>
          <p className="mt-2 font-medium">協力会社</p>
        </button>
        <button className="bg-orange-500 text-white p-4 rounded-lg hover:bg-orange-600 transition">
          <span className="text-2xl">📅</span>
          <p className="mt-2 font-medium">来店予約</p>
        </button>
      </div>
    </div>
  );
}
