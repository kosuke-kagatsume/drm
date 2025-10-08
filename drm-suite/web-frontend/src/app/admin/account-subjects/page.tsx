'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronRight, ChevronDown, Save, X } from 'lucide-react';

interface AccountSubject {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  level: 1 | 2 | 3;
  parentCode?: string;
  accountingCode?: string;
  category: 'material' | 'labor' | 'outsourcing' | 'expense';
  description?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

const categoryLabels = {
  material: '材料費',
  labor: '労務費',
  outsourcing: '外注費',
  expense: '経費',
};

const categoryColors = {
  material: 'bg-blue-100 text-blue-800',
  labor: 'bg-green-100 text-green-800',
  outsourcing: 'bg-purple-100 text-purple-800',
  expense: 'bg-orange-100 text-orange-800',
};

export default function AccountSubjectsPage() {
  const [subjects, setSubjects] = useState<AccountSubject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<AccountSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCodes, setExpandedCodes] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<AccountSubject>>({
    level: 1,
    isActive: true,
    displayOrder: 0,
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    filterSubjects();
  }, [subjects, selectedCategory, showActiveOnly]);

  const fetchSubjects = async () => {
    try {
      const params = new URLSearchParams();
      if (showActiveOnly) params.append('activeOnly', 'true');

      const response = await fetch(`/api/admin/account-subjects?${params}`);
      const data = await response.json();

      if (data.success) {
        setSubjects(data.subjects);
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSubjects = () => {
    let filtered = subjects;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    if (showActiveOnly) {
      filtered = filtered.filter(s => s.isActive);
    }

    setFilteredSubjects(filtered);
  };

  const toggleExpand = (code: string) => {
    const newExpanded = new Set(expandedCodes);
    if (newExpanded.has(code)) {
      newExpanded.delete(code);
    } else {
      newExpanded.add(code);
    }
    setExpandedCodes(newExpanded);
  };

  const expandAll = () => {
    const allLevel1And2 = subjects
      .filter(s => s.level === 1 || s.level === 2)
      .map(s => s.code);
    setExpandedCodes(new Set(allLevel1And2));
  };

  const collapseAll = () => {
    setExpandedCodes(new Set());
  };

  const handleSave = async () => {
    try {
      const url = editingId
        ? `/api/admin/account-subjects`
        : `/api/admin/account-subjects`;

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { ...formData, id: editingId } : formData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchSubjects();
        setEditingId(null);
        setShowAddForm(false);
        setFormData({ level: 1, isActive: true, displayOrder: 0 });
      } else {
        alert(data.error || '保存に失敗しました');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      alert('保存に失敗しました');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この勘定科目を削除しますか？')) return;

    try {
      const response = await fetch(`/api/admin/account-subjects?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchSubjects();
      } else {
        alert(data.error || '削除に失敗しました');
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('削除に失敗しました');
    }
  };

  const startEdit = (subject: AccountSubject) => {
    setEditingId(subject.id);
    setFormData(subject);
    setShowAddForm(false);
  };

  const startAdd = (parentCode?: string, level: 1 | 2 | 3 = 1) => {
    setShowAddForm(true);
    setEditingId(null);
    setFormData({
      level,
      parentCode,
      isActive: true,
      displayOrder: 0,
      category: parentCode
        ? subjects.find(s => s.code === parentCode)?.category
        : 'material',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({ level: 1, isActive: true, displayOrder: 0 });
  };

  const renderSubjectRow = (subject: AccountSubject, depth: number = 0) => {
    const hasChildren = subjects.some(s => s.parentCode === subject.code);
    const isExpanded = expandedCodes.has(subject.code);
    const isEditing = editingId === subject.id;

    const children = subjects.filter(s => s.parentCode === subject.code);

    return (
      <React.Fragment key={subject.id}>
        <tr className={`border-b hover:bg-gray-50 ${!subject.isActive ? 'opacity-50' : ''}`}>
          <td className="px-4 py-3" style={{ paddingLeft: `${depth * 24 + 16}px` }}>
            <div className="flex items-center gap-2">
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(subject.code)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              ) : (
                <span className="w-6" />
              )}
              {isEditing ? (
                <input
                  type="text"
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="border rounded px-2 py-1 w-32"
                  placeholder="コード"
                />
              ) : (
                <span className="font-mono text-sm">{subject.code}</span>
              )}
            </div>
          </td>
          <td className="px-4 py-3">
            {isEditing ? (
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border rounded px-2 py-1 w-full"
                placeholder="勘定科目名"
              />
            ) : (
              <span className={`font-medium ${subject.level === 1 ? 'text-lg' : subject.level === 2 ? 'text-base' : 'text-sm'}`}>
                {subject.name}
              </span>
            )}
          </td>
          <td className="px-4 py-3">
            <span className={`px-2 py-1 rounded text-xs ${categoryColors[subject.category]}`}>
              {categoryLabels[subject.category]}
            </span>
          </td>
          <td className="px-4 py-3 text-sm text-gray-600">
            {isEditing ? (
              <input
                type="text"
                value={formData.accountingCode || ''}
                onChange={(e) => setFormData({ ...formData, accountingCode: e.target.value })}
                className="border rounded px-2 py-1 w-full"
                placeholder="会計コード"
              />
            ) : (
              subject.accountingCode || '-'
            )}
          </td>
          <td className="px-4 py-3 text-center">
            {isEditing ? (
              <input
                type="checkbox"
                checked={formData.isActive ?? true}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
            ) : (
              <span className={`px-2 py-1 rounded text-xs ${subject.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {subject.isActive ? '有効' : '無効'}
              </span>
            )}
          </td>
          <td className="px-4 py-3 text-right">
            {isEditing ? (
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={handleSave}
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                >
                  <Save className="h-4 w-4" />
                </button>
                <button
                  onClick={cancelEdit}
                  className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => startEdit(subject)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                {subject.level < 3 && (
                  <button
                    onClick={() => startAdd(subject.code, (subject.level + 1) as 2 | 3)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                    title="子項目追加"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(subject.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </td>
        </tr>
        {isExpanded && children.map(child => renderSubjectRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  const renderAddForm = () => {
    if (!showAddForm) return null;

    return (
      <tr className="bg-blue-50 border-b">
        <td className="px-4 py-3">
          <input
            type="text"
            value={formData.code || ''}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="border rounded px-2 py-1 w-32"
            placeholder="コード"
          />
        </td>
        <td className="px-4 py-3">
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border rounded px-2 py-1 w-full"
            placeholder="勘定科目名"
          />
        </td>
        <td className="px-4 py-3">
          <select
            value={formData.category || 'material'}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="material">材料費</option>
            <option value="labor">労務費</option>
            <option value="outsourcing">外注費</option>
            <option value="expense">経費</option>
          </select>
        </td>
        <td className="px-4 py-3">
          <input
            type="text"
            value={formData.accountingCode || ''}
            onChange={(e) => setFormData({ ...formData, accountingCode: e.target.value })}
            className="border rounded px-2 py-1 w-full"
            placeholder="会計コード"
          />
        </td>
        <td className="px-4 py-3 text-center">
          <input
            type="checkbox"
            checked={formData.isActive ?? true}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4"
          />
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              保存
            </button>
            <button
              onClick={cancelEdit}
              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
            >
              キャンセル
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const level1Subjects = filteredSubjects.filter(s => s.level === 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex items-center justify-center">
          <div className="text-gray-600">読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">勘定科目マスタ</h1>
          <p className="text-gray-600">原価を会計ソフトに連携するための勘定科目を管理します</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="all">すべてのカテゴリ</option>
                <option value="material">材料費</option>
                <option value="labor">労務費</option>
                <option value="outsourcing">外注費</option>
                <option value="expense">経費</option>
              </select>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showActiveOnly}
                  onChange={(e) => setShowActiveOnly(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">有効のみ表示</span>
              </label>

              <button
                onClick={expandAll}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                すべて展開
              </button>
              <button
                onClick={collapseAll}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                すべて折りたたむ
              </button>
            </div>

            <button
              onClick={() => startAdd()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              大分類を追加
            </button>
          </div>

          <div className="text-sm text-gray-600">
            全{subjects.length}件 （表示: {filteredSubjects.length}件）
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">コード</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">勘定科目名</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">カテゴリ</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">会計コード</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">状態</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody>
                {showAddForm && renderAddForm()}
                {level1Subjects.map(subject => renderSubjectRow(subject, 0))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-3">階層構造について</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• <strong>大分類（レベル1）</strong>: 材料費、労務費、外注費、経費の主要カテゴリ</p>
            <p>• <strong>中分類（レベル2）</strong>: 各大分類の下位分類（例: 主要材料費、補助材料費）</p>
            <p>• <strong>小分類（レベル3）</strong>: 具体的な勘定科目（例: 木材、鋼材、コンクリート）</p>
            <p className="mt-3">• <strong>会計コード</strong>: 会計ソフトへの連携用コード（オプション）</p>
          </div>
        </div>
      </div>
    </div>
  );
}
