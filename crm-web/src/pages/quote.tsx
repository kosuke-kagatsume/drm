import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { mockProjects } from '@/lib/mock-data';
import { FileText, Copy, Save, Send, Plus, Trash2, Calculator, Download } from 'lucide-react';

// 見積テンプレート
const quoteTemplates = [
  {
    id: 'new-construction',
    name: '新築工事見積',
    items: [
      {
        category: '仮設工事',
        name: '仮設足場',
        unit: '㎡',
        unitPrice: 1200,
        quantity: 150,
        subtotal: 180000,
      },
      {
        category: '基礎工事',
        name: '基礎コンクリート',
        unit: '㎥',
        unitPrice: 25000,
        quantity: 45,
        subtotal: 1125000,
      },
      {
        category: '躯体工事',
        name: '木造軸組',
        unit: '坪',
        unitPrice: 180000,
        quantity: 35,
        subtotal: 6300000,
      },
      {
        category: '屋根工事',
        name: '瓦葺き',
        unit: '㎡',
        unitPrice: 8500,
        quantity: 120,
        subtotal: 1020000,
      },
      {
        category: '外装工事',
        name: 'サイディング',
        unit: '㎡',
        unitPrice: 4500,
        quantity: 180,
        subtotal: 810000,
      },
      {
        category: '内装工事',
        name: 'クロス貼り',
        unit: '㎡',
        unitPrice: 1200,
        quantity: 280,
        subtotal: 336000,
      },
      {
        category: '設備工事',
        name: '給排水設備一式',
        unit: '式',
        unitPrice: 2500000,
        quantity: 1,
        subtotal: 2500000,
      },
      {
        category: '電気工事',
        name: '電気設備一式',
        unit: '式',
        unitPrice: 1800000,
        quantity: 1,
        subtotal: 1800000,
      },
    ],
  },
  {
    id: 'renovation',
    name: 'リフォーム工事見積',
    items: [
      {
        category: '解体工事',
        name: '内装解体',
        unit: '㎡',
        unitPrice: 3500,
        quantity: 80,
        subtotal: 280000,
      },
      {
        category: '木工事',
        name: '間仕切り変更',
        unit: '式',
        unitPrice: 450000,
        quantity: 1,
        subtotal: 450000,
      },
      {
        category: '内装工事',
        name: 'フローリング貼替',
        unit: '㎡',
        unitPrice: 8500,
        quantity: 60,
        subtotal: 510000,
      },
      {
        category: '設備工事',
        name: 'システムキッチン',
        unit: '式',
        unitPrice: 1200000,
        quantity: 1,
        subtotal: 1200000,
      },
      {
        category: '設備工事',
        name: 'ユニットバス',
        unit: '式',
        unitPrice: 900000,
        quantity: 1,
        subtotal: 900000,
      },
      {
        category: '電気工事',
        name: '配線更新',
        unit: '式',
        unitPrice: 350000,
        quantity: 1,
        subtotal: 350000,
      },
    ],
  },
  {
    id: 'exterior',
    name: '外構工事見積',
    items: [
      {
        category: '土工事',
        name: '整地',
        unit: '㎡',
        unitPrice: 1500,
        quantity: 200,
        subtotal: 300000,
      },
      {
        category: '舗装工事',
        name: 'コンクリート舗装',
        unit: '㎡',
        unitPrice: 6500,
        quantity: 80,
        subtotal: 520000,
      },
      {
        category: 'フェンス工事',
        name: 'アルミフェンス',
        unit: 'm',
        unitPrice: 12000,
        quantity: 45,
        subtotal: 540000,
      },
      {
        category: '植栽工事',
        name: '植栽一式',
        unit: '式',
        unitPrice: 350000,
        quantity: 1,
        subtotal: 350000,
      },
      {
        category: '門扉工事',
        name: 'カーポート',
        unit: '式',
        unitPrice: 450000,
        quantity: 1,
        subtotal: 450000,
      },
    ],
  },
];

interface QuoteItem {
  id: string;
  category: string;
  name: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export default function QuotePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const customerName = searchParams.get('name');

  const project = projectId ? mockProjects.find((p) => p.id === projectId) : null;

  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: project?.customerName || customerName || '',
    address: project?.address || '',
    projectName: project?.name || '',
  });
  const [quoteInfo, setQuoteInfo] = useState({
    quoteNumber: `Q-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-001`,
    issueDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentTerms: '契約時30%、中間時40%、完成時30%',
    deliveryDate: '契約後6ヶ月',
  });

  // テンプレート選択時の処理
  const handleTemplateSelect = (templateId: string) => {
    const template = quoteTemplates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setQuoteItems(
        template.items.map((item, index) => ({
          ...item,
          id: `item-${index}`,
        })),
      );
    }
  };

  // 見積項目の追加
  const handleAddItem = () => {
    const newItem: QuoteItem = {
      id: `item-${Date.now()}`,
      category: '',
      name: '',
      unit: '',
      unitPrice: 0,
      quantity: 0,
      subtotal: 0,
    };
    setQuoteItems([...quoteItems, newItem]);
  };

  // 見積項目の更新
  const handleUpdateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setQuoteItems(
      quoteItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'unitPrice' || field === 'quantity') {
            updatedItem.subtotal = updatedItem.unitPrice * updatedItem.quantity;
          }
          return updatedItem;
        }
        return item;
      }),
    );
  };

  // 見積項目の削除
  const handleDeleteItem = (id: string) => {
    setQuoteItems(quoteItems.filter((item) => item.id !== id));
  };

  // 合計金額の計算
  const calculateTotal = () => {
    return quoteItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const total = calculateTotal();
  const tax = Math.floor(total * 0.1);
  const grandTotal = total + tax;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">見積書作成</h1>
        <p className="text-gray-600">テンプレートを使用して素早く見積書を作成できます</p>
      </div>

      {/* テンプレート選択 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          テンプレート選択
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quoteTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template.id)}
              className={`p-4 border rounded-lg text-left hover:border-blue-500 transition-colors ${
                selectedTemplate === template.id ? 'border-blue-500 bg-blue-50' : ''
              }`}
            >
              <h3 className="font-medium mb-1">{template.name}</h3>
              <p className="text-sm text-gray-600">{template.items.length}項目</p>
            </button>
          ))}
        </div>
      </div>

      {/* 顧客情報 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">顧客情報</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">顧客名</label>
            <input
              type="text"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="山田太郎様"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">工事名称</label>
            <input
              type="text"
              value={customerInfo.projectName}
              onChange={(e) => setCustomerInfo({ ...customerInfo, projectName: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="〇〇様邸新築工事"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">工事場所</label>
            <input
              type="text"
              value={customerInfo.address}
              onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="東京都渋谷区..."
            />
          </div>
        </div>
      </div>

      {/* 見積情報 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">見積情報</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">見積番号</label>
            <input
              type="text"
              value={quoteInfo.quoteNumber}
              onChange={(e) => setQuoteInfo({ ...quoteInfo, quoteNumber: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">発行日</label>
            <input
              type="date"
              value={quoteInfo.issueDate}
              onChange={(e) => setQuoteInfo({ ...quoteInfo, issueDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">有効期限</label>
            <input
              type="date"
              value={quoteInfo.validUntil}
              onChange={(e) => setQuoteInfo({ ...quoteInfo, validUntil: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">納期</label>
            <input
              type="text"
              value={quoteInfo.deliveryDate}
              onChange={(e) => setQuoteInfo({ ...quoteInfo, deliveryDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2 lg:col-span-4">
            <label className="block text-sm font-medium mb-1">支払条件</label>
            <input
              type="text"
              value={quoteInfo.paymentTerms}
              onChange={(e) => setQuoteInfo({ ...quoteInfo, paymentTerms: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 見積明細 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            見積明細
          </h2>
          <button
            onClick={handleAddItem}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            項目追加
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  工事区分
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  品名・仕様
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  単位
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  数量
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  単価
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  金額
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {quoteItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-3">
                    <input
                      type="text"
                      value={item.category}
                      onChange={(e) => handleUpdateItem(item.id, 'category', e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="工事区分"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="品名・仕様"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => handleUpdateItem(item.id, 'unit', e.target.value)}
                      className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="単位"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateItem(item.id, 'quantity', Number(e.target.value))
                      }
                      className="w-24 px-2 py-1 border rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleUpdateItem(item.id, 'unitPrice', Number(e.target.value))
                      }
                      className="w-32 px-2 py-1 border rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-3 py-3 text-right font-medium">
                    ¥{item.subtotal.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={5} className="px-3 py-3 text-right font-medium">
                  小計
                </td>
                <td className="px-3 py-3 text-right font-medium">¥{total.toLocaleString()}</td>
                <td></td>
              </tr>
              <tr>
                <td colSpan={5} className="px-3 py-3 text-right font-medium">
                  消費税（10%）
                </td>
                <td className="px-3 py-3 text-right font-medium">¥{tax.toLocaleString()}</td>
                <td></td>
              </tr>
              <tr className="text-lg">
                <td colSpan={5} className="px-3 py-3 text-right font-bold">
                  合計金額
                </td>
                <td className="px-3 py-3 text-right font-bold text-blue-600">
                  ¥{grandTotal.toLocaleString()}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex justify-end gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          キャンセル
        </button>
        <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2">
          <Copy className="w-4 h-4" />
          複製
        </button>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
          <Save className="w-4 h-4" />
          保存
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Download className="w-4 h-4" />
          PDF出力
        </button>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
          <Send className="w-4 h-4" />
          メール送信
        </button>
      </div>
    </div>
  );
}
