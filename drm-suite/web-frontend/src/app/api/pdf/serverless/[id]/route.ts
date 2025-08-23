// src/app/api/pdf/serverless/[id]/route.ts
import { NextRequest } from 'next/server';

export const runtime = 'edge'; // Edge Runtime for better performance
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  console.log(`🚀 Generating PDF using external service for ${params.id}`);

  try {
    // HTMLコンテンツを準備
    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>見積書 ${params.id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4;
      margin: 20mm;
    }
    
    body {
      font-family: 'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 20px;
      background: white;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    
    h1 {
      color: #2196F3;
      font-size: 28px;
      margin-bottom: 10px;
    }
    
    .info {
      margin-bottom: 30px;
      background: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
    }
    
    .info p {
      margin: 5px 0;
      font-size: 14px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    
    th {
      background-color: #2196F3;
      color: white;
      font-weight: 500;
    }
    
    td {
      font-size: 14px;
    }
    
    .text-right {
      text-align: right;
    }
    
    .text-center {
      text-align: center;
    }
    
    .total-section {
      margin-top: 30px;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 5px;
    }
    
    .total {
      text-align: right;
      font-size: 20px;
      font-weight: bold;
      color: #2196F3;
      margin-top: 10px;
    }
    
    .test {
      margin-top: 40px;
      padding: 15px;
      background: #e3f2fd;
      border-radius: 5px;
      border-left: 4px solid #2196F3;
    }
    
    .footer {
      margin-top: 50px;
      text-align: center;
      font-size: 12px;
      color: #666;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>見積書</h1>
    <p style="color: #666;">ESTIMATE</p>
  </div>
  
  <div class="info">
    <p><strong>見積番号:</strong> ${params.id}</p>
    <p><strong>発行日:</strong> ${new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <p><strong>有効期限:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <p><strong>お客様名:</strong> 山田 太郎 様</p>
    <p><strong>住所:</strong> 東京都港区麻布十番1-2-3</p>
  </div>
  
  <table>
    <thead>
      <tr>
        <th style="width: 50%;">項目</th>
        <th class="text-center" style="width: 10%;">数量</th>
        <th class="text-center" style="width: 10%;">単位</th>
        <th class="text-right" style="width: 15%;">単価</th>
        <th class="text-right" style="width: 15%;">金額</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>キッチン本体工事</td>
        <td class="text-center">1</td>
        <td class="text-center">式</td>
        <td class="text-right">¥500,000</td>
        <td class="text-right">¥500,000</td>
      </tr>
      <tr>
        <td>電気配線工事一式</td>
        <td class="text-center">1</td>
        <td class="text-center">式</td>
        <td class="text-right">¥150,000</td>
        <td class="text-right">¥150,000</td>
      </tr>
      <tr>
        <td>給排水配管工事</td>
        <td class="text-center">1</td>
        <td class="text-center">式</td>
        <td class="text-right">¥100,000</td>
        <td class="text-right">¥100,000</td>
      </tr>
      <tr>
        <td>内装仕上げ工事</td>
        <td class="text-center">1</td>
        <td class="text-center">式</td>
        <td class="text-right">¥200,000</td>
        <td class="text-right">¥200,000</td>
      </tr>
    </tbody>
  </table>
  
  <div class="total-section">
    <p><strong>小計:</strong> ¥950,000</p>
    <p><strong>消費税 (10%):</strong> ¥95,000</p>
    <div class="total">
      合計金額: ¥1,045,000
    </div>
  </div>
  
  <div class="test">
    <strong>日本語文字テスト:</strong><br>
    葛飾区（かつしかく）・髙橋（たかはし）・𠮟る（しかる）・㈱（株式会社）<br>
    ①②③④⑤・ⅠⅡⅢ・〜（から）・見積書・工事一式
  </div>
  
  <div class="footer">
    <p>DRM Suite - 段取り関係管理システム</p>
    <p>Generated at ${new Date().toISOString()}</p>
  </div>
</body>
</html>`;

    // PDFRocket API または Puppeteer Web Service を使用
    // ここでは例としてPDFRocket APIを使用
    const pdfResponse = await fetch('https://api.pdfrocket.io/v1/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'X-API-Key': process.env.PDFROCKET_API_KEY || '', // 必要に応じてAPIキーを設定
      },
      body: JSON.stringify({
        html: html,
        options: {
          format: 'A4',
          printBackground: true,
          margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm',
          },
          displayHeaderFooter: false,
          preferCSSPageSize: true,
          landscape: false,
        },
      }),
    });

    if (!pdfResponse.ok) {
      // フォールバック: HTMLをそのまま返す（ブラウザの印刷機能を使用）
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `inline; filename="estimate-${params.id}.html"`,
        },
      });
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="estimate-${params.id}.pdf"`,
        'Cache-Control': 'no-store',
        'X-PDF-Engine': 'external-service',
      },
    });
  } catch (error) {
    console.error('❌ PDF generation error:', error);

    // エラー時はHTMLを返す
    const fallbackHtml = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>見積書 ${params.id}</title>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    h1 { color: #2196F3; }
    .error { color: red; margin: 20px 0; }
    .print-button { 
      background: #2196F3; 
      color: white; 
      padding: 10px 20px; 
      border: none; 
      border-radius: 5px; 
      cursor: pointer; 
      font-size: 16px;
    }
  </style>
</head>
<body>
  <h1>見積書 ${params.id}</h1>
  <div class="error">PDF生成サービスが一時的に利用できません。</div>
  <p>ブラウザの印刷機能を使用してPDFを作成してください。</p>
  <button class="print-button" onclick="window.print()">印刷 / PDF保存</button>
</body>
</html>`;

    return new Response(fallbackHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  }
}
