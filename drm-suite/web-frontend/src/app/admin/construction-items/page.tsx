'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Tag, DollarSign, Check, X } from 'lucide-react';

interface ConstructionItem {
  id: string;
  code: string;
  name: string;
  category: string;
  unitType: 'tsubo' | 'sqm' | 'meter' | 'unit' | 'fixed';
  unitPrice: number;
  accountSubjectId?: string;
  accountSubjectCode?: string;
  accountSubjectName?: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
}

interface AccountSubject {
  id: string;
  code: string;
  name: string;
  category: string;
}

const unitTypeLabels = {
  tsubo: '坪',
  sqm: '平米',
  meter: 'メーター',
  unit: '箇所',
  fixed: '定額',
};

const categoryColors: { [key: string]: string } = {
  躯体工事: 'bg-blue-100 text-blue-800',
  設備工事: 'bg-green-100 text-green-800',
  仕上工事: 'bg-purple-100 text-purple-800',
  外構工事: 'bg-yellow-100 text-yellow-800',
  その他: 'bg-gray-100 text-gray-800',
};

export default function ConstructionItemsPage() {
  const [items, setItems] = useState<ConstructionItem[]>([]);
  const [accountSubjects, setAccountSubjects] = useState<AccountSubject[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ConstructionItem | null>(null);

  useEffect(() => {
    fetchConstructionItems();
    fetchAccountSubjects();
  }, []);

  const fetchConstructionItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/construction-items');
      const data = await response.json();

      if (data.success) {
        setItems(data.items || []);
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching construction items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountSubjects = async () => {
    try {
      const response = await fetch('/api/admin/account-subjects?activeOnly=true');
      const data = await response.json();

      if (data.success) {
        // レベル3（小分類）のみ取得
        const level3Subjects = data.subjects.filter((s: AccountSubject) => s.level === 3);
        setAccountSubjects(level3Subjects);
      }
    } catch (error) {
      console.error('Error fetching account subjects:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この工事項目を削除しますか？')) return;

    try {
      const response = await fetch(`/api/admin/construction-items?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchConstructionItems();
      } else {
        alert(data.error || '削除に失敗しました');
      }
    } catch (error) {
      console.error('Error deleting construction item:', error);
      alert('削除に失敗しました');
    }
  };

  const handleToggleActive = async (item: ConstructionItem) => {
    try {
      const response = await fetch('/api/admin/construction-items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          isActive: !item.isActive,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchConstructionItems();
      } else {
        alert(data.error || '更新に失敗しました');
      }
    } catch (error) {
      console.error('Error toggling active status:', error);
      alert('更新に失敗しました');
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setShowFormModal(true);
  };

  const handleEdit = (item: ConstructionItem) => {
    setEditingItem(item);
    setShowFormModal(true);
  };

  // フィルタリング
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">工事項目マスタ管理</h1>
          <p className="text-gray-600">
            工事項目の単価と勘定科目の紐付けを管理します
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">総項目数</div>
            <div className="text-2xl font-bold text-gray-900">{items.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">有効項目</div>
            <div className="text-2xl font-bold text-green-600">
              {items.filter((i) => i.isActive).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">カテゴリ数</div>
            <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">平均単価</div>
            <div className="text-2xl font-bold text-purple-600">
              ¥
              {items.length > 0
                ? Math.round(
                    items.reduce((sum, i) => sum + i.unitPrice, 0) / items.length
                  ).toLocaleString()
                : 0}
            </div>
          </div>
        </div>

        {/* コントロールバー */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* 検索 */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="項目名・コード・説明で検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* カテゴリフィルタ */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">すべてのカテゴリ</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* 追加ボタン */}
            <button
              onClick={handleAdd}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="h-5 w-5" />
              <span>工事項目追加</span>
            </button>
          </div>

          <div className="mt-2 text-sm text-gray-600">
            {filteredItems.length}件の項目を表示中
          </div>
        </div>

        {/* テーブル */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    コード
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    工事項目名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    カテゴリ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    単位
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    単価
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    勘定科目
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <Tag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p>工事項目が見つかりませんでした</p>
                      <button
                        onClick={handleAdd}
                        className="mt-4 text-blue-600 hover:text-blue-800"
                      >
                        最初の工事項目を追加する
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition ${
                            item.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {item.isActive ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              有効
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3 mr-1" />
                              無効
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.code}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        {item.description && (
                          <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            categoryColors[item.category] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{unitTypeLabels[item.unitType]}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {item.unitType === 'fixed' && item.unitPrice === 0 ? (
                            <span className="text-gray-400">-</span>
                          ) : (
                            <>¥{item.unitPrice.toLocaleString()}</>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {item.accountSubjectName ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.accountSubjectName}
                            </div>
                            <div className="text-xs text-gray-500">{item.accountSubjectCode}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">未設定</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-900"
                            title="編集"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900"
                            title="削除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* フォームモーダル */}
        {showFormModal && (
          <ConstructionItemFormModal
            item={editingItem}
            accountSubjects={accountSubjects}
            categories={categories}
            onClose={() => {
              setShowFormModal(false);
              setEditingItem(null);
            }}
            onSave={() => {
              setShowFormModal(false);
              setEditingItem(null);
              fetchConstructionItems();
            }}
          />
        )}
      </div>
    </div>
  );
}

// フォームモーダルコンポーネント
interface FormModalProps {
  item: ConstructionItem | null;
  accountSubjects: AccountSubject[];
  categories: string[];
  onClose: () => void;
  onSave: () => void;
}

function ConstructionItemFormModal({
  item,
  accountSubjects,
  categories,
  onClose,
  onSave,
}: FormModalProps) {
  const [formData, setFormData] = useState({
    code: item?.code || '',
    name: item?.name || '',
    category: item?.category || '',
    newCategory: '',
    unitType: item?.unitType || 'tsubo',
    unitPrice: item?.unitPrice || 0,
    accountSubjectId: item?.accountSubjectId || '',
    description: item?.description || '',
    isActive: item?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [useNewCategory, setUseNewCategory] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name) {
      newErrors.name = '工事項目名は必須です';
    }

    if (!useNewCategory && !formData.category) {
      newErrors.category = 'カテゴリは必須です';
    }

    if (useNewCategory && !formData.newCategory) {
      newErrors.newCategory = '新しいカテゴリ名を入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);

      const selectedSubject = accountSubjects.find((s) => s.id === formData.accountSubjectId);
      const finalCategory = useNewCategory ? formData.newCategory : formData.category;

      const payload = {
        ...(item?.id && { id: item.id }),
        code: formData.code,
        name: formData.name,
        category: finalCategory,
        unitType: formData.unitType,
        unitPrice: formData.unitPrice,
        accountSubjectId: selectedSubject?.id,
        accountSubjectCode: selectedSubject?.code,
        accountSubjectName: selectedSubject?.name,
        description: formData.description,
        isActive: formData.isActive,
      };

      const method = item?.id ? 'PUT' : 'POST';
      const response = await fetch('/api/admin/construction-items', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        onSave();
      } else {
        alert(data.error || '保存に失敗しました');
      }
    } catch (error) {
      console.error('Error saving construction item:', error);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {item ? '工事項目編集' : '工事項目追加'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={saving}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* コード */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              工事項目コード
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="自動生成されます"
              disabled={saving}
            />
            <p className="text-xs text-gray-500 mt-1">
              空白の場合は自動生成されます
            </p>
          </div>

          {/* 工事項目名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              工事項目名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="例: 大工工事"
              disabled={saving}
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* カテゴリ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ <span className="text-red-500">*</span>
            </label>

            <div className="flex items-center gap-4 mb-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!useNewCategory}
                  onChange={() => setUseNewCategory(false)}
                  className="mr-2"
                />
                既存のカテゴリ
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={useNewCategory}
                  onChange={() => setUseNewCategory(true)}
                  className="mr-2"
                />
                新しいカテゴリ
              </label>
            </div>

            {!useNewCategory ? (
              <>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={saving}
                >
                  <option value="">選択してください</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={formData.newCategory}
                  onChange={(e) => setFormData({ ...formData, newCategory: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    errors.newCategory ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="例: 特殊工事"
                  disabled={saving}
                />
                {errors.newCategory && (
                  <p className="text-sm text-red-500 mt-1">{errors.newCategory}</p>
                )}
              </>
            )}
          </div>

          {/* 単位と単価 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                単位 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.unitType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unitType: e.target.value as ConstructionItem['unitType'],
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                disabled={saving}
              >
                <option value="tsubo">坪</option>
                <option value="sqm">平米</option>
                <option value="meter">メーター</option>
                <option value="unit">箇所</option>
                <option value="fixed">定額</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">単価</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">¥</span>
                <input
                  type="number"
                  value={formData.unitPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2"
                  placeholder="0"
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          {/* 勘定科目 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              デフォルト勘定科目
            </label>
            <select
              value={formData.accountSubjectId}
              onChange={(e) => setFormData({ ...formData, accountSubjectId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              disabled={saving}
            >
              <option value="">選択してください（任意）</option>
              {accountSubjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.code} - {subject.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              原価明細作成時のデフォルト勘定科目として使用されます
            </p>
          </div>

          {/* 説明 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">説明</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={3}
              placeholder="工事項目の詳細説明"
              disabled={saving}
            />
          </div>

          {/* 有効/無効 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={saving}
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              有効にする
            </label>
          </div>

          {/* ボタン */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              disabled={saving}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving}
            >
              {saving ? '保存中...' : item ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
