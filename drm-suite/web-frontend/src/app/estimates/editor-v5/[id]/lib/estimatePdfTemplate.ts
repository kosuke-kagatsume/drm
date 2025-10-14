/**
 * 見積書用PDFテンプレート
 * 管理コンソールのPDFシステムと統合
 */

import { PdfTemplate } from '@/types/pdf-template';

export const ESTIMATE_PDF_TEMPLATE: Omit<
  PdfTemplate,
  'id' | 'companyId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'usageCount'
> = {
  name: '標準見積書テンプレート',
  description: 'editor-v5用の標準見積書テンプレート',
  documentType: 'estimate',
  status: 'active',
  version: '1.0',

  layout: {
    pageSize: 'A4',
    orientation: 'portrait',
    margins: {
      top: 15,
      right: 15,
      bottom: 15,
      left: 15,
    },
    header: {
      enabled: true,
      height: 80,
      content: '<div class="header-content"></div>',
    },
    footer: {
      enabled: true,
      height: 50,
      content: '<div class="footer-content"></div>',
    },
    showPageNumbers: true,
    pageNumberPosition: 'footer',
    showWatermark: false,
  },

  sections: [
    {
      id: 'company_header',
      name: '企業ヘッダー',
      type: 'company_header',
      order: 1,
      isRequired: true,
      isVisible: true,
      layout: {
        width: '100%',
        alignment: 'left',
        padding: 0,
        marginTop: 0,
        marginBottom: 20,
      },
      content: {
        template: `
          <div class="company-header">
            {{#if logoUrl}}
            <img src="{{logoUrl}}" alt="{{companyName}}" class="company-logo" />
            {{/if}}
            <div class="company-info">
              <h1 class="company-name">{{companyName}}</h1>
              <p class="company-details">
                〒{{postalCode}} {{address}}<br/>
                TEL: {{phone}} {{#if fax}}FAX: {{fax}}{{/if}}<br/>
                {{#if email}}{{email}}{{/if}}
              </p>
            </div>
          </div>
        `,
        variables: [
          'logoUrl',
          'companyName',
          'postalCode',
          'address',
          'phone',
          'fax',
          'email',
        ],
      },
    },
    {
      id: 'title',
      name: 'タイトル',
      type: 'title',
      order: 2,
      isRequired: true,
      isVisible: true,
      layout: {
        width: '100%',
        alignment: 'center',
        padding: 0,
        marginTop: 20,
        marginBottom: 20,
      },
      content: {
        template: '<h2 class="document-title">御　見　積　書</h2>',
        variables: [],
      },
    },
    {
      id: 'document_info',
      name: '文書情報',
      type: 'document_info',
      order: 3,
      isRequired: true,
      isVisible: true,
      layout: {
        width: '100%',
        alignment: 'left',
        padding: 0,
        marginTop: 0,
        marginBottom: 20,
      },
      content: {
        template: `
          <div class="document-info">
            <table class="info-table">
              <tr>
                <th>見積No.</th>
                <td>{{estimateId}}</td>
                <th>作成日</th>
                <td>{{createdDate}}</td>
              </tr>
              <tr>
                <th>件名</th>
                <td colspan="3">{{title}}</td>
              </tr>
              <tr>
                <th>お客様名</th>
                <td colspan="3">{{customerName}}</td>
              </tr>
              <tr>
                <th>有効期限</th>
                <td colspan="3">{{validUntil}}</td>
              </tr>
            </table>
          </div>
        `,
        variables: [
          'estimateId',
          'createdDate',
          'title',
          'customerName',
          'validUntil',
        ],
      },
    },
    {
      id: 'items_table',
      name: '明細テーブル',
      type: 'items_table',
      order: 4,
      isRequired: true,
      isVisible: true,
      layout: {
        width: '100%',
        alignment: 'left',
        padding: 0,
        marginTop: 20,
        marginBottom: 20,
      },
      content: {
        template: `
          <div class="items-section">
            <table class="items-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>大項目</th>
                  <th>小項目</th>
                  <th>項目名</th>
                  <th>仕様</th>
                  <th>数量</th>
                  <th>単位</th>
                  <th>単価</th>
                  <th>金額</th>
                </tr>
              </thead>
              <tbody>
                {{#each items}}
                <tr>
                  <td>{{no}}</td>
                  <td>{{category}}</td>
                  <td>{{minorCategory}}</td>
                  <td>{{itemName}}</td>
                  <td>{{specification}}</td>
                  <td class="text-right">{{quantity}}</td>
                  <td>{{unit}}</td>
                  <td class="text-right">{{formatPrice unitPrice}}</td>
                  <td class="text-right">{{formatPrice amount}}</td>
                </tr>
                {{/each}}
              </tbody>
            </table>
          </div>
        `,
        variables: ['items'],
      },
    },
    {
      id: 'totals',
      name: '合計',
      type: 'totals',
      order: 5,
      isRequired: true,
      isVisible: true,
      layout: {
        width: '100%',
        alignment: 'right',
        padding: 0,
        marginTop: 20,
        marginBottom: 20,
      },
      content: {
        template: `
          <div class="totals-section">
            <table class="totals-table">
              <tr>
                <th>小計</th>
                <td>{{formatPrice subtotal}}</td>
              </tr>
              <tr>
                <th>消費税（10%）</th>
                <td>{{formatPrice tax}}</td>
              </tr>
              <tr class="total-row">
                <th>合計金額</th>
                <td>{{formatPrice totalAmount}}</td>
              </tr>
            </table>
          </div>
        `,
        variables: ['subtotal', 'tax', 'totalAmount'],
      },
    },
    {
      id: 'terms',
      name: '条件・備考',
      type: 'terms',
      order: 6,
      isRequired: false,
      isVisible: true,
      layout: {
        width: '100%',
        alignment: 'left',
        padding: 0,
        marginTop: 20,
        marginBottom: 20,
      },
      content: {
        template: `
          <div class="terms-section">
            <h3>備考</h3>
            <p class="terms-text">{{comment}}</p>
            <h3>お支払い条件</h3>
            <ul class="terms-list">
              <li>納期：ご相談の上、決定させていただきます</li>
              <li>お支払い：工事完了後、請求書発行から30日以内にお振込みください</li>
              <li>有効期限：本見積書の有効期限は発行日より30日間です</li>
            </ul>
          </div>
        `,
        variables: ['comment'],
      },
    },
    {
      id: 'signatures',
      name: '署名欄',
      type: 'signatures',
      order: 7,
      isRequired: false,
      isVisible: true,
      layout: {
        width: '100%',
        alignment: 'right',
        padding: 0,
        marginTop: 30,
        marginBottom: 0,
      },
      content: {
        template: `
          <div class="signature-section">
            {{#if sealImageUrl}}
            <img src="{{sealImageUrl}}" alt="印鑑" class="seal-image" />
            {{/if}}
            <p class="signature-line">担当者：_________________</p>
          </div>
        `,
        variables: ['sealImageUrl'],
      },
    },
  ],

  styles: {
    globalCss: '',
    useCompanyBranding: true,
  },

  permissions: {
    allowEdit: ['admin', 'manager', 'sales'],
    allowView: ['admin', 'manager', 'sales', 'accounting'],
    allowPrint: ['admin', 'manager', 'sales'],
    allowDownload: ['admin', 'manager', 'sales'],
  },

  isDefault: true,
};
