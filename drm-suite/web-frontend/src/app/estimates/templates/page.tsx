'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Copy,
  Trash2,
  FileText,
  Calendar,
  User,
  Package,
  AlertTriangle,
  Star,
  StarOff,
} from 'lucide-react';

interface EstimateTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  items: any[];
  overheadSettings: any;
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

export default function EstimateTemplatesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<EstimateTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<EstimateTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: '外壁・屋根工事',
    isDefault: false,
  });

  // テンプレート読み込み
  useEffect(() => {
    const savedTemplates = JSON.parse(
      localStorage.getItem('estimate_templates') || '[]',
    );
    setTemplates(savedTemplates);
  }, []);

  // カテゴリ一覧
  const categories = [
    '外壁・屋根工事',
    '内装工事',
    '水回り工事',
    '電気工事',
    'エクステリア工事',
    'リフォーム工事',
    'その他',
  ];

  // フィルタリング
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // テンプレート作成
  const handleCreateTemplate = () => {
    if (!newTemplate.name) {
      alert('テンプレート名を入力してください');
      return;
    }

    const template: EstimateTemplate = {
      id: `TMPL-${Date.now()}`,
      name: newTemplate.name,
      description: newTemplate.description,
      category: newTemplate.category,
      items: [],
      overheadSettings: {
        管理費率: 0.08,
        一般管理費率: 0.05,
        諸経費率: 0.03,
        廃材処分費率: 0.02,
      },
      isDefault: newTemplate.isDefault,
      createdBy: user?.email || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
    };

    const updatedTemplates = [...templates, template];
    setTemplates(updatedTemplates);
    localStorage.setItem(
      'estimate_templates',
      JSON.stringify(updatedTemplates),
    );

    setNewTemplate({
      name: '',
      description: '',
      category: '外壁・屋根工事',
      isDefault: false,
    });
    setShowCreateModal(false);

    // 作成後すぐに編集画面に移動
    router.push(`/estimates/editor-v5/${template.id}?edit_template=true`);
  };

  // テンプレート複製
  const handleDuplicateTemplate = (template: EstimateTemplate) => {
    const duplicated: EstimateTemplate = {
      ...template,
      id: `TMPL-${Date.now()}`,
      name: `${template.name}（複製）`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
    };

    const updatedTemplates = [...templates, duplicated];
    setTemplates(updatedTemplates);
    localStorage.setItem(
      'estimate_templates',
      JSON.stringify(updatedTemplates),
    );
  };

  // テンプレート削除
  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('このテンプレートを削除しますか？')) {
      const updatedTemplates = templates.filter((t) => t.id !== templateId);
      setTemplates(updatedTemplates);
      localStorage.setItem(
        'estimate_templates',
        JSON.stringify(updatedTemplates),
      );
    }
  };

  // デフォルト設定切替
  const toggleDefaultTemplate = (templateId: string) => {
    const updatedTemplates = templates.map((template) => ({
      ...template,
      isDefault: template.id === templateId ? !template.isDefault : false, // 他のテンプレートのデフォルトを解除
    }));
    setTemplates(updatedTemplates);
    localStorage.setItem(
      'estimate_templates',
      JSON.stringify(updatedTemplates),
    );
  };

  // テンプレート使用
  const handleUseTemplate = (templateId: string) => {
    // 使用回数を増やす
    const updatedTemplates = templates.map((template) =>
      template.id === templateId
        ? { ...template, usageCount: template.usageCount + 1 }
        : template,
    );
    setTemplates(updatedTemplates);
    localStorage.setItem(
      'estimate_templates',
      JSON.stringify(updatedTemplates),
    );

    // 見積作成ページに移動
    router.push(`/estimates/editor-v5/new?template=${templateId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/estimates')}
                className="mr-4 hover:opacity-80 transition"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">見積テンプレート管理</h1>
                <p className="text-sm opacity-90 mt-1">
                  よく使う見積パターンをテンプレート化
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg transition flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              新規テンプレート
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* フィルター */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="テンプレート名・説明で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">全カテゴリ</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* テンプレート一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {template.name}
                      </h3>
                      {template.isDefault && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {template.description}
                    </p>
                    <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                      {template.category}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-500 mb-4">
                  <div className="flex justify-between">
                    <span>項目数:</span>
                    <span>{template.items.length}項目</span>
                  </div>
                  <div className="flex justify-between">
                    <span>使用回数:</span>
                    <span>{template.usageCount}回</span>
                  </div>
                  <div className="flex justify-between">
                    <span>作成日:</span>
                    <span>
                      {new Date(template.createdAt).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleUseTemplate(template.id)}
                    className="flex-1 bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600 transition text-sm font-medium"
                  >
                    使用
                  </button>
                  <button
                    onClick={() =>
                      router.push(
                        `/estimates/editor-v5/${template.id}?edit_template=true`,
                      )
                    }
                    className="p-2 text-gray-600 hover:text-blue-600 transition"
                    title="編集"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicateTemplate(template)}
                    className="p-2 text-gray-600 hover:text-green-600 transition"
                    title="複製"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleDefaultTemplate(template.id)}
                    className="p-2 text-gray-600 hover:text-yellow-600 transition"
                    title={
                      template.isDefault ? 'デフォルト解除' : 'デフォルト設定'
                    }
                  >
                    {template.isDefault ? (
                      <Star className="h-4 w-4 fill-current text-yellow-500" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-2 text-gray-600 hover:text-red-600 transition"
                    title="削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategory !== 'all'
                  ? '条件に一致するテンプレートがありません'
                  : 'テンプレートがまだありません'}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition"
              >
                最初のテンプレートを作成
              </button>
            </div>
          )}
        </div>

        {/* 統計情報 */}
        {templates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                総テンプレート数
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {templates.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                今月の使用回数
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                {templates.reduce((sum, t) => sum + t.usageCount, 0)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                人気テンプレート
              </h3>
              <p className="text-sm font-medium text-gray-900">
                {templates.sort((a, b) => b.usageCount - a.usageCount)[0]
                  ?.name || '-'}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                カテゴリ数
              </h3>
              <p className="text-3xl font-bold text-indigo-600">
                {[...new Set(templates.map((t) => t.category))].length}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 新規作成モーダル */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-bold">新規テンプレート作成</h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    テンプレート名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, name: e.target.value })
                    }
                    placeholder="例: 一般住宅外壁塗装基本パック"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    説明
                  </label>
                  <textarea
                    value={newTemplate.description}
                    onChange={(e) =>
                      setNewTemplate({
                        ...newTemplate,
                        description: e.target.value,
                      })
                    }
                    placeholder="このテンプレートの用途や特徴を入力..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    カテゴリ
                  </label>
                  <select
                    value={newTemplate.category}
                    onChange={(e) =>
                      setNewTemplate({
                        ...newTemplate,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={newTemplate.isDefault}
                    onChange={(e) =>
                      setNewTemplate({
                        ...newTemplate,
                        isDefault: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isDefault"
                    className="ml-2 text-sm text-gray-700"
                  >
                    デフォルトテンプレートに設定
                  </label>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex gap-3 justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
              >
                キャンセル
              </button>
              <button
                onClick={handleCreateTemplate}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
              >
                作成して編集
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
