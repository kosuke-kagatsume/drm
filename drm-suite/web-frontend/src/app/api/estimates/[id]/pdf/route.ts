import { NextRequest, NextResponse } from 'next/server';
import { PDFService } from '@/services/pdf.service';
import { getConstructionMasters } from '@/data/construction-masters';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // 見積データを取得（実際はDBから取得）
    const estimates = JSON.parse(
      typeof window !== 'undefined'
        ? localStorage.getItem('estimates') || '[]'
        : '[]',
    );

    const estimate = estimates.find((est: any) => est.id === params.id);

    if (!estimate) {
      return NextResponse.json(
        { error: '見積が見つかりません' },
        { status: 404 },
      );
    }

    // マスタデータを取得
    const masters = getConstructionMasters();
    const customer = masters.customers?.find(
      (c: any) => c.id === estimate.customerId,
    );
    const paymentTerm = masters.paymentTerms?.find(
      (pt: any) => pt.id === estimate.paymentTerms,
    );

    // 見積データを整形
    const estimateData = {
      ...estimate,
      customer,
      paymentTerm,
    };

    // PDF生成
    const pdfBlob = await PDFService.generateEstimatePDF(estimateData);

    // Blobをバッファに変換
    const buffer = await pdfBlob.arrayBuffer();

    // PDFレスポンスを返す
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="estimate_${params.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF生成エラー:', error);
    return NextResponse.json(
      { error: 'PDF生成中にエラーが発生しました' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'email') {
      // メール送信処理（実装例）
      return NextResponse.json({
        success: true,
        message: 'PDFをメールで送信しました',
      });
    }

    return NextResponse.json(
      { error: '無効なアクションです' },
      { status: 400 },
    );
  } catch (error) {
    console.error('エラー:', error);
    return NextResponse.json(
      { error: 'リクエスト処理中にエラーが発生しました' },
      { status: 500 },
    );
  }
}
