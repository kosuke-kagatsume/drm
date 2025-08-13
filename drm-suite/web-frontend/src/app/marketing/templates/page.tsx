'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface Template {
  id: string;
  name: string;
  type: 'email' | 'landing' | 'social' | 'blog';
  category: string;
  thumbnail: string;
  description: string;
  performance: {
    uses: number;
    conversion: number;
    openRate?: number;
    clickRate?: number;
  };
  tags: string[];
  lastUsed: string;
  createdBy: string;
  status: 'active' | 'draft' | 'archived';
}

export default function MarketingTemplatesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );

  const [templates] = useState<Template[]>([
    {
      id: '1',
      name: '外壁塗装キャンペーンLP',
      type: 'landing',
      category: '季節キャンペーン',
      thumbnail: '🎨',
      description: '春の外壁塗装キャンペーン用ランディングページ',
      performance: {
        uses: 145,
        conversion: 12.5,
      },
      tags: ['外壁塗装', '春', 'キャンペーン'],
      lastUsed: '2024-03-15',
      createdBy: '山田太郎',
      status: 'active',
    },
    {
      id: '2',
      name: 'リフォーム見積もり依頼メール',
      type: 'email',
      category: 'フォローアップ',
      thumbnail: '✉️',
      description: '見積もり依頼後のフォローアップメールテンプレート',
      performance: {
        uses: 89,
        conversion: 8.2,
        openRate: 45.3,
        clickRate: 12.1,
      },
      tags: ['リフォーム', 'フォローアップ', 'メール'],
      lastUsed: '2024-03-18',
      createdBy: '鈴木一郎',
      status: 'active',
    },
    {
      id: '3',
      name: '施工事例Instagram投稿',
      type: 'social',
      category: 'SNS投稿',
      thumbnail: '📱',
      description: 'ビフォーアフター施工事例のInstagram投稿テンプレート',
      performance: {
        uses: 234,
        conversion: 5.8,
      },
      tags: ['Instagram', '施工事例', 'ビフォーアフター'],
      lastUsed: '2024-03-20',
      createdBy: '佐藤花子',
      status: 'active',
    },
    {
      id: '4',
      name: '新築住宅完成見学会告知',
      type: 'blog',
      category: 'イベント告知',
      thumbnail: '🏠',
      description: '完成見学会の告知用ブログ記事テンプレート',
      performance: {
        uses: 56,
        conversion: 15.2,
      },
      tags: ['新築', '見学会', 'イベント'],
      lastUsed: '2024-03-10',
      createdBy: '山田太郎',
      status: 'active',
    },
    {
      id: '5',
      name: '月次ニュースレター',
      type: 'email',
      category: 'ニュースレター',
      thumbnail: '📰',
      description: '月次の施工実績とお知らせを配信するニュースレター',
      performance: {
        uses: 12,
        conversion: 3.5,
        openRate: 38.2,
        clickRate: 8.7,
      },
      tags: ['ニュースレター', '月次', '実績報告'],
      lastUsed: '2024-02-28',
      createdBy: '鈴木一郎',
      status: 'draft',
    },
  ]);

  const filteredTemplates = templates.filter((template) => {
    const matchesType =
      selectedType === 'all' || template.type === selectedType;
    const matchesSearch =
      searchTerm === '' ||
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some((tag) => tag.includes(searchTerm));
    return matchesType && matchesSearch;
  });

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
                  マーケティングテンプレート管理
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  キャンペーンテンプレートの作成・管理
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-dandori-blue to-dandori-sky text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              新規テンプレート作成
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* フィルター */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 テンプレート名、タグで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'email', 'landing', 'social', 'blog'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedType === type
                      ? 'bg-dandori-blue text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type === 'all'
                    ? '全て'
                    : type === 'email'
                      ? 'メール'
                      : type === 'landing'
                        ? 'LP'
                        : type === 'social'
                          ? 'SNS'
                          : 'ブログ'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* テンプレート一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">{template.thumbnail}</div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      template.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : template.status === 'draft'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {template.status === 'active'
                      ? '公開中'
                      : template.status === 'draft'
                        ? '下書き'
                        : 'アーカイブ'}
                  </span>
                </div>

                <h3 className="font-bold text-lg mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {template.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {template.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="border-t pt-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">使用回数</p>
                      <p className="font-bold">{template.performance.uses}回</p>
                    </div>
                    <div>
                      <p className="text-gray-500">コンバージョン</p>
                      <p className="font-bold text-green-600">
                        {template.performance.conversion}%
                      </p>
                    </div>
                    {template.performance.openRate && (
                      <div>
                        <p className="text-gray-500">開封率</p>
                        <p className="font-bold">
                          {template.performance.openRate}%
                        </p>
                      </div>
                    )}
                    {template.performance.clickRate && (
                      <div>
                        <p className="text-gray-500">クリック率</p>
                        <p className="font-bold">
                          {template.performance.clickRate}%
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                    <span>最終使用: {template.lastUsed}</span>
                    <span>作成: {template.createdBy}</span>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('テンプレートを編集');
                    }}
                    className="flex-1 py-1.5 bg-dandori-blue text-white text-sm rounded hover:bg-dandori-blue-dark transition-colors"
                  >
                    編集
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('テンプレートを複製');
                    }}
                    className="flex-1 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                  >
                    複製
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('テンプレートを使用');
                    }}
                    className="flex-1 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    使用
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 空状態 */}
        {filteredTemplates.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-gray-600 mb-4">
              該当するテンプレートがありません
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-dandori-blue text-white rounded-lg hover:bg-dandori-blue-dark"
            >
              新規テンプレートを作成
            </button>
          </div>
        )}
      </div>

      {/* テンプレート詳細モーダル */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedTemplate.name}
                  </h2>
                  <p className="text-gray-600">
                    {selectedTemplate.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">タイプ</p>
                  <p className="font-bold capitalize">
                    {selectedTemplate.type}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">カテゴリ</p>
                  <p className="font-bold">{selectedTemplate.category}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">ステータス</p>
                  <p className="font-bold">
                    {selectedTemplate.status === 'active'
                      ? '公開中'
                      : selectedTemplate.status === 'draft'
                        ? '下書き'
                        : 'アーカイブ'}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold mb-3">パフォーマンス</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">使用回数</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedTemplate.performance.uses}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">
                      コンバージョン率
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {selectedTemplate.performance.conversion}%
                    </p>
                  </div>
                  {selectedTemplate.performance.openRate && (
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">開封率</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {selectedTemplate.performance.openRate}%
                      </p>
                    </div>
                  )}
                  {selectedTemplate.performance.clickRate && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">クリック率</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {selectedTemplate.performance.clickRate}%
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold mb-3">プレビュー</h3>
                <div className="border rounded-lg p-4 bg-gray-50 h-64 flex items-center justify-center">
                  <p className="text-gray-500">テンプレートプレビューエリア</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 py-2 bg-dandori-blue text-white rounded-lg hover:bg-dandori-blue-dark">
                  編集する
                </button>
                <button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  複製する
                </button>
                <button className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  このテンプレートを使用
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
