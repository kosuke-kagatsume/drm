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

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-emerald-500';
      case 'negative':
        return 'text-red-500';
      default:
        return 'text-zinc-500';
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-500 mx-auto"></div>
          <p className="mt-4 text-zinc-500 text-xs tracking-wider">
            LOADING...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header - Dark Elegant */}
      <div className="bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-full-hd mx-auto px-4 lg:px-6 xl:px-8 2xl:px-12 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => router.push('/customers')}
                className="text-zinc-500 hover:text-white transition-colors text-sm tracking-wider"
              >
                ← CUSTOMERS
              </button>
              <div className="w-px h-6 bg-zinc-800"></div>
              <div>
                <h1 className="text-2xl font-thin text-white flex items-center">
                  <div className="w-12 h-12 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-lg mr-4">
                    01
                  </div>
                  {customer.name}
                </h1>
                {customer.company && (
                  <span className="text-xs text-zinc-500 tracking-wider ml-16">
                    {customer.company.toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => router.push(`/customers/${params.id}/detailed`)}
                className="px-6 py-3 border border-zinc-800 text-white text-xs tracking-wider hover:bg-zinc-900 transition-colors"
              >
                DETAILED INFO
              </button>
              <button
                onClick={() => setShowActionModal(true)}
                className="px-6 py-3 border border-zinc-800 text-white text-xs tracking-wider hover:bg-zinc-900 transition-colors"
              >
                ADD ACTION
              </button>
              <button
                onClick={() => setShowVoiceModal(true)}
                className="px-6 py-3 bg-white text-black text-xs tracking-wider font-medium hover:bg-zinc-200 transition-colors"
              >
                IMPORT MEMO
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full-hd mx-auto px-4 lg:px-6 xl:px-8 2xl:px-12 py-8">
        {/* Quick Stats - Dark Elegant */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-950 p-6 border border-zinc-800 hover:border-zinc-700 transition-colors">
            <p className="text-xs text-zinc-500 tracking-wider mb-2">
              TOTAL ACTIONS
            </p>
            <h4 className="text-4xl font-thin text-white">{actions.length}</h4>
            <div className="mt-4 flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-blue-500">RECENT</span>
            </div>
          </div>
          <div className="bg-zinc-950 p-6 border border-zinc-800 hover:border-zinc-700 transition-colors">
            <p className="text-xs text-zinc-500 tracking-wider mb-2">
              CUSTOMER VALUE
            </p>
            <h4 className="text-4xl font-thin text-white">
              ¥{(customer.value / 1000000).toFixed(1)}M
            </h4>
            <div className="mt-4 flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-xs text-emerald-500">HIGH</span>
            </div>
          </div>
          <div className="bg-zinc-950 p-6 border border-zinc-800 hover:border-zinc-700 transition-colors">
            <p className="text-xs text-zinc-500 tracking-wider mb-2">
              CONVERSION
            </p>
            <h4 className="text-4xl font-thin text-white">72%</h4>
            <div className="mt-4 flex items-center space-x-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-xs text-amber-500">LIKELY</span>
            </div>
          </div>
          <div className="bg-zinc-950 p-6 border border-zinc-800 hover:border-zinc-700 transition-colors">
            <p className="text-xs text-zinc-500 tracking-wider mb-2">RANK</p>
            <h4 className="text-4xl font-thin text-white">VIP</h4>
            <div className="mt-4 flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-xs text-purple-500">PREMIUM</span>
            </div>
          </div>
        </div>

        {/* Customer Info Card - Dark Elegant */}
        <div className="bg-zinc-950 border border-zinc-800 mb-8">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-sm font-normal text-white tracking-widest">
              CUSTOMER INFORMATION
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="border border-zinc-800 p-6">
                <h3 className="text-xs font-normal text-white tracking-widest mb-4">
                  CONTACT DETAILS
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 tracking-wider">EMAIL</span>
                    <span className="text-white font-light">
                      {customer.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 tracking-wider">PHONE</span>
                    <span className="text-white font-light">
                      {customer.phone}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 tracking-wider">
                      ADDRESS
                    </span>
                    <span className="text-white font-light text-right">
                      {customer.address}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-zinc-800 p-6">
                <h3 className="text-xs font-normal text-white tracking-widest mb-4">
                  STATUS
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs text-emerald-500 tracking-wider">
                      ● PREMIUM CUSTOMER
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 tracking-wider">VALUE</span>
                    <span className="text-white font-light">
                      ¥{(customer.value / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 tracking-wider">SINCE</span>
                    <span className="text-white font-light">
                      {new Date(customer.createdAt)
                        .toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                        })
                        .toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 tracking-wider">
                      ASSIGNEE
                    </span>
                    <span className="text-white font-light">
                      {customer.assignee.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-zinc-800 p-6">
                <h3 className="text-xs font-normal text-white tracking-widest mb-4">
                  TAGS & NOTES
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {customer.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs text-zinc-500 tracking-wider"
                    >
                      {tag.toUpperCase()}
                    </span>
                  ))}
                </div>
                <div className="border-t border-zinc-800 pt-3">
                  <p className="text-sm text-zinc-400 font-light italic">
                    "{customer.notes}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Dark Elegant */}
        <div className="bg-zinc-950 border border-zinc-800">
          <div className="border-b border-zinc-800 p-2">
            <div className="flex">
              {[
                { id: 'overview', label: 'OVERVIEW' },
                { id: 'actions', label: 'ACTION HISTORY' },
                { id: 'communications', label: 'COMMUNICATIONS' },
                { id: 'documents', label: 'DOCUMENTS' },
                { id: 'analysis', label: 'ANALYSIS' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 px-4 text-xs tracking-wider transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-black font-medium'
                      : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab - Dark Elegant */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs font-normal text-white tracking-widest mb-6">
                    RECENT ACTIONS
                  </h3>
                  <div className="space-y-4">
                    {actions.slice(0, 3).map((action, idx) => (
                      <div
                        key={action.id}
                        className="border border-zinc-800 p-4 hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-sm">
                              {String(idx + 1).padStart(2, '0')}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-zinc-300 font-light">
                                {action.content}
                              </p>
                              {action.aiSummary && (
                                <div className="mt-3 p-3 border border-zinc-800 bg-black/50">
                                  <p className="text-xs text-zinc-500 tracking-wider mb-2">
                                    AI SUMMARY
                                  </p>
                                  <p className="whitespace-pre-line text-xs text-zinc-400">
                                    {action.aiSummary}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-zinc-600 tracking-wider">
                            {new Date(action.date)
                              .toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })
                              .toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-normal text-white tracking-widest mb-6">
                    NEXT ACTION
                  </h3>
                  <div className="border border-zinc-800 p-6 bg-black/50">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 border border-amber-500/30 flex items-center justify-center text-amber-500 text-xs">
                        !
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-light mb-2">
                          修正見積もりを2/15までに送付
                        </p>
                        <p className="text-sm text-zinc-500">
                          前回の打ち合わせで予算調整の要望があったため、修正版を作成して送付する。
                        </p>
                        <button className="mt-4 px-6 py-2 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors text-xs tracking-wider">
                          MARK COMPLETE
                        </button>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xs font-normal text-white tracking-widest mt-8 mb-6">
                    SCORING
                  </h3>
                  <div className="border border-zinc-800 p-6">
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between mb-3">
                          <span className="text-xs text-zinc-500 tracking-wider">
                            ENGAGEMENT
                          </span>
                          <span className="text-xs text-emerald-500">85%</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1">
                          <div
                            className="bg-emerald-500/50 h-1 transition-all duration-500"
                            style={{ width: '85%' }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-3">
                          <span className="text-xs text-zinc-500 tracking-wider">
                            CONVERSION PROBABILITY
                          </span>
                          <span className="text-xs text-blue-500">72%</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1">
                          <div
                            className="bg-blue-500/50 h-1 transition-all duration-500"
                            style={{ width: '72%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions Tab - Dark Elegant */}
            {activeTab === 'actions' && (
              <div className="space-y-0 divide-y divide-zinc-800">
                {actions.map((action, idx) => (
                  <div key={action.id} className="py-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-sm">
                          {String(idx + 1).padStart(2, '0')}
                        </div>
                        <div>
                          <div className="flex items-center space-x-4">
                            <span className="text-white font-light">
                              {action.by.toUpperCase()}
                            </span>
                            <span className="text-xs text-zinc-600 tracking-wider">
                              {new Date(action.date)
                                .toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                                .toUpperCase()}
                            </span>
                            {action.duration && (
                              <span className="text-xs text-zinc-600 tracking-wider">
                                ({action.duration})
                              </span>
                            )}
                          </div>
                          {action.sentiment && (
                            <span
                              className={`text-xs tracking-wider mt-1 ${getSentimentColor(action.sentiment)}`}
                            >
                              {action.sentiment.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-zinc-300 mb-4 pl-14">{action.content}</p>

                    {action.aiSummary && (
                      <div className="border border-zinc-800 p-4 ml-14 mb-4 bg-black/50">
                        <h4 className="text-xs text-zinc-500 tracking-wider mb-2">
                          AI SUMMARY
                        </h4>
                        <p className="text-sm text-zinc-400 whitespace-pre-line">
                          {action.aiSummary}
                        </p>
                      </div>
                    )}

                    {action.nextAction && (
                      <div className="border border-amber-500/20 p-4 ml-14 bg-amber-500/5">
                        <h4 className="text-xs text-amber-500 tracking-wider mb-2">
                          NEXT ACTION
                        </h4>
                        <p className="text-sm text-zinc-300">
                          {action.nextAction}
                        </p>
                      </div>
                    )}

                    {action.attachments && (
                      <div className="mt-4 flex flex-wrap gap-2 pl-14">
                        {action.attachments.map((file, idx) => (
                          <button
                            key={idx}
                            className="text-xs text-zinc-600 border border-zinc-800 px-3 py-1 hover:text-white hover:border-zinc-700 transition-colors"
                          >
                            {file.toUpperCase()}
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

      {/* Add Action Modal - Dark Elegant */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-800">
              <h3 className="text-sm font-normal text-white tracking-widest">
                NEW ACTION ENTRY
              </h3>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                    ACTION TYPE
                  </label>
                  <select className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm">
                    <option value="call">PHONE CALL</option>
                    <option value="email">EMAIL</option>
                    <option value="meeting">MEETING</option>
                    <option value="chat">CHAT</option>
                    <option value="note">NOTE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                    CONTENT
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    placeholder="Enter action details..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                      DATE & TIME
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                      DURATION
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 30 minutes"
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                    NEXT ACTION
                  </label>
                  <input
                    type="text"
                    placeholder="Enter next required action..."
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                    SENTIMENT
                  </label>
                  <div className="flex space-x-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sentiment"
                        value="positive"
                        className="mr-2 accent-emerald-500"
                      />
                      <span className="text-xs text-zinc-400 tracking-wider">
                        POSITIVE
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sentiment"
                        value="neutral"
                        className="mr-2 accent-zinc-500"
                        defaultChecked
                      />
                      <span className="text-xs text-zinc-400 tracking-wider">
                        NEUTRAL
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sentiment"
                        value="negative"
                        className="mr-2 accent-red-500"
                      />
                      <span className="text-xs text-zinc-400 tracking-wider">
                        NEGATIVE
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-zinc-800">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="px-6 py-3 text-zinc-500 hover:text-white transition-colors text-xs tracking-wider"
                >
                  CANCEL
                </button>
                <button className="px-8 py-3 bg-white text-black text-xs tracking-wider font-medium hover:bg-zinc-200 transition-colors">
                  SAVE ACTION
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voice Memo Import Modal - Dark Elegant */}
      {showVoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-lg">
            <div className="p-6 border-b border-zinc-800">
              <h3 className="text-sm font-normal text-white tracking-widest">
                VOICE MEMO IMPORT
              </h3>
            </div>

            <div className="p-6">
              <div className="border border-zinc-800 p-6 mb-6 bg-black/50">
                <h4 className="text-xs text-white tracking-widest mb-4">
                  SUPPORTED SERVICES
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-zinc-800 p-4">
                    <p className="text-white font-light text-sm">PLAUD</p>
                    <p className="text-xs text-zinc-500 tracking-wider mt-1">
                      AI RECORDING
                    </p>
                  </div>
                  <div className="border border-zinc-800 p-4">
                    <p className="text-white font-light text-sm">NOTTA</p>
                    <p className="text-xs text-zinc-500 tracking-wider mt-1">
                      TRANSCRIPTION
                    </p>
                  </div>
                  <div className="border border-zinc-800 p-4">
                    <p className="text-white font-light text-sm">OTTER.AI</p>
                    <p className="text-xs text-zinc-500 tracking-wider mt-1">
                      MEETING AI
                    </p>
                  </div>
                  <div className="border border-zinc-800 p-4">
                    <p className="text-white font-light text-sm">OTHER</p>
                    <p className="text-xs text-zinc-500 tracking-wider mt-1">
                      TEXT FORMAT
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                    DATA FORMAT
                  </label>
                  <select className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm">
                    <option value="plaud">PLAUD - WITH AI SUMMARY</option>
                    <option value="notta">NOTTA - TRANSCRIPTION TEXT</option>
                    <option value="otter">OTTER.AI - MEETING NOTES</option>
                    <option value="text">TEXT PASTE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                    MEMO CONTENT
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    placeholder="Paste transcription data or AI summary from external service..."
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                    TITLE (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    placeholder="e.g., Budget adjustment meeting"
                  />
                </div>

                <div className="border border-zinc-800 p-4 bg-black/50">
                  <h4 className="text-xs text-zinc-500 tracking-wider mb-2">
                    USAGE GUIDE
                  </h4>
                  <ul className="text-xs text-zinc-600 space-y-1">
                    <li>• Record conversation with external device</li>
                    <li>• Copy AI-generated summary from app</li>
                    <li>• Paste and save in this form</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-zinc-800">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowVoiceModal(false)}
                  className="px-6 py-3 text-zinc-500 hover:text-white transition-colors text-xs tracking-wider"
                >
                  CANCEL
                </button>
                <button className="px-8 py-3 bg-white text-black text-xs tracking-wider font-medium hover:bg-zinc-200 transition-colors">
                  IMPORT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
