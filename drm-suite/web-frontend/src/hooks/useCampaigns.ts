import { useState, useEffect } from 'react';
import {
  Campaign,
  CreateCampaignDto,
  UpdateCampaignDto,
  CampaignStatus,
} from '@/types/campaign';

interface UseCampaignsOptions {
  filter?: {
    status?: CampaignStatus[];
    type?: string[];
    search?: string;
  };
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

export function useCampaigns(options: UseCampaignsOptions = {}) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // モックデータ生成
  const generateMockCampaigns = (): Campaign[] => {
    return [
      {
        id: '1',
        name: '春の外壁塗装キャンペーン',
        description: '春季限定！外壁塗装が最大20%OFF',
        type: 'email',
        status: 'active',
        targetSegment: 'all',
        targetCount: 450,
        budget: 500000,
        actualCost: 125000,
        startDate: '2024-03-01',
        endDate: '2024-04-30',
        createdBy: 'marketing@drm.com',
        createdAt: '2024-02-15T10:00:00Z',
        updatedAt: '2024-03-01T09:00:00Z',
        metrics: {
          sent: 450,
          delivered: 432,
          opened: 201,
          clicked: 87,
          converted: 12,
          revenue: 3600000,
          roi: 288,
        },
        content: {
          subject: '【期間限定】春の外壁塗装キャンペーン実施中！',
          body: '今なら外壁塗装が最大20%OFF！無料見積もり実施中です。',
          imageUrl: '/images/campaign-spring.jpg',
          ctaText: '無料見積もりを申し込む',
          ctaUrl: 'https://drm.com/campaign/spring2024',
        },
      },
      {
        id: '2',
        name: '新規顧客限定！初回割引',
        description: '初めてのお客様限定、工事費10%割引',
        type: 'web',
        status: 'active',
        targetSegment: 'new',
        targetCount: 120,
        budget: 300000,
        actualCost: 95000,
        startDate: '2024-02-01',
        endDate: '2024-03-31',
        createdBy: 'marketing@drm.com',
        createdAt: '2024-01-20T14:00:00Z',
        updatedAt: '2024-02-01T09:00:00Z',
        metrics: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 523,
          converted: 28,
          revenue: 5200000,
          roi: 173,
        },
        content: {
          subject: '新規顧客限定キャンペーン',
          body: '初回ご利用のお客様は工事費が10%OFF',
          imageUrl: '/images/new-customer.jpg',
          ctaText: '詳細を見る',
          ctaUrl: 'https://drm.com/new-customer',
        },
      },
      {
        id: '3',
        name: '雨季対策！屋根点検無料',
        description: '梅雨前の屋根点検を無料で実施',
        type: 'sms',
        status: 'scheduled',
        targetSegment: 'existing',
        targetCount: 280,
        budget: 150000,
        actualCost: 0,
        startDate: '2024-05-01',
        endDate: '2024-05-31',
        createdBy: 'marketing@drm.com',
        createdAt: '2024-03-10T11:00:00Z',
        updatedAt: '2024-03-10T11:00:00Z',
        metrics: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          converted: 0,
          revenue: 0,
          roi: 0,
        },
        content: {
          subject: '無料屋根点検のご案内',
          body: '梅雨前に屋根の状態をチェックしませんか？今なら無料点検実施中。',
          ctaText: '予約する',
          ctaUrl: 'https://drm.com/roof-check',
        },
      },
      {
        id: '4',
        name: 'VIP顧客感謝祭',
        description: 'VIP会員様限定の特別優待',
        type: 'dm',
        status: 'completed',
        targetSegment: 'vip',
        targetCount: 35,
        budget: 200000,
        actualCost: 185000,
        startDate: '2024-01-15',
        endDate: '2024-01-31',
        createdBy: 'marketing@drm.com',
        createdAt: '2024-01-05T09:00:00Z',
        updatedAt: '2024-02-01T10:00:00Z',
        metrics: {
          sent: 35,
          delivered: 35,
          opened: 32,
          clicked: 0,
          converted: 8,
          revenue: 4800000,
          roi: 240,
        },
        content: {
          subject: 'VIP会員様への感謝を込めて',
          body: '日頃のご愛顧に感謝して、特別価格でご提供いたします。',
        },
      },
      {
        id: '5',
        name: 'LINE友達追加キャンペーン',
        description: 'LINE友達追加で5,000円クーポン',
        type: 'line',
        status: 'paused',
        targetSegment: 'all',
        targetCount: 600,
        budget: 100000,
        actualCost: 45000,
        startDate: '2024-02-15',
        endDate: '2024-12-31',
        createdBy: 'marketing@drm.com',
        createdAt: '2024-02-10T10:00:00Z',
        updatedAt: '2024-03-05T14:00:00Z',
        metrics: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 156,
          converted: 45,
          revenue: 1250000,
          roi: 125,
        },
        content: {
          subject: 'LINE友達限定クーポン',
          body: '今すぐLINE友達追加で5,000円OFF',
          ctaText: '友達追加する',
          ctaUrl: 'https://line.me/R/ti/p/@drm',
        },
      },
    ];
  };

  // データ取得
  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);

    try {
      // APIが実装されたら実際のエンドポイントを使用
      // const response = await axios.get('/api/campaigns', { params: options });
      // setCampaigns(response.data.campaigns);
      // setTotal(response.data.total);

      // 現在はモックデータを使用
      const mockData = generateMockCampaigns();
      let filtered = [...mockData];

      // フィルタリング
      if (options.filter?.status?.length) {
        filtered = filtered.filter((c) =>
          options.filter!.status!.includes(c.status),
        );
      }
      if (options.filter?.type?.length) {
        filtered = filtered.filter((c) =>
          options.filter!.type!.includes(c.type),
        );
      }
      if (options.filter?.search) {
        const search = options.filter.search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.name.toLowerCase().includes(search) ||
            c.description.toLowerCase().includes(search),
        );
      }

      // ソート
      if (options.sort) {
        filtered.sort((a, b) => {
          const aVal = (a as any)[options.sort!.field];
          const bVal = (b as any)[options.sort!.field];
          const order = options.sort!.order === 'asc' ? 1 : -1;
          return aVal > bVal ? order : -order;
        });
      }

      setCampaigns(filtered);
      setTotal(filtered.length);
    } catch (err) {
      setError('キャンペーンの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // キャンペーン作成
  const createCampaign = async (
    data: CreateCampaignDto,
  ): Promise<Campaign | null> => {
    try {
      // APIが実装されたら実際のエンドポイントを使用
      // const response = await axios.post('/api/campaigns', data);
      // return response.data;

      // モックレスポンス
      const newCampaign: Campaign = {
        id: Date.now().toString(),
        ...data,
        status: 'draft',
        targetCount: 0,
        actualCost: 0,
        createdBy: 'current-user@drm.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metrics: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          converted: 0,
          revenue: 0,
          roi: 0,
        },
      };

      setCampaigns((prev) => [newCampaign, ...prev]);
      return newCampaign;
    } catch (err) {
      console.error('Failed to create campaign:', err);
      return null;
    }
  };

  // キャンペーン更新
  const updateCampaign = async (
    id: string,
    data: UpdateCampaignDto,
  ): Promise<boolean> => {
    try {
      // APIが実装されたら実際のエンドポイントを使用
      // await axios.patch(`/api/campaigns/${id}`, data);

      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, ...data, updatedAt: new Date().toISOString() }
            : c,
        ),
      );
      return true;
    } catch (err) {
      console.error('Failed to update campaign:', err);
      return false;
    }
  };

  // キャンペーン削除
  const deleteCampaign = async (id: string): Promise<boolean> => {
    try {
      // APIが実装されたら実際のエンドポイントを使用
      // await axios.delete(`/api/campaigns/${id}`);

      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      return true;
    } catch (err) {
      console.error('Failed to delete campaign:', err);
      return false;
    }
  };

  // 初回または依存関係変更時にデータ取得
  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchCampaigns();
    }
  }, [JSON.stringify(options)]);

  return {
    campaigns,
    loading,
    error,
    total,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
  };
}
