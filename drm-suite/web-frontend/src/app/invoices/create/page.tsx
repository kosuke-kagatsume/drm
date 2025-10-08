'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FileText,
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  Send,
  Building2
} from 'lucide-react';

function CreateInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contractId = searchParams.get('contractId');

  const [loading, setLoading] = useState(false);
  const [loadingContract, setLoadingContract] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    invoiceNo: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    contractId: contractId || '',
    contractNo: '',
    customerName: '',
    customerCompany: '',
    customerAddress: '',
    customerPhone: '',
    customerEmail: '',
    projectName: '',
    projectType: '',
    items: [] as any[],
    subtotal: 0,
    taxRate: 10,
    taxAmount: 0,
    totalAmount: 0,
    paymentTerms: '月末締め翌月末払い',
    paymentMethod: '銀行振込',
    bankInfo: {
      bankName: 'みずほ銀行',
      branchName: '渋谷支店',
      accountType: '普通',
      accountNumber: '1234567',
      accountHolder: '株式会社サンプル建設',
    },
    notes: '',
    createdBy: 'システムユーザー',
  });

  useEffect(() => {
    if (contractId) {
      loadContractData();
    } else {
      // 契約IDがない場合は支払期限のみ設定
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      setInvoiceData(prev => ({
        ...prev,
        dueDate: dueDate.toISOString().split('T')[0],
      }));
    }
  }, [contractId]);

  const loadContractData = async () => {
    try {
      setLoadingContract(true);
      const response = await fetch(`/api/invoices/from-contract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId }),
      });

      const data = await response.json();
      if (data.success) {
        setInvoiceData(prev => ({
          ...prev,
          ...data.invoice,
        }));
      } else {
        alert('契約データの読み込みに失敗しました');
      }
    } catch (error) {
      console.error('Error loading contract data:', error);
      alert('エラーが発生しました');
    } finally {
      setLoadingContract(false);
    }
  };

  const handleAddItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `ITEM-${prev.items.length + 1}`,
          category: '',
          description: '',
          quantity: 1,
          unit: '式',
          unitPrice: 0,
          amount: 0,
        },
      ],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
    calculateTotals();
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setInvoiceData(prev => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      };

      // 金額を自動計算
      if (field === 'quantity' || field === 'unitPrice') {
        newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;
      }

      return { ...prev, items: newItems };
    });

    // 合計を再計算
    setTimeout(calculateTotals, 0);
  };

  const calculateTotals = () => {
    setInvoiceData(prev => {
      const subtotal = prev.items.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = Math.floor(subtotal * (prev.taxRate / 100));
      const totalAmount = subtotal + taxAmount;

      return {
        ...prev,
        subtotal,
        taxAmount,
        totalAmount,
      };
    });
  };

  const handleSave = async (status: 'draft' | 'issued') => {
    try {
      setLoading(true);

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...invoiceData,
          status,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(status === 'draft' ? '下書きとして保存しました' : '請求書を発行しました');
        router.push('/invoices');
      } else {
        alert('保存に失敗しました');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (loadingContract) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">契約データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  請求書作成
                </h1>
                {contractId && (
                  <p className="mt-1 text-sm text-gray-500">
                    契約番号: {invoiceData.contractNo}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleSave('draft')}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                下書き保存
              </button>
              <button
                onClick={() => handleSave('issued')}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                発行
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* メイン入力エリア */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本情報 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    請求日
                  </label>
                  <input
                    type="date"
                    value={invoiceData.invoiceDate}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    支払期限
                  </label>
                  <input
                    type="date"
                    value={invoiceData.dueDate}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* 顧客情報 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                顧客情報
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      顧客名
                    </label>
                    <input
                      type="text"
                      value={invoiceData.customerName}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, customerName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="田中太郎"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      会社名
                    </label>
                    <input
                      type="text"
                      value={invoiceData.customerCompany}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, customerCompany: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="株式会社サンプル"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    住所
                  </label>
                  <input
                    type="text"
                    value={invoiceData.customerAddress}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, customerAddress: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="東京都渋谷区1-2-3"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      電話番号
                    </label>
                    <input
                      type="tel"
                      value={invoiceData.customerPhone}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, customerPhone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="03-1234-5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      メールアドレス
                    </label>
                    <input
                      type="email"
                      value={invoiceData.customerEmail}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, customerEmail: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="tanaka@example.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* プロジェクト情報 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">プロジェクト情報</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    プロジェクト名
                  </label>
                  <input
                    type="text"
                    value={invoiceData.projectName}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, projectName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="田中様邸新築工事"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    工事種別
                  </label>
                  <select
                    value={invoiceData.projectType}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, projectType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">選択してください</option>
                    <option value="新築">新築</option>
                    <option value="リフォーム">リフォーム</option>
                    <option value="修繕">修繕</option>
                    <option value="その他">その他</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 請求項目 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">請求項目</h2>
                <button
                  onClick={handleAddItem}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  項目追加
                </button>
              </div>

              <div className="space-y-4">
                {invoiceData.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 grid grid-cols-6 gap-3">
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            工事分類
                          </label>
                          <input
                            type="text"
                            value={item.category}
                            onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                            placeholder="基礎工事"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            説明
                          </label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                            placeholder="べた基礎工事一式"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            数量
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            単位
                          </label>
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          単価
                        </label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          金額
                        </label>
                        <div className="px-2 py-1.5 bg-gray-50 rounded border border-gray-200 text-sm font-medium">
                          ¥{item.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {invoiceData.items.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    請求項目がありません。「項目追加」ボタンから追加してください。
                  </div>
                )}
              </div>
            </div>

            {/* 備考 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">備考</h2>
              <textarea
                value={invoiceData.notes}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={4}
                placeholder="特記事項などがあればご記入ください"
              />
            </div>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 金額サマリー */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">金額サマリー</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">小計</span>
                  <span className="font-medium">¥{invoiceData.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">消費税（{invoiceData.taxRate}%）</span>
                  <span className="font-medium">¥{invoiceData.taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 text-lg font-bold">
                  <span>合計</span>
                  <span className="text-blue-600">¥{invoiceData.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 支払条件 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">支払条件</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    支払条件
                  </label>
                  <input
                    type="text"
                    value={invoiceData.paymentTerms}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    支払方法
                  </label>
                  <select
                    value={invoiceData.paymentMethod}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="銀行振込">銀行振込</option>
                    <option value="クレジットカード">クレジットカード</option>
                    <option value="現金">現金</option>
                    <option value="手形">手形</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 振込先情報 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">振込先情報</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">銀行名:</span>
                  <span className="ml-2 font-medium">{invoiceData.bankInfo.bankName}</span>
                </div>
                <div>
                  <span className="text-gray-600">支店名:</span>
                  <span className="ml-2 font-medium">{invoiceData.bankInfo.branchName}</span>
                </div>
                <div>
                  <span className="text-gray-600">口座種別:</span>
                  <span className="ml-2 font-medium">{invoiceData.bankInfo.accountType}</span>
                </div>
                <div>
                  <span className="text-gray-600">口座番号:</span>
                  <span className="ml-2 font-medium">{invoiceData.bankInfo.accountNumber}</span>
                </div>
                <div>
                  <span className="text-gray-600">口座名義:</span>
                  <span className="ml-2 font-medium">{invoiceData.bankInfo.accountHolder}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateInvoicePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <CreateInvoiceContent />
    </Suspense>
  );
}
