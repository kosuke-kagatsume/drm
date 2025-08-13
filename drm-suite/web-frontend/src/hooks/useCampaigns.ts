import { useState, useEffect } from 'react';
import {
  Campaign,
  CreateCampaignDto,
  UpdateCampaignDto,
  CampaignStatus,
  CampaignType,
} from '@/types/campaign';

// サンプルキャンペーンデータ（建設業界向け）
const SAMPLE_CAMPAIGNS: Campaign[] = [
  {
    id: 'C001',
    name: '春の外壁塗装キャンペーン2024',
    description: '春の特別価格で外壁塗装工事を提供。早期申込みで最大20%OFF',
    type: 'email',
    status: 'active',
    targetSegment: 'existing',
    targetCount: 1250,
    budget: 500000,
    actualCost: 485000,
    startDate: '2024-03-01',
    endDate: '2024-05-31',
    createdBy: 'marketing-team',
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
    metrics: {
      sent: 1250,
      delivered: 1198,
      opened: 624,
      clicked: 187,
      converted: 23,
      revenue: 64400000,
      roi: 320,
    },
    content: {
      subject: '【期間限定】春の外壁塗装キャンペーン開始！最大20%OFF',
      body: `いつもお世話になっております。\n\n春の訪れとともに、お住まいのメンテナンスはいかがでしょうか？\n\nこの度、春の特別キャンペーンとして、外壁塗装工事を通常価格より最大20%OFFでご提供させていただきます。`,
      ctaText: '無料見積もりを申し込む',
      ctaUrl: 'https://example.com/estimate',
    },
    targeting: {
      area: ['東京都', '神奈川県', '千葉県', '埼玉県'],
      ageRange: { min: 35, max: 65 },
      tags: ['外壁塗装経験あり', '築10年以上', '戸建て住宅'],
    },
  },
  {
    id: 'C002',
    name: '梅雨前！無料屋根点検キャンペーン',
    description: '雨漏り対策として梅雨前の無料屋根点検を実施',
    type: 'sms',
    status: 'active',
    targetSegment: 'all',
    targetCount: 850,
    budget: 200000,
    actualCost: 165000,
    startDate: '2024-04-15',
    endDate: '2024-06-15',
    createdBy: 'marketing-team',
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-04-15T00:00:00Z',
    metrics: {
      sent: 850,
      delivered: 842,
      opened: 758,
      clicked: 134,
      converted: 19,
      revenue: 38000000,
      roi: 230,
    },
    content: {
      body: '【無料】梅雨前の屋根点検を実施中！雨漏り対策はお済みですか？専門スタッフが無料で点検いたします。',
      ctaText: '無料点検を予約する',
      ctaUrl: 'https://example.com/inspection',
    },
    targeting: {
      area: ['東京都', '神奈川県'],
      ageRange: { min: 30, max: 70 },
      tags: ['築15年以上', '戸建て住宅'],
    },
  },
  {
    id: 'C003',
    name: 'シニア世代応援リフォームフェア',
    description: 'バリアフリー工事を特別価格で提供するイベント',
    type: 'event',
    status: 'scheduled',
    targetSegment: 'custom',
    targetCount: 300,
    budget: 150000,
    actualCost: 0,
    startDate: '2024-06-01',
    endDate: '2024-06-30',
    createdBy: 'marketing-team',
    createdAt: '2024-05-01T00:00:00Z',
    updatedAt: '2024-05-01T00:00:00Z',
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
      subject: '65歳以上の方限定！バリアフリー工事が特別価格に',
      body: 'シニア世代の皆様が安心して暮らせる住まいづくりを応援します。',
      ctaText: 'イベントに申し込む',
      ctaUrl: 'https://example.com/senior-event',
    },
    targeting: {
      ageRange: { min: 65, max: 90 },
      tags: ['シニア世代', 'バリアフリー関心'],
    },
  },
];

interface UseCampaignsOptions {
  filter?: {
    status?: CampaignStatus[];
    type?: CampaignType[];
    search?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  };
  autoFetch?: boolean;
}

export function useCampaigns(options: UseCampaignsOptions = {}) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // フィルタリング関数
  const filterCampaigns = (
    campaigns: Campaign[],
    filter: UseCampaignsOptions['filter'],
  ) => {
    if (!filter) return campaigns;

    return campaigns.filter((campaign) => {
      // ステータスフィルタ
      if (filter.status && filter.status.length > 0) {
        if (!filter.status.includes(campaign.status)) return false;
      }

      // タイプフィルタ
      if (filter.type && filter.type.length > 0) {
        if (!filter.type.includes(campaign.type)) return false;
      }

      // 検索フィルタ
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        if (
          !campaign.name.toLowerCase().includes(searchLower) &&
          !campaign.description.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // 日付範囲フィルタ
      if (filter.dateRange) {
        const startDate = new Date(campaign.startDate);
        const filterStart = new Date(filter.dateRange.start);
        const filterEnd = new Date(filter.dateRange.end);
        if (startDate < filterStart || startDate > filterEnd) return false;
      }

      return true;
    });
  };

  // キャンペーン一覧取得
  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);

    try {
      // 実際の実装ではAPI呼び出し
      await new Promise((resolve) => setTimeout(resolve, 500)); // シミュレート

      const filtered = filterCampaigns(SAMPLE_CAMPAIGNS, options.filter);
      setCampaigns(filtered);
      setTotal(filtered.length);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'キャンペーンの取得に失敗しました',
      );
    } finally {
      setLoading(false);
    }
  };

  // キャンペーン作成
  const createCampaign = async (
    data: CreateCampaignDto,
  ): Promise<Campaign | null> => {
    setLoading(true);
    setError(null);

    try {
      // 実際の実装ではAPI呼び出し
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newCampaign: Campaign = {
        id: `C${Date.now()}`,
        ...data,
        status: 'draft',
        targetCount: 0,
        actualCost: 0,
        createdBy: 'current-user',
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

      // ローカルデータに追加（実際の実装では不要）
      SAMPLE_CAMPAIGNS.push(newCampaign);

      // リストを更新
      await fetchCampaigns();

      return newCampaign;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'キャンペーンの作成に失敗しました',
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // キャンペーン更新
  const updateCampaign = async (
    id: string,
    data: UpdateCampaignDto,
  ): Promise<Campaign | null> => {
    setLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // ローカルデータを更新（実際の実装では不要）
      const index = SAMPLE_CAMPAIGNS.findIndex((c) => c.id === id);
      if (index === -1) throw new Error('キャンペーンが見つかりません');

      SAMPLE_CAMPAIGNS[index] = {
        ...SAMPLE_CAMPAIGNS[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };

      const updatedCampaign = SAMPLE_CAMPAIGNS[index];

      // リストを更新
      await fetchCampaigns();

      return updatedCampaign;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'キャンペーンの更新に失敗しました',
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // キャンペーン削除
  const deleteCampaign = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // ローカルデータから削除（実際の実装では不要）
      const index = SAMPLE_CAMPAIGNS.findIndex((c) => c.id === id);
      if (index === -1) throw new Error('キャンペーンが見つかりません');

      SAMPLE_CAMPAIGNS.splice(index, 1);

      // リストを更新
      await fetchCampaigns();

      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'キャンペーンの削除に失敗しました',
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // IDでキャンペーンを取得
  const getCampaignById = (id: string): Campaign | undefined => {
    return campaigns.find((c) => c.id === id);
  };

  // 初回フェッチ
  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchCampaigns();
    }
  }, [options.filter?.status, options.filter?.type, options.filter?.search]);

  return {
    campaigns,
    loading,
    error,
    total,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    getCampaignById,
    refetch: fetchCampaigns,
  };
}
