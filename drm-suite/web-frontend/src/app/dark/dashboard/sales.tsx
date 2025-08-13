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

  const getTypeIndicator = (type: string) => {
    switch (type) {
      case 'estimate':
        return '01';
      case 'contract':
        return '02';
      case 'visit':
        return '03';
      default:
        return '00';
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
                        <div className="w-10 h-10 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-sm mr-4">
                          {getTypeIndicator(todo.type)}
                        </div>
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
                      <span className="font-bold">¥4.2M</span>
                    </div>
                    <div className="flex justify-between">
                      <span>粗利率</span>
                      <span className="font-bold">28.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>受注単価</span>
                      <span className="font-bold">¥2.1M</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-bold text-blue-800 mb-2">📈 営業効率</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>成約率</span>
                      <span className="font-bold text-green-600">35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>リードタイム</span>
                      <span className="font-bold">12日</span>
                    </div>
                    <div className="flex justify-between">
                      <span>顧客単価</span>
                      <span className="font-bold">¥1.8M</span>
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
                      <span>¥14.7M / ¥21M</span>
                    </div>
                    <div className="w-full bg-yellow-200 rounded-full h-2">
                      <div
                        className="bg-yellow-600 h-2 rounded-full"
                        style={{ width: '70%' }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>契約件数目標</span>
                      <span>7件 / 10件</span>
                    </div>
                    <div className="w-full bg-yellow-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: '70%' }}
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
            onClick={() => router.push('/dark/customers')}
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
