'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FileText, Download, Upload } from 'lucide-react';
import CostDetailForm from '@/components/CostDetailForm';

interface CostDetail {
  id: string;
  date: string;
  accountSubjectId: string;
  accountSubjectCode: string;
  accountSubjectName: string;
  category: 'material' | 'labor' | 'outsourcing' | 'expense';
  amount: number;
  taxRate?: number;
  taxAmount?: number;
  totalAmount?: number;
  supplier?: string;
  invoiceNo?: string;
  description?: string;
  paymentStatus?: 'unpaid' | 'paid' | 'partial';
  paymentDate?: string;
}

interface CostDetailsSummary {
  material: number;
  labor: number;
  outsourcing: number;
  expense: number;
  total: number;
}

interface Props {
  ledgerId: string;
}

const categoryLabels = {
  material: '材料費',
  labor: '労務費',
  outsourcing: '外注費',
  expense: '経費',
};

const categoryColors = {
  material: 'from-blue-500 to-cyan-500',
  labor: 'from-green-500 to-emerald-500',
  outsourcing: 'from-purple-500 to-pink-500',
  expense: 'from-orange-500 to-red-500',
};

const paymentStatusLabels = {
  unpaid: '未払い',
  paid: '支払済',
  partial: '一部支払',
};

const paymentStatusColors = {
  unpaid: 'bg-red-100 text-red-800',
  paid: 'bg-green-100 text-green-800',
  partial: 'bg-yellow-100 text-yellow-800',
};

export default function CostDetailsTab({ ledgerId }: Props) {
  const [costDetails, setCostDetails] = useState<CostDetail[]>([]);
  const [summary, setSummary] = useState<CostDetailsSummary>({
    material: 0,
    labor: 0,
    outsourcing: 0,
    expense: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingDetail, setEditingDetail] = useState<CostDetail | null>(null);

  useEffect(() => {
    fetchCostDetails();
  }, [ledgerId, selectedCategory]);

  const fetchCostDetails = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ ledgerId });
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/cost-details?${params}`);
      const data = await response.json();

      if (data.success) {
        setCostDetails(data.details || []);
        setSummary(data.summary || { material: 0, labor: 0, outsourcing: 0, expense: 0, total: 0 });
      }
    } catch (error) {
      console.error('Error fetching cost details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この原価明細を削除しますか？')) return;

    try {
      const response = await fetch(`/api/cost-details?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchCostDetails();
      } else {
        alert(data.error || '削除に失敗しました');
      }
    } catch (error) {
      console.error('Error deleting cost detail:', error);
      alert('削除に失敗しました');
    }
  };

  const handleAdd = () => {
    setEditingDetail(null);
    setShowFormModal(true);
  };

  const handleEdit = (detail: CostDetail) => {
    setEditingDetail(detail);
    setShowFormModal(true);
  };

  const handleFormSave = async () => {
    setShowFormModal(false);
    setEditingDetail(null);
    await fetchCostDetails();
  };

  const handleFormCancel = () => {
    setShowFormModal(false);
    setEditingDetail(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* カテゴリ別サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">材料費</div>
          <div className="text-xl font-bold text-blue-600">
            ¥{summary.material.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">労務費</div>
          <div className="text-xl font-bold text-green-600">
            ¥{summary.labor.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">外注費</div>
          <div className="text-xl font-bold text-purple-600">
            ¥{summary.outsourcing.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">経費</div>
          <div className="text-xl font-bold text-orange-600">
            ¥{summary.expense.toLocaleString()}
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-700 to-gray-900 text-white rounded-lg shadow p-4">
          <div className="text-sm opacity-90 mb-1">合計</div>
          <div className="text-xl font-bold">¥{summary.total.toLocaleString()}</div>
        </div>
      </div>

      {/* コントロールバー */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">すべてのカテゴリ</option>
              <option value="material">材料費</option>
              <option value="labor">労務費</option>
              <option value="outsourcing">外注費</option>
              <option value="expense">経費</option>
            </select>
            <div className="text-sm text-gray-600">
              {costDetails.length}件の明細
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('CSV一括インポート機能は準備中です')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">一括インポート</span>
            </button>
            <button
              onClick={() => alert('CSV出力機能は準備中です')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">CSV出力</span>
            </button>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="h-4 w-4" />
              <span>明細追加</span>
            </button>
          </div>
        </div>
      </div>

      {/* 原価明細一覧テーブル */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日付
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  勘定科目
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  摘要
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  仕入先
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金額
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  支払状況
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {costDetails.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p>原価明細がまだ登録されていません</p>
                    <button
                      onClick={handleAdd}
                      className="mt-4 text-blue-600 hover:text-blue-800"
                    >
                      最初の明細を追加する
                    </button>
                  </td>
                </tr>
              ) : (
                costDetails.map((detail) => (
                  <tr key={detail.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {detail.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {detail.accountSubjectName}
                      </div>
                      <div className="text-xs text-gray-500">{detail.accountSubjectCode}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate">
                        {detail.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {detail.supplier || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ¥{(detail.totalAmount || detail.amount).toLocaleString()}
                      </div>
                      {detail.taxAmount && detail.taxAmount > 0 && (
                        <div className="text-xs text-gray-500">
                          (税抜: ¥{detail.amount.toLocaleString()})
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {detail.paymentStatus && (
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${paymentStatusColors[detail.paymentStatus]}`}
                        >
                          {paymentStatusLabels[detail.paymentStatus]}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(detail)}
                          className="text-blue-600 hover:text-blue-900"
                          title="編集"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(detail.id)}
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

      {/* 原価明細入力フォーム */}
      {showFormModal && (
        <CostDetailForm
          ledgerId={ledgerId}
          initialData={editingDetail}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}
