'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// モックデータ
const mockInspections = [
  {
    id: 1,
    customerName: '山田 太郎 様',
    address: '東京都世田谷区○○1-2-3',
    type: '1ヶ月点検',
    scheduledDate: '2024-08-20',
    status: 'scheduled',
    completionDate: '2023-07-20',
    priority: 'normal',
  },
  {
    id: 2,
    customerName: '鈴木 一郎 様',
    address: '東京都渋谷区△△2-3-4',
    type: '3ヶ月点検',
    scheduledDate: '2024-08-18',
    status: 'overdue',
    completionDate: '2023-05-18',
    priority: 'high',
  },
  {
    id: 3,
    customerName: '佐藤 次郎 様',
    address: '東京都新宿区××3-4-5',
    type: '6ヶ月点検',
    scheduledDate: '2024-08-25',
    status: 'scheduled',
    completionDate: '2023-02-25',
    priority: 'normal',
  },
  {
    id: 4,
    customerName: '高橋 花子 様',
    address: '東京都目黒区□□4-5-6',
    type: '1年点検',
    scheduledDate: '2024-08-30',
    status: 'scheduled',
    completionDate: '2022-08-30',
    priority: 'normal',
  },
  {
    id: 5,
    customerName: '田中 三郎 様',
    address: '東京都品川区◯◯5-6-7',
    type: '3年点検',
    scheduledDate: '2024-09-15',
    status: 'scheduled',
    completionDate: '2020-09-15',
    priority: 'normal',
  },
];

const mockDefects = [
  {
    id: 1,
    customerName: '木村 様',
    issue: '外壁クラック',
    reportDate: '2024-08-10',
    status: 'estimate_created',
    estimateAmount: 150000,
    progress: 'draft',
  },
  {
    id: 2,
    customerName: '渡辺 様',
    issue: '屋根瓦ずれ',
    reportDate: '2024-08-12',
    status: 'accepted',
    estimateAmount: 280000,
    progress: 'construction',
  },
  {
    id: 3,
    customerName: '伊藤 様',
    issue: '給湯器不調',
    reportDate: '2024-08-15',
    status: 'pending',
    estimateAmount: 95000,
    progress: 'waiting',
  },
];

const mockCSScores = {
  nps: 72,
  satisfaction: 4.3,
  reviews: 156,
  thisMonth: {
    nps: 75,
    satisfaction: 4.5,
    count: 12,
  },
};

export default function AftercareDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showEstimateModal, setShowEstimateModal] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<any>(null);
  const [reminderSettings, setReminderSettings] = useState({
    oneMonth: true,
    oneWeek: true,
    oneDay: false,
  });

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name !== '中村 次郎') {
      router.push('/dashboard');
    }
    setUserName(name || '');
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return '#FF4444';
      case 'scheduled':
        return '#0099CC';
      case 'completed':
        return '#10B981';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'overdue':
        return '期限超過';
      case 'scheduled':
        return '予定';
      case 'completed':
        return '完了';
      default:
        return status;
    }
  };

  const getDaysUntil = (date: string) => {
    const today = new Date();
    const scheduled = new Date(date);
    const diff = Math.ceil(
      (scheduled.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diff < 0) return `${Math.abs(diff)}日超過`;
    if (diff === 0) return '本日';
    if (diff === 1) return '明日';
    return `${diff}日後`;
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
                アフターサービスダッシュボード
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
              <span className="text-sm text-gray-600">🔧 {userName}</span>
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
        {/* CS/NPS指標 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">NPS スコア</p>
            <p className="text-2xl font-bold" style={{ color: '#0099CC' }}>
              {mockCSScores.nps}
            </p>
            <p className="text-xs text-green-600">前月比 +3</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">顧客満足度</p>
            <p className="text-2xl font-bold" style={{ color: '#0099CC' }}>
              {mockCSScores.satisfaction}/5.0
            </p>
            <p className="text-xs text-gray-500">
              レビュー {mockCSScores.reviews}件
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">今月の点検</p>
            <p className="text-2xl font-bold" style={{ color: '#0099CC' }}>
              {mockCSScores.thisMonth.count}件
            </p>
            <p className="text-xs text-gray-500">完了率 75%</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">是正受注額</p>
            <p className="text-2xl font-bold" style={{ color: '#0099CC' }}>
              ¥525,000
            </p>
            <p className="text-xs text-green-600">前月比 +12%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左カラム：点検予定 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 今週/今月の点検予定 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="text-2xl">📅</span>
                  点検予定
                </h2>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded">
                    今週
                  </button>
                  <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded">
                    今月
                  </button>
                  <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded">
                    来月
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {mockInspections.map((inspection) => (
                  <div
                    key={inspection.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    style={{
                      borderLeft: `4px solid ${getStatusColor(inspection.status)}`,
                    }}
                    onClick={() => setSelectedInspection(inspection)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold">
                            {inspection.customerName}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              inspection.status === 'overdue'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-blue-100 text-blue-600'
                            }`}
                          >
                            {inspection.type}
                          </span>
                          {inspection.status === 'overdue' && (
                            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                              期限超過
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          📍 {inspection.address}
                        </p>
                        <p className="text-sm text-gray-600">
                          📅 {inspection.scheduledDate} (
                          {getDaysUntil(inspection.scheduledDate)})
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          完工日: {inspection.completionDate}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowInspectionModal(true);
                        }}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        点検開始
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 是正案件ステータス */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🔨</span>
                是正案件
              </h2>
              <div className="space-y-3">
                {mockDefects.map((defect) => (
                  <div key={defect.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-bold">{defect.customerName}</p>
                        <p className="text-sm text-gray-700">{defect.issue}</p>
                        <p className="text-xs text-gray-500">
                          報告日: {defect.reportDate}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span
                            className="text-sm font-bold"
                            style={{ color: '#0099CC' }}
                          >
                            ¥{defect.estimateAmount.toLocaleString()}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              defect.progress === 'construction'
                                ? 'bg-green-100 text-green-600'
                                : defect.progress === 'draft'
                                  ? 'bg-gray-100 text-gray-600'
                                  : 'bg-yellow-100 text-yellow-600'
                            }`}
                          >
                            {defect.progress === 'construction'
                              ? '工事中'
                              : defect.progress === 'draft'
                                ? '見積作成済'
                                : '承認待ち'}
                          </span>
                        </div>
                      </div>
                      <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded">
                        詳細
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右カラム：リマインド設定とアクション */}
          <div className="space-y-4">
            {/* リマインド設定 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🔔</span>
                リマインド設定
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminderSettings.oneMonth}
                    onChange={(e) =>
                      setReminderSettings({
                        ...reminderSettings,
                        oneMonth: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">1ヶ月前に通知</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminderSettings.oneWeek}
                    onChange={(e) =>
                      setReminderSettings({
                        ...reminderSettings,
                        oneWeek: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">1週間前に通知</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminderSettings.oneDay}
                    onChange={(e) =>
                      setReminderSettings({
                        ...reminderSettings,
                        oneDay: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">前日に通知</span>
                </label>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">通知方法</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    メール
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="w-4 h-4" />
                    SMS
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-400">
                    <input type="checkbox" disabled className="w-4 h-4" />
                    LINE（準備中）
                  </label>
                </div>
              </div>
            </div>

            {/* 即時見積作成 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">📱</span>
                即時見積
              </h2>
              <button
                onClick={() => setShowEstimateModal(true)}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600"
              >
                現場で見積作成
              </button>
              <p className="text-xs text-gray-500 mt-2">
                スマホ/タブレット対応
              </p>
            </div>

            {/* 保証区分 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🛡️</span>
                保証区分
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm">構造保証</span>
                  <span className="text-sm font-bold">10年</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm">雨漏り保証</span>
                  <span className="text-sm font-bold">10年</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm">設備保証</span>
                  <span className="text-sm font-bold">1-5年</span>
                </div>
              </div>
            </div>

            {/* クイックアクション */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4">クイックアクション</h2>
              <div className="space-y-2">
                <button className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center gap-3">
                  <span>📋</span> チェックリスト
                </button>
                <button className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center gap-3">
                  <span>📷</span> 写真アップロード
                </button>
                <button className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center gap-3">
                  <span>📊</span> CS/NPSレポート
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 点検実施モーダル */}
      {showInspectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">点検実施</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  点検種別
                </label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>1ヶ月点検</option>
                  <option>3ヶ月点検</option>
                  <option>6ヶ月点検</option>
                  <option>1年点検</option>
                  <option>3年点検</option>
                  <option>5年点検</option>
                  <option>10年点検</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  不具合の有無
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="defect" value="none" />
                    <span>なし</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="defect" value="exists" />
                    <span>あり</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">備考</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                ></textarea>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="create-estimate" />
                <label htmlFor="create-estimate" className="text-sm">
                  即時見積を作成する
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg">
                  点検完了
                </button>
                <button
                  onClick={() => setShowInspectionModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 即時見積モーダル */}
      {showEstimateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">即時見積作成</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  お客様名
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  工事内容
                </label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>外壁補修</option>
                  <option>屋根補修</option>
                  <option>設備交換</option>
                  <option>その他</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  見積金額
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="¥"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">工期</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="例: 3日間"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">詳細</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                ></textarea>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">契約方法</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="contract" value="now" />
                    <span className="text-sm">その場で契約</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="contract" value="later" />
                    <span className="text-sm">後日提出</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg">
                  見積作成
                </button>
                <button
                  onClick={() => setShowEstimateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
