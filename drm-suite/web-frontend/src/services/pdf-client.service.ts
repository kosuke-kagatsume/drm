'use client';

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

export class PDFClientService {
  // 見積書PDF生成（クライアントサイドのみ）
  static async generateEstimatePDF(estimate: EstimateData): Promise<Blob> {
    // 動的インポート
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

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
        `TEL: ${estimate.customer.tel || '-'}`,
        margin + 5,
        yPosition + 5,
      );
      doc.text(
        `Email: ${estimate.customer.email || '-'}`,
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
        font: 'helvetica',
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

    if (estimate.totals.overhead) {
      doc.text('現場管理費:', summaryX, yPosition);
      doc.text(
        `¥${(estimate.totals.overhead.管理費 || 0).toLocaleString()}`,
        summaryX + summaryWidth,
        yPosition,
        { align: 'right' },
      );
      yPosition += 4;

      doc.text('一般管理費:', summaryX, yPosition);
      doc.text(
        `¥${(estimate.totals.overhead.一般管理費 || 0).toLocaleString()}`,
        summaryX + summaryWidth,
        yPosition,
        { align: 'right' },
      );
      yPosition += 4;

      doc.text('諸経費:', summaryX, yPosition);
      doc.text(
        `¥${(estimate.totals.overhead.諸経費 || 0).toLocaleString()}`,
        summaryX + summaryWidth,
        yPosition,
        { align: 'right' },
      );
      yPosition += 4;

      doc.text('廃材処分費:', summaryX, yPosition);
      doc.text(
        `¥${(estimate.totals.overhead.廃材処分費 || 0).toLocaleString()}`,
        summaryX + summaryWidth,
        yPosition,
        { align: 'right' },
      );
      yPosition += 6;
    }

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
    doc.text('消費税（10%）:', summaryX, yPosition);
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
    doc.text(
      'DRM Suite - Dandori Relation Management System',
      pageWidth / 2,
      footerY,
      { align: 'center' },
    );
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
    link.download = `見積書_${estimate.id}_${estimate.customerName}.pdf`;
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
    const { default: html2canvas } = await import('html2canvas');
    const { default: jsPDF } = await import('jspdf');

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
