// src/app/api/pdf/estimate/[id]/route.ts
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs'; // ← 重要：Edge ではなく Node 必須
export const dynamic = 'force-dynamic'; // 最新データ反映

// 開発環境用の設定
const isDev = process.env.NODE_ENV === 'development';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = params;

  try {
    // セキュリティトークンを生成（簡易実装）
    const token = Buffer.from(`${id}-${Date.now()}`).toString('base64');

    // 印刷用ページのURLを構築
    const printableUrl = new URL(
      `/pdf/printable/${id}?t=${encodeURIComponent(token)}`,
      req.url,
    ).toString();

    console.log(`📄 Generating PDF for estimate ${id}`);
    console.log(`📍 Printable URL: ${printableUrl}`);

    // Puppeteerの設定
    const browserConfig = isDev
      ? {
          // 開発環境: ローカルのChromeを使用
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
        }
      : {
          // 本番環境: Serverless Chrome
          args: chromium.args,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
        };

    const browser = await puppeteer.launch({
      ...browserConfig,
      defaultViewport: {
        width: 794, // A4 width at 96dpi
        height: 1123, // A4 height at 96dpi
        deviceScaleFactor: 2,
      },
    });

    try {
      const page = await browser.newPage();

      // 印刷メディアタイプを設定
      await page.emulateMediaType('print');

      // ページを読み込み
      await page.goto(printableUrl, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      // フォント読み込み完了待ち（超重要）
      console.log('⏳ Waiting for fonts to load...');
      await page.evaluateHandle('document.fonts.ready');
      await page.waitForFunction('document.fonts.status === "loaded"', {
        timeout: 30000,
      });

      // 追加：個別フォントの読み込み完了確認
      await page.evaluate(async () => {
        const fontPromises = [];
        const fonts = [
          new FontFace('Noto Sans JP', 'url(/fonts/NotoSansJP-Regular.ttf)', {
            weight: '400',
          }),
          new FontFace('Noto Sans JP', 'url(/fonts/NotoSansJP-Medium.ttf)', {
            weight: '500',
          }),
          new FontFace('Noto Sans JP', 'url(/fonts/NotoSansJP-Bold.ttf)', {
            weight: '700',
          }),
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

      // レイアウト安定のためにさらに余裕を
      await new Promise((resolve) => setTimeout(resolve, 200));

      // フォント配信が200で返っているかを検証
      const fontStatus = await page.evaluate(async () => {
        const results = {};
        const fonts = [
          '/fonts/NotoSansJP-Regular.ttf',
          '/fonts/NotoSansJP-Medium.ttf',
          '/fonts/NotoSansJP-Bold.ttf',
        ];

        for (const fontUrl of fonts) {
          try {
            const response = await fetch(fontUrl, { cache: 'force-cache' });
            results[fontUrl] = response.status;
          } catch (error) {
            results[fontUrl] = 'error';
          }
        }

        // 日本語テキストのフォント確認
        const testElement = document.createElement('div');
        testElement.style.fontFamily = "'Noto Sans JP', sans-serif";
        testElement.style.fontWeight = '400';
        testElement.textContent = '見積書①②③髙𠮟〜';
        testElement.style.position = 'absolute';
        testElement.style.left = '-9999px';
        document.body.appendChild(testElement);

        const computedStyle = window.getComputedStyle(testElement);
        const actualFont = computedStyle.fontFamily;

        document.body.removeChild(testElement);

        return {
          fontFiles: results,
          actualFont,
          fontsReady: document.fonts.status,
          fontsSize: document.fonts.size,
        };
      });

      console.log(`🎨 Font verification:`, fontStatus);

      // フォントが正しく読み込まれていない場合はエラー
      const hasValidFonts = Object.values(fontStatus.fontFiles).every(
        (status) => status === 200,
      );
      if (!hasValidFonts) {
        console.error('❌ Some fonts failed to load:', fontStatus.fontFiles);
      }

      // デバッグ用：Puppeteerエンジン確認の可視化
      await page.evaluate(() => {
        // デバッグ情報をページに挿入
        const debugDiv = document.createElement('div');
        debugDiv.id = 'puppeteer-debug';
        debugDiv.style.cssText = `
          position: fixed; 
          top: 0; 
          right: 0; 
          background: rgba(255,0,0,0.9); 
          color: white; 
          padding: 10px; 
          font-family: monospace; 
          font-size: 12px; 
          z-index: 9999;
          max-width: 300px;
        `;
        debugDiv.innerHTML = `
          <div>🤖 PUPPETEER ENGINE ACTIVE</div>
          <div>📊 Fonts Status: ${document.fonts.status}</div>
          <div>📦 Fonts Count: ${document.fonts.size}</div>
          <div>🎨 User Agent: ${navigator.userAgent.includes('HeadlessChrome') ? 'Headless Chrome' : 'Regular Browser'}</div>
          <div>🌍 URL: ${location.href}</div>
          <div>⏰ Time: ${new Date().toLocaleTimeString()}</div>
        `;
        document.body.appendChild(debugDiv);

        // 日本語テキストサンプルも追加
        const sampleDiv = document.createElement('div');
        sampleDiv.style.cssText = `
          position: fixed; 
          bottom: 0; 
          left: 0; 
          background: rgba(0,0,255,0.9); 
          color: white; 
          padding: 10px; 
          font-family: 'Noto Sans JP', sans-serif; 
          z-index: 9999;
        `;
        sampleDiv.innerHTML = '📝 フォントテスト: 見積書①②③髙𠮟〜';
        document.body.appendChild(sampleDiv);

        console.log('🔍 Debug visualization added to page');
      });

      // PDFを生成
      const pdf = await page.pdf({
        printBackground: true,
        preferCSSPageSize: true, // @page size を優先
        displayHeaderFooter: false,
        margin: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      });

      console.log(
        `✅ PDF generated successfully for estimate ${id}, size: ${pdf.length} bytes`,
      );

      return new Response(pdf, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="estimate_${id}_${new Date().getTime()}.pdf"`,
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-PDF-Size': pdf.length.toString(),
          'X-Generated-At': new Date().toISOString(),
        },
      });
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('❌ PDF generation failed:', error);

    return new Response(
      JSON.stringify({
        error: 'PDF generation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        estimateId: id,
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

// POST メソッドでも対応（必要に応じて）
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  return GET(req, { params });
}
