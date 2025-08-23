// src/app/pdf/printable/[id]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic'; // 最新データ反映
export const runtime = 'nodejs'; // Edge ではなく Node 必須

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'DRM Suite Printable' };
}

// 見積データを取得する関数（実際の実装に合わせて修正）
async function fetchEstimateData(id: string, token?: string) {
  // 簡易実装：実際にはDBから取得
  return {
    id,
    title: `キッチンリフォーム工事一式`,
    issuedAt: new Date().toISOString().slice(0, 10),
    validUntil: '2025-09-22',
    customer: {
      name: '山田 太郎',
      tel: '03-1234-5678',
      email: 'yamada@example.com',
      prefecture: '東京都',
      city: '港区',
      address: '麻布十番1-2-3',
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
      overhead: {
        管理費: 145600,
        一般管理費: 91000,
        諸経費: 54600,
        廃材処分費: 36400,
      },
      beforeTax: 2147600,
      tax: 214760,
      total: 2362360,
    },
    paymentTerm: {
      name: '着手金30%、完工後70%',
    },
    notes: '工事期間中はご不便をおかけしますが、よろしくお願いいたします。',
  };
}

export default async function PrintablePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { t?: string };
}) {
  const { id } = params;
  const token = searchParams?.t as string | undefined;

  const estimate = await fetchEstimateData(id, token);
  if (!estimate) return notFound();

  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="preload"
          href="/fonts/NotoSansJP-Regular.ttf"
          as="font"
          type="font/truetype"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/NotoSansJP-Medium.ttf"
          as="font"
          type="font/truetype"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/NotoSansJP-Bold.ttf"
          as="font"
          type="font/truetype"
          crossOrigin="anonymous"
        />
        <style>{`
          @font-face {
            font-family: 'Noto Sans JP';
            src: url('/fonts/NotoSansJP-Regular.ttf') format('truetype');
            font-weight: 400; 
            font-style: normal; 
            font-display: block;
            unicode-range: U+0020-007F, U+3040-309F, U+30A0-30FF, U+4E00-9FAF;
          }
          @font-face {
            font-family: 'Noto Sans JP';
            src: url('/fonts/NotoSansJP-Medium.ttf') format('truetype');
            font-weight: 500; 
            font-style: normal; 
            font-display: block;
            unicode-range: U+0020-007F, U+3040-309F, U+30A0-30FF, U+4E00-9FAF;
          }
          @font-face {
            font-family: 'Noto Sans JP';
            src: url('/fonts/NotoSansJP-Bold.ttf') format('truetype');
            font-weight: 700; 
            font-style: normal; 
            font-display: block;
            unicode-range: U+0020-007F, U+3040-309F, U+30A0-30FF, U+4E00-9FAF;
          }
          
          /* すべての要素に強制適用（Tailwind/コンポーネントの上書き防止） */
          * { 
            font-family: 'Noto Sans JP', system-ui, -apple-system, 'Segoe UI', sans-serif !important;
            box-sizing: border-box; 
            margin: 0; 
            padding: 0; 
          }
          
          :root { 
            --fs: 11pt; 
            --lh: 1.45; 
            --primary: #2196F3;
            --border: #999;
            --bg-header: #f2f2f2;
          }
          
          @page { 
            size: A4; 
            margin: 16mm 14mm; 
          }
          
          body { 
            font-size: var(--fs); 
            line-height: var(--lh); 
            color: #111; 
            background: white;
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact;
            line-break: strict; 
            word-break: normal;
          }

          @page { 
            size: A4; 
            margin: 18mm 16mm; 
          }
          
          .page { 
            page-break-after: always; 
            min-height: calc(100vh - 36mm);
          }
          .page:last-child { 
            page-break-after: auto; 
          }

          .header {
            text-align: center;
            margin-bottom: 20mm;
          }
          
          .header h1 { 
            font-size: 24pt; 
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 8mm; 
          }
          
          .estimate-info { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start; 
            margin-bottom: 8mm; 
            font-size: 10pt;
          }
          
          .estimate-meta { 
            text-align: right; 
            color: #333; 
          }
          
          .title-section {
            text-align: center;
            margin-bottom: 8mm;
          }
          
          .title-section h2 {
            font-size: 16pt;
            color: var(--primary);
            font-weight: 500;
          }

          .customer-section { 
            margin-bottom: 8mm; 
          }
          
          .customer-section h3 { 
            font-size: 12pt; 
            font-weight: 700; 
            margin-bottom: 4mm; 
          }
          
          .customer-box { 
            background: var(--bg-header); 
            padding: 8mm; 
            font-size: 10pt;
            border: 1px solid var(--border);
          }
          
          .customer-box div {
            margin-bottom: 2mm;
          }
          
          .customer-box div:last-child {
            margin-bottom: 0;
          }

          .items-section { 
            margin-bottom: 8mm; 
          }
          
          .items-section h3 { 
            font-size: 12pt; 
            font-weight: 700; 
            margin-bottom: 4mm; 
          }

          table { 
            width: 100%; 
            border-collapse: collapse; 
            font-size: 9pt; 
            border: 1px solid var(--border);
          }
          
          th, td { 
            border: 1px solid var(--border); 
            padding: 4mm 3mm; 
            vertical-align: top; 
          }
          
          th { 
            background: var(--primary); 
            color: white; 
            text-align: left;
            font-weight: 500;
          }
          
          .center { text-align: center; }
          .right { text-align: right; }
          
          .col-name { width: 60%; }
          .col-qty { width: 10%; }
          .col-unit { width: 10%; }
          .col-price { width: 20%; }

          .summary { 
            text-align: right; 
            margin: 8mm 0; 
          }
          
          .summary-box { 
            display: inline-block; 
            text-align: left; 
            font-size: 10pt;
            min-width: 180px;
          }
          
          .summary-row { 
            display: flex;
            justify-content: space-between;
            margin-bottom: 2mm; 
          }
          
          .summary-sub { 
            color: #666; 
            font-size: 9pt; 
          }
          
          .summary-total { 
            border-top: 2px solid #333; 
            padding-top: 3mm;
            margin-top: 4mm;
            font-size: 14pt; 
            font-weight: 700; 
            color: var(--primary); 
          }
          
          .divider {
            border-top: 1px solid #333;
            margin: 3mm 0;
          }

          .terms-section, .notes-section { 
            margin-bottom: 6mm; 
          }
          
          .terms-section h3, .notes-section h3 { 
            font-size: 10pt; 
            font-weight: 700; 
            margin-bottom: 2mm; 
          }
          
          .terms-section div, .notes-section div {
            font-size: 10pt;
          }

          .footer { 
            text-align: center; 
            margin-top: 20mm; 
            font-size: 8pt; 
            color: #666;
            border-top: 1px solid #eee;
            padding-top: 4mm;
          }
          
          .footer div {
            margin-bottom: 1mm;
          }
        `}</style>
      </head>
      <body>
        <section className="page">
          <div className="header">
            <h1>見積書</h1>
          </div>

          <div className="estimate-info">
            <div></div> {/* 左側スペース */}
            <div className="estimate-meta">
              <div>見積番号: {estimate.id}</div>
              <div>見積日: {estimate.issuedAt}</div>
              <div>有効期限: {estimate.validUntil}</div>
            </div>
          </div>

          <div className="title-section">
            <h2>{estimate.title}</h2>
          </div>

          <div className="customer-section">
            <h3>お客様情報</h3>
            <div className="customer-box">
              <div>{estimate.customer.name} 様</div>
              <div>電話番号: {estimate.customer.tel}</div>
              <div>メール: {estimate.customer.email}</div>
              <div>
                住所: {estimate.customer.prefecture}
                {estimate.customer.city}
                {estimate.customer.address}
              </div>
            </div>
          </div>

          <div className="items-section">
            <h3>工事明細</h3>
            <table>
              <thead>
                <tr>
                  <th className="col-name">項目名</th>
                  <th className="center col-qty">数量</th>
                  <th className="center col-unit">単位</th>
                  <th className="right col-price">単価</th>
                  <th className="right col-price">金額</th>
                </tr>
              </thead>
              <tbody>
                {estimate.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td className="center">{item.qty}</td>
                    <td className="center">{item.unit}</td>
                    <td className="right">
                      ¥{item.price.toLocaleString('ja-JP')}
                    </td>
                    <td className="right">
                      ¥{item.amount.toLocaleString('ja-JP')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="summary">
            <div className="summary-box">
              <div className="summary-row">
                <span>小計:</span>
                <span>¥{estimate.totals.subtotal.toLocaleString('ja-JP')}</span>
              </div>

              <div className="summary-row summary-sub">
                <span>現場管理費:</span>
                <span>
                  ¥{estimate.totals.overhead.管理費.toLocaleString('ja-JP')}
                </span>
              </div>
              <div className="summary-row summary-sub">
                <span>一般管理費:</span>
                <span>
                  ¥{estimate.totals.overhead.一般管理費.toLocaleString('ja-JP')}
                </span>
              </div>
              <div className="summary-row summary-sub">
                <span>諸経費:</span>
                <span>
                  ¥{estimate.totals.overhead.諸経費.toLocaleString('ja-JP')}
                </span>
              </div>
              <div className="summary-row summary-sub">
                <span>廃材処分費:</span>
                <span>
                  ¥{estimate.totals.overhead.廃材処分費.toLocaleString('ja-JP')}
                </span>
              </div>

              <div className="divider"></div>

              <div className="summary-row">
                <span>税抜合計:</span>
                <span>
                  ¥{estimate.totals.beforeTax.toLocaleString('ja-JP')}
                </span>
              </div>
              <div className="summary-row">
                <span>消費税(10%):</span>
                <span>¥{estimate.totals.tax.toLocaleString('ja-JP')}</span>
              </div>

              <div className="summary-total summary-row">
                <span>合計金額:</span>
                <span>¥{estimate.totals.total.toLocaleString('ja-JP')}</span>
              </div>
            </div>
          </div>

          {estimate.paymentTerm && (
            <div className="terms-section">
              <h3>支払条件</h3>
              <div>{estimate.paymentTerm.name}</div>
            </div>
          )}

          {estimate.notes && (
            <div className="notes-section">
              <h3>備考</h3>
              <div style={{ whiteSpace: 'pre-wrap' }}>{estimate.notes}</div>
            </div>
          )}

          <div className="footer">
            <div>DRM Suite - 段取り関係管理システム</div>
            <div>発行日: {new Date().toLocaleDateString('ja-JP')}</div>
          </div>
        </section>
      </body>
    </html>
  );
}
