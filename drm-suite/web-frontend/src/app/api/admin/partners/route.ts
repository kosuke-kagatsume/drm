import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 協力会社型定義
export interface Partner {
  id: string;
  tenantId: string;

  // 基本情報
  code: string; // 協力会社コード
  name: string; // 会社名
  nameKana?: string; // 会社名（カナ）
  category: string; // 業種カテゴリ（基礎工事、躯体工事、内装工事など）
  specialties: string[]; // 専門分野

  // 連絡先情報
  representativeName?: string; // 代表者名
  contactPerson?: string; // 担当者名
  email?: string;
  phone?: string;
  fax?: string;
  postalCode?: string;
  address?: string;

  // 取引条件
  paymentTerms?: string; // 支払条件
  bankInfo?: {
    bankName: string;
    branchName: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
  };

  // 評価情報
  rating: number; // 1-5の評価
  totalTransactions: number; // 累計取引件数
  totalAmount: number; // 累計取引金額
  lastTransactionDate?: string; // 最終取引日

  // パフォーマンス指標
  performance: {
    onTimeDeliveryRate: number; // 納期遵守率（%）
    qualityScore: number; // 品質スコア（1-5）
    costEfficiency: number; // コスト効率（1-5）
    communicationScore: number; // コミュニケーション（1-5）
    safetyRecord: number; // 安全記録（1-5）
  };

  // ステータス
  status: 'active' | 'inactive' | 'suspended' | 'blacklisted';

  // DW連携
  dwPartnerId?: string; // DW側の協力会社ID
  dwSyncStatus: 'not_synced' | 'synced' | 'error';

  // メタデータ
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy?: string;

  // メモ
  notes?: string;
}

// メモリ内データストア
let partners: Map<string, Partner[]> = new Map();

// 初期サンプルデータ
const initializeSampleData = () => {
  const demoTenantId = 'demo-tenant';

  const samplePartners: Partner[] = [
    {
      id: 'PTN-001',
      tenantId: demoTenantId,
      code: 'P001',
      name: '株式会社山田建設',
      nameKana: 'ヤマダケンセツ',
      category: '総合建設',
      specialties: ['基礎工事', '躯体工事', '土木工事'],
      representativeName: '山田太郎',
      contactPerson: '山田次郎',
      email: 'yamada@yamada-const.co.jp',
      phone: '03-1111-2222',
      fax: '03-1111-2223',
      postalCode: '100-0001',
      address: '東京都千代田区千代田1-1-1',
      paymentTerms: '月末締め翌月末払い',
      bankInfo: {
        bankName: 'みずほ銀行',
        branchName: '東京支店',
        accountType: '普通',
        accountNumber: '1234567',
        accountHolder: 'カ）ヤマダケンセツ',
      },
      rating: 5,
      totalTransactions: 45,
      totalAmount: 350000000,
      lastTransactionDate: '2024-07-01',
      performance: {
        onTimeDeliveryRate: 98,
        qualityScore: 5,
        costEfficiency: 4,
        communicationScore: 5,
        safetyRecord: 5,
      },
      status: 'active',
      dwPartnerId: 'DW-PTN-001',
      dwSyncStatus: 'synced',
      createdAt: '2023-01-15T10:00:00Z',
      createdBy: '管理者',
      updatedAt: '2024-07-01T15:00:00Z',
      notes: '信頼できるパートナー。大型案件対応可能。',
    },
    {
      id: 'PTN-002',
      tenantId: demoTenantId,
      code: 'P002',
      name: '佐藤リフォーム株式会社',
      nameKana: 'サトウリフォーム',
      category: 'リフォーム・改修',
      specialties: ['内装工事', '外装工事', 'リノベーション'],
      representativeName: '佐藤一郎',
      contactPerson: '佐藤次郎',
      email: 'sato@sato-reform.co.jp',
      phone: '03-3333-4444',
      fax: '03-3333-4445',
      postalCode: '150-0001',
      address: '東京都渋谷区神宮前1-1-1',
      paymentTerms: '月末締め翌月末払い',
      bankInfo: {
        bankName: '三井住友銀行',
        branchName: '渋谷支店',
        accountType: '普通',
        accountNumber: '7654321',
        accountHolder: 'カ）サトウリフォーム',
      },
      rating: 4,
      totalTransactions: 32,
      totalAmount: 180000000,
      lastTransactionDate: '2024-07-15',
      performance: {
        onTimeDeliveryRate: 95,
        qualityScore: 4,
        costEfficiency: 5,
        communicationScore: 4,
        safetyRecord: 4,
      },
      status: 'active',
      dwPartnerId: 'DW-PTN-002',
      dwSyncStatus: 'synced',
      createdAt: '2023-03-20T11:00:00Z',
      createdBy: '管理者',
      updatedAt: '2024-07-15T14:00:00Z',
      notes: 'リフォーム専門。細かい対応が得意。',
    },
    {
      id: 'PTN-003',
      tenantId: demoTenantId,
      code: 'P003',
      name: '鈴木電気工事',
      nameKana: 'スズキデンキコウジ',
      category: '電気設備',
      specialties: ['電気工事', '配線工事', '照明設備'],
      representativeName: '鈴木花子',
      contactPerson: '鈴木太郎',
      email: 'suzuki@suzuki-elec.co.jp',
      phone: '03-5555-6666',
      postalCode: '160-0001',
      address: '東京都新宿区新宿1-1-1',
      paymentTerms: '月末締め翌月末払い',
      rating: 4,
      totalTransactions: 28,
      totalAmount: 95000000,
      lastTransactionDate: '2024-06-30',
      performance: {
        onTimeDeliveryRate: 92,
        qualityScore: 4,
        costEfficiency: 4,
        communicationScore: 5,
        safetyRecord: 5,
      },
      status: 'active',
      dwSyncStatus: 'not_synced',
      createdAt: '2023-05-10T09:00:00Z',
      createdBy: '管理者',
      updatedAt: '2024-06-30T16:00:00Z',
      notes: '電気工事専門。迅速な対応が強み。',
    },
    {
      id: 'PTN-004',
      tenantId: demoTenantId,
      code: 'P004',
      name: '田中設備工業株式会社',
      nameKana: 'タナカセツビコウギョウ',
      category: '設備工事',
      specialties: ['配管工事', '給排水設備', '空調設備'],
      representativeName: '田中健一',
      contactPerson: '田中美咲',
      email: 'tanaka@tanaka-setsubi.co.jp',
      phone: '03-7777-8888',
      postalCode: '170-0001',
      address: '東京都豊島区東池袋1-1-1',
      paymentTerms: '月末締め翌月末払い',
      rating: 5,
      totalTransactions: 38,
      totalAmount: 220000000,
      lastTransactionDate: '2024-07-10',
      performance: {
        onTimeDeliveryRate: 97,
        qualityScore: 5,
        costEfficiency: 4,
        communicationScore: 5,
        safetyRecord: 5,
      },
      status: 'active',
      dwPartnerId: 'DW-PTN-004',
      dwSyncStatus: 'synced',
      createdAt: '2023-02-01T10:00:00Z',
      createdBy: '管理者',
      updatedAt: '2024-07-10T13:00:00Z',
      notes: '設備工事のエキスパート。高品質な施工。',
    },
    {
      id: 'PTN-005',
      tenantId: demoTenantId,
      code: 'P005',
      name: '伊藤塗装',
      nameKana: 'イトウトソウ',
      category: '塗装工事',
      specialties: ['外壁塗装', '内装塗装', '防水工事'],
      representativeName: '伊藤隆',
      contactPerson: '伊藤隆',
      email: 'ito@ito-paint.co.jp',
      phone: '03-9999-0000',
      postalCode: '140-0001',
      address: '東京都品川区北品川1-1-1',
      paymentTerms: '月末締め翌月末払い',
      rating: 3,
      totalTransactions: 15,
      totalAmount: 45000000,
      lastTransactionDate: '2024-05-20',
      performance: {
        onTimeDeliveryRate: 88,
        qualityScore: 3,
        costEfficiency: 4,
        communicationScore: 3,
        safetyRecord: 4,
      },
      status: 'active',
      dwSyncStatus: 'not_synced',
      createdAt: '2023-08-15T14:00:00Z',
      createdBy: '管理者',
      updatedAt: '2024-05-20T11:00:00Z',
      notes: '塗装専門。価格は安いが品質にばらつきあり。',
    },
  ];

  partners.set(demoTenantId, samplePartners);
};

// 初期化実行
initializeSampleData();

// テナントIDを取得する関数
function getTenantIdFromRequest(request: NextRequest): string {
  const cookieStore = cookies();
  const tenantId = cookieStore.get('tenantId')?.value || 'demo-tenant';
  return tenantId;
}

// GET: 協力会社一覧取得
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const tenantPartners = partners.get(tenantId) || [];

    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('id');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const minRating = searchParams.get('minRating');

    let filteredPartners = [...tenantPartners];

    // 協力会社ID指定
    if (partnerId) {
      const partner = filteredPartners.find(p => p.id === partnerId);
      if (!partner) {
        return NextResponse.json(
          { success: false, error: 'Partner not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        partner,
      });
    }

    // カテゴリフィルタ
    if (category) {
      filteredPartners = filteredPartners.filter(p => p.category === category);
    }

    // ステータスフィルタ
    if (status) {
      filteredPartners = filteredPartners.filter(p => p.status === status);
    }

    // 評価フィルタ
    if (minRating) {
      const rating = parseInt(minRating);
      filteredPartners = filteredPartners.filter(p => p.rating >= rating);
    }

    return NextResponse.json({
      success: true,
      partners: filteredPartners,
      total: filteredPartners.length,
    });
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partners' },
      { status: 500 }
    );
  }
}

// POST: 新規協力会社作成
export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();

    const now = new Date().toISOString();
    const partnerCode = `P${String(Date.now()).slice(-6)}`;

    const newPartner: Partner = {
      id: `PTN-${Date.now()}`,
      tenantId,
      code: partnerCode,
      rating: 3,
      totalTransactions: 0,
      totalAmount: 0,
      performance: {
        onTimeDeliveryRate: 0,
        qualityScore: 3,
        costEfficiency: 3,
        communicationScore: 3,
        safetyRecord: 3,
      },
      status: 'active',
      dwSyncStatus: 'not_synced',
      createdAt: now,
      updatedAt: now,
      ...body,
    };

    const tenantPartners = partners.get(tenantId) || [];
    tenantPartners.push(newPartner);
    partners.set(tenantId, tenantPartners);

    return NextResponse.json({
      success: true,
      partner: newPartner,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create partner' },
      { status: 500 }
    );
  }
}

// PUT: 協力会社更新
export async function PUT(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();
    const { id, ...updates } = body;

    const tenantPartners = partners.get(tenantId) || [];
    const partnerIndex = tenantPartners.findIndex(p => p.id === id);

    if (partnerIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      );
    }

    const updatedPartner = {
      ...tenantPartners[partnerIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    tenantPartners[partnerIndex] = updatedPartner;
    partners.set(tenantId, tenantPartners);

    return NextResponse.json({
      success: true,
      partner: updatedPartner,
    });
  } catch (error) {
    console.error('Error updating partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update partner' },
      { status: 500 }
    );
  }
}

// DELETE: 協力会社削除
export async function DELETE(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('id');

    if (!partnerId) {
      return NextResponse.json(
        { success: false, error: 'Partner ID is required' },
        { status: 400 }
      );
    }

    const tenantPartners = partners.get(tenantId) || [];
    const filteredPartners = tenantPartners.filter(p => p.id !== partnerId);

    if (filteredPartners.length === tenantPartners.length) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      );
    }

    partners.set(tenantId, filteredPartners);

    return NextResponse.json({
      success: true,
      message: 'Partner deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete partner' },
      { status: 500 }
    );
  }
}
