// src/app/api/pdf/guaranteed/[id]/route.ts
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Vercel timeout設定

// 開発環境用の設定
const isDev = process.env.NODE_ENV === 'development';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    console.log(`📄 Generating guaranteed PDF for estimate ${params.id}`);

    // オンラインフォント使用（確実に動作する方式）
    console.log(`🌐 Using online fonts for guaranteed compatibility`);

    // 見積データ（簡易版）
    const estimateData = {
      id: params.id,
      title: 'キッチンリフォーム工事一式',
      issuedAt: new Date().toISOString().slice(0, 10),
      validUntil: '2025-09-22',
      customer: {
        name: '山田 太郎',
        tel: '03-1234-5678',
        email: 'yamada@example.com',
        address: '東京都港区麻布十番1-2-3',
      },
      items: [
        {
          name: 'キッチン本体工事',
          qty: 12,
          unit: '式',
          price: 40000,
          amount: 480000,
        },
        {
          name: '電気配線工事一式',
          qty: 3,
          unit: '式',
          price: 80000,
          amount: 240000,
        },
        {
          name: 'システムキッチンIH・食洗機・レンジフード設置工事',
          qty: 1,
          unit: '式',
          price: 780000,
          amount: 780000,
        },
        {
          name: 'タイル・クロス・フローリング・建具・設備機器工事',
          qty: 1,
          unit: '式',
          price: 320000,
          amount: 320000,
        },
      ],
      totals: {
        subtotal: 1820000,
        tax: 182000,
        total: 2002000,
      },
    };

    const html = `
<!doctype html><html lang="ja"><head><meta charset="utf-8"/>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=block" rel="stylesheet">
<style>
@font-face{font-family:'Noto Sans JP';src:url('https://fonts.gstatic.com/s/notosansjp/v52/nKKF-GM_FYFRJvXzVXaAPe97P0Q_9mql0Q.woff2') format('woff2');font-weight:400;font-display:block;unicode-range:U+3000-30FF,U+4E00-9FAF,U+FF00-FFEF;}
@font-face{font-family:'Noto Sans JP';src:url('https://fonts.gstatic.com/s/notosansjp/v52/nKKU-GM_FYFRJvXzVXaAPe9pdP_jCw.woff2') format('woff2');font-weight:500;font-display:block;unicode-range:U+3000-30FF,U+4E00-9FAF,U+FF00-FFEF;}
@font-face{font-family:'Noto Sans JP';src:url('https://fonts.gstatic.com/s/notosansjp/v52/nKKU-GM_FYFRJvXzVXaAPe97dP_jCw.woff2') format('woff2');font-weight:700;font-display:block;unicode-range:U+3000-30FF,U+4E00-9FAF,U+FF00-FFEF;}
*{font-family:'Noto Sans JP',system-ui,-apple-system,'Segoe UI',sans-serif !important;box-sizing:border-box;margin:0;padding:0;}
@page{size:A4;margin:16mm 14mm;}
body{-webkit-print-color-adjust:exact;print-color-adjust:exact;line-break:strict;word-break:normal;line-height:1.45;margin:0;font-size:11pt;color:#111;}
.header{text-align:center;margin-bottom:20mm;}
.header h1{font-size:24pt;font-weight:700;color:#2196F3;margin-bottom:8mm;}
.estimate-info{display:flex;justify-content:space-between;margin-bottom:8mm;font-size:10pt;}
.estimate-meta{text-align:right;color:#333;}
.title-section{text-align:center;margin-bottom:8mm;}
.title-section h2{font-size:16pt;color:#2196F3;font-weight:500;}
.customer-section{margin-bottom:8mm;}
.customer-section h3{font-size:12pt;font-weight:700;margin-bottom:4mm;}
.customer-box{background:#f2f2f2;padding:8mm;font-size:10pt;border:1px solid #999;}
.customer-box div{margin-bottom:2mm;}
.customer-box div:last-child{margin-bottom:0;}
.items-section{margin-bottom:8mm;}
.items-section h3{font-size:12pt;font-weight:700;margin-bottom:4mm;}
table{width:100%;border-collapse:collapse;font-size:9pt;border:1px solid #999;}
th,td{border:1px solid #999;padding:4mm 3mm;vertical-align:top;}
th{background:#2196F3;color:white;text-align:left;font-weight:500;}
.center{text-align:center;}
.right{text-align:right;}
.summary{text-align:right;margin:8mm 0;}
.summary-box{display:inline-block;text-align:left;font-size:10pt;min-width:180px;}
.summary-row{display:flex;justify-content:space-between;margin-bottom:2mm;}
.summary-total{border-top:2px solid #333;padding-top:3mm;margin-top:4mm;font-size:14pt;font-weight:700;color:#2196F3;}
.footer{text-align:center;margin-top:20mm;font-size:8pt;color:#666;border-top:1px solid #eee;padding-top:4mm;}
.debug{position:fixed;top:0;right:0;background:rgba(255,0,0,0.9);color:white;padding:5px;font-family:monospace;font-size:8pt;z-index:9999;}
</style>
</head><body>
  <div class="debug">🤖 PUPPETEER+Base64 FONTS</div>
  
  <div class="header">
    <h1>見積書</h1>
  </div>
  
  <div class="estimate-info">
    <div></div>
    <div class="estimate-meta">
      <div>見積番号: ${estimateData.id}</div>
      <div>見積日: ${estimateData.issuedAt}</div>
      <div>有効期限: ${estimateData.validUntil}</div>
    </div>
  </div>
  
  <div class="title-section">
    <h2>${estimateData.title}</h2>
  </div>

  <div class="customer-section">
    <h3>お客様情報</h3>
    <div class="customer-box">
      <div>${estimateData.customer.name} 様</div>
      <div>電話番号: ${estimateData.customer.tel}</div>
      <div>メール: ${estimateData.customer.email}</div>
      <div>住所: ${estimateData.customer.address}</div>
    </div>
  </div>

  <div class="items-section">
    <h3>工事明細</h3>
    <table>
      <thead>
        <tr>
          <th style="width:60%">項目名</th>
          <th class="center" style="width:10%">数量</th>
          <th class="center" style="width:10%">単位</th>
          <th class="right" style="width:20%">単価</th>
          <th class="right" style="width:20%">金額</th>
        </tr>
      </thead>
      <tbody>
        ${estimateData.items
          .map(
            (item) => `
          <tr>
            <td>${item.name}</td>
            <td class="center">${item.qty}</td>
            <td class="center">${item.unit}</td>
            <td class="right">¥${item.price.toLocaleString('ja-JP')}</td>
            <td class="right">¥${item.amount.toLocaleString('ja-JP')}</td>
          </tr>
        `,
          )
          .join('')}
      </tbody>
    </table>
  </div>

  <div class="summary">
    <div class="summary-box">
      <div class="summary-row">
        <span>小計:</span>
        <span>¥${estimateData.totals.subtotal.toLocaleString('ja-JP')}</span>
      </div>
      <div class="summary-row">
        <span>消費税(10%):</span>
        <span>¥${estimateData.totals.tax.toLocaleString('ja-JP')}</span>
      </div>
      <div class="summary-total summary-row">
        <span>合計金額:</span>
        <span>¥${estimateData.totals.total.toLocaleString('ja-JP')}</span>
      </div>
    </div>
  </div>

  <div style="margin-top:10mm;font-size:10pt;">
    <div><strong>グリフ確認テスト：</strong></div>
    <div>葛・髙・𠮟・㈱・①②③・ⅠⅡⅢ・〜・—・ｶﾅ/カナ・見積書・工事・管理費</div>
  </div>

  <div class="footer">
    <div>DRM Suite - 段取り関係管理システム</div>
    <div>発行日: ${new Date().toLocaleDateString('ja-JP')}</div>
    <div>🔧 Rendered by Puppeteer with Base64 Embedded Fonts</div>
  </div>
</body></html>`;

    // Puppeteerの設定
    let browser;

    if (isDev) {
      // 開発環境: puppeteer-coreを使用
      const puppeteerCore = await import('puppeteer-core');
      browser = await puppeteerCore.default.launch({
        executablePath:
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
        ],
        defaultViewport: {
          width: 794,
          height: 1123,
          deviceScaleFactor: 2,
        },
      });
    } else {
      // 本番環境: chromium-sparticuzとpuppeteer-coreを使用
      try {
        const [chromium, puppeteerCore] = await Promise.all([
          import('@sparticuz/chromium'),
          import('puppeteer-core'),
        ]);

        // Chromiumの設定
        chromium.default.setHeadlessMode = true;
        chromium.default.setGraphicsMode = false;

        const executablePath = await chromium.default.executablePath();
        console.log(`🔍 Chromium binary path: ${executablePath}`);

        browser = await puppeteerCore.default.launch({
          args: [
            ...chromium.default.args,
            '--font-render-hinting=none',
            '--lang=ja-JP',
          ],
          executablePath: executablePath,
          headless: chromium.default.headless,
          defaultViewport: {
            width: 794,
            height: 1123,
            deviceScaleFactor: 2,
          },
        });
      } catch (error) {
        console.error('❌ Failed to launch browser with chromium:', error);

        // 最終フォールバック: 通常のpuppeteerを試す
        try {
          const puppeteer = await import('puppeteer');
          browser = await puppeteer.default.launch({
            headless: true,
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu',
              '--font-render-hinting=none',
              '--lang=ja-JP',
            ],
            defaultViewport: {
              width: 794,
              height: 1123,
              deviceScaleFactor: 2,
            },
          });
          console.log('✅ Using fallback puppeteer');
        } catch (fallbackError) {
          console.error('❌ Fallback puppeteer also failed:', fallbackError);
          throw new Error('Could not launch any browser instance');
        }
      }
    }

    try {
      const page = await browser.newPage();
      await page.emulateMediaType('print');

      console.log('⏳ Loading page with fonts...');
      // フォント完全ロード待ち（延長版）
      await page.goto(`data:text/html,${encodeURIComponent(html)}`, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      // 個別フォント読み込み確認
      await page.evaluate(async () => {
        const fontPromises = [];
        const fonts = [
          new FontFace(
            'Noto Sans JP',
            "url('https://fonts.gstatic.com/s/notosansjp/v52/nKKF-GM_FYFRJvXzVXaAPe97P0Q_9mql0Q.woff2')",
            { weight: '400' },
          ),
          new FontFace(
            'Noto Sans JP',
            "url('https://fonts.gstatic.com/s/notosansjp/v52/nKKU-GM_FYFRJvXzVXaAPe9pdP_jCw.woff2')",
            { weight: '500' },
          ),
          new FontFace(
            'Noto Sans JP',
            "url('https://fonts.gstatic.com/s/notosansjp/v52/nKKU-GM_FYFRJvXzVXaAPe97dP_jCw.woff2')",
            { weight: '700' },
          ),
        ];

        for (const font of fonts) {
          fontPromises.push(
            font.load().then(() => {
              document.fonts.add(font);
              return font.family + ' ' + font.weight + ' loaded';
            }),
          );
        }

        const results = await Promise.all(fontPromises);
        console.log('FontFace API results:', results);
        return results;
      });

      await page.evaluateHandle('document.fonts.ready');
      await page.waitForFunction('document.fonts.status === "loaded"', {
        timeout: 20000,
      });
      await page.waitForTimeout(500); // レイアウト安定のため

      // フォント状態確認
      const fontStatus = await page.evaluate(() => ({
        fontsReady: document.fonts.status,
        fontsSize: document.fonts.size,
        userAgent: navigator.userAgent.includes('HeadlessChrome')
          ? 'Headless Chrome'
          : 'Regular Browser',
      }));

      console.log('🎨 Font status:', fontStatus);

      const pdf = await page.pdf({
        printBackground: true,
        preferCSSPageSize: true,
        displayHeaderFooter: false,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      });

      console.log(
        `✅ Guaranteed PDF generated successfully, size: ${pdf.length} bytes`,
      );

      return new Response(pdf, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="guaranteed-${params.id}.pdf"`,
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-PDF-Engine': 'puppeteer-inline-fonts',
          'X-PDF-Size': pdf.length.toString(),
          'X-Generated-At': new Date().toISOString(),
        },
      });
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('❌ Guaranteed PDF generation failed:', error);

    return new Response(
      JSON.stringify({
        error: 'Guaranteed PDF generation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        estimateId: params.id,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
}

// POST メソッドでも対応
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  return GET(req, { params });
}
