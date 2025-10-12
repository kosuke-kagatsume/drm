import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * 工事台帳の実績原価を更新するAPI
 * DWから取得した実績原価を工事台帳に反映する
 */

interface ActualCostUpdateRequest {
  contractId: string; // 契約ID（工事台帳を特定）
  orderId: string; // 発注ID
  orderNo?: string;
  actualCosts: {
    laborCost: number; // 労務費
    materialCost: number; // 材料費
    equipmentCost: number; // 機械経費
    otherCost: number; // その他経費
    totalCost: number; // 合計
  };
  workProgress?: {
    status: 'not_started' | 'in_progress' | 'completed';
    progressRate: number; // 0-100
    startDate?: string;
    completedDate?: string;
  };
  costDetails?: Array<{
    category: string;
    itemName: string;
    budgetAmount: number;
    actualAmount: number;
    variance: number;
  }>;
}

/**
 * POST: 工事台帳の実績原価を更新
 */
export async function POST(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    const body: ActualCostUpdateRequest = await request.json();
    const { contractId, orderId, actualCosts, workProgress, costDetails } = body;

    if (!contractId) {
      return NextResponse.json(
        { success: false, error: 'Contract ID is required' },
        { status: 400 }
      );
    }

    // 1. 契約IDから工事台帳を取得
    const ledgerRes = await fetch(
      `${request.nextUrl.origin}/api/construction-ledgers?contractId=${contractId}`,
      {
        headers: {
          Cookie: `tenantId=${tenantId}`,
        },
      }
    );

    if (!ledgerRes.ok) {
      return NextResponse.json(
        { success: false, error: 'Construction ledger not found' },
        { status: 404 }
      );
    }

    const ledgerData = await ledgerRes.json();
    const ledger = ledgerData.ledger || ledgerData.ledgers?.[0];

    if (!ledger) {
      return NextResponse.json(
        { success: false, error: 'Construction ledger not found for this contract' },
        { status: 404 }
      );
    }

    // 2. 現在の実績原価を取得（なければ初期化）
    const currentActualCost = ledger.actualCost || {
      materialCost: 0,
      laborCost: 0,
      outsourcingCost: 0,
      expenseCost: 0,
      totalCost: 0,
      actualProfit: 0,
      actualProfitRate: 0,
    };

    // 3. DWの実績原価を原価科目にマッピング
    // DWの原価構造:
    //   - laborCost: 労務費
    //   - materialCost: 材料費
    //   - equipmentCost: 機械経費 → 外注費に分類
    //   - otherCost: その他経費 → 経費に分類
    const updatedActualCost = {
      materialCost: currentActualCost.materialCost + actualCosts.materialCost,
      laborCost: currentActualCost.laborCost + actualCosts.laborCost,
      outsourcingCost: currentActualCost.outsourcingCost + actualCosts.equipmentCost, // 機械経費を外注費に分類
      expenseCost: currentActualCost.expenseCost + actualCosts.otherCost, // その他経費を経費に分類
      totalCost: 0,
      actualProfit: 0,
      actualProfitRate: 0,
    };

    // 実績原価合計を計算
    updatedActualCost.totalCost =
      updatedActualCost.materialCost +
      updatedActualCost.laborCost +
      updatedActualCost.outsourcingCost +
      updatedActualCost.expenseCost;

    // 実績粗利を計算
    const contractAmount = ledger.totalContractAmount || ledger.contractAmount || 0;
    updatedActualCost.actualProfit = contractAmount - updatedActualCost.totalCost;
    updatedActualCost.actualProfitRate =
      contractAmount > 0 ? (updatedActualCost.actualProfit / contractAmount) * 100 : 0;

    // 4. 予算との差異分析を計算
    const executionBudget = ledger.executionBudget || {
      materialCost: 0,
      laborCost: 0,
      outsourcingCost: 0,
      expenseCost: 0,
      totalBudget: 0,
      expectedProfit: 0,
      expectedProfitRate: 0,
    };

    const costAnalysis = {
      budgetVsActual: {
        materialVariance: executionBudget.materialCost - updatedActualCost.materialCost,
        laborVariance: executionBudget.laborCost - updatedActualCost.laborCost,
        outsourcingVariance: executionBudget.outsourcingCost - updatedActualCost.outsourcingCost,
        expenseVariance: executionBudget.expenseCost - updatedActualCost.expenseCost,
        totalVariance: executionBudget.totalBudget - updatedActualCost.totalCost,
        varianceRate:
          executionBudget.totalBudget > 0
            ? ((executionBudget.totalBudget - updatedActualCost.totalCost) /
                executionBudget.totalBudget) *
              100
            : 0,
      },
      profitAnalysis: {
        profitVariance: executionBudget.expectedProfit - updatedActualCost.actualProfit,
        profitVarianceRate:
          executionBudget.expectedProfit > 0
            ? ((executionBudget.expectedProfit - updatedActualCost.actualProfit) /
                executionBudget.expectedProfit) *
              100
            : 0,
      },
    };

    // 5. 工事進捗を更新
    const updatedProgress = {
      ...ledger.progress,
      ...(workProgress || {}),
    };

    // 6. 原価明細を更新
    const updatedCostDetails = costDetails || ledger.costDetails || [];

    // 7. アラート判定
    const alerts = [];

    // 原価超過アラート（予算の95%超過）
    if (costAnalysis.budgetVsActual.varianceRate < -95) {
      alerts.push({
        type: 'cost_overrun',
        severity: 'critical',
        message: `原価が予算を大幅に超過しています（${Math.abs(costAnalysis.budgetVsActual.varianceRate).toFixed(1)}%超過）`,
      });
    } else if (costAnalysis.budgetVsActual.varianceRate < 0) {
      alerts.push({
        type: 'cost_overrun',
        severity: 'warning',
        message: `原価が予算を超過しています（${Math.abs(costAnalysis.budgetVsActual.varianceRate).toFixed(1)}%超過）`,
      });
    }

    // 粗利低下アラート（予定粗利の80%未満）
    if (updatedActualCost.actualProfitRate < executionBudget.expectedProfitRate * 0.8) {
      alerts.push({
        type: 'profit_decline',
        severity: 'warning',
        message: `粗利率が予定を大きく下回っています（予定: ${executionBudget.expectedProfitRate.toFixed(1)}%, 実績: ${updatedActualCost.actualProfitRate.toFixed(1)}%）`,
      });
    }

    // 赤字案件アラート
    if (updatedActualCost.actualProfit < 0) {
      alerts.push({
        type: 'loss_making',
        severity: 'critical',
        message: `赤字案件です（実績粗利: ¥${updatedActualCost.actualProfit.toLocaleString()}）`,
      });
    }

    // 8. 工事台帳を更新（アラート情報を含む）
    const updateRes = await fetch(
      `${request.nextUrl.origin}/api/construction-ledgers`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `tenantId=${tenantId}`,
        },
        body: JSON.stringify({
          id: ledger.id,
          actualCost: updatedActualCost,
          costAnalysis: costAnalysis,
          progress: updatedProgress,
          costDetails: updatedCostDetails,
          alerts: alerts,
          dwLastUpdatedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      }
    );

    if (!updateRes.ok) {
      throw new Error('Failed to update construction ledger');
    }

    const updatedLedger = await updateRes.json();

    return NextResponse.json({
      success: true,
      message: '工事台帳の実績原価を更新しました',
      data: {
        ledgerId: ledger.id,
        constructionNo: ledger.constructionNo,
        orderId: orderId,
        previousActualCost: currentActualCost,
        updatedActualCost: updatedActualCost,
        costAnalysis: costAnalysis,
        alerts: alerts,
        summary: {
          contractAmount: contractAmount,
          budgetAmount: executionBudget.totalBudget,
          actualAmount: updatedActualCost.totalCost,
          budgetVariance: costAnalysis.budgetVsActual.totalVariance,
          budgetVarianceRate: costAnalysis.budgetVsActual.varianceRate.toFixed(2) + '%',
          expectedProfit: executionBudget.expectedProfit,
          actualProfit: updatedActualCost.actualProfit,
          profitVariance: costAnalysis.profitAnalysis.profitVariance,
          status: alerts.length > 0 ? 'alert' : 'healthy',
        },
      },
    });
  } catch (error) {
    console.error('Error updating construction ledger actual cost:', error);
    return NextResponse.json(
      {
        success: false,
        error: '工事台帳の実績原価更新に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET: 工事台帳の実績原価情報を取得（確認用）
 */
export async function GET(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    const searchParams = request.nextUrl.searchParams;
    const contractId = searchParams.get('contractId');

    if (!contractId) {
      return NextResponse.json(
        { success: false, error: 'Contract ID is required' },
        { status: 400 }
      );
    }

    // 契約IDから工事台帳を取得
    const ledgerRes = await fetch(
      `${request.nextUrl.origin}/api/construction-ledgers?contractId=${contractId}`,
      {
        headers: {
          Cookie: `tenantId=${tenantId}`,
        },
      }
    );

    if (!ledgerRes.ok) {
      return NextResponse.json(
        { success: false, error: 'Construction ledger not found' },
        { status: 404 }
      );
    }

    const ledgerData = await ledgerRes.json();
    const ledger = ledgerData.ledger || ledgerData.ledgers?.[0];

    return NextResponse.json({
      success: true,
      actualCost: ledger?.actualCost || null,
      costAnalysis: ledger?.costAnalysis || null,
      ledger: {
        id: ledger?.id,
        constructionNo: ledger?.constructionNo,
        constructionName: ledger?.constructionName,
        contractAmount: ledger?.totalContractAmount,
        executionBudget: ledger?.executionBudget,
      },
    });
  } catch (error) {
    console.error('Error fetching construction ledger actual cost:', error);
    return NextResponse.json(
      {
        success: false,
        error: '工事台帳の実績原価取得に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
