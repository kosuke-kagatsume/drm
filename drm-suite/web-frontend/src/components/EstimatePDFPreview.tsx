'use client';

import { useState, useEffect } from 'react';
import { X, Download, Printer, Eye, FileText } from 'lucide-react';
import { PDFClientService, EstimateData } from '@/services/pdf-client.service';

interface EstimatePDFPreviewProps {
  estimate: EstimateData;
  onClose: () => void;
}

export default function EstimatePDFPreview({
  estimate,
  onClose,
}: EstimatePDFPreviewProps) {
  const [pdfDataUrl, setPdfDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [viewMode, setViewMode] = useState<'preview' | 'print'>('preview');

  useEffect(() => {
    generatePDFPreview();
  }, [estimate]);

  const generatePDFPreview = async () => {
    try {
      setIsGenerating(true);
      const dataUrl =
        await PDFClientService.generateEstimatePDFDataURL(estimate);
      setPdfDataUrl(dataUrl);
    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert('PDF生成中にエラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    try {
      await PDFClientService.downloadEstimatePDF(estimate);
    } catch (error) {
      console.error('PDFダウンロードエラー:', error);
      alert('PDFダウンロード中にエラーが発生しました');
    }
  };

  const handlePrint = () => {
    if (pdfDataUrl) {
      // 新しいウィンドウでPDFを開いて印刷
      const printWindow = window.open(pdfDataUrl, '_blank');
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* ヘッダー */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">見積書PDF</h2>
              <p className="text-sm opacity-90">
                {estimate.id} - {estimate.customerName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-white/20 rounded-lg p-1">
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded-md transition flex items-center gap-2 ${
                  viewMode === 'preview'
                    ? 'bg-white text-blue-600'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Eye className="h-4 w-4" />
                プレビュー
              </button>
              <button
                onClick={() => setViewMode('print')}
                className={`px-3 py-1 rounded-md transition flex items-center gap-2 ${
                  viewMode === 'print'
                    ? 'bg-white text-blue-600'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Printer className="h-4 w-4" />
                印刷設定
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 flex overflow-hidden">
          {/* PDFプレビュー */}
          <div className="flex-1 bg-gray-100 p-4 overflow-auto">
            {isGenerating ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">PDFを生成中...</p>
                </div>
              </div>
            ) : pdfDataUrl ? (
              <div
                className="bg-white shadow-lg rounded-lg overflow-hidden mx-auto"
                style={{ maxWidth: '210mm' }}
              >
                <iframe
                  src={pdfDataUrl}
                  className="w-full"
                  style={{ height: '297mm' }}
                  title="PDF Preview"
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">PDFを表示できません</p>
              </div>
            )}
          </div>

          {/* サイドパネル */}
          {viewMode === 'print' && (
            <div className="w-80 bg-white border-l p-6 overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">印刷設定</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    用紙サイズ
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="a4">A4</option>
                    <option value="a3">A3</option>
                    <option value="b4">B4</option>
                    <option value="b5">B5</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    印刷方向
                  </label>
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 border-2 border-blue-500 text-blue-600 rounded-lg">
                      縦向き
                    </button>
                    <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:border-gray-400">
                      横向き
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    印刷部数
                  </label>
                  <input
                    type="number"
                    min="1"
                    defaultValue="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    オプション
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm">
                        ヘッダー・フッターを含める
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm">ページ番号を表示</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">社印を追加</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    プレビュー情報
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>ページ数: 1ページ</p>
                    <p>ファイルサイズ: 約 250KB</p>
                    <p>生成日時: {new Date().toLocaleString('ja-JP')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="px-6 py-4 border-t flex items-center justify-between bg-gray-50 rounded-b-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText className="h-4 w-4" />
            <span>
              見積書_{estimate.id}_{estimate.customerName}.pdf
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
            >
              閉じる
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              印刷
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              ダウンロード
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
