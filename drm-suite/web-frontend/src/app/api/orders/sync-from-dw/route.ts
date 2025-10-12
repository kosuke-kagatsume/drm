import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// DWシステムから原価データを受信するAPI
export async function POST(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    const dwCostData = await request.json();

    // DWから送られてくるデータの形式
    // {
    //   dwOrderId: string,
    //   drmOrderId: string,
    //   actualCosts: {
    //     laborCost: number,
    //     materialCost: number,
    //     equipmentCost: number,
    //     otherCost: number,
    //     totalCost: number,
    //   },
    //   workProgress: {
    //     status: 'not_started' | 'in_progress' | 'completed',
    //     progressRate: number, // 0-100
    //     startDate?: string,
    //     completedDate?: string,
    //   },
    //   costDetails?: Array<{
    //     category: string,
    //     itemName: string,
    //     budgetAmount: number,
    //     actualAmount: number,
    //     variance: number,
    //   }>,
    //   updatedAt: string,
    // }

    const { dwOrderId, drmOrderId, actualCosts, workProgress, costDetails, updatedAt } = dwCostData;

    if (!dwOrderId || !drmOrderId) {
      return NextResponse.json(
        { success: false, error: 'dwOrderId and drmOrderId are required' },
        { status: 400 }
      );
    }

    // 1. DRM側の発注データを取得
    const orderRes = await fetch(
      `${request.nextUrl.origin}/api/orders?drmOrderId=${drmOrderId}`,
      {
        headers: {
          Cookie: `tenantId=${tenantId}`,
        },
      }
    );

    if (!orderRes.ok) {
      return NextResponse.json(
        { success: false, error: 'Order not found in DRM' },
        { status: 404 }
      );
    }

    const orderData = await orderRes.json();
    const order = orderData.order;

    // 2. 予算と実績の差異を計算
    const budgetAmount = order.totalAmount;
    const actualAmount = actualCosts.totalCost;
    const variance = budgetAmount - actualAmount;
    const varianceRate = budgetAmount > 0 ? (variance / budgetAmount) * 100 : 0;

    // 3. 発注データを更新（原価情報を追加）
    const updateRes = await fetch(
      `${request.nextUrl.origin}/api/orders`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `tenantId=${tenantId}`,
        },
        body: JSON.stringify({
          id: order.id,
          dwOrderId: dwOrderId,
          actualCosts: {
            laborCost: actualCosts.laborCost || 0,
            materialCost: actualCosts.materialCost || 0,
            equipmentCost: actualCosts.equipmentCost || 0,
            otherCost: actualCosts.otherCost || 0,
            totalCost: actualCosts.totalCost || 0,
          },
          workProgress: {
            status: workProgress.status || 'not_started',
            progressRate: workProgress.progressRate || 0,
            startDate: workProgress.startDate,
            completedDate: workProgress.completedDate,
          },
          costAnalysis: {
            budgetAmount: budgetAmount,
            actualAmount: actualAmount,
            variance: variance,
            varianceRate: varianceRate,
            isOverBudget: variance < 0,
          },
          costDetails: costDetails || [],
          dwLastUpdatedAt: updatedAt,
          dwSyncStatus: 'synced',
        }),
      }
    );

    if (!updateRes.ok) {
      throw new Error('Failed to update order with DW cost data');
    }

    const updatedOrder = await updateRes.json();

    // 🔥 工事台帳の実績原価を自動更新
    let ledgerUpdateResult = null;
    if (order.contractId) {
      try {
        const ledgerUpdateRes = await fetch(
          `${request.nextUrl.origin}/api/construction-ledgers/update-actual-cost`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Cookie: `tenantId=${tenantId}`,
            },
            body: JSON.stringify({
              contractId: order.contractId,
              orderId: order.id,
              orderNo: order.orderNo,
              actualCosts: {
                laborCost: actualCosts.laborCost || 0,
                materialCost: actualCosts.materialCost || 0,
                equipmentCost: actualCosts.equipmentCost || 0,
                otherCost: actualCosts.otherCost || 0,
                totalCost: actualCosts.totalCost || 0,
              },
              workProgress: workProgress,
              costDetails: costDetails || [],
            }),
          }
        );

        if (ledgerUpdateRes.ok) {
          ledgerUpdateResult = await ledgerUpdateRes.json();
          console.log(`✅ 工事台帳の実績原価を更新しました (発注: ${order.orderNo})`);

          // アラートがある場合はログに出力
          if (ledgerUpdateResult.data?.alerts && ledgerUpdateResult.data.alerts.length > 0) {
            console.log('⚠️ 原価アラート:', ledgerUpdateResult.data.alerts.map((a: any) => a.message).join(', '));
          }
        } else {
          console.error('⚠️ 工事台帳の実績原価更新に失敗しました');
        }
      } catch (ledgerError) {
        console.error('⚠️ 工事台帳の実績原価更新エラー:', ledgerError);
        // 工事台帳更新失敗時もエラーにはしない（発注データの更新自体は成功）
      }
    }

    return NextResponse.json({
      success: true,
      message: 'DWからの原価データを受信しました',
      data: {
        drmOrderId: drmOrderId,
        dwOrderId: dwOrderId,
        costAnalysis: {
          budgetAmount: budgetAmount,
          actualAmount: actualAmount,
          variance: variance,
          varianceRate: varianceRate.toFixed(2) + '%',
          status: variance >= 0 ? 'within_budget' : 'over_budget',
        },
        workProgress: workProgress,
        syncedAt: new Date().toISOString(),
        ledgerUpdate: ledgerUpdateResult ? {
          success: true,
          summary: ledgerUpdateResult.data?.summary,
          alerts: ledgerUpdateResult.data?.alerts,
        } : null,
      },
    });
  } catch (error) {
    console.error('Error receiving cost data from DW:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'DWからの原価データ受信に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DWシステムから原価データを能動的に取得するGETエンドポイント
export async function GET(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    const searchParams = request.nextUrl.searchParams;
    const drmOrderId = searchParams.get('drmOrderId');
    const dwOrderId = searchParams.get('dwOrderId');

    if (!drmOrderId && !dwOrderId) {
      return NextResponse.json(
        { success: false, error: 'drmOrderId or dwOrderId is required' },
        { status: 400 }
      );
    }

    // 実際の環境ではDWシステムのAPIを呼び出す
    /*
    const dwResponse = await fetch(
      `${process.env.DW_API_ENDPOINT}/orders/${dwOrderId}/costs`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.DW_API_KEY}`,
        },
      }
    );

    if (!dwResponse.ok) {
      throw new Error('Failed to fetch cost data from DW');
    }

    const dwCostData = await dwResponse.json();
    */

    // モックデータ
    const dwCostData = {
      dwOrderId: dwOrderId || `DW-${Date.now()}`,
      drmOrderId: drmOrderId,
      actualCosts: {
        laborCost: Math.floor(Math.random() * 1000000) + 500000,
        materialCost: Math.floor(Math.random() * 2000000) + 1000000,
        equipmentCost: Math.floor(Math.random() * 500000) + 200000,
        otherCost: Math.floor(Math.random() * 300000) + 100000,
        totalCost: 0,
      },
      workProgress: {
        status: 'in_progress',
        progressRate: Math.floor(Math.random() * 70) + 10,
        startDate: new Date(Date.now() - 86400000 * 15).toISOString().split('T')[0],
      },
      costDetails: [
        {
          category: '労務費',
          itemName: '作業員人件費',
          budgetAmount: 800000,
          actualAmount: 850000,
          variance: -50000,
        },
        {
          category: '材料費',
          itemName: '建材費',
          budgetAmount: 1500000,
          actualAmount: 1450000,
          variance: 50000,
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    // 合計を計算
    dwCostData.actualCosts.totalCost =
      dwCostData.actualCosts.laborCost +
      dwCostData.actualCosts.materialCost +
      dwCostData.actualCosts.equipmentCost +
      dwCostData.actualCosts.otherCost;

    // POSTメソッドと同じロジックで更新
    return POST(
      new NextRequest(request.url, {
        method: 'POST',
        headers: request.headers,
        body: JSON.stringify(dwCostData),
      })
    );
  } catch (error) {
    console.error('Error fetching cost data from DW:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'DWからの原価データ取得に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
