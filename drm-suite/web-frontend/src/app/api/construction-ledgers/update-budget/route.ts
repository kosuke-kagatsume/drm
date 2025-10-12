import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * 工事台帳の予算を更新するAPI
 * 発注データから自動的に原価を集計して実行予算に反映する
 */

interface BudgetUpdateRequest {
  contractId: string; // 契約ID（工事台帳を特定）
  orderId: string; // 発注ID
  orderAmount: number; // 発注金額
  orderItems: Array<{
    category: string; // 工事分類
    name: string; // 工事名
    amount: number; // 金額
  }>;
  costCategory: 'material' | 'labor' | 'outsourcing' | 'expense'; // 原価科目
  operation: 'add' | 'subtract' | 'update'; // 操作（追加・減算・更新）
}

/**
 * 工事分類から原価科目を自動判定
 */
function determineCostCategory(workCategory: string): 'material' | 'labor' | 'outsourcing' | 'expense' {
  const category = workCategory.toLowerCase();

  // 材料費
  if (
    category.includes('材料') ||
    category.includes('資材') ||
    category.includes('設備') ||
    category.includes('器具') ||
    category.includes('建材')
  ) {
    return 'material';
  }

  // 労務費
  if (
    category.includes('大工') ||
    category.includes('職人') ||
    category.includes('作業員') ||
    category.includes('労務')
  ) {
    return 'labor';
  }

  // 外注費（デフォルト）
  if (
    category.includes('工事') ||
    category.includes('施工') ||
    category.includes('基礎') ||
    category.includes('屋根') ||
    category.includes('内装') ||
    category.includes('外装') ||
    category.includes('電気') ||
    category.includes('配管') ||
    category.includes('塗装')
  ) {
    return 'outsourcing';
  }

  // 経費
  if (
    category.includes('運搬') ||
    category.includes('諸経費') ||
    category.includes('管理') ||
    category.includes('仮設') ||
    category.includes('廃棄')
  ) {
    return 'expense';
  }

  // デフォルトは外注費
  return 'outsourcing';
}

/**
 * POST: 工事台帳の予算を更新
 */
export async function POST(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    const body = await request.json();
    const { contractId, orderId, orderAmount, orderItems, operation = 'add' } = body;

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

    // 2. 発注項目ごとに原価科目を判定して集計
    const costBreakdown = {
      materialCost: 0,
      laborCost: 0,
      outsourcingCost: 0,
      expenseCost: 0,
    };

    if (orderItems && orderItems.length > 0) {
      orderItems.forEach((item: any) => {
        const category = determineCostCategory(item.category || item.name);

        switch (category) {
          case 'material':
            costBreakdown.materialCost += item.amount;
            break;
          case 'labor':
            costBreakdown.laborCost += item.amount;
            break;
          case 'outsourcing':
            costBreakdown.outsourcingCost += item.amount;
            break;
          case 'expense':
            costBreakdown.expenseCost += item.amount;
            break;
        }
      });
    } else {
      // 項目が無い場合は全額を外注費として扱う
      costBreakdown.outsourcingCost = orderAmount;
    }

    // 3. 現在の実行予算を取得
    const currentBudget = ledger.executionBudget || {
      materialCost: 0,
      laborCost: 0,
      outsourcingCost: 0,
      expenseCost: 0,
      totalBudget: 0,
      expectedProfit: 0,
      expectedProfitRate: 0,
    };

    // 4. 予算を更新（加算または減算）
    const multiplier = operation === 'subtract' ? -1 : 1;

    const updatedBudget = {
      materialCost: currentBudget.materialCost + (costBreakdown.materialCost * multiplier),
      laborCost: currentBudget.laborCost + (costBreakdown.laborCost * multiplier),
      outsourcingCost: currentBudget.outsourcingCost + (costBreakdown.outsourcingCost * multiplier),
      expenseCost: currentBudget.expenseCost + (costBreakdown.expenseCost * multiplier),
      totalBudget: 0,
      expectedProfit: 0,
      expectedProfitRate: 0,
    };

    // 合計予算を計算
    updatedBudget.totalBudget =
      updatedBudget.materialCost +
      updatedBudget.laborCost +
      updatedBudget.outsourcingCost +
      updatedBudget.expenseCost;

    // 予定粗利を計算
    const contractAmount = ledger.totalContractAmount || ledger.contractAmount || 0;
    updatedBudget.expectedProfit = contractAmount - updatedBudget.totalBudget;
    updatedBudget.expectedProfitRate =
      contractAmount > 0 ? (updatedBudget.expectedProfit / contractAmount) * 100 : 0;

    // 5. 発注情報を追加
    const updatedOrders = ledger.orders || [];
    if (orderId && operation === 'add') {
      // 既存の発注IDが無いか確認
      const existingOrderIndex = updatedOrders.findIndex((o: any) => o.orderId === orderId);
      if (existingOrderIndex === -1) {
        updatedOrders.push({
          orderId: orderId,
          orderNo: body.orderNo || orderId,
          partnerName: body.partnerName || '協力会社',
          orderAmount: orderAmount,
          status: 'pending',
        });
      }
    }

    // 6. 工事台帳を更新
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
          executionBudget: updatedBudget,
          orders: updatedOrders,
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
      message: '工事台帳の予算を更新しました',
      data: {
        ledgerId: ledger.id,
        constructionNo: ledger.constructionNo,
        orderId: orderId,
        costBreakdown: costBreakdown,
        previousBudget: currentBudget,
        updatedBudget: updatedBudget,
        budgetChange: {
          material: costBreakdown.materialCost * multiplier,
          labor: costBreakdown.laborCost * multiplier,
          outsourcing: costBreakdown.outsourcingCost * multiplier,
          expense: costBreakdown.expenseCost * multiplier,
          total: orderAmount * multiplier,
        },
      },
    });
  } catch (error) {
    console.error('Error updating construction ledger budget:', error);
    return NextResponse.json(
      {
        success: false,
        error: '工事台帳の予算更新に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET: 工事台帳の予算情報を取得（確認用）
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
      budget: ledger?.executionBudget || null,
      ledger: {
        id: ledger?.id,
        constructionNo: ledger?.constructionNo,
        constructionName: ledger?.constructionName,
        contractAmount: ledger?.totalContractAmount,
      },
    });
  } catch (error) {
    console.error('Error fetching construction ledger budget:', error);
    return NextResponse.json(
      {
        success: false,
        error: '工事台帳の予算取得に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
