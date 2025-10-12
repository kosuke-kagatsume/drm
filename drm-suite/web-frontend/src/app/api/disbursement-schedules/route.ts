import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 支払予定の型定義
export interface DisbursementSchedule {
  id: string;
  tenantId: string;

  // 発注との紐付け
  orderId: string;
  orderNo: string;

  // 協力会社情報
  partnerId: string;
  partnerName: string;
  partnerCompany: string;

  // 支払予定情報
  scheduledDate: string; // 支払予定日
  amount: number; // 支払予定額
  paymentMethod: string; // '銀行振込', '手形', '小切手', '現金'

  // ステータス
  status: 'scheduled' | 'approved' | 'paid' | 'overdue' | 'cancelled';

  // 実績情報
  actualDisbursementId?: string; // 実際の支払記録ID
  actualPaymentDate?: string;
  actualAmount?: number;

  // アラート情報
  alertLevel?: 'none' | 'warning' | 'danger' | 'critical';
  alertMessage?: string;
  daysUntilDue?: number;

  // 承認情報（高額支払いの場合）
  requiresApproval?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;

  // 振込先情報
  bankInfo?: {
    bankName: string;
    branchName: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
  };

  // メモ
  notes?: string;

  // メタデータ
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// メモリ内データストア
let schedules: Map<string, DisbursementSchedule[]> = new Map();

// 初期サンプルデータ
const initializeSampleData = () => {
  const demoTenantId = 'demo-tenant';

  const today = new Date();
  const sampleSchedules: DisbursementSchedule[] = [
    // 過去の支払済み
    {
      id: 'DIS-SCH-2024-001',
      tenantId: demoTenantId,
      orderId: 'ORD-2024-001',
      orderNo: 'ORD-2024-001',
      partnerId: 'PARTNER-001',
      partnerName: '田中 一郎',
      partnerCompany: '田中電気工事',
      scheduledDate: '2024-10-05',
      amount: 2500000,
      paymentMethod: '銀行振込',
      status: 'paid',
      actualDisbursementId: 'DIS-2024-001',
      actualPaymentDate: '2024-10-05',
      actualAmount: 2500000,
      alertLevel: 'none',
      daysUntilDue: 0,
      requiresApproval: true,
      approvalStatus: 'approved',
      approvedBy: '経理部長 山田',
      approvedAt: '2024-10-03T10:00:00Z',
      bankInfo: {
        bankName: 'みずほ銀行',
        branchName: '渋谷支店',
        accountType: '普通',
        accountNumber: '1234567',
        accountHolder: 'タナカデンキコウジ',
      },
      notes: '電気設備工事完了、検収済み',
      createdAt: '2024-09-20T10:00:00Z',
      updatedAt: '2024-10-05T14:00:00Z',
      createdBy: '発注担当 佐藤',
    },

    // 今月の予定（正常）
    {
      id: 'DIS-SCH-2024-002',
      tenantId: demoTenantId,
      orderId: 'ORD-2024-002',
      orderNo: 'ORD-2024-002',
      partnerId: 'PARTNER-002',
      partnerName: '鈴木 次郎',
      partnerCompany: '鈴木配管工業',
      scheduledDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10).toISOString().split('T')[0],
      amount: 3800000,
      paymentMethod: '銀行振込',
      status: 'approved',
      alertLevel: 'none',
      daysUntilDue: 10,
      requiresApproval: true,
      approvalStatus: 'approved',
      approvedBy: '工事部長 高橋',
      approvedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2).toISOString(),
      bankInfo: {
        bankName: '三菱UFJ銀行',
        branchName: '新宿支店',
        accountType: '当座',
        accountNumber: '9876543',
        accountHolder: 'スズキハイカンコウギョウ',
      },
      notes: '配管工事完了、月末締め翌月10日払い',
      createdAt: '2024-09-25T10:00:00Z',
      updatedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2).toISOString(),
      createdBy: '発注担当 佐藤',
    },

    // 5日以内に期日（警告レベル）
    {
      id: 'DIS-SCH-2024-003',
      tenantId: demoTenantId,
      orderId: 'ORD-2024-003',
      orderNo: 'ORD-2024-003',
      partnerId: 'PARTNER-003',
      partnerName: '佐々木 三郎',
      partnerCompany: '佐々木建材',
      scheduledDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4).toISOString().split('T')[0],
      amount: 1200000,
      paymentMethod: '銀行振込',
      status: 'approved',
      alertLevel: 'warning',
      alertMessage: '支払期日まで4日です',
      daysUntilDue: 4,
      requiresApproval: false,
      bankInfo: {
        bankName: '三井住友銀行',
        branchName: '品川支店',
        accountType: '普通',
        accountNumber: '5555555',
        accountHolder: 'ササキケンザイ',
      },
      notes: '建材納品済み',
      createdAt: '2024-09-28T10:00:00Z',
      updatedAt: today.toISOString(),
      createdBy: '購買担当 中村',
    },

    // 明日が期日（危険レベル）
    {
      id: 'DIS-SCH-2024-004',
      tenantId: demoTenantId,
      orderId: 'ORD-2024-004',
      orderNo: 'ORD-2024-004',
      partnerId: 'PARTNER-004',
      partnerName: '山本 四郎',
      partnerCompany: '山本塗装',
      scheduledDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString().split('T')[0],
      amount: 850000,
      paymentMethod: '銀行振込',
      status: 'approved',
      alertLevel: 'danger',
      alertMessage: '明日が支払期日です',
      daysUntilDue: 1,
      requiresApproval: false,
      approvalStatus: 'approved',
      approvedBy: '工事部長 高橋',
      approvedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5).toISOString(),
      bankInfo: {
        bankName: 'りそな銀行',
        branchName: '池袋支店',
        accountType: '普通',
        accountNumber: '3333333',
        accountHolder: 'ヤマモトトソウ',
      },
      notes: '塗装工事完了',
      createdAt: '2024-09-30T10:00:00Z',
      updatedAt: today.toISOString(),
      createdBy: '発注担当 佐藤',
    },

    // 承認待ち（高額）
    {
      id: 'DIS-SCH-2024-005',
      tenantId: demoTenantId,
      orderId: 'ORD-2024-005',
      orderNo: 'ORD-2024-005',
      partnerId: 'PARTNER-005',
      partnerName: '伊藤 五郎',
      partnerCompany: '伊藤重機',
      scheduledDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7).toISOString().split('T')[0],
      amount: 8500000,
      paymentMethod: '銀行振込',
      status: 'scheduled',
      alertLevel: 'warning',
      alertMessage: '承認待ちです（期日まで7日）',
      daysUntilDue: 7,
      requiresApproval: true,
      approvalStatus: 'pending',
      bankInfo: {
        bankName: '三菱UFJ銀行',
        branchName: '東京駅前支店',
        accountType: '当座',
        accountNumber: '7777777',
        accountHolder: 'イトウジュウキ',
      },
      notes: '重機レンタル料（3ヶ月分）、要承認',
      createdAt: today.toISOString(),
      updatedAt: today.toISOString(),
      createdBy: '発注担当 佐藤',
    },

    // 遅延（重大）
    {
      id: 'DIS-SCH-2024-006',
      tenantId: demoTenantId,
      orderId: 'ORD-2024-006',
      orderNo: 'ORD-2024-006',
      partnerId: 'PARTNER-006',
      partnerName: '渡辺 六郎',
      partnerCompany: '渡辺運送',
      scheduledDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2).toISOString().split('T')[0],
      amount: 450000,
      paymentMethod: '銀行振込',
      status: 'overdue',
      alertLevel: 'critical',
      alertMessage: '支払が2日遅延しています',
      daysUntilDue: -2,
      requiresApproval: false,
      approvalStatus: 'approved',
      approvedBy: '経理担当 佐藤',
      approvedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5).toISOString(),
      bankInfo: {
        bankName: 'ゆうちょ銀行',
        branchName: '〇一八',
        accountType: '普通',
        accountNumber: '1111111',
        accountHolder: 'ワタナベウンソウ',
      },
      notes: '資材運搬費、経理確認中',
      createdAt: '2024-09-25T10:00:00Z',
      updatedAt: today.toISOString(),
      createdBy: '購買担当 中村',
    },
  ];

  schedules.set(demoTenantId, sampleSchedules);
};

// 初期化実行
initializeSampleData();

// テナントIDを取得する関数
function getTenantIdFromRequest(request: NextRequest): string {
  const cookieStore = cookies();
  const tenantId = cookieStore.get('tenantId')?.value || 'demo-tenant';
  return tenantId;
}

// 支払予定番号を生成
function generateScheduleId(tenantId: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `DIS-SCH-${year}${month}-${random}`;
}

// アラートレベルを計算
function calculateAlertLevel(scheduledDate: string, status: string, requiresApproval?: boolean, approvalStatus?: string): {
  alertLevel: 'none' | 'warning' | 'danger' | 'critical';
  alertMessage?: string;
  daysUntilDue: number;
} {
  if (status === 'paid' || status === 'cancelled') {
    return { alertLevel: 'none', daysUntilDue: 0 };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dueDate = new Date(scheduledDate);
  dueDate.setHours(0, 0, 0, 0);
  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // 承認待ちの場合
  if (requiresApproval && approvalStatus === 'pending') {
    if (diffDays <= 7) {
      return {
        alertLevel: 'warning',
        alertMessage: `承認待ちです（期日まで${diffDays}日）`,
        daysUntilDue: diffDays,
      };
    }
  }

  if (diffDays < 0) {
    // 遅延
    const overdueDays = Math.abs(diffDays);
    return {
      alertLevel: 'critical',
      alertMessage: `支払が${overdueDays}日遅延しています`,
      daysUntilDue: diffDays,
    };
  } else if (diffDays === 0) {
    // 期日当日
    return {
      alertLevel: 'danger',
      alertMessage: '本日が支払期日です',
      daysUntilDue: 0,
    };
  } else if (diffDays === 1) {
    // 明日が期日
    return {
      alertLevel: 'danger',
      alertMessage: '明日が支払期日です',
      daysUntilDue: 1,
    };
  } else if (diffDays <= 5) {
    // 5日以内
    return {
      alertLevel: 'warning',
      alertMessage: `支払期日まで${diffDays}日です`,
      daysUntilDue: diffDays,
    };
  } else {
    // 余裕あり
    return {
      alertLevel: 'none',
      daysUntilDue: diffDays,
    };
  }
}

// GET: 支払予定一覧取得
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const tenantSchedules = schedules.get(tenantId) || [];

    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('id');
    const orderId = searchParams.get('orderId');
    const partnerId = searchParams.get('partnerId');
    const status = searchParams.get('status');
    const alertLevel = searchParams.get('alertLevel');
    const approvalStatus = searchParams.get('approvalStatus');

    let filteredSchedules = [...tenantSchedules];

    // 支払予定ID指定
    if (scheduleId) {
      const schedule = filteredSchedules.find(s => s.id === scheduleId);
      if (!schedule) {
        return NextResponse.json(
          { success: false, error: 'Disbursement schedule not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        schedule: schedule,
      });
    }

    // 発注IDフィルタ
    if (orderId) {
      filteredSchedules = filteredSchedules.filter(s => s.orderId === orderId);
    }

    // 協力会社IDフィルタ
    if (partnerId) {
      filteredSchedules = filteredSchedules.filter(s => s.partnerId === partnerId);
    }

    // ステータスフィルタ
    if (status) {
      filteredSchedules = filteredSchedules.filter(s => s.status === status);
    }

    // アラートレベルフィルタ
    if (alertLevel) {
      filteredSchedules = filteredSchedules.filter(s => s.alertLevel === alertLevel);
    }

    // 承認ステータスフィルタ
    if (approvalStatus) {
      filteredSchedules = filteredSchedules.filter(s => s.approvalStatus === approvalStatus);
    }

    // 支払予定日の古い順にソート（期日が近い順）
    filteredSchedules.sort((a, b) => {
      return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
    });

    // 統計情報を計算
    const stats = {
      total: filteredSchedules.length,
      scheduled: filteredSchedules.filter(s => s.status === 'scheduled').length,
      approved: filteredSchedules.filter(s => s.status === 'approved').length,
      paid: filteredSchedules.filter(s => s.status === 'paid').length,
      overdue: filteredSchedules.filter(s => s.status === 'overdue').length,
      totalAmount: filteredSchedules.reduce((sum, s) => sum + s.amount, 0),
      paidAmount: filteredSchedules
        .filter(s => s.status === 'paid')
        .reduce((sum, s) => sum + (s.actualAmount || 0), 0),
      scheduledAmount: filteredSchedules
        .filter(s => s.status === 'scheduled' || s.status === 'approved')
        .reduce((sum, s) => sum + s.amount, 0),
      overdueAmount: filteredSchedules
        .filter(s => s.status === 'overdue')
        .reduce((sum, s) => sum + s.amount, 0),
      pendingApprovalCount: filteredSchedules.filter(s => s.approvalStatus === 'pending').length,
      alertCounts: {
        none: filteredSchedules.filter(s => s.alertLevel === 'none').length,
        warning: filteredSchedules.filter(s => s.alertLevel === 'warning').length,
        danger: filteredSchedules.filter(s => s.alertLevel === 'danger').length,
        critical: filteredSchedules.filter(s => s.alertLevel === 'critical').length,
      },
    };

    return NextResponse.json({
      success: true,
      schedules: filteredSchedules,
      stats,
    });
  } catch (error) {
    console.error('Error fetching disbursement schedules:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch disbursement schedules' },
      { status: 500 }
    );
  }
}

// POST: 新規支払予定作成
export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();

    const now = new Date().toISOString();
    const scheduleId = generateScheduleId(tenantId);

    // 高額支払い（500万円以上）の場合は承認必須
    const requiresApproval = body.amount >= 5000000;

    // アラートレベルを自動計算
    const alertInfo = calculateAlertLevel(
      body.scheduledDate,
      requiresApproval ? 'scheduled' : 'approved',
      requiresApproval,
      requiresApproval ? 'pending' : 'approved'
    );

    const newSchedule: DisbursementSchedule = {
      id: scheduleId,
      tenantId,
      status: requiresApproval ? 'scheduled' : 'approved',
      requiresApproval,
      approvalStatus: requiresApproval ? 'pending' : 'approved',
      alertLevel: alertInfo.alertLevel,
      alertMessage: alertInfo.alertMessage,
      daysUntilDue: alertInfo.daysUntilDue,
      createdAt: now,
      updatedAt: now,
      ...body,
    };

    const tenantSchedules = schedules.get(tenantId) || [];
    tenantSchedules.push(newSchedule);
    schedules.set(tenantId, tenantSchedules);

    return NextResponse.json({
      success: true,
      schedule: newSchedule,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating disbursement schedule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create disbursement schedule' },
      { status: 500 }
    );
  }
}

// PUT: 支払予定更新
export async function PUT(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();
    const { id, ...updates } = body;

    const tenantSchedules = schedules.get(tenantId) || [];
    const scheduleIndex = tenantSchedules.findIndex(s => s.id === id);

    if (scheduleIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Disbursement schedule not found' },
        { status: 404 }
      );
    }

    const oldSchedule = tenantSchedules[scheduleIndex];

    // アラートレベルを再計算
    const scheduledDate = updates.scheduledDate || oldSchedule.scheduledDate;
    const status = updates.status || oldSchedule.status;
    const requiresApproval = updates.requiresApproval ?? oldSchedule.requiresApproval;
    const approvalStatus = updates.approvalStatus || oldSchedule.approvalStatus;
    const alertInfo = calculateAlertLevel(scheduledDate, status, requiresApproval, approvalStatus);

    const updatedSchedule: DisbursementSchedule = {
      ...oldSchedule,
      ...updates,
      alertLevel: alertInfo.alertLevel,
      alertMessage: alertInfo.alertMessage,
      daysUntilDue: alertInfo.daysUntilDue,
      updatedAt: new Date().toISOString(),
    };

    tenantSchedules[scheduleIndex] = updatedSchedule;
    schedules.set(tenantId, tenantSchedules);

    return NextResponse.json({
      success: true,
      schedule: updatedSchedule,
    });
  } catch (error) {
    console.error('Error updating disbursement schedule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update disbursement schedule' },
      { status: 500 }
    );
  }
}

// DELETE: 支払予定削除（キャンセル）
export async function DELETE(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('id');

    if (!scheduleId) {
      return NextResponse.json(
        { success: false, error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    const tenantSchedules = schedules.get(tenantId) || [];
    const schedule = tenantSchedules.find(s => s.id === scheduleId);

    if (!schedule) {
      return NextResponse.json(
        { success: false, error: 'Disbursement schedule not found' },
        { status: 404 }
      );
    }

    // キャンセル処理（物理削除ではなくステータス変更）
    schedule.status = 'cancelled';
    schedule.alertLevel = 'none';
    schedule.alertMessage = undefined;
    schedule.updatedAt = new Date().toISOString();

    schedules.set(tenantId, tenantSchedules);

    return NextResponse.json({
      success: true,
      message: 'Disbursement schedule cancelled successfully',
      schedule: schedule,
    });
  } catch (error) {
    console.error('Error deleting disbursement schedule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete disbursement schedule' },
      { status: 500 }
    );
  }
}

// ヘルパー関数: 発注から自動的に支払予定を生成
export async function generateScheduleFromOrder(
  tenantId: string,
  orderId: string,
  orderNo: string,
  partnerId: string,
  partnerName: string,
  partnerCompany: string,
  amount: number,
  paymentTermsDays: number = 30, // デフォルト30日後
  createdBy?: string
): Promise<DisbursementSchedule | null> {
  try {
    const now = new Date();
    const scheduledDate = new Date(now);
    scheduledDate.setDate(scheduledDate.getDate() + paymentTermsDays);

    const requiresApproval = amount >= 5000000;
    const alertInfo = calculateAlertLevel(
      scheduledDate.toISOString().split('T')[0],
      requiresApproval ? 'scheduled' : 'approved',
      requiresApproval,
      requiresApproval ? 'pending' : 'approved'
    );

    const schedule: DisbursementSchedule = {
      id: generateScheduleId(tenantId),
      tenantId,
      orderId,
      orderNo,
      partnerId,
      partnerName,
      partnerCompany,
      scheduledDate: scheduledDate.toISOString().split('T')[0],
      amount,
      paymentMethod: '銀行振込',
      status: requiresApproval ? 'scheduled' : 'approved',
      requiresApproval,
      approvalStatus: requiresApproval ? 'pending' : 'approved',
      alertLevel: alertInfo.alertLevel,
      alertMessage: alertInfo.alertMessage,
      daysUntilDue: alertInfo.daysUntilDue,
      notes: `発注 ${orderNo} から自動生成（支払条件: ${paymentTermsDays}日後）`,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      createdBy,
    };

    // データストアに保存
    const tenantSchedules = schedules.get(tenantId) || [];
    tenantSchedules.push(schedule);
    schedules.set(tenantId, tenantSchedules);

    console.log(`📅 発注 ${orderNo} から支払予定を自動生成しました（金額: ¥${amount.toLocaleString()}、期日: ${schedule.scheduledDate}）`);

    return schedule;
  } catch (error) {
    console.error('Failed to generate disbursement schedule from order:', error);
    return null;
  }
}

// ヘルパー関数: 支払予定のアラートを一括更新（定期実行用）
export async function updateAllAlerts(tenantId: string): Promise<number> {
  try {
    const tenantSchedules = schedules.get(tenantId) || [];
    let updatedCount = 0;

    for (const schedule of tenantSchedules) {
      if (schedule.status === 'scheduled' || schedule.status === 'approved' || schedule.status === 'overdue') {
        const alertInfo = calculateAlertLevel(
          schedule.scheduledDate,
          schedule.status,
          schedule.requiresApproval,
          schedule.approvalStatus
        );

        // ステータスを遅延に変更（期日を過ぎた場合）
        if (alertInfo.daysUntilDue < 0 && schedule.status !== 'overdue') {
          schedule.status = 'overdue';
        }

        // アラート情報を更新
        if (
          schedule.alertLevel !== alertInfo.alertLevel ||
          schedule.daysUntilDue !== alertInfo.daysUntilDue
        ) {
          schedule.alertLevel = alertInfo.alertLevel;
          schedule.alertMessage = alertInfo.alertMessage;
          schedule.daysUntilDue = alertInfo.daysUntilDue;
          schedule.updatedAt = new Date().toISOString();
          updatedCount++;
        }
      }
    }

    schedules.set(tenantId, tenantSchedules);

    if (updatedCount > 0) {
      console.log(`⚠️ ${tenantId}: ${updatedCount}件の支払予定アラートを更新しました`);
    }

    return updatedCount;
  } catch (error) {
    console.error('Failed to update alerts:', error);
    return 0;
  }
}
