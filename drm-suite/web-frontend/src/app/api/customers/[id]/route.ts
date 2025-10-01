import { NextRequest, NextResponse } from 'next/server';
import type { Customer } from '@/types/customer';

/**
 * GET /api/customers/[id] - 顧客詳細取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: DBから取得
    const mockCustomer: Customer = {
      id: params.id,
      name: '山田太郎',
      nameKana: 'やまだたろう',
      company: '山田工務店',
      dateOfBirth: '1975-05-15',
      gender: 'male',

      phones: [
        { id: 'p1', number: '090-1234-5678', type: 'mobile', isPrimary: true },
        { id: 'p2', number: '03-1234-5678', type: 'work', isPrimary: false },
      ],
      emails: [
        { id: 'e1', email: 'yamada@example.com', type: 'work', isPrimary: true },
      ],

      currentAddress: {
        postalCode: '123-4567',
        prefecture: '東京都',
        city: '渋谷区',
        street: '神南1-2-3',
        building: 'ABCビル5F',
        fullAddress: '東京都渋谷区神南1-2-3 ABCビル5F',
      },

      email: 'yamada@example.com',
      phone: '090-1234-5678',
      address: '東京都渋谷区神南1-2-3 ABCビル5F',

      familyRelations: [],
      status: 'customer',
      tags: ['新築', 'VIP'],
      assignee: 'user-1',
      notes: '大型案件の可能性あり',

      priority: 5,
      value: 30000000,
      source: 'referral',
      leadScore: 85,

      createdAt: '2025-08-01T09:00:00Z',
      updatedAt: '2025-09-28T14:30:00Z',
      createdBy: 'user-1',
      companyId: 'company-1',

      propertiesCount: 2,
      estimatesCount: 3,
      contractsCount: 1,
      activitiesCount: 12,
      totalRevenue: 28000000,
      lastEstimateDate: '2025-09-20',
      lastContractDate: '2025-09-15',
    };

    if (!mockCustomer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: mockCustomer,
    });

  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/customers/[id] - 顧客情報更新
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // TODO: DBで更新
    const updatedCustomer: Customer = {
      ...body,
      id: params.id,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: updatedCustomer,
    });

  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/customers/[id] - 顧客削除
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: DBから削除（論理削除推奨）

    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
