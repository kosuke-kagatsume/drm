'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Eye,
  Download,
  Settings,
  Palette,
  Layout,
  CheckCircle,
  RefreshCw,
  X,
  Monitor,
  Smartphone,
  Printer,
  ArrowLeft,
  ArrowRight,
  Star,
} from 'lucide-react';
import {
  PdfTemplate,
  CompanyBranding,
  DocumentType,
} from '@/types/pdf-template';
import { PdfTemplateService } from '@/lib/pdf-engine';

interface TemplateSelectorProps {
  companyId: string;
  documentType?: DocumentType;
  estimateData?: any;
  onTemplateSelect: (template: PdfTemplate) => void;
  onClose?: () => void;
}

export default function TemplateSelector({
  companyId,
  documentType = 'estimate',
  estimateData,
  onTemplateSelect,
  onClose,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<PdfTemplate[]>([]);
  const [branding, setBranding] = useState<CompanyBranding | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PdfTemplate | null>(
    null,
  );
  const [showPreview, setShowPreview] = useState(true); // デフォルトでプレビューを表示
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<
    'desktop' | 'mobile' | 'print'
  >('desktop');

  useEffect(() => {
    loadTemplatesAndBranding();
  }, [companyId, documentType]);

  // brandingとselectedTemplateが揃ったら自動的にプレビューを生成
  useEffect(() => {
    if (branding && selectedTemplate && showPreview && !previewHtml) {
      generatePreview(selectedTemplate);
    }
  }, [branding, selectedTemplate]);

  const loadTemplatesAndBranding = async () => {
    try {
      setLoading(true);

      const [templatesResponse, brandingResponse] = await Promise.all([
        fetch(
          `/api/pdf/templates?companyId=${companyId}&documentType=${documentType}`,
        ),
        fetch(`/api/pdf/branding?companyId=${companyId}`),
      ]);

      let defaultTemplate: PdfTemplate | null = null;

      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData.templates);

        // デフォルトテンプレートがあれば選択
        defaultTemplate = templatesData.templates.find(
          (t: PdfTemplate) => t.isDefault,
        );
        if (defaultTemplate) {
          setSelectedTemplate(defaultTemplate);
        }
      }

      if (brandingResponse.ok) {
        const brandingData = await brandingResponse.json();
        setBranding(brandingData.branding);
      }
    } catch (error) {
      console.error('データ読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: PdfTemplate) => {
    setSelectedTemplate(template);
    // テンプレート選択時に自動的にプレビューを表示
    setShowPreview(true);
    generatePreview(template);
  };

  const generatePreview = async (template: PdfTemplate) => {
    // brandingのみチェック（estimateDataがなくてもサンプルデータを使用）
    if (!branding) return;

    try {
      setPreviewLoading(true);

      // サンプルデータまたは実際の見積データ
      const previewData = estimateData || getSampleEstimateData();

      // プレビューHTML生成（実際にはPdfTemplateService.generatePreviewHtmlを使用）
      const html = await generatePreviewHtml(template, branding, previewData);
      setPreviewHtml(html);
    } catch (error) {
      console.error('プレビュー生成エラー:', error);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handlePreviewToggle = () => {
    if (!showPreview && selectedTemplate) {
      generatePreview(selectedTemplate);
    }
    setShowPreview(!showPreview);
  };

  const handleConfirmSelection = () => {
    if (selectedTemplate) {
      onTemplateSelect(selectedTemplate);
    }
  };

  const getSampleEstimateData = () => {
    // documentTypeに応じたサンプルデータを生成
    const baseItems = [
      {
        name: '基礎工事',
        specification: 'RC造基礎工事一式',
        quantity: 1,
        unit: '式',
        unitPrice: 5000000,
        amount: 5000000,
      },
      {
        name: '構造工事',
        specification: 'RC造躯体工事',
        quantity: 150,
        unit: 'm²',
        unitPrice: 80000,
        amount: 12000000,
      },
      {
        name: '仕上工事',
        specification: '内装・外装仕上工事',
        quantity: 1,
        unit: '式',
        unitPrice: 8000000,
        amount: 8000000,
      },
    ];

    const baseTotals = {
      subtotal: 25000000,
      tax: 2500000,
      total: 27500000,
    };

    const customer = {
      name: '株式会社サンプル',
      address: '東京都渋谷区〇〇 1-2-3',
      phone: '03-0000-0000',
      email: 'sample@example.com',
      contactPerson: '田中 太郎',
    };

    switch (documentType) {
      case 'invoice':
        return {
          title: '建設工事請求書',
          documentNumber: 'INV-2024-001',
          date: new Date().toISOString(),
          validUntil: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          dueDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          companyId,
          customer,
          items: baseItems,
          totals: baseTotals,
          terms: [
            '支払期限：請求書発行日より30日以内',
            '振込手数料：お客様負担',
            '備考：本請求書は電子契約に基づき発行されています。',
          ],
        };

      case 'order':
        return {
          title: '発注書',
          documentNumber: 'ORD-2024-001',
          date: new Date().toISOString(),
          validUntil: new Date(
            Date.now() + 60 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          deliveryDate: new Date(
            Date.now() + 60 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          companyId,
          customer: {
            name: '協力会社A',
            address: '東京都江東区〇〇 4-5-6',
            phone: '03-1111-2222',
            email: 'supplier@example.com',
            contactPerson: '山田 花子',
          },
          items: baseItems,
          totals: baseTotals,
          terms: [
            '納期：発注日より60日',
            '納品場所：指定現場への直送',
            '検収：納品後7日以内',
            '備考：工事の品質管理には十分ご配慮ください。',
          ],
        };

      case 'contract':
        return {
          title: '工事請負契約書',
          documentNumber: 'CON-2024-001',
          date: new Date().toISOString(),
          validUntil: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          startDate: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          endDate: new Date(
            Date.now() + 127 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          companyId,
          customer,
          items: baseItems,
          totals: baseTotals,
          terms: [
            '第1条: 工事内容および工期',
            '第2条: 請負代金および支払条件',
            '第3条: 契約の変更',
            '第4条: 瑕疵担保責任',
            '第5条: 本契約は民法および建設業法に基づき締結されます。',
          ],
        };

      case 'estimate':
      default:
        return {
          title: '建設工事見積書',
          documentNumber: 'EST-2024-001',
          date: new Date().toISOString(),
          validUntil: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          companyId,
          customer,
          items: baseItems,
          totals: baseTotals,
          terms: [
            '工期：着工より4ヶ月',
            '支払条件：着手金30%、中間金40%、完成金30%',
            '有効期限：本見積書発行日より1ヶ月間',
            '備考：材料費の変動により金額が変更になる場合があります',
          ],
        };
    }
  };

  const generatePreviewHtml = async (
    template: PdfTemplate,
    branding: CompanyBranding,
    data: any,
  ): Promise<string> => {
    // 简化版のプレビューHTML生成
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: ${branding.primaryFont};
              margin: 20px;
              color: ${branding.colorTheme.text};
            }
            .header {
              text-align: center;
              border-bottom: 2px solid ${branding.colorTheme.primary};
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: ${branding.colorTheme.primary};
            }
            .title {
              font-size: 28px;
              text-align: center;
              margin: 30px 0;
              color: ${branding.colorTheme.primary};
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 30px;
            }
            .customer-info {
              border: 1px solid ${branding.colorTheme.border};
              padding: 15px;
              border-radius: 5px;
            }
            .document-info {
              text-align: right;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th {
              background: ${branding.colorTheme.primary};
              color: white;
              padding: 10px;
              text-align: left;
            }
            td {
              border: 1px solid ${branding.colorTheme.border};
              padding: 8px;
            }
            .totals {
              float: right;
              width: 300px;
              margin-top: 20px;
            }
            .total-row {
              background: ${branding.colorTheme.primary};
              color: white;
              font-weight: bold;
            }
            .terms {
              margin-top: 40px;
              padding: 20px;
              background: #f9f9f9;
              border-left: 4px solid ${branding.colorTheme.accent};
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${branding.companyName}</div>
            ${branding.address ? `<div>${branding.address}</div>` : ''}
            ${branding.phone ? `<div>TEL: ${branding.phone}</div>` : ''}
          </div>

          <h1 class="title">${data.title}</h1>

          <div class="info-grid">
            <div class="customer-info">
              <h3>お客様情報</h3>
              <div><strong>${data.customer.name}</strong></div>
              <div>${data.customer.address}</div>
              <div>TEL: ${data.customer.phone}</div>
              <div>担当者: ${data.customer.contactPerson}</div>
            </div>
            <div class="document-info">
              <div>見積番号: ${data.documentNumber}</div>
              <div>作成日: ${new Date(data.date).toLocaleDateString('ja-JP')}</div>
              <div>有効期限: ${new Date(data.validUntil).toLocaleDateString('ja-JP')}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>項目</th>
                <th>仕様</th>
                <th>数量</th>
                <th>単位</th>
                <th>単価</th>
                <th>金額</th>
              </tr>
            </thead>
            <tbody>
              ${data.items
                .map(
                  (item: any, index: number) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.specification}</td>
                  <td style="text-align: right">${item.quantity.toLocaleString()}</td>
                  <td>${item.unit}</td>
                  <td style="text-align: right">¥${item.unitPrice.toLocaleString()}</td>
                  <td style="text-align: right">¥${item.amount.toLocaleString()}</td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>

          <div class="totals">
            <table>
              <tr><td>小計</td><td style="text-align: right">¥${data.totals.subtotal.toLocaleString()}</td></tr>
              <tr><td>消費税(10%)</td><td style="text-align: right">¥${data.totals.tax.toLocaleString()}</td></tr>
              <tr class="total-row"><td>合計</td><td style="text-align: right">¥${data.totals.total.toLocaleString()}</td></tr>
            </table>
          </div>

          <div style="clear: both;"></div>

          <div class="terms">
            <h3>条件・備考</h3>
            ${data.terms.map((term: string) => `<p>• ${term}</p>`).join('')}
          </div>
        </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="flex items-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-3" />
            テンプレートを読み込み中...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-7xl h-[90vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold">PDFテンプレート選択</h2>
              <p className="text-sm text-gray-600">
                {documentType === 'estimate' ? '見積書' : documentType}
                テンプレートを選択してください
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {showPreview && (
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 ${previewMode === 'desktop' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                  title="デスクトップ表示"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 ${previewMode === 'mobile' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                  title="モバイル表示"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('print')}
                  className={`p-2 ${previewMode === 'print' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                  title="印刷表示"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            )}
            <button
              onClick={handlePreviewToggle}
              className={`px-3 py-2 text-sm rounded-md border ${
                showPreview
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              <Eye className="w-4 h-4 mr-1 inline" />
              プレビュー
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 flex min-h-0">
          {/* テンプレート一覧 */}
          <div
            className={`${showPreview ? 'w-1/3' : 'w-full'} border-r overflow-y-auto`}
          >
            <div className="p-4">
              <h3 className="font-semibold mb-4">
                利用可能なテンプレート ({templates.length}件)
              </h3>
              <div className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="font-medium text-gray-900">
                            {template.name}
                          </h4>
                          {template.isDefault && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current ml-2" />
                          )}
                        </div>
                        {template.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {template.description}
                          </p>
                        )}
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <Layout className="w-3 h-3 mr-1" />
                          {template.layout.pageSize}{' '}
                          {template.layout.orientation}
                          <span className="mx-2">•</span>
                          <Eye className="w-3 h-3 mr-1" />
                          {template.usageCount}回使用
                        </div>
                      </div>
                      {selectedTemplate?.id === template.id && (
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* プレビューエリア */}
          {showPreview && (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">プレビュー</h3>
                  {selectedTemplate && (
                    <span className="text-sm text-gray-600">
                      {selectedTemplate.name}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-1 p-4 overflow-auto bg-gray-100">
                {previewLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                    プレビューを生成中...
                  </div>
                ) : previewHtml ? (
                  <div
                    className={`bg-white shadow-lg mx-auto ${
                      previewMode === 'mobile'
                        ? 'max-w-sm'
                        : previewMode === 'print'
                          ? 'max-w-4xl'
                          : 'max-w-3xl'
                    } ${previewMode === 'print' ? 'text-sm' : ''}`}
                  >
                    <iframe
                      srcDoc={previewHtml}
                      className="w-full h-full min-h-[600px] border-0"
                      title="PDF Preview"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    テンプレートを選択してプレビューを表示
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedTemplate ? (
              <>
                選択中: <strong>{selectedTemplate.name}</strong>
                {selectedTemplate.isDefault && (
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                    デフォルト
                  </span>
                )}
              </>
            ) : (
              'テンプレートを選択してください'
            )}
          </div>
          <div className="flex items-center space-x-3">
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                キャンセル
              </button>
            )}
            <button
              onClick={handleConfirmSelection}
              disabled={!selectedTemplate}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              このテンプレートで生成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
