import { NextRequest, NextResponse } from 'next/server';
import type { Customer, CustomerFilter } from '@/types/customer';

// モックデータ（本番環境ではDBから取得）
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: '山田太郎',
    nameKana: 'やまだたろう',
    company: '山田工務店',
    dateOfBirth: '1975-05-15',
    gender: 'male',

    // 連絡先
    phones: [
      { id: 'p1', number: '090-1234-5678', type: 'mobile', isPrimary: true },
      { id: 'p2', number: '03-1234-5678', type: 'work', isPrimary: false },
    ],
    emails: [
      { id: 'e1', email: 'yamada@example.com', type: 'work', isPrimary: true },
    ],

    // 住所
    currentAddress: {
      postalCode: '123-4567',
      prefecture: '東京都',
      city: '渋谷区',
      street: '神南1-2-3',
      building: 'ABCビル5F',
      fullAddress: '東京都渋谷区神南1-2-3 ABCビル5F',
    },

    // 後方互換性
    email: 'yamada@example.com',
    phone: '090-1234-5678',
    address: '東京都渋谷区神南1-2-3 ABCビル5F',

    // 家族関係
    familyRelations: [
      {
        id: 'f1',
        relatedCustomerId: '2',
        relatedCustomerName: '山田花子',
        relationType: 'spouse',
        relationName: '妻',
      },
    ],

    // 顧客分類
    status: 'customer',
    tags: ['新築', 'VIP'],
    assignee: 'user-1',
    notes: '大型案件の可能性あり',

    // 営業関連
    lastContact: '2025-09-28',
    nextAction: '設計図の提案',
    nextActionDate: '2025-10-05',
    priority: 5,
    value: 30000000,
    source: 'referral',
    leadScore: 85,

    // 紹介関係
    referredBy: '10',
    referredByName: '佐藤次郎',

    // メタデータ
    createdAt: '2025-08-01T09:00:00Z',
    updatedAt: '2025-09-28T14:30:00Z',
    createdBy: 'user-1',
    companyId: 'company-1',

    // 関連データカウント
    propertiesCount: 2,
    estimatesCount: 3,
    contractsCount: 1,
    activitiesCount: 12,
    totalRevenue: 28000000,
    lastEstimateDate: '2025-09-20',
    lastContractDate: '2025-09-15',
  },
];

/**
 * GET /api/customers - 顧客一覧取得
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // フィルター条件の取得
    const status = searchParams.get('status')?.split(',');
    const assignee = searchParams.get('assignee')?.split(',');
    const tags = searchParams.get('tags')?.split(',');
    const source = searchParams.get('source')?.split(',');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') as CustomerFilter['sortBy'] || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc';
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');

    let filtered = [...mockCustomers];

    // ステータスフィルター
    if (status && status.length > 0) {
      filtered = filtered.filter(c => status.includes(c.status));
    }

    // 担当者フィルター
    if (assignee && assignee.length > 0) {
      filtered = filtered.filter(c => assignee.includes(c.assignee));
    }

    // タグフィルター
    if (tags && tags.length > 0) {
      filtered = filtered.filter(c =>
        tags.some(tag => c.tags.includes(tag))
      );
    }

    // 獲得チャネルフィルター
    if (source && source.length > 0) {
      filtered = filtered.filter(c => source.includes(c.source));
    }

    // テキスト検索
    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.nameKana?.toLowerCase().includes(query) ||
        c.company?.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.phone.includes(query)
      );
    }

    // ソート
    filtered.sort((a, b) => {
      let aVal: any = a[sortBy as keyof Customer];
      let bVal: any = b[sortBy as keyof Customer];

      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal, 'ja')
          : bVal.localeCompare(aVal, 'ja');
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // ページネーション
    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: paginated,
      pagination: {
        total,
        offset,
        limit,
        hasMore: offset + limit < total,
      },
    });

  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/customers - 顧客新規作成
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 必須フィールドのバリデーション
    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and phone are required' },
        { status: 400 }
      );
    }

    // 新規顧客データの作成
    const newCustomer: Customer = {
      id: `customer-${Date.now()}`,
      name: body.name,
      nameKana: body.nameKana,
      company: body.company,
      dateOfBirth: body.dateOfBirth,
      gender: body.gender,

      // 連絡先
      phones: body.phones || [{
        id: `p-${Date.now()}`,
        number: body.phone,
        type: 'mobile',
        isPrimary: true,
      }],
      emails: body.emails || [{
        id: `e-${Date.now()}`,
        email: body.email,
        type: 'personal',
        isPrimary: true,
      }],

      // 住所
      currentAddress: body.currentAddress || {
        prefecture: '',
        city: '',
        street: '',
      },
      familyHomeAddress: body.familyHomeAddress,
      workAddress: body.workAddress,

      // 後方互換性
      email: body.email,
      phone: body.phone,
      address: body.currentAddress?.fullAddress,

      // 家族関係
      familyRelations: body.familyRelations || [],

      // 顧客分類
      status: body.status || 'lead',
      tags: body.tags || [],
      assignee: body.assignee,
      notes: body.notes,

      // 営業関連
      priority: body.priority || 3,
      value: body.value || 0,
      source: body.source || 'other',
      leadScore: body.leadScore,

      // メタデータ
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user-id', // TODO: 実際のユーザーIDを取得
      companyId: 'company-1', // TODO: テナントIDを取得

      // カウント初期値
      propertiesCount: 0,
      estimatesCount: 0,
      contractsCount: 0,
      activitiesCount: 0,
      totalRevenue: 0,
    };

    // TODO: DBに保存
    mockCustomers.push(newCustomer);

    return NextResponse.json({
      success: true,
      data: newCustomer,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
