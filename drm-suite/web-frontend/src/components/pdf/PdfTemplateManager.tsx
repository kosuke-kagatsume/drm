'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Edit,
  Copy,
  Trash2,
  Eye,
  Download,
  Upload,
  Settings,
  Filter,
  Search,
  Grid,
  List,
  Star,
  Calendar,
  User,
  MoreVertical
} from 'lucide-react';
import { PdfTemplate, DocumentType, TemplateStatus, PdfTemplateListResponse } from '@/types/pdf-template';

interface PdfTemplateManagerProps {
  companyId: string;
  onTemplateSelect?: (template: PdfTemplate) => void;
  onTemplateEdit?: (template: PdfTemplate) => void;
}

const documentTypeLabels: Record<DocumentType, string> = {
  estimate: '見積書',
  invoice: '請求書',
  contract: '契約書',
  proposal: '提案書',
  quotation: '見積依頼書',
  receipt: '領収書',
  delivery: '納品書',
  specification: '仕様書',
  report: '報告書',
  certificate: '証明書'
};

const statusLabels: Record<TemplateStatus, string> = {
  draft: '下書き',
  active: '有効',
  archived: 'アーカイブ'
};

const statusColors: Record<TemplateStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  archived: 'bg-yellow-100 text-yellow-800'
};

export default function PdfTemplateManager({
  companyId,
  onTemplateSelect,
  onTemplateEdit
}: PdfTemplateManagerProps) {
  const [templates, setTemplates] = useState<PdfTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedType, setSelectedType] = useState<DocumentType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<TemplateStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [companyId, selectedType, selectedStatus]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ companyId });
      if (selectedType !== 'all') params.append('documentType', selectedType);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);

      const response = await fetch(`/api/pdf/templates?${params}`);

      if (response.ok) {
        const data: PdfTemplateListResponse = await response.json();
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('テンプレート読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setShowCreateModal(true);
  };

  const handleDuplicateTemplate = async (template: PdfTemplate) => {
    try {
      const response = await fetch(`/api/pdf/templates/${template.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          name: `${template.name} (コピー)`
        })
      });

      if (response.ok) {
        loadTemplates();
      }
    } catch (error) {
      console.error('テンプレート複製エラー:', error);
    }
  };

  const handleDeleteTemplate = async (template: PdfTemplate) => {
    if (!confirm(`「${template.name}」を削除しますか？`)) return;

    try {
      const response = await fetch(`/api/pdf/templates/${template.id}?companyId=${companyId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadTemplates();
      }
    } catch (error) {
      console.error('テンプレート削除エラー:', error);
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">PDFテンプレート管理</h2>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
            {filteredTemplates.length}件
          </span>
        </div>
        <button
          onClick={handleCreateTemplate}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          新規作成
        </button>
      </div>

      {/* フィルター・検索バー */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* 検索 */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="テンプレート名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 文書タイプフィルター */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as DocumentType | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべての文書タイプ</option>
              {Object.entries(documentTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* ステータスフィルター */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as TemplateStatus | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべてのステータス</option>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* 表示モード切替 */}
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* テンプレート一覧 */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">テンプレートがありません</h3>
          <p className="text-gray-600 mb-4">新しいPDFテンプレートを作成してください。</p>
          <button
            onClick={handleCreateTemplate}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            テンプレート作成
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={() => onTemplateSelect?.(template)}
              onEdit={() => onTemplateEdit?.(template)}
              onDuplicate={() => handleDuplicateTemplate(template)}
              onDelete={() => handleDeleteTemplate(template)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  テンプレート名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  文書タイプ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  使用回数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  更新日
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTemplates.map((template) => (
                <TemplateRow
                  key={template.id}
                  template={template}
                  onSelect={() => onTemplateSelect?.(template)}
                  onEdit={() => onTemplateEdit?.(template)}
                  onDuplicate={() => handleDuplicateTemplate(template)}
                  onDelete={() => handleDeleteTemplate(template)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 新規作成モーダル */}
      {showCreateModal && (
        <CreateTemplateModal
          companyId={companyId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadTemplates();
          }}
        />
      )}
    </div>
  );
}

// テンプレートカードコンポーネント
function TemplateCard({
  template,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete
}: {
  template: PdfTemplate;
  onSelect: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow relative">
      {/* ステータスバッジ */}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[template.status]}`}>
          {statusLabels[template.status]}
        </span>
        {template.isDefault && (
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
        )}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showActions && (
            <div className="absolute right-0 top-8 bg-white border rounded-md shadow-lg z-10 py-1 min-w-32">
              <button
                onClick={() => { onEdit(); setShowActions(false); }}
                className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                編集
              </button>
              <button
                onClick={() => { onDuplicate(); setShowActions(false); }}
                className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center"
              >
                <Copy className="w-4 h-4 mr-2" />
                複製
              </button>
              {!template.isDefault && (
                <button
                  onClick={() => { onDelete(); setShowActions(false); }}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 text-red-600 flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  削除
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* テンプレート情報 */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {template.name}
        </h3>

        <div className="flex items-center text-sm text-gray-600">
          <FileText className="w-4 h-4 mr-2" />
          {documentTypeLabels[template.documentType]}
        </div>

        {template.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {template.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(template.updatedAt).toLocaleDateString('ja-JP')}
          </div>
          <div className="flex items-center">
            <Eye className="w-3 h-3 mr-1" />
            {template.usageCount}回使用
          </div>
        </div>
      </div>

      {/* アクション */}
      <div className="mt-4 pt-4 border-t flex items-center justify-between">
        <button
          onClick={onSelect}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          選択
        </button>
        <button
          onClick={onEdit}
          className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
        >
          <Settings className="w-3 h-3 mr-1" />
          設定
        </button>
      </div>
    </div>
  );
}

// テンプレート行コンポーネント
function TemplateRow({
  template,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete
}: {
  template: PdfTemplate;
  onSelect: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {template.isDefault && (
            <Star className="w-4 h-4 text-yellow-500 fill-current mr-2" />
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">{template.name}</div>
            {template.description && (
              <div className="text-sm text-gray-500 truncate max-w-xs">{template.description}</div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {documentTypeLabels[template.documentType]}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[template.status]}`}>
          {statusLabels[template.status]}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {template.usageCount}回
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(template.updatedAt).toLocaleDateString('ja-JP')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={onSelect}
            className="text-blue-600 hover:text-blue-700"
          >
            選択
          </button>
          <button
            onClick={onEdit}
            className="text-gray-600 hover:text-gray-700"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDuplicate}
            className="text-gray-600 hover:text-gray-700"
          >
            <Copy className="w-4 h-4" />
          </button>
          {!template.isDefault && (
            <button
              onClick={onDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// 新規作成モーダル
function CreateTemplateModal({
  companyId,
  onClose,
  onSuccess
}: {
  companyId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    documentType: 'estimate' as DocumentType,
    status: 'draft' as TemplateStatus
  });
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setCreating(true);
      const response = await fetch('/api/pdf/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          companyId,
          version: '1.0',
          isDefault: false,
          permissions: {
            allowEdit: ['admin', 'manager'],
            allowView: ['admin', 'manager', 'sales'],
            allowPrint: ['admin', 'manager', 'sales'],
            allowDownload: ['admin', 'manager', 'sales']
          },
          styles: {
            globalCss: '',
            useCompanyBranding: true
          },
          sections: [],
          layout: {
            pageSize: 'A4' as const,
            orientation: 'portrait' as const,
            margins: { top: 20, right: 20, bottom: 20, left: 20 },
            header: { enabled: true, height: 80, content: '' },
            footer: { enabled: true, height: 60, content: '' },
            showPageNumbers: true,
            pageNumberPosition: 'footer' as const,
            showWatermark: false
          }
        })
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('テンプレート作成エラー:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">新規テンプレート作成</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              テンプレート名*
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 標準見積書テンプレート"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="テンプレートの用途や特徴を入力..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              文書タイプ*
            </label>
            <select
              value={formData.documentType}
              onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value as DocumentType }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {Object.entries(documentTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              初期ステータス
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as TemplateStatus }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={creating || !formData.name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? '作成中...' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}