import { NextRequest, NextResponse } from 'next/server';
import type {
  ApprovalInstance,
  ApprovalInstanceStep,
  ApprovalAction,
  ApprovalRequest,
  ApprovalStatus,
} from '@/types/approval-flow';

export const dynamic = 'force-dynamic';

// メモリベースのデータストア
let approvalInstances: ApprovalInstance[] = [
  // サンプルデータ
  {
    id: 'APPR-001',
    flowId: 'FLOW-001',
    flowName: '高額案件承認フロー',
    documentType: 'estimate',
    documentId: 'EST-2024-001',
    documentTitle: '田中様邸新築工事見積',
    currentStep: 1,
    totalSteps: 3,
    status: 'pending',
    requestedBy: {
      id: 'user-001',
      name: '山田営業',
      email: 'yamada@example.com',
      department: '営業部',
    },
    steps: [
      {
        stepNumber: 1,
        name: '部門長承認',
        mode: 'serial',
        status: 'pending',
        approvals: [],
        startedAt: new Date().toISOString(),
        timeoutAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        stepNumber: 2,
        name: '事業部長承認',
        mode: 'serial',
        status: 'pending',
        approvals: [],
      },
      {
        stepNumber: 3,
        name: '代表取締役承認',
        mode: 'serial',
        status: 'pending',
        approvals: [],
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    companyId: 'company-001',
  },
];

// GET: 承認一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ApprovalStatus | null;
    const documentType = searchParams.get('documentType');
    const approverId = searchParams.get('approverId');
    const documentId = searchParams.get('documentId');

    let filtered = [...approvalInstances];

    // ステータスでフィルタ
    if (status) {
      filtered = filtered.filter((a) => a.status === status);
    }

    // ドキュメントタイプでフィルタ
    if (documentType) {
      filtered = filtered.filter((a) => a.documentType === documentType);
    }

    // ドキュメントIDでフィルタ
    if (documentId) {
      filtered = filtered.filter((a) => a.documentId === documentId);
    }

    // 承認者でフィルタ（現在のステップの承認者）
    if (approverId) {
      filtered = filtered.filter((approval) => {
        const currentStepData = approval.steps[approval.currentStep - 1];
        // 実際の実装では、currentStepDataのapproversをチェック
        return approval.status === 'pending';
      });
    }

    return NextResponse.json({
      success: true,
      data: filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    });
  } catch (error) {
    console.error('Error fetching approvals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch approvals' },
      { status: 500 },
    );
  }
}

// POST: 承認依頼作成
export async function POST(request: NextRequest) {
  try {
    const body: ApprovalRequest = await request.json();

    // 適用される承認フローを決定（実際はDBから取得）
    const flowId = 'FLOW-001';
    const flowName = '通常承認フロー';

    // 新しい承認インスタンスを作成
    const newApproval: ApprovalInstance = {
      id: `APPR-${Date.now()}`,
      flowId,
      flowName,
      documentType: body.documentType,
      documentId: body.documentId,
      documentTitle: body.documentTitle,
      currentStep: 1,
      totalSteps: 2, // 実際は承認フローから取得
      status: 'pending',
      requestedBy: {
        id: body.requestedBy,
        name: '担当者', // 実際はユーザー情報から取得
        email: 'user@example.com',
        department: '営業部',
      },
      steps: [
        {
          stepNumber: 1,
          name: '部門長承認',
          mode: 'serial',
          status: 'pending',
          approvals: [],
          startedAt: new Date().toISOString(),
          timeoutAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          stepNumber: 2,
          name: '事業部長承認',
          mode: 'serial',
          status: 'pending',
          approvals: [],
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      companyId: 'company-001',
    };

    approvalInstances.push(newApproval);

    // TODO: 通知送信（メール・Slack・Chatwork）

    return NextResponse.json(
      {
        success: true,
        data: newApproval,
        message: '承認依頼を作成しました',
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating approval:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create approval' },
      { status: 500 },
    );
  }
}

// PUT: 承認アクション（承認・却下・差し戻し）
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      approvalId,
      action,
      approverId,
      approverName,
      approverEmail,
      comment,
    } = body;

    const approvalIndex = approvalInstances.findIndex(
      (a) => a.id === approvalId,
    );

    if (approvalIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Approval not found' },
        { status: 404 },
      );
    }

    const approval = approvalInstances[approvalIndex];

    // 現在のステップを取得
    const currentStepIndex = approval.currentStep - 1;
    const currentStep = approval.steps[currentStepIndex];

    // 承認アクションを記録
    const approvalAction: ApprovalAction = {
      id: `ACT-${Date.now()}`,
      approverId,
      approverName,
      approverEmail,
      action,
      comment,
      createdAt: new Date().toISOString(),
    };

    currentStep.approvals.push(approvalAction);

    if (action === 'approved') {
      // 承認された場合
      currentStep.status = 'approved';
      currentStep.completedAt = new Date().toISOString();

      // 次のステップがあるか確認
      if (approval.currentStep < approval.totalSteps) {
        // 次のステップへ
        approval.currentStep += 1;
        const nextStep = approval.steps[approval.currentStep - 1];
        nextStep.status = 'pending';
        nextStep.startedAt = new Date().toISOString();
        if (nextStep.timeoutAt) {
          nextStep.timeoutAt = new Date(
            Date.now() + 24 * 60 * 60 * 1000,
          ).toISOString();
        }
      } else {
        // 全ステップ完了
        approval.status = 'approved';
        approval.completedAt = new Date().toISOString();
      }
    } else if (action === 'rejected') {
      // 却下された場合
      currentStep.status = 'rejected';
      currentStep.completedAt = new Date().toISOString();
      approval.status = 'rejected';
      approval.completedAt = new Date().toISOString();
    }

    approval.updatedAt = new Date().toISOString();
    approvalInstances[approvalIndex] = approval;

    // TODO: 通知送信（次の承認者、申請者など）

    return NextResponse.json({
      success: true,
      data: approval,
      message:
        action === 'approved'
          ? '承認しました'
          : action === 'rejected'
            ? '却下しました'
            : 'アクションを実行しました',
    });
  } catch (error) {
    console.error('Error updating approval:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update approval' },
      { status: 500 },
    );
  }
}

// DELETE: 承認のキャンセル
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const approvalId = searchParams.get('id');

    if (!approvalId) {
      return NextResponse.json(
        { success: false, error: 'Approval ID is required' },
        { status: 400 },
      );
    }

    const approvalIndex = approvalInstances.findIndex(
      (a) => a.id === approvalId,
    );

    if (approvalIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Approval not found' },
        { status: 404 },
      );
    }

    const approval = approvalInstances[approvalIndex];
    approval.status = 'cancelled';
    approval.completedAt = new Date().toISOString();
    approval.updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      message: '承認をキャンセルしました',
    });
  } catch (error) {
    console.error('Error cancelling approval:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel approval' },
      { status: 500 },
    );
  }
}
