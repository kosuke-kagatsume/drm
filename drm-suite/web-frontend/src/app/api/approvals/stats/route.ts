import { NextRequest, NextResponse } from 'next/server';
import type { ApprovalStats } from '@/types/approval-flow';

export const dynamic = 'force-dynamic';

// GET: 承認統計取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentType = searchParams.get('documentType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 承認データを取得
    const approvalsResponse = await fetch(
      `${request.nextUrl.origin}/api/approvals`,
      {
        headers: request.headers,
      },
    );

    if (!approvalsResponse.ok) {
      throw new Error('Failed to fetch approvals');
    }

    const approvalsData = await approvalsResponse.json();
    let approvals = approvalsData.data || [];

    // フィルタリング
    if (documentType) {
      approvals = approvals.filter((a: any) => a.documentType === documentType);
    }

    if (startDate) {
      approvals = approvals.filter(
        (a: any) => new Date(a.createdAt) >= new Date(startDate),
      );
    }

    if (endDate) {
      approvals = approvals.filter(
        (a: any) => new Date(a.createdAt) <= new Date(endDate),
      );
    }

    // 統計を計算
    const total = approvals.length;
    const pending = approvals.filter((a: any) => a.status === 'pending').length;
    const approved = approvals.filter(
      (a: any) => a.status === 'approved',
    ).length;
    const rejected = approvals.filter(
      (a: any) => a.status === 'rejected',
    ).length;
    const cancelled = approvals.filter(
      (a: any) => a.status === 'cancelled',
    ).length;
    const expired = approvals.filter((a: any) => a.status === 'expired').length;

    // 平均承認時間を計算（完了した承認のみ）
    const completedApprovals = approvals.filter((a: any) => a.completedAt);
    let averageApprovalTime = 0;

    if (completedApprovals.length > 0) {
      const totalTime = completedApprovals.reduce((sum: number, a: any) => {
        const created = new Date(a.createdAt).getTime();
        const completed = new Date(a.completedAt).getTime();
        return sum + (completed - created);
      }, 0);

      // 時間単位に変換
      averageApprovalTime =
        totalTime / completedApprovals.length / (1000 * 60 * 60);
    }

    // 承認率を計算
    const approvalRate =
      approved + rejected > 0 ? (approved / (approved + rejected)) * 100 : 0;

    const stats: ApprovalStats = {
      total,
      pending,
      approved,
      rejected,
      cancelled,
      expired,
      averageApprovalTime: Math.round(averageApprovalTime * 10) / 10,
      approvalRate: Math.round(approvalRate * 10) / 10,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching approval stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch approval stats' },
      { status: 500 },
    );
  }
}
