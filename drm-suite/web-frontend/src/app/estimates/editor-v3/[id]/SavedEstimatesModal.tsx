'use client';

import { useState, useMemo } from 'react';
import { X, Search, Filter, Download, Copy, Trash2, Clock, User, Building } from 'lucide-react';

interface SavedEstimate {
  id: string;
  title: string;
  customerName: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
  status: '下書き' | '提出済み' | '交渉中' | '受注' | '失注';
  tags: string[];
}

interface SavedEstimatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (estimate: SavedEstimate) => void;
}

export default function SavedEstimatesModal({ isOpen, onClose, onLoad }: SavedEstimatesModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'customer'>('date');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // サンプルデータ（10個の多様な顧客データ）
  const savedEstimates: SavedEstimate[] = [
    {
      id: 'EST-001',
      title: '山田工務店 リフォーム見積書',
      customerName: '山田工務店',
      amount: 5800000,
      createdAt: '2025-09-25',
      updatedAt: '2025-09-26',
      status: '交渉中',
      tags: ['キッチン', 'リフォーム', '緊急']
    },
    {
      id: 'EST-002',
      title: '株式会社田中建設 新築工事見積',
      customerName: '株式会社田中建設',
      amount: 12500000,
      createdAt: '2025-09-20',
      updatedAt: '2025-09-24',
      status: '提出済み',
      tags: ['新築', '住宅', 'VIP顧客']
    },
    {
      id: 'EST-003',
      title: '佐藤商事 倉庫改修工事',
      customerName: '佐藤商事株式会社',
      amount: 3200000,
      createdAt: '2025-09-15',
      updatedAt: '2025-09-18',
      status: '受注',
      tags: ['改修', '倉庫', '法人']
    },
    {
      id: 'EST-004',
      title: '鈴木邸 外壁塗装工事見積',
      customerName: '鈴木太郎',
      amount: 980000,
      createdAt: '2025-09-10',
      updatedAt: '2025-09-11',
      status: '失注',
      tags: ['塗装', '外壁', '個人']
    },
    {
      id: 'EST-005',
      title: 'グリーンホーム マンション共用部改修',
      customerName: 'グリーンホーム管理組合',
      amount: 8900000,
      createdAt: '2025-09-08',
      updatedAt: '2025-09-22',
      status: '交渉中',
      tags: ['マンション', '共用部', '大規模']
    },
    {
      id: 'EST-006',
      title: '中村産業 工場設備更新見積',
      customerName: '中村産業株式会社',
      amount: 45000000,
      createdAt: '2025-09-05',
      updatedAt: '2025-09-07',
      status: '下書き',
      tags: ['工場', '設備', '特殊工事']
    },
    {
      id: 'EST-007',
      title: '小林クリニック 内装リノベーション',
      customerName: '医療法人小林クリニック',
      amount: 6700000,
      createdAt: '2025-08-30',
      updatedAt: '2025-09-01',
      status: '受注',
      tags: ['医療施設', 'リノベ', 'クリーン']
    },
    {
      id: 'EST-008',
      title: '高橋不動産 オフィスビル外装工事',
      customerName: '高橋不動産開発',
      amount: 23000000,
      createdAt: '2025-08-25',
      updatedAt: '2025-08-28',
      status: '提出済み',
      tags: ['オフィス', '外装', '高層']
    },
    {
      id: 'EST-009',
      title: '渡辺邸 バリアフリー改修見積',
      customerName: '渡辺花子',
      amount: 2100000,
      createdAt: '2025-08-20',
      updatedAt: '2025-08-21',
      status: '受注',
      tags: ['バリアフリー', '介護', '補助金']
    },
    {
      id: 'EST-010',
      title: '伊藤物流センター 耐震補強工事',
      customerName: '伊藤物流株式会社',
      amount: 15600000,
      createdAt: '2025-08-15',
      updatedAt: '2025-08-20',
      status: '交渉中',
      tags: ['耐震', '物流', '安全対策']
    }
  ];

  // フィルタリングとソート
  const filteredEstimates = useMemo(() => {
    let filtered = savedEstimates;

    // ステータスフィルタ
    if (filterStatus !== 'all') {
      filtered = filtered.filter(e => e.status === filterStatus);
    }

    // 検索フィルタ
    if (searchTerm) {
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // ソート
    switch (sortBy) {
      case 'date':
        return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      case 'amount':
        return filtered.sort((a, b) => b.amount - a.amount);
      case 'customer':
        return filtered.sort((a, b) => a.customerName.localeCompare(b.customerName));
      default:
        return filtered;
    }
  }, [searchTerm, sortBy, filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case '下書き': return 'bg-gray-100 text-gray-700';
      case '提出済み': return 'bg-blue-100 text-blue-700';
      case '交渉中': return 'bg-yellow-100 text-yellow-700';
      case '受注': return 'bg-green-100 text-green-700';
      case '失注': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[90%] max-w-6xl h-[80vh] flex flex-col">
        {/* ヘッダー */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">保存済み見積書</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 検索・フィルター */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="見積書名、顧客名、タグで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべてのステータス</option>
              <option value="下書き">下書き</option>
              <option value="提出済み">提出済み</option>
              <option value="交渉中">交渉中</option>
              <option value="受注">受注</option>
              <option value="失注">失注</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">更新日順</option>
              <option value="amount">金額順</option>
              <option value="customer">顧客名順</option>
            </select>
          </div>
        </div>

        {/* リスト */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-4">
            {filteredEstimates.map((estimate) => (
              <div
                key={estimate.id}
                className="bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onLoad(estimate)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{estimate.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(estimate.status)}`}>
                        {estimate.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {estimate.customerName}
                      </span>
                      <span className="font-semibold text-gray-800">
                        ¥{estimate.amount.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        更新: {new Date(estimate.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {estimate.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(estimate.id);
                        alert(`見積書ID ${estimate.id} をコピーしました`);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="複製"
                    >
                      <Copy className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`見積書「${estimate.title}」を削除しますか？`)) {
                          alert('削除機能は実装予定です');
                        }
                      }}
                      className="p-2 hover:bg-red-50 rounded-lg"
                      title="削除"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEstimates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">該当する見積書が見つかりません</p>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredEstimates.length}件の見積書が見つかりました
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}