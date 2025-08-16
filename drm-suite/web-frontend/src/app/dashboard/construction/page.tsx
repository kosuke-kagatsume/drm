'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// モックデータ
const mockSites = [
  {
    id: 1,
    name: '山田様邸新築工事',
    address: '東京都世田谷区○○1-2-3',
    startTime: '08:00',
    endTime: '17:00',
    manager: '田中 三郎',
    priority: 'high',
    status: 'in_progress',
    progress: 60,
    workers: 5,
    memo: '基礎工事完了、上棟準備中',
  },
  {
    id: 2,
    name: '鈴木様邸リフォーム',
    address: '東京都渋谷区△△2-3-4',
    startTime: '09:00',
    endTime: '16:00',
    manager: '田中 三郎',
    priority: 'normal',
    status: 'in_progress',
    progress: 30,
    workers: 3,
    memo: '内装解体中',
  },
  {
    id: 3,
    name: '佐藤様邸外壁塗装',
    address: '東京都新宿区××3-4-5',
    startTime: '10:00',
    endTime: '15:00',
    manager: '田中 三郎',
    priority: 'urgent',
    status: 'delayed',
    progress: 45,
    workers: 2,
    memo: '【緊急】クレーム対応必要',
  },
  {
    id: 4,
    name: '高橋様邸キッチン改修',
    address: '東京都目黒区□□4-5-6',
    startTime: '13:00',
    endTime: '18:00',
    manager: '田中 三郎',
    priority: 'normal',
    status: 'in_progress',
    progress: 80,
    workers: 4,
    memo: '最終確認待ち',
  },
  {
    id: 5,
    name: '中村様邸屋根修理',
    address: '東京都品川区◯◯5-6-7',
    startTime: '14:00',
    endTime: '17:00',
    manager: '田中 三郎',
    priority: 'high',
    status: 'inspection',
    progress: 90,
    workers: 2,
    memo: '明日検査予定',
  },
];

const mockProgress = [
  { projectId: 1, earnedValue: 1200000, unapproved: 150000 },
  { projectId: 2, earnedValue: 450000, unapproved: 50000 },
  { projectId: 3, earnedValue: 320000, unapproved: 80000 },
  { projectId: 4, earnedValue: 680000, unapproved: 0 },
  { projectId: 5, earnedValue: 290000, unapproved: 30000 },
];

const mockMaterials = [
  {
    name: '断熱材',
    status: 'shortage',
    remaining: 2,
    required: 10,
    unit: '箱',
  },
  {
    name: 'フローリング材',
    status: 'unordered',
    remaining: 0,
    required: 50,
    unit: '㎡',
  },
  { name: '石膏ボード', status: 'low', remaining: 5, required: 20, unit: '枚' },
];

const mockChangeOrders = [
  {
    id: 1,
    projectName: '山田様邸',
    amount: 350000,
    reason: '追加収納設置',
    status: 'draft',
  },
  {
    id: 2,
    projectName: '鈴木様邸',
    amount: 780000,
    reason: '間取り変更',
    status: 'pending',
  },
  {
    id: 3,
    projectName: '佐藤様邸',
    amount: 120000,
    reason: '塗料グレードアップ',
    status: 'draft',
  },
];

export default function ConstructionDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [selectedSite, setSelectedSite] = useState<any>(null);

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name !== '田中 三郎') {
      router.push('/dashboard');
    }
    setUserName(name || '');
  }, [router]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#FF4444';
      case 'high':
        return '#FF9933';
      case 'normal':
        return '#0099CC';
      default:
        return '#0099CC';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_progress':
        return '進行中';
      case 'delayed':
        return '遅延';
      case 'inspection':
        return '検査待ち';
      default:
        return status;
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #0099CC15 0%, #66CCFF15 100%)',
      }}
    >
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#0099CC' }}>
                施工管理ダッシュボード
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {new Date().toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">👷‍♂️ {userName}</span>
              <button
                onClick={() => {
                  localStorage.clear();
                  router.push('/login');
                }}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左カラム：今日の現場予定 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🏗️</span>
                今日の現場予定（優先度順）
              </h2>
              <div className="space-y-3">
                {mockSites
                  .sort((a, b) => {
                    const priorityOrder = { urgent: 0, high: 1, normal: 2 };
                    return (
                      priorityOrder[a.priority] - priorityOrder[b.priority]
                    );
                  })
                  .map((site) => (
                    <div
                      key={site.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      style={{
                        borderLeft: `4px solid ${getPriorityColor(site.priority)}`,
                      }}
                      onClick={() => setSelectedSite(site)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold">{site.name}</h3>
                            {site.priority === 'urgent' && (
                              <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                                緊急
                              </span>
                            )}
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                site.status === 'delayed'
                                  ? 'bg-red-100 text-red-600'
                                  : site.status === 'inspection'
                                    ? 'bg-yellow-100 text-yellow-600'
                                    : 'bg-green-100 text-green-600'
                              }`}
                            >
                              {getStatusText(site.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            📍 {site.address}
                          </p>
                          <p className="text-sm text-gray-600">
                            ⏰ {site.startTime} - {site.endTime} | 👷 作業員{' '}
                            {site.workers}名
                          </p>
                          {site.memo && (
                            <p
                              className="text-sm mt-1"
                              style={{
                                color:
                                  site.priority === 'urgent'
                                    ? '#FF4444'
                                    : '#666',
                              }}
                            >
                              📝 {site.memo}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div
                            className="text-2xl font-bold"
                            style={{ color: '#0099CC' }}
                          >
                            {site.progress}%
                          </div>
                          <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${site.progress}%`,
                                background:
                                  'linear-gradient(90deg, #0099CC, #00CCFF)',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* 進捗・出来高・未承認請求 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">💰</span>
                進捗・出来高管理
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">現場名</th>
                      <th className="text-right py-2">出来高金額</th>
                      <th className="text-right py-2">未承認請求</th>
                      <th className="text-center py-2">アクション</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockSites.map((site, idx) => {
                      const progress = mockProgress[idx];
                      return (
                        <tr key={site.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">{site.name}</td>
                          <td className="text-right">
                            ¥{progress.earnedValue.toLocaleString()}
                          </td>
                          <td className="text-right">
                            {progress.unapproved > 0 ? (
                              <span className="text-red-600 font-bold">
                                ¥{progress.unapproved.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="text-center">
                            <button className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">
                              詳細
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 右カラム：アラートと変更工事 */}
          <div className="space-y-4">
            {/* 資材欠品/未発注アラート */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                資材アラート
              </h2>
              <div className="space-y-3">
                {mockMaterials.map((material, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      material.status === 'shortage'
                        ? 'bg-red-50 border border-red-200'
                        : material.status === 'unordered'
                          ? 'bg-yellow-50 border border-yellow-200'
                          : 'bg-orange-50 border border-orange-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{material.name}</p>
                        <p className="text-xs text-gray-600">
                          在庫: {material.remaining}
                          {material.unit} / 必要: {material.required}
                          {material.unit}
                        </p>
                      </div>
                      <button className="px-3 py-1 text-xs bg-white border rounded hover:bg-gray-50">
                        発注
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 変更工事（CO）ドラフト */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">📝</span>
                変更工事（CO）
              </h2>
              <div className="space-y-3">
                {mockChangeOrders.map((co) => (
                  <div
                    key={co.id}
                    className="p-3 border rounded-lg hover:shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{co.projectName}</p>
                        <p className="text-xs text-gray-600">{co.reason}</p>
                        <p
                          className="text-sm font-bold mt-1"
                          style={{ color: '#0099CC' }}
                        >
                          ¥{co.amount.toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          co.status === 'draft'
                            ? 'bg-gray-100'
                            : 'bg-yellow-100'
                        }`}
                      >
                        {co.status === 'draft' ? '下書き' : '承認待ち'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600">
                新規CO作成
              </button>
            </div>

            {/* クイックアクション */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4">クイックアクション</h2>
              <div className="space-y-2">
                <button className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center gap-3">
                  <span>📸</span> 現場写真確認（DW連携）
                </button>
                <button className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center gap-3">
                  <span>✅</span> チェックリスト確認
                </button>
                <button className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center gap-3">
                  <span>📊</span> 原価管理表
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 現場詳細モーダル */}
      {selectedSite && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedSite(null)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">{selectedSite.name}</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">住所</p>
                <p>{selectedSite.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">進捗状況</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex-1">
                    <div className="w-full h-4 bg-gray-200 rounded-full">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${selectedSite.progress}%`,
                          background:
                            'linear-gradient(90deg, #0099CC, #00CCFF)',
                        }}
                      />
                    </div>
                  </div>
                  <span
                    className="text-2xl font-bold"
                    style={{ color: '#0099CC' }}
                  >
                    {selectedSite.progress}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">メモ</p>
                <p>{selectedSite.memo}</p>
              </div>
              <div className="flex gap-3 mt-6">
                <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg">
                  出来高登録
                </button>
                <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
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
