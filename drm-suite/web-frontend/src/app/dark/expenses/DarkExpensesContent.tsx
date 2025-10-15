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
      setError('DATA RETRIEVAL FAILED');
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
      setError('EXPENSE DATA RETRIEVAL FAILED');
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
      alert('EXPENSE ADDITION FAILED');
      console.error(err);
    }
  };

  const handleSubmitExpense = async (expense: Expense) => {
    try {
      await expenseService.submitExpense(expense.id);
      await fetchExpenses();
    } catch (err) {
      alert('EXPENSE SUBMISSION FAILED');
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
      alert('APPROVAL PROCESS FAILED');
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: {
        label: 'DRAFT',
        color: 'text-zinc-500 border-zinc-600',
        indicator: '01',
      },
      submitted: {
        label: 'SUBMITTED',
        color: 'text-blue-500 border-blue-500/50',
        indicator: '02',
      },
      approved: {
        label: 'APPROVED',
        color: 'text-emerald-500 border-emerald-500/50',
        indicator: '03',
      },
      rejected: {
        label: 'REJECTED',
        color: 'text-red-500 border-red-500/50',
        indicator: '04',
      },
      paid: {
        label: 'PAID',
        color: 'text-purple-500 border-purple-500/50',
        indicator: '05',
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status.toUpperCase(),
      color: 'text-zinc-500 border-zinc-600',
      indicator: '00',
    };

    return (
      <span
        className={`px-3 py-1 border text-xs tracking-wider ${config.color} flex items-center gap-2 inline-flex`}
      >
        <span>{config.indicator}</span>
        <span>{config.label}</span>
      </span>
    );
  };

  if (isLoading || !user || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-500 mx-auto"></div>
          <p className="mt-4 text-zinc-500 text-xs tracking-wider">
            LOADING...
          </p>
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
    <div className="min-h-screen bg-black">
      <nav className="bg-zinc-950 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dark/dashboard')}
              className="text-zinc-500 hover:text-white transition-colors text-xs tracking-wider"
            >
              ← DASHBOARD
            </button>
            <div className="w-px h-6 bg-zinc-800"></div>
            <h1 className="text-2xl font-thin text-white tracking-widest">
              EXPENSE MANAGEMENT
            </h1>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xs text-zinc-500 tracking-wider mb-2">
                  TOTAL EXPENSES
                </h3>
                <p className="text-3xl font-thin text-white">
                  ¥{totalAmount.toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                01
              </div>
            </div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xs text-zinc-500 tracking-wider mb-2">
                  APPROVED
                </h3>
                <p className="text-3xl font-thin text-emerald-500">
                  ¥{approvedAmount.toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                02
              </div>
            </div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xs text-zinc-500 tracking-wider mb-2">
                  PENDING
                </h3>
                <p className="text-3xl font-thin text-blue-500">
                  ¥{pendingAmount.toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                03
              </div>
            </div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xs text-zinc-500 tracking-wider mb-2">
                  EXPENSE COUNT
                </h3>
                <p className="text-3xl font-thin text-white">
                  {expenses.length}
                </p>
              </div>
              <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                04
              </div>
            </div>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-zinc-950 border border-zinc-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-thin text-white tracking-widest">
              EXPENSE LIST
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-black px-6 py-3 text-xs tracking-wider hover:bg-zinc-200 transition-colors"
            >
              + NEW EXPENSE
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-900 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-zinc-500 tracking-widest">
                    TITLE
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-zinc-500 tracking-widest">
                    CATEGORY
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-zinc-500 tracking-widest">
                    AMOUNT
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-zinc-500 tracking-widest">
                    EXPENSE DATE
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-zinc-500 tracking-widest">
                    STATUS
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-zinc-500 tracking-widest">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-light text-white tracking-wider">
                          {expense.title}
                        </div>
                        {expense.description && (
                          <div className="text-xs text-zinc-500 tracking-wider">
                            {expense.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-white tracking-wider">
                      {expense.category?.name}
                    </td>
                    <td className="px-4 py-4 text-sm font-light text-white">
                      ¥{Number(expense.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-xs text-zinc-500 tracking-wider">
                      {new Date(expense.expenseDate).toLocaleDateString(
                        'ja-JP',
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {getStatusBadge(expense.status)}
                    </td>
                    <td className="px-4 py-4 text-xs space-x-3">
                      {expense.status === 'draft' && (
                        <button
                          onClick={() => handleSubmitExpense(expense)}
                          className="text-blue-500 hover:text-blue-400 transition-colors tracking-wider"
                        >
                          SUBMIT
                        </button>
                      )}
                      {expense.status === 'submitted' &&
                        user?.role === 'manager' && (
                          <button
                            onClick={() => {
                              setSelectedExpense(expense);
                              setShowApprovalModal(true);
                            }}
                            className="text-emerald-500 hover:text-emerald-400 transition-colors tracking-wider"
                          >
                            APPROVE
                          </button>
                        )}
                      <button
                        onClick={() =>
                          router.push(`/dark/expenses/${expense.id}`)
                        }
                        className="text-zinc-500 hover:text-white transition-colors tracking-wider"
                      >
                        DETAILS
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
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md">
            <div className="p-6 border-b border-zinc-800">
              <h3 className="text-sm font-normal text-white tracking-widest">
                NEW EXPENSE APPLICATION
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                    TITLE
                  </label>
                  <input
                    type="text"
                    value={newExpense.title}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, title: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    placeholder="Enter expense title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                    CATEGORY
                  </label>
                  <select
                    value={newExpense.categoryId}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        categoryId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    required
                  >
                    <option value="">SELECT CATEGORY</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                      AMOUNT
                    </label>
                    <input
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) =>
                        setNewExpense({ ...newExpense, amount: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                      min="0"
                      step="1"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                      EXPENSE DATE
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
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                    DESCRIPTION
                  </label>
                  <textarea
                    value={newExpense.description}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    rows={3}
                    placeholder="Enter expense description"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-zinc-800">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 text-zinc-500 hover:text-white transition-colors text-xs tracking-wider"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleAddExpense}
                  className="px-8 py-3 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors"
                >
                  SUBMIT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md">
            <div className="p-6 border-b border-zinc-800">
              <h3 className="text-sm font-normal text-white tracking-widest">
                EXPENSE APPROVAL - {selectedExpense.title}
              </h3>
            </div>

            <div className="p-6">
              <div className="mb-6 p-4 bg-zinc-900 border border-zinc-800">
                <p className="text-xs text-zinc-500 tracking-wider mb-2">
                  AMOUNT: ¥{Number(selectedExpense.amount).toLocaleString()}
                </p>
                <p className="text-xs text-zinc-500 tracking-wider mb-2">
                  CATEGORY: {selectedExpense.category?.name}
                </p>
                <p className="text-xs text-zinc-500 tracking-wider">
                  APPLICANT: {selectedExpense.user?.name}
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                    ACTION
                  </label>
                  <select
                    value={approvalAction}
                    onChange={(e) =>
                      setApprovalAction(
                        e.target.value as 'approve' | 'reject' | 'request_info',
                      )
                    }
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                  >
                    <option value="approve">APPROVE</option>
                    <option value="reject">REJECT</option>
                    <option value="request_info">REQUEST INFO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                    COMMENT
                  </label>
                  <textarea
                    value={approvalComment}
                    onChange={(e) => setApprovalComment(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    rows={3}
                    placeholder="Enter approval reason or comment..."
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-zinc-800">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setSelectedExpense(null);
                    setApprovalComment('');
                  }}
                  className="px-6 py-3 text-zinc-500 hover:text-white transition-colors text-xs tracking-wider"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleApproval}
                  className={`px-8 py-3 text-xs tracking-wider transition-colors ${
                    approvalAction === 'approve'
                      ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                      : approvalAction === 'reject'
                        ? 'bg-red-500 text-white hover:bg-red-400'
                        : 'bg-blue-500 text-white hover:bg-blue-400'
                  }`}
                >
                  {approvalAction === 'approve'
                    ? 'APPROVE'
                    : approvalAction === 'reject'
                      ? 'REJECT'
                      : 'REQUEST INFO'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
