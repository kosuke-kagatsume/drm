import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  ApprovalFlow,
  ApprovalStep,
  ApprovalCondition,
  ApprovalStepMode,
  DocumentType,
  ApprovalFlowType,
} from '@/types/approval-flow';

// メモリ内データストア（本番環境ではデータベースを使用）
let approvalFlows: Map<string, ApprovalFlow[]> = new Map();

// 初期データを設定
function initializeFlowsForTenant(tenantId: string): ApprovalFlow[] {
  const now = new Date().toISOString();

  return [
    // 1. 組織連動型：見積承認フロー（デフォルト）
    {
      id: `flow_${tenantId}_1`,
      name: '標準見積承認フロー（組織連動）',
      description: '組織階層に基づく見積承認。直属上司→部長→役員の順で承認',
      type: 'organization',
      documentType: 'estimate',
      useOrganizationHierarchy: true,
      organizationLevels: 3,
      isActive: true,
      isDefault: true,
      priority: 1,
      createdBy: 'system',
      createdAt: now,
      updatedAt: now,
      companyId: tenantId,
    },

    // 2. カスタム型：高額見積承認フロー（500万円以上）
    {
      id: `flow_${tenantId}_2`,
      name: '高額見積承認フロー（500万円以上）',
      description: '500万円以上の見積は経営層の承認が必須',
      type: 'custom',
      documentType: 'estimate',
      steps: [
        {
          id: 'step_1',
          stepNumber: 1,
          name: '営業課長確認',
          description: '見積内容の妥当性確認',
          mode: 'serial',
          approvers: [
            {
              id: 'user_1',
              name: '中村 大輔',
              email: 'nakamura@drm.com',
              role: 'manager',
              department: '営業',
              position: '営業課長',
            }
          ],
          timeoutHours: 24,
          allowDelegate: true,
          allowSkip: false,
        },
        {
          id: 'step_2',
          stepNumber: 2,
          name: '支店長承認',
          description: '営業戦略との整合性確認',
          mode: 'serial',
          approvers: [
            {
              id: 'user_2',
              name: '鈴木 一郎',
              email: 'suzuki@drm.com',
              role: 'manager',
              department: '営業',
              position: '東京支店長',
            }
          ],
          timeoutHours: 48,
          allowDelegate: true,
          allowSkip: false,
        },
        {
          id: 'step_3',
          stepNumber: 3,
          name: '経営層承認',
          description: '最終承認（専務または常務）',
          mode: 'parallel',
          approvers: [
            {
              id: 'user_3',
              name: '佐藤 次郎',
              email: 'sato@drm.com',
              role: 'executive',
              department: '経営',
              position: '専務取締役',
            },
            {
              id: 'user_4',
              name: '高橋 花子',
              email: 'takahashi@drm.com',
              role: 'executive',
              department: '経営',
              position: '常務取締役',
            }
          ],
          requiredApprovals: 1, // どちらか1名の承認でOK
          timeoutHours: 72,
          allowDelegate: false,
          allowSkip: false,
        }
      ],
      conditions: [
        {
          id: 'cond_1',
          field: 'amount',
          operator: 'gte',
          value: 5000000,
          description: '見積金額が500万円以上',
        }
      ],
      isActive: true,
      isDefault: false,
      priority: 10,
      createdBy: 'system',
      createdAt: now,
      updatedAt: now,
      companyId: tenantId,
    },

    // 3. カスタム型：契約書承認フロー
    {
      id: `flow_${tenantId}_3`,
      name: '標準契約書承認フロー',
      description: '契約書の法務チェックと経営承認',
      type: 'custom',
      documentType: 'contract',
      steps: [
        {
          id: 'step_1',
          stepNumber: 1,
          name: '営業責任者確認',
          mode: 'serial',
          approvers: [
            {
              id: 'user_1',
              name: '鈴木 一郎',
              email: 'suzuki@drm.com',
              role: 'manager',
              department: '営業',
              position: '東京支店長',
            }
          ],
          timeoutHours: 24,
          allowDelegate: true,
          allowSkip: false,
        },
        {
          id: 'step_2',
          stepNumber: 2,
          name: '総務・法務チェック',
          description: '契約書の法的妥当性確認',
          mode: 'serial',
          approvers: [
            {
              id: 'user_2',
              name: '山本 修',
              email: 'yamamoto@drm.com',
              role: 'manager',
              department: '総務',
              position: '総務部長',
            }
          ],
          timeoutHours: 48,
          allowDelegate: true,
          allowSkip: false,
        },
        {
          id: 'step_3',
          stepNumber: 3,
          name: '代表取締役承認',
          description: '最終承認',
          mode: 'serial',
          approvers: [
            {
              id: 'user_3',
              name: '山田 太郎',
              email: 'yamada@drm.com',
              role: 'executive',
              department: '経営',
              position: '代表取締役',
            }
          ],
          timeoutHours: 72,
          allowDelegate: false,
          allowSkip: false,
        }
      ],
      isActive: true,
      isDefault: true,
      priority: 1,
      createdBy: 'system',
      createdAt: now,
      updatedAt: now,
      companyId: tenantId,
    },

    // 4. カスタム型：請求書承認フロー
    {
      id: `flow_${tenantId}_4`,
      name: '請求書承認フロー',
      description: '請求書の内容確認と経理承認',
      type: 'custom',
      documentType: 'invoice',
      steps: [
        {
          id: 'step_1',
          stepNumber: 1,
          name: '営業担当者確認',
          description: '請求内容の確認',
          mode: 'serial',
          approvers: [], // 動的に設定
          timeoutHours: 24,
          allowDelegate: true,
          allowSkip: false,
        },
        {
          id: 'step_2',
          stepNumber: 2,
          name: '経理承認',
          mode: 'serial',
          approvers: [
            {
              id: 'user_1',
              name: '西村 恵子',
              email: 'nishimura@drm.com',
              role: 'accounting',
              department: '経理',
              position: '経理課長',
            }
          ],
          timeoutHours: 48,
          allowDelegate: true,
          allowSkip: false,
        }
      ],
      isActive: true,
      isDefault: true,
      priority: 1,
      createdBy: 'system',
      createdAt: now,
      updatedAt: now,
      companyId: tenantId,
    },

    // 5. カスタム型：経費申請承認フロー
    {
      id: `flow_${tenantId}_5`,
      name: '経費申請承認フロー',
      description: '経費申請の承認（組織階層ベース）',
      type: 'organization',
      documentType: 'expense',
      useOrganizationHierarchy: true,
      organizationLevels: 2, // 直属上司→部長
      conditions: [
        {
          id: 'cond_1',
          field: 'amount',
          operator: 'lt',
          value: 100000,
          description: '10万円未満は2段階承認',
        }
      ],
      isActive: true,
      isDefault: true,
      priority: 1,
      createdBy: 'system',
      createdAt: now,
      updatedAt: now,
      companyId: tenantId,
    },

    // 6. カスタム型：高額経費申請フロー（10万円以上）
    {
      id: `flow_${tenantId}_6`,
      name: '高額経費申請フロー（10万円以上）',
      description: '10万円以上の経費は経営承認が必要',
      type: 'custom',
      documentType: 'expense',
      steps: [
        {
          id: 'step_1',
          stepNumber: 1,
          name: '直属上司承認',
          mode: 'serial',
          approvers: [], // 動的に設定
          timeoutHours: 24,
          allowDelegate: true,
          allowSkip: false,
        },
        {
          id: 'step_2',
          stepNumber: 2,
          name: '部長承認',
          mode: 'serial',
          approvers: [], // 動的に設定
          timeoutHours: 48,
          allowDelegate: true,
          allowSkip: false,
        },
        {
          id: 'step_3',
          stepNumber: 3,
          name: '経営層承認',
          mode: 'parallel',
          approvers: [
            {
              id: 'user_1',
              name: '佐藤 次郎',
              email: 'sato@drm.com',
              role: 'executive',
              department: '経営',
              position: '専務取締役',
            }
          ],
          requiredApprovals: 1,
          timeoutHours: 72,
          allowDelegate: false,
          allowSkip: false,
        }
      ],
      conditions: [
        {
          id: 'cond_1',
          field: 'amount',
          operator: 'gte',
          value: 100000,
          description: '経費金額が10万円以上',
        }
      ],
      isActive: true,
      isDefault: false,
      priority: 10,
      createdBy: 'system',
      createdAt: now,
      updatedAt: now,
      companyId: tenantId,
    },
  ];
}

// テナントIDを取得する関数
function getTenantIdFromRequest(request: NextRequest): string {
  const cookieStore = cookies();
  const tenantId = cookieStore.get('tenantId')?.value || 'default';
  return tenantId;
}

// GET: 承認フロー一覧取得
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);

    // テナントのデータが初期化されていなければ初期化
    if (!approvalFlows.has(tenantId)) {
      approvalFlows.set(tenantId, initializeFlowsForTenant(tenantId));
    }

    const flows = approvalFlows.get(tenantId) || [];

    // クエリパラメータでフィルタリング
    const { searchParams } = new URL(request.url);
    const documentType = searchParams.get('documentType');
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');

    let filteredFlows = flows;

    if (documentType) {
      filteredFlows = filteredFlows.filter(f => f.documentType === documentType);
    }

    if (type) {
      filteredFlows = filteredFlows.filter(f => f.type === type);
    }

    if (isActive !== null) {
      const activeFilter = isActive === 'true';
      filteredFlows = filteredFlows.filter(f => f.isActive === activeFilter);
    }

    return NextResponse.json({
      success: true,
      data: filteredFlows,
      total: filteredFlows.length,
    });
  } catch (error) {
    console.error('Error fetching approval flows:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch approval flows' },
      { status: 500 }
    );
  }
}

// POST: 新規承認フロー作成
export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();

    // テナントのデータが初期化されていなければ初期化
    if (!approvalFlows.has(tenantId)) {
      approvalFlows.set(tenantId, initializeFlowsForTenant(tenantId));
    }

    const flows = approvalFlows.get(tenantId) || [];

    const now = new Date().toISOString();
    const newFlow: ApprovalFlow = {
      id: `flow_${tenantId}_${Date.now()}`,
      name: body.name,
      description: body.description,
      type: body.type,
      documentType: body.documentType,
      useOrganizationHierarchy: body.useOrganizationHierarchy,
      organizationLevels: body.organizationLevels,
      steps: body.steps,
      conditions: body.conditions,
      conditionalFlows: body.conditionalFlows,
      isActive: body.isActive ?? true,
      isDefault: body.isDefault ?? false,
      priority: body.priority ?? 1,
      createdBy: body.createdBy || 'user',
      createdAt: now,
      updatedAt: now,
      companyId: tenantId,
    };

    flows.push(newFlow);
    approvalFlows.set(tenantId, flows);

    return NextResponse.json({
      success: true,
      data: newFlow,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating approval flow:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create approval flow' },
      { status: 500 }
    );
  }
}

// PUT: 承認フロー更新
export async function PUT(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();

    const flows = approvalFlows.get(tenantId) || [];
    const index = flows.findIndex(f => f.id === body.id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Flow not found' },
        { status: 404 }
      );
    }

    const updatedFlow: ApprovalFlow = {
      ...flows[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    flows[index] = updatedFlow;
    approvalFlows.set(tenantId, flows);

    return NextResponse.json({
      success: true,
      data: updatedFlow,
    });
  } catch (error) {
    console.error('Error updating approval flow:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update approval flow' },
      { status: 500 }
    );
  }
}

// DELETE: 承認フロー削除
export async function DELETE(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Flow ID is required' },
        { status: 400 }
      );
    }

    const flows = approvalFlows.get(tenantId) || [];
    const filteredFlows = flows.filter(f => f.id !== id);

    if (flows.length === filteredFlows.length) {
      return NextResponse.json(
        { success: false, error: 'Flow not found' },
        { status: 404 }
      );
    }

    approvalFlows.set(tenantId, filteredFlows);

    return NextResponse.json({
      success: true,
      message: 'Flow deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting approval flow:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete approval flow' },
      { status: 500 }
    );
  }
}
