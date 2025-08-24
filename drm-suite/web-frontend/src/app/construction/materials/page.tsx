'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Package,
  Users,
  Truck,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Calendar,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  FileText,
} from 'lucide-react';
import {
  dwIntegrationService,
  DWOrder,
  OrderDetail,
} from '@/services/dw-integration.service';
import {
  constructionLedgerService,
  ConstructionLedger,
} from '@/services/construction-ledger.service';

interface MaterialUsage {
  id: string;
  contractId: string;
  projectName: string;
  date: string;
  category: '材料' | '労務' | '外注' | '経費';
  itemName: string;
  specification: string;
  unit: string;
  plannedQuantity: number;
  actualQuantity: number;
  unitPrice: number;
  totalAmount: number;
  supplier: string;
  deliveryDate?: string;
  receivedDate?: string;
  status: 'ordered' | 'delivered' | 'used' | 'returned';
  location: string; // 使用場所
  worker?: string; // 使用者
  notes?: string;
  dwOrderId?: string;
  invoiceNumber?: string;
}

interface LaborRecord {
  id: string;
  contractId: string;
  projectName: string;
  date: string;
  workerName: string;
  trade: string; // 職種（大工、左官、電気工事士など）
  workHours: number;
  hourlyRate: number;
  totalAmount: number;
  workDescription: string;
  location: string;
  supervisor: string;
  status: 'planned' | 'worked' | 'approved' | 'paid';
  overtime?: number;
  overtimeRate?: number;
  notes?: string;
}

export default function MaterialsManagementPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('materials'); // materials, labor, summary
  const [materials, setMaterials] = useState<MaterialUsage[]>([]);
  const [laborRecords, setLaborRecords] = useState<LaborRecord[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [projects, setProjects] = useState<ConstructionLedger[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<
    MaterialUsage | LaborRecord | null
  >(null);

  useEffect(() => {
    if (!isLoading && user) {
      loadData();
    }
  }, [user, isLoading]);

  const loadData = async () => {
    setLoading(true);
    try {
      // プロジェクト一覧を取得
      const ledgerData = await constructionLedgerService.getLedgers();
      setProjects(ledgerData);

      // サンプルデータを生成（実際にはAPIから取得）
      generateSampleData(ledgerData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = (ledgerData: ConstructionLedger[]) => {
    const sampleMaterials: MaterialUsage[] = [
      {
        id: 'mat_001',
        contractId: 'contract_1',
        projectName: '山田様邸新築工事',
        date: '2024-08-20',
        category: '材料',
        itemName: 'コンクリート',
        specification: '21-18-20N',
        unit: 'm³',
        plannedQuantity: 15.0,
        actualQuantity: 16.2,
        unitPrice: 12000,
        totalAmount: 194400,
        supplier: '○○生コン',
        deliveryDate: '2024-08-20',
        receivedDate: '2024-08-20',
        status: 'used',
        location: '基礎工事',
        worker: '田中現場監督',
        notes: '天候により若干使用量増加',
      },
      {
        id: 'mat_002',
        contractId: 'contract_1',
        projectName: '山田様邸新築工事',
        date: '2024-08-21',
        category: '材料',
        itemName: '鉄筋',
        specification: 'SD345 D13',
        unit: 'kg',
        plannedQuantity: 500,
        actualQuantity: 480,
        unitPrice: 85,
        totalAmount: 40800,
        supplier: '△△鋼材',
        deliveryDate: '2024-08-21',
        receivedDate: '2024-08-21',
        status: 'used',
        location: '基礎配筋',
        worker: '佐藤鉄筋工',
      },
      {
        id: 'mat_003',
        contractId: 'contract_2',
        projectName: '鈴木様邸リフォーム',
        date: '2024-08-22',
        category: '材料',
        itemName: 'システムキッチン',
        specification: 'LIXIL シエラ I型2550mm',
        unit: '式',
        plannedQuantity: 1,
        actualQuantity: 1,
        unitPrice: 450000,
        totalAmount: 450000,
        supplier: 'リクシル',
        status: 'ordered',
        location: '1F キッチン',
        deliveryDate: '2024-08-30',
      },
    ];

    const sampleLabor: LaborRecord[] = [
      {
        id: 'lab_001',
        contractId: 'contract_1',
        projectName: '山田様邸新築工事',
        date: '2024-08-20',
        workerName: '田中 太郎',
        trade: '大工',
        workHours: 8,
        hourlyRate: 2500,
        totalAmount: 20000,
        workDescription: '基礎型枠組立',
        location: '基礎工事',
        supervisor: '田中現場監督',
        status: 'approved',
      },
      {
        id: 'lab_002',
        contractId: 'contract_1',
        projectName: '山田様邸新築工事',
        date: '2024-08-20',
        workerName: '佐藤 次郎',
        trade: '鉄筋工',
        workHours: 7,
        hourlyRate: 2800,
        totalAmount: 19600,
        workDescription: '基礎配筋作業',
        location: '基礎工事',
        supervisor: '田中現場監督',
        status: 'approved',
        overtime: 1,
        overtimeRate: 3500,
      },
      {
        id: 'lab_003',
        contractId: 'contract_2',
        projectName: '鈴木様邸リフォーム',
        date: '2024-08-22',
        workerName: '高橋 三郎',
        trade: '設備工',
        workHours: 6,
        hourlyRate: 3000,
        totalAmount: 18000,
        workDescription: '給排水配管工事',
        location: '1F 水回り',
        supervisor: '田中現場監督',
        status: 'worked',
      },
    ];

    setMaterials(sampleMaterials);
    setLaborRecords(sampleLabor);
  };

  const filteredMaterials = materials.filter((material) => {
    const matchProject =
      selectedProject === 'all' || material.contractId === selectedProject;
    const matchSearch =
      material.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDate =
      (!dateRange.from || material.date >= dateRange.from) &&
      (!dateRange.to || material.date <= dateRange.to);

    return matchProject && matchSearch && matchDate;
  });

  const filteredLaborRecords = laborRecords.filter((record) => {
    const matchProject =
      selectedProject === 'all' || record.contractId === selectedProject;
    const matchSearch =
      record.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.trade.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDate =
      (!dateRange.from || record.date >= dateRange.from) &&
      (!dateRange.to || record.date <= dateRange.to);

    return matchProject && matchSearch && matchDate;
  });

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

  const getStatusBadge = (status: string, type: 'material' | 'labor') => {
    const materialStatusConfig = {
      ordered: { label: '発注済', color: 'bg-blue-100 text-blue-800' },
      delivered: { label: '納品済', color: 'bg-yellow-100 text-yellow-800' },
      used: { label: '使用済', color: 'bg-green-100 text-green-800' },
      returned: { label: '返品', color: 'bg-gray-100 text-gray-800' },
    };

    const laborStatusConfig = {
      planned: { label: '予定', color: 'bg-gray-100 text-gray-800' },
      worked: { label: '作業済', color: 'bg-blue-100 text-blue-800' },
      approved: { label: '承認済', color: 'bg-green-100 text-green-800' },
      paid: { label: '支払済', color: 'bg-purple-100 text-purple-800' },
    };

    const config =
      type === 'material'
        ? materialStatusConfig[status as keyof typeof materialStatusConfig]
        : laborStatusConfig[status as keyof typeof laborStatusConfig];

    if (!config) return null;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getTotalSummary = () => {
    const selectedMaterials =
      selectedProject === 'all'
        ? materials
        : materials.filter((m) => m.contractId === selectedProject);

    const selectedLabor =
      selectedProject === 'all'
        ? laborRecords
        : laborRecords.filter((l) => l.contractId === selectedProject);

    const materialTotal = selectedMaterials.reduce(
      (sum, item) => sum + item.totalAmount,
      0,
    );
    const laborTotal = selectedLabor.reduce(
      (sum, item) => sum + item.totalAmount,
      0,
    );

    return {
      materialTotal,
      laborTotal,
      grandTotal: materialTotal + laborTotal,
      materialCount: selectedMaterials.length,
      laborCount: selectedLabor.length,
    };
  };

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

  const summary = getTotalSummary();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-dandori-blue" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  材料・労務管理
                </h1>
                <p className="text-gray-600 mt-1">材料費・労務費の詳細管理</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-dandori-blue text-white px-4 py-2 rounded-lg hover:bg-dandori-blue-dark flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>新規追加</span>
              </button>
              <button
                onClick={loadData}
                disabled={loading}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                />
                <span>更新</span>
              </button>
            </div>
          </div>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">材料費合計</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.materialTotal)}
                </p>
                <p className="text-xs text-gray-500">
                  {summary.materialCount}件
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">労務費合計</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.laborTotal)}
                </p>
                <p className="text-xs text-gray-500">{summary.laborCount}件</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総合計</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.grandTotal)}
                </p>
                <p className="text-xs text-gray-500">材料+労務</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">今月実績</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.grandTotal * 0.8)}
                </p>
                <p className="text-xs text-gray-500">前月比+12%</p>
              </div>
            </div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                プロジェクト
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="all">全て</option>
                {projects.map((project) => (
                  <option key={project.contractId} value={project.contractId}>
                    {project.projectName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                検索
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="品名、業者名で検索..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                開始日
              </label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) =>
                  setDateRange({ ...dateRange, from: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                終了日
              </label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) =>
                  setDateRange({ ...dateRange, to: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                {
                  id: 'materials',
                  label: '材料管理',
                  icon: Package,
                  count: filteredMaterials.length,
                },
                {
                  id: 'labor',
                  label: '労務管理',
                  icon: Users,
                  count: filteredLaborRecords.length,
                },
                { id: 'summary', label: 'サマリー', icon: FileText },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-dandori-blue text-dandori-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* 材料管理タブ */}
            {activeTab === 'materials' && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          日付
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          プロジェクト
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          品名
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          仕様
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
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          業者
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          ステータス
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredMaterials.map((material) => (
                        <tr key={material.id} className="hover:bg-gray-50">
                          <td className="px-3 py-4 text-sm text-gray-900">
                            {material.date}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900 max-w-32 truncate">
                            {material.projectName}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900">
                            {material.itemName}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-600 max-w-32 truncate">
                            {material.specification}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900 text-right">
                            {material.actualQuantity} {material.unit}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900 text-right">
                            {formatCurrency(material.unitPrice)}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900 text-right font-medium">
                            {formatCurrency(material.totalAmount)}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900">
                            {material.supplier}
                          </td>
                          <td className="px-3 py-4 text-center">
                            {getStatusBadge(material.status, 'material')}
                          </td>
                          <td className="px-3 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => setEditingItem(material)}
                                className="text-dandori-blue hover:text-dandori-blue-dark"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="text-gray-400 hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 労務管理タブ */}
            {activeTab === 'labor' && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          日付
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          プロジェクト
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          作業者
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          職種
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          作業内容
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          時間
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          単価
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          金額
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          ステータス
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredLaborRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-3 py-4 text-sm text-gray-900">
                            {record.date}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900 max-w-32 truncate">
                            {record.projectName}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900">
                            {record.workerName}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900">
                            {record.trade}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-600 max-w-32 truncate">
                            {record.workDescription}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900 text-right">
                            {record.workHours}h
                            {record.overtime && record.overtime > 0 && (
                              <span className="text-red-600">
                                {' '}
                                (+{record.overtime}h)
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900 text-right">
                            {formatCurrency(record.hourlyRate)}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900 text-right font-medium">
                            {formatCurrency(
                              record.totalAmount +
                                (record.overtime || 0) *
                                  (record.overtimeRate || 0),
                            )}
                          </td>
                          <td className="px-3 py-4 text-center">
                            {getStatusBadge(record.status, 'labor')}
                          </td>
                          <td className="px-3 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => setEditingItem(record)}
                                className="text-dandori-blue hover:text-dandori-blue-dark"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="text-gray-400 hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* サマリータブ */}
            {activeTab === 'summary' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 材料費内訳 */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      材料費内訳
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(
                        filteredMaterials.reduce(
                          (acc, item) => {
                            acc[item.category] =
                              (acc[item.category] || 0) + item.totalAmount;
                            return acc;
                          },
                          {} as { [key: string]: number },
                        ),
                      ).map(([category, amount]) => (
                        <div key={category} className="flex justify-between">
                          <span className="text-gray-600">{category}</span>
                          <span className="font-medium">
                            {formatCurrency(amount)}
                          </span>
                        </div>
                      ))}
                      <div className="border-t pt-2 flex justify-between font-bold">
                        <span>材料費計</span>
                        <span>{formatCurrency(summary.materialTotal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* 労務費内訳 */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      労務費内訳
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(
                        filteredLaborRecords.reduce(
                          (acc, item) => {
                            acc[item.trade] =
                              (acc[item.trade] || 0) + item.totalAmount;
                            return acc;
                          },
                          {} as { [key: string]: number },
                        ),
                      ).map(([trade, amount]) => (
                        <div key={trade} className="flex justify-between">
                          <span className="text-gray-600">{trade}</span>
                          <span className="font-medium">
                            {formatCurrency(amount)}
                          </span>
                        </div>
                      ))}
                      <div className="border-t pt-2 flex justify-between font-bold">
                        <span>労務費計</span>
                        <span>{formatCurrency(summary.laborTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 月別推移 */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    月別原価推移
                  </h3>
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>グラフ表示機能は開発中です</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
