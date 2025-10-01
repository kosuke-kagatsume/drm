import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  ApprovalInstance,
  ApprovalInstanceStep,
  ApprovalAction,
  ApprovalRequest,
  ApprovalStats,
} from '@/types/approval-flow';

// メモリ内データストア
let approvalInstances: Map<string, ApprovalInstance[]> = new Map();

// テナントIDを取得する関数
function getTenantIdFromRequest(request: NextRequest): string {
  const cookieStore = cookies();
  const tenantId = cookieStore.get('tenantId')?.value || 'default';
  return tenantId;
}

// 初期データを設定
function initializeInstancesForTenant(tenantId: string): ApprovalInstance[] {
  const now = new Date().toISOString();

  return [
    // サンプル承認インスタンス
    {
      id: `instance_${tenantId}_1`,
      flowId: `flow_${tenantId}_2`,
      flowName: '高額見積承認フロー（500万円以上）',
      documentType: 'estimate',
      documentId: 'EST-2025-001',
      documentTitle: '新築戸建て工事見積（田中様邸）',
      currentStep: 2,
      totalSteps: 3,
      status: 'pending',
      requestedBy: {
        id: 'user_1',
        name: '加藤 真一',
        email: 'kato@drm.com',
        department: '営業',
      },
      steps: [
        {
          stepNumber: 1,
          name: '営業課長確認',
          mode: 'serial',
          status: 'approved',
          approvals: [
            {
              id: 'approval_1',
              approverId: 'user_1',
              approverName: '中村 大輔',
              approverEmail: 'nakamura@drm.com',
              action: 'approved',
              comment: '見積内容を確認しました。適正な金額です。',
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            }
          ],
          startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          stepNumber: 2,
          name: '支店長承認',
          mode: 'serial',
          status: 'pending',
          approvals: [],
          startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          timeoutAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          stepNumber: 3,
          name: '経営層承認',
          mode: 'parallel',
          status: 'pending',
          approvals: [],
        }
      ],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      companyId: tenantId,
    },
    {
      id: `instance_${tenantId}_2`,
      flowId: `flow_${tenantId}_3`,
      flowName: '標準契約書承認フロー',
      documentType: 'contract',
      documentId: 'CON-2025-001',
      documentTitle: 'リフォーム工事契約書（佐藤様）',
      currentStep: 3,
      totalSteps: 3,
      status: 'approved',
      requestedBy: {
        id: 'user_2',
        name: '吉田 愛',
        email: 'yoshida@drm.com',
        department: '営業',
      },
      steps: [
        {
          stepNumber: 1,
          name: '営業責任者確認',
          mode: 'serial',
          status: 'approved',
          approvals: [
            {
              id: 'approval_2',
              approverId: 'user_2',
              approverName: '鈴木 一郎',
              approverEmail: 'suzuki@drm.com',
              action: 'approved',
              comment: '契約内容に問題ありません。',
              createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            }
          ],
          startedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          stepNumber: 2,
          name: '総務・法務チェック',
          mode: 'serial',
          status: 'approved',
          approvals: [
            {
              id: 'approval_3',
              approverId: 'user_3',
              approverName: '山本 修',
              approverEmail: 'yamamoto@drm.com',
              action: 'approved',
              comment: '法的な問題点はありません。承認します。',
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            }
          ],
          startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          stepNumber: 3,
          name: '代表取締役承認',
          mode: 'serial',
          status: 'approved',
          approvals: [
            {
              id: 'approval_4',
              approverId: 'user_4',
              approverName: '山田 太郎',
              approverEmail: 'yamada@drm.com',
              action: 'approved',
              comment: '承認します。契約を進めてください。',
              createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            }
          ],
          startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ],
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      companyId: tenantId,
    },
  ];
}

// GET: 承認インスタンス一覧取得
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);

    if (!approvalInstances.has(tenantId)) {
      approvalInstances.set(tenantId, initializeInstancesForTenant(tenantId));
    }

    const instances = approvalInstances.get(tenantId) || [];

    // クエリパラメータでフィルタリング
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const documentType = searchParams.get('documentType');
    const documentId = searchParams.get('documentId');
    const requestedBy = searchParams.get('requestedBy');

    let filteredInstances = instances;

    if (status) {
      filteredInstances = filteredInstances.filter(i => i.status === status);
    }

    if (documentType) {
      filteredInstances = filteredInstances.filter(i => i.documentType === documentType);
    }

    if (documentId) {
      filteredInstances = filteredInstances.filter(i => i.documentId === documentId);
    }

    if (requestedBy) {
      filteredInstances = filteredInstances.filter(i => i.requestedBy.id === requestedBy);
    }

    return NextResponse.json({
      success: true,
      data: filteredInstances,
      total: filteredInstances.length,
    });
  } catch (error) {
    console.error('Error fetching approval instances:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch approval instances' },
      { status: 500 }
    );
  }
}

// POST: 新規承認インスタンス作成
export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body: ApprovalRequest = await request.json();

    if (!approvalInstances.has(tenantId)) {
      approvalInstances.set(tenantId, initializeInstancesForTenant(tenantId));
    }

    const instances = approvalInstances.get(tenantId) || [];

    // ここで適切なフローを選択するロジックが必要
    // 簡易的に最初のフローを使用
    const flowId = `flow_${tenantId}_1`;
    const flowName = '標準承認フロー';

    const now = new Date().toISOString();
    const newInstance: ApprovalInstance = {
      id: `instance_${tenantId}_${Date.now()}`,
      flowId,
      flowName,
      documentType: body.documentType,
      documentId: body.documentId,
      documentTitle: body.documentTitle,
      currentStep: 1,
      totalSteps: 2, // サンプル
      status: 'pending',
      requestedBy: {
        id: body.requestedBy,
        name: 'ユーザー名', // 実際はユーザー情報から取得
        email: 'user@example.com',
      },
      steps: [
        {
          stepNumber: 1,
          name: '第1承認',
          mode: 'serial',
          status: 'pending',
          approvals: [],
          startedAt: now,
        },
        {
          stepNumber: 2,
          name: '第2承認',
          mode: 'serial',
          status: 'pending',
          approvals: [],
        }
      ],
      createdAt: now,
      updatedAt: now,
      companyId: tenantId,
    };

    instances.push(newInstance);
    approvalInstances.set(tenantId, instances);

    return NextResponse.json({
      success: true,
      data: newInstance,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating approval instance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create approval instance' },
      { status: 500 }
    );
  }
}

// PUT: 承認アクション実行
export async function PUT(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();
    const { instanceId, action, approverId, approverName, approverEmail, comment } = body;

    const instances = approvalInstances.get(tenantId) || [];
    const instance = instances.find(i => i.id === instanceId);

    if (!instance) {
      return NextResponse.json(
        { success: false, error: 'Instance not found' },
        { status: 404 }
      );
    }

    const currentStepData = instance.steps[instance.currentStep - 1];

    const newApproval: ApprovalAction = {
      id: `approval_${Date.now()}`,
      approverId,
      approverName,
      approverEmail,
      action,
      comment,
      createdAt: new Date().toISOString(),
    };

    currentStepData.approvals.push(newApproval);

    // 承認または却下された場合の処理
    if (action === 'approved') {
      currentStepData.status = 'approved';
      currentStepData.completedAt = new Date().toISOString();

      // 次のステップに進む
      if (instance.currentStep < instance.totalSteps) {
        instance.currentStep += 1;
        instance.steps[instance.currentStep - 1].status = 'pending';
        instance.steps[instance.currentStep - 1].startedAt = new Date().toISOString();
      } else {
        // 全ステップ完了
        instance.status = 'approved';
        instance.completedAt = new Date().toISOString();
      }
    } else if (action === 'rejected') {
      currentStepData.status = 'rejected';
      currentStepData.completedAt = new Date().toISOString();
      instance.status = 'rejected';
      instance.completedAt = new Date().toISOString();
    }

    instance.updatedAt = new Date().toISOString();
    approvalInstances.set(tenantId, instances);

    return NextResponse.json({
      success: true,
      data: instance,
    });
  } catch (error) {
    console.error('Error processing approval action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process approval action' },
      { status: 500 }
    );
  }
}
