import { useState, useEffect } from 'react';
import axios from 'axios';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  contracts: number;
  revenue: number;
  profitMargin: number;
  pendingEstimates: number;
  status: 'good' | 'warning' | 'danger';
}

interface TeamPerformance {
  members: TeamMember[];
  totalRevenue: number;
  averageProfit: number;
  totalContracts: number;
  topPerformer: TeamMember | null;
}

interface UseTeamPerformanceOptions {
  companyId?: string;
  storeId?: string;
  autoFetch?: boolean;
}

export function useTeamPerformance(options: UseTeamPerformanceOptions = {}) {
  const [performance, setPerformance] = useState<TeamPerformance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all users and their performance data
      const params = new URLSearchParams();
      if (options.companyId) params.append('companyId', options.companyId);
      if (options.storeId) params.append('storeId', options.storeId);

      // Get customers and estimates for each user
      const [customersRes, estimatesRes] = await Promise.all([
        axios.get(
          `${process.env.NEXT_PUBLIC_CUSTOMER_SERVICE_URL || 'http://localhost:3001'}/api/customers?${params.toString()}`,
        ),
        axios.get(
          `${process.env.NEXT_PUBLIC_ESTIMATE_SERVICE_URL || 'http://localhost:3002'}/api/estimates?${params.toString()}`,
        ),
      ]);

      const customers = customersRes.data.customers || [];
      const estimates = estimatesRes.data.estimates || [];

      // Group by assignee
      const performanceMap = new Map<string, any>();

      // Process customers
      customers.forEach((customer: any) => {
        if (!customer.assignee) return;

        if (!performanceMap.has(customer.assignee)) {
          performanceMap.set(customer.assignee, {
            id: customer.assignee,
            name: customer.assignee, // In real app, fetch from user service
            email: customer.assignee,
            role: 'sales',
            customers: [],
            estimates: [],
            contracts: 0,
            revenue: 0,
            profitSum: 0,
            pendingEstimates: 0,
          });
        }

        const data = performanceMap.get(customer.assignee);
        data.customers.push(customer);
      });

      // Process estimates
      estimates.forEach((estimate: any) => {
        const assignee = estimate.userId;
        if (!assignee) return;

        if (!performanceMap.has(assignee)) {
          performanceMap.set(assignee, {
            id: assignee,
            name: assignee,
            email: assignee,
            role: 'sales',
            customers: [],
            estimates: [],
            contracts: 0,
            revenue: 0,
            profitSum: 0,
            pendingEstimates: 0,
          });
        }

        const data = performanceMap.get(assignee);
        data.estimates.push(estimate);

        if (estimate.status === 'approved') {
          data.contracts++;
          data.revenue += estimate.totalAmount || 0;
          data.profitSum +=
            (estimate.totalAmount || 0) * (estimate.profitMargin || 0.3);
        } else if (
          estimate.status === 'draft' ||
          estimate.status === 'pending'
        ) {
          data.pendingEstimates++;
        }
      });

      // Calculate performance metrics
      const members: TeamMember[] = Array.from(performanceMap.values()).map(
        (data) => {
          const profitMargin =
            data.revenue > 0 ? (data.profitSum / data.revenue) * 100 : 0;

          // Determine status based on performance
          let status: 'good' | 'warning' | 'danger' = 'danger';
          if (data.contracts >= 5 && profitMargin >= 20) {
            status = 'good';
          } else if (data.contracts >= 3 || profitMargin >= 15) {
            status = 'warning';
          }

          return {
            id: data.id,
            name:
              data.name === data.email ? data.email.split('@')[0] : data.name,
            email: data.email,
            role: data.role,
            contracts: data.contracts,
            revenue: data.revenue,
            profitMargin,
            pendingEstimates: data.pendingEstimates,
            status,
          };
        },
      );

      // Calculate totals
      const totalRevenue = members.reduce((sum, m) => sum + m.revenue, 0);
      const totalContracts = members.reduce((sum, m) => sum + m.contracts, 0);
      const averageProfit =
        members.length > 0
          ? members.reduce((sum, m) => sum + m.profitMargin, 0) / members.length
          : 0;

      // Find top performer
      const topPerformer = members.reduce(
        (top, member) => {
          if (!top || member.revenue > top.revenue) return member;
          return top;
        },
        null as TeamMember | null,
      );

      setPerformance({
        members,
        totalRevenue,
        averageProfit,
        totalContracts,
        topPerformer,
      });
    } catch (err) {
      console.error('Failed to fetch team performance:', err);
      setError('チームパフォーマンスデータの取得に失敗しました');

      // Set mock data on error
      setPerformance({
        members: [
          {
            id: '1',
            name: '営業太郎',
            email: 'sales@test.com',
            role: 'sales',
            contracts: 8,
            revenue: 15000000,
            profitMargin: 24,
            pendingEstimates: 2,
            status: 'good',
          },
          {
            id: '2',
            name: '佐藤花子',
            email: 'sato@test.com',
            role: 'sales',
            contracts: 5,
            revenue: 9000000,
            profitMargin: 18,
            pendingEstimates: 3,
            status: 'warning',
          },
        ],
        totalRevenue: 24000000,
        averageProfit: 21,
        totalContracts: 13,
        topPerformer: null,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.autoFetch) {
      fetchPerformance();
    }
  }, [options.companyId, options.storeId]);

  return {
    performance,
    loading,
    error,
    refetch: fetchPerformance,
  };
}
