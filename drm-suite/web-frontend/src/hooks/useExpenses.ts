import { useState, useEffect } from 'react';
import axios from 'axios';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category:
    | 'materials'
    | 'labor'
    | 'equipment'
    | 'office'
    | 'marketing'
    | 'utilities'
    | 'other';
  date: string;
  receipt: boolean;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  projectId?: string;
  notes?: string;
  attachments?: string[];
}

interface ExpenseStats {
  totalExpenses: number;
  pendingApproval: number;
  approvedAmount: number;
  rejectedAmount: number;
  byCategory: Record<string, number>;
  monthlyTrend: Array<{ month: string; amount: number }>;
}

interface UseExpensesOptions {
  companyId?: string;
  storeId?: string;
  userId?: string;
  status?: string[];
  autoFetch?: boolean;
}

export function useExpenses(options: UseExpensesOptions = {}) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<ExpenseStats>({
    totalExpenses: 0,
    pendingApproval: 0,
    approvedAmount: 0,
    rejectedAmount: 0,
    byCategory: {},
    monthlyTrend: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Generate mock expenses based on estimates and projects
      const mockExpenses: Expense[] = [
        {
          id: 'EXP-001',
          description: '外壁塗装材料費',
          amount: 850000,
          category: 'materials',
          date: new Date('2024-08-10').toISOString(),
          receipt: true,
          status: 'approved',
          submittedBy: 'sales@test.com',
          projectId: 'EST-001',
          notes: 'シリコン塗料 150缶',
        },
        {
          id: 'EXP-002',
          description: '足場設置費用',
          amount: 120000,
          category: 'equipment',
          date: new Date('2024-08-12').toISOString(),
          receipt: true,
          status: 'approved',
          submittedBy: 'sales@test.com',
          projectId: 'EST-001',
        },
        {
          id: 'EXP-003',
          description: '作業員人件費',
          amount: 450000,
          category: 'labor',
          date: new Date('2024-08-15').toISOString(),
          receipt: false,
          status: 'pending',
          submittedBy: 'manager@test.com',
          projectId: 'EST-001',
        },
        {
          id: 'EXP-004',
          description: '事務用品購入',
          amount: 35000,
          category: 'office',
          date: new Date('2024-08-08').toISOString(),
          receipt: true,
          status: 'approved',
          submittedBy: 'accounting@test.com',
        },
        {
          id: 'EXP-005',
          description: 'Google広告費',
          amount: 150000,
          category: 'marketing',
          date: new Date('2024-08-01').toISOString(),
          receipt: true,
          status: 'approved',
          submittedBy: 'manager@test.com',
        },
        {
          id: 'EXP-006',
          description: '電気・水道料金',
          amount: 45000,
          category: 'utilities',
          date: new Date('2024-08-05').toISOString(),
          receipt: true,
          status: 'approved',
          submittedBy: 'accounting@test.com',
        },
        {
          id: 'EXP-007',
          description: '交通費精算',
          amount: 12500,
          category: 'other',
          date: new Date('2024-08-13').toISOString(),
          receipt: true,
          status: 'pending',
          submittedBy: 'sales@test.com',
          notes: '客先訪問交通費',
        },
      ];

      // Filter by status if specified
      let filteredExpenses = mockExpenses;
      if (options.status && options.status.length > 0) {
        filteredExpenses = mockExpenses.filter((exp) =>
          options.status!.includes(exp.status),
        );
      }

      // Filter by user if specified
      if (options.userId) {
        filteredExpenses = filteredExpenses.filter(
          (exp) => exp.submittedBy === options.userId,
        );
      }

      // Calculate statistics
      const totalExpenses = filteredExpenses.reduce(
        (sum, exp) => sum + exp.amount,
        0,
      );
      const pendingExpenses = filteredExpenses.filter(
        (exp) => exp.status === 'pending',
      );
      const pendingApproval = pendingExpenses.reduce(
        (sum, exp) => sum + exp.amount,
        0,
      );
      const approvedAmount = filteredExpenses
        .filter((exp) => exp.status === 'approved')
        .reduce((sum, exp) => sum + exp.amount, 0);
      const rejectedAmount = filteredExpenses
        .filter((exp) => exp.status === 'rejected')
        .reduce((sum, exp) => sum + exp.amount, 0);

      // Calculate by category
      const byCategory: Record<string, number> = {};
      filteredExpenses.forEach((exp) => {
        if (!byCategory[exp.category]) {
          byCategory[exp.category] = 0;
        }
        byCategory[exp.category] += exp.amount;
      });

      // Calculate monthly trend
      const monthlyTrend = [
        { month: '6月', amount: 1850000 },
        { month: '7月', amount: 2100000 },
        { month: '8月', amount: totalExpenses },
      ];

      setExpenses(filteredExpenses);
      setStats({
        totalExpenses,
        pendingApproval,
        approvedAmount,
        rejectedAmount,
        byCategory,
        monthlyTrend,
      });
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
      setError('経費データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const createExpense = async (expense: Omit<Expense, 'id' | 'status'>) => {
    try {
      const newExpense: Expense = {
        ...expense,
        id: `EXP-${Date.now()}`,
        status: 'pending',
      };

      setExpenses((prev) => [...prev, newExpense]);
      return true;
    } catch (err) {
      console.error('Failed to create expense:', err);
      return false;
    }
  };

  const updateExpenseStatus = async (
    expenseId: string,
    status: Expense['status'],
  ) => {
    try {
      setExpenses((prev) =>
        prev.map((exp) => (exp.id === expenseId ? { ...exp, status } : exp)),
      );
      return true;
    } catch (err) {
      console.error('Failed to update expense:', err);
      return false;
    }
  };

  const deleteExpense = async (expenseId: string) => {
    try {
      setExpenses((prev) => prev.filter((exp) => exp.id !== expenseId));
      return true;
    } catch (err) {
      console.error('Failed to delete expense:', err);
      return false;
    }
  };

  useEffect(() => {
    if (options.autoFetch) {
      fetchExpenses();
    }
  }, [options.companyId, options.storeId, options.userId]);

  return {
    expenses,
    stats,
    loading,
    error,
    refetch: fetchExpenses,
    createExpense,
    updateExpenseStatus,
    deleteExpense,
  };
}
