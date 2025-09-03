// Estimate Service - 見積管理API
import {
  Estimate,
  EstimateStatus,
  EstimateItem,
  EstimateSection,
} from '@/types/estimate';

const ESTIMATE_API_URL =
  process.env.NEXT_PUBLIC_ESTIMATE_API_URL || 'http://localhost:3002/api';

export interface CreateEstimateRequest {
  customerName: string;
  customerCompany?: string;
  customerId?: string;
  projectName: string;
  projectAddress?: string;
  projectType: string;
  constructionPeriod?: string;
  paymentTerms?: string;
  validUntil?: string;
  sections: EstimateSection[];
  expenses: {
    siteManagementRate: number;
    generalManagementRate: number;
    profitRate: number;
    discountAmount: number;
    taxRate: number;
  };
  notes?: string;
}

export interface UpdateEstimateRequest extends Partial<CreateEstimateRequest> {
  id: string;
  status?: EstimateStatus;
}

export interface EstimateFilter {
  status?: EstimateStatus;
  customerId?: string;
  projectType?: string;
  createdBy?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  search?: string;
  offset?: number;
  limit?: number;
}

export interface EstimateTemplate {
  id: string;
  name: string;
  description: string;
  projectType: string;
  sections: EstimateSection[];
  createdBy: string;
  createdAt: string;
  isPublic: boolean;
}

export interface RAGSuggestion {
  type: 'similar_estimate' | 'missing_item' | 'price_optimization';
  title: string;
  description: string;
  data?: any;
  confidence: number;
}

class EstimateService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${ESTIMATE_API_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // 見積一覧取得
  async getEstimates(filter?: EstimateFilter): Promise<{
    estimates: Estimate[];
    total: number;
    hasMore: boolean;
  }> {
    // Return mock data if API is not configured
    if (!process.env.NEXT_PUBLIC_ESTIMATE_API_URL) {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextMonth = new Date(today);
      nextMonth.setDate(nextMonth.getDate() + 30);

      return Promise.resolve({
        estimates: [
          {
            id: '1',
            estimateNumber: 'EST-2024-001',
            customerName: '田中太郎',
            customerCompany: '田中建設株式会社',
            customerId: '1',
            projectName: '田中様邸 外壁塗装工事',
            projectType: 'reform',
            validUntil: nextWeek.toISOString(),
            status: 'pending' as EstimateStatus,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'system',
            version: 1,
            sections: [],
            expenses: {
              siteManagementRate: 10,
              generalManagementRate: 8,
              profitRate: 12,
              discountAmount: 0,
              taxRate: 10,
            },
            totals: {
              directCost: 2000000,
              siteManagement: 200000,
              generalManagement: 160000,
              profit: 240000,
              subtotal: 2600000,
              tax: 260000,
              total: 2860000,
              totalCost: 1800000,
              grossProfitAmount: 800000,
              grossProfitRate: 30.8,
            },
          },
          {
            id: '2',
            estimateNumber: 'EST-2024-002',
            customerName: '佐藤花子',
            customerCompany: '佐藤工務店',
            customerId: '2',
            projectName: 'キッチンリフォーム工事',
            projectType: 'reform',
            status: 'draft' as EstimateStatus,
            validUntil: nextMonth.toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'system',
            version: 1,
            sections: [],
            expenses: {
              siteManagementRate: 10,
              generalManagementRate: 8,
              profitRate: 12,
              discountAmount: 0,
              taxRate: 10,
            },
            totals: {
              directCost: 3000000,
              siteManagement: 300000,
              generalManagement: 240000,
              profit: 360000,
              subtotal: 3900000,
              tax: 390000,
              total: 4290000,
              totalCost: 2700000,
              grossProfitAmount: 1200000,
              grossProfitRate: 30.8,
            },
          },
        ],
        total: 2,
        hasMore: false,
      });
    }

    const params = new URLSearchParams();

    if (filter?.status) params.append('status', filter.status);
    if (filter?.customerId) params.append('customerId', filter.customerId);
    if (filter?.projectType) params.append('projectType', filter.projectType);
    if (filter?.createdBy) params.append('createdBy', filter.createdBy);
    if (filter?.dateFrom) params.append('dateFrom', filter.dateFrom);
    if (filter?.dateTo) params.append('dateTo', filter.dateTo);
    if (filter?.amountMin)
      params.append('amountMin', filter.amountMin.toString());
    if (filter?.amountMax)
      params.append('amountMax', filter.amountMax.toString());
    if (filter?.search) params.append('search', filter.search);
    if (filter?.offset) params.append('offset', filter.offset.toString());
    if (filter?.limit) params.append('limit', filter.limit.toString());

    const queryString = params.toString();
    const endpoint = `/estimates${queryString ? `?${queryString}` : ''}`;

    return this.request<{
      estimates: Estimate[];
      total: number;
      hasMore: boolean;
    }>(endpoint);
  }

  // 見積詳細取得
  async getEstimate(id: string): Promise<Estimate> {
    return this.request<Estimate>(`/estimates/${id}`);
  }

  // 新規見積作成
  async createEstimate(data: CreateEstimateRequest): Promise<Estimate> {
    return this.request<Estimate>('/estimates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 見積更新
  async updateEstimate(data: UpdateEstimateRequest): Promise<Estimate> {
    const { id, ...updateData } = data;
    return this.request<Estimate>(`/estimates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // 見積削除
  async deleteEstimate(id: string): Promise<void> {
    await this.request<void>(`/estimates/${id}`, {
      method: 'DELETE',
    });
  }

  // 見積承認申請
  async submitForApproval(id: string): Promise<Estimate> {
    return this.request<Estimate>(`/estimates/${id}/submit`, {
      method: 'POST',
    });
  }

  // 見積承認
  async approveEstimate(id: string, comments?: string): Promise<Estimate> {
    return this.request<Estimate>(`/estimates/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    });
  }

  // 見積拒否
  async rejectEstimate(id: string, reason: string): Promise<Estimate> {
    return this.request<Estimate>(`/estimates/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // 見積PDF生成
  async generatePDF(id: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/estimates/${id}/pdf`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('PDF generation failed');
    }

    return response.blob();
  }

  // 見積テンプレート取得
  async getTemplates(): Promise<EstimateTemplate[]> {
    return this.request<EstimateTemplate[]>('/estimates/templates');
  }

  // テンプレート作成
  async createTemplate(
    template: Omit<EstimateTemplate, 'id' | 'createdAt'>,
  ): Promise<EstimateTemplate> {
    return this.request<EstimateTemplate>('/estimates/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  // RAGアシスタント - 類似見積検索
  async findSimilarEstimates(
    query: string,
    limit: number = 5,
  ): Promise<{
    estimates: Array<{
      id: string;
      projectName: string;
      customerName: string;
      totalAmount: number;
      createdAt: string;
      similarity: number;
      sections: EstimateSection[];
    }>;
    suggestions: RAGSuggestion[];
  }> {
    return this.request<{
      estimates: Array<{
        id: string;
        projectName: string;
        customerName: string;
        totalAmount: number;
        createdAt: string;
        similarity: number;
        sections: EstimateSection[];
      }>;
      suggestions: RAGSuggestion[];
    }>('/estimates/rag/similar', {
      method: 'POST',
      body: JSON.stringify({ query, limit }),
    });
  }

  // RAGアシスタント - 見積項目提案
  async suggestItems(
    projectType: string,
    description: string,
  ): Promise<{
    suggestedItems: EstimateItem[];
    missingItems: string[];
    priceRange: { min: number; max: number; average: number };
  }> {
    return this.request<{
      suggestedItems: EstimateItem[];
      missingItems: string[];
      priceRange: { min: number; max: number; average: number };
    }>('/estimates/rag/suggest-items', {
      method: 'POST',
      body: JSON.stringify({ projectType, description }),
    });
  }

  // RAGアシスタント - 価格最適化
  async optimizePricing(sections: EstimateSection[]): Promise<{
    optimizedSections: EstimateSection[];
    recommendations: Array<{
      itemId: string;
      currentPrice: number;
      suggestedPrice: number;
      reason: string;
      confidence: number;
    }>;
    competitivenessScore: number;
  }> {
    return this.request<{
      optimizedSections: EstimateSection[];
      recommendations: Array<{
        itemId: string;
        currentPrice: number;
        suggestedPrice: number;
        reason: string;
        confidence: number;
      }>;
      competitivenessScore: number;
    }>('/estimates/rag/optimize-pricing', {
      method: 'POST',
      body: JSON.stringify({ sections }),
    });
  }

  // 見積統計取得
  async getEstimateStats(period?: string): Promise<{
    total: number;
    byStatus: Record<EstimateStatus, number>;
    totalValue: number;
    averageValue: number;
    conversionRate: number;
    topProjectTypes: Array<{ type: string; count: number; totalValue: number }>;
    monthlyTrend: Array<{ month: string; count: number; value: number }>;
  }> {
    const endpoint = period
      ? `/estimates/stats?period=${period}`
      : '/estimates/stats';
    return this.request<{
      total: number;
      byStatus: Record<EstimateStatus, number>;
      totalValue: number;
      averageValue: number;
      conversionRate: number;
      topProjectTypes: Array<{
        type: string;
        count: number;
        totalValue: number;
      }>;
      monthlyTrend: Array<{ month: string; count: number; value: number }>;
    }>(endpoint);
  }

  // 見積エクスポート
  async exportEstimates(
    format: 'csv' | 'excel' = 'csv',
    filter?: EstimateFilter,
  ): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('format', format);

    if (filter?.status) params.append('status', filter.status);
    if (filter?.dateFrom) params.append('dateFrom', filter.dateFrom);
    if (filter?.dateTo) params.append('dateTo', filter.dateTo);

    const response = await fetch(
      `${API_BASE_URL}/estimates/export?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  // 材料価格取得（外部API連携）
  async getMaterialPrices(materials: string[]): Promise<
    Record<
      string,
      {
        currentPrice: number;
        trend: 'up' | 'down' | 'stable';
        lastUpdated: string;
        supplier: string;
      }
    >
  > {
    return this.request<
      Record<
        string,
        {
          currentPrice: number;
          trend: 'up' | 'down' | 'stable';
          lastUpdated: string;
          supplier: string;
        }
      >
    >('/estimates/material-prices', {
      method: 'POST',
      body: JSON.stringify({ materials }),
    });
  }

  // 原価計算
  async calculateCosts(sections: EstimateSection[]): Promise<{
    directCosts: number;
    laborCosts: number;
    materialCosts: number;
    subcontractorCosts: number;
    overhead: number;
    totalCosts: number;
    recommendedMargin: number;
    profitAnalysis: {
      breakEvenPoint: number;
      riskLevel: 'low' | 'medium' | 'high';
      recommendations: string[];
    };
  }> {
    return this.request<{
      directCosts: number;
      laborCosts: number;
      materialCosts: number;
      subcontractorCosts: number;
      overhead: number;
      totalCosts: number;
      recommendedMargin: number;
      profitAnalysis: {
        breakEvenPoint: number;
        riskLevel: 'low' | 'medium' | 'high';
        recommendations: string[];
      };
    }>('/estimates/calculate-costs', {
      method: 'POST',
      body: JSON.stringify({ sections }),
    });
  }
}

// シングルトンインスタンス
export const estimateService = new EstimateService();
export default estimateService;
