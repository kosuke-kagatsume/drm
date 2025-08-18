import { useState, useEffect } from 'react';
import axios from 'axios';

interface FinancialMetrics {
  revenue: {
    monthly: number;
    quarterly: number;
    yearly: number;
  };
  profit: {
    amount: number;
    margin: number;
  };
  efficiency: {
    avgDealSize: number;
    salesCycle: number; // days
    conversionRate: number;
  };
  projections: {
    monthlyTarget: number;
    quarterlyTarget: number;
    currentProgress: number; // percentage
  };
}

interface UseFinancialMetricsOptions {
  companyId?: string;
  storeId?: string;
  userId?: string;
  autoFetch?: boolean;
}

export function useFinancialMetrics(options: UseFinancialMetricsOptions = {}) {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);

    // Use mock data immediately if API endpoints are not configured
    if (!process.env.NEXT_PUBLIC_ESTIMATE_SERVICE_URL) {
      setTimeout(() => {
        setMetrics({
          revenue: {
            monthly: 8500000,
            quarterly: 24000000,
            yearly: 85000000,
          },
          profit: {
            amount: 2550000,
            margin: 30,
          },
          efficiency: {
            avgDealSize: 2500000,
            salesCycle: 14,
            conversionRate: 35,
          },
          projections: {
            monthlyTarget: 10000000,
            quarterlyTarget: 30000000,
            currentProgress: 85,
          },
        });
        setLoading(false);
      }, 100);
      return;
    }

    try {
      // Fetch estimates for financial calculations
      const params = new URLSearchParams();
      if (options.companyId) params.append('companyId', options.companyId);
      if (options.storeId) params.append('storeId', options.storeId);
      if (options.userId) params.append('assignee', options.userId);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_ESTIMATE_SERVICE_URL || 'http://localhost:3002'}/api/estimates?${params.toString()}`,
      );

      const estimates = response.data.estimates || [];

      // Calculate metrics from estimates
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Filter estimates by time period
      const monthlyEstimates = estimates.filter((e: any) => {
        const date = new Date(e.createdAt);
        return (
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear &&
          e.status === 'approved'
        );
      });

      const quarterStart = new Date(
        currentYear,
        Math.floor(currentMonth / 3) * 3,
        1,
      );
      const quarterlyEstimates = estimates.filter((e: any) => {
        const date = new Date(e.createdAt);
        return date >= quarterStart && e.status === 'approved';
      });

      const yearlyEstimates = estimates.filter((e: any) => {
        const date = new Date(e.createdAt);
        return date.getFullYear() === currentYear && e.status === 'approved';
      });

      // Calculate revenue
      const monthlyRevenue = monthlyEstimates.reduce(
        (sum: number, e: any) => sum + e.totalAmount,
        0,
      );
      const quarterlyRevenue = quarterlyEstimates.reduce(
        (sum: number, e: any) => sum + e.totalAmount,
        0,
      );
      const yearlyRevenue = yearlyEstimates.reduce(
        (sum: number, e: any) => sum + e.totalAmount,
        0,
      );

      // Calculate profit (using average margin of 30%)
      const avgMargin = 0.3;
      const monthlyProfit = monthlyRevenue * avgMargin;

      // Calculate efficiency metrics
      const approvedEstimates = estimates.filter(
        (e: any) => e.status === 'approved',
      );
      const avgDealSize =
        approvedEstimates.length > 0
          ? approvedEstimates.reduce(
              (sum: number, e: any) => sum + e.totalAmount,
              0,
            ) / approvedEstimates.length
          : 0;

      const totalEstimates = estimates.length;
      const conversionRate =
        totalEstimates > 0
          ? (approvedEstimates.length / totalEstimates) * 100
          : 0;

      // Set targets (example: 10M monthly, 30M quarterly)
      const monthlyTarget = 10000000;
      const quarterlyTarget = 30000000;
      const currentProgress = (monthlyRevenue / monthlyTarget) * 100;

      setMetrics({
        revenue: {
          monthly: monthlyRevenue,
          quarterly: quarterlyRevenue,
          yearly: yearlyRevenue,
        },
        profit: {
          amount: monthlyProfit,
          margin: avgMargin * 100,
        },
        efficiency: {
          avgDealSize,
          salesCycle: 14, // Default 14 days
          conversionRate,
        },
        projections: {
          monthlyTarget,
          quarterlyTarget,
          currentProgress,
        },
      });
    } catch (err) {
      console.error('Failed to fetch financial metrics:', err);
      setError('財務指標の取得に失敗しました');

      // Set default metrics on error
      setMetrics({
        revenue: {
          monthly: 0,
          quarterly: 0,
          yearly: 0,
        },
        profit: {
          amount: 0,
          margin: 0,
        },
        efficiency: {
          avgDealSize: 0,
          salesCycle: 0,
          conversionRate: 0,
        },
        projections: {
          monthlyTarget: 10000000,
          quarterlyTarget: 30000000,
          currentProgress: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.autoFetch) {
      fetchMetrics();
    }
  }, [options.companyId, options.storeId, options.userId]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics,
  };
}
