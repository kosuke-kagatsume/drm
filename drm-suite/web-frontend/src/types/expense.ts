/**
 * 経費管理関連の型定義
 */

import { UserSummary } from './user';

export interface ExpenseMetadata {
  receiptNumber?: string;
  taxRate?: number;
  taxAmount?: number;
  paymentMethod?: 'cash' | 'credit' | 'bank_transfer' | 'other';
  notes?: string;
  tags?: string[];
  [key: string]: unknown; // 拡張可能だが型安全
}

export interface ExpenseReportOptions {
  includeDetails?: boolean;
  includeAttachments?: boolean;
  groupBy?: 'category' | 'user' | 'project' | 'date';
  sortBy?: 'date' | 'amount' | 'category';
  sortOrder?: 'asc' | 'desc';
}

export interface BulkApprovalResult {
  success: string[];
  failed: Array<{
    expenseId: string;
    reason: string;
  }>;
  total: number;
}

export interface BudgetAnalysis {
  totalBudget: number;
  usedBudget: number;
  remainingBudget: number;
  percentageUsed: number;
  categories: Array<{
    categoryId: string;
    categoryName: string;
    budget: number;
    used: number;
    remaining: number;
  }>;
  projections: {
    endOfMonth: number;
    endOfQuarter: number;
    endOfYear: number;
  };
}

export interface ExpenseAnalytics {
  period: string;
  totalExpenses: number;
  totalCount: number;
  averageExpense: number;
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
  byUser: Array<{
    userId: string;
    userName: string;
    amount: number;
    count: number;
  }>;
  byStatus: Record<string, {
    amount: number;
    count: number;
  }>;
  trends: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
}