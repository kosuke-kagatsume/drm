import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET: 承認履歴取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const approvalId = searchParams.get('approvalId');
    const documentId = searchParams.get('documentId');
    const approverId = searchParams.get('approverId');

    // 承認インスタンスから履歴を取得
    // 実際はapprovals APIから取得
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
    const approvals = approvalsData.data || [];

    let filtered = approvals;

    // 承認IDでフィルタ
    if (approvalId) {
      filtered = filtered.filter((a: any) => a.id === approvalId);
    }

    // ドキュメントIDでフィルタ
    if (documentId) {
      filtered = filtered.filter((a: any) => a.documentId === documentId);
    }

    // 承認者でフィルタ
    if (approverId) {
      filtered = filtered.filter((a: any) => {
        return a.steps.some((step: any) =>
          step.approvals.some(
            (approval: any) => approval.approverId === approverId,
          ),
        );
      });
    }

    // 履歴データを整形
    const history = filtered.flatMap((approval: any) => {
      const events = [];

      // 申請イベント
      events.push({
        id: `${approval.id}-created`,
        approvalId: approval.id,
        documentType: approval.documentType,
        documentId: approval.documentId,
        documentTitle: approval.documentTitle,
        eventType: 'created',
        userId: approval.requestedBy.id,
        userName: approval.requestedBy.name,
        userEmail: approval.requestedBy.email,
        comment: '承認申請を作成しました',
        createdAt: approval.createdAt,
      });

      // 各ステップの承認イベント
      approval.steps.forEach((step: any, stepIndex: number) => {
        step.approvals.forEach((action: any) => {
          events.push({
            id: action.id,
            approvalId: approval.id,
            documentType: approval.documentType,
            documentId: approval.documentId,
            documentTitle: approval.documentTitle,
            eventType: action.action,
            stepNumber: stepIndex + 1,
            stepName: step.name,
            userId: action.approverId,
            userName: action.approverName,
            userEmail: action.approverEmail,
            comment: action.comment,
            createdAt: action.createdAt,
          });
        });
      });

      // 完了/キャンセルイベント
      if (approval.completedAt) {
        events.push({
          id: `${approval.id}-completed`,
          approvalId: approval.id,
          documentType: approval.documentType,
          documentId: approval.documentId,
          documentTitle: approval.documentTitle,
          eventType: approval.status,
          comment:
            approval.status === 'approved'
              ? '全ての承認が完了しました'
              : approval.status === 'rejected'
                ? '承認が却下されました'
                : 'キャンセルされました',
          createdAt: approval.completedAt,
        });
      }

      return events;
    });

    // 時系列でソート（新しい順）
    history.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Error fetching approval history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch approval history' },
      { status: 500 },
    );
  }
}
