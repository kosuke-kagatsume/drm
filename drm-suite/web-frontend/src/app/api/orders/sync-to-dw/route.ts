import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// DWシステムへの発注データ送信API
export async function POST(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // 1. 発注データを取得
    const orderRes = await fetch(
      `${request.nextUrl.origin}/api/orders?id=${orderId}`,
      {
        headers: {
          Cookie: `tenantId=${tenantId}`,
        },
      }
    );

    if (!orderRes.ok) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const orderData = await orderRes.json();
    const order = orderData.order;

    // 2. DWシステムへ送信するデータを整形
    const dwOrderData = {
      drmOrderId: order.drmOrderId,
      tenantId: order.tenantId,
      contractInfo: {
        contractNo: order.contractNo,
        projectName: order.projectName,
        projectType: order.projectType,
        contractSignedDate: order.contractSignedDate,
      },
      partnerInfo: {
        partnerId: order.partnerId,
        partnerName: order.partnerName,
      },
      workItems: order.workItems.map((item: any) => ({
        id: item.id,
        category: item.category,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        amount: item.amount,
        notes: item.notes || '',
      })),
      amounts: {
        subtotal: order.subtotal,
        taxAmount: order.taxAmount,
        totalAmount: order.totalAmount,
      },
      deadline: order.orderDeadline,
      createdAt: order.createdAt,
      syncedAt: new Date().toISOString(),
    };

    // 3. DWシステムへAPI送信（実際の環境ではDWのエンドポイントに送信）
    // ここではモックとして、DW側のIDを生成して返す
    const dwOrderId = `DW-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    // 実際のDW連携では以下のようなコードになる想定
    /*
    const dwResponse = await fetch(process.env.DW_API_ENDPOINT + '/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DW_API_KEY}`,
      },
      body: JSON.stringify(dwOrderData),
    });

    if (!dwResponse.ok) {
      throw new Error('DW sync failed');
    }

    const dwResult = await dwResponse.json();
    const dwOrderId = dwResult.dwOrderId;
    */

    // 4. 発注データを更新（DW側のIDと同期ステータスを保存）
    const updateRes = await fetch(
      `${request.nextUrl.origin}/api/orders`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `tenantId=${tenantId}`,
        },
        body: JSON.stringify({
          id: orderId,
          dwOrderId: dwOrderId,
          dwSyncStatus: 'synced',
          lastSyncedAt: new Date().toISOString(),
        }),
      }
    );

    if (!updateRes.ok) {
      throw new Error('Failed to update order sync status');
    }

    return NextResponse.json({
      success: true,
      message: 'DWシステムへの送信が完了しました',
      data: {
        drmOrderId: order.drmOrderId,
        dwOrderId: dwOrderId,
        syncStatus: 'synced',
        syncedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error syncing order to DW:', error);

    // エラー時は発注のステータスをerrorに更新
    const { orderId } = await request.json();
    if (orderId) {
      await fetch(
        `${request.nextUrl.origin}/api/orders`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Cookie: `tenantId=${cookies().get('tenantId')?.value || 'demo-tenant'}`,
          },
          body: JSON.stringify({
            id: orderId,
            dwSyncStatus: 'error',
            lastSyncError: error instanceof Error ? error.message : 'Unknown error',
          }),
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'DWシステムへの送信に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
