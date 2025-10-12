import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 入金予定の型定義
export interface PaymentSchedule {
  id: string;
  tenantId: string;

  // 請求書との紐付け
  invoiceId: string;
  invoiceNo: string;

  // 入金予定情報
  scheduledDate: string; // 入金予定日
  amount: number; // 予定金額
  installmentNumber?: number; // 分割払いの場合の回数（1回目、2回目など）
  totalInstallments?: number; // 分割払いの総回数

  // ステータス
  status: 'scheduled' | 'received' | 'overdue' | 'cancelled';

  // 実績情報
  actualPaymentId?: string; // 実際の入金記録ID（/api/payments のID）
  actualPaymentDate?: string;
  actualAmount?: number;

  // アラート情報
  alertLevel?: 'none' | 'warning' | 'danger' | 'critical'; // なし | 7日前 | 期日当日 | 遅延
  alertMessage?: string;
  daysUntilDue?: number; // マイナスの場合は遅延日数

  // メモ
  notes?: string;

  // メタデータ
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// メモリ内データストア
let schedules: Map<string, PaymentSchedule[]> = new Map();

// 初期サンプルデータ
const initializeSampleData = () => {
  const demoTenantId = 'demo-tenant';

  const today = new Date();
  const sampleSchedules: PaymentSchedule[] = [
    // 過去の入金済み
    {
      id: 'SCH-2024-001',
      tenantId: demoTenantId,
      invoiceId: 'INV-2024-002',
      invoiceNo: 'INV-2024-002',
      scheduledDate: '2024-10-10',
      amount: 35750000,
      status: 'received',
      actualPaymentId: 'PAY-2024-001',
      actualPaymentDate: '2024-10-10',
      actualAmount: 35750000,
      alertLevel: 'none',
      daysUntilDue: 0,
      notes: '全額一括入金',
      createdAt: '2024-09-15T10:00:00Z',
      updatedAt: '2024-10-10T14:00:00Z',
      createdBy: '経理担当 佐藤',
    },

    // 今月の予定（正常）
    {
      id: 'SCH-2024-002',
      tenantId: demoTenantId,
      invoiceId: 'INV-2024-001',
      invoiceNo: 'INV-2024-001',
      scheduledDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 15).toISOString().split('T')[0],
      amount: 28600000,
      status: 'scheduled',
      alertLevel: 'none',
      daysUntilDue: 15,
      notes: '契約時の取り決め通り、着工金30%',
      createdAt: '2024-09-10T10:00:00Z',
      updatedAt: '2024-09-10T10:00:00Z',
      createdBy: '営業部長 山田',
    },

    // 7日以内に期日（警告レベル）
    {
      id: 'SCH-2024-003',
      tenantId: demoTenantId,
      invoiceId: 'INV-2024-003',
      invoiceNo: 'INV-2024-003',
      scheduledDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5).toISOString().split('T')[0],
      amount: 15400000,
      status: 'scheduled',
      alertLevel: 'warning',
      alertMessage: '入金期日まで5日です',
      daysUntilDue: 5,
      notes: '追加工事分の請求',
      createdAt: '2024-09-20T10:00:00Z',
      updatedAt: '2024-10-10T08:00:00Z',
      createdBy: '経理担当 佐藤',
    },

    // 期日当日（危険レベル）
    {
      id: 'SCH-2024-004',
      tenantId: demoTenantId,
      invoiceId: 'INV-2024-004',
      invoiceNo: 'INV-2024-004',
      scheduledDate: today.toISOString().split('T')[0],
      amount: 8250000,
      installmentNumber: 1,
      totalInstallments: 3,
      status: 'scheduled',
      alertLevel: 'danger',
      alertMessage: '本日が入金期日です',
      daysUntilDue: 0,
      notes: '分割払い 1回目/3回',
      createdAt: '2024-09-05T10:00:00Z',
      updatedAt: '2024-10-12T06:00:00Z',
      createdBy: '経理担当 佐藤',
    },

    // 遅延（重大）
    {
      id: 'SCH-2024-005',
      tenantId: demoTenantId,
      invoiceId: 'INV-2024-005',
      invoiceNo: 'INV-2024-005',
      scheduledDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3).toISOString().split('T')[0],
      amount: 12100000,
      status: 'overdue',
      alertLevel: 'critical',
      alertMessage: '入金が3日遅延しています',
      daysUntilDue: -3,
      notes: '顧客に督促済み（10/10連絡）',
      createdAt: '2024-09-01T10:00:00Z',
      updatedAt: '2024-10-12T06:00:00Z',
      createdBy: '経理担当 佐藤',
    },

    // 分割払い - 2回目
    {
      id: 'SCH-2024-006',
      tenantId: demoTenantId,
      invoiceId: 'INV-2024-004',
      invoiceNo: 'INV-2024-004',
      scheduledDate: new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()).toISOString().split('T')[0],
      amount: 8250000,
      installmentNumber: 2,
      totalInstallments: 3,
      status: 'scheduled',
      alertLevel: 'none',
      daysUntilDue: 30,
      notes: '分割払い 2回目/3回',
      createdAt: '2024-09-05T10:00:00Z',
      updatedAt: '2024-09-05T10:00:00Z',
      createdBy: '経理担当 佐藤',
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

// 入金予定番号を生成
function generateScheduleId(tenantId: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `SCH-${year}${month}-${random}`;
}

// アラートレベルを計算
function calculateAlertLevel(scheduledDate: string, status: string): {
  alertLevel: 'none' | 'warning' | 'danger' | 'critical';
  alertMessage?: string;
  daysUntilDue: number;
} {
  if (status === 'received' || status === 'cancelled') {
    return { alertLevel: 'none', daysUntilDue: 0 };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dueDate = new Date(scheduledDate);
  dueDate.setHours(0, 0, 0, 0);
  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    // 遅延
    const overdueDays = Math.abs(diffDays);
    return {
      alertLevel: 'critical',
      alertMessage: `入金が${overdueDays}日遅延しています`,
      daysUntilDue: diffDays,
    };
  } else if (diffDays === 0) {
    // 期日当日
    return {
      alertLevel: 'danger',
      alertMessage: '本日が入金期日です',
      daysUntilDue: 0,
    };
  } else if (diffDays <= 7) {
    // 7日以内
    return {
      alertLevel: 'warning',
      alertMessage: `入金期日まで${diffDays}日です`,
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

// GET: 入金予定一覧取得
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const tenantSchedules = schedules.get(tenantId) || [];

    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('id');
    const invoiceId = searchParams.get('invoiceId');
    const status = searchParams.get('status');
    const alertLevel = searchParams.get('alertLevel');

    let filteredSchedules = [...tenantSchedules];

    // 入金予定ID指定
    if (scheduleId) {
      const schedule = filteredSchedules.find(s => s.id === scheduleId);
      if (!schedule) {
        return NextResponse.json(
          { success: false, error: 'Payment schedule not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        schedule: schedule,
      });
    }

    // 請求書IDフィルタ
    if (invoiceId) {
      filteredSchedules = filteredSchedules.filter(s => s.invoiceId === invoiceId);
    }

    // ステータスフィルタ
    if (status) {
      filteredSchedules = filteredSchedules.filter(s => s.status === status);
    }

    // アラートレベルフィルタ
    if (alertLevel) {
      filteredSchedules = filteredSchedules.filter(s => s.alertLevel === alertLevel);
    }

    // 入金予定日の古い順にソート（期日が近い順）
    filteredSchedules.sort((a, b) => {
      return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
    });

    // 統計情報を計算
    const stats = {
      total: filteredSchedules.length,
      scheduled: filteredSchedules.filter(s => s.status === 'scheduled').length,
      received: filteredSchedules.filter(s => s.status === 'received').length,
      overdue: filteredSchedules.filter(s => s.status === 'overdue').length,
      totalAmount: filteredSchedules.reduce((sum, s) => sum + s.amount, 0),
      receivedAmount: filteredSchedules
        .filter(s => s.status === 'received')
        .reduce((sum, s) => sum + (s.actualAmount || 0), 0),
      scheduledAmount: filteredSchedules
        .filter(s => s.status === 'scheduled')
        .reduce((sum, s) => sum + s.amount, 0),
      overdueAmount: filteredSchedules
        .filter(s => s.status === 'overdue')
        .reduce((sum, s) => sum + s.amount, 0),
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
    console.error('Error fetching payment schedules:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment schedules' },
      { status: 500 }
    );
  }
}

// POST: 新規入金予定作成
export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();

    const now = new Date().toISOString();
    const scheduleId = generateScheduleId(tenantId);

    // アラートレベルを自動計算
    const alertInfo = calculateAlertLevel(body.scheduledDate, 'scheduled');

    const newSchedule: PaymentSchedule = {
      id: scheduleId,
      tenantId,
      status: 'scheduled',
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
    console.error('Error creating payment schedule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment schedule' },
      { status: 500 }
    );
  }
}

// PUT: 入金予定更新
export async function PUT(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();
    const { id, ...updates } = body;

    const tenantSchedules = schedules.get(tenantId) || [];
    const scheduleIndex = tenantSchedules.findIndex(s => s.id === id);

    if (scheduleIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Payment schedule not found' },
        { status: 404 }
      );
    }

    const oldSchedule = tenantSchedules[scheduleIndex];

    // アラートレベルを再計算（ステータスや日付が変わった場合）
    const scheduledDate = updates.scheduledDate || oldSchedule.scheduledDate;
    const status = updates.status || oldSchedule.status;
    const alertInfo = calculateAlertLevel(scheduledDate, status);

    const updatedSchedule: PaymentSchedule = {
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
    console.error('Error updating payment schedule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payment schedule' },
      { status: 500 }
    );
  }
}

// DELETE: 入金予定削除（キャンセル）
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
        { success: false, error: 'Payment schedule not found' },
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
      message: 'Payment schedule cancelled successfully',
      schedule: schedule,
    });
  } catch (error) {
    console.error('Error deleting payment schedule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete payment schedule' },
      { status: 500 }
    );
  }
}

// ヘルパー関数: 請求書から自動的に入金予定を生成
export async function generateSchedulesFromInvoice(
  tenantId: string,
  invoiceId: string,
  invoiceNo: string,
  dueDate: string,
  totalAmount: number,
  installments?: number,
  createdBy?: string
): Promise<PaymentSchedule[]> {
  try {
    const now = new Date().toISOString();
    const generatedSchedules: PaymentSchedule[] = [];

    if (installments && installments > 1) {
      // 分割払いの場合
      const amountPerInstallment = Math.floor(totalAmount / installments);
      const lastAmount = totalAmount - (amountPerInstallment * (installments - 1));

      for (let i = 0; i < installments; i++) {
        const scheduledDate = new Date(dueDate);
        scheduledDate.setMonth(scheduledDate.getMonth() + i);

        const amount = i === installments - 1 ? lastAmount : amountPerInstallment;
        const alertInfo = calculateAlertLevel(scheduledDate.toISOString().split('T')[0], 'scheduled');

        const schedule: PaymentSchedule = {
          id: generateScheduleId(tenantId),
          tenantId,
          invoiceId,
          invoiceNo,
          scheduledDate: scheduledDate.toISOString().split('T')[0],
          amount,
          installmentNumber: i + 1,
          totalInstallments: installments,
          status: 'scheduled',
          alertLevel: alertInfo.alertLevel,
          alertMessage: alertInfo.alertMessage,
          daysUntilDue: alertInfo.daysUntilDue,
          notes: `分割払い ${i + 1}回目/${installments}回`,
          createdAt: now,
          updatedAt: now,
          createdBy,
        };

        generatedSchedules.push(schedule);
      }
    } else {
      // 一括払いの場合
      const alertInfo = calculateAlertLevel(dueDate, 'scheduled');

      const schedule: PaymentSchedule = {
        id: generateScheduleId(tenantId),
        tenantId,
        invoiceId,
        invoiceNo,
        scheduledDate: dueDate,
        amount: totalAmount,
        status: 'scheduled',
        alertLevel: alertInfo.alertLevel,
        alertMessage: alertInfo.alertMessage,
        daysUntilDue: alertInfo.daysUntilDue,
        notes: '全額一括',
        createdAt: now,
        updatedAt: now,
        createdBy,
      };

      generatedSchedules.push(schedule);
    }

    // データストアに保存
    const tenantSchedules = schedules.get(tenantId) || [];
    tenantSchedules.push(...generatedSchedules);
    schedules.set(tenantId, tenantSchedules);

    console.log(`📅 請求書 ${invoiceNo} から ${generatedSchedules.length}件の入金予定を自動生成しました`);

    return generatedSchedules;
  } catch (error) {
    console.error('Failed to generate payment schedules from invoice:', error);
    return [];
  }
}

// ヘルパー関数: 入金予定のアラートを一括更新（定期実行用）
export async function updateAllAlerts(tenantId: string): Promise<number> {
  try {
    const tenantSchedules = schedules.get(tenantId) || [];
    let updatedCount = 0;

    for (const schedule of tenantSchedules) {
      if (schedule.status === 'scheduled' || schedule.status === 'overdue') {
        const alertInfo = calculateAlertLevel(schedule.scheduledDate, schedule.status);

        // ステータスを遅延に変更（期日を過ぎた場合）
        if (alertInfo.daysUntilDue < 0 && schedule.status === 'scheduled') {
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
      console.log(`⚠️ ${tenantId}: ${updatedCount}件の入金予定アラートを更新しました`);
    }

    return updatedCount;
  } catch (error) {
    console.error('Failed to update alerts:', error);
    return 0;
  }
}
