import { NextRequest, NextResponse } from 'next/server';
import type { Property } from '@/types/customer';

// モックデータ
const mockProperties: Record<string, Property[]> = {
  '1': [
    {
      id: 'prop-1',
      customerId: '1',
      name: '山田様邸新築工事',
      address: {
        postalCode: '123-4567',
        prefecture: '東京都',
        city: '世田谷区',
        street: '成城1-2-3',
        fullAddress: '東京都世田谷区成城1-2-3',
      },
      propertyType: 'newBuild',

      land: {
        ownership: 'owned',
        landUse: '宅地',
        area: 180.5,
        areaInTsubo: 54.6,
        soilCondition: '良好',
      },

      building: {
        structure: 'wood',
        floors: 2,
        totalFloorArea: 120.5,
      },

      desiredBudget: 35000000,
      scheduledStartDate: '2025-11-01',
      scheduledCompletionDate: '2026-05-31',

      estimateIds: ['est-1', 'est-2'],
      contractId: 'cont-1',
      status: 'contracted',

      createdAt: '2025-09-01T10:00:00Z',
      updatedAt: '2025-09-28T15:00:00Z',
      createdBy: 'user-1',
      notes: '南向き、日当たり良好。設計変更の可能性あり。',
    },
    {
      id: 'prop-2',
      customerId: '1',
      name: '山田様実家リフォーム',
      address: {
        prefecture: '神奈川県',
        city: '横浜市青葉区',
        street: '美しが丘2-3-4',
        fullAddress: '神奈川県横浜市青葉区美しが丘2-3-4',
      },
      propertyType: 'renovation',

      land: {
        ownership: 'owned',
        area: 150,
        areaInTsubo: 45.4,
      },

      building: {
        structure: 'wood',
        floors: 2,
        totalFloorArea: 95,
        age: 28,
      },

      desiredBudget: 12000000,
      scheduledStartDate: '2026-02-01',
      scheduledCompletionDate: '2026-04-30',

      estimateIds: ['est-3'],
      status: 'estimating',

      createdAt: '2025-09-15T14:00:00Z',
      updatedAt: '2025-09-28T16:00:00Z',
      createdBy: 'user-1',
      notes: '水回り全面改修、耐震補強も検討中。',
    },
  ],
};

/**
 * GET /api/customers/[id]/properties - 顧客の物件一覧取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const properties = mockProperties[params.id] || [];

    return NextResponse.json({
      success: true,
      data: properties,
      count: properties.length,
    });

  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/customers/[id]/properties - 物件新規登録
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // 必須フィールドのバリデーション
    if (!body.address || !body.propertyType) {
      return NextResponse.json(
        { success: false, error: 'Address and propertyType are required' },
        { status: 400 }
      );
    }

    const newProperty: Property = {
      id: `prop-${Date.now()}`,
      customerId: params.id,
      name: body.name,
      address: body.address,
      propertyType: body.propertyType,

      land: body.land || { ownership: 'undecided' },
      building: body.building || {},

      desiredBudget: body.desiredBudget,
      scheduledStartDate: body.scheduledStartDate,
      scheduledCompletionDate: body.scheduledCompletionDate,

      estimateIds: [],
      status: 'planning',

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user-id', // TODO: 実際のユーザーID
      notes: body.notes,
    };

    // TODO: DBに保存
    if (!mockProperties[params.id]) {
      mockProperties[params.id] = [];
    }
    mockProperties[params.id].push(newProperty);

    return NextResponse.json({
      success: true,
      data: newProperty,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create property' },
      { status: 500 }
    );
  }
}
