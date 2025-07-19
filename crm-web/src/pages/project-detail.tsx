import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { mockProjects, mockOrders, statusColors, statusLabels } from '@/lib/mock-data';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary');

  const project = mockProjects.find((p) => p.id === id);
  const projectOrders = mockOrders.filter((o) => o.projectId === id);

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">プロジェクトが見つかりません</p>
        <button
          onClick={() => navigate('/projects')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          一覧に戻る
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'summary', label: '概要' },
    { id: 'orders', label: '発注管理' },
    { id: 'schedule', label: '工程表' },
    { id: 'documents', label: '書類' },
    { id: 'photos', label: '写真' },
  ];

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/projects')}
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            ← 一覧に戻る
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/projects/${id}/follow-up`)}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              追客履歴
            </button>
            <button
              onClick={() => navigate(`/quote?projectId=${id}`)}
              className="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              見積作成
            </button>
            <button className="px-4 py-2 text-sm border rounded hover:bg-gray-50">編集</button>
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
              レポート出力
            </button>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
            <p className="text-gray-600">{project.address}</p>
          </div>
          <span
            className="px-3 py-1 rounded-full text-white"
            style={{ backgroundColor: statusColors[project.status] }}
          >
            {statusLabels[project.status]}
          </span>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* 概要タブ */}
          {activeTab === 'summary' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg mb-3">基本情報</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">顧客名</p>
                    <p className="font-medium">{project.customerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">担当</p>
                    <p className="font-medium">{project.assignee}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">契約金額</p>
                    <p className="font-medium">¥{project.contractAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">粗利見込</p>
                    <p className="font-medium">
                      ¥{(project.contractAmount * 0.3).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg mb-3">工程情報</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-500 text-sm">開始日</p>
                    <p className="font-medium">{project.startDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">完了予定日</p>
                    <p className="font-medium">{project.completionDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-2">進捗状況</p>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full flex items-center justify-center"
                        style={{ width: `${project.progress}%` }}
                      >
                        <span className="text-xs text-white">{project.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 発注管理タブ */}
          {activeTab === 'orders' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">発注一覧</h3>
                <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                  新規発注
                </button>
              </div>

              {projectOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">
                          発注ID
                        </th>
                        <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">
                          協力会社
                        </th>
                        <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">
                          工事種別
                        </th>
                        <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">
                          発注日
                        </th>
                        <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">
                          金額
                        </th>
                        <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">
                          状態
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectOrders.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm">{order.id}</td>
                          <td className="py-3 px-4 text-sm">{order.supplierName}</td>
                          <td className="py-3 px-4 text-sm">{order.category}</td>
                          <td className="py-3 px-4 text-sm">{order.orderDate}</td>
                          <td className="py-3 px-4 text-sm">¥{order.amount.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50">
                        <td colSpan={4} className="py-3 px-4 text-sm font-medium">
                          合計
                        </td>
                        <td className="py-3 px-4 text-sm font-medium">
                          ¥{projectOrders.reduce((sum, o) => sum + o.amount, 0).toLocaleString()}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="text-center py-8 text-gray-500">発注データがありません</p>
              )}
            </div>
          )}

          {/* 工程表タブ */}
          {activeTab === 'schedule' && (
            <div>
              <h3 className="font-semibold text-lg mb-4">工程表</h3>
              <div className="bg-gray-50 rounded p-8 text-center">
                <p className="text-gray-500">ガントチャート表示エリア</p>
                <p className="text-sm text-gray-400 mt-2">※ 実装予定</p>
              </div>
            </div>
          )}

          {/* 書類タブ */}
          {activeTab === 'documents' && (
            <div>
              <h3 className="font-semibold text-lg mb-4">関連書類</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded p-4 hover:bg-gray-50 cursor-pointer">
                  <p className="font-medium">契約書.pdf</p>
                  <p className="text-sm text-gray-500">2025/01/15 アップロード</p>
                </div>
                <div className="border rounded p-4 hover:bg-gray-50 cursor-pointer">
                  <p className="font-medium">見積書.xlsx</p>
                  <p className="text-sm text-gray-500">2025/01/10 アップロード</p>
                </div>
                <div className="border rounded p-4 hover:bg-gray-50 cursor-pointer">
                  <p className="font-medium">図面一式.zip</p>
                  <p className="text-sm text-gray-500">2025/01/20 アップロード</p>
                </div>
              </div>
            </div>
          )}

          {/* 写真タブ */}
          {activeTab === 'photos' && (
            <div>
              <h3 className="font-semibold text-lg mb-4">現場写真</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span>写真{i}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
