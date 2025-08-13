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

export default function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showActionModal, setShowActionModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  // Sample customer data
  const customer = {
    id: params.id,
    name: '田中太郎',
    company: '田中建設株式会社',
    email: 'tanaka@example.com',
    phone: '090-1234-5678',
    address: '東京都渋谷区○○1-2-3',
    status: 'customer',
    value: 2500000,
    createdAt: '2023-06-15',
    tags: ['外壁塗装', 'リピーター', 'VIP'],
    assignee: '山田花子',
    notes: '定期的なメンテナンスを重視する顧客。品質重視。',
  };

  const actions: CustomerAction[] = [
    {
      id: '1',
      type: 'meeting',
      content: '見積もり内容について打ち合わせ。予算調整の相談あり。',
      date: '2024-02-10 14:00',
      by: '山田花子',
      duration: '60分',
      aiSummary:
        '・予算を200万円以内に調整希望\n・工期は3週間程度を希望\n・色選びについて再検討',
      sentiment: 'positive',
      nextAction: '修正見積もりを2/15までに送付',
    },
    {
      id: '2',
      type: 'voice',
      content: '電話での相談内容',
      date: '2024-02-09 11:30',
      by: '山田花子',
      duration: '15分',
      aiSummary:
        '・工事開始時期の確認\n・近隣への挨拶について相談\n・足場設置のタイミング',
      sentiment: 'neutral',
      attachments: ['audio_20240209.mp3'],
    },
    {
      id: '3',
      type: 'email',
      content: '見積書を送付しました。',
      date: '2024-02-08 09:00',
      by: '山田花子',
      sentiment: 'neutral',
    },
    {
      id: '4',
      type: 'chat',
      content: 'チャットワークで工期について質問あり。',
      date: '2024-02-07 16:45',
      by: '山田花子',
      sentiment: 'positive',
    },
  ];

  const communications: Communication[] = [
    {
      id: '1',
      platform: 'chatwork',
      content: '見積もりありがとうございます。内容確認させていただきます。',
      date: '2024-02-10 10:30',
      direction: 'inbound',
      status: 'replied',
    },
    {
      id: '2',
      platform: 'email',
      subject: '見積書送付の件',
      content: 'お世話になっております。見積書を送付させていただきます。',
      date: '2024-02-08 09:00',
      direction: 'outbound',
      status: 'read',
    },
    {
      id: '3',
      platform: 'line',
      content: '工事の進捗はいかがでしょうか？',
      date: '2024-02-05 14:20',
      direction: 'inbound',
      status: 'replied',
    },
  ];

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'call':
        return '📞';
      case 'email':
        return '📧';
      case 'meeting':
        return '🤝';
      case 'chat':
        return '💬';
      case 'line':
        return '📱';
      case 'voice':
        return '🎙️';
      case 'note':
        return '📝';
      default:
        return '📌';
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'email':
        return '📧';
      case 'chatwork':
        return '💼';
      case 'line':
        return '📱';
      case 'slack':
        return '💬';
      default:
        return '📨';
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with Gradient */}
      <div className="bg-gradient-dandori text-white shadow-xl">
        <div className="max-w-full-hd mx-auto px-4 lg:px-6 xl:px-8 2xl:px-12 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/customers')}
                className="text-white/80 hover:text-white transition-colors"
              >
                ← 顧客一覧
              </button>
              <div>
                <h1 className="text-3xl font-bold flex items-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl mr-3">
                    {customer.name.charAt(0)}
                  </div>
                  {customer.name}
                </h1>
                {customer.company && (
                  <span className="text-dandori-yellow/80 text-sm ml-14">
                    {customer.company}
                  </span>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => router.push(`/customers/${params.id}/detailed`)}
                className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <span className="text-lg mr-2">📋</span>
                詳細情報
              </button>
              <button
                onClick={() => setShowActionModal(true)}
                className="bg-white text-dandori-blue px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <span className="text-lg mr-2">+</span>
                アクション追加
              </button>
              <button
                onClick={() => setShowVoiceModal(true)}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <span className="text-lg mr-2">🎙️</span>
                音声メモ取込
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full-hd mx-auto px-4 lg:px-6 xl:px-8 2xl:px-12 py-8">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <div className="text-3xl mb-2">🤝</div>
            <h4 className="text-2xl font-bold text-gray-900">
              {actions.length}
            </h4>
            <p className="text-sm text-gray-600">総アクション</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <div className="text-3xl mb-2">💰</div>
            <h4 className="text-2xl font-bold">
              ¥{(customer.value / 1000000).toFixed(1)}M
            </h4>
            <p className="text-sm text-white/90">顧客価値</p>
          </div>
          <div className="bg-gradient-to-br from-dandori-blue to-dandori-sky text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <div className="text-3xl mb-2">📅</div>
            <h4 className="text-2xl font-bold">72%</h4>
            <p className="text-sm text-white/90">成約確率</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <div className="text-3xl mb-2">⭐</div>
            <h4 className="text-2xl font-bold">VIP</h4>
            <p className="text-sm text-white/90">顧客ランク</p>
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
                  タグ・メモ
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {customer.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs rounded-full font-medium shadow-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="bg-white/70 p-3 rounded-lg">
                  <p className="text-sm text-gray-700 italic">
                    "{customer.notes}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Enhanced */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-2">
            <div className="flex space-x-2">
              {[
                { id: 'overview', label: '概要', icon: '📊' },
                { id: 'actions', label: 'アクション履歴', icon: '📝' },
                {
                  id: 'communications',
                  label: 'コミュニケーション',
                  icon: '💬',
                },
                { id: 'documents', label: '資料', icon: '📁' },
                { id: 'analysis', label: '分析', icon: '📈' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-dandori text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <span className="text-lg mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab - Enhanced */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-4 flex items-center">
                    <span className="text-2xl mr-2">📝</span>
                    最近のアクション
                  </h3>
                  <div className="space-y-3">
                    {actions.slice(0, 3).map((action) => (
                      <div
                        key={action.id}
                        className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-gradient-dandori rounded-full flex items-center justify-center text-white text-xl shadow-sm">
                              {getActionIcon(action.type)}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-700 font-medium">
                                {action.content}
                              </p>
                              {action.aiSummary && (
                                <div className="mt-3 p-3 bg-gradient-to-r from-dandori-blue/10 to-dandori-sky/10 rounded-lg border border-dandori-blue/20">
                                  <p className="font-bold text-xs text-dandori-blue mb-1">
                                    🤖 AI要約
                                  </p>
                                  <p className="whitespace-pre-line text-xs text-gray-700">
                                    {action.aiSummary}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 font-medium">
                            {action.date}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-4 flex items-center">
                    <span className="text-2xl mr-2">🎯</span>
                    次のアクション
                  </h3>
                  <div className="bg-gradient-to-br from-dandori-yellow/20 to-dandori-orange/20 p-5 rounded-xl border border-dandori-orange/30">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-warm rounded-full flex items-center justify-center text-white animate-pulse">
                        ⚡
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-dandori-orange mb-2">
                          修正見積もりを2/15までに送付
                        </p>
                        <p className="text-sm text-gray-700">
                          前回の打ち合わせで予算調整の要望があったため、修正版を作成して送付する。
                        </p>
                        <button className="mt-3 bg-gradient-warm text-white px-4 py-2 rounded-lg text-sm font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                          ✓ 完了にする
                        </button>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg mt-6 mb-4 flex items-center">
                    <span className="text-2xl mr-2">📊</span>
                    スコアリング
                  </h3>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            エンゲージメント
                          </span>
                          <span className="text-sm font-bold text-green-600">
                            85%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: '85%' }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            成約確率
                          </span>
                          <span className="text-sm font-bold text-dandori-blue">
                            72%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-dandori h-3 rounded-full transition-all duration-500"
                            style={{ width: '72%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions Tab */}
            {activeTab === 'actions' && (
              <div className="space-y-4">
                {actions.map((action) => (
                  <div key={action.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {getActionIcon(action.type)}
                        </span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{action.by}</span>
                            <span className="text-sm text-gray-500">
                              {action.date}
                            </span>
                            {action.duration && (
                              <span className="text-sm text-gray-500">
                                ({action.duration})
                              </span>
                            )}
                          </div>
                          {action.sentiment && (
                            <span
                              className={`text-xs ${getSentimentColor(action.sentiment)}`}
                            >
                              {action.sentiment === 'positive'
                                ? '😊 ポジティブ'
                                : action.sentiment === 'negative'
                                  ? '😟 ネガティブ'
                                  : '😐 ニュートラル'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3">{action.content}</p>

                    {action.aiSummary && (
                      <div className="bg-blue-50 p-3 rounded-lg mb-3">
                        <h4 className="font-medium text-sm mb-2">🤖 AI要約</h4>
                        <p className="text-sm whitespace-pre-line">
                          {action.aiSummary}
                        </p>
                      </div>
                    )}

                    {action.nextAction && (
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <h4 className="font-medium text-sm mb-1">
                          ➡️ 次のアクション
                        </h4>
                        <p className="text-sm">{action.nextAction}</p>
                      </div>
                    )}

                    {action.attachments && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {action.attachments.map((file, idx) => (
                          <button
                            key={idx}
                            className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                          >
                            📎 {file}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Communications Tab */}
            {activeTab === 'communications' && (
              <div>
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">🔗 連携済みサービス</h4>
                  <div className="flex space-x-4">
                    <span className="px-3 py-1 bg-white rounded text-sm">
                      💼 Chatwork
                    </span>
                    <span className="px-3 py-1 bg-white rounded text-sm">
                      📱 LINE WORKS
                    </span>
                    <span className="px-3 py-1 bg-white rounded text-sm">
                      📧 Gmail
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {communications.map((comm) => (
                    <div
                      key={comm.id}
                      className={`border rounded-lg p-4 ${
                        comm.status === 'unread'
                          ? 'bg-blue-50 border-blue-300'
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">
                            {getPlatformIcon(comm.platform)}
                          </span>
                          <span className="font-medium capitalize">
                            {comm.platform}
                          </span>
                          {comm.direction === 'inbound' ? (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              受信
                            </span>
                          ) : (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              送信
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {comm.date}
                        </span>
                      </div>
                      {comm.subject && (
                        <h4 className="font-medium mb-1">{comm.subject}</h4>
                      )}
                      <p className="text-sm text-gray-700">{comm.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">新規アクション追加</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  アクションタイプ
                </label>
                <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="call">📞 電話</option>
                  <option value="email">📧 メール</option>
                  <option value="meeting">🤝 打ち合わせ</option>
                  <option value="chat">💬 チャット</option>
                  <option value="note">📝 メモ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  内容
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="アクションの詳細を入力..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    日時
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    所要時間
                  </label>
                  <input
                    type="text"
                    placeholder="例: 30分"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  次のアクション
                </label>
                <input
                  type="text"
                  placeholder="次に必要なアクションを入力..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  センチメント
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sentiment"
                      value="positive"
                      className="mr-2"
                    />
                    <span>😊 ポジティブ</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sentiment"
                      value="neutral"
                      className="mr-2"
                      defaultChecked
                    />
                    <span>😐 ニュートラル</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sentiment"
                      value="negative"
                      className="mr-2"
                    />
                    <span>😟 ネガティブ</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowActionModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                キャンセル
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Memo Import Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">🎙️ 音声メモ取り込み</h3>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200 mb-6">
              <h4 className="font-bold text-purple-800 mb-3">対応サービス</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg flex items-center space-x-2">
                  <span className="text-2xl">🎙️</span>
                  <div>
                    <p className="font-medium">PLAUD</p>
                    <p className="text-xs text-gray-600">AI録音デバイス</p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg flex items-center space-x-2">
                  <span className="text-2xl">📱</span>
                  <div>
                    <p className="font-medium">Notta</p>
                    <p className="text-xs text-gray-600">音声文字起こし</p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg flex items-center space-x-2">
                  <span className="text-2xl">🎤</span>
                  <div>
                    <p className="font-medium">Otter.ai</p>
                    <p className="text-xs text-gray-600">会議記録AI</p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg flex items-center space-x-2">
                  <span className="text-2xl">📝</span>
                  <div>
                    <p className="font-medium">その他</p>
                    <p className="text-xs text-gray-600">テキスト形式</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  データ形式
                </label>
                <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="plaud">PLAUD - AI要約付き</option>
                  <option value="notta">Notta - 文字起こしテキスト</option>
                  <option value="otter">Otter.ai - 議事録形式</option>
                  <option value="text">テキスト貼り付け</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  音声メモの内容
                </label>
                <textarea
                  rows={6}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="外部サービスから取得した文字起こしデータやAI要約をここに貼り付けてください..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  タイトル（任意）
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="例: 予算調整の打ち合わせ"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-blue-800 text-sm mb-1">
                  💡 使い方のヒント
                </h4>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• PLAUDなどの外部録音デバイスで会話を録音</li>
                  <li>• アプリで自動生成されたAI要約をコピー</li>
                  <li>• このフォームに貼り付けて保存</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowVoiceModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                キャンセル
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg font-medium">
                取り込み
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
