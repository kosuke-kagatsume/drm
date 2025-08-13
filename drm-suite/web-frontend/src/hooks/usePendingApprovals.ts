import { useState, useEffect } from 'react';
import axios from 'axios';

interface PendingApproval {
  id: string;
  type: 'estimate' | 'expense' | 'contract';
  customer: string;
  amount: number;
  profitMargin: number;
  salesPerson: string;
  urgent: boolean;
  createdAt: string;
  dueDate?: string;
  description?: string;
}

interface UsePendingApprovalsOptions {
  companyId?: string;
  storeId?: string;
  managerId?: string;
  autoFetch?: boolean;
}

export function usePendingApprovals(options: UsePendingApprovalsOptions = {}) {
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch pending estimates that need approval
      const params = new URLSearchParams();
      if (options.companyId) params.append('companyId', options.companyId);
      if (options.storeId) params.append('storeId', options.storeId);
      params.append('status', 'pending');

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_ESTIMATE_SERVICE_URL || 'http://localhost:3002'}/api/estimates?${params.toString()}`,
      );

      const estimates = response.data.estimates || [];

      // Transform estimates into approval items
      const pendingApprovals: PendingApproval[] = estimates.map(
        (estimate: any) => {
          const validUntil = new Date(estimate.validUntil);
          const today = new Date();
          const daysLeft = Math.floor(
            (validUntil.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
          );

          return {
            id: estimate.id,
            type: 'estimate' as const,
            customer:
              estimate.customerName || estimate.projectName || '顧客名不明',
            amount: estimate.totalAmount || 0,
            profitMargin: (estimate.profitMargin || 0.2) * 100,
            salesPerson: estimate.userId || '担当者不明',
            urgent: daysLeft <= 3,
            createdAt: estimate.createdAt,
            dueDate: estimate.validUntil,
            description: estimate.notes,
          };
        },
      );

      // Sort by urgency and amount
      pendingApprovals.sort((a, b) => {
        if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
        return b.amount - a.amount;
      });

      setApprovals(pendingApprovals);
    } catch (err) {
      console.error('Failed to fetch pending approvals:', err);
      setError('承認待ち案件の取得に失敗しました');

      // Set mock data on error
      setApprovals([
        {
          id: '1',
          type: 'estimate',
          customer: '田中様邸',
          amount: 2500000,
          profitMargin: 22,
          salesPerson: '山田太郎',
          urgent: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'estimate',
          customer: '佐藤ビル改修',
          amount: 8000000,
          profitMargin: 18,
          salesPerson: '佐藤花子',
          urgent: true,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const approveItem = async (id: string) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_ESTIMATE_SERVICE_URL || 'http://localhost:3002'}/api/estimates/${id}`,
        { status: 'approved' },
      );

      // Remove from local state
      setApprovals((prev) => prev.filter((a) => a.id !== id));
      return true;
    } catch (err) {
      console.error('Failed to approve item:', err);
      return false;
    }
  };

  const rejectItem = async (id: string, reason?: string) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_ESTIMATE_SERVICE_URL || 'http://localhost:3002'}/api/estimates/${id}`,
        {
          status: 'rejected',
          notes: reason,
        },
      );

      // Remove from local state
      setApprovals((prev) => prev.filter((a) => a.id !== id));
      return true;
    } catch (err) {
      console.error('Failed to reject item:', err);
      return false;
    }
  };

  useEffect(() => {
    if (options.autoFetch) {
      fetchApprovals();
    }
  }, [options.companyId, options.storeId, options.managerId]);

  return {
    approvals,
    loading,
    error,
    refetch: fetchApprovals,
    approveItem,
    rejectItem,
  };
}
