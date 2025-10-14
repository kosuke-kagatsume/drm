'use client';

import React, { memo, useState, useMemo } from 'react';
import { X, Check, Search, Filter } from 'lucide-react';
import { EstimateTemplate, TemplateSection } from '../types';
import { BRANCHES } from '../constants';
import { formatPrice } from '../lib/estimateCalculations';

// ==================== TemplateSelectModal コンポーネント ====================

interface TemplateSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: EstimateTemplate[];
  onApplyTemplate: (
    template: EstimateTemplate,
    selectedSectionIds: Set<string>,
  ) => void;
}

const TemplateSelectModal = memo(function TemplateSelectModal({
  isOpen,
  onClose,
  templates,
  onApplyTemplate,
}: TemplateSelectModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] =
    useState<EstimateTemplate | null>(null);
  const [selectedSections, setSelectedSections] = useState<Set<string>>(
    new Set(),
  );
  const [selectAllSections, setSelectAllSections] = useState(false);

  // フィルタリング（Hooksはearly returnの前に配置）
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      // 検索語でフィルター
      const matchesSearch =
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // 支店でフィルター
      const matchesBranch =
        branchFilter === 'all' ||
        template.branch === branchFilter ||
        template.scope === 'company' ||
        template.scope === 'personal';

      // カテゴリでフィルター
      const matchesCategory =
        categoryFilter === 'all' || template.category === categoryFilter;

      return matchesSearch && matchesBranch && matchesCategory;
    });
  }, [templates, searchTerm, branchFilter, categoryFilter]);

  // カテゴリ一覧を取得
  const categories = useMemo(() => {
    const cats = new Set(templates.map((t) => t.category));
    return Array.from(cats);
  }, [templates]);

  // テンプレート選択時
  const handleSelectTemplate = (template: EstimateTemplate) => {
    setSelectedTemplate(template);
    setSelectedSections(new Set());
    setSelectAllSections(false);
  };

  // セクション選択の切り替え
  const handleToggleSection = (sectionId: string) => {
    const newSelectedSections = new Set(selectedSections);
    if (newSelectedSections.has(sectionId)) {
      newSelectedSections.delete(sectionId);
    } else {
      newSelectedSections.add(sectionId);
    }
    setSelectedSections(newSelectedSections);

    // 全選択状態を更新
    if (selectedTemplate) {
      setSelectAllSections(
        newSelectedSections.size === selectedTemplate.sections.length,
      );
    }
  };

  // 全選択/全解除
  const handleSelectAll = (checked: boolean) => {
    setSelectAllSections(checked);
    if (checked && selectedTemplate) {
      setSelectedSections(new Set(selectedTemplate.sections.map((s) => s.id)));
    } else {
      setSelectedSections(new Set());
    }
  };

  // テンプレート適用
  const handleApply = () => {
    if (!selectedTemplate || selectedSections.size === 0) {
      alert('大項目を選択してください');
      return;
    }

    onApplyTemplate(selectedTemplate, selectedSections);
    handleClose();
  };

  // モーダルを閉じる
  const handleClose = () => {
    setSelectedTemplate(null);
    setSelectedSections(new Set());
    setSelectAllSections(false);
    setSearchTerm('');
    setBranchFilter('all');
    setCategoryFilter('all');
    onClose();
  };

  // モーダルが閉じている場合は何も表示しない
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* ヘッダー */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">テンプレート選択</h2>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 flex overflow-hidden">
          {/* 左側: テンプレート一覧 */}
          <div className="w-1/3 border-r overflow-y-auto">
            {/* 検索・フィルター */}
            <div className="p-4 space-y-3 border-b bg-gray-50">
              {/* 検索ボックス */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="テンプレート検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 支店フィルター */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  支店
                </label>
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">全て</option>
                  {BRANCHES.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>

              {/* カテゴリフィルター */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  カテゴリ
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">全て</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* テンプレートリスト */}
            <div className="p-2">
              {filteredTemplates.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <p>テンプレートが見つかりません</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-semibold text-sm mb-1">
                        {template.name}
                      </div>
                      {template.description && (
                        <p className="text-xs text-gray-600 mb-2">
                          {template.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded">
                          {template.category}
                        </span>
                        {template.branch && (
                          <span className="px-2 py-0.5 bg-blue-200 text-blue-700 text-xs rounded">
                            {template.branch}
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-purple-200 text-purple-700 text-xs rounded">
                          {template.sections.length}大項目
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右側: セクション選択 */}
          <div className="flex-1 overflow-y-auto">
            {selectedTemplate ? (
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">
                  {selectedTemplate.name}
                </h3>
                {selectedTemplate.description && (
                  <p className="text-gray-600 mb-4">
                    {selectedTemplate.description}
                  </p>
                )}

                <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-600">作成者: </span>
                    <span className="text-sm font-semibold">
                      {selectedTemplate.createdByName}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">作成日: </span>
                    <span className="text-sm font-semibold">
                      {new Date(selectedTemplate.createdAt).toLocaleDateString(
                        'ja-JP',
                      )}
                    </span>
                  </div>
                </div>

                {/* 全選択チェックボックス */}
                <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={selectAllSections}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4"
                    id="select-all"
                  />
                  <label
                    htmlFor="select-all"
                    className="font-semibold cursor-pointer"
                  >
                    全ての大項目を選択
                  </label>
                </div>

                {/* 大項目リスト */}
                <div className="space-y-3">
                  {selectedTemplate.sections.map((section) => (
                    <SectionCard
                      key={section.id}
                      section={section}
                      isSelected={selectedSections.has(section.id)}
                      onToggle={() => handleToggleSection(section.id)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <Filter className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">
                    左側からテンプレートを選択してください
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* フッター */}
        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <button
            onClick={handleApply}
            disabled={selectedSections.size === 0}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            選択した大項目を適用（{selectedSections.size}個）
          </button>
          <button
            onClick={handleClose}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
});

// ==================== SectionCard コンポーネント ====================

interface SectionCardProps {
  section: TemplateSection;
  isSelected: boolean;
  onToggle: () => void;
}

const SectionCard = memo(function SectionCard({
  section,
  isSelected,
  onToggle,
}: SectionCardProps) {
  const totalAmount = section.items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
      }`}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          onClick={(e) => e.stopPropagation()}
          className="w-5 h-5 mt-1"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-lg">{section.name}</h4>
            <div className="text-right">
              <div className="text-sm font-semibold text-blue-600">
                {formatPrice(totalAmount)}
              </div>
              <div className="text-xs text-gray-500">
                {section.items.length}項目
              </div>
            </div>
          </div>

          {/* 項目プレビュー */}
          <div className="text-sm text-gray-600 space-y-1">
            {section.items.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-gray-400">•</span>
                <span className="flex-1 truncate">{item.itemName}</span>
                <span className="text-gray-500">
                  {formatPrice(item.amount)}
                </span>
              </div>
            ))}
            {section.items.length > 3 && (
              <div className="text-gray-400 text-xs">
                ... 他{section.items.length - 3}項目
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default TemplateSelectModal;
