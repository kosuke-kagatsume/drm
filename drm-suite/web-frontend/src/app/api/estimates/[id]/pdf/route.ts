import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // クライアントから見積データを受け取る
    const body = await request.json();
    const { estimateData } = body;

    if (!estimateData) {
      return NextResponse.json(
        { error: '見積データが送信されていません' },
        { status: 400 },
      );
    }

    // 簡単なPDFレスポンス（実際にはpuppeteerなどでPDF生成）
    const pdfContent = generateSimplePDF(estimateData);

    return new NextResponse(pdfContent, {
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

// 簡単なPDFコンテンツ生成（実際にはpuppeteerやjsPDFを使用）
function generateSimplePDF(estimateData: any): Buffer {
  // これは暫定的な実装です
  // 実際の運用では puppeteer や jsPDF を使用してPDF生成
  const content = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(${estimateData.title || '見積書'}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f
0000000010 00000 n
0000000053 00000 n
0000000110 00000 n
0000000180 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
274
%%EOF`;

  return Buffer.from(content, 'utf-8');
}

// GET リクエスト用（クライアントサイド生成のフォールバック）
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // 見積IDを返すだけ（実際のPDF生成はクライアントサイドで実行）
    return NextResponse.json({
      estimateId: params.id,
      message: 'クライアントサイドでPDF生成を実行してください'
    });
  } catch (error) {
    console.error('エラー:', error);
    return NextResponse.json(
      { error: 'リクエスト処理中にエラーが発生しました' },
      { status: 500 },
    );
  }
}
