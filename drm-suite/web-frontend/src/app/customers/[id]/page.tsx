'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface CustomerAction {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'chat' | 'line' | 'note' | 'voice';
  content: string;
  date: string;
  by: string;
  duration?: string;
  attachments?: string[];
  aiSummary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  nextAction?: string;
}

interface Communication {
  id: string;
  platform: 'email' | 'chatwork' | 'line' | 'slack';
  subject?: string;
  content: string;
  date: string;
  direction: 'inbound' | 'outbound';
  status: 'unread' | 'read' | 'replied';
}

export default function CustomerDetailPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showActionModal, setShowActionModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [editingNextAction, setEditingNextAction] = useState(false);

  // 顧客データを管理するstateに変更
  const [customer, setCustomer] = useState({
    id: '1',
    name: '田中太郎',
    company: '田中建設株式会社',
    email: 'tanaka@example.com',
    phone: '090-1234-5678',
    address: '東京都渋谷区〇〇1-2-3',
    tags: ['高額顧客', 'リピーター', '紹介あり'],
    status: '商談中',
    assignee: '山田花子',
    value: 8500000,
    createdAt: '2024-01-15T09:00:00',
    lastContact: '2024-02-10',
    nextAction: '修正見積もりを送付',
    nextActionDate: '2024-02-15',
    priority: 4, // 1-5 (5が最高)
  });

  const actions = [
    {
      id: '1',
      date: '2024-02-10',
      type: 'call',
      content: '見積もりについての相談。予算調整を検討中。',
      user: '山田花子',
      duration: '15分',
      result: '修正見積もりを2/15までに送付',
      sentiment: 'positive',
      nextAction: '修正見積もりを2/15までに送付',
    },
    {
      id: '2',
      date: '2024-02-08',
      type: 'email',
      content: '初回見積書を送付',
      user: '山田花子',
      attachments: ['見積書_田中様.pdf'],
      sentiment: 'neutral',
    },
    {
      id: '3',
      date: '2024-02-05',
      type: 'meeting',
      content: '初回商談。リフォーム内容のヒアリング。',
      user: '山田花子',
      duration: '60分',
      location: '弊社会議室',
      participants: ['田中太郎', '田中花子（奥様）'],
      result: '見積もり作成へ',
      sentiment: 'positive',
    },
    {
      id: '4',
      date: '2024-02-01',
      type: 'line',
      content: 'LINE公式アカウントから問い合わせ',
      user: 'システム',
      platform: 'LINE',
      sentiment: 'neutral',
    },
    {
      id: '5',
      date: '2024-01-30',
      type: 'chat',
      content: 'ウェブサイトのチャットから初回問い合わせ',
      user: 'システム',
      sentiment: 'neutral',
    },
  ];

  const communications = [
    { type: 'call', count: 5, lastDate: '2024-02-10' },
    { type: 'email', count: 12, lastDate: '2024-02-08' },
    { type: 'meeting', count: 2, lastDate: '2024-02-05' },
    { type: 'line', count: 8, lastDate: '2024-02-09' },
  ];

  const projects = [
    {
      id: '1',
      name: 'キッチンリフォーム',
      status: '見積中',
      budget: 3500000,
      startDate: '2024-03-01',
      progress: 20,
    },
    {
      id: '2',
      name: '外壁塗装',
      status: '検討中',
      budget: 2000000,
      startDate: '2024-04-01',
      progress: 10,
    },
  ];

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'call':
        return '📞';
      case 'email':
        return '📧';
      case 'meeting':
        return '👥';
      case 'line':
        return '💬';
      case 'chat':
        return '💭';
      case 'visit':
        return '🏠';
      default:
        return '📝';
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-50 border-green-200';
      case 'negative':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getPlatformIcon = (platform?: string) => {
    switch (platform) {
      case 'LINE':
        return '🟢';
      case 'Instagram':
        return '📷';
      case 'Twitter':
        return '🐦';
      default:
        return '💬';
    }
  };

  const handleSaveNextAction = () => {
    setEditingNextAction(false);
    // ここで実際のデータ保存処理を行う
    console.log('次回アクション保存:', {
      nextAction: customer.nextAction,
      nextActionDate: customer.nextActionDate,
      priority: customer.priority,
    });
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dandori-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-full-hd mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/customers')}
                className="text-gray-600 hover:text-gray-900 transition"
              >
                ← 戻る
              </button>
              <h1 className="text-xl font-bold">顧客詳細</h1>
            </div>
            <button
              onClick={() =>
                setCustomer({
                  ...customer,
                  priority:
                    customer.priority === 5 ? 1 : (customer.priority || 0) + 1,
                })
              }
              className="bg-gradient-dandori text-white px-4 py-2 rounded-lg hover:shadow-lg transition"
            >
              編集
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-full-hd mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Customer Header Card - Enhanced */}
        <div className="bg-gradient-to-r from-dandori-blue to-dandori-sky rounded-2xl shadow-xl p-8 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {customer.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{customer.name}</h1>
                  <p className="text-lg opacity-90">{customer.company}</p>
                  <div className="flex gap-2 mt-2">
                    {customer.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">顧客価値</p>
              <p className="text-3xl font-bold">
                ¥{customer.value.toLocaleString()}
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowActionModal(true)}
                  className="bg-white text-dandori-blue px-4 py-2 rounded-lg hover:shadow-lg transition font-medium"
                >
                  📝 アクション記録
                </button>
                <button
                  onClick={() => setShowVoiceModal(true)}
                  className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition"
                >
                  🎤 音声メモ
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Info Card - Enhanced */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg font-bold text-gray-900">📋 顧客情報</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-dandori-blue/5 to-dandori-sky/5 p-4 rounded-xl border border-dandori-blue/10">
                <h3 className="text-sm font-bold text-dandori-blue mb-3">
                  基本情報
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-dandori rounded-full flex items-center justify-center text-white text-sm">
                      📧
                    </div>
                    <span className="text-sm text-gray-700">
                      {customer.email}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-dandori rounded-full flex items-center justify-center text-white text-sm">
                      📞
                    </div>
                    <span className="text-sm text-gray-700">
                      {customer.phone}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-dandori rounded-full flex items-center justify-center text-white text-sm">
                      📍
                    </div>
                    <span className="text-sm text-gray-700">
                      {customer.address}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <h3 className="text-sm font-bold text-green-800 mb-3">
                  ステータス
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                      ⭐ 優良顧客
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">顧客価値</span>
                    <span className="font-bold text-green-700">
                      ¥{(customer.value / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">登録日</span>
                    <span className="text-sm font-medium">
                      {new Date(customer.createdAt).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">担当者</span>
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs mr-1">
                        {customer.assignee.charAt(0)}
                      </div>
                      <span className="text-sm font-medium">
                        {customer.assignee}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200">
                <h3 className="text-sm font-bold text-purple-800 mb-3">
                  次回アクション
                </h3>
                {!editingNextAction ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">内容</span>
                      <button
                        onClick={() => setEditingNextAction(true)}
                        className="text-purple-600 hover:text-purple-700 text-xs"
                      >
                        編集
                      </button>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {customer.nextAction || '未設定'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">期限</span>
                      <span className="text-sm font-medium text-purple-700">
                        {customer.nextActionDate
                          ? new Date(
                              customer.nextActionDate,
                            ).toLocaleDateString('ja-JP')
                          : '未設定'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">優先度</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-lg ${
                              star <= (customer.priority || 0)
                                ? 'text-yellow-500'
                                : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-600">内容</label>
                      <textarea
                        value={customer.nextAction}
                        onChange={(e) =>
                          setCustomer({
                            ...customer,
                            nextAction: e.target.value,
                          })
                        }
                        className="w-full mt-1 p-2 text-sm border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={2}
                        placeholder="次回アクション内容を入力"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">期限</label>
                      <input
                        type="date"
                        value={customer.nextActionDate}
                        onChange={(e) =>
                          setCustomer({
                            ...customer,
                            nextActionDate: e.target.value,
                          })
                        }
                        className="w-full mt-1 p-2 text-sm border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">優先度</label>
                      <div className="flex gap-2 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() =>
                              setCustomer({ ...customer, priority: star })
                            }
                            className={`text-2xl transition-all ${
                              star <= (customer.priority || 0)
                                ? 'text-yellow-500'
                                : 'text-gray-300 hover:text-yellow-300'
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveNextAction}
                        className="flex-1 bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-purple-700 transition"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingNextAction(false)}
                        className="flex-1 bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-300 transition"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6 p-1">
          <div className="flex space-x-1">
            {[
              { id: 'overview', label: '概要', icon: '📊' },
              { id: 'actions', label: 'アクション履歴', icon: '📋' },
              { id: 'projects', label: 'プロジェクト', icon: '🏗️' },
              { id: 'documents', label: '書類', icon: '📄' },
              { id: 'notes', label: 'メモ', icon: '📝' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-gradient-dandori text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-bold mb-6 text-gray-900 flex items-center">
                <span className="mr-2">📈</span>
                コミュニケーション統計
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {communications.map((comm) => (
                  <div
                    key={comm.type}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">
                        {getActionIcon(comm.type)}
                      </span>
                      <span className="text-2xl font-bold text-dandori-blue">
                        {comm.count}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      最終:{' '}
                      {new Date(comm.lastDate).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center">
                <span className="mr-2">📅</span>
                最近のアクティビティ
              </h3>
              <div className="space-y-3">
                {actions.slice(0, 3).map((action) => (
                  <div
                    key={action.id}
                    className={`p-4 rounded-xl border transition hover:shadow-md ${getSentimentColor(
                      action.sentiment,
                    )}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">
                          {getActionIcon(action.type)}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">
                            {action.content}
                          </p>
                          {action.result && (
                            <p className="text-sm text-green-700 mt-1">
                              結果: {action.result}
                            </p>
                          )}
                          {action.nextAction && (
                            <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                              <p className="text-xs font-medium text-yellow-800">
                                次回アクション
                              </p>
                              <p className="text-sm">{action.nextAction}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(action.date).toLocaleDateString('ja-JP')}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {action.user}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  📋 アクション履歴
                </h3>
                <button
                  onClick={() => setShowActionModal(true)}
                  className="bg-gradient-dandori text-white px-4 py-2 rounded-lg hover:shadow-lg transition"
                >
                  新規アクション
                </button>
              </div>
              <div className="space-y-4">
                {actions.map((action) => (
                  <div
                    key={action.id}
                    className={`p-5 rounded-xl border transition hover:shadow-lg ${getSentimentColor(
                      action.sentiment,
                    )}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-2xl">
                            {getActionIcon(action.type)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-gray-900">
                              {action.type === 'call'
                                ? '電話'
                                : action.type === 'email'
                                  ? 'メール'
                                  : action.type === 'meeting'
                                    ? '商談'
                                    : action.type === 'line'
                                      ? 'LINE'
                                      : action.type === 'chat'
                                        ? 'チャット'
                                        : 'その他'}
                            </span>
                            {action.duration && (
                              <span className="text-sm text-gray-500">
                                ({action.duration})
                              </span>
                            )}
                            {action.platform && (
                              <span className="text-sm">
                                {getPlatformIcon(action.platform)}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 mb-2">{action.content}</p>
                          {action.location && (
                            <p className="text-sm text-gray-600 mb-1">
                              📍 場所: {action.location}
                            </p>
                          )}
                          {action.participants && (
                            <p className="text-sm text-gray-600 mb-1">
                              👥 参加者: {action.participants.join(', ')}
                            </p>
                          )}
                          {action.attachments && (
                            <div className="flex gap-2 mt-2">
                              {action.attachments.map((file, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs"
                                >
                                  📎 {file}
                                </span>
                              ))}
                            </div>
                          )}
                          {action.result && (
                            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                              <p className="text-sm font-medium text-green-800">
                                結果・成果
                              </p>
                              <p className="text-sm text-green-700">
                                {action.result}
                              </p>
                            </div>
                          )}
                          {action.nextAction && (
                            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <p className="text-sm font-medium text-yellow-800">
                                次回アクション
                              </p>
                              <p className="text-sm text-yellow-700">
                                {action.nextAction}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(action.date).toLocaleDateString('ja-JP')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(action.date).toLocaleTimeString('ja-JP', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {action.user}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  🏗️ プロジェクト一覧
                </h3>
                <button className="bg-gradient-dandori text-white px-4 py-2 rounded-lg hover:shadow-lg transition">
                  新規プロジェクト
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 hover:shadow-lg transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-gray-900">
                        {project.name}
                      </h4>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          project.status === '見積中'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">予算</span>
                        <span className="font-medium">
                          ¥{project.budget.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">開始予定</span>
                        <span className="font-medium">
                          {new Date(project.startDate).toLocaleDateString(
                            'ja-JP',
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">進捗</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-dandori h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-900">
                📄 書類一覧
              </h3>
              <div className="border border-gray-200 rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        書類名
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        種類
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        作成日
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                        アクション
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        見積書_田中様_v1.pdf
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                          見積書
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        2024/02/08
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-dandori-blue hover:text-dandori-sky text-sm">
                          ダウンロード
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">契約書_田中様.pdf</td>
                      <td className="px-4 py-3">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                          契約書
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        2024/02/10
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-dandori-blue hover:text-dandori-sky text-sm">
                          ダウンロード
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">📝 メモ</h3>
                <button className="bg-gradient-dandori text-white px-4 py-2 rounded-lg hover:shadow-lg transition">
                  新規メモ
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">
                      重要
                    </span>
                    <span className="text-xs text-gray-500">
                      2024/02/10 14:30
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    予算の上限は400万円。キッチンのグレードアップを希望されているが、予算内で収まるよう調整が必要。
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                      一般
                    </span>
                    <span className="text-xs text-gray-500">
                      2024/02/08 10:15
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    奥様が主に決定権を持っている。デザイン面での提案を重視すること。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Modal */}
        {showActionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold mb-4">新規アクション記録</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    アクションタイプ
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>電話</option>
                    <option>メール</option>
                    <option>商談</option>
                    <option>LINE</option>
                    <option>訪問</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    内容
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={4}
                    placeholder="アクションの詳細を入力..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    結果・成果
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                    placeholder="結果や成果を入力..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    次回アクション
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="次回のアクション内容"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button className="flex-1 bg-gradient-dandori text-white px-4 py-2 rounded-lg hover:shadow-lg transition">
                    保存
                  </button>
                  <button
                    onClick={() => setShowActionModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Voice Modal */}
        {showVoiceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">🎤 音声メモ</h2>
              <div className="text-center py-8">
                <div className="w-24 h-24 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
                  <span className="text-white text-4xl">🎤</span>
                </div>
                <p className="text-gray-600 mb-2">録音中...</p>
                <p className="text-2xl font-bold">00:12</p>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">
                  停止
                </button>
                <button
                  onClick={() => setShowVoiceModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
