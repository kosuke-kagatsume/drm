'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface EstimateItem {
  id: string;
  category: string;
  itemName: string;
  specification: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  costPrice: number;
  grossProfit: number;
  profitRate: number;
  vendor?: string;
}

interface Vendor {
  id: string;
  name: string;
  category: string;
  distance: number;
  qualityScore: number;
  priceLevel: 'low' | 'medium' | 'high';
  availability: 'immediate' | 'next_week' | 'busy';
}

export default function CreateEstimatePage() {
  const router = useRouter();
  const [userRole] = useState('veteran'); // veteran/rookie
  const [showRAG, setShowRAG] = useState(false);
  const [ragQuery, setRagQuery] = useState('');
  const [ragResults, setRagResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for login information
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole');
      const email = localStorage.getItem('userEmail');

      if (!role || !email) {
        router.push('/login');
      } else {
        setIsLoading(false);
      }
    }
  }, [router]);

  const [estimateData, setEstimateData] = useState({
    customerName: '',
    projectName: '',
    projectType: 'reform', // new_build/reform/commercial
    buildingType: 'wooden', // wooden/steel/rc
    floors: 2,
    area: 0,
  });

  const [items, setItems] = useState<EstimateItem[]>([
    {
      id: '1',
      category: '外壁工事',
      itemName: '足場設置',
      specification: '枠組足場 W900×H1800',
      quantity: 150,
      unit: '㎡',
      unitPrice: 1200,
      amount: 180000,
      costPrice: 900,
      grossProfit: 45000,
      profitRate: 25,
      vendor: '協力会社A',
    },
    {
      id: '2',
      category: '外壁工事',
      itemName: '外壁塗装',
      specification: 'シリコン塗料 3回塗り',
      quantity: 120,
      unit: '㎡',
      unitPrice: 3500,
      amount: 420000,
      costPrice: 2800,
      grossProfit: 84000,
      profitRate: 20,
      vendor: '協力会社B',
    },
  ]);

  const [vendors] = useState<Vendor[]>([
    {
      id: '1',
      name: '協力会社A',
      category: '足場',
      distance: 5,
      qualityScore: 95,
      priceLevel: 'low',
      availability: 'immediate',
    },
    {
      id: '2',
      name: '協力会社B',
      category: '塗装',
      distance: 8,
      qualityScore: 90,
      priceLevel: 'medium',
      availability: 'next_week',
    },
    {
      id: '3',
      name: '協力会社C',
      category: '足場',
      distance: 15,
      qualityScore: 85,
      priceLevel: 'high',
      availability: 'immediate',
    },
  ]);

  const handleAddItem = () => {
    const newItem: EstimateItem = {
      id: Date.now().toString(),
      category: '',
      itemName: '',
      specification: '',
      quantity: 0,
      unit: '',
      unitPrice: 0,
      amount: 0,
      costPrice: 0,
      grossProfit: 0,
      profitRate: 0,
    };
    setItems([...items, newItem]);
  };

  const handleItemChange = (
    id: string,
    field: keyof EstimateItem,
    value: any,
  ) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          // 金額再計算
          if (
            field === 'quantity' ||
            field === 'unitPrice' ||
            field === 'costPrice'
          ) {
            updated.amount = updated.quantity * updated.unitPrice;
            updated.grossProfit =
              updated.amount - updated.quantity * updated.costPrice;
            updated.profitRate =
              updated.amount > 0
                ? (updated.grossProfit / updated.amount) * 100
                : 0;
          }
          return updated;
        }
        return item;
      }),
    );
  };

  const handleRAGSearch = () => {
    // RAG検索のシミュレーション
    setRagResults([
      {
        id: '1',
        projectName: '田中様邸 外壁リフォーム',
        date: '2023-06-15',
        similarity: 95,
        totalAmount: 1850000,
        profitRate: 22,
        items: [
          { name: '足場設置', amount: 180000 },
          { name: '外壁塗装', amount: 420000 },
        ],
      },
      {
        id: '2',
        projectName: '山田様邸 屋根・外壁工事',
        date: '2023-04-20',
        similarity: 88,
        totalAmount: 2300000,
        profitRate: 25,
      },
    ]);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const totalCost = items.reduce(
    (sum, item) => sum + item.quantity * item.costPrice,
    0,
  );
  const totalProfit = totalAmount - totalCost;
  const avgProfitRate = totalAmount > 0 ? (totalProfit / totalAmount) * 100 : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dandori-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/estimates')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← 見積一覧
            </button>
            <h1 className="text-2xl font-bold text-gray-900">新規見積作成</h1>
          </div>
          <button
            onClick={() => setShowRAG(!showRAG)}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            🤖 RAGアシスタント
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          <div className={showRAG ? 'w-2/3' : 'w-full'}>
            {/* 基本情報 */}
            <div className="bg-white rounded-lg shadow mb-6 p-6">
              <h2 className="text-lg font-semibold mb-4">基本情報</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    顧客名
                  </label>
                  <input
                    type="text"
                    value={estimateData.customerName}
                    onChange={(e) =>
                      setEstimateData({
                        ...estimateData,
                        customerName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    案件名
                  </label>
                  <input
                    type="text"
                    value={estimateData.projectName}
                    onChange={(e) =>
                      setEstimateData({
                        ...estimateData,
                        projectName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    工事種別
                  </label>
                  <select
                    value={estimateData.projectType}
                    onChange={(e) =>
                      setEstimateData({
                        ...estimateData,
                        projectType: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="new_build">新築</option>
                    <option value="reform">リフォーム</option>
                    <option value="commercial">商業内装</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    構造
                  </label>
                  <select
                    value={estimateData.buildingType}
                    onChange={(e) =>
                      setEstimateData({
                        ...estimateData,
                        buildingType: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="wooden">木造</option>
                    <option value="steel">鉄骨造</option>
                    <option value="rc">RC造</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 明細 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">明細</h2>
                <button
                  onClick={handleAddItem}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  + 行追加
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-2 text-left">工事項目</th>
                      <th className="px-2 py-2 text-left">品名</th>
                      <th className="px-2 py-2 text-left">仕様</th>
                      <th className="px-2 py-2 text-right">数量</th>
                      <th className="px-2 py-2 text-left">単位</th>
                      <th className="px-2 py-2 text-right">単価</th>
                      <th className="px-2 py-2 text-right">金額</th>
                      {userRole === 'veteran' && (
                        <>
                          <th className="px-2 py-2 text-right">原価</th>
                          <th className="px-2 py-2 text-right">粗利率</th>
                          <th className="px-2 py-2 text-left">発注先</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="px-2 py-2">
                          <input
                            type="text"
                            value={item.category}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                'category',
                                e.target.value,
                              )
                            }
                            className="w-full px-1 py-1 border rounded"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="text"
                            value={item.itemName}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                'itemName',
                                e.target.value,
                              )
                            }
                            className="w-full px-1 py-1 border rounded"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="text"
                            value={item.specification}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                'specification',
                                e.target.value,
                              )
                            }
                            className="w-full px-1 py-1 border rounded"
                          />
                        </td>
                        <td className="px-2 py-2 text-right">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                'quantity',
                                Number(e.target.value),
                              )
                            }
                            className="w-20 px-1 py-1 border rounded text-right"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) =>
                              handleItemChange(item.id, 'unit', e.target.value)
                            }
                            className="w-16 px-1 py-1 border rounded"
                          />
                        </td>
                        <td className="px-2 py-2 text-right">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                'unitPrice',
                                Number(e.target.value),
                              )
                            }
                            className="w-24 px-1 py-1 border rounded text-right"
                          />
                        </td>
                        <td className="px-2 py-2 text-right font-medium">
                          ¥{item.amount.toLocaleString()}
                        </td>
                        {userRole === 'veteran' && (
                          <>
                            <td className="px-2 py-2 text-right">
                              <input
                                type="number"
                                value={item.costPrice}
                                onChange={(e) =>
                                  handleItemChange(
                                    item.id,
                                    'costPrice',
                                    Number(e.target.value),
                                  )
                                }
                                className="w-20 px-1 py-1 border rounded text-right"
                              />
                            </td>
                            <td className="px-2 py-2 text-right">
                              <span
                                className={
                                  item.profitRate >= 20
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }
                              >
                                {item.profitRate.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-2 py-2">
                              <select
                                value={item.vendor}
                                onChange={(e) =>
                                  handleItemChange(
                                    item.id,
                                    'vendor',
                                    e.target.value,
                                  )
                                }
                                className="w-full px-1 py-1 border rounded text-sm"
                              >
                                <option value="">選択...</option>
                                {vendors.map((v) => (
                                  <option key={v.id} value={v.name}>
                                    {v.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100">
                    <tr>
                      <td
                        colSpan={6}
                        className="px-2 py-3 text-right font-semibold"
                      >
                        合計
                      </td>
                      <td className="px-2 py-3 text-right font-bold text-lg">
                        ¥{totalAmount.toLocaleString()}
                      </td>
                      {userRole === 'veteran' && (
                        <>
                          <td className="px-2 py-3 text-right font-medium">
                            ¥{totalCost.toLocaleString()}
                          </td>
                          <td className="px-2 py-3 text-right font-medium">
                            <span
                              className={
                                avgProfitRate >= 20
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }
                            >
                              {avgProfitRate.toFixed(1)}%
                            </span>
                          </td>
                          <td></td>
                        </>
                      )}
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => router.push('/estimates')}
                  className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                  下書き保存
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  承認申請
                </button>
              </div>
            </div>
          </div>

          {/* RAGサイドパネル */}
          {showRAG && (
            <div className="w-1/3">
              <div className="bg-white rounded-lg shadow p-4 sticky top-4">
                <h3 className="font-semibold mb-3">🤖 RAGアシスタント</h3>

                <div className="mb-4">
                  <input
                    type="text"
                    value={ragQuery}
                    onChange={(e) => setRagQuery(e.target.value)}
                    placeholder="例: 築20年 木造 外壁塗装"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                  <button
                    onClick={handleRAGSearch}
                    className="mt-2 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
                  >
                    類似案件を検索
                  </button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {ragResults.map((result) => (
                    <div
                      key={result.id}
                      className="border rounded p-3 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-sm">
                            {result.projectName}
                          </p>
                          <p className="text-xs text-gray-500">{result.date}</p>
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {result.similarity}% 一致
                        </span>
                      </div>
                      <div className="text-sm">
                        <p>金額: ¥{result.totalAmount.toLocaleString()}</p>
                        <p>粗利率: {result.profitRate}%</p>
                      </div>
                      <button className="mt-2 text-xs text-blue-600 hover:underline">
                        この見積をコピー →
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-yellow-50 rounded text-sm">
                  <p className="font-medium text-yellow-800 mb-1">
                    ⚠️ 抜け漏れチェック
                  </p>
                  <p className="text-xs text-gray-700">
                    外壁塗装には通常「足場費用」が必要です。追加しますか？
                  </p>
                  <button className="mt-2 text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700">
                    自動追加
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
