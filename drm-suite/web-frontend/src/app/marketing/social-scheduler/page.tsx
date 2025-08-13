'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SocialPost {
  id: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'line';
  content: string;
  images: string[];
  scheduledDate: string;
  scheduledTime: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  engagement?: {
    likes: number;
    shares: number;
    comments: number;
    clicks: number;
  };
  campaign?: string;
}

export default function SocialSchedulerPage() {
  const router = useRouter();
  const [selectedPlatform, setSelectedPlatform] = useState<
    'all' | SocialPost['platform']
  >('all');
  const [selectedStatus, setSelectedStatus] = useState<
    'all' | SocialPost['status']
  >('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');

  // モックデータ
  const [posts, setPosts] = useState<SocialPost[]>([
    {
      id: '1',
      platform: 'instagram',
      content:
        '本日完成した外壁塗装の現場写真です。お客様にも大変満足いただけました！\n\n#外壁塗装 #リフォーム #建築 #満足度100',
      images: ['/images/work1.jpg'],
      scheduledDate: '2024-02-15',
      scheduledTime: '10:00',
      status: 'scheduled',
      campaign: '春の外壁塗装キャンペーン',
    },
    {
      id: '2',
      platform: 'facebook',
      content:
        '春の塗装キャンペーン実施中！詳細はWebサイトをご覧ください。\n\n✨ 最大20%OFF\n✨ 無料現地調査\n✨ 10年保証付き',
      images: [],
      scheduledDate: '2024-02-14',
      scheduledTime: '09:00',
      status: 'published',
      engagement: {
        likes: 145,
        shares: 23,
        comments: 8,
        clicks: 67,
      },
      campaign: '春の外壁塗装キャンペーン',
    },
    {
      id: '3',
      platform: 'line',
      content:
        '【お客様の声】\n「丁寧な作業で、仕上がりに大満足です。次回もお願いします！」\n\nお客様満足度98%の実績をぜひご体験ください。',
      images: ['/images/testimonial.jpg'],
      scheduledDate: '2024-02-16',
      scheduledTime: '14:00',
      status: 'draft',
    },
  ]);

  const [newPost, setNewPost] = useState<Partial<SocialPost>>({
    platform: 'instagram',
    content: '',
    images: [],
    scheduledDate: '',
    scheduledTime: '',
    campaign: '',
  });

  const platforms = [
    { key: 'instagram', name: 'Instagram', icon: '📷', color: 'bg-pink-500' },
    { key: 'facebook', name: 'Facebook', icon: '📘', color: 'bg-blue-600' },
    { key: 'twitter', name: 'Twitter', icon: '🐦', color: 'bg-sky-400' },
    { key: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'bg-blue-700' },
    { key: 'line', name: 'LINE', icon: '📱', color: 'bg-green-500' },
  ];

  const constructionTemplates = [
    {
      platform: 'instagram',
      title: '施工完了報告',
      content:
        '本日完成した{工事種別}の現場写真です。お客様にも大変満足いただけました！\n\n#{工事種別} #リフォーム #建築 #満足度100 #職人技',
      hashtags: ['外壁塗装', 'リフォーム', '建築', '満足度100', '職人技'],
    },
    {
      platform: 'facebook',
      title: 'キャンペーン告知',
      content:
        '{キャンペーン名}実施中！詳細はWebサイトをご覧ください。\n\n✨ {特典1}\n✨ {特典2}\n✨ {特典3}\n\n期間限定のお得な機会をお見逃しなく！',
      hashtags: ['キャンペーン', 'お得', '期間限定'],
    },
    {
      platform: 'line',
      title: 'お客様の声',
      content:
        '【お客様の声】\n「{お客様コメント}」\n\nお客様満足度98%の実績をぜひご体験ください。',
      hashtags: ['お客様の声', '満足度', '実績'],
    },
  ];

  const getPlatformIcon = (platform: string) => {
    const platformData = platforms.find((p) => p.key === platform);
    return platformData ? platformData.icon : '📊';
  };

  const getStatusBadge = (status: SocialPost['status']) => {
    const statusConfig = {
      draft: { label: '下書き', class: 'bg-gray-100 text-gray-700' },
      scheduled: { label: '予約済み', class: 'bg-blue-100 text-blue-700' },
      published: { label: '投稿済み', class: 'bg-green-100 text-green-700' },
      failed: { label: '失敗', class: 'bg-red-100 text-red-700' },
    };
    const config = statusConfig[status];
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}
      >
        {config.label}
      </span>
    );
  };

  const createPost = () => {
    const post: SocialPost = {
      id: Date.now().toString(),
      platform: newPost.platform as SocialPost['platform'],
      content: newPost.content || '',
      images: newPost.images || [],
      scheduledDate: newPost.scheduledDate || '',
      scheduledTime: newPost.scheduledTime || '',
      status: 'draft',
      campaign: newPost.campaign,
    };
    setPosts([...posts, post]);
    setNewPost({
      platform: 'instagram',
      content: '',
      images: [],
      scheduledDate: '',
      scheduledTime: '',
      campaign: '',
    });
    setShowCreateForm(false);
    alert('投稿を作成しました！');
  };

  const schedulePost = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, status: 'scheduled' as const } : post,
      ),
    );
    alert('投稿をスケジュールしました！');
  };

  const duplicatePost = (post: SocialPost) => {
    const duplicated: SocialPost = {
      ...post,
      id: Date.now().toString(),
      status: 'draft',
      scheduledDate: '',
      scheduledTime: '',
    };
    setPosts([...posts, duplicated]);
    alert('投稿を複製しました！');
  };

  const deletePost = (postId: string) => {
    if (confirm('この投稿を削除しますか？')) {
      setPosts(posts.filter((post) => post.id !== postId));
      alert('投稿を削除しました！');
    }
  };

  const applyTemplate = (template: (typeof constructionTemplates)[0]) => {
    setNewPost((prev) => ({
      ...prev,
      platform: template.platform as SocialPost['platform'],
      content: template.content,
    }));
  };

  const filteredPosts = posts.filter((post) => {
    const platformMatch =
      selectedPlatform === 'all' || post.platform === selectedPlatform;
    const statusMatch =
      selectedStatus === 'all' || post.status === selectedStatus;
    return platformMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-white/80 hover:text-white"
              >
                ← ダッシュボードに戻る
              </button>
              <div>
                <h1 className="text-3xl font-bold">📱 SNS投稿スケジューラー</h1>
                <p className="text-pink-100 mt-1">
                  建築業界向けソーシャルメディア管理
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() =>
                  setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')
                }
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
              >
                {viewMode === 'calendar'
                  ? '📋 リスト表示'
                  : '📅 カレンダー表示'}
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-white text-pink-600 px-6 py-2 rounded-lg font-medium hover:bg-pink-50 transition"
              >
                ➕ 新規投稿
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* フィルター */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                プラットフォーム
              </label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value as any)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">全プラットフォーム</option>
                {platforms.map((platform) => (
                  <option key={platform.key} value={platform.key}>
                    {platform.icon} {platform.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ステータス
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">全ステータス</option>
                <option value="draft">下書き</option>
                <option value="scheduled">予約済み</option>
                <option value="published">投稿済み</option>
                <option value="failed">失敗</option>
              </select>
            </div>

            <div className="ml-auto">
              <p className="text-sm text-gray-600">
                表示中: {filteredPosts.length}件 / 全{posts.length}件
              </p>
            </div>
          </div>
        </div>

        {/* 投稿リスト */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {getPlatformIcon(post.platform)}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900 capitalize">
                        {post.platform}
                      </h3>
                      {post.campaign && (
                        <p className="text-sm text-gray-600">
                          キャンペーン: {post.campaign}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(post.status)}
                    <div className="flex space-x-1">
                      <button
                        onClick={() => duplicatePost(post)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="複製"
                      >
                        📋
                      </button>
                      {post.status === 'draft' && (
                        <button
                          onClick={() => schedulePost(post.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="スケジュール"
                        >
                          ⏰
                        </button>
                      )}
                      <button
                        onClick={() => deletePost(post.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="削除"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <p className="text-gray-700 whitespace-pre-wrap mb-4">
                      {post.content}
                    </p>

                    {post.images.length > 0 && (
                      <div className="flex space-x-2 mb-4">
                        {post.images.map((image, idx) => (
                          <div
                            key={idx}
                            className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center"
                          >
                            <span className="text-2xl">📸</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {post.scheduledDate && (
                        <span>
                          📅 {post.scheduledDate} {post.scheduledTime}
                        </span>
                      )}
                      {post.engagement && (
                        <>
                          <span>👍 {post.engagement.likes}</span>
                          <span>🔄 {post.engagement.shares}</span>
                          <span>💬 {post.engagement.comments}</span>
                          <span>🔗 {post.engagement.clicks}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-1">
                    {post.platform === 'instagram' && (
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <h4 className="font-medium mb-2">
                          Instagram プレビュー
                        </h4>
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white text-sm">
                              建
                            </div>
                            <span className="text-sm font-semibold">
                              建築会社アカウント
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-3">
                            {post.content}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredPosts.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <span className="text-6xl">📭</span>
              <p className="mt-4 text-gray-600">投稿が見つかりません</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition"
              >
                最初の投稿を作成
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 新規投稿モーダル */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">新規投稿作成</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      プラットフォーム *
                    </label>
                    <select
                      value={newPost.platform}
                      onChange={(e) =>
                        setNewPost((prev) => ({
                          ...prev,
                          platform: e.target.value as SocialPost['platform'],
                        }))
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      {platforms.map((platform) => (
                        <option key={platform.key} value={platform.key}>
                          {platform.icon} {platform.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      テンプレート
                    </label>
                    <div className="space-y-2">
                      {constructionTemplates
                        .filter((t) => t.platform === newPost.platform)
                        .map((template, idx) => (
                          <button
                            key={idx}
                            onClick={() => applyTemplate(template)}
                            className="w-full p-3 text-left border rounded-lg hover:bg-gray-50"
                          >
                            <p className="font-medium text-sm">
                              {template.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              クリックして適用
                            </p>
                          </button>
                        ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      投稿内容 *
                    </label>
                    <textarea
                      value={newPost.content}
                      onChange={(e) =>
                        setNewPost((prev) => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                      rows={6}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="投稿内容を入力..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      文字数: {newPost.content?.length || 0}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        投稿日
                      </label>
                      <input
                        type="date"
                        value={newPost.scheduledDate}
                        onChange={(e) =>
                          setNewPost((prev) => ({
                            ...prev,
                            scheduledDate: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        投稿時間
                      </label>
                      <input
                        type="time"
                        value={newPost.scheduledTime}
                        onChange={(e) =>
                          setNewPost((prev) => ({
                            ...prev,
                            scheduledTime: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      関連キャンペーン
                    </label>
                    <input
                      type="text"
                      value={newPost.campaign}
                      onChange={(e) =>
                        setNewPost((prev) => ({
                          ...prev,
                          campaign: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="春の外壁塗装キャンペーン"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium mb-4">プレビュー</h4>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-2xl">
                        {getPlatformIcon(newPost.platform || 'instagram')}
                      </span>
                      <span className="font-semibold">建築会社アカウント</span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {newPost.content || 'ここに投稿内容が表示されます...'}
                    </p>
                    {(newPost.scheduledDate || newPost.scheduledTime) && (
                      <p className="text-sm text-gray-500 mt-3">
                        📅 {newPost.scheduledDate} {newPost.scheduledTime}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={createPost}
                className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              >
                投稿を作成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
