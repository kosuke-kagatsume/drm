import { useState, useEffect } from 'react';
import axios from 'axios';

export interface Invoice {
  id: string;
  projectName: string;
  customer: string;
  amount: number;
  issuedDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'overdue' | 'paid';
  paymentProgress: number;
  estimateId?: string;
  items?: any[];
}

interface UseInvoicesOptions {
  companyId?: string;
  storeId?: string;
  status?: string[];
  autoFetch?: boolean;
}

export function useInvoices(options: UseInvoicesOptions = {}) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalAmount: 0,
    paidAmount: 0,
    overdueAmount: 0,
    pendingAmount: 0,
    overdueCount: 0,
  });

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, generate invoices from approved estimates
      const params = new URLSearchParams();
      if (options.companyId) params.append('companyId', options.companyId);
      if (options.storeId) params.append('storeId', options.storeId);
      params.append('status', 'approved');

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_ESTIMATE_SERVICE_URL || 'http://localhost:3002'}/api/estimates?${params.toString()}`,
      );

      const estimates = response.data.estimates || [];

      // Transform approved estimates into invoices
      const invoiceList: Invoice[] = estimates.map((estimate: any) => {
        const issuedDate = new Date(estimate.approvedAt || estimate.updatedAt);
        const dueDate = new Date(issuedDate);
        dueDate.setDate(dueDate.getDate() + 30); // 30 days payment terms

        const today = new Date();
        const isOverdue = dueDate < today;
        const isPaid = Math.random() > 0.7; // Simulate some paid invoices

        return {
          id: `INV-${estimate.id.substring(0, 8)}`,
          projectName: estimate.projectName || estimate.customerName,
          customer: estimate.customerName,
          amount: estimate.totalAmount,
          issuedDate: issuedDate.toISOString(),
          dueDate: dueDate.toISOString(),
          status: isPaid ? 'paid' : isOverdue ? 'overdue' : 'sent',
          paymentProgress: isPaid ? 100 : Math.floor(Math.random() * 80),
          estimateId: estimate.id,
        };
      });

      // Calculate statistics
      const totalAmount = invoiceList.reduce((sum, inv) => sum + inv.amount, 0);
      const paidAmount = invoiceList
        .filter((inv) => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.amount, 0);
      const overdueAmount = invoiceList
        .filter((inv) => inv.status === 'overdue')
        .reduce((sum, inv) => sum + inv.amount, 0);
      const pendingAmount = invoiceList
        .filter((inv) => inv.status === 'sent' || inv.status === 'draft')
        .reduce((sum, inv) => sum + inv.amount, 0);
      const overdueCount = invoiceList.filter(
        (inv) => inv.status === 'overdue',
      ).length;

      setInvoices(invoiceList);
      setStats({
        totalAmount,
        paidAmount,
        overdueAmount,
        pendingAmount,
        overdueCount,
      });
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
      setError('請求書データの取得に失敗しました');

      // Set mock data on error
      setInvoices([
        {
          id: 'INV-001',
          projectName: '田中様邸外壁塗装',
          customer: '田中建設',
          amount: 2500000,
          issuedDate: new Date('2024-08-01').toISOString(),
          dueDate: new Date('2024-08-31').toISOString(),
          status: 'sent',
          paymentProgress: 50,
        },
        {
          id: 'INV-002',
          projectName: '佐藤ビル改修',
          customer: '佐藤商事',
          amount: 8000000,
          issuedDate: new Date('2024-07-15').toISOString(),
          dueDate: new Date('2024-08-15').toISOString(),
          status: 'overdue',
          paymentProgress: 0,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async (estimateId: string) => {
    try {
      // In a real app, this would create an invoice in the backend
      await fetchInvoices(); // Refresh list
      return true;
    } catch (err) {
      console.error('Failed to create invoice:', err);
      return false;
    }
  };

  const updateInvoiceStatus = async (
    invoiceId: string,
    status: Invoice['status'],
  ) => {
    try {
      // In a real app, this would update the invoice in the backend
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === invoiceId ? { ...inv, status } : inv)),
      );
      return true;
    } catch (err) {
      console.error('Failed to update invoice:', err);
      return false;
    }
  };

  useEffect(() => {
    if (options.autoFetch) {
      fetchInvoices();
    }
  }, [options.companyId, options.storeId]);

  return {
    invoices,
    stats,
    loading,
    error,
    refetch: fetchInvoices,
    createInvoice,
    updateInvoiceStatus,
  };
}
