// src/app/api/pdf/simple/[id]/route.ts
import { NextRequest } from 'next/server';
import chromium from '@sparticuz/chromium-min';
import puppeteerCore from 'puppeteer-core';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Chromium実行パスを取得
async function getExecutablePath() {
  if (process.env.NODE_ENV === 'development') {
    // 開発環境
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  }

  // 本番環境 - Vercel
  return await chromium.executablePath(
    'https://github.com/Sparticuz/chromium/releases/download/v138.0.0/chromium-v138.0.0-pack.tar',
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  console.log(`🚀 Starting simple PDF generation for ${params.id}`);

  try {
    // 実行パスを取得
    const executablePath = await getExecutablePath();
    console.log(`📍 Using chromium at: ${executablePath}`);

    // ブラウザ起動
    const browser = await puppeteerCore.launch({
      args:
        process.env.NODE_ENV === 'development'
          ? ['--no-sandbox', '--disable-setuid-sandbox']
          : [...chromium.args, '--font-render-hinting=none', '--lang=ja-JP'],
      executablePath,
      headless: chromium.headless ?? true,
    });

    try {
      const page = await browser.newPage();

      // シンプルなHTMLコンテンツ
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
    
    body {
      font-family: 'Noto Sans JP', sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 20px;
    }
    
    h1 {
      color: #2196F3;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .info {
      margin-bottom: 30px;
    }
    
    .info p {
      margin: 5px 0;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    
    th, td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    
    th {
      background-color: #2196F3;
      color: white;
    }
    
    .total {
      text-align: right;
      font-size: 1.2em;
      font-weight: bold;
      color: #2196F3;
      margin-top: 20px;
    }
    
    .test {
      margin-top: 30px;
      padding: 10px;
      background: #f5f5f5;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <h1>見積書</h1>
  
  <div class="info">
    <p><strong>見積番号:</strong> ${params.id}</p>
    <p><strong>発行日:</strong> ${new Date().toLocaleDateString('ja-JP')}</p>
    <p><strong>お客様名:</strong> 山田 太郎 様</p>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>項目</th>
        <th>数量</th>
        <th>単価</th>
        <th>金額</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>キッチン本体工事</td>
        <td>1</td>
        <td>¥500,000</td>
        <td>¥500,000</td>
      </tr>
      <tr>
        <td>電気工事</td>
        <td>1</td>
        <td>¥150,000</td>
        <td>¥150,000</td>
      </tr>
      <tr>
        <td>配管工事</td>
        <td>1</td>
        <td>¥100,000</td>
        <td>¥100,000</td>
      </tr>
    </tbody>
  </table>
  
  <div class="total">
    合計金額: ¥750,000
  </div>
  
  <div class="test">
    <strong>日本語テスト:</strong><br>
    葛飾区・髙橋・𠮟る・㈱・①②③・〜・見積書
  </div>
</body>
</html>`;

      // HTMLを設定
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 20000,
      });

      // フォント読み込み待機
      await page.evaluateHandle('document.fonts.ready');

      // 少し待つ
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // PDF生成
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm',
        },
      });

      console.log(`✅ PDF generated: ${pdf.length} bytes`);

      return new Response(pdf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="estimate-${params.id}.pdf"`,
          'Cache-Control': 'no-store',
        },
      });
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    return new Response(
      JSON.stringify({
        error: 'PDF generation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
