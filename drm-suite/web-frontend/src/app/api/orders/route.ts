import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 発注書型定義
export interface Order {
  id: string;
  tenantId: string;

  // ハイブリッドID（DW連携用）
  drmOrderId: string; // DRM側のID
  dwOrderId?: string; // DW側のID（連携後に設定）

  // 契約との紐付け
  contractId: string;
  contractNo: string;
  projectName: string;

  // 協力会社情報
  partnerId: string;
  partnerName: string;
  partnerCompany: string;
  partnerContact?: string;
  partnerEmail?: string;
  partnerPhone?: string;

  // 発注内容
  orderNo: string;
  orderDate: string;
  workItems: {
    id: string;
    category: string;
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    amount: number;
    notes?: string;
  }[];

  // 金額
  subtotal: number;
  taxAmount: number;
  totalAmount: number;

  // 工期
  startDate: string;
  endDate: string;
  duration: number;

  // 支払条件
  paymentTerms: string;

  // ステータス管理
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'sent_to_dw' | 'in_progress' | 'completed' | 'cancelled';

  // 7日期限管理
  contractSignedDate: string; // 契約締結日
  orderDeadline: string; // 発注期限（契約締結日+7日）
  isOverdue: boolean; // 期限超過フラグ
  daysUntilDeadline: number; // 期限までの残日数

  // 承認フロー
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvalFlowId?: string;
  approvedBy?: string;
  approvedAt?: string;

  // DW連携
  dwSyncStatus: 'not_synced' | 'pending' | 'synced' | 'error';
  dwSyncedAt?: string;
  dwSyncError?: string;
  lastSyncedAt?: string;
  lastSyncError?: string;
  dwLastUpdatedAt?: string;

  // DWから受信した原価情報
  actualCosts?: {
    laborCost: number;
    materialCost: number;
    equipmentCost: number;
    otherCost: number;
    totalCost: number;
  };

  // 工事進捗情報（DWから受信）
  workProgress?: {
    status: 'not_started' | 'in_progress' | 'completed';
    progressRate: number; // 0-100
    startDate?: string;
    completedDate?: string;
  };

  // 原価分析
  costAnalysis?: {
    budgetAmount: number;
    actualAmount: number;
    variance: number; // 予算 - 実績
    varianceRate: number; // (予算 - 実績) / 予算 * 100
    isOverBudget: boolean;
  };

  // 原価詳細
  costDetails?: Array<{
    category: string;
    itemName: string;
    budgetAmount: number;
    actualAmount: number;
    variance: number;
  }>;

  // 担当者
  manager: string;
  managerId?: string;

  // メタデータ
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy?: string;

  // メモ
  notes?: string;
}

// メモリ内データストア
let orders: Map<string, Order[]> = new Map();

// 初期サンプルデータ
const initializeSampleData = () => {
  const demoTenantId = 'demo-tenant';

  // サンプル発注データ
  const sampleOrders: Order[] = [
    {
      id: 'ORD-2024-001',
      tenantId: demoTenantId,
      drmOrderId: 'DRM-ORD-2024-001',
      dwOrderId: 'DW-ORD-2024-001',
      contractId: 'CON-2024-001',
      contractNo: 'CON-2024-001',
      projectName: '田中様邸新築工事',
      partnerId: 'PTN-001',
      partnerName: '山田建設',
      partnerCompany: '株式会社山田建設',
      partnerContact: '山田太郎',
      partnerEmail: 'yamada@yamada-const.co.jp',
      partnerPhone: '03-1111-2222',
      orderNo: 'ORD-2024-001',
      orderDate: '2024-07-03',
      workItems: [
        {
          id: 'WI-001',
          category: '基礎工事',
          name: 'べた基礎工事一式',
          quantity: 1,
          unit: '式',
          unitPrice: 8000000,
          amount: 8000000,
          notes: '',
        },
        {
          id: 'WI-002',
          category: '躯体工事',
          name: '木造軸組工事',
          quantity: 1,
          unit: '式',
          unitPrice: 12000000,
          amount: 12000000,
          notes: '',
        },
      ],
      subtotal: 20000000,
      taxAmount: 2000000,
      totalAmount: 22000000,
      startDate: '2024-07-15',
      endDate: '2024-10-15',
      duration: 92,
      paymentTerms: '月末締め翌月末払い',
      status: 'sent_to_dw',
      contractSignedDate: '2024-07-01',
      orderDeadline: '2024-07-08',
      isOverdue: false,
      daysUntilDeadline: 0,
      approvalStatus: 'approved',
      approvedBy: '鈴木部長',
      approvedAt: '2024-07-02T15:00:00Z',
      dwSyncStatus: 'synced',
      dwSyncedAt: '2024-07-03T10:00:00Z',
      manager: '山田次郎',
      managerId: 'USR-001',
      createdAt: '2024-07-02T09:00:00Z',
      createdBy: '山田次郎',
      updatedAt: '2024-07-03T10:00:00Z',
      notes: 'DW連携済み',
    },
    {
      id: 'ORD-2024-002',
      tenantId: demoTenantId,
      drmOrderId: 'DRM-ORD-2024-002',
      contractId: 'CON-2024-002',
      contractNo: 'CON-2024-002',
      projectName: '山田ビル改修工事',
      partnerId: 'PTN-002',
      partnerName: '佐藤リフォーム',
      partnerCompany: '佐藤リフォーム株式会社',
      partnerContact: '佐藤次郎',
      partnerEmail: 'sato@sato-reform.co.jp',
      partnerPhone: '03-3333-4444',
      orderNo: 'ORD-2024-002',
      orderDate: '2024-07-20',
      workItems: [
        {
          id: 'WI-003',
          category: '外装工事',
          name: '外壁塗装工事',
          quantity: 500,
          unit: '㎡',
          unitPrice: 15000,
          amount: 7500000,
          notes: '',
        },
        {
          id: 'WI-004',
          category: '内装工事',
          name: '内装リフォーム工事',
          quantity: 1,
          unit: '式',
          unitPrice: 25000000,
          amount: 25000000,
          notes: '',
        },
      ],
      subtotal: 32500000,
      taxAmount: 3250000,
      totalAmount: 35750000,
      startDate: '2024-08-01',
      endDate: '2024-12-31',
      duration: 152,
      paymentTerms: '月末締め翌月末払い',
      status: 'approved',
      contractSignedDate: '2024-07-15',
      orderDeadline: '2024-07-22',
      isOverdue: false,
      daysUntilDeadline: 2,
      approvalStatus: 'approved',
      approvedBy: '鈴木部長',
      approvedAt: '2024-07-19T16:00:00Z',
      dwSyncStatus: 'not_synced',
      manager: '佐藤健一',
      managerId: 'USR-002',
      createdAt: '2024-07-18T10:00:00Z',
      createdBy: '佐藤健一',
      updatedAt: '2024-07-20T14:00:00Z',
      notes: '承認済み。DW連携待ち',
    },
  ];

  orders.set(demoTenantId, sampleOrders);
};

// 初期化実行
initializeSampleData();

// テナントIDを取得する関数
function getTenantIdFromRequest(request: NextRequest): string {
  const cookieStore = cookies();
  const tenantId = cookieStore.get('tenantId')?.value || 'demo-tenant';
  return tenantId;
}

// 発注番号を生成
function generateOrderNo(tenantId: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${year}${month}-${random}`;
}

// DRM発注IDを生成
function generateDrmOrderId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `DRM-ORD-${year}${month}-${random}`;
}

// 発注期限を計算（契約締結日+7日）
function calculateOrderDeadline(contractSignedDate: string): string {
  const signedDate = new Date(contractSignedDate);
  const deadline = new Date(signedDate);
  deadline.setDate(deadline.getDate() + 7);
  return deadline.toISOString().split('T')[0];
}

// 期限までの残日数を計算
function calculateDaysUntilDeadline(deadline: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  const diff = deadlineDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// GET: 発注一覧取得
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const tenantOrders = orders.get(tenantId) || [];

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    const drmOrderId = searchParams.get('drmOrderId');
    const dwOrderId = searchParams.get('dwOrderId');
    const contractId = searchParams.get('contractId');
    const status = searchParams.get('status');
    const partnerId = searchParams.get('partnerId');

    let filteredOrders = [...tenantOrders];

    // 発注ID指定（id, drmOrderId, dwOrderIdのいずれか）
    if (orderId || drmOrderId || dwOrderId) {
      let order;
      if (orderId) {
        order = filteredOrders.find(o => o.id === orderId);
      } else if (drmOrderId) {
        order = filteredOrders.find(o => o.drmOrderId === drmOrderId);
      } else if (dwOrderId) {
        order = filteredOrders.find(o => o.dwOrderId === dwOrderId);
      }

      if (!order) {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        );
      }

      // 期限情報を更新
      const updatedOrder = {
        ...order,
        daysUntilDeadline: calculateDaysUntilDeadline(order.orderDeadline),
        isOverdue: calculateDaysUntilDeadline(order.orderDeadline) < 0,
      };

      return NextResponse.json({
        success: true,
        order: updatedOrder,
      });
    }

    // 契約IDフィルタ
    if (contractId) {
      filteredOrders = filteredOrders.filter(o => o.contractId === contractId);
    }

    // ステータスフィルタ
    if (status) {
      filteredOrders = filteredOrders.filter(o => o.status === status);
    }

    // 協力会社フィルタ
    if (partnerId) {
      filteredOrders = filteredOrders.filter(o => o.partnerId === partnerId);
    }

    // 期限情報を更新
    const updatedOrders = filteredOrders.map(order => ({
      ...order,
      daysUntilDeadline: calculateDaysUntilDeadline(order.orderDeadline),
      isOverdue: calculateDaysUntilDeadline(order.orderDeadline) < 0,
    }));

    return NextResponse.json({
      success: true,
      orders: updatedOrders,
      total: updatedOrders.length,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST: 新規発注作成
export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();

    const now = new Date().toISOString();
    const orderNo = generateOrderNo(tenantId);
    const drmOrderId = generateDrmOrderId();
    const orderDeadline = calculateOrderDeadline(body.contractSignedDate);
    const daysUntilDeadline = calculateDaysUntilDeadline(orderDeadline);

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      tenantId,
      drmOrderId,
      orderNo,
      orderDeadline,
      daysUntilDeadline,
      isOverdue: daysUntilDeadline < 0,
      dwSyncStatus: 'not_synced',
      createdAt: now,
      updatedAt: now,
      ...body,
    };

    const tenantOrders = orders.get(tenantId) || [];
    tenantOrders.push(newOrder);
    orders.set(tenantId, tenantOrders);

    // 🔥 工事台帳の予算を自動更新
    if (newOrder.contractId) {
      try {
        await fetch(`${request.nextUrl.origin}/api/construction-ledgers/update-budget`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: `tenantId=${tenantId}`,
          },
          body: JSON.stringify({
            contractId: newOrder.contractId,
            orderId: newOrder.id,
            orderNo: newOrder.orderNo,
            partnerName: newOrder.partnerName,
            orderAmount: newOrder.totalAmount || newOrder.subtotal || 0,
            orderItems: newOrder.workItems || [],
            operation: 'add',
          }),
        });

        console.log(`✅ 工事台帳の予算を更新しました (発注: ${newOrder.orderNo})`);
      } catch (budgetError) {
        console.error('⚠️ 工事台帳の予算更新に失敗しました:', budgetError);
        // 予算更新に失敗してもエラーにはしない（発注自体は成功）
      }
    }

    return NextResponse.json({
      success: true,
      order: newOrder,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// PUT: 発注更新
export async function PUT(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();
    const { id, ...updates } = body;

    const tenantOrders = orders.get(tenantId) || [];
    const orderIndex = tenantOrders.findIndex(o => o.id === id);

    if (orderIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const previousOrder = tenantOrders[orderIndex];
    const updatedOrder = {
      ...previousOrder,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // 期限情報を再計算
    if (updates.contractSignedDate) {
      updatedOrder.orderDeadline = calculateOrderDeadline(updates.contractSignedDate);
    }
    updatedOrder.daysUntilDeadline = calculateDaysUntilDeadline(updatedOrder.orderDeadline);
    updatedOrder.isOverdue = updatedOrder.daysUntilDeadline < 0;

    tenantOrders[orderIndex] = updatedOrder;
    orders.set(tenantId, tenantOrders);

    // 🔥 ステータス変更時に工事台帳の予算を更新
    if (updatedOrder.contractId && previousOrder.status !== updatedOrder.status) {
      try {
        let operation = null;

        // キャンセルされた場合: 予算から減算
        if (updatedOrder.status === 'cancelled' && previousOrder.status !== 'cancelled') {
          operation = 'subtract';
          console.log(`🗑️ 発注がキャンセルされました - 予算から減算します (発注: ${updatedOrder.orderNo})`);
        }
        // 下書きから承認済みに変更された場合は、既にPOSTで加算済みなのでスキップ

        if (operation) {
          await fetch(`${request.nextUrl.origin}/api/construction-ledgers/update-budget`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Cookie: `tenantId=${tenantId}`,
            },
            body: JSON.stringify({
              contractId: updatedOrder.contractId,
              orderId: updatedOrder.id,
              orderNo: updatedOrder.orderNo,
              partnerName: updatedOrder.partnerName,
              orderAmount: updatedOrder.totalAmount || updatedOrder.subtotal || 0,
              orderItems: updatedOrder.workItems || [],
              operation: operation,
            }),
          });

          console.log(`✅ 工事台帳の予算を更新しました (${operation})`);
        }
      } catch (budgetError) {
        console.error('⚠️ 工事台帳の予算更新に失敗しました:', budgetError);
        // 予算更新に失敗してもエラーにはしない
      }
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// DELETE: 発注削除
export async function DELETE(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const tenantOrders = orders.get(tenantId) || [];
    const filteredOrders = tenantOrders.filter(o => o.id !== orderId);

    if (filteredOrders.length === tenantOrders.length) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    orders.set(tenantId, filteredOrders);

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
