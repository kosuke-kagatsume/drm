// 改善版 見積書PDF生成API
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const isDev = process.env.NODE_ENV === 'development';

// PDF用のHTMLテンプレート生成
function generateEstimateHTML(estimate: any): string {
  const {
    id,
    title,
    customer,
    items,
    totals,
    projectInfo,
    validUntil,
    notes,
    terms,
  } = estimate;

  // 項目を処理
  const sections = groupItemsBySection(items);

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>見積書 - ${title}</title>
  
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet">
  
  <style>
    /* リセットと基本設定 */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 10pt;
      line-height: 1.6;
      color: #333;
      background: white;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    @page {
      size: A4;
      margin: 15mm;
    }
    
    .page {
      max-width: 210mm;
      margin: 0 auto;
      padding: 20mm 15mm;
      background: white;
      position: relative;
    }
    
    /* ヘッダー */
    .header {
      position: relative;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
    }
    
    .header h1 {
      font-size: 28pt;
      font-weight: 700;
      color: #1e40af;
      letter-spacing: 0.1em;
      margin-bottom: 10px;
    }
    
    .header-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-top: 15px;
    }
    
    .estimate-meta {
      text-align: right;
      font-size: 9pt;
    }
    
    .estimate-meta div {
      margin-bottom: 3px;
    }
    
    .estimate-number {
      font-weight: 500;
      color: #1e40af;
    }
    
    /* 顧客情報セクション */
    .customer-section {
      margin-bottom: 30px;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #bfdbfe;
    }
    
    .customer-name {
      font-size: 18pt;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #3b82f6;
    }
    
    .customer-details {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      font-size: 9pt;
    }
    
    .customer-details > div {
      display: flex;
    }
    
    .customer-details .label {
      font-weight: 500;
      color: #64748b;
      min-width: 80px;
    }
    
    .customer-details .value {
      color: #1e293b;
    }
    
    /* 金額サマリー */
    .amount-summary {
      margin-bottom: 30px;
      background: linear-gradient(135deg, #1e40af, #3b82f6);
      color: white;
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
    }
    
    .amount-summary h2 {
      font-size: 11pt;
      font-weight: 400;
      opacity: 0.9;
      margin-bottom: 10px;
    }
    
    .total-amount {
      font-size: 32pt;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    
    .tax-info {
      font-size: 9pt;
      opacity: 0.8;
      margin-top: 5px;
    }
    
    /* 明細テーブル */
    .items-section {
      margin-bottom: 30px;
    }
    
    .section-header {
      background: #f8fafc;
      padding: 10px 15px;
      border-left: 4px solid #3b82f6;
      margin-bottom: 15px;
    }
    
    .section-header h3 {
      font-size: 12pt;
      font-weight: 600;
      color: #1e293b;
    }
    
    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 9pt;
      margin-bottom: 20px;
    }
    
    thead {
      background: #1e40af;
      color: white;
    }
    
    th {
      padding: 12px 10px;
      text-align: left;
      font-weight: 500;
      border: 1px solid #1e40af;
    }
    
    th:first-child {
      border-top-left-radius: 6px;
    }
    
    th:last-child {
      border-top-right-radius: 6px;
    }
    
    td {
      padding: 10px;
      border: 1px solid #e2e8f0;
      background: white;
    }
    
    tbody tr:nth-child(even) td {
      background: #f8fafc;
    }
    
    tbody tr:hover td {
      background: #f0f9ff;
    }
    
    .text-center {
      text-align: center;
    }
    
    .text-right {
      text-align: right;
    }
    
    .item-name {
      font-weight: 500;
      color: #1e293b;
    }
    
    .item-spec {
      font-size: 8pt;
      color: #64748b;
      margin-top: 2px;
    }
    
    .amount {
      font-weight: 600;
      color: #1e40af;
    }
    
    /* 小計行 */
    .subtotal-row {
      background: linear-gradient(90deg, #f0f9ff, #e0f2fe) !important;
      font-weight: 600;
    }
    
    .subtotal-row td {
      border-color: #3b82f6;
      padding: 12px 10px;
    }
    
    /* 合計セクション */
    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 30px;
    }
    
    .totals-box {
      width: 350px;
      border: 2px solid #3b82f6;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 15px;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .totals-row:last-child {
      border-bottom: none;
    }
    
    .totals-label {
      font-weight: 500;
      color: #64748b;
    }
    
    .totals-value {
      font-weight: 600;
      color: #1e293b;
    }
    
    .totals-total {
      background: linear-gradient(135deg, #1e40af, #3b82f6);
      color: white;
    }
    
    .totals-total .totals-label,
    .totals-total .totals-value {
      color: white;
      font-size: 12pt;
      font-weight: 700;
    }
    
    /* 備考・条件 */
    .notes-section {
      margin-bottom: 30px;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    
    .notes-section h3 {
      font-size: 11pt;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 10px;
    }
    
    .notes-content {
      font-size: 9pt;
      color: #475569;
      white-space: pre-wrap;
    }
    
    /* フッター */
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
    }
    
    .company-info {
      margin-bottom: 20px;
    }
    
    .company-name {
      font-size: 14pt;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 10px;
    }
    
    .company-details {
      font-size: 9pt;
      color: #64748b;
      line-height: 1.8;
    }
    
    .footer-logo {
      width: 150px;
      height: 50px;
      margin: 0 auto;
      background: linear-gradient(135deg, #1e40af, #3b82f6);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 14pt;
    }
    
    /* 印刷用調整 */
    @media print {
      .page {
        padding: 0;
        page-break-after: always;
      }
      
      .no-break {
        page-break-inside: avoid;
      }
      
      .page-break {
        page-break-before: always;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- ヘッダー -->
    <div class="header">
      <h1>御 見 積 書</h1>
      <div class="header-info">
        <div>
          <!-- 発行元ロゴ/社名など -->
        </div>
        <div class="estimate-meta">
          <div class="estimate-number">見積番号: ${id}</div>
          <div>発行日: ${new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div>有効期限: ${validUntil || '発行日より30日間'}</div>
        </div>
      </div>
    </div>
    
    <!-- 顧客情報 -->
    <div class="customer-section">
      <div class="customer-name">${customer?.name || ''} 様</div>
      <div class="customer-details">
        ${
          customer?.contactPerson
            ? `
        <div>
          <span class="label">ご担当者:</span>
          <span class="value">${customer.contactPerson}</span>
        </div>
        `
            : ''
        }
        ${
          customer?.tel
            ? `
        <div>
          <span class="label">電話番号:</span>
          <span class="value">${customer.tel}</span>
        </div>
        `
            : ''
        }
        ${
          customer?.email
            ? `
        <div>
          <span class="label">メール:</span>
          <span class="value">${customer.email}</span>
        </div>
        `
            : ''
        }
        ${
          customer?.address
            ? `
        <div>
          <span class="label">住所:</span>
          <span class="value">${customer.address}</span>
        </div>
        `
            : ''
        }
        ${
          projectInfo?.name
            ? `
        <div>
          <span class="label">件名:</span>
          <span class="value">${projectInfo.name}</span>
        </div>
        `
            : ''
        }
        ${
          projectInfo?.location
            ? `
        <div>
          <span class="label">工事場所:</span>
          <span class="value">${projectInfo.location}</span>
        </div>
        `
            : ''
        }
      </div>
    </div>
    
    <!-- 金額サマリー -->
    <div class="amount-summary">
      <h2>お見積り金額</h2>
      <div class="total-amount">¥${totals?.total?.toLocaleString() || '0'}</div>
      <div class="tax-info">（税込）</div>
    </div>
    
    <!-- 明細 -->
    <div class="items-section">
      ${sections
        .map(
          (section) => `
        <div class="section-header">
          <h3>${section.name}</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 5%">No.</th>
              <th style="width: 35%">項目名</th>
              <th style="width: 10%" class="text-center">数量</th>
              <th style="width: 8%" class="text-center">単位</th>
              <th style="width: 15%" class="text-right">単価</th>
              <th style="width: 17%" class="text-right">金額</th>
              <th style="width: 10%" class="text-center">備考</th>
            </tr>
          </thead>
          <tbody>
            ${section.items
              .map(
                (item: any, index: number) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>
                  <div class="item-name">${item.itemName || item.name || ''}</div>
                  ${item.specification ? `<div class="item-spec">${item.specification}</div>` : ''}
                </td>
                <td class="text-center">${item.quantity || item.qty || 0}</td>
                <td class="text-center">${item.unit || ''}</td>
                <td class="text-right">¥${(item.unitPrice || item.sellUnitPrice || 0).toLocaleString()}</td>
                <td class="text-right amount">¥${(item.amount || item.sellAmount || 0).toLocaleString()}</td>
                <td>${item.remarks || ''}</td>
              </tr>
            `,
              )
              .join('')}
            ${
              section.subtotal
                ? `
              <tr class="subtotal-row">
                <td colspan="5" class="text-right">小計</td>
                <td class="text-right amount">¥${section.subtotal.toLocaleString()}</td>
                <td></td>
              </tr>
            `
                : ''
            }
          </tbody>
        </table>
      `,
        )
        .join('')}
    </div>
    
    <!-- 合計 -->
    <div class="totals-section">
      <div class="totals-box">
        <div class="totals-row">
          <div class="totals-label">小計</div>
          <div class="totals-value">¥${(totals?.subtotal || 0).toLocaleString()}</div>
        </div>
        ${
          totals?.discountAmount && totals.discountAmount > 0
            ? `
        <div class="totals-row">
          <div class="totals-label">値引き</div>
          <div class="totals-value">-¥${totals.discountAmount.toLocaleString()}</div>
        </div>
        `
            : ''
        }
        <div class="totals-row">
          <div class="totals-label">消費税（${totals?.taxRate || 10}%）</div>
          <div class="totals-value">¥${(totals?.tax || 0).toLocaleString()}</div>
        </div>
        <div class="totals-row totals-total">
          <div class="totals-label">合計金額</div>
          <div class="totals-value">¥${(totals?.total || 0).toLocaleString()}</div>
        </div>
      </div>
    </div>
    
    <!-- 備考・条件 -->
    ${
      notes || terms
        ? `
    <div class="notes-section">
      ${
        notes
          ? `
        <div>
          <h3>備考</h3>
          <div class="notes-content">${notes}</div>
        </div>
      `
          : ''
      }
      ${
        terms
          ? `
        <div style="margin-top: 15px;">
          <h3>お取引条件</h3>
          <div class="notes-content">${terms}</div>
        </div>
      `
          : ''
      }
    </div>
    `
        : ''
    }
    
    <!-- フッター -->
    <div class="footer">
      <div class="company-info">
        <div class="company-name">株式会社サンプル建設</div>
        <div class="company-details">
          〒150-0001 東京都渋谷区神宮前1-2-3 サンプルビル5F<br>
          TEL: 03-1234-5678 / FAX: 03-1234-5679<br>
          Email: info@sample-construction.co.jp<br>
          建設業許可: 東京都知事許可（特-00）第123456号
        </div>
      </div>
      <div class="footer-logo">DRM Suite</div>
    </div>
  </div>
</body>
</html>
  `;
}

// 項目をセクション別にグループ化
function groupItemsBySection(items: any[]): any[] {
  const sections: any[] = [];
  let currentSection: any = {
    name: '明細',
    items: [],
    subtotal: 0,
  };

  items.forEach((item) => {
    if (item.isCategory) {
      if (currentSection.items.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        name: item.itemName || item.name,
        items: [],
        subtotal: 0,
      };
    } else if (item.isSubtotal) {
      currentSection.subtotal = item.amount || 0;
    } else {
      currentSection.items.push(item);
    }
  });

  if (currentSection.items.length > 0) {
    sections.push(currentSection);
  }

  return sections.length > 0
    ? sections
    : [
        {
          name: '明細',
          items: items.filter((i) => !i.isCategory && !i.isSubtotal),
          subtotal: 0,
        },
      ];
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    // TODO: 実際のデータ取得処理
    const estimateData = {
      id,
      title: 'キッチンリフォーム工事',
      customer: {
        name: '田中建設株式会社',
        contactPerson: '田中 太郎',
        tel: '03-1234-5678',
        email: 'tanaka@example.com',
        address: '東京都新宿区西新宿1-1-1',
      },
      projectInfo: {
        name: 'オフィスビルA キッチンリフォーム工事',
        location: '東京都新宿区',
      },
      items: [
        {
          itemName: 'システムキッチン I型2550mm',
          specification: 'LIXIL シエラS',
          quantity: 1,
          unit: 'セット',
          unitPrice: 450000,
          amount: 450000,
        },
        {
          itemName: '設置工事費',
          specification: '搬入・組立・設置',
          quantity: 1,
          unit: '式',
          unitPrice: 120000,
          amount: 120000,
        },
      ],
      totals: {
        subtotal: 570000,
        tax: 57000,
        total: 627000,
        taxRate: 10,
      },
      validUntil: '2025-09-30',
      notes:
        '※配送費・諸経費は別途お見積りいたします。\n※工事期間は約3日間を予定しております。',
      terms:
        '・お支払い条件: 工事完了後30日以内\n・保証期間: 工事完了日より1年間',
    };

    const html = generateEstimateHTML(estimateData);

    // Puppeteer設定
    let browser;
    if (isDev) {
      const puppeteerCore = await import('puppeteer-core');
      browser = await puppeteerCore.default.launch({
        executablePath:
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    } else {
      const [chromium, puppeteerCore] = await Promise.all([
        import('@sparticuz/chromium'),
        import('puppeteer-core'),
      ]);

      browser = await puppeteerCore.default.launch({
        args: chromium.default.args,
        executablePath: await chromium.default.executablePath(),
        headless: chromium.default.headless,
      });
    }

    try {
      const page = await browser.newPage();
      await page.emulateMediaType('print');

      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      // フォント読み込み待機
      await page.evaluateHandle('document.fonts.ready');

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: false,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      });

      return new Response(pdf, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="estimate-${id}.pdf"`,
          'Cache-Control': 'no-store',
        },
      });
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('PDF generation failed:', error);
    return new Response(JSON.stringify({ error: 'PDF generation failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
