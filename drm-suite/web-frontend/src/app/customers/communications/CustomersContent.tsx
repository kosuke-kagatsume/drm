'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Phone,
  Mail,
  Users,
  MapPin,
  MessageCircle,
  MessageSquare,
  Smartphone,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Clock,
  User,
  Calendar,
  Paperclip,
  Download,
  PieChart,
} from 'lucide-react';
import {
  PieChart as RechartPie,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

// コミュニケーションタイプの定義
type CommunicationType =
  | 'call'
  | 'email'
  | 'meeting'
  | 'visit'
  | 'line'
  | 'chat'
  | 'sms'
  | 'note';

// コミュニケーション記録の型
interface Communication {
  id: string;
  customerId: string;
  customerName: string;
  type: CommunicationType;
  direction: 'inbound' | 'outbound';
  subject: string;
  content: string;
  attachments: string[];
  createdBy: string;
  createdAt: string;
  duration?: number;
  participants?: string[];
  tags: string[];
  relatedDealId?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  nextAction?: string;
}

interface Stats {
  total: number;
  byType: Record<CommunicationType, number>;
  byDirection: {
    inbound: number;
    outbound: number;
  };
  bySentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  byCreator: Record<string, number>;
  recentActivity: number;
}

export default function CommunicationsPage() {
  const router = useRouter();
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<CommunicationType | 'all'>(
    'all',
  );
  const [filterCreator, setFilterCreator] = useState('all');
  const [selectedComm, setSelectedComm] = useState<Communication | null>(null);

  useEffect(() => {
    fetchCommunications();
  }, [filterType, filterCreator]);

  const fetchCommunications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== 'all') {
        params.append('type', filterType);
      }
      if (filterCreator !== 'all') {
        params.append('createdBy', filterCreator);
      }

      const response = await fetch(`/api/customers/communications?${params}`);
      const data = await response.json();

      if (data.success) {
        setCommunications(data.communications);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch communications:', error);
    } finally {
      setLoading(false);
    }
  };

  // コミュニケーションタイプの設定
  const typeConfig: Record<
    CommunicationType,
    { label: string; icon: React.ReactNode; color: string }
  > = {
    call: {
      label: '電話',
      icon: <Phone className="w-5 h-5" />,
      color: 'from-blue-500 to-blue-600',
    },
    email: {
      label: 'メール',
      icon: <Mail className="w-5 h-5" />,
      color: 'from-purple-500 to-purple-600',
    },
    meeting: {
      label: 'ミーティング',
      icon: <Users className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500',
    },
    visit: {
      label: '訪問',
      icon: <MapPin className="w-5 h-5" />,
      color: 'from-orange-500 to-red-500',
    },
    line: {
      label: 'LINE',
      icon: <MessageCircle className="w-5 h-5" />,
      color: 'from-green-400 to-green-500',
    },
    chat: {
      label: 'チャット',
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'from-indigo-500 to-indigo-600',
    },
    sms: {
      label: 'SMS',
      icon: <Smartphone className="w-5 h-5" />,
      color: 'from-pink-500 to-pink-600',
    },
    note: {
      label: 'メモ',
      icon: <FileText className="w-5 h-5" />,
      color: 'from-gray-500 to-gray-600',
    },
  };

  // 感情アイコン
  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'neutral':
        return <Minus className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  // タイプ別グラフデータ
  const typeChartData = Object.entries(stats?.byType || {}).map(
    ([type, count]) => ({
      name: typeConfig[type as CommunicationType]?.label || type,
      value: count,
    }),
  );

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f97316', '#ec4899'];

  // 担当者リスト
  const uniqueCreators = Object.keys(stats?.byCreator || {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-dandori-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-600">コミュニケーション履歴読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* ヘッダー with Blue Gradient */}
      <div className="bg-gradient-dandori text-white shadow-xl">
        <div className="max-w-full-hd mx-auto px-4 lg:px-6 xl:px-8 2xl:px-12 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/customers')}
                className="text-white/80 hover:text-white transition-colors"
              >
                ← 顧客一覧に戻る
              </button>
              <div>
                <h1 className="text-3xl font-bold flex items-center">
                  <span className="text-4xl mr-3">💬</span>
                  顧客コミュニケーション履歴
                </h1>
                <p className="text-dandori-yellow/80 text-sm mt-1">
                  顧客とのやり取りを時系列で管理
                </p>
              </div>
            </div>

            <button className="bg-white text-dandori-blue px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2">
              <Download className="w-5 h-5" />
              履歴レポート出力
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-full-hd mx-auto px-4 lg:px-6 xl:px-8 2xl:px-12 py-8">
        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">総記録数</span>
              <Activity className="w-5 h-5 text-dandori-blue" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.total}件</p>
            <p className="text-xs text-gray-600 mt-1">全てのやり取り</p>
          </div>

          <div className="bg-gradient-to-br from-dandori-blue to-dandori-sky text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/90">7日間の活動</span>
              <Clock className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold">{stats?.recentActivity}件</p>
            <p className="text-xs text-white/90 mt-1">最近1週間</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/90">ポジティブ</span>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold">
              {stats?.bySentiment.positive}件
            </p>
            <p className="text-xs text-white/90 mt-1">好意的な反応</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/90">発信</span>
              <Phone className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold">
              {stats?.byDirection.outbound}件
            </p>
            <p className="text-xs text-white/90 mt-1">こちらから連絡</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">着信</span>
              <Mail className="w-5 h-5 text-dandori-blue" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.byDirection.inbound}件
            </p>
            <p className="text-xs text-gray-600 mt-1">顧客から連絡</p>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              コミュニケーションタイムライン
            </h3>
            <div className="flex items-center gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue focus:border-transparent transition-all duration-200 font-medium"
              >
                <option value="all">全てのタイプ</option>
                {Object.entries(typeConfig).map(([type, config]) => (
                  <option key={type} value={type}>
                    {config.label}
                  </option>
                ))}
              </select>

              <select
                value={filterCreator}
                onChange={(e) => setFilterCreator(e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue focus:border-transparent transition-all duration-200 font-medium"
              >
                <option value="all">全ての担当者</option>
                {uniqueCreators.map((creator) => (
                  <option key={creator} value={creator}>
                    {creator}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* タイムライン */}
          <div className="lg:col-span-2 space-y-4">
            {communications.map((comm) => {
              const config = typeConfig[comm.type];
              return (
                <div
                  key={comm.id}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 cursor-pointer border-l-4 border-dandori-blue"
                  onClick={() => setSelectedComm(comm)}
                >
                  {/* ヘッダー */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-lg bg-gradient-to-r ${config.color} text-white`}
                      >
                        {config.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900">
                            {comm.subject}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              comm.direction === 'inbound'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {comm.direction === 'inbound' ? '着信' : '発信'}
                          </span>
                          {comm.sentiment && getSentimentIcon(comm.sentiment)}
                        </div>
                        <p className="text-sm text-gray-600">
                          {comm.customerName} · {config.label}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {new Date(comm.createdAt).toLocaleDateString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  {/* 内容 */}
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {comm.content}
                  </p>

                  {/* フッター情報 */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {comm.createdBy}
                      </div>
                      {comm.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {comm.duration}分
                        </div>
                      )}
                      {comm.attachments.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Paperclip className="w-3 h-3" />
                          {comm.attachments.length}件
                        </div>
                      )}
                    </div>
                    {comm.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {comm.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-dandori-blue/10 text-dandori-blue rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 統計サイドバー */}
          <div className="space-y-6">
            {/* タイプ別分布 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                タイプ別分布
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <RechartPie>
                  <Pie
                    data={typeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    label={(entry) => `${entry.value}`}
                  >
                    {typeChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartPie>
              </ResponsiveContainer>
            </div>

            {/* 感情分析 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">感情分析</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">ポジティブ</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {stats?.bySentiment.positive}件
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Minus className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700">ニュートラル</span>
                  </div>
                  <span className="text-lg font-bold text-gray-600">
                    {stats?.bySentiment.neutral}件
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                    <span className="text-sm text-gray-700">ネガティブ</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">
                    {stats?.bySentiment.negative}件
                  </span>
                </div>
              </div>
            </div>

            {/* 担当者別 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                担当者別活動
              </h3>
              <div className="space-y-2">
                {Object.entries(stats?.byCreator || {}).map(
                  ([creator, count]) => (
                    <div
                      key={creator}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm text-gray-700">{creator}</span>
                      <span className="text-sm font-bold text-dandori-blue">
                        {count}件
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 詳細モーダル */}
      {selectedComm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedComm(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-lg bg-gradient-to-r ${typeConfig[selectedComm.type].color} text-white`}
                >
                  {typeConfig[selectedComm.type].icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedComm.subject}
                  </h3>
                  <p className="text-gray-600">{selectedComm.customerName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedComm(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  タイプ
                </h4>
                <p className="text-sm font-semibold text-gray-900">
                  {typeConfig[selectedComm.type].label}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">方向</h4>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedComm.direction === 'inbound' ? '着信' : '発信'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  記録者
                </h4>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedComm.createdBy}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">日時</h4>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(selectedComm.createdAt).toLocaleString('ja-JP')}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">内容</h4>
              <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                {selectedComm.content}
              </p>
            </div>

            {selectedComm.nextAction && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  次のアクション
                </h4>
                <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500">
                  {selectedComm.nextAction}
                </p>
              </div>
            )}

            {selectedComm.attachments.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  添付ファイル
                </h4>
                <div className="space-y-2">
                  {selectedComm.attachments.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                    >
                      <Paperclip className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{file}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedComm.tags.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">タグ</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedComm.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-dandori-blue/10 text-dandori-blue text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() =>
                  router.push(`/customers/${selectedComm.customerId}`)
                }
                className="flex-1 py-3 bg-gradient-dandori text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                顧客詳細を見る
              </button>
              <button
                onClick={() => setSelectedComm(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
