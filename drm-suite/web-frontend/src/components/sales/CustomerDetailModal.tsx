'use client';

import { useState } from 'react';
import { X, Phone, Mail, MapPin, Calendar, Edit2, Save, MessageSquare, Clock, Star, TrendingUp, FileText, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  status: 'リード' | '見込み客' | '顧客' | '休眠';
  lastContact: string;
  nextAction: string;
  notes: string;
  value: number;
  priority: number;
  estimateHistory: {
    id: string;
    date: string;
    amount: number;
    status: string;
  }[];
}

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId?: string;
}

export default function CustomerDetailModal({
  isOpen,
  onClose,
  customerId,
}: CustomerDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'actions' | 'projects' | 'memo'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [customer, setCustomer] = useState<Customer>({
    id: customerId || '1',
    name: '田中太郎',
    company: '田中建設株式会社',
    email: 'tanaka@example.com',
    phone: '090-1234-5678',
    address: '東京都渋谷区○○1-2-3',
    status: '見込み客',
    lastContact: '2024/1/15',
    nextAction: '修正見積もりを送付',
    notes: '期限内容',
    value: 8500000,
    priority: 5,
    estimateHistory: [
      {
        id: 'EST-001',
        date: '2025-01-05',
        amount: 28000000,
        status: '提出済み',
      },
      {
        id: 'EST-002',
        date: '2025-01-08',
        amount: 30000000,
        status: '交渉中',
      },
    ],
  });

  const handleSave = () => {
    setIsEditing(false);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      'リード': 'bg-gray-100 text-gray-700',
      '見込み客': 'bg-green-100 text-green-700',
      '顧客': 'bg-blue-100 text-blue-700',
      '休眠': 'bg-red-100 text-red-700',
    };
    return config[status as keyof typeof config] || config['リード'];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-50 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className="bg-white px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ← 戻る
                </button>
                <h2 className="text-xl font-bold">顧客詳細</h2>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  編集
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
              )}
            </div>

            {/* メインコンテンツ */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* 顧客カード */}
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white mb-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-3xl font-bold">
                      田
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold mb-1">{customer.name}</h1>
                      <p className="text-white/90">{customer.company}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(customer.status)}`}>
                          ⭐ {customer.status}
                        </span>
                        <span className="text-sm">顧客価値: ¥{customer.value.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <button className="px-4 py-2 bg-white/20 backdrop-blur text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2">
                      💬 アクション記録
                    </button>
                    <button className="mt-2 px-4 py-2 bg-white/20 backdrop-blur text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2">
                      📝 見積メモ
                    </button>
                  </div>
                </div>
              </div>

              {/* 情報セクション */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* 基本情報 */}
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4">📋 基本情報</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">メール</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={customer.email}
                          onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      ) : (
                        <p className="font-medium">{customer.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">電話番号</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={customer.phone}
                          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      ) : (
                        <p className="font-medium">{customer.phone}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">住所</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={customer.address}
                          onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      ) : (
                        <p className="font-medium">{customer.address}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ステータス */}
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4">📊 ステータス</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">顧客価値</label>
                      <p className="text-2xl font-bold text-green-600">
                        ¥{customer.value.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">登録日</label>
                      <p className="font-medium">2024/1/15</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">担当者</label>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">
                          山
                        </div>
                        <span className="font-medium">山田花子</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 次回アクション */}
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4">🎯 次回アクション</h3>
                  <div className="space-y-3">
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">内容</p>
                      {isEditing ? (
                        <textarea
                          value={customer.nextAction}
                          onChange={(e) => setCustomer({ ...customer, nextAction: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                          rows={2}
                        />
                      ) : (
                        <p className="text-gray-700">{customer.nextAction}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">期限</label>
                      <p className="font-medium text-orange-600">2024/2/15</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">優先度</label>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < customer.priority
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* タブセクション */}
              <div className="bg-white rounded-xl overflow-hidden">
                <div className="flex border-b">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-3 font-medium transition-colors ${
                      activeTab === 'overview'
                        ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    📊 概要
                  </button>
                  <button
                    onClick={() => setActiveTab('actions')}
                    className={`px-6 py-3 font-medium transition-colors ${
                      activeTab === 'actions'
                        ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    📝 アクション履歴
                  </button>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className={`px-6 py-3 font-medium transition-colors ${
                      activeTab === 'projects'
                        ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    🏗️ プロジェクト
                  </button>
                  <button
                    onClick={() => setActiveTab('memo')}
                    className={`px-6 py-3 font-medium transition-colors ${
                      activeTab === 'memo'
                        ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    📝 メモ
                  </button>
                </div>

                <div className="p-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-4">
                      <h4 className="font-bold mb-3">コミュニケーション統計</h4>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <Phone className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                          <p className="text-2xl font-bold">5</p>
                          <p className="text-xs text-gray-600">電話</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <Mail className="w-6 h-6 text-green-600 mx-auto mb-1" />
                          <p className="text-2xl font-bold">12</p>
                          <p className="text-xs text-gray-600">メール</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <MessageSquare className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                          <p className="text-2xl font-bold">2</p>
                          <p className="text-xs text-gray-600">チャット</p>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <FileText className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                          <p className="text-2xl font-bold">8</p>
                          <p className="text-xs text-gray-600">書類</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'projects' && (
                    <div className="space-y-3">
                      {customer.estimateHistory.map((estimate) => (
                        <div
                          key={estimate.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div>
                            <p className="font-medium">{estimate.id}</p>
                            <p className="text-sm text-gray-600">{estimate.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">¥{estimate.amount.toLocaleString()}</p>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              estimate.status === '交渉中'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {estimate.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'memo' && (
                    <div>
                      {isEditing ? (
                        <textarea
                          value={customer.notes}
                          onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                          className="w-full px-4 py-3 border rounded-lg"
                          rows={5}
                          placeholder="メモを入力..."
                        />
                      ) : (
                        <p className="text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}