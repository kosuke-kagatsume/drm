/**
 * 多テナント対応PDFテンプレートエンジン
 * 企業ブランディングとカスタムテンプレートを統合したPDF生成システム
 */

import { PdfTemplate, CompanyBranding, PdfSection, PdfGenerationRequest, PdfGenerationResponse } from '@/types/pdf-template';

export class PdfTemplateEngine {
  private template: PdfTemplate;
  private branding: CompanyBranding;
  private data: Record<string, any>;

  constructor(template: PdfTemplate, branding: CompanyBranding, data: Record<string, any>) {
    this.template = template;
    this.branding = branding;
    this.data = data;
  }

  /**
   * PDFを生成
   */
  async generatePdf(): Promise<string> {
    try {
      // HTMLコンテンツを生成
      const htmlContent = this.generateHtmlContent();

      // PDF用のHTMLページを作成
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('ポップアップがブロックされました');
      }

      // HTMLを設定
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // 印刷ダイアログを表示
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);

      return 'PDF generation initiated';
    } catch (error) {
      console.error('PDF生成エラー:', error);
      throw error;
    }
  }

  /**
   * HTMLコンテンツを生成
   */
  private generateHtmlContent(): string {
    const css = this.generateCss();
    const bodyContent = this.generateBodyContent();

    return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.data.title || 'Document'}</title>
    <style>
        ${css}
    </style>
</head>
<body>
    ${bodyContent}
    <script>
        // 印刷後にウィンドウを閉じる
        window.addEventListener('afterprint', function() {
            window.close();
        });
    </script>
</body>
</html>`;
  }

  /**
   * CSSスタイルを生成
   */
  private generateCss(): string {
    const { colorTheme, primaryFont, secondaryFont, fontSize } = this.branding;
    const { layout } = this.template;

    return `
        /* 基本スタイル */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: "${primaryFont}", sans-serif;
            font-size: ${fontSize.body}px;
            line-height: 1.6;
            color: ${colorTheme.text};
            background-color: ${colorTheme.background};
        }

        /* ページ設定 */
        @page {
            size: ${layout.pageSize} ${layout.orientation};
            margin: ${layout.margins.top}mm ${layout.margins.right}mm ${layout.margins.bottom}mm ${layout.margins.left}mm;

            ${layout.header.enabled ? `
            @top-center {
                content: element(header);
            }` : ''}

            ${layout.footer.enabled ? `
            @bottom-center {
                content: element(footer);
            }` : ''}
        }

        /* 印刷専用スタイル */
        @media print {
            body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
        }

        /* ヘッダー・フッター */
        .page-header {
            position: running(header);
            height: ${layout.header.height}px;
            ${layout.header.enabled ? '' : 'display: none;'}
        }

        .page-footer {
            position: running(footer);
            height: ${layout.footer.height}px;
            text-align: center;
            font-size: ${fontSize.small}px;
            ${layout.footer.enabled ? '' : 'display: none;'}
        }

        /* 企業ヘッダースタイル */
        .company-header {
            display: flex;
            align-items: center;
            justify-content: ${this.branding.logoPosition};
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 2px solid ${colorTheme.border};
        }

        .company-logo {
            max-width: ${this.branding.logoWidth || 150}px;
            max-height: ${this.branding.logoHeight || 60}px;
            margin-right: 20px;
        }

        .company-info {
            flex: 1;
        }

        .company-name {
            font-size: ${fontSize.title}px;
            font-weight: bold;
            color: ${colorTheme.primary};
            margin-bottom: 5px;
        }

        .company-name-en {
            font-size: ${fontSize.body}px;
            color: ${colorTheme.secondary};
            margin-bottom: 10px;
        }

        .company-contact {
            font-size: ${fontSize.small}px;
            color: ${colorTheme.text};
            line-height: 1.4;
        }

        /* タイトルスタイル */
        .document-title {
            font-size: ${fontSize.title}px;
            font-weight: bold;
            color: ${colorTheme.primary};
            text-align: center;
            margin: 30px 0;
            padding: 20px 0;
            border-top: 3px solid ${colorTheme.primary};
            border-bottom: 3px solid ${colorTheme.primary};
        }

        /* 文書情報スタイル */
        .document-info {
            text-align: right;
            margin-bottom: 30px;
            font-size: ${fontSize.body}px;
        }

        .document-info .label {
            color: ${colorTheme.secondary};
            margin-right: 10px;
        }

        /* 顧客情報スタイル */
        .customer-info {
            background-color: ${colorTheme.background};
            border: 1px solid ${colorTheme.border};
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 5px;
        }

        .customer-info h3 {
            font-size: ${fontSize.header}px;
            color: ${colorTheme.primary};
            margin-bottom: 10px;
            border-bottom: 1px solid ${colorTheme.border};
            padding-bottom: 5px;
        }

        /* テーブルスタイル */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: ${fontSize.body}px;
        }

        .items-table th {
            background-color: ${colorTheme.primary};
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            border: 1px solid ${colorTheme.border};
        }

        .items-table td {
            padding: 10px 8px;
            border: 1px solid ${colorTheme.border};
            vertical-align: top;
        }

        .items-table tr:nth-child(even) {
            background-color: ${this.lightenColor(colorTheme.primary, 95)};
        }

        .items-table .number {
            text-align: right;
        }

        .items-table .category {
            background-color: ${this.lightenColor(colorTheme.secondary, 90)};
            font-weight: bold;
        }

        .items-table .subtotal {
            background-color: ${this.lightenColor(colorTheme.accent, 90)};
            font-weight: bold;
        }

        /* 合計セクション */
        .totals {
            float: right;
            width: 300px;
            margin: 20px 0;
            font-size: ${fontSize.body}px;
        }

        .totals table {
            width: 100%;
            border-collapse: collapse;
        }

        .totals td {
            padding: 8px 12px;
            border: 1px solid ${colorTheme.border};
        }

        .totals .label {
            background-color: ${this.lightenColor(colorTheme.primary, 95)};
            font-weight: bold;
            text-align: right;
        }

        .totals .amount {
            text-align: right;
            font-family: "Courier New", monospace;
        }

        .totals .total-row {
            background-color: ${colorTheme.primary};
            color: white;
            font-weight: bold;
            font-size: ${fontSize.header}px;
        }

        /* 条件・備考 */
        .terms {
            margin: 30px 0;
            padding: 20px;
            background-color: ${this.lightenColor(colorTheme.secondary, 98)};
            border-left: 4px solid ${colorTheme.accent};
        }

        .terms h3 {
            font-size: ${fontSize.header}px;
            color: ${colorTheme.primary};
            margin-bottom: 15px;
        }

        .terms p {
            margin-bottom: 10px;
            line-height: 1.8;
        }

        /* 署名エリア */
        .signatures {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
        }

        .signature-box {
            width: 200px;
            height: 100px;
            border: 1px solid ${colorTheme.border};
            text-align: center;
            padding: 10px;
            position: relative;
        }

        .signature-label {
            font-size: ${fontSize.small}px;
            color: ${colorTheme.secondary};
            margin-bottom: 10px;
        }

        .seal-image {
            width: 60px;
            height: 60px;
            margin: 0 auto;
        }

        /* ユーティリティクラス */
        .page-break {
            page-break-before: always;
        }

        .no-break {
            page-break-inside: avoid;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .font-bold {
            font-weight: bold;
        }

        .clearfix::after {
            content: "";
            display: table;
            clear: both;
        }

        /* ウォーターマーク */
        ${layout.showWatermark && layout.watermarkText ? `
        body::before {
            content: "${layout.watermarkText}";
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            color: rgba(0, 0, 0, ${layout.watermarkOpacity || 0.1});
            z-index: -1;
            pointer-events: none;
        }` : ''}

        /* カスタムCSS */
        ${this.template.styles.customCss || ''}
    `;
  }

  /**
   * ボディコンテンツを生成
   */
  private generateBodyContent(): string {
    let content = '';

    // ヘッダー
    if (this.template.layout.header.enabled) {
      content += `<div class="page-header">${this.processTemplate(this.template.layout.header.content)}</div>`;
    }

    // セクションを順序通りに処理
    const sortedSections = [...this.template.sections].sort((a, b) => a.order - b.order);

    for (const section of sortedSections) {
      if (!section.isVisible || !this.checkSectionConditions(section)) {
        continue;
      }

      content += this.generateSectionContent(section);
    }

    // フッター
    if (this.template.layout.footer.enabled) {
      content += `<div class="page-footer">${this.processTemplate(this.template.layout.footer.content)}</div>`;
    }

    // ページ番号
    if (this.template.layout.showPageNumbers) {
      const pageNumberContent = this.template.layout.pageNumberPosition === 'header'
        ? `<div class="page-header">ページ <span class="page-number"></span></div>`
        : `<div class="page-footer">ページ <span class="page-number"></span></div>`;

      content += pageNumberContent;
    }

    return `<div class="document-container">${content}</div>`;
  }

  /**
   * セクションコンテンツを生成
   */
  private generateSectionContent(section: PdfSection): string {
    const { type, layout, content } = section;

    let sectionHtml = '';

    switch (type) {
      case 'company_header':
        sectionHtml = this.generateCompanyHeader();
        break;

      case 'title':
        sectionHtml = this.generateTitle();
        break;

      case 'document_info':
        sectionHtml = this.generateDocumentInfo();
        break;

      case 'customer_info':
        sectionHtml = this.generateCustomerInfo();
        break;

      case 'items_table':
        sectionHtml = this.generateItemsTable();
        break;

      case 'totals':
        sectionHtml = this.generateTotals();
        break;

      case 'terms':
        sectionHtml = this.generateTerms();
        break;

      case 'signatures':
        sectionHtml = this.generateSignatures();
        break;

      case 'custom_text':
        sectionHtml = this.processTemplate(content.template);
        break;

      case 'page_break':
        sectionHtml = '<div class="page-break"></div>';
        break;

      case 'spacer':
        sectionHtml = `<div style="height: ${layout.marginTop + layout.marginBottom}px;"></div>`;
        break;

      default:
        sectionHtml = this.processTemplate(content.template);
    }

    // セクションのレイアウト設定を適用
    const sectionStyle = `
      width: ${layout.width};
      text-align: ${layout.alignment};
      padding: ${layout.padding}px;
      margin-top: ${layout.marginTop}px;
      margin-bottom: ${layout.marginBottom}px;
    `;

    return `<div class="section section-${type}" style="${sectionStyle}">${sectionHtml}</div>`;
  }

  /**
   * 企業ヘッダーを生成
   */
  private generateCompanyHeader(): string {
    const { companyName, companyNameEn, logoUrl, address, phone, fax, email, website } = this.branding;

    let html = '<div class="company-header">';

    if (logoUrl) {
      html += `<img src="${logoUrl}" alt="Company Logo" class="company-logo" />`;
    }

    html += '<div class="company-info">';
    html += `<div class="company-name">${companyName}</div>`;

    if (companyNameEn) {
      html += `<div class="company-name-en">${companyNameEn}</div>`;
    }

    html += '<div class="company-contact">';
    if (address) html += `<div>${address}</div>`;

    const contactInfo = [];
    if (phone) contactInfo.push(`TEL: ${phone}`);
    if (fax) contactInfo.push(`FAX: ${fax}`);
    if (email) contactInfo.push(`E-mail: ${email}`);

    if (contactInfo.length > 0) {
      html += `<div>${contactInfo.join(' / ')}</div>`;
    }

    if (website) html += `<div>URL: ${website}</div>`;
    html += '</div>'; // company-contact
    html += '</div>'; // company-info
    html += '</div>'; // company-header

    return html;
  }

  /**
   * タイトルを生成
   */
  private generateTitle(): string {
    return `<h1 class="document-title">${this.data.title || 'Document'}</h1>`;
  }

  /**
   * 文書情報を生成
   */
  private generateDocumentInfo(): string {
    const info = [];

    if (this.data.documentNumber) {
      info.push(`<div><span class="label">文書番号:</span>${this.data.documentNumber}</div>`);
    }

    if (this.data.date) {
      info.push(`<div><span class="label">作成日:</span>${this.formatDate(this.data.date)}</div>`);
    }

    if (this.data.validUntil) {
      info.push(`<div><span class="label">有効期限:</span>${this.formatDate(this.data.validUntil)}</div>`);
    }

    return `<div class="document-info">${info.join('')}</div>`;
  }

  /**
   * 顧客情報を生成
   */
  private generateCustomerInfo(): string {
    if (!this.data.customer) return '';

    const { name, address, phone, email, contactPerson } = this.data.customer;

    let html = '<div class="customer-info">';
    html += '<h3>お客様情報</h3>';

    if (name) html += `<div class="customer-name font-bold">${name}</div>`;
    if (address) html += `<div class="customer-address">${address}</div>`;

    const contact = [];
    if (phone) contact.push(`TEL: ${phone}`);
    if (email) contact.push(`E-mail: ${email}`);
    if (contact.length > 0) {
      html += `<div class="customer-contact">${contact.join(' / ')}</div>`;
    }

    if (contactPerson) {
      html += `<div class="contact-person">ご担当者: ${contactPerson}</div>`;
    }

    html += '</div>';
    return html;
  }

  /**
   * 明細テーブルを生成
   */
  private generateItemsTable(): string {
    if (!this.data.items || !Array.isArray(this.data.items)) return '';

    let html = '<table class="items-table no-break">';

    // ヘッダー
    html += `
      <thead>
        <tr>
          <th>No.</th>
          <th>項目名</th>
          <th>仕様</th>
          <th>数量</th>
          <th>単位</th>
          <th>単価</th>
          <th>金額</th>
        </tr>
      </thead>
      <tbody>
    `;

    // 明細行
    this.data.items.forEach((item: any, index: number) => {
      const rowClass = item.isCategory ? 'category' : item.isSubtotal ? 'subtotal' : '';

      html += `<tr class="${rowClass}">`;
      html += `<td class="number">${item.isCategory || item.isSubtotal ? '' : index + 1}</td>`;
      html += `<td>${item.name || ''}</td>`;
      html += `<td>${item.specification || ''}</td>`;
      html += `<td class="number">${item.quantity || ''}</td>`;
      html += `<td>${item.unit || ''}</td>`;
      html += `<td class="number">${item.unitPrice ? this.formatCurrency(item.unitPrice) : ''}</td>`;
      html += `<td class="number">${item.amount ? this.formatCurrency(item.amount) : ''}</td>`;
      html += '</tr>';
    });

    html += '</tbody></table>';
    return html;
  }

  /**
   * 合計を生成
   */
  private generateTotals(): string {
    if (!this.data.totals) return '';

    const { subtotal, tax, discount, total } = this.data.totals;

    let html = '<div class="totals"><table>';

    if (subtotal !== undefined) {
      html += `<tr><td class="label">小計</td><td class="amount">${this.formatCurrency(subtotal)}</td></tr>`;
    }

    if (discount !== undefined && discount > 0) {
      html += `<tr><td class="label">割引</td><td class="amount">-${this.formatCurrency(discount)}</td></tr>`;
    }

    if (tax !== undefined) {
      html += `<tr><td class="label">消費税</td><td class="amount">${this.formatCurrency(tax)}</td></tr>`;
    }

    if (total !== undefined) {
      html += `<tr class="total-row"><td class="label">合計</td><td class="amount">${this.formatCurrency(total)}</td></tr>`;
    }

    html += '</table></div><div class="clearfix"></div>';
    return html;
  }

  /**
   * 条件・備考を生成
   */
  private generateTerms(): string {
    if (!this.data.terms) return '';

    let html = '<div class="terms">';
    html += '<h3>条件・備考</h3>';

    if (typeof this.data.terms === 'string') {
      html += `<p>${this.data.terms.replace(/\n/g, '<br>')}</p>`;
    } else if (Array.isArray(this.data.terms)) {
      this.data.terms.forEach(term => {
        html += `<p>${term}</p>`;
      });
    }

    html += '</div>';
    return html;
  }

  /**
   * 署名欄を生成
   */
  private generateSignatures(): string {
    let html = '<div class="signatures">';

    // 会社側署名
    html += '<div class="signature-box">';
    html += '<div class="signature-label">発行者</div>';
    if (this.branding.sealImageUrl) {
      html += `<img src="${this.branding.sealImageUrl}" alt="Company Seal" class="seal-image" />`;
    }
    html += '</div>';

    // 顧客側署名
    html += '<div class="signature-box">';
    html += '<div class="signature-label">お客様</div>';
    html += '<div style="height: 60px; border-bottom: 1px solid #ccc; margin-top: 20px;"></div>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  /**
   * テンプレート変数を処理
   */
  private processTemplate(template: string): string {
    if (!template) return '';

    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const keys = key.trim().split('.');
      let value = this.data;

      for (const k of keys) {
        value = value?.[k];
      }

      if (value === undefined || value === null) {
        return '';
      }

      return String(value);
    });
  }

  /**
   * セクション表示条件をチェック
   */
  private checkSectionConditions(section: PdfSection): boolean {
    if (!section.conditions || section.conditions.length === 0) {
      return true;
    }

    return section.conditions.every(condition => {
      const value = this.data[condition.field];

      switch (condition.operator) {
        case 'equals':
          return value === condition.value;
        case 'not_equals':
          return value !== condition.value;
        case 'contains':
          return String(value).includes(String(condition.value));
        case 'greater_than':
          return Number(value) > Number(condition.value);
        case 'less_than':
          return Number(value) < Number(condition.value);
        default:
          return true;
      }
    });
  }

  /**
   * 通貨フォーマット
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  }

  /**
   * 日付フォーマット
   */
  private formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('ja-JP');
  }

  /**
   * 色を明るくする
   */
  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }
}

/**
 * PDFテンプレートエンジンの便利関数
 */
export class PdfTemplateService {
  /**
   * テンプレートからPDFを生成
   */
  static async generateFromTemplate(request: PdfGenerationRequest): Promise<PdfGenerationResponse> {
    try {
      // テンプレートとブランディング情報を取得
      const [templateResponse, brandingResponse] = await Promise.all([
        fetch(`/api/pdf/templates/${request.templateId}?companyId=${request.data.companyId}`),
        fetch(`/api/pdf/branding?companyId=${request.data.companyId}`)
      ]);

      if (!templateResponse.ok || !brandingResponse.ok) {
        throw new Error('テンプレートまたはブランディング情報の取得に失敗しました');
      }

      const template = await templateResponse.json();
      const branding = await brandingResponse.json();

      // PDFエンジンでPDF生成
      const engine = new PdfTemplateEngine(template, branding.branding, request.data);
      const result = await engine.generatePdf();

      // 使用回数を更新
      await this.updateTemplateUsage(request.templateId);

      return {
        success: true,
        filename: request.options?.filename || `${request.documentType}_${Date.now()}.pdf`
      };

    } catch (error) {
      console.error('PDF生成エラー:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PDF生成に失敗しました'
      };
    }
  }

  /**
   * テンプレートの使用回数を更新
   */
  private static async updateTemplateUsage(templateId: string): Promise<void> {
    try {
      await fetch(`/api/pdf/templates/${templateId}/usage`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('使用回数更新エラー:', error);
    }
  }

  /**
   * プレビュー用HTMLを生成
   */
  static async generatePreviewHtml(
    template: PdfTemplate,
    branding: CompanyBranding,
    sampleData: Record<string, any>
  ): Promise<string> {
    const engine = new PdfTemplateEngine(template, branding, sampleData);
    return engine.generateHtmlContent();
  }
}