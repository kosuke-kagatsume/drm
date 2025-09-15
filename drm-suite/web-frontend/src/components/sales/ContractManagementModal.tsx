'use client';

import { useState } from 'react';
import {
  X,
  FileText,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Download,
  Send,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Contract {
  id: string;
  customerName: string;
  projectName: string;
  amount: number;
  status: '下書き' | '送信済み' | '署名待ち' | '締結済み' | '無効';
  createdDate: string;
  signedDate?: string;
  expiryDate: string;
  documents: {
    name: string;
    type: string;
    size: string;
  }[];
}

interface ContractManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContractManagementModal({
  isOpen,
  onClose,
}: ContractManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'draft'>(
    'active',
  );
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null,
  );

  const contracts: Contract[] = [
    {
      id: 'CNT-001',
      customerName: '田中建設株式会社',
      projectName: '新築住宅建設工事',
      amount: 28000000,
      status: '署名待ち',
      createdDate: '2025-01-10',
      expiryDate: '2025-01-20',
      documents: [
        { name: '工事請負契約書.pdf', type: 'PDF', size: '2.5MB' },
        { name: '見積書.pdf', type: 'PDF', size: '1.8MB' },
        { name: '設計図面.pdf', type: 'PDF', size: '5.2MB' },
      ],
    },
    {
      id: 'CNT-002',
      customerName: '山田工務店',
      projectName: 'リフォーム工事',
      amount: 5000000,
      status: '締結済み',
      createdDate: '2025-01-05',
      signedDate: '2025-01-08',
      expiryDate: '2025-12-31',
      documents: [
        { name: '工事請負契約書.pdf', type: 'PDF', size: '2.1MB' },
        { name: '見積書.pdf', type: 'PDF', size: '1.2MB' },
      ],
    },
    {
      id: 'CNT-003',
      customerName: '佐藤商事',
      projectName: '店舗改装工事',
      amount: 15000000,
      status: '下書き',
      createdDate: '2025-01-12',
      expiryDate: '2025-01-25',
      documents: [
        { name: '工事請負契約書_draft.pdf', type: 'PDF', size: '1.9MB' },
      ],
    },
  ];

  const getStatusColor = (status: Contract['status']) => {
    switch (status) {
      case '締結済み':
        return 'bg-green-100 text-green-800';
      case '署名待ち':
        return 'bg-yellow-100 text-yellow-800';
      case '送信済み':
        return 'bg-blue-100 text-blue-800';
      case '下書き':
        return 'bg-gray-100 text-gray-800';
      case '無効':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Contract['status']) => {
    switch (status) {
      case '締結済み':
        return <CheckCircle className="w-5 h-5" />;
      case '署名待ち':
        return <Clock className="w-5 h-5" />;
      case '送信済み':
        return <Send className="w-5 h-5" />;
      case '下書き':
        return <FileText className="w-5 h-5" />;
      case '無効':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const filteredContracts = contracts.filter((contract) => {
    if (activeTab === 'active') {
      return ['署名待ち', '送信済み'].includes(contract.status);
    } else if (activeTab === 'completed') {
      return contract.status === '締結済み';
    } else {
      return contract.status === '下書き';
    }
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">契約管理</h2>
              <div className="flex items-center gap-4">
                <button className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  新規契約作成
                </button>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex h-[calc(90vh-80px)]">
              {/* サイドバー */}
              <div className="w-80 bg-gray-50 border-r border-gray-200 p-4">
                {/* タブ */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setActiveTab('active')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'active'
                        ? 'bg-white text-purple-600 shadow'
                        : 'text-gray-600 hover:bg-white'
                    }`}
                  >
                    進行中
                  </button>
                  <button
                    onClick={() => setActiveTab('completed')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'completed'
                        ? 'bg-white text-purple-600 shadow'
                        : 'text-gray-600 hover:bg-white'
                    }`}
                  >
                    締結済み
                  </button>
                  <button
                    onClick={() => setActiveTab('draft')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'draft'
                        ? 'bg-white text-purple-600 shadow'
                        : 'text-gray-600 hover:bg-white'
                    }`}
                  >
                    下書き
                  </button>
                </div>

                {/* 契約リスト */}
                <div className="space-y-2 overflow-y-auto max-h-[calc(90vh-200px)]">
                  {filteredContracts.map((contract) => (
                    <div
                      key={contract.id}
                      onClick={() => setSelectedContract(contract)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedContract?.id === contract.id
                          ? 'bg-purple-100 border-purple-300'
                          : 'bg-white hover:bg-gray-100'
                      } border`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            {contract.id}
                          </p>
                          <p className="text-sm text-gray-600">
                            {contract.customerName}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            contract.status,
                          )}`}
                        >
                          {getStatusIcon(contract.status)}
                          {contract.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">
                        {contract.projectName}
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        ¥{contract.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 詳細表示エリア */}
              <div className="flex-1 p-6 overflow-y-auto">
                {selectedContract ? (
                  <div>
                    {/* 契約詳細ヘッダー */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {selectedContract.id}
                        </h3>
                        <div className="flex items-center gap-2">
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            送信
                          </button>
                          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            ダウンロード
                          </button>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          selectedContract.status,
                        )}`}
                      >
                        {getStatusIcon(selectedContract.status)}
                        {selectedContract.status}
                      </span>
                    </div>

                    {/* 契約情報 */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">
                        契約情報
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">顧客名</p>
                          <p className="font-medium text-gray-900">
                            {selectedContract.customerName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            プロジェクト名
                          </p>
                          <p className="font-medium text-gray-900">
                            {selectedContract.projectName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            <DollarSign className="inline w-4 h-4 mr-1" />
                            契約金額
                          </p>
                          <p className="font-bold text-2xl text-gray-900">
                            ¥{selectedContract.amount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            <Calendar className="inline w-4 h-4 mr-1" />
                            有効期限
                          </p>
                          <p className="font-medium text-gray-900">
                            {selectedContract.expiryDate}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">作成日</p>
                          <p className="font-medium text-gray-900">
                            {selectedContract.createdDate}
                          </p>
                        </div>
                        {selectedContract.signedDate && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              署名日
                            </p>
                            <p className="font-medium text-gray-900">
                              {selectedContract.signedDate}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 添付書類 */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">
                        添付書類
                      </h4>
                      <div className="space-y-2">
                        {selectedContract.documents.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-gray-600" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {doc.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {doc.type} • {doc.size}
                                </p>
                              </div>
                            </div>
                            <button className="text-blue-600 hover:text-blue-800">
                              <Download className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">
                        契約を選択して詳細を表示
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}