// src/app/api/pdf/html/[id]/route.ts
import { NextRequest } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>見積書 ${params.id}</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4;
      margin: 15mm;
    }
    
    @media print {
      body {
        margin: 0;
      }
      .no-print {
        display: none;
      }
    }
    
    body {
      font-family: 'Noto Sans JP', sans-serif;
      line-height: 1.6;
      color: #333;
      background: white;
      padding: 20px;
    }
    
    .container {
      max-width: 210mm;
      margin: 0 auto;
      background: white;
      padding: 20px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #2196F3;
    }
    
    h1 {
      color: #2196F3;
      font-size: 32px;
      margin-bottom: 5px;
    }
    
    .subtitle {
      color: #666;
      font-size: 14px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .info-box {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
    }
    
    .info-box h3 {
      color: #2196F3;
      font-size: 14px;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .info-box p {
      margin: 5px 0;
      font-size: 14px;
    }
    
    .info-box strong {
      color: #555;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    
    th {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 500;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.5px;
    }
    
    tbody tr:hover {
      background: #f8f9fa;
    }
    
    .text-right {
      text-align: right;
    }
    
    .text-center {
      text-align: center;
    }
    
    .total-section {
      margin: 30px 0;
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 10px;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      margin: 8px 0;
      font-size: 15px;
    }
    
    .total-row.grand-total {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 2px solid #667eea;
      font-size: 20px;
      font-weight: bold;
      color: #667eea;
    }
    
    .notes {
      margin: 30px 0;
      padding: 20px;
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      border-radius: 5px;
    }
    
    .notes h3 {
      color: #856404;
      margin-bottom: 10px;
    }
    
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #eee;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      transition: transform 0.2s;
    }
    
    .print-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
    }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">🖨️ 印刷 / PDF保存</button>
  
  <div class="container">
    <div class="header">
      <h1>見積書</h1>
      <p class="subtitle">ESTIMATE</p>
    </div>
    
    <div class="info-grid">
      <div class="info-box">
        <h3>見積情報</h3>
        <p><strong>見積番号:</strong> ${params.id}</p>
        <p><strong>発行日:</strong> ${new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p><strong>有効期限:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      
      <div class="info-box">
        <h3>お客様情報</h3>
        <p><strong>お名前:</strong> 山田 太郎 様</p>
        <p><strong>電話番号:</strong> 03-1234-5678</p>
        <p><strong>住所:</strong> 東京都港区麻布十番1-2-3</p>
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th style="width: 5%;">No.</th>
          <th style="width: 45%;">項目</th>
          <th class="text-center" style="width: 10%;">数量</th>
          <th class="text-center" style="width: 10%;">単位</th>
          <th class="text-right" style="width: 15%;">単価</th>
          <th class="text-right" style="width: 15%;">金額</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>キッチン本体工事</td>
          <td class="text-center">1</td>
          <td class="text-center">式</td>
          <td class="text-right">¥500,000</td>
          <td class="text-right">¥500,000</td>
        </tr>
        <tr>
          <td>2</td>
          <td>電気配線工事一式</td>
          <td class="text-center">1</td>
          <td class="text-center">式</td>
          <td class="text-right">¥150,000</td>
          <td class="text-right">¥150,000</td>
        </tr>
        <tr>
          <td>3</td>
          <td>給排水配管工事</td>
          <td class="text-center">1</td>
          <td class="text-center">式</td>
          <td class="text-right">¥100,000</td>
          <td class="text-right">¥100,000</td>
        </tr>
        <tr>
          <td>4</td>
          <td>内装仕上げ工事</td>
          <td class="text-center">1</td>
          <td class="text-center">式</td>
          <td class="text-right">¥200,000</td>
          <td class="text-right">¥200,000</td>
        </tr>
        <tr>
          <td>5</td>
          <td>廃材処分費</td>
          <td class="text-center">1</td>
          <td class="text-center">式</td>
          <td class="text-right">¥50,000</td>
          <td class="text-right">¥50,000</td>
        </tr>
      </tbody>
    </table>
    
    <div class="total-section">
      <div class="total-row">
        <span>小計:</span>
        <span>¥1,000,000</span>
      </div>
      <div class="total-row">
        <span>諸経費 (5%):</span>
        <span>¥50,000</span>
      </div>
      <div class="total-row">
        <span>消費税 (10%):</span>
        <span>¥105,000</span>
      </div>
      <div class="total-row grand-total">
        <span>合計金額:</span>
        <span>¥1,155,000</span>
      </div>
    </div>
    
    <div class="notes">
      <h3>📝 備考</h3>
      <p>• 工事期間：約2週間を予定しております</p>
      <p>• お支払い条件：着手金30%、完工後70%</p>
      <p>• 上記金額には、材料費・工賃・諸経費が含まれております</p>
    </div>
    
    <div class="footer">
      <p><strong>DRM Suite</strong> - 段取り関係管理システム</p>
      <p>〒100-0001 東京都千代田区千代田1-1-1</p>
      <p>TEL: 03-0000-0000 | FAX: 03-0000-0001</p>
      <p style="margin-top: 10px; font-size: 10px;">Generated at ${new Date().toISOString()}</p>
    </div>
  </div>
  
  <script>
    // フォント読み込み完了を待つ
    document.fonts.ready.then(() => {
      console.log('✅ All fonts loaded');
    });
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
