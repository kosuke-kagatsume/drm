'use client';

import React, { memo, useState } from 'react';
import { X, Check, FileText } from 'lucide-react';
import { TEMPLATE_CATEGORIES, BRANCHES } from '../constants';

// ==================== TemplateSaveModal コンポーネント ====================

interface TemplateSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    description: string;
    category: string;
    scope: 'personal' | 'branch' | 'company';
    branch?: string;
  }) => void;
}

const TemplateSaveModal = memo(function TemplateSaveModal({
  isOpen,
  onClose,
  onSave,
}: TemplateSaveModalProps) {
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState(
    TEMPLATE_CATEGORIES[0],
  );
  const [templateScope, setTemplateScope] = useState<
    'personal' | 'branch' | 'company'
  >('personal');
  const [templateBranch, setTemplateBranch] = useState(BRANCHES[0]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!templateName.trim()) {
      alert('テンプレート名を入力してください');
      return;
    }

    onSave({
      name: templateName.trim(),
      description: templateDescription.trim(),
      category: templateCategory,
      scope: templateScope,
      branch: templateScope === 'branch' ? templateBranch : undefined,
    });

    // リセット
    setTemplateName('');
    setTemplateDescription('');
    setTemplateCategory(TEMPLATE_CATEGORIES[0]);
    setTemplateScope('personal');
    setTemplateBranch(BRANCHES[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            テンプレートとして保存
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* フォーム */}
        <div className="space-y-4">
          {/* テンプレート名 */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              テンプレート名<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="例: 標準的な新築見積"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 説明 */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              説明（任意）
            </label>
            <textarea
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="このテンプレートの用途や特徴を記入..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* カテゴリ */}
          <div>
            <label className="block text-sm font-semibold mb-1">カテゴリ</label>
            <select
              value={templateCategory}
              onChange={(e) => setTemplateCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TEMPLATE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* 公開範囲 */}
          <div>
            <label className="block text-sm font-semibold mb-1">公開範囲</label>
            <select
              value={templateScope}
              onChange={(e) =>
                setTemplateScope(
                  e.target.value as 'personal' | 'branch' | 'company',
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="personal">個人用（自分だけ）</option>
              <option value="branch">支店用（支店メンバー共有）</option>
              <option value="company">全社用（全員が使用可能）</option>
            </select>
          </div>

          {/* 支店選択（支店用の場合のみ表示） */}
          {templateScope === 'branch' && (
            <div>
              <label className="block text-sm font-semibold mb-1">支店</label>
              <select
                value={templateBranch}
                onChange={(e) => setTemplateBranch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {BRANCHES.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex gap-3 mt-6 pt-6 border-t">
          <button
            onClick={handleSave}
            disabled={!templateName.trim()}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            テンプレートを保存
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
});

export default TemplateSaveModal;
