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

    // カテゴリフィルタ
    if (selectedCategory !== 'all') {
      result = getTemplatesByCategory(selectedCategory);
    }

    // 検索フィルタ
    if (searchQuery) {
      result = searchTemplates(searchQuery);
    }

    return result;
  }, [selectedCategory, searchQuery]);

  // 人気テンプレート
  const popularTemplates = useMemo(() => getPopularTemplates(3), []);

  const handleApply = () => {
    if (selectedTemplate) {
      onApply(selectedTemplate, applyOptions);
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
                      onClick={() => setSelectedTemplate(template)}
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
                  onClick={() => setSelectedTemplate(template)}
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

                  {/* セクション一覧 */}
                  <div className="space-y-4">
                    {selectedTemplate.sections.map((section) => (
                      <div
                        key={section.id}
                        className="border border-gray-200 rounded-lg"
                      >
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                          <h4 className="font-medium text-gray-900">
                            {section.name}
                          </h4>
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
                <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleApply}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    テンプレートを適用
                    <ChevronRight className="w-4 h-4" />
                  </button>
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
