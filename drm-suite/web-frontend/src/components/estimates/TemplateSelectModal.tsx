'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  FileText,
  Star,
  Clock,
  Tag,
  Check,
  ChevronRight,
  Plus,
} from 'lucide-react';
import {
  EstimateTemplate,
  TemplateApplyOptions,
  TEMPLATE_CATEGORIES,
} from '@/features/estimate-templates/types';
import {
  ESTIMATE_TEMPLATES,
  searchTemplates,
  getTemplatesByCategory,
  getPopularTemplates,
} from '@/features/estimate-templates/data';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApply: (template: EstimateTemplate, options: TemplateApplyOptions) => void;
  currentCustomerId?: string;
  currentProjectName?: string;
}

export default function TemplateSelectModal({
  isOpen,
  onClose,
  onApply,
  currentCustomerId,
  currentProjectName,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] =
    useState<EstimateTemplate | null>(null);
  const [filterType, setFilterType] = useState<
    'all' | 'myTemplates' | 'tokyo' | 'osaka' | 'nagoya'
  >('all');
  const [selectedSections, setSelectedSections] = useState<Set<string>>(
    new Set(),
  );
  const [applyOptions, setApplyOptions] = useState<TemplateApplyOptions>({
    includeOptionalItems: true,
    overridePrices: false,
    keepExistingItems: false,
    applyFormulas: true,
    customerId: currentCustomerId,
    projectName: currentProjectName,
    adjustmentRate: 1.0,
  });

  // テンプレート一覧の取得
  const templates = useMemo(() => {
    let result = ESTIMATE_TEMPLATES;

    // スコープ・支店フィルタ
    result = result.filter((template) => {
      if (filterType === 'myTemplates') {
        // 自分のテンプレート（個人スコープ + ログインユーザーが作成）
        return template.scope === 'personal';
      }
      if (filterType === 'tokyo') return template.branch === '東京支店';
      if (filterType === 'osaka') return template.branch === '大阪支店';
      if (filterType === 'nagoya') return template.branch === '名古屋支店';
      return true; // 'all'の場合は全て表示
    });

    // カテゴリフィルタ
    if (selectedCategory !== 'all') {
      result = result.filter(
        (template) => template.category === selectedCategory,
      );
    }

    // 検索フィルタ
    if (searchQuery) {
      result = result.filter(
        (template) =>
          template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          template.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
    }

    return result;
  }, [selectedCategory, searchQuery, filterType]);

  // 人気テンプレート
  const popularTemplates = useMemo(() => getPopularTemplates(3), []);

  // セクション選択の切り替え
  const toggleSection = (sectionId: string) => {
    const newSelected = new Set(selectedSections);
    if (newSelected.has(sectionId)) {
      newSelected.delete(sectionId);
    } else {
      newSelected.add(sectionId);
    }
    setSelectedSections(newSelected);
  };

  // 全選択/全解除
  const toggleAllSections = () => {
    if (!selectedTemplate) return;
    if (selectedSections.size === selectedTemplate.sections.length) {
      setSelectedSections(new Set());
    } else {
      setSelectedSections(new Set(selectedTemplate.sections.map((s) => s.id)));
    }
  };

  // テンプレート選択時にセクションを全選択
  const handleTemplateSelect = (template: EstimateTemplate) => {
    setSelectedTemplate(template);
    setSelectedSections(new Set(template.sections.map((s) => s.id)));
  };

  // 適用して続ける（モーダルを開いたまま）
  const handleApplyAndContinue = () => {
    if (selectedTemplate && selectedSections.size > 0) {
      // 選択されたセクションだけを含むテンプレートを作成
      const filteredTemplate = {
        ...selectedTemplate,
        sections: selectedTemplate.sections.filter((section) =>
          selectedSections.has(section.id),
        ),
      };
      // 既存項目を保持する設定で適用
      onApply(filteredTemplate, { ...applyOptions, keepExistingItems: true });
      // テンプレート選択をリセット（次のテンプレートを選べるように）
      setSelectedTemplate(null);
      setSelectedSections(new Set());
    }
  };

  // 適用して閉じる
  const handleApplyAndClose = () => {
    if (selectedTemplate && selectedSections.size > 0) {
      // 選択されたセクションだけを含むテンプレートを作成
      const filteredTemplate = {
        ...selectedTemplate,
        sections: selectedTemplate.sections.filter((section) =>
          selectedSections.has(section.id),
        ),
      };
      // 既存項目を保持する設定で適用
      onApply(filteredTemplate, { ...applyOptions, keepExistingItems: true });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            テンプレートから作成
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* 左サイドバー - テンプレート一覧 */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* 検索バー */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="テンプレートを検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* フィルタボタン */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2 overflow-x-auto">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    filterType === 'all'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  全て
                </button>
                <button
                  onClick={() => setFilterType('myTemplates')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    filterType === 'myTemplates'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  自分のテンプレート
                </button>
                <button
                  onClick={() => setFilterType('tokyo')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    filterType === 'tokyo'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  東京支店
                </button>
                <button
                  onClick={() => setFilterType('osaka')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    filterType === 'osaka'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  大阪支店
                </button>
                <button
                  onClick={() => setFilterType('nagoya')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    filterType === 'nagoya'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  名古屋支店
                </button>
              </div>
            </div>

            {/* カテゴリタブ */}
            <div className="px-4 py-2 flex gap-2 overflow-x-auto border-b border-gray-200">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                すべて
              </button>
              {Object.entries(TEMPLATE_CATEGORIES).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === key
                      ? category.color
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category.icon} {category.label}
                </button>
              ))}
            </div>

            {/* 人気テンプレート */}
            {selectedCategory === 'all' && searchQuery === '' && (
              <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
                <div className="text-xs font-medium text-amber-800 mb-2">
                  ⭐ 人気テンプレート
                </div>
                <div className="space-y-1">
                  {popularTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className={`w-full text-left px-2 py-1 rounded text-sm hover:bg-amber-100 transition-colors ${
                        selectedTemplate?.id === template.id
                          ? 'bg-amber-100'
                          : ''
                      }`}
                    >
                      <div className="font-medium text-amber-900">
                        {template.name}
                      </div>
                      <div className="text-xs text-amber-700">
                        使用回数: {template.usageCount}回
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* テンプレート一覧 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {template.name}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {template.description}
                      </div>
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <Check className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {template.sections.length}セクション
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {template.lastUsed
                        ? new Date(template.lastUsed).toLocaleDateString(
                            'ja-JP',
                          )
                        : '未使用'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {template.usageCount}回
                    </span>
                  </div>
                  {template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 右側 - テンプレート詳細 */}
          <div className="flex-1 flex flex-col">
            {selectedTemplate ? (
              <>
                {/* テンプレート内容プレビュー */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {selectedTemplate.name}
                    </h3>
                    <p className="text-gray-600">
                      {selectedTemplate.description}
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full ${TEMPLATE_CATEGORIES[selectedTemplate.category].color}`}
                      >
                        {TEMPLATE_CATEGORIES[selectedTemplate.category].icon}{' '}
                        {TEMPLATE_CATEGORIES[selectedTemplate.category].label}
                      </span>
                      <span className="text-gray-500">
                        消費税率: {selectedTemplate.defaultTaxRate}%
                      </span>
                      <span className="text-gray-500">
                        有効期限: {selectedTemplate.defaultValidDays}日
                      </span>
                    </div>
                  </div>

                  {/* 全選択ボタン */}
                  <div className="mb-4 flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      選択した大項目のみペースト
                    </span>
                    <button
                      onClick={toggleAllSections}
                      className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors"
                    >
                      {selectedSections.size ===
                      selectedTemplate.sections.length
                        ? '全て解除'
                        : '全て選択'}
                    </button>
                  </div>

                  {/* セクション一覧 */}
                  <div className="space-y-4">
                    {selectedTemplate.sections.map((section) => (
                      <div
                        key={section.id}
                        className={`border-2 rounded-lg transition-all ${
                          selectedSections.has(section.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div
                          className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-3 cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleSection(section.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedSections.has(section.id)}
                            onChange={() => toggleSection(section.id)}
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <h4 className="font-medium text-gray-900 flex-1">
                            {section.name}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {section.items.length}項目
                          </span>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {section.items.map((item) => (
                            <div
                              key={item.id}
                              className="px-4 py-2 flex items-center justify-between"
                            >
                              <div className="flex-1">
                                <div className="font-medium text-sm text-gray-900">
                                  {item.itemName}
                                  {item.isRequired && (
                                    <span className="ml-2 text-red-500">
                                      *必須
                                    </span>
                                  )}
                                  {item.isOptional && (
                                    <span className="ml-2 text-blue-500">
                                      オプション
                                    </span>
                                  )}
                                </div>
                                {item.specification && (
                                  <div className="text-xs text-gray-500">
                                    {item.specification}
                                  </div>
                                )}
                              </div>
                              <div className="text-right text-sm">
                                <div className="font-medium">
                                  ¥{item.unitPrice.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {item.defaultQuantity}
                                  {item.unit}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 備考 */}
                  {(selectedTemplate.notes || selectedTemplate.terms) && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      {selectedTemplate.notes && (
                        <div className="mb-2">
                          <div className="text-sm font-medium text-gray-700">
                            備考
                          </div>
                          <div className="text-sm text-gray-600">
                            {selectedTemplate.notes}
                          </div>
                        </div>
                      )}
                      {selectedTemplate.terms && (
                        <div>
                          <div className="text-sm font-medium text-gray-700">
                            条件
                          </div>
                          <div className="text-sm text-gray-600">
                            {selectedTemplate.terms}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 適用オプション */}
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-4">
                    適用オプション
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={applyOptions.includeOptionalItems}
                        onChange={(e) =>
                          setApplyOptions((prev) => ({
                            ...prev,
                            includeOptionalItems: e.target.checked,
                          }))
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        オプション項目を含める
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={applyOptions.overridePrices}
                        onChange={(e) =>
                          setApplyOptions((prev) => ({
                            ...prev,
                            overridePrices: e.target.checked,
                          }))
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        単価を上書きする
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={applyOptions.keepExistingItems}
                        onChange={(e) =>
                          setApplyOptions((prev) => ({
                            ...prev,
                            keepExistingItems: e.target.checked,
                          }))
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        既存項目を保持する
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={applyOptions.applyFormulas}
                        onChange={(e) =>
                          setApplyOptions((prev) => ({
                            ...prev,
                            applyFormulas: e.target.checked,
                          }))
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        計算式を適用する
                      </span>
                    </label>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      価格調整率
                    </label>
                    <input
                      type="number"
                      value={applyOptions.adjustmentRate}
                      onChange={(e) =>
                        setApplyOptions((prev) => ({
                          ...prev,
                          adjustmentRate: parseFloat(e.target.value) || 1.0,
                        }))
                      }
                      step="0.1"
                      min="0.1"
                      max="2.0"
                      className="w-32 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-500">
                      （1.0 = 100%）
                    </span>
                  </div>
                </div>

                {/* アクションボタン */}
                <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    キャンセル
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={handleApplyAndContinue}
                      disabled={selectedSections.size === 0}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      追加して続ける ({selectedSections.size}件)
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleApplyAndClose}
                      disabled={selectedSections.size === 0}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      適用して閉じる ({selectedSections.size}件)
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>テンプレートを選択してください</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
