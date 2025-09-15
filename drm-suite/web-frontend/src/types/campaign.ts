// キャンペーン関連の型定義

export type CampaignStatus =
  | 'draft' // 下書き
  | 'scheduled' // 予約済み
  | 'active' // 実施中
  | 'paused' // 一時停止
  | 'completed' // 完了
  | 'cancelled'; // キャンセル

export type CampaignType =
  | 'email' // メールキャンペーン
  | 'sms' // SMS
  | 'line' // LINE
  | 'dm' // ダイレクトメール
  | 'web' // Web広告
  | 'event' // イベント
  | 'other'; // その他

export type TargetSegment =
  | 'all' // 全顧客
  | 'new' // 新規顧客
  | 'existing' // 既存顧客
  | 'dormant' // 休眠顧客
  | 'vip' // VIP顧客
  | 'custom'; // カスタムセグメント

export interface Campaign {
  id: string;
  name: string;
  description: string;
  type: CampaignType;
  status: CampaignStatus;
  targetSegment: TargetSegment;
  targetCount: number;
  budget: number;
  actualCost: number;
  startDate: string;
  endDate: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;

  // パフォーマンス指標
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    revenue: number;
    roi: number;
  };

  // キャンペーン内容
  content: {
    subject?: string;
    body?: string;
    imageUrl?: string;
    ctaText?: string;
    ctaUrl?: string;
    template?: string;
  };

  // ターゲティング詳細
  targeting?: {
    area?: string[];
    ageRange?: { min: number; max: number };
    tags?: string[];
    conditions?: Array<{
      field: string;
      operator: 'equals' | 'contains' | 'gt' | 'lt' | 'between';
      value: string | number | boolean;
    }>;
  };

  // スケジュール設定
  schedule?: {
    sendTime?: string;
    timezone?: string;
    recurring?: boolean;
    frequency?: 'daily' | 'weekly' | 'monthly';
  };
}

export interface CreateCampaignDto {
  name: string;
  description: string;
  type: CampaignType;
  targetSegment: TargetSegment;
  budget: number;
  startDate: string;
  endDate: string;
  content: Campaign['content'];
  targeting?: Campaign['targeting'];
  schedule?: Campaign['schedule'];
}

export interface UpdateCampaignDto extends Partial<CreateCampaignDto> {
  status?: CampaignStatus;
}
