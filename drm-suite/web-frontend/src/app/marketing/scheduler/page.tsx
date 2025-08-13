'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ScheduledPost {
  id: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin';
  type: 'post' | 'story' | 'reel';
  content: string;
  media: string[];
  hashtags: string[];
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'published' | 'failed' | 'draft';
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  };
  campaign?: string;
}

export default function SNSSchedulerPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const [scheduledPosts] = useState<ScheduledPost[]>([
    {
      id: '1',
      platform: 'instagram',
      type: 'post',
      content:
        '【施工事例】外壁塗装のビフォーアフター\n築20年の住宅が新築のように生まれ変わりました！',
      media: ['image1.jpg', 'image2.jpg'],
      hashtags: ['外壁塗装', 'リフォーム', '施工事例', 'ビフォーアフター'],
      scheduledDate: '2024-03-25',
      scheduledTime: '10:00',
      status: 'scheduled',
      campaign: '春の外壁塗装キャンペーン',
    },
    {
      id: '2',
      platform: 'facebook',
      type: 'post',
      content:
        '春の訪れとともに、お家のメンテナンスはいかがですか？\n今なら外壁塗装工事が特別価格でご提供中！',
      media: ['campaign.jpg'],
      hashtags: ['春キャンペーン', '外壁塗装', '特別価格'],
      scheduledDate: '2024-03-26',
      scheduledTime: '14:00',
      status: 'scheduled',
      campaign: '春の外壁塗装キャンペーン',
    },
    {
      id: '3',
      platform: 'twitter',
      type: 'post',
      content:
        '新築住宅の完成見学会を開催します！\n3/30(土)・31(日) 10:00-17:00\n詳細はプロフィールのリンクから',
      media: [],
      hashtags: ['見学会', '新築', 'イベント'],
      scheduledDate: '2024-03-28',
      scheduledTime: '09:00',
      status: 'scheduled',
    },
    {
      id: '4',
      platform: 'instagram',
      type: 'story',
      content: '本日の現場より。職人さんの丁寧な作業風景をお届けします。',
      media: ['story1.jpg', 'story2.jpg'],
      hashtags: ['現場', '職人', '施工中'],
      scheduledDate: '2024-03-24',
      scheduledTime: '15:00',
      status: 'published',
      engagement: {
        likes: 145,
        comments: 12,
        shares: 8,
        reach: 1234,
      },
    },
  ]);

  // カレンダー用の日付生成
  const generateCalendarDays = () => {
    const year = parseInt(selectedMonth.split('-')[0]);
    const month = parseInt(selectedMonth.split('-')[1]) - 1;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // 月初の曜日に合わせて空白を追加
    const startPadding = firstDay.getDay();
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    // 日付を追加
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getPostsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return scheduledPosts.filter((post) => post.scheduledDate === dateStr);
  };

  const platformIcons = {
    instagram: '📷',
    facebook: '👤',
    twitter: '🐦',
    linkedin: '💼',
  };

  const platformColors = {
    instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
    facebook: 'bg-blue-600',
    twitter: 'bg-sky-500',
    linkedin: 'bg-blue-700',
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
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                ← 戻る
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  SNS投稿スケジューラー
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  ソーシャルメディア投稿の計画・管理
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-dandori-blue to-dandori-sky text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              新規投稿作成
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* コントロール */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex gap-2">
              {['all', 'instagram', 'facebook', 'twitter', 'linkedin'].map(
                (platform) => (
                  <button
                    key={platform}
                    onClick={() => setSelectedPlatform(platform)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedPlatform === platform
                        ? 'bg-dandori-blue text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {platform === 'all'
                      ? '全て'
                      : platformIcons[
                          platform as keyof typeof platformIcons
                        ]}{' '}
                    {platform === 'all'
                      ? ''
                      : platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </button>
                ),
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
              />
              <div className="flex border border-gray-200 rounded-lg">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-2 ${viewMode === 'calendar' ? 'bg-dandori-blue text-white' : 'text-gray-600'} rounded-l-lg transition-colors`}
                >
                  📅 カレンダー
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 ${viewMode === 'list' ? 'bg-dandori-blue text-white' : 'text-gray-600'} rounded-r-lg transition-colors`}
                >
                  📋 リスト
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* カレンダービュー */}
        {viewMode === 'calendar' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
                <div
                  key={day}
                  className="bg-gray-50 p-3 text-center text-sm font-medium"
                >
                  {day}
                </div>
              ))}
              {generateCalendarDays().map((date, index) => {
                const posts = date ? getPostsForDate(date) : [];
                const isToday =
                  date && date.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={index}
                    className={`bg-white p-2 min-h-[100px] ${isToday ? 'ring-2 ring-dandori-blue' : ''}`}
                  >
                    {date && (
                      <>
                        <div className="text-sm font-medium mb-1">
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {posts.slice(0, 3).map((post) => (
                            <div
                              key={post.id}
                              className={`text-xs p-1 rounded text-white ${platformColors[post.platform]}`}
                            >
                              <div className="flex items-center gap-1">
                                <span>{platformIcons[post.platform]}</span>
                                <span className="truncate">
                                  {post.scheduledTime}
                                </span>
                              </div>
                            </div>
                          ))}
                          {posts.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{posts.length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* リストビュー */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    日時
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    プラットフォーム
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    内容
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    エンゲージメント
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {scheduledPosts
                  .filter(
                    (post) =>
                      selectedPlatform === 'all' ||
                      post.platform === selectedPlatform,
                  )
                  .map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium">
                            {post.scheduledDate}
                          </p>
                          <p className="text-xs text-gray-500">
                            {post.scheduledTime}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">
                            {platformIcons[post.platform]}
                          </span>
                          <span className="text-sm capitalize">
                            {post.platform}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="max-w-xs">
                          <p className="text-sm truncate">{post.content}</p>
                          <div className="flex gap-1 mt-1">
                            {post.hashtags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="text-xs text-dandori-blue"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            post.status === 'scheduled'
                              ? 'bg-yellow-100 text-yellow-800'
                              : post.status === 'published'
                                ? 'bg-green-100 text-green-800'
                                : post.status === 'failed'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {post.status === 'scheduled'
                            ? '予約済み'
                            : post.status === 'published'
                              ? '公開済み'
                              : post.status === 'failed'
                                ? '失敗'
                                : '下書き'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {post.engagement ? (
                          <div className="text-xs">
                            <p>
                              👍 {post.engagement.likes} 💬{' '}
                              {post.engagement.comments}
                            </p>
                            <p>
                              🔄 {post.engagement.shares} 👁{' '}
                              {post.engagement.reach}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button className="text-dandori-blue hover:text-dandori-blue-dark">
                            編集
                          </button>
                          <button className="text-red-500 hover:text-red-700">
                            削除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 統計 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">今月の投稿予定</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <div className="text-3xl">📅</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">公開済み</p>
                <p className="text-2xl font-bold text-green-600">12</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総エンゲージメント</p>
                <p className="text-2xl font-bold text-dandori-blue">3,456</p>
              </div>
              <div className="text-3xl">💬</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">平均リーチ</p>
                <p className="text-2xl font-bold text-purple-600">1,234</p>
              </div>
              <div className="text-3xl">👁</div>
            </div>
          </div>
        </div>
      </div>

      {/* 投稿作成モーダル */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">新規投稿作成</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    プラットフォーム
                  </label>
                  <div className="flex gap-2">
                    {['instagram', 'facebook', 'twitter', 'linkedin'].map(
                      (platform) => (
                        <button
                          key={platform}
                          className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                        >
                          <span>
                            {
                              platformIcons[
                                platform as keyof typeof platformIcons
                              ]
                            }
                          </span>
                          <span className="capitalize">{platform}</span>
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    投稿内容
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                    rows={4}
                    placeholder="投稿する内容を入力..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      投稿日
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      投稿時刻
                    </label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ハッシュタグ
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                    placeholder="#外壁塗装 #リフォーム..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メディア
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <p className="text-gray-500">
                      画像・動画をドラッグ＆ドロップ
                    </p>
                    <button className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                      ファイルを選択
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                  下書き保存
                </button>
                <button className="flex-1 py-2 bg-dandori-blue text-white rounded-lg hover:bg-dandori-blue-dark">
                  投稿を予約
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
