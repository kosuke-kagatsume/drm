'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChevronLeft,
  Save,
  FileText,
  AlertTriangle,
  Building2,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
} from 'lucide-react';

function OrderCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<any>(null);
  const [partners, setPartners] = useState<any[]>([]);
  const [orderData, setOrderData] = useState<any>({
    workItems: [
      {
        id: 'WI-1',
        category: '',
        name: '',
        quantity: 1,
        unit: '式',
        unitPrice: 0,
        amount: 0,
        notes: '',
        partnerId: '', // 各項目ごとに協力会社を選択
        partnerName: '',
      },
    ],
    orderDate: new Date().toISOString().split('T')[0],
    startDate: '',
    endDate: '',
    paymentTerms: '月末締め翌月末払い',
    notes: '',
  });

  const contractId = searchParams.get('contractId');

  useEffect(() => {
    if (contractId) {
      loadData();
    }
  }, [contractId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // 契約データを取得
      const contractResponse = await fetch(`/api/contracts?id=${contractId}`);
      if (!contractResponse.ok) throw new Error('Failed to fetch contract');
      const contractData = await contractResponse.json();
      setContract(contractData.contract);

      // 協力会社一覧を取得
      const partnersResponse = await fetch('/api/admin/partners?status=active');
      if (!partnersResponse.ok) throw new Error('Failed to fetch partners');
      const partnersData = await partnersResponse.json();
      setPartners(partnersData.partners || []);

      // 契約の見積項目から工事項目を自動生成
      const workItems = contractData.contract.estimateItems?.map((item: any, index: number) => ({
        id: `WI-${index + 1}`,
        category: item.category,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        amount: item.amount,
        notes: item.notes || '',
        partnerId: '', // 各項目ごとに協力会社を選択
        partnerName: '',
      })) || [];

      // 初期値設定
      setOrderData((prev: any) => ({
        ...prev,
        startDate: contractData.contract.startDate,
        endDate: contractData.contract.endDate,
        workItems: workItems.length > 0 ? workItems : prev.workItems,
      }));
    } catch (error) {
      console.error('Error loading data:', error);
      alert('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 業種に応じた協力会社を取得
  const getPartnersForCategory = (category: string) => {
    return partners.filter((partner) => {
      // specialtiesに業種が含まれているか、カテゴリ名が一致する協力会社を表示
      return (
        partner.specialties?.some((s: string) =>
          category.includes(s) || s.includes(category)
        ) ||
        partner.category === category ||
        partner.specialties?.length === 0 // 専門分野が設定されていない場合も表示
      );
    });
  };

  const handleWorkItemPartnerChange = (index: number, partnerId: string) => {
    const selectedPartner = partners.find((p) => p.id === partnerId);
    if (selectedPartner) {
      setOrderData((prev: any) => {
        const updatedItems = [...prev.workItems];
        updatedItems[index] = {
          ...updatedItems[index],
          partnerId: selectedPartner.id,
          partnerName: selectedPartner.name,
        };
        return {
          ...prev,
          workItems: updatedItems,
        };
      });
    }
  };

  // 工事分類ごとにグループ化
  const getCategoryGroups = () => {
    return orderData.workItems.reduce((acc: any, item: any) => {
      const category = item.category || '未分類';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
  };

  // 工事分類ごとに一括で協力会社を設定
  const handleBulkAssignByCategory = (category: string, partnerId: string) => {
    const selectedPartner = partners.find((p) => p.id === partnerId);
    if (!selectedPartner) return;

    setOrderData((prev: any) => {
      const updatedItems = prev.workItems.map((item: any) => {
        if (item.category === category) {
          return {
            ...item,
            partnerId: selectedPartner.id,
            partnerName: selectedPartner.name,
          };
        }
        return item;
      });
      return {
        ...prev,
        workItems: updatedItems,
      };
    });
  };

  // 全工事分類に対して最適な協力会社を自動提案
  const handleAutoAssignPartners = () => {
    setOrderData((prev: any) => {
      const categoryPartnerMap: any = {};

      // 工事分類ごとに最も評価の高い協力会社を選定
      const updatedItems = prev.workItems.map((item: any) => {
        const category = item.category;

        // この工事分類に既に協力会社が割り当てられている場合は同じ会社を使用
        if (categoryPartnerMap[category]) {
          return {
            ...item,
            partnerId: categoryPartnerMap[category].id,
            partnerName: categoryPartnerMap[category].name,
          };
        }

        // 新しい工事分類の場合、最適な協力会社を選定
        const suitablePartners = getPartnersForCategory(category);
        if (suitablePartners.length > 0) {
          // 評価が最も高い協力会社を選択
          const bestPartner = suitablePartners.sort((a: any, b: any) => b.rating - a.rating)[0];
          categoryPartnerMap[category] = bestPartner;

          return {
            ...item,
            partnerId: bestPartner.id,
            partnerName: bestPartner.name,
          };
        }

        return item;
      });

      return {
        ...prev,
        workItems: updatedItems,
      };
    });

    alert('工事分類ごとに最適な協力会社を自動提案しました');
  };

  const handleAddWorkItem = () => {
    setOrderData((prev: any) => ({
      ...prev,
      workItems: [
        ...prev.workItems,
        {
          id: `WI-${prev.workItems.length + 1}`,
          category: '',
          name: '',
          quantity: 1,
          unit: '式',
          unitPrice: 0,
          amount: 0,
          notes: '',
          partnerId: '',
          partnerName: '',
        },
      ],
    }));
  };

  const handleRemoveWorkItem = (index: number) => {
    setOrderData((prev: any) => ({
      ...prev,
      workItems: prev.workItems.filter((_: any, i: number) => i !== index),
    }));
  };

  const handleWorkItemChange = (index: number, field: string, value: any) => {
    setOrderData((prev: any) => {
      const updatedItems = [...prev.workItems];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };

      // 金額自動計算
      if (field === 'quantity' || field === 'unitPrice') {
        updatedItems[index].amount =
          updatedItems[index].quantity * updatedItems[index].unitPrice;
      }

      return {
        ...prev,
        workItems: updatedItems,
      };
    });
  };

  const calculateTotals = () => {
    const subtotal = orderData.workItems.reduce(
      (sum: number, item: any) => sum + item.amount,
      0
    );
    const taxAmount = Math.floor(subtotal * 0.1);
    const totalAmount = subtotal + taxAmount;
    return { subtotal, taxAmount, totalAmount };
  };

  const calculateDeadline = () => {
    if (!contract?.signedAt) return null;
    const signedDate = new Date(contract.signedAt);
    const deadline = new Date(signedDate);
    deadline.setDate(deadline.getDate() + 7);
    return deadline;
  };

  const calculateDaysUntilDeadline = () => {
    const deadline = calculateDeadline();
    if (!deadline) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    const diff = deadline.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleSave = async () => {
    try {
      // 全ての工事項目に協力会社が選択されているかチェック
      const unassignedItems = orderData.workItems.filter((item: any) => !item.partnerId);
      if (unassignedItems.length > 0) {
        alert(`${unassignedItems.length}件の工事項目に協力会社が選択されていません。\n全ての項目に協力会社を選択してください。`);
        return;
      }

      if (orderData.workItems.length === 0) {
        alert('工事項目を追加してください');
        return;
      }

      setSaving(true);

      // 協力会社ごとにグループ化
      const groupedByPartner = orderData.workItems.reduce((acc: any, item: any) => {
        const partnerId = item.partnerId;
        if (!acc[partnerId]) {
          acc[partnerId] = {
            partnerId,
            partnerName: item.partnerName,
            items: [],
          };
        }
        acc[partnerId].items.push(item);
        return acc;
      }, {});

      // 各協力会社ごとに発注書を作成
      const createdOrders = [];
      for (const [partnerId, group] of Object.entries(groupedByPartner)) {
        const groupData: any = group;
        const subtotal = groupData.items.reduce((sum: number, item: any) => sum + item.amount, 0);
        const taxAmount = Math.floor(subtotal * 0.1);
        const totalAmount = subtotal + taxAmount;
        const duration = Math.ceil(
          (new Date(orderData.endDate).getTime() -
            new Date(orderData.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        const orderPayload = {
          contractId: contract.id,
          contractNo: contract.contractNo,
          projectName: contract.projectName,
          contractSignedDate: contract.signedAt?.split('T')[0] || contract.contractDate,
          partnerId: groupData.partnerId,
          partnerName: groupData.partnerName,
          partnerCompany: groupData.partnerName,
          workItems: groupData.items,
          orderDate: orderData.orderDate,
          startDate: orderData.startDate,
          endDate: orderData.endDate,
          paymentTerms: orderData.paymentTerms,
          notes: orderData.notes,
          subtotal,
          taxAmount,
          totalAmount,
          duration,
          status: 'draft',
          manager: user?.name || '未割当',
          managerId: user?.id,
          createdBy: user?.name || 'システム',
        };

        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload),
        });

        if (!response.ok) throw new Error('Failed to create order');
        const result = await response.json();
        createdOrders.push(result.order);
      }

      alert(`${createdOrders.length}社に対して発注書を作成しました`);
      router.push('/orders');
    } catch (error) {
      console.error('Error saving orders:', error);
      alert('発注書の作成に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">契約データが見つかりません</p>
          <button
            onClick={() => router.push('/contracts')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            契約一覧へ戻る
          </button>
        </div>
      </div>
    );
  }

  const { subtotal, taxAmount, totalAmount } = calculateTotals();
  const daysUntilDeadline = calculateDaysUntilDeadline();
  const deadline = calculateDeadline();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/contracts/${contractId}`)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-500" />
                  発注書作成
                </h1>
                <p className="text-sm text-gray-600 mt-1">{contract.projectName}</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? '保存中...' : '発注書を保存'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 7日期限アラート */}
        {daysUntilDeadline !== null && (
          <div
            className={`rounded-lg p-4 mb-6 ${
              daysUntilDeadline <= 0
                ? 'bg-red-50 border border-red-200'
                : daysUntilDeadline <= 3
                ? 'bg-yellow-50 border border-yellow-200'
                : 'bg-blue-50 border border-blue-200'
            }`}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle
                className={`h-5 w-5 mt-0.5 ${
                  daysUntilDeadline <= 0
                    ? 'text-red-600'
                    : daysUntilDeadline <= 3
                    ? 'text-yellow-600'
                    : 'text-blue-600'
                }`}
              />
              <div>
                <p
                  className={`font-medium ${
                    daysUntilDeadline <= 0
                      ? 'text-red-900'
                      : daysUntilDeadline <= 3
                      ? 'text-yellow-900'
                      : 'text-blue-900'
                  }`}
                >
                  {daysUntilDeadline <= 0
                    ? '発注期限超過！'
                    : daysUntilDeadline <= 3
                    ? '発注期限まであとわずか'
                    : '発注期限管理'}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    daysUntilDeadline <= 0
                      ? 'text-red-700'
                      : daysUntilDeadline <= 3
                      ? 'text-yellow-700'
                      : 'text-blue-700'
                  }`}
                >
                  契約締結日から7日以内に発注が必要です。
                  {deadline && (
                    <>
                      {' '}
                      期限: {deadline.toLocaleDateString('ja-JP')} (
                      {daysUntilDeadline > 0 ? `あと${daysUntilDeadline}日` : '期限超過'})
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 契約情報 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">契約情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">契約番号</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {contract.contractNo}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">顧客名</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {contract.customerName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">契約金額</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                ¥{contract.totalAmount?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* 発注日 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">発注日</h2>
          <div className="max-w-md">
            <input
              type="date"
              value={orderData.orderDate}
              onChange={(e) =>
                setOrderData({ ...orderData, orderDate: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 工事項目 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">工事項目</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAutoAssignPartners}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Building2 className="h-4 w-4" />
                協力会社を一括提案
              </button>
              <button
                onClick={handleAddWorkItem}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                項目追加
              </button>
            </div>
          </div>

          {/* 工事分類ごとのサマリー */}
          {Object.keys(getCategoryGroups()).length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 mb-3">工事分類別サマリー</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(getCategoryGroups()).map(([category, items]: [string, any]) => {
                  const assignedPartners = new Set(items.map((item: any) => item.partnerId).filter(Boolean));
                  return (
                    <div key={category} className="bg-white p-3 rounded border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{category}</p>
                          <p className="text-xs text-gray-600">{items.length}項目</p>
                        </div>
                        {assignedPartners.size > 0 && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {assignedPartners.size}社
                          </span>
                        )}
                      </div>
                      <select
                        value={items[0]?.partnerId || ''}
                        onChange={(e) => handleBulkAssignByCategory(category, e.target.value)}
                        className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">一括選択...</option>
                        {getPartnersForCategory(category).map((partner: any) => (
                          <option key={partner.id} value={partner.id}>
                            {partner.name} (★{partner.rating})
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {orderData.workItems.map((item: any, index: number) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-medium text-gray-900">項目 {index + 1}</h3>
                  {orderData.workItems.length > 1 && (
                    <button
                      onClick={() => handleRemoveWorkItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      工事分類
                    </label>
                    <input
                      type="text"
                      value={item.category}
                      onChange={(e) =>
                        handleWorkItemChange(index, 'category', e.target.value)
                      }
                      placeholder="例: 基礎工事"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      工事名
                    </label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleWorkItemChange(index, 'name', e.target.value)}
                      placeholder="例: べた基礎工事一式"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      数量
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleWorkItemChange(index, 'quantity', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      単位
                    </label>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => handleWorkItemChange(index, 'unit', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      単価
                    </label>
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleWorkItemChange(index, 'unitPrice', parseInt(e.target.value) || 0)
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      金額
                    </label>
                    <input
                      type="text"
                      value={`¥${item.amount.toLocaleString()}`}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      備考
                    </label>
                    <input
                      type="text"
                      value={item.notes || ''}
                      onChange={(e) => handleWorkItemChange(index, 'notes', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      発注先協力会社 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={item.partnerId || ''}
                      onChange={(e) => handleWorkItemPartnerChange(index, e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        item.partnerId
                          ? 'border-green-300 bg-green-50'
                          : 'border-red-300 bg-red-50'
                      }`}
                      required
                    >
                      <option value="">協力会社を選択してください</option>
                      {getPartnersForCategory(item.category).map((partner: any) => (
                        <option key={partner.id} value={partner.id}>
                          {partner.name} - {partner.category} (評価: {'★'.repeat(partner.rating)})
                          {partner.specialties && partner.specialties.length > 0 &&
                            ` | 専門: ${partner.specialties.join(', ')}`}
                        </option>
                      ))}
                      {getPartnersForCategory(item.category).length === 0 && (
                        <option disabled>この業種に対応する協力会社が登録されていません</option>
                      )}
                    </select>
                    {item.partnerId && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ {item.partnerName} に発注予定
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 合計金額 */}
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-end">
              <div className="w-full md:w-1/3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">小計</span>
                  <span className="font-medium">¥{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">消費税（10%）</span>
                  <span className="font-medium">¥{taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>合計金額</span>
                  <span className="text-blue-600">¥{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 工期・支払条件 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            工期・支払条件
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                着工日
              </label>
              <input
                type="date"
                value={orderData.startDate}
                onChange={(e) =>
                  setOrderData({ ...orderData, startDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                完了予定日
              </label>
              <input
                type="date"
                value={orderData.endDate}
                onChange={(e) =>
                  setOrderData({ ...orderData, endDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                支払条件
              </label>
              <input
                type="text"
                value={orderData.paymentTerms}
                onChange={(e) =>
                  setOrderData({ ...orderData, paymentTerms: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* メモ */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">メモ</h2>
          <textarea
            value={orderData.notes || ''}
            onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="特記事項があれば入力してください"
          />
        </div>
      </div>
    </div>
  );
}

export default function OrderCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <OrderCreateContent />
    </Suspense>
  );
}
