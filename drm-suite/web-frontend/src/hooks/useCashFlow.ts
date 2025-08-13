import { useState, useEffect } from 'react';
import { useInvoices } from './useInvoices';
import { useExpenses } from './useExpenses';

export interface CashFlowEntry {
  date: string;
  description: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  balance?: number;
  projectId?: string;
}

export interface CashFlowForecast {
  date: string;
  expectedIncome: number;
  expectedExpense: number;
  netCashFlow: number;
  cumulativeBalance: number;
}

export interface CashFlowStats {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  netCashFlow: number;
  burnRate: number;
  runwayMonths: number;
}

interface UseCashFlowOptions {
  companyId?: string;
  storeId?: string;
  startDate?: string;
  endDate?: string;
  autoFetch?: boolean;
}

export function useCashFlow(options: UseCashFlowOptions = {}) {
  const [entries, setEntries] = useState<CashFlowEntry[]>([]);
  const [forecast, setForecast] = useState<CashFlowForecast[]>([]);
  const [stats, setStats] = useState<CashFlowStats>({
    currentBalance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    netCashFlow: 0,
    burnRate: 0,
    runwayMonths: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { invoices, stats: invoiceStats } = useInvoices({
    companyId: options.companyId,
    storeId: options.storeId,
    autoFetch: options.autoFetch,
  });

  const { expenses, stats: expenseStats } = useExpenses({
    companyId: options.companyId,
    storeId: options.storeId,
    autoFetch: options.autoFetch,
  });

  const calculateCashFlow = () => {
    try {
      setLoading(true);

      // Create cash flow entries from invoices (income)
      const incomeEntries: CashFlowEntry[] = invoices
        .filter((inv) => inv.status === 'paid')
        .map((inv) => ({
          date: inv.issuedDate,
          description: `入金: ${inv.projectName}`,
          type: 'income' as const,
          category: '売上',
          amount: inv.amount,
          projectId: inv.estimateId,
        }));

      // Create cash flow entries from expenses
      const expenseEntries: CashFlowEntry[] = expenses
        .filter((exp) => exp.status === 'approved')
        .map((exp) => ({
          date: exp.date,
          description: exp.description,
          type: 'expense' as const,
          category: exp.category,
          amount: exp.amount,
          projectId: exp.projectId,
        }));

      // Combine and sort entries by date
      const allEntries = [...incomeEntries, ...expenseEntries].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      // Calculate running balance
      let runningBalance = 10000000; // Starting balance of 10M yen
      const entriesWithBalance = allEntries.map((entry) => {
        if (entry.type === 'income') {
          runningBalance += entry.amount;
        } else {
          runningBalance -= entry.amount;
        }
        return { ...entry, balance: runningBalance };
      });

      // Calculate monthly statistics
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      const monthlyIncome = incomeEntries
        .filter((entry) => {
          const date = new Date(entry.date);
          return (
            date.getMonth() === thisMonth && date.getFullYear() === thisYear
          );
        })
        .reduce((sum, entry) => sum + entry.amount, 0);

      const monthlyExpense = expenseEntries
        .filter((entry) => {
          const date = new Date(entry.date);
          return (
            date.getMonth() === thisMonth && date.getFullYear() === thisYear
          );
        })
        .reduce((sum, entry) => sum + entry.amount, 0);

      const netCashFlow = monthlyIncome - monthlyExpense;
      const burnRate = monthlyExpense;
      const runwayMonths =
        runningBalance > 0 && burnRate > 0
          ? Math.floor(runningBalance / burnRate)
          : 0;

      // Generate forecast for next 6 months
      const forecastData: CashFlowForecast[] = [];
      let cumulativeBalance = runningBalance;

      for (let i = 0; i < 6; i++) {
        const forecastDate = new Date();
        forecastDate.setMonth(forecastDate.getMonth() + i);

        // Estimate based on historical averages
        const expectedIncome = invoiceStats.totalAmount / 3; // Assume 3-month average
        const expectedExpense = expenseStats.totalExpenses / 3;
        const netFlow = expectedIncome - expectedExpense;
        cumulativeBalance += netFlow;

        forecastData.push({
          date: forecastDate.toISOString(),
          expectedIncome,
          expectedExpense,
          netCashFlow: netFlow,
          cumulativeBalance,
        });
      }

      setEntries(entriesWithBalance);
      setForecast(forecastData);
      setStats({
        currentBalance: runningBalance,
        monthlyIncome,
        monthlyExpense,
        netCashFlow,
        burnRate,
        runwayMonths,
      });

      setError(null);
    } catch (err) {
      console.error('Failed to calculate cash flow:', err);
      setError('キャッシュフロー計算に失敗しました');

      // Set default values on error
      setStats({
        currentBalance: 10000000,
        monthlyIncome: 5000000,
        monthlyExpense: 3500000,
        netCashFlow: 1500000,
        burnRate: 3500000,
        runwayMonths: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (invoices.length > 0 || expenses.length > 0) {
      calculateCashFlow();
    }
  }, [invoices, expenses]);

  return {
    entries,
    forecast,
    stats,
    loading,
    error,
    refetch: calculateCashFlow,
  };
}
