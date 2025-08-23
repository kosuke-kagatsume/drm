// Dynamic import for client-side only
let jsPDF: any;
let autoTable: any;
let html2canvas: any;

if (typeof window !== 'undefined') {
  jsPDF = require('jspdf').default || require('jspdf');
  autoTable = require('jspdf-autotable').default || require('jspdf-autotable');
  html2canvas = require('html2canvas').default || require('html2canvas');
}

// 実用的な日本語フォント設定（jsPDF-Font-Japanese プラグインを使用）
const setupJapaneseFont = async (doc: any) => {
  try {
    // 最も確実な方法: jsPDFのUnicode対応フォントを使用
    // Google Fonts の Noto Sans JP を埋め込み
    const fontUrl =
      'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400&display=swap';
    await document.fonts.load('16px "Noto Sans JP"');

    // jsPDFでUnicodeフォントを使用
    doc.setFont('helvetica', 'normal');
    doc.setCharSpace(0.1); // 文字間隔を調整

    return true;
  } catch (error) {
    console.warn('Japanese font setup failed:', error);
    doc.setFont('helvetica');
    return false;
  }
};

export interface EstimateData {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  date: string;
  validUntil: string;
  paymentTerms: string;
  items: any[];
  overheadSettings: any;
  totals: any;
  notes?: string;
  customer?: any;
  paymentTerm?: any;
}

export class PDFService {
  // 最も確実な方法: React ComponentをHTML要素として描画してPDF生成
  static async generateEstimatePDFFromReactComponent(
    estimate: EstimateData,
  ): Promise<Blob> {
    // フォントが確実に読み込まれるまで待機
    await document.fonts.ready;

    // React コンポーネントのHTMLテンプレートを直接作成
    const estimateHTML = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'ヒラギノ角ゴ ProN W3', Meiryo, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #333;
          background: white;
        }
        .pdf-container {
          width: 210mm;
          min-height: 297mm;
          padding: 15mm;
          background: white;
        }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { font-size: 24px; color: #2196F3; font-weight: bold; }
        .estimate-info { text-align: right; margin-bottom: 20px; font-size: 10px; }
        .title { text-align: center; margin-bottom: 25px; }
        .title h2 { font-size: 16px; color: #2196F3; font-weight: bold; }
        .customer-info { margin-bottom: 30px; }
        .customer-info h3 { font-size: 12px; font-weight: bold; margin-bottom: 8px; }
        .customer-box { background: #f5f5f5; padding: 15px; font-size: 10px; border: 1px solid #ddd; }
        .items-section { margin-bottom: 20px; }
        .items-section h3 { font-size: 12px; font-weight: bold; margin-bottom: 8px; }
        .items-table { width: 100%; border-collapse: collapse; font-size: 9px; border: 1px solid #ddd; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; }
        .items-table th { background: #42A5F5; color: white; }
        .items-table th:nth-child(1) { text-align: left; }
        .items-table th:nth-child(2), .items-table th:nth-child(3) { text-align: center; width: 60px; }
        .items-table th:nth-child(4), .items-table th:nth-child(5) { text-align: right; width: 80px; }
        .items-table td:nth-child(2), .items-table td:nth-child(3) { text-align: center; }
        .items-table td:nth-child(4), .items-table td:nth-child(5) { text-align: right; }
        .summary { text-align: right; margin-bottom: 20px; }
        .summary-box { display: inline-block; text-align: left; font-size: 10px; }
        .summary-row { margin-bottom: 3px; }
        .summary-sub { color: #666; font-size: 9px; margin-bottom: 2px; }
        .summary-total { border-top: 2px solid #333; padding-top: 5px; font-size: 14px; font-weight: bold; color: #2196F3; }
        .terms, .notes { margin-bottom: 10px; }
        .terms h3, .notes h3 { font-size: 10px; font-weight: bold; margin-bottom: 5px; }
        .footer { text-align: center; margin-top: 30px; font-size: 8px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
        .amount { display: inline-block; width: 80px; text-align: right; }
      </style>
    </head>
    <body>
      <div class="pdf-container">
        <div class="header">
          <h1>見積書</h1>
        </div>
        
        <div class="estimate-info">
          <div>見積番号: ${estimate.id}</div>
          <div>見積日: ${estimate.date}</div>
          <div>有効期限: ${estimate.validUntil}</div>
        </div>
        
        <div class="title">
          <h2>${estimate.title}</h2>
        </div>
        
        ${
          estimate.customer
            ? `
        <div class="customer-info">
          <h3>お客様情報</h3>
          <div class="customer-box">
            <div>${estimate.customer.name} 様</div>
            <div>電話番号: ${estimate.customer.tel || '-'}</div>
            <div>メール: ${estimate.customer.email || '-'}</div>
            <div>住所: ${estimate.customer.prefecture || ''}${estimate.customer.city || ''}${estimate.customer.address || ''}</div>
          </div>
        </div>
        `
            : ''
        }
        
        <div class="items-section">
          <h3>工事明細</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>項目名</th>
                <th>数量</th>
                <th>単位</th>
                <th>単価</th>
                <th>金額</th>
              </tr>
            </thead>
            <tbody>
              ${estimate.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${item.unit}</td>
                  <td>¥${item.unitPrice.toLocaleString()}</td>
                  <td>¥${item.amount.toLocaleString()}</td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>
        </div>
        
        <div class="summary">
          <div class="summary-box">
            <div class="summary-row">小計: <span class="amount">¥${estimate.totals.subtotal.toLocaleString()}</span></div>
            <div class="summary-sub">現場管理費: <span class="amount">¥${estimate.totals.overhead.管理費.toLocaleString()}</span></div>
            <div class="summary-sub">一般管理費: <span class="amount">¥${estimate.totals.overhead.一般管理費.toLocaleString()}</span></div>
            <div class="summary-sub">諸経費: <span class="amount">¥${estimate.totals.overhead.諸経費.toLocaleString()}</span></div>
            <div class="summary-sub" style="margin-bottom: 8px;">廃材処分費: <span class="amount">¥${estimate.totals.overhead.廃材処分費.toLocaleString()}</span></div>
            
            <div class="summary-row" style="border-top: 1px solid #333; padding-top: 5px;">税抜合計: <span class="amount">¥${estimate.totals.beforeTax.toLocaleString()}</span></div>
            <div class="summary-row" style="margin-bottom: 8px;">消費税(10%): <span class="amount">¥${estimate.totals.tax.toLocaleString()}</span></div>
            
            <div class="summary-total">合計金額: <span class="amount">¥${estimate.totals.total.toLocaleString()}</span></div>
          </div>
        </div>
        
        ${
          estimate.paymentTerm
            ? `
        <div class="terms">
          <h3>支払条件</h3>
          <div>${estimate.paymentTerm.name || '現金'}</div>
        </div>
        `
            : ''
        }
        
        ${
          estimate.notes
            ? `
        <div class="notes">
          <h3>備考</h3>
          <div style="white-space: pre-wrap;">${estimate.notes}</div>
        </div>
        `
            : ''
        }
        
        <div class="footer">
          <div>DRM Suite - 段取り関係管理システム</div>
          <div>発行日: ${new Date().toLocaleDateString('ja-JP')}</div>
        </div>
      </div>
    </body>
    </html>
    `;

    // 新しいウィンドウでHTMLを開いてPDF生成
    const printWindow = window.open('', '_blank');
    if (!printWindow) throw new Error('Failed to open print window');

    printWindow.document.write(estimateHTML);
    printWindow.document.close();

    // フォントが読み込まれるまで少し待機
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const element = printWindow.document.querySelector(
        '.pdf-container',
      ) as HTMLElement;
      if (!element) throw new Error('PDF container not found');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: 794, // A4 width in pixels
        height: 1123, // A4 height in pixels
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      return pdf.output('blob');
    } finally {
      printWindow.close();
    }
  }

  // HTML要素からPDF生成（日本語対応）
  static async generateEstimatePDFFromHTML(
    estimate: EstimateData,
  ): Promise<Blob> {
    // HTMLテンプレートを動的に作成
    const htmlContent = `
    <div id="estimate-pdf" style="
      font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'ヒラギノ角ゴ ProN W3', Meiryo, sans-serif;
      width: 210mm;
      min-height: 297mm;
      padding: 15mm;
      background: white;
      font-size: 12px;
      line-height: 1.4;
      color: #333;
    ">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="font-size: 24px; margin: 0; color: #2196F3;">見積書</h1>
      </div>
      
      <div style="text-align: right; margin-bottom: 20px; font-size: 10px;">
        <p>見積番号: ${estimate.id}</p>
        <p>見積日: ${estimate.date}</p>
        <p>有効期限: ${estimate.validUntil}</p>
      </div>
      
      <div style="text-align: center; margin-bottom: 25px;">
        <h2 style="font-size: 16px; color: #2196F3; margin: 0;">${estimate.title}</h2>
      </div>
      
      ${
        estimate.customer
          ? `
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 12px; font-weight: bold; margin-bottom: 8px;">お客様情報</h3>
        <div style="background: #f5f5f5; padding: 15px; font-size: 10px;">
          <p style="margin: 0 0 5px 0;">${estimate.customer.name} 様</p>
          <p style="margin: 0 0 5px 0;">電話番号: ${estimate.customer.tel || '-'}</p>
          <p style="margin: 0 0 5px 0;">メール: ${estimate.customer.email || '-'}</p>
          <p style="margin: 0;">住所: ${estimate.customer.prefecture || ''}${estimate.customer.city || ''}${estimate.customer.address || ''}</p>
        </div>
      </div>
      `
          : ''
      }
      
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 12px; font-weight: bold; margin-bottom: 8px;">工事明細</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
          <thead style="background: #42A5F5; color: white;">
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">項目名</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 60px;">数量</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 50px;">単位</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right; width: 80px;">単価</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right; width: 80px;">金額</th>
            </tr>
          </thead>
          <tbody>
            ${estimate.items
              .map(
                (item) => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.unit}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">¥${item.unitPrice.toLocaleString()}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">¥${item.amount.toLocaleString()}</td>
            </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
      </div>
      
      <div style="text-align: right; margin-bottom: 20px;">
        <div style="display: inline-block; text-align: left; font-size: 10px;">
          <p>小計: <span style="display: inline-block; width: 80px; text-align: right;">¥${estimate.totals.subtotal.toLocaleString()}</span></p>
          <p style="color: #666; font-size: 9px;">現場管理費: <span style="display: inline-block; width: 80px; text-align: right;">¥${estimate.totals.overhead.管理費.toLocaleString()}</span></p>
          <p style="color: #666; font-size: 9px;">一般管理費: <span style="display: inline-block; width: 80px; text-align: right;">¥${estimate.totals.overhead.一般管理費.toLocaleString()}</span></p>
          <p style="color: #666; font-size: 9px;">諸経費: <span style="display: inline-block; width: 80px; text-align: right;">¥${estimate.totals.overhead.諸経費.toLocaleString()}</span></p>
          <p style="color: #666; font-size: 9px;">廃材処分費: <span style="display: inline-block; width: 80px; text-align: right;">¥${estimate.totals.overhead.廃材処分費.toLocaleString()}</span></p>
          <hr style="margin: 8px 0;">
          <p>税抜合計: <span style="display: inline-block; width: 80px; text-align: right;">¥${estimate.totals.beforeTax.toLocaleString()}</span></p>
          <p>消費税(10%): <span style="display: inline-block; width: 80px; text-align: right;">¥${estimate.totals.tax.toLocaleString()}</span></p>
          <hr style="margin: 8px 0; border: 1px solid #333;">
          <p style="font-size: 14px; font-weight: bold; color: #2196F3;">合計金額: <span style="display: inline-block; width: 80px; text-align: right;">¥${estimate.totals.total.toLocaleString()}</span></p>
        </div>
      </div>
      
      ${
        estimate.paymentTerm
          ? `
      <div style="margin-bottom: 10px;">
        <h3 style="font-size: 10px; font-weight: bold; margin-bottom: 5px;">支払条件</h3>
        <p style="margin: 0; font-size: 10px;">${estimate.paymentTerm.name || '現金'}</p>
      </div>
      `
          : ''
      }
      
      ${
        estimate.notes
          ? `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 10px; font-weight: bold; margin-bottom: 5px;">備考</h3>
        <p style="margin: 0; font-size: 10px; white-space: pre-wrap;">${estimate.notes}</p>
      </div>
      `
          : ''
      }
      
      <div style="text-align: center; margin-top: 30px; font-size: 8px; color: #999;">
        <p>DRM Suite - 段取り関係管理システム</p>
        <p>発行日: ${new Date().toLocaleDateString('ja-JP')}</p>
      </div>
    </div>
    `;

    // HTMLをDOMに追加
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    document.body.appendChild(tempDiv);

    try {
      // html2canvasでPDF生成
      const canvas = await html2canvas(
        tempDiv.firstElementChild as HTMLElement,
        {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          width: 794, // A4 width in pixels (210mm at 96dpi * 3.78)
          height: 1123, // A4 height in pixels (297mm at 96dpi * 3.78)
        },
      );

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      return pdf.output('blob');
    } finally {
      // 一時的な要素を削除
      document.body.removeChild(tempDiv);
    }
  }

  // 新しいサーバーサイドPDF生成方式
  static async generateEstimatePDF(estimate: EstimateData): Promise<Blob> {
    try {
      // サーバーサイドAPI経由でPDF生成
      const response = await fetch(`/api/pdf/estimate/${estimate.id}`, {
        method: 'GET',
        headers: {
          Accept: 'application/pdf',
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(
          `PDF generation failed: ${response.status} ${response.statusText}`,
        );
      }

      const blob = await response.blob();
      console.log(
        `✅ PDF generated via server-side API, size: ${blob.size} bytes`,
      );

      return blob;
    } catch (error) {
      console.error(
        '❌ Server-side PDF generation failed, falling back to client-side:',
        error,
      );

      // フォールバック: 従来のクライアントサイド方式
      return this.generateEstimatePDFFromReactComponent(estimate);
    }
  }

  // 旧バージョン（参考用）
  static async generateEstimatePDFLegacy(
    estimate: EstimateData,
  ): Promise<Blob> {
    if (!jsPDF) {
      throw new Error('PDF library not loaded');
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // 日本語フォントのセットアップ
    const fontLoaded = await setupJapaneseFont(doc);

    // ページ設定
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let yPosition = margin;

    // ヘッダー部分
    doc.setFontSize(24);
    doc.text('見積書', pageWidth / 2, yPosition + 10, { align: 'center' });

    yPosition += 20;

    // 見積番号・日付
    doc.setFontSize(10);
    doc.text(`見積番号: ${estimate.id}`, pageWidth - margin - 50, yPosition, {
      align: 'left',
    });
    doc.text(
      `見積日: ${estimate.date}`,
      pageWidth - margin - 50,
      yPosition + 5,
      { align: 'left' },
    );
    doc.text(
      `有効期限: ${estimate.validUntil}`,
      pageWidth - margin - 50,
      yPosition + 10,
      { align: 'left' },
    );

    // タイトル
    yPosition += 5;
    doc.setFontSize(16);
    doc.setTextColor(33, 150, 243); // Blue color
    doc.text(estimate.title, pageWidth / 2, yPosition + 10, {
      align: 'center',
    });
    doc.setTextColor(0, 0, 0); // Reset to black

    yPosition += 25;

    // 顧客情報
    if (estimate.customer) {
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('お客様情報', margin, yPosition);
      doc.setFont(undefined, 'normal');

      yPosition += 8;
      doc.setFontSize(10);

      // 顧客情報ボックス
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, yPosition - 5, contentWidth, 25, 'F');

      doc.text(`${estimate.customer.name} 様`, margin + 5, yPosition);
      doc.text(
        `電話番号: ${estimate.customer.tel || '-'}`,
        margin + 5,
        yPosition + 5,
      );
      doc.text(
        `メール: ${estimate.customer.email || '-'}`,
        margin + 5,
        yPosition + 10,
      );
      doc.text(
        `住所: ${estimate.customer.prefecture || ''}${estimate.customer.city || ''}${estimate.customer.address || ''}`,
        margin + 5,
        yPosition + 15,
      );

      yPosition += 30;
    }

    // 明細テーブル
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('工事明細', margin, yPosition);
    doc.setFont(undefined, 'normal');

    yPosition += 8;

    // テーブルデータ準備
    const tableData = estimate.items.map((item: any) => [
      item.name,
      item.quantity.toString(),
      item.unit,
      `¥${item.unitPrice.toLocaleString()}`,
      `¥${item.amount.toLocaleString()}`,
    ]);

    // テーブル生成
    autoTable(doc, {
      startY: yPosition,
      head: [['項目名', '数量', '単位', '単価', '金額']],
      body: tableData,
      theme: 'grid',
      styles: {
        font: fontLoaded ? 'NotoSansJP' : 'helvetica',
        fontSize: 9,
        cellPadding: 3,
        halign: 'left',
      },
      headStyles: {
        fillColor: [66, 165, 245],
        textColor: 255,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { halign: 'center', cellWidth: 20 },
        2: { halign: 'center', cellWidth: 20 },
        3: { halign: 'right', cellWidth: 35 },
        4: { halign: 'right', cellWidth: 35 },
      },
      margin: { left: margin, right: margin },
    });

    // 最後のテーブル位置を取得
    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // 集計部分
    const summaryX = pageWidth - margin - 80;
    const summaryWidth = 65;

    doc.setFontSize(10);

    // 小計
    doc.text('小計:', summaryX, yPosition);
    doc.text(
      `¥${estimate.totals.subtotal.toLocaleString()}`,
      summaryX + summaryWidth,
      yPosition,
      { align: 'right' },
    );
    yPosition += 5;

    // 諸経費
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);

    doc.text('現場管理費:', summaryX, yPosition);
    doc.text(
      `¥${estimate.totals.overhead.管理費.toLocaleString()}`,
      summaryX + summaryWidth,
      yPosition,
      { align: 'right' },
    );
    yPosition += 4;

    doc.text('一般管理費:', summaryX, yPosition);
    doc.text(
      `¥${estimate.totals.overhead.一般管理費.toLocaleString()}`,
      summaryX + summaryWidth,
      yPosition,
      { align: 'right' },
    );
    yPosition += 4;

    doc.text('諸経費:', summaryX, yPosition);
    doc.text(
      `¥${estimate.totals.overhead.諸経費.toLocaleString()}`,
      summaryX + summaryWidth,
      yPosition,
      { align: 'right' },
    );
    yPosition += 4;

    doc.text('廃材処分費:', summaryX, yPosition);
    doc.text(
      `¥${estimate.totals.overhead.廃材処分費.toLocaleString()}`,
      summaryX + summaryWidth,
      yPosition,
      { align: 'right' },
    );
    yPosition += 6;

    // 税抜合計
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.line(summaryX, yPosition - 2, summaryX + summaryWidth, yPosition - 2);
    doc.text('税抜合計:', summaryX, yPosition);
    doc.text(
      `¥${estimate.totals.beforeTax.toLocaleString()}`,
      summaryX + summaryWidth,
      yPosition,
      { align: 'right' },
    );
    yPosition += 5;

    // 消費税
    doc.text('消費税(10%):', summaryX, yPosition);
    doc.text(
      `¥${estimate.totals.tax.toLocaleString()}`,
      summaryX + summaryWidth,
      yPosition,
      { align: 'right' },
    );
    yPosition += 6;

    // 合計金額
    doc.setLineWidth(0.5);
    doc.line(summaryX, yPosition - 2, summaryX + summaryWidth, yPosition - 2);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(33, 150, 243);
    doc.text('合計金額:', summaryX, yPosition);
    doc.text(
      `¥${estimate.totals.total.toLocaleString()}`,
      summaryX + summaryWidth,
      yPosition,
      { align: 'right' },
    );
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');

    yPosition += 15;

    // 支払条件・備考
    if (yPosition < pageHeight - 50) {
      doc.setFontSize(10);

      if (estimate.paymentTerm) {
        doc.setFont(undefined, 'bold');
        doc.text('支払条件', margin, yPosition);
        doc.setFont(undefined, 'normal');
        yPosition += 5;
        doc.text(estimate.paymentTerm.name || '現金', margin, yPosition);
        yPosition += 10;
      }

      if (estimate.notes) {
        doc.setFont(undefined, 'bold');
        doc.text('備考', margin, yPosition);
        doc.setFont(undefined, 'normal');
        yPosition += 5;

        // 備考文を改行処理
        const lines = doc.splitTextToSize(estimate.notes, contentWidth);
        lines.forEach((line: string) => {
          doc.text(line, margin, yPosition);
          yPosition += 5;
        });
      }
    }

    // フッター
    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('DRM Suite - 段取り関係管理システム', pageWidth / 2, footerY, {
      align: 'center',
    });
    doc.text(
      `発行日: ${new Date().toLocaleDateString('ja-JP')}`,
      pageWidth / 2,
      footerY + 3,
      { align: 'center' },
    );

    // Blobとして返す
    return doc.output('blob');
  }

  // PDFプレビュー用のDataURL生成
  static async generateEstimatePDFDataURL(
    estimate: EstimateData,
  ): Promise<string> {
    const blob = await this.generateEstimatePDF(estimate);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  // PDFダウンロード
  static async downloadEstimatePDF(estimate: EstimateData): Promise<void> {
    const blob = await this.generateEstimatePDF(estimate);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Estimate_${estimate.id}_${estimate.customerName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // HTML要素からPDF生成（スクリーンショット方式）
  static async generatePDFFromElement(
    elementId: string,
    fileName: string,
  ): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // 最初のページ
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // 複数ページの場合
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(fileName);
  }
}
