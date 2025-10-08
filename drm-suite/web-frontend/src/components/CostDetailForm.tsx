'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import AccountSubjectSelector from './AccountSubjectSelector';

interface CostDetailFormData {
  date: string;
  accountSubject?: {
    id: string;
    code: string;
    name: string;
    category: 'material' | 'labor' | 'outsourcing' | 'expense';
  };
  amount: number;
  taxRate: number;
  supplier?: string;
  invoiceNo?: string;
  description?: string;
  paymentStatus: 'unpaid' | 'paid' | 'partial';
  paymentDate?: string;
}

interface Props {
  ledgerId: string;
  initialData?: any;
  onSave: () => void;
  onCancel: () => void;
}

export default function CostDetailForm({ ledgerId, initialData, onSave, onCancel }: Props) {
  const [formData, setFormData] = useState<CostDetailFormData>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    taxRate: 10,
    paymentStatus: 'unpaid',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date || new Date().toISOString().split('T')[0],
        accountSubject: initialData.accountSubjectId
          ? {
              id: initialData.accountSubjectId,
              code: initialData.accountSubjectCode,
              name: initialData.accountSubjectName,
              category: initialData.category,
            }
          : undefined,
        amount: initialData.amount || 0,
        taxRate: initialData.taxRate || 10,
        supplier: initialData.supplier,
        invoiceNo: initialData.invoiceNo,
        description: initialData.description,
        paymentStatus: initialData.paymentStatus || 'unpaid',
        paymentDate: initialData.paymentDate,
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.date) {
      newErrors.date = '日付は必須です';
    }

    if (!formData.accountSubject) {
      newErrors.accountSubject = '勘定科目は必須です';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = '金額は1円以上で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (!formData.accountSubject) {
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...(initialData?.id && { id: initialData.id }),
        ledgerId,
        date: formData.date,
        accountSubjectId: formData.accountSubject.id,
        accountSubjectCode: formData.accountSubject.code,
        accountSubjectName: formData.accountSubject.name,
        category: formData.accountSubject.category,
        amount: formData.amount,
        taxRate: formData.taxRate,
        supplier: formData.supplier,
        invoiceNo: formData.invoiceNo,
        description: formData.description,
        paymentStatus: formData.paymentStatus,
        paymentDate: formData.paymentDate,
      };

      const method = initialData?.id ? 'PUT' : 'POST';
      const response = await fetch('/api/cost-details', {
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
      console.error('Error saving cost detail:', error);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const taxAmount = formData.amount * (formData.taxRate / 100);
  const totalAmount = formData.amount + taxAmount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {initialData?.id ? '原価明細編集' : '原価明細追加'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
            disabled={saving}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 日付 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              日付 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2 ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={saving}
            />
            {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date}</p>}
          </div>

          {/* 勘定科目 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              勘定科目 <span className="text-red-500">*</span>
            </label>
            <AccountSubjectSelector
              value={formData.accountSubject}
              onChange={(subject) => setFormData({ ...formData, accountSubject: subject })}
            />
            {errors.accountSubject && (
              <p className="text-sm text-red-500 mt-1">{errors.accountSubject}</p>
            )}
          </div>

          {/* 金額 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                金額（税抜） <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">¥</span>
                <input
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                  }
                  className={`w-full border rounded-lg pl-8 pr-3 py-2 ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  disabled={saving}
                />
              </div>
              {errors.amount && <p className="text-sm text-red-500 mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">税率（%）</label>
              <select
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                disabled={saving}
              >
                <option value={0}>0% (非課税)</option>
                <option value={8}>8% (軽減税率)</option>
                <option value={10}>10% (標準税率)</option>
              </select>
            </div>
          </div>

          {/* 税額・合計 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-600 mb-1">税抜金額</div>
                <div className="font-semibold text-gray-900">
                  ¥{formData.amount.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">消費税</div>
                <div className="font-semibold text-gray-900">¥{Math.floor(taxAmount).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">税込合計</div>
                <div className="font-bold text-blue-600 text-lg">
                  ¥{Math.floor(totalAmount).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* 仕入先 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">仕入先</label>
            <input
              type="text"
              value={formData.supplier || ''}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="例: ○○木材株式会社"
              disabled={saving}
            />
          </div>

          {/* 請求書番号 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">請求書番号</label>
            <input
              type="text"
              value={formData.invoiceNo || ''}
              onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="例: INV-2024-001"
              disabled={saving}
            />
          </div>

          {/* 摘要 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">摘要</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={3}
              placeholder="詳細説明"
              disabled={saving}
            />
          </div>

          {/* 支払状況 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">支払状況</label>
              <select
                value={formData.paymentStatus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentStatus: e.target.value as 'unpaid' | 'paid' | 'partial',
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                disabled={saving}
              >
                <option value="unpaid">未払い</option>
                <option value="partial">一部支払</option>
                <option value="paid">支払済</option>
              </select>
            </div>

            {formData.paymentStatus !== 'unpaid' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">支払日</label>
                <input
                  type="date"
                  value={formData.paymentDate || ''}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  disabled={saving}
                />
              </div>
            )}
          </div>

          {/* ボタン */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
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
              {saving ? '保存中...' : initialData?.id ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
