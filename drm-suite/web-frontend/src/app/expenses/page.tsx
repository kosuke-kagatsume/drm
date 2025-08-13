'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  expenseService,
  type Expense,
  type ExpenseCategory,
  type CreateExpenseDto,
} from '@/services/expense.service';

export default function ExpensesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [filter, setFilter] = useState({
    companyId: 'default-company',
    userId: user?.id || '',
    limit: 20,
    offset: 0,
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [approvalAction, setApprovalAction] = useState<
    'approve' | 'reject' | 'request_info'
  >('approve');
  const [approvalComment, setApprovalComment] = useState('');

  const [newExpense, setNewExpense] = useState({
    title: '',
    description: '',
    categoryId: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    projectId: '',
  });

  useEffect(() => {
    if (user?.id) {
      setFilter((prev) => ({ ...prev, userId: user.id }));
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    fetchExpenses();
  }, [filter]);

  const fetchData = async () => {
    try {
      const [expensesResponse, categoriesResponse] = await Promise.all([
        expenseService.getExpenses(filter),
        expenseService.getExpenseCategories(filter.companyId),
      ]);

      setExpenses(expensesResponse.items);
      setTotalExpenses(expensesResponse.total);
      setCategories(categoriesResponse);
    } catch (err) {
      setError('データの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await expenseService.getExpenses(filter);
      setExpenses(response.items);
      setTotalExpenses(response.total);
    } catch (err) {
      setError('経費データの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!user?.id) return;

    try {
      const createDto: CreateExpenseDto = {
        companyId: filter.companyId,
        userId: user.id,
        categoryId: newExpense.categoryId,
        title: newExpense.title,
        description: newExpense.description,
        amount: Number(newExpense.amount),
        expenseDate: newExpense.expenseDate,
        projectId: newExpense.projectId || undefined,
      };

      await expenseService.createExpense(createDto);
      await fetchExpenses();
      setShowAddModal(false);
      setNewExpense({
        title: '',
        description: '',
        categoryId: '',
        amount: '',
        expenseDate: new Date().toISOString().split('T')[0],
        projectId: '',
      });
    } catch (err) {
      alert('経費の追加に失敗しました');
      console.error(err);
    }
  };

  const handleSubmitExpense = async (expense: Expense) => {
    try {
      await expenseService.submitExpense(expense.id);
      await fetchExpenses();
    } catch (err) {
      alert('経費の申請に失敗しました');
      console.error(err);
    }
  };

  const handleApproval = async () => {
    if (!selectedExpense) return;

    try {
      await expenseService.approveExpense({
        expenseId: selectedExpense.id,
        action: approvalAction,
        comment: approvalComment || undefined,
      });
      await fetchExpenses();
      setShowApprovalModal(false);
      setSelectedExpense(null);
      setApprovalComment('');
    } catch (err) {
      alert('承認処理に失敗しました');
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: '下書き', class: 'bg-gray-100 text-gray-800' },
      submitted: { label: '申請中', class: 'bg-blue-100 text-blue-800' },
      approved: { label: '承認済み', class: 'bg-green-100 text-green-800' },
      rejected: { label: '却下', class: 'bg-red-100 text-red-800' },
      paid: { label: '支払済み', class: 'bg-purple-100 text-purple-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      class: 'bg-gray-100 text-gray-800',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}
      >
        {config.label}
      </span>
    );
  };

  if (isLoading || !user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  const totalAmount = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0,
  );
  const approvedAmount = expenses
    .filter(
      (expense) => expense.status === 'approved' || expense.status === 'paid',
    )
    .reduce((sum, expense) => sum + Number(expense.amount), 0);
  const pendingAmount = expenses
    .filter((expense) => expense.status === 'submitted')
    .reduce((sum, expense) => sum + Number(expense.amount), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← ダッシュボード
            </button>
            <h1 className="text-2xl font-bold text-gray-900">経費管理</h1>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">総経費額</h3>
            <p className="text-3xl font-bold text-gray-900">
              ¥{totalAmount.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">承認済み</h3>
            <p className="text-3xl font-bold text-green-600">
              ¥{approvedAmount.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">申請中</h3>
            <p className="text-3xl font-bold text-blue-600">
              ¥{pendingAmount.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">経費件数</h3>
            <p className="text-3xl font-bold text-gray-900">
              {expenses.length}
            </p>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">経費一覧</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              + 経費申請
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    タイトル
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    カテゴリ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    金額
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    申請日
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ステータス
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {expense.title}
                        </div>
                        {expense.description && (
                          <div className="text-sm text-gray-500">
                            {expense.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {expense.category?.name}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      ¥{Number(expense.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(expense.expenseDate).toLocaleDateString(
                        'ja-JP',
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {getStatusBadge(expense.status)}
                    </td>
                    <td className="px-4 py-4 text-sm space-x-2">
                      {expense.status === 'draft' && (
                        <button
                          onClick={() => handleSubmitExpense(expense)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          申請
                        </button>
                      )}
                      {expense.status === 'submitted' &&
                        user?.role === 'manager' && (
                          <button
                            onClick={() => {
                              setSelectedExpense(expense);
                              setShowApprovalModal(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            承認
                          </button>
                        )}
                      <button
                        onClick={() => router.push(`/expenses/${expense.id}`)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        詳細
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">経費申請</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  タイトル
                </label>
                <input
                  type="text"
                  value={newExpense.title}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  カテゴリ
                </label>
                <select
                  value={newExpense.categoryId}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, categoryId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">カテゴリを選択</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    金額
                  </label>
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, amount: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    利用日
                  </label>
                  <input
                    type="date"
                    value={newExpense.expenseDate}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        expenseDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  説明
                </label>
                <textarea
                  value={newExpense.description}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                キャンセル
              </button>
              <button
                onClick={handleAddExpense}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                申請
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              経費承認 - {selectedExpense.title}
            </h3>

            <div className="mb-4 p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">
                金額: ¥{Number(selectedExpense.amount).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                カテゴリ: {selectedExpense.category?.name}
              </p>
              <p className="text-sm text-gray-600">
                申請者: {selectedExpense.user?.name}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  アクション
                </label>
                <select
                  value={approvalAction}
                  onChange={(e) =>
                    setApprovalAction(
                      e.target.value as 'approve' | 'reject' | 'request_info',
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="approve">承認</option>
                  <option value="reject">却下</option>
                  <option value="request_info">追加情報要求</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  コメント
                </label>
                <textarea
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="承認理由やコメントを入力..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedExpense(null);
                  setApprovalComment('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                キャンセル
              </button>
              <button
                onClick={handleApproval}
                className={`px-4 py-2 text-white rounded ${
                  approvalAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : approvalAction === 'reject'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {approvalAction === 'approve'
                  ? '承認'
                  : approvalAction === 'reject'
                    ? '却下'
                    : '追加情報要求'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
