'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// モックデータ
const mockVisitors = [
  {
    id: 1,
    name: '新規のお客様',
    purpose: '見積相談',
    arrivalTime: '10:00',
    status: 'waiting',
  },
  {
    id: 2,
    name: '山田 様',
    purpose: '契約手続き',
    arrivalTime: '10:30',
    status: 'in_meeting',
    room: '契約室',
    assignee: '佐藤 次郎',
  },
];

const mockInquiries = [
  {
    id: 1,
    type: 'phone',
    name: '田中 様',
    content: 'リフォームの見積もりについて',
    time: '09:15',
    status: 'unassigned',
    priority: 'normal',
  },
  {
    id: 2,
    type: 'web',
    name: '鈴木 様',
    content: '【クレーム】工事の騒音について',
    time: '09:45',
    status: 'unassigned',
    priority: 'urgent',
  },
  {
    id: 3,
    type: 'email',
    name: '佐藤 様',
    content: '保証内容の確認',
    time: '10:20',
    status: 'assigned',
    assignee: '中村 次郎',
    priority: 'normal',
  },
];

const mockRooms = [
  { id: 1, name: '会議室A', status: 'available', nextReservation: '14:00' },
  {
    id: 2,
    name: '会議室B',
    status: 'occupied',
    currentUser: '営業会議',
    until: '11:30',
  },
  { id: 3, name: '会議室C', status: 'available', nextReservation: '15:00' },
  {
    id: 4,
    name: '契約室',
    status: 'occupied',
    currentUser: '山田様契約',
    until: '11:00',
  },
];

const mockVehicles = [
  { id: 1, name: '普通車A', number: '品川300あ1234', status: 'available' },
  {
    id: 2,
    name: '普通車B',
    number: '品川300い5678',
    status: 'in_use',
    user: '佐藤',
    returnTime: '12:00',
  },
  { id: 3, name: '普通車C', number: '品川300う9012', status: 'available' },
  {
    id: 4,
    name: 'トラック',
    number: '品川100か3456',
    status: 'in_use',
    user: '田中',
    returnTime: '17:00',
  },
];

export default function OfficeDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [showReceptionModal, setShowReceptionModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [assignee, setAssignee] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name !== '高橋 花子') {
      router.push('/dashboard');
    }
    setUserName(name || '');
  }, [router]);

  const getInquiryIcon = (type: string) => {
    switch (type) {
      case 'phone':
        return '📞';
      case 'web':
        return '🌐';
      case 'email':
        return '✉️';
      default:
        return '📝';
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
                事務ダッシュボード
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
              <span className="text-sm text-gray-600">👩‍💻 {userName}</span>
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
        {/* KPI */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">本日の来客数</p>
            <p className="text-2xl font-bold" style={{ color: '#0099CC' }}>
              8名
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">平均初動応答時間</p>
            <p className="text-2xl font-bold" style={{ color: '#0099CC' }}>
              3分
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">未返信数</p>
            <p className="text-2xl font-bold text-red-600">2件</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">顧客満足度</p>
            <p className="text-2xl font-bold" style={{ color: '#0099CC' }}>
              4.5
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左カラム：来店受付と問い合わせ */}
          <div className="lg:col-span-2 space-y-4">
            {/* 来店受付カード */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="text-2xl">🏢</span>
                  来店受付
                </h2>
                <button
                  onClick={() => setShowReceptionModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600"
                >
                  新規受付
                </button>
              </div>
              <div className="space-y-3">
                {mockVisitors.map((visitor) => (
                  <div key={visitor.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold">{visitor.name}</p>
                        <p className="text-sm text-gray-600">
                          目的: {visitor.purpose}
                        </p>
                        <p className="text-xs text-gray-500">
                          到着: {visitor.arrivalTime}
                        </p>
                      </div>
                      <div className="text-right">
                        {visitor.status === 'waiting' ? (
                          <div>
                            <p className="text-sm text-orange-600 mb-2">
                              待機中
                            </p>
                            <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                              担当呼出
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-green-600">
                              {visitor.room}使用中
                            </p>
                            <p className="text-xs text-gray-600">
                              担当: {visitor.assignee}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 問い合わせキュー */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">📨</span>
                問い合わせキュー
              </h2>
              <div className="space-y-3">
                {mockInquiries
                  .sort((a, b) => {
                    if (a.priority === 'urgent') return -1;
                    if (b.priority === 'urgent') return 1;
                    return 0;
                  })
                  .map((inquiry) => (
                    <div
                      key={inquiry.id}
                      className={`border rounded-lg p-4 cursor-pointer hover:shadow-md ${
                        inquiry.priority === 'urgent'
                          ? 'border-red-500 bg-red-50'
                          : ''
                      }`}
                      onClick={() => setSelectedInquiry(inquiry)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">
                              {getInquiryIcon(inquiry.type)}
                            </span>
                            <p className="font-bold">{inquiry.name}</p>
                            {inquiry.priority === 'urgent' && (
                              <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                                クレーム
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">
                            {inquiry.content}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            受付時間: {inquiry.time}
                          </p>
                        </div>
                        <div className="text-right">
                          {inquiry.status === 'unassigned' ? (
                            <button className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600">
                              割当
                            </button>
                          ) : (
                            <div>
                              <p className="text-sm text-green-600">対応中</p>
                              <p className="text-xs text-gray-600">
                                {inquiry.assignee}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* 右カラム：空き状況と顧客登録 */}
          <div className="space-y-4">
            {/* 商談室空き状況 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🚪</span>
                商談室・会議室
              </h2>
              <div className="space-y-2">
                {mockRooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex justify-between items-center p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{room.name}</p>
                      {room.status === 'available' ? (
                        <p className="text-xs text-green-600">
                          空き（次: {room.nextReservation}）
                        </p>
                      ) : (
                        <p className="text-xs text-red-600">
                          {room.currentUser}（～{room.until}）
                        </p>
                      )}
                    </div>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        room.status === 'available'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 車両空き状況 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🚗</span>
                車両管理
              </h2>
              <div className="space-y-2">
                {mockVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex justify-between items-center p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{vehicle.name}</p>
                      <p className="text-xs text-gray-500">{vehicle.number}</p>
                      {vehicle.status === 'in_use' && (
                        <p className="text-xs text-orange-600">
                          {vehicle.user}使用中（～{vehicle.returnTime}）
                        </p>
                      )}
                    </div>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        vehicle.status === 'available'
                          ? 'bg-green-500'
                          : 'bg-orange-500'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 新規顧客登録 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">👤</span>
                クイックアクション
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => setShowCustomerModal(true)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600"
                >
                  新規顧客登録
                </button>
                <button className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg">
                  予約管理
                </button>
                <button className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg">
                  在庫確認
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 来店受付モーダル */}
      {showReceptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">来店受付</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  お客様名
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="山田 太郎"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  来店目的
                </label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>見積相談</option>
                  <option>契約手続き</option>
                  <option>アフターサービス</option>
                  <option>クレーム</option>
                  <option>その他</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">担当者</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>指名なし（空いている人）</option>
                  <option>佐藤 次郎（営業）</option>
                  <option>田中 三郎（施工管理）</option>
                  <option>中村 次郎（アフター）</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">商談室</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg"
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                >
                  <option value="">自動割当</option>
                  <option value="meeting-a">会議室A</option>
                  <option value="meeting-b">会議室B</option>
                  <option value="meeting-c">会議室C</option>
                  <option value="contract">契約室</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg">
                  受付完了
                </button>
                <button
                  onClick={() => setShowReceptionModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 新規顧客登録モーダル */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">新規顧客登録</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  お名前 *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  電話番号 *
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">住所</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="初期は1つのみ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  メールアドレス
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <p className="text-xs text-gray-500">
                ※ 現場住所は見積/契約時に追加されます
              </p>
              <div className="flex gap-3 pt-4">
                <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg">
                  登録
                </button>
                <button
                  onClick={() => setShowCustomerModal(false)}
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
