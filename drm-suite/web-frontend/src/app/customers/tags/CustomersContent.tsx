'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Activity,
  Tag as TagIcon,
  TrendingUp,
  BarChart3,
  Download,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// タグカテゴリの定義
type TagCategory =
  | 'work_type'
  | 'customer_type'
  | 'priority'
  | 'status'
  | 'source'
  | 'custom';

// タグの型
interface Tag {
  id: string;
  name: string;
  category: TagCategory;
  color: string;
  icon?: string;
  description: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface CategoryConfig {
  label: string;
  description: string;
  icon: string;
}

interface Stats {
  totalTags: number;
  totalUsage: number;
  averageUsage: number;
  byCategory: Record<TagCategory, { count: number; usage: number }>;
  topTags: Tag[];
  unusedTags: Tag[];
}

export default function TagsManagementPage() {
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<
    Record<TagCategory, CategoryConfig>
  >({} as any);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<TagCategory | 'all'>(
    'all',
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  // 新規タグフォーム
  const [newTag, setNewTag] = useState({
    name: '',
    category: 'custom' as TagCategory,
    color: 'bg-gray-500',
    icon: '🏷️',
    description: '',
  });

  useEffect(() => {
    fetchTags();
  }, [selectedCategory]);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/customers/tags?${params}`);
      const data = await response.json();

      if (data.success) {
        setTags(data.tags);
        setCategories(data.categories);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    try {
      const response = await fetch('/api/customers/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTag),
      });

      const data = await response.json();
      if (data.success) {
        setShowAddModal(false);
        setNewTag({
          name: '',
          category: 'custom',
          color: 'bg-gray-500',
          icon: '🏷️',
          description: '',
        });
        fetchTags();
      }
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  const handleUpdateTag = async () => {
    if (!selectedTag) return;

    try {
      const response = await fetch('/api/customers/tags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagId: selectedTag.id, ...selectedTag }),
      });

      const data = await response.json();
      if (data.success) {
        setShowEditModal(false);
        setSelectedTag(null);
        fetchTags();
      }
    } catch (error) {
      console.error('Failed to update tag:', error);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('このタグを削除しますか？')) return;

    try {
      const response = await fetch(`/api/customers/tags?tagId=${tagId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        fetchTags();
      }
    } catch (error) {
      console.error('Failed to delete tag:', error);
    }
  };

  // カテゴリ別データ（グラフ用）
  const categoryChartData = Object.entries(stats?.byCategory || {}).map(
    ([category, data]) => ({
      name: categories[category as TagCategory]?.label || category,
      count: data.count,
      usage: data.usage,
    }),
  );

  const COLORS = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#6b7280',
  ];

  // カラーパレット
  const colorOptions = [
    { value: 'bg-blue-500', label: '青', preview: 'bg-blue-500' },
    { value: 'bg-green-500', label: '緑', preview: 'bg-green-500' },
    { value: 'bg-red-500', label: '赤', preview: 'bg-red-500' },
    { value: 'bg-yellow-500', label: '黄', preview: 'bg-yellow-500' },
    { value: 'bg-purple-500', label: '紫', preview: 'bg-purple-500' },
    { value: 'bg-pink-500', label: 'ピンク', preview: 'bg-pink-500' },
    { value: 'bg-orange-500', label: 'オレンジ', preview: 'bg-orange-500' },
    { value: 'bg-cyan-500', label: 'シアン', preview: 'bg-cyan-500' },
    { value: 'bg-gray-500', label: 'グレー', preview: 'bg-gray-500' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-dandori-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-600">タグデータ読み込み中...</p>
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
                  <span className="text-4xl mr-3">🏷️</span>
                  タグ・カテゴリ管理
                </h1>
                <p className="text-dandori-yellow/80 text-sm mt-1">
                  顧客タグのマスタ管理と使用統計
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-white text-dandori-blue px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                新規タグ作成
              </button>
              <button className="bg-white/10 border-2 border-white/30 text-white px-5 py-3 rounded-xl font-bold hover:bg-white/20 transform hover:scale-105 transition-all duration-200 flex items-center gap-2">
                <Download className="w-5 h-5" />
                エクスポート
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full-hd mx-auto px-4 lg:px-6 xl:px-8 2xl:px-12 py-8">
        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">総タグ数</span>
              <TagIcon className="w-5 h-5 text-dandori-blue" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.totalTags}個
            </p>
            <p className="text-xs text-gray-600 mt-1">登録タグ</p>
          </div>

          <div className="bg-gradient-to-br from-dandori-blue to-dandori-sky text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/90">総使用回数</span>
              <Activity className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold">{stats?.totalUsage}回</p>
            <p className="text-xs text-white/90 mt-1">全タグ合計</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/90">平均使用回数</span>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold">
              {stats?.averageUsage.toFixed(1)}回
            </p>
            <p className="text-xs text-white/90 mt-1">タグあたり</p>
          </div>

          <div className="bg-gradient-to-br from-dandori-pink to-dandori-orange text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/90">未使用タグ</span>
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold">{stats?.unusedTags.length}個</p>
            <p className="text-xs text-white/90 mt-1">整理候補</p>
          </div>
        </div>

        {/* カテゴリタブ */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              カテゴリ別表示
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-dandori text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                全て ({stats?.totalTags})
              </button>
              {Object.entries(categories).map(([key, config]) => {
                const count = stats?.byCategory[key as TagCategory]?.count || 0;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key as TagCategory)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                      selectedCategory === key
                        ? 'bg-gradient-dandori text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{config.icon}</span>
                    {config.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* タグ一覧 */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 border-l-4 border-dandori-blue"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`${tag.color} text-white rounded-lg p-3 text-2xl`}
                      >
                        {tag.icon || '🏷️'}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">
                          {tag.name}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {categories[tag.category]?.label}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedTag(tag);
                          setShowEditModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-dandori-blue transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTag(tag.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {tag.description || 'タグの説明なし'}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      使用回数:{' '}
                      <span className="font-bold text-dandori-blue">
                        {tag.usageCount}回
                      </span>
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-dandori h-2 rounded-full"
                        style={{
                          width: `${Math.min((tag.usageCount / (stats?.totalUsage || 1)) * 100 * 10, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 統計サイドバー */}
          <div className="space-y-6">
            {/* カテゴリ別統計 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                カテゴリ別統計
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="count"
                    label={(entry) => `${entry.count}`}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* TOP使用タグ */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                TOP使用タグ
              </h3>
              <div className="space-y-2">
                {stats?.topTags.slice(0, 10).map((tag, index) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500">
                        #{index + 1}
                      </span>
                      <span className="text-sm text-gray-900">{tag.name}</span>
                    </div>
                    <span className="text-sm font-bold text-dandori-blue">
                      {tag.usageCount}回
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* カテゴリ別使用回数 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                カテゴリ別使用回数
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" style={{ fontSize: '10px' }} />
                  <YAxis style={{ fontSize: '10px' }} />
                  <Tooltip />
                  <Bar dataKey="usage" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 新規タグ作成モーダル */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              新規タグ作成
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タグ名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTag.name}
                  onChange={(e) =>
                    setNewTag({ ...newTag, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue"
                  placeholder="例: 大規模改修"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カテゴリ <span className="text-red-500">*</span>
                </label>
                <select
                  value={newTag.category}
                  onChange={(e) =>
                    setNewTag({
                      ...newTag,
                      category: e.target.value as TagCategory,
                    })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue"
                >
                  {Object.entries(categories).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カラー
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() =>
                        setNewTag({ ...newTag, color: color.value })
                      }
                      className={`w-10 h-10 rounded-lg ${color.preview} ${
                        newTag.color === color.value
                          ? 'ring-4 ring-dandori-blue ring-offset-2'
                          : 'hover:scale-110'
                      } transition-all duration-200`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  アイコン（絵文字）
                </label>
                <input
                  type="text"
                  value={newTag.icon}
                  onChange={(e) =>
                    setNewTag({ ...newTag, icon: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue"
                  placeholder="例: 🏗️"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  説明
                </label>
                <textarea
                  value={newTag.description}
                  onChange={(e) =>
                    setNewTag({ ...newTag, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue"
                  rows={3}
                  placeholder="タグの説明や使用用途を入力"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateTag}
                disabled={!newTag.name}
                className="flex-1 py-3 bg-gradient-dandori text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                作成
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* タグ編集モーダル */}
      {showEditModal && selectedTag && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">タグ編集</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タグ名
                </label>
                <input
                  type="text"
                  value={selectedTag.name}
                  onChange={(e) =>
                    setSelectedTag({ ...selectedTag, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カテゴリ
                </label>
                <select
                  value={selectedTag.category}
                  onChange={(e) =>
                    setSelectedTag({
                      ...selectedTag,
                      category: e.target.value as TagCategory,
                    })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue"
                >
                  {Object.entries(categories).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カラー
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() =>
                        setSelectedTag({ ...selectedTag, color: color.value })
                      }
                      className={`w-10 h-10 rounded-lg ${color.preview} ${
                        selectedTag.color === color.value
                          ? 'ring-4 ring-dandori-blue ring-offset-2'
                          : 'hover:scale-110'
                      } transition-all duration-200`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  アイコン（絵文字）
                </label>
                <input
                  type="text"
                  value={selectedTag.icon || ''}
                  onChange={(e) =>
                    setSelectedTag({ ...selectedTag, icon: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  説明
                </label>
                <textarea
                  value={selectedTag.description}
                  onChange={(e) =>
                    setSelectedTag({
                      ...selectedTag,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateTag}
                className="flex-1 py-3 bg-gradient-dandori text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                更新
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
