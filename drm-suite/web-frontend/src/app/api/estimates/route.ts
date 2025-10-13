import { NextRequest, NextResponse } from 'next/server';

// メモリ内ストレージ（本番環境ではDBを使用）
const estimates = new Map<string, any>();

/**
 * GET /api/estimates - 見積一覧取得
 */
export async function GET(request: NextRequest) {
  try {
    // メモリ内の全見積を配列として返す
    const estimateList = Array.from(estimates.values());

    console.log('[GET /api/estimates] 返却する見積データ:');
    estimateList.forEach((est) => {
      console.log('  - ID:', est.id);
      console.log('    customerName:', est.customerName);
      console.log('    customer:', est.customer);
      console.log('    items length:', est.items?.length);
      console.log('    全itemsの詳細:');
      est.items?.forEach((item: any, index: number) => {
        console.log(`      items[${index}]:`, {
          id: item.id,
          isCategory: item.isCategory,
          category: item.category,
          itemName: item.itemName,
          amount: item.amount,
          subtotal: item.subtotal,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
        });
      });
    });

    return NextResponse.json({
      estimates: estimateList,
      total: estimateList.length,
    });
  } catch (error) {
    console.error('[GET /api/estimates] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch estimates' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/estimates - 見積保存
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 見積データを検証
    if (!body.id) {
      return NextResponse.json(
        { error: 'Estimate ID is required' },
        { status: 400 },
      );
    }

    console.log('[POST /api/estimates] 受信したデータ:');
    console.log('  - id:', body.id);
    console.log('  - customerName:', body.customerName);
    console.log('  - customer:', body.customer);
    console.log('  - customerId:', body.customerId);

    // 見積を保存（IDをキーに使用）
    estimates.set(body.id, {
      ...body,
      savedAt: new Date().toISOString(),
    });

    console.log(`[POST /api/estimates] Saved estimate: ${body.id}`);
    console.log(`[POST /api/estimates] Total estimates: ${estimates.size}`);

    return NextResponse.json({
      success: true,
      id: body.id,
      message: 'Estimate saved successfully',
    });
  } catch (error) {
    console.error('[POST /api/estimates] Error:', error);
    return NextResponse.json(
      { error: 'Failed to save estimate' },
      { status: 500 },
    );
  }
}
