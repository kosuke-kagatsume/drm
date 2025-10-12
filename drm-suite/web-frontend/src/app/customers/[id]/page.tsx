'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  User, Phone, Mail, MapPin, Building2, Calendar, Tag,
  Users, Home, Activity, FileText, Edit, Trash2,
  ChevronLeft, Plus, MessageSquare, X, Upload, Download, Eye, File,
  Calculator, ScrollText, Hammer
} from 'lucide-react';
import type { Customer, Property, Activity as ActivityType } from '@/types/customer';

type TabType = 'overview' | 'family' | 'properties' | 'activities' | 'documents' | 'estimates' | 'contracts' | 'construction-ledgers';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [editingFamily, setEditingFamily] = useState<any>(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [activityTypeFilter, setActivityTypeFilter] = useState<string | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentCategoryFilter, setDocumentCategoryFilter] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);

  // Phase 10: 見積・契約・工事台帳
  const [estimates, setEstimates] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [constructionLedgers, setConstructionLedgers] = useState<any[]>([]);

  useEffect(() => {
    fetchCustomerData();
  }, [customerId]);

  const fetchCustomerData = async () => {
    try {
      // 顧客基本情報
      const customerRes = await fetch(`/api/customers/${customerId}`);
      const customerData = await customerRes.json();
      if (customerData.success) {
        setCustomer(customerData.data);
      }

      // 物件情報
      const propsRes = await fetch(`/api/customers/${customerId}/properties`);
      const propsData = await propsRes.json();
      if (propsData.success) {
        setProperties(propsData.data);
      }

      // 活動履歴
      const activitiesRes = await fetch(`/api/customers/${customerId}/activities`);
      const activitiesData = await activitiesRes.json();
      if (activitiesData.success) {
        setActivities(activitiesData.data);
      }

      // モック資料データ
      setDocuments([
        {
          id: 'doc-1',
          name: 'A案見積書.pdf',
          category: 'estimate',
          size: 245000,
          uploadedAt: '2025-09-18T16:00:00Z',
          uploadedBy: '営業部 田中',
          propertyId: 'prop-1',
          propertyName: '山田様邸新築工事',
        },
        {
          id: 'doc-2',
          name: '工事請負契約書.pdf',
          category: 'contract',
          size: 512000,
          uploadedAt: '2025-09-28T15:00:00Z',
          uploadedBy: '営業部 田中',
          propertyId: 'prop-1',
          propertyName: '山田様邸新築工事',
        },
        {
          id: 'doc-3',
          name: '平面図_1F.pdf',
          category: 'drawing',
          size: 1024000,
          uploadedAt: '2025-09-15T10:00:00Z',
          uploadedBy: 'IC 佐藤',
          propertyId: 'prop-1',
          propertyName: '山田様邸新築工事',
        },
        {
          id: 'doc-4',
          name: '平面図_2F.pdf',
          category: 'drawing',
          size: 980000,
          uploadedAt: '2025-09-15T10:05:00Z',
          uploadedBy: 'IC 佐藤',
          propertyId: 'prop-1',
          propertyName: '山田様邸新築工事',
        },
        {
          id: 'doc-5',
          name: '立面図.pdf',
          category: 'drawing',
          size: 856000,
          uploadedAt: '2025-09-15T10:10:00Z',
          uploadedBy: 'IC 佐藤',
          propertyId: 'prop-1',
          propertyName: '山田様邸新築工事',
        },
        {
          id: 'doc-6',
          name: 'ショールーム写真.jpg',
          category: 'photo',
          size: 3400000,
          uploadedAt: '2025-09-24T14:30:00Z',
          uploadedBy: '営業部 田中',
          propertyId: 'prop-1',
          propertyName: '山田様邸新築工事',
        },
        {
          id: 'doc-7',
          name: '身分証明書コピー.pdf',
          category: 'identity',
          size: 156000,
          uploadedAt: '2025-09-01T09:30:00Z',
          uploadedBy: '営業部 田中',
        },
        {
          id: 'doc-8',
          name: 'リフォーム見積_実家.pdf',
          category: 'estimate',
          size: 198000,
          uploadedAt: '2025-09-29T11:00:00Z',
          uploadedBy: 'リフォーム部 鈴木',
          propertyId: 'prop-2',
          propertyName: '山田様実家リフォーム',
        },
      ]);

      // Phase 10: 見積・契約・工事台帳データの取得
      // 見積一覧（顧客IDでフィルタ）
      try {
        const estimatesRes = await fetch(`/api/estimates`);
        const estimatesData = await estimatesRes.json();
        if (estimatesData.success && estimatesData.data) {
          // 顧客IDまたは顧客名でフィルタ（実装時は顧客IDで正確にフィルタ）
          const customerEstimates = estimatesData.data.filter((est: any) =>
            est.customerName === customer.name || est.customerId === customerId
          );
          setEstimates(customerEstimates);
        }
      } catch (error) {
        console.error('Failed to fetch estimates:', error);
      }

      // 契約一覧（顧客IDでフィルタ）
      try {
        const contractsRes = await fetch(`/api/contracts`);
        const contractsData = await contractsRes.json();
        if (contractsData.success && contractsData.data) {
          const customerContracts = contractsData.data.filter((contract: any) =>
            contract.customerName === customer.name || contract.customerId === customerId
          );
          setContracts(customerContracts);
        }
      } catch (error) {
        console.error('Failed to fetch contracts:', error);
      }

      // 工事台帳一覧（顧客IDでフィルタ）
      try {
        const ledgersRes = await fetch(`/api/construction-ledgers`);
        const ledgersData = await ledgersRes.json();
        if (ledgersData.success && ledgersData.data) {
          const customerLedgers = ledgersData.data.filter((ledger: any) =>
            ledger.customerName === customer.name || ledger.customerId === customerId
          );
          setConstructionLedgers(customerLedgers);
        }
      } catch (error) {
        console.error('Failed to fetch construction ledgers:', error);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch customer data:', error);
      setLoading(false);
    }
  };

  if (loading || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: '概要', icon: User },
    { id: 'family', label: '家族関係', icon: Users, count: customer.familyRelations?.length || 0 },
    { id: 'properties', label: '物件', icon: Home, count: properties.length },
    { id: 'estimates', label: '見積', icon: Calculator, count: estimates.length },
    { id: 'contracts', label: '契約', icon: ScrollText, count: contracts.length },
    { id: 'construction-ledgers', label: '工事台帳', icon: Hammer, count: constructionLedgers.length },
    { id: 'activities', label: '活動履歴', icon: Activity, count: activities.length },
    { id: 'documents', label: '資料', icon: FileText },
  ];

  const getStatusBadge = (status: string) => {
    const config = {
      lead: { label: 'リード', class: 'bg-gray-500' },
      prospect: { label: '見込み客', class: 'bg-blue-500' },
      customer: { label: '顧客', class: 'bg-green-500' },
      inactive: { label: '休眠', class: 'bg-orange-500' },
    };
    const c = config[status as keyof typeof config] || config.lead;
    return <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${c.class}`}>{c.label}</span>;
  };

  const getPropertyTypeBadge = (type: string) => {
    const config: Record<string, { label: string; class: string }> = {
      newBuild: { label: '新築', class: 'bg-green-100 text-green-800' },
      renovation: { label: 'リフォーム', class: 'bg-blue-100 text-blue-800' },
      extension: { label: '増築', class: 'bg-purple-100 text-purple-800' },
      repair: { label: '修繕', class: 'bg-orange-100 text-orange-800' },
      exterior: { label: '外構', class: 'bg-cyan-100 text-cyan-800' },
      other: { label: 'その他', class: 'bg-gray-100 text-gray-800' },
    };
    const c = config[type] || config.other;
    return <span className={`px-2 py-1 rounded text-xs font-medium ${c.class}`}>{c.label}</span>;
  };

  const getPropertyStatusBadge = (status: string) => {
    const config: Record<string, { label: string; class: string }> = {
      planning: { label: '企画中', class: 'bg-gray-100 text-gray-800' },
      estimating: { label: '見積中', class: 'bg-blue-100 text-blue-800' },
      contracted: { label: '契約済', class: 'bg-green-100 text-green-800' },
      construction: { label: '施工中', class: 'bg-orange-100 text-orange-800' },
      completed: { label: '竣工', class: 'bg-purple-100 text-purple-800' },
      cancelled: { label: 'キャンセル', class: 'bg-red-100 text-red-800' },
    };
    const c = config[status] || config.planning;
    return <span className={`px-2 py-1 rounded text-xs font-medium ${c.class}`}>{c.label}</span>;
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      visit: '🚗',
      call: '📞',
      email: '📧',
      estimate: '📊',
      presentation: '📽️',
      contract: '📝',
      meeting: '🤝',
      claim: '⚠️',
      inspection: '🔍',
      ma_action: '🤖',
      note: '📌',
      other: '💬',
    };
    return icons[type] || icons.other;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/customers')}
                className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-bold text-white">
                    {customer.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    {customer.name}
                    {getStatusBadge(customer.status)}
                  </h1>
                  {customer.company && (
                    <p className="text-white/80 text-lg mt-1 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {customer.company}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="px-6 py-3 bg-white text-blue-600 rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all font-bold flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                メッセージ
              </button>
              <button className="px-6 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl hover:bg-white/20 transition-all font-bold flex items-center gap-2">
                <Edit className="h-5 w-5" />
                編集
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-sm shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-6 py-4 font-bold transition-all relative ${
                    isActive
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Info */}
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  連絡先情報
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-600" />
                      電話番号
                    </h4>
                    {customer.phones?.map((phone) => (
                      <div key={phone.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                        <p className="text-sm font-bold text-gray-900">{phone.number}</p>
                        <p className="text-xs text-gray-500 mt-1">{phone.type} {phone.isPrimary && '✨ (主)'}</p>
                      </div>
                    )) || <p className="text-sm text-gray-900 bg-white rounded-lg p-3">{customer.phone}</p>}
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-purple-600" />
                      メールアドレス
                    </h4>
                    {customer.emails?.map((email) => (
                      <div key={email.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                        <p className="text-sm font-bold text-gray-900">{email.email}</p>
                        <p className="text-xs text-gray-500 mt-1">{email.type} {email.isPrimary && '✨ (主)'}</p>
                      </div>
                    )) || <p className="text-sm text-gray-900 bg-white rounded-lg p-3">{customer.email}</p>}
                  </div>
                </div>
              </div>

              {/* Address Info */}
              <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  住所情報
                </h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <h4 className="text-sm font-bold text-green-700 mb-2">🏠 現住所</h4>
                    <p className="text-sm text-gray-900">
                      {customer.currentAddress?.fullAddress || customer.address || '未登録'}
                    </p>
                  </div>
                  {customer.familyHomeAddress && (
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                      <h4 className="text-sm font-bold text-green-700 mb-2">👨‍👩‍👧‍👦 実家住所</h4>
                      <p className="text-sm text-gray-900">{customer.familyHomeAddress.fullAddress}</p>
                    </div>
                  )}
                  {customer.workAddress && (
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                      <h4 className="text-sm font-bold text-green-700 mb-2">🏢 勤務先住所</h4>
                      <p className="text-sm text-gray-900">{customer.workAddress.fullAddress}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {customer.tags && customer.tags.length > 0 && (
                <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-shadow">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                      <Tag className="h-5 w-5 text-white" />
                    </div>
                    タグ
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {customer.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Stats & Actions */}
            <div className="space-y-6">
              {/* Stats */}
              <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl shadow-2xl p-6 text-white hover:scale-105 transition-transform">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  📊 統計情報
                </h3>
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex justify-between items-center">
                    <span className="text-sm font-medium">🏠 物件数</span>
                    <span className="text-2xl font-bold">{customer.propertiesCount || 0}</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex justify-between items-center">
                    <span className="text-sm font-medium">📋 見積数</span>
                    <span className="text-2xl font-bold">{customer.estimatesCount || 0}</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex justify-between items-center">
                    <span className="text-sm font-medium">✍️ 契約数</span>
                    <span className="text-2xl font-bold">{customer.contractsCount || 0}</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex justify-between items-center">
                    <span className="text-sm font-medium">⚡ 活動回数</span>
                    <span className="text-2xl font-bold">{customer.activitiesCount || 0}</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold">💰 総売上</span>
                      <span className="text-3xl font-bold">
                        ¥{((customer.totalRevenue || 0) / 10000).toFixed(0)}万
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 営業情報 */}
              <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-lg p-6 border border-indigo-100 hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  営業情報
                </h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <span className="text-xs font-bold text-gray-500 uppercase">担当者</span>
                    <p className="text-sm font-bold text-gray-900 mt-1 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {customer.assignee.charAt(0)}
                      </span>
                      {customer.assignee}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <span className="text-xs font-bold text-gray-500 uppercase">獲得チャネル</span>
                    <p className="text-sm font-bold text-indigo-600 mt-1">📢 {customer.source}</p>
                  </div>
                  {customer.leadScore && (
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 shadow-sm border border-yellow-200">
                      <span className="text-xs font-bold text-orange-700 uppercase">リードスコア</span>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all"
                            style={{ width: `${customer.leadScore}%` }}
                          />
                        </div>
                        <span className="text-2xl font-bold text-orange-600">{customer.leadScore}</span>
                      </div>
                    </div>
                  )}
                  {customer.referredByName && (
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                      <span className="text-xs font-bold text-gray-500 uppercase">紹介者</span>
                      <p className="text-sm font-bold text-gray-900 mt-1">🤝 {customer.referredByName}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Family Tab */}
        {activeTab === 'family' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                <Users className="h-8 w-8 text-pink-600" />
                家族関係マップ
              </h2>
              <button
                onClick={() => setShowFamilyModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all font-bold flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                家族を追加
              </button>
            </div>

            {customer.familyRelations && customer.familyRelations.length > 0 ? (
              <div>
                {/* Family Tree Visualization */}
                <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 rounded-2xl shadow-xl p-8 mb-6 border border-purple-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    🌳 家族ツリー
                  </h3>
                  <div className="flex flex-col items-center space-y-8">
                    {/* Main Customer */}
                    <div className="relative">
                      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl p-6 text-white w-64 text-center transform hover:scale-105 transition-all">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mx-auto mb-3 flex items-center justify-center text-3xl font-bold">
                          {customer.name.charAt(0)}
                        </div>
                        <h4 className="text-xl font-bold">{customer.name}</h4>
                        <p className="text-sm text-white/80 mt-1">👤 本人</p>
                      </div>
                    </div>

                    {/* Family Members */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                      {customer.familyRelations.map((relation, idx) => {
                        const colors = [
                          'from-pink-400 to-rose-500',
                          'from-purple-400 to-indigo-500',
                          'from-cyan-400 to-blue-500',
                          'from-green-400 to-emerald-500',
                          'from-orange-400 to-red-500',
                          'from-yellow-400 to-amber-500',
                        ];
                        const color = colors[idx % colors.length];

                        const icons: Record<string, string> = {
                          spouse: '💑',
                          child: '👶',
                          parent: '👨‍👩',
                          sibling: '👫',
                          other: '👤'
                        };

                        return (
                          <div key={relation.id} className="relative group">
                            <div className={`bg-gradient-to-br ${color} rounded-2xl shadow-lg p-6 text-white hover:shadow-2xl transform hover:scale-105 transition-all`}>
                              <div className="flex justify-between items-start mb-3">
                                <div className="text-3xl">{icons[relation.relationType] || icons.other}</div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingFamily(relation);
                                      setShowFamilyModal(true);
                                    }}
                                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button className="p-2 bg-white/20 hover:bg-red-500 rounded-lg transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              <h4 className="text-lg font-bold">{relation.relatedCustomerName}</h4>
                              <p className="text-sm text-white/90 mt-1">
                                {relation.relationName || relation.relationType}
                              </p>
                              {relation.note && (
                                <p className="text-xs text-white/80 mt-3 bg-white/10 rounded-lg p-2">
                                  {relation.note}
                                </p>
                              )}
                              <button
                                onClick={() => router.push(`/customers/${relation.relatedCustomerId}`)}
                                className="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition-colors"
                              >
                                詳細を見る →
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Family List View */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    📋 家族リスト
                  </h3>
                  <div className="space-y-3">
                    {customer.familyRelations.map((relation) => (
                      <div key={relation.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50 transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                              {relation.relatedCustomerName.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{relation.relatedCustomerName}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {relation.relationType} {relation.relationName && `(${relation.relationName})`}
                              </p>
                              {relation.note && (
                                <p className="text-sm text-gray-500 mt-2 italic">{relation.note}</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => router.push(`/customers/${relation.relatedCustomerId}`)}
                            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-bold text-sm"
                          >
                            詳細を見る →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl shadow-lg p-16 text-center border-2 border-dashed border-purple-300">
                <Users className="h-24 w-24 mx-auto mb-6 text-purple-400" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">家族関係が未登録です</h3>
                <p className="text-gray-600 mb-6">家族や関係者を登録して、より詳細な顧客管理を始めましょう</p>
                <button
                  onClick={() => setShowFamilyModal(true)}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all font-bold flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-5 w-5" />
                  最初の家族を追加
                </button>
              </div>
            )}
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
                <Home className="h-8 w-8 text-emerald-600" />
                物件一覧
              </h2>
              <button
                onClick={() => setShowPropertyModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all font-bold flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                物件を追加
              </button>
            </div>

            {properties.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {properties.map((property, idx) => {
                  const gradients = [
                    'from-emerald-500 to-teal-600',
                    'from-blue-500 to-cyan-600',
                    'from-purple-500 to-indigo-600',
                    'from-orange-500 to-red-600',
                  ];
                  const gradient = gradients[idx % gradients.length];

                  const statusSteps = [
                    { key: 'planning', label: '企画', icon: '📋' },
                    { key: 'estimating', label: '見積', icon: '💰' },
                    { key: 'contracted', label: '契約', icon: '📝' },
                    { key: 'construction', label: '施工', icon: '🏗️' },
                    { key: 'completed', label: '竣工', icon: '🏡' },
                  ];
                  const currentStepIndex = statusSteps.findIndex(s => s.key === property.status);

                  return (
                    <div
                      key={property.id}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden group"
                    >
                      {/* Header with Gradient */}
                      <div className={`bg-gradient-to-r ${gradient} p-6 text-white relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

                        <div className="relative">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="text-xl font-bold mb-1">
                                {property.name || '物件名未設定'}
                              </h4>
                              <div className="flex items-center gap-2 text-white/90 text-sm">
                                <MapPin className="h-4 w-4" />
                                <p>{property.address.fullAddress}</p>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              {getPropertyTypeBadge(property.propertyType)}
                            </div>
                          </div>

                          {/* Status Progress */}
                          <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-xl p-3">
                            <div className="flex justify-between items-center mb-2">
                              {statusSteps.map((step, i) => (
                                <div key={step.key} className="flex flex-col items-center flex-1">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all ${
                                    i <= currentStepIndex
                                      ? 'bg-white text-emerald-600 scale-110 shadow-lg'
                                      : 'bg-white/30 text-white/60'
                                  }`}>
                                    {step.icon}
                                  </div>
                                  <span className={`text-xs mt-1 font-bold ${
                                    i <= currentStepIndex ? 'text-white' : 'text-white/60'
                                  }`}>
                                    {step.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="relative h-1 bg-white/30 rounded-full mt-2">
                              <div
                                className="absolute h-full bg-white rounded-full transition-all duration-500"
                                style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-6">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-blue-600 mb-2">
                              <span className="text-2xl">📐</span>
                              <span className="text-xs font-bold text-gray-600">土地面積</span>
                            </div>
                            <p className="text-lg font-bold text-gray-900">
                              {property.land.area ? `${property.land.area}㎡` : '未登録'}
                            </p>
                            {property.land.areaInTsubo && (
                              <p className="text-xs text-gray-500 mt-1">
                                ({property.land.areaInTsubo}坪)
                              </p>
                            )}
                          </div>

                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-purple-600 mb-2">
                              <span className="text-2xl">🏠</span>
                              <span className="text-xs font-bold text-gray-600">延床面積</span>
                            </div>
                            <p className="text-lg font-bold text-gray-900">
                              {property.building.totalFloorArea ? `${property.building.totalFloorArea}㎡` : '未登録'}
                            </p>
                            {property.building.floors && (
                              <p className="text-xs text-gray-500 mt-1">
                                {property.building.floors}階建て
                              </p>
                            )}
                          </div>

                          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-orange-600 mb-2">
                              <span className="text-2xl">💰</span>
                              <span className="text-xs font-bold text-gray-600">希望予算</span>
                            </div>
                            <p className="text-lg font-bold text-gray-900">
                              {property.desiredBudget ? `¥${(property.desiredBudget / 10000).toFixed(0)}万` : '未設定'}
                            </p>
                          </div>

                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-green-600 mb-2">
                              <span className="text-2xl">📅</span>
                              <span className="text-xs font-bold text-gray-600">着工予定</span>
                            </div>
                            <p className="text-sm font-bold text-gray-900">
                              {property.scheduledStartDate
                                ? new Date(property.scheduledStartDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })
                                : '未定'}
                            </p>
                          </div>
                        </div>

                        {/* Additional Info */}
                        {property.building.structure && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <Building2 className="h-4 w-4" />
                            <span>構造: {property.building.structure === 'wood' ? '木造' : property.building.structure === 'steel' ? '鉄骨' : property.building.structure === 'rc' ? 'RC' : property.building.structure}</span>
                          </div>
                        )}

                        {property.notes && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-xl border-l-4 border-emerald-500">
                            <p className="text-sm text-gray-700">{property.notes}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => {
                              setEditingProperty(property);
                              setShowPropertyModal(true);
                            }}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-bold flex items-center justify-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            編集
                          </button>
                          <button className="flex-1 px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-bold flex items-center justify-center gap-2">
                            <FileText className="h-4 w-4" />
                            詳細
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl shadow-lg p-16 text-center border-2 border-dashed border-emerald-300">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl">
                    <Home className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">物件が登録されていません</h3>
                  <p className="text-gray-600 mb-6">
                    {customer?.name}様の物件情報を登録して、<br />
                    プロジェクトを管理しましょう
                  </p>
                  <button
                    onClick={() => setShowPropertyModal(true)}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all font-bold inline-flex items-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    最初の物件を追加
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                <Activity className="h-8 w-8 text-indigo-600" />
                活動履歴
              </h2>
              <button
                onClick={() => setShowActivityModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all font-bold flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                活動を記録
              </button>
            </div>

            {/* Activity Type Filter */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setActivityTypeFilter(null)}
                className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  activityTypeFilter === null
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
                }`}
              >
                すべて ({activities.length})
              </button>
              {[
                { type: 'visit', label: '訪問', icon: '🏠', color: 'from-blue-500 to-cyan-500' },
                { type: 'call', label: '電話', icon: '📞', color: 'from-green-500 to-emerald-500' },
                { type: 'meeting', label: '打ち合わせ', icon: '👥', color: 'from-purple-500 to-pink-500' },
                { type: 'estimate', label: '見積', icon: '💰', color: 'from-orange-500 to-red-500' },
                { type: 'contract', label: '契約', icon: '📝', color: 'from-yellow-500 to-amber-500' },
                { type: 'note', label: 'メモ', icon: '📋', color: 'from-gray-500 to-slate-500' },
              ].map((filter) => {
                const count = activities.filter(a => a.type === filter.type).length;
                return (
                  <button
                    key={filter.type}
                    onClick={() => setActivityTypeFilter(filter.type)}
                    className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                      activityTypeFilter === filter.type
                        ? `bg-gradient-to-r ${filter.color} text-white shadow-lg`
                        : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    <span>{filter.icon}</span>
                    {filter.label} ({count})
                  </button>
                );
              })}
            </div>

            {activities.length > 0 ? (
              <div className="space-y-6">
                {activities
                  .filter(activity => !activityTypeFilter || activity.type === activityTypeFilter)
                  .map((activity, idx) => {
                    const activityColors: Record<string, { gradient: string; bg: string; border: string }> = {
                      visit: { gradient: 'from-blue-500 to-cyan-600', bg: 'from-blue-50 to-cyan-50', border: 'border-blue-200' },
                      call: { gradient: 'from-green-500 to-emerald-600', bg: 'from-green-50 to-emerald-50', border: 'border-green-200' },
                      meeting: { gradient: 'from-purple-500 to-pink-600', bg: 'from-purple-50 to-pink-50', border: 'border-purple-200' },
                      estimate: { gradient: 'from-orange-500 to-red-600', bg: 'from-orange-50 to-red-50', border: 'border-orange-200' },
                      contract: { gradient: 'from-yellow-500 to-amber-600', bg: 'from-yellow-50 to-amber-50', border: 'border-yellow-200' },
                      note: { gradient: 'from-gray-500 to-slate-600', bg: 'from-gray-50 to-slate-50', border: 'border-gray-200' },
                      ma_action: { gradient: 'from-indigo-500 to-purple-600', bg: 'from-indigo-50 to-purple-50', border: 'border-indigo-200' },
                    };
                    const colors = activityColors[activity.type] || activityColors.note;

                    return (
                      <div key={activity.id} className="relative pl-8">
                        {/* Timeline Line */}
                        {idx < activities.filter(a => !activityTypeFilter || a.type === activityTypeFilter).length - 1 && (
                          <div className="absolute left-[15px] top-12 bottom-0 w-0.5 bg-gradient-to-b from-indigo-300 to-purple-300"></div>
                        )}

                        {/* Timeline Dot */}
                        <div className={`absolute left-0 top-2 w-8 h-8 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white font-bold shadow-lg`}>
                          <span className="text-lg">{getActivityIcon(activity.type)}</span>
                        </div>

                        {/* Activity Card */}
                        <div className={`bg-gradient-to-br ${colors.bg} rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden border-2 ${colors.border}`}>
                          <div className="p-6">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-xl font-bold text-gray-900">{activity.title}</h4>
                                  {activity.isAutomatic && (
                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold">
                                      自動記録
                                    </span>
                                  )}
                                  {activity.outcome && (
                                    <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-xs font-bold shadow-sm">
                                      {activity.outcome}
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-700 leading-relaxed">{activity.content}</p>
                              </div>
                              <div className="ml-4 text-right whitespace-nowrap">
                                <div className="text-sm font-bold text-gray-900">
                                  {new Date(activity.createdAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(activity.createdAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>

                            {/* Meta Info */}
                            <div className="flex items-center gap-4 text-sm mt-4 pt-4 border-t border-gray-200">
                              <div className="flex items-center gap-2 text-gray-600">
                                <User className="h-4 w-4" />
                                <span className="font-medium">{activity.createdByName || '不明'}</span>
                              </div>
                              {activity.duration && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Calendar className="h-4 w-4" />
                                  <span>{activity.duration}分</span>
                                </div>
                              )}
                              {activity.propertyId && (
                                <div className="px-3 py-1 bg-white/60 backdrop-blur-sm rounded-lg text-xs font-bold text-gray-700 border border-gray-200">
                                  物件紐付き
                                </div>
                              )}
                            </div>

                            {/* Next Action */}
                            {activity.nextAction && (
                              <div className="mt-4 p-4 bg-gradient-to-r from-yellow-100 to-amber-100 border-l-4 border-yellow-500 rounded-xl">
                                <div className="flex items-start gap-2">
                                  <div className="text-yellow-600 font-bold text-sm">⚡ 次のアクション:</div>
                                  <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-900">{activity.nextAction}</p>
                                    {activity.nextActionDate && (
                                      <p className="text-xs text-gray-600 mt-1">
                                        期限: {new Date(activity.nextActionDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl shadow-lg p-16 text-center border-2 border-dashed border-indigo-300">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl">
                    <Activity className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">活動履歴がありません</h3>
                  <p className="text-gray-600 mb-6">
                    {customer?.name}様との活動を記録して、<br />
                    営業活動を可視化しましょう
                  </p>
                  <button
                    onClick={() => setShowActivityModal(true)}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all font-bold inline-flex items-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    最初の活動を記録
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                <FileText className="h-8 w-8 text-cyan-600" />
                資料管理
              </h2>
              <button
                onClick={() => setShowDocumentModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all font-bold flex items-center gap-2"
              >
                <Upload className="h-5 w-5" />
                資料をアップロード
              </button>
            </div>

            {/* Category Filter */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setDocumentCategoryFilter(null)}
                className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  documentCategoryFilter === null
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
                }`}
              >
                すべて ({documents.length})
              </button>
              {[
                { type: 'estimate', label: '見積書', icon: '💰', color: 'from-orange-500 to-red-500' },
                { type: 'contract', label: '契約書', icon: '📝', color: 'from-yellow-500 to-amber-500' },
                { type: 'drawing', label: '図面', icon: '📐', color: 'from-purple-500 to-pink-500' },
                { type: 'photo', label: '写真', icon: '📷', color: 'from-green-500 to-emerald-500' },
                { type: 'identity', label: '身分証', icon: '🪪', color: 'from-blue-500 to-cyan-500' },
                { type: 'other', label: 'その他', icon: '📄', color: 'from-gray-500 to-slate-500' },
              ].map((filter) => {
                const count = documents.filter(d => d.category === filter.type).length;
                return (
                  <button
                    key={filter.type}
                    onClick={() => setDocumentCategoryFilter(filter.type)}
                    className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                      documentCategoryFilter === filter.type
                        ? `bg-gradient-to-r ${filter.color} text-white shadow-lg`
                        : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    <span>{filter.icon}</span>
                    {filter.label} ({count})
                  </button>
                );
              })}
            </div>

            {documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents
                  .filter(doc => !documentCategoryFilter || doc.category === documentCategoryFilter)
                  .map((doc) => {
                    const categoryConfig: Record<string, { icon: string; gradient: string; bg: string }> = {
                      estimate: { icon: '💰', gradient: 'from-orange-500 to-red-600', bg: 'from-orange-50 to-red-50' },
                      contract: { icon: '📝', gradient: 'from-yellow-500 to-amber-600', bg: 'from-yellow-50 to-amber-50' },
                      drawing: { icon: '📐', gradient: 'from-purple-500 to-pink-600', bg: 'from-purple-50 to-pink-50' },
                      photo: { icon: '📷', gradient: 'from-green-500 to-emerald-600', bg: 'from-green-50 to-emerald-50' },
                      identity: { icon: '🪪', gradient: 'from-blue-500 to-cyan-600', bg: 'from-blue-50 to-cyan-50' },
                      other: { icon: '📄', gradient: 'from-gray-500 to-slate-600', bg: 'from-gray-50 to-slate-50' },
                    };
                    const config = categoryConfig[doc.category] || categoryConfig.other;

                    const fileExtension = doc.name.split('.').pop()?.toLowerCase();
                    const isPDF = fileExtension === 'pdf';
                    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '');

                    return (
                      <div
                        key={doc.id}
                        className={`bg-gradient-to-br ${config.bg} rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden border-2 border-gray-200 group`}
                      >
                        {/* Icon Header */}
                        <div className={`bg-gradient-to-r ${config.gradient} p-4 text-white`}>
                          <div className="flex items-center justify-between">
                            <div className="text-4xl">{config.icon}</div>
                            <div className="flex gap-1">
                              <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                                <Download className="h-4 w-4" />
                              </button>
                              <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Document Info */}
                        <div className="p-4">
                          <h4 className="font-bold text-gray-900 mb-2 truncate" title={doc.name}>
                            {doc.name}
                          </h4>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <File className="h-4 w-4" />
                              <span>{(doc.size / 1024).toFixed(0)} KB</span>
                              {isPDF && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold">
                                  PDF
                                </span>
                              )}
                              {isImage && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                                  画像
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-gray-600">
                              <User className="h-4 w-4" />
                              <span className="truncate">{doc.uploadedBy}</span>
                            </div>

                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(doc.uploadedAt).toLocaleDateString('ja-JP', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>

                            {doc.propertyName && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="flex items-center gap-2 text-gray-700">
                                  <Home className="h-4 w-4" />
                                  <span className="text-xs font-bold truncate">{doc.propertyName}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 rounded-2xl shadow-lg p-16 text-center border-2 border-dashed border-cyan-300">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl">
                    <FileText className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">資料がありません</h3>
                  <p className="text-gray-600 mb-6">
                    {customer?.name}様の見積書、契約書、図面などを<br />
                    アップロードして一元管理しましょう
                  </p>
                  <button
                    onClick={() => setShowDocumentModal(true)}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all font-bold inline-flex items-center gap-2"
                  >
                    <Upload className="h-5 w-5" />
                    最初の資料をアップロード
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Estimates Tab - Phase 10 */}
        {activeTab === 'estimates' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                <Calculator className="h-8 w-8 text-blue-600" />
                見積一覧
              </h2>
              <button
                onClick={() => router.push(`/estimates/create-v2?customerId=${customerId}&customerName=${encodeURIComponent(customer.name)}&skipCustomerSelection=true`)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all font-bold flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                新規見積作成
              </button>
            </div>

            {estimates.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {estimates.map((estimate) => (
                  <div
                    key={estimate.id}
                    onClick={() => router.push(`/estimates/editor-v3/${estimate.id}`)}
                    className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-blue-100 cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {estimate.title || estimate.projectName || '見積書'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          見積番号: {estimate.estimateNo || estimate.id}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        estimate.status === 'draft' ? 'bg-gray-200 text-gray-700' :
                        estimate.status === 'submitted' ? 'bg-blue-200 text-blue-700' :
                        estimate.status === 'negotiating' ? 'bg-yellow-200 text-yellow-700' :
                        estimate.status === 'accepted' ? 'bg-green-200 text-green-700' :
                        'bg-red-200 text-red-700'
                      }`}>
                        {estimate.status === 'draft' ? '下書き' :
                         estimate.status === 'submitted' ? '提出済み' :
                         estimate.status === 'negotiating' ? '交渉中' :
                         estimate.status === 'accepted' ? '受注' : '失注'}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">見積金額:</span>
                        <span className="text-lg font-bold text-blue-600">
                          ¥{(estimate.totalAmount || 0).toLocaleString()}
                        </span>
                      </div>
                      {estimate.grossProfit && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">粗利:</span>
                          <span className="text-sm font-bold text-green-600">
                            ¥{estimate.grossProfit.toLocaleString()} ({estimate.profitRate}%)
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-200">
                      <span>作成日: {new Date(estimate.createdAt).toLocaleDateString('ja-JP')}</span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {estimate.createdBy || '担当者'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-12 text-center border-2 border-dashed border-blue-300">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl">
                  <Calculator className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">見積がありません</h3>
                <p className="text-gray-600 mb-6">
                  {customer?.name}様への見積を作成しましょう
                </p>
                <button
                  onClick={() => router.push(`/estimates/create-v2?customerId=${customerId}&customerName=${encodeURIComponent(customer.name)}&skipCustomerSelection=true`)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all font-bold inline-flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  最初の見積を作成
                </button>
              </div>
            )}
          </div>
        )}

        {/* Contracts Tab - Phase 10 */}
        {activeTab === 'contracts' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-3">
                <ScrollText className="h-8 w-8 text-green-600" />
                契約一覧
              </h2>
              <button
                onClick={() => router.push('/contracts/create')}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all font-bold flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                新規契約作成
              </button>
            </div>

            {contracts.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {contracts.map((contract) => (
                  <div
                    key={contract.id}
                    onClick={() => router.push(`/contracts/${contract.id}`)}
                    className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-green-100 cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                          {contract.title || contract.projectName || '工事請負契約'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          契約番号: {contract.contractNo || contract.id}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        contract.status === 'draft' ? 'bg-gray-200 text-gray-700' :
                        contract.status === 'pending' ? 'bg-yellow-200 text-yellow-700' :
                        contract.status === 'signed' ? 'bg-green-200 text-green-700' :
                        contract.status === 'active' ? 'bg-blue-200 text-blue-700' :
                        'bg-purple-200 text-purple-700'
                      }`}>
                        {contract.status === 'draft' ? '下書き' :
                         contract.status === 'pending' ? '承認待ち' :
                         contract.status === 'signed' ? '締結済' :
                         contract.status === 'active' ? '進行中' : '完了'}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">契約金額:</span>
                        <span className="text-lg font-bold text-green-600">
                          ¥{(contract.contractAmount || 0).toLocaleString()}
                        </span>
                      </div>
                      {contract.startDate && contract.endDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">工期:</span>
                          <span className="text-sm text-gray-700">
                            {new Date(contract.startDate).toLocaleDateString('ja-JP')} 〜
                            {new Date(contract.endDate).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-200">
                      <span>締結日: {contract.signedAt ? new Date(contract.signedAt).toLocaleDateString('ja-JP') : '未締結'}</span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {contract.createdBy || '担当者'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-12 text-center border-2 border-dashed border-green-300">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl">
                  <ScrollText className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">契約がありません</h3>
                <p className="text-gray-600 mb-6">
                  {customer?.name}様との契約を作成しましょう
                </p>
                <button
                  onClick={() => router.push('/contracts/create')}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all font-bold inline-flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  最初の契約を作成
                </button>
              </div>
            )}
          </div>
        )}

        {/* Construction Ledgers Tab - Phase 10 */}
        {activeTab === 'construction-ledgers' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center gap-3">
                <Hammer className="h-8 w-8 text-orange-600" />
                工事台帳
              </h2>
              <button
                onClick={() => router.push('/construction-ledgers/create')}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all font-bold flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                新規工事台帳作成
              </button>
            </div>

            {constructionLedgers.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {constructionLedgers.map((ledger) => (
                  <div
                    key={ledger.id}
                    onClick={() => router.push(`/construction-ledgers/${ledger.id}`)}
                    className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-orange-100 cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                          {ledger.projectName || '工事台帳'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          工事番号: {ledger.ledgerNo || ledger.id}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ledger.status === 'planning' ? 'bg-gray-200 text-gray-700' :
                        ledger.status === 'pending' ? 'bg-yellow-200 text-yellow-700' :
                        ledger.status === 'approved' ? 'bg-blue-200 text-blue-700' :
                        ledger.status === 'in-progress' ? 'bg-orange-200 text-orange-700' :
                        'bg-green-200 text-green-700'
                      }`}>
                        {ledger.status === 'planning' ? '計画中' :
                         ledger.status === 'pending' ? '承認待ち' :
                         ledger.status === 'approved' ? '承認済' :
                         ledger.status === 'in-progress' ? '施工中' : '完工'}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">受注金額:</span>
                        <span className="text-lg font-bold text-orange-600">
                          ¥{(ledger.contractAmount || 0).toLocaleString()}
                        </span>
                      </div>
                      {ledger.actualCost !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">実績原価:</span>
                          <span className="text-sm font-bold text-red-600">
                            ¥{ledger.actualCost.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {ledger.grossProfit !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">粗利:</span>
                          <span className={`text-sm font-bold ${ledger.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ¥{ledger.grossProfit.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-200">
                      <span>工期: {ledger.startDate && new Date(ledger.startDate).toLocaleDateString('ja-JP')} 〜 {ledger.endDate && new Date(ledger.endDate).toLocaleDateString('ja-JP')}</span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {ledger.projectManager || '現場監督'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {ledger.progress !== undefined && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>進捗率</span>
                          <span className="font-bold">{ledger.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all"
                            style={{ width: `${ledger.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-12 text-center border-2 border-dashed border-orange-300">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl">
                  <Hammer className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">工事台帳がありません</h3>
                <p className="text-gray-600 mb-6">
                  {customer?.name}様の工事台帳を作成しましょう
                </p>
                <button
                  onClick={() => router.push('/construction-ledgers/create')}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all font-bold inline-flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  最初の工事台帳を作成
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Family Add/Edit Modal */}
      {showFamilyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Users className="h-7 w-7" />
                    {editingFamily ? '家族情報の編集' : '家族メンバーを追加'}
                  </h2>
                  <p className="text-white/80 text-sm mt-1">
                    {customer.name}様の家族として登録します
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowFamilyModal(false);
                    setEditingFamily(null);
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <form className="space-y-6">
                {/* Relation Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    続柄 <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { value: 'spouse', label: '配偶者', icon: '💑' },
                      { value: 'child', label: '子供', icon: '👶' },
                      { value: 'parent', label: '親', icon: '👨‍👩' },
                      { value: 'sibling', label: '兄弟姉妹', icon: '👫' },
                      { value: 'other', label: 'その他', icon: '👤' },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-center group"
                      >
                        <div className="text-3xl mb-2 group-hover:scale-125 transition-transform">
                          {type.icon}
                        </div>
                        <div className="text-sm font-bold text-gray-700">
                          {type.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Existing Customer */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    顧客を選択 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="顧客名で検索..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 既存の顧客から選択、または下記で新規登録
                  </p>
                </div>

                {/* Or Create New */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">または</span>
                  </div>
                </div>

                {/* New Customer Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    新規顧客として登録
                  </label>
                  <input
                    type="text"
                    placeholder="名前を入力"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Relation Name (Custom) */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    続柄の詳細 <span className="text-gray-400 text-xs">(任意)</span>
                  </label>
                  <input
                    type="text"
                    placeholder='例: 長男、次女、父、母 など'
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    メモ <span className="text-gray-400 text-xs">(任意)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="関係性や特記事項など..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowFamilyModal(false);
                  setEditingFamily(null);
                }}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-bold"
              >
                キャンセル
              </button>
              <button
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-bold"
              >
                {editingFamily ? '更新する' : '追加する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Property Add/Edit Modal */}
      {showPropertyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Home className="h-7 w-7" />
                    {editingProperty ? '物件情報の編集' : '新規物件の追加'}
                  </h2>
                  <p className="text-white/80 text-sm mt-1">
                    {customer?.name}様の物件として登録します
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowPropertyModal(false);
                    setEditingProperty(null);
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <form className="space-y-6">
                {/* Basic Info Section */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    📋 基本情報
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        物件名 <span className="text-gray-400 text-xs">(任意)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="例: 山田様邸新築工事"
                        defaultValue={editingProperty?.name}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        物件種別 <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          { value: 'newBuild', label: '新築', icon: '🏗️' },
                          { value: 'renovation', label: 'リフォーム', icon: '🔨' },
                          { value: 'extension', label: '増築', icon: '📐' },
                          { value: 'repair', label: '修繕', icon: '🔧' },
                          { value: 'exterior', label: '外構', icon: '🌳' },
                          { value: 'other', label: 'その他', icon: '📦' },
                        ].map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            className="p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-center group"
                          >
                            <div className="text-3xl mb-2 group-hover:scale-125 transition-transform">
                              {type.icon}
                            </div>
                            <div className="text-sm font-bold text-gray-700">
                              {type.label}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    📍 所在地
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        郵便番号
                      </label>
                      <input
                        type="text"
                        placeholder="123-4567"
                        defaultValue={editingProperty?.address.postalCode}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        都道府県 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="東京都"
                        defaultValue={editingProperty?.address.prefecture}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        市区町村 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="世田谷区"
                        defaultValue={editingProperty?.address.city}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        町名・番地 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="成城1-2-3"
                        defaultValue={editingProperty?.address.street}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Land Info Section */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    📐 土地情報
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        土地の所有状況
                      </label>
                      <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                        <option value="owned">所有済み</option>
                        <option value="willPurchase">購入予定</option>
                        <option value="undecided">未定</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        土地面積 (㎡)
                      </label>
                      <input
                        type="number"
                        placeholder="150.5"
                        defaultValue={editingProperty?.land.area}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        土地面積 (坪)
                      </label>
                      <input
                        type="number"
                        placeholder="45.5"
                        defaultValue={editingProperty?.land.areaInTsubo}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Building Info Section */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    🏠 建物情報
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        構造
                      </label>
                      <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                        <option value="">選択してください</option>
                        <option value="wood">木造</option>
                        <option value="steel">鉄骨</option>
                        <option value="rc">RC（鉄筋コンクリート）</option>
                        <option value="src">SRC（鉄骨鉄筋コンクリート）</option>
                        <option value="other">その他</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        階数
                      </label>
                      <input
                        type="number"
                        placeholder="2"
                        defaultValue={editingProperty?.building.floors}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        延床面積 (㎡)
                      </label>
                      <input
                        type="number"
                        placeholder="120.5"
                        defaultValue={editingProperty?.building.totalFloorArea}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        築年数 <span className="text-gray-400 text-xs">(リフォームの場合)</span>
                      </label>
                      <input
                        type="number"
                        placeholder="28"
                        defaultValue={editingProperty?.building.age}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Budget & Schedule Section */}
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    💰 予算・スケジュール
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        希望予算 (円)
                      </label>
                      <input
                        type="number"
                        placeholder="35000000"
                        defaultValue={editingProperty?.desiredBudget}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        着工予定日
                      </label>
                      <input
                        type="date"
                        defaultValue={editingProperty?.scheduledStartDate}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        竣工予定日
                      </label>
                      <input
                        type="date"
                        defaultValue={editingProperty?.scheduledCompletionDate}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    備考 <span className="text-gray-400 text-xs">(任意)</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="物件に関する特記事項、要望など..."
                    defaultValue={editingProperty?.notes}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  />
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button
                onClick={() => {
                  setShowPropertyModal(false);
                  setEditingProperty(null);
                }}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-bold"
              >
                キャンセル
              </button>
              <button
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-bold"
              >
                {editingProperty ? '更新する' : '追加する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Add/Edit Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Activity className="h-7 w-7" />
                    {editingActivity ? '活動記録の編集' : '新しい活動を記録'}
                  </h2>
                  <p className="text-white/80 text-sm mt-1">
                    {customer?.name}様との活動内容を記録します
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowActivityModal(false);
                    setEditingActivity(null);
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <form className="space-y-6">
                {/* Activity Type Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    活動タイプ <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: 'visit', label: '訪問', icon: '🏠', color: 'hover:border-blue-500 hover:bg-blue-50' },
                      { value: 'call', label: '電話', icon: '📞', color: 'hover:border-green-500 hover:bg-green-50' },
                      { value: 'email', label: 'メール', icon: '📧', color: 'hover:border-cyan-500 hover:bg-cyan-50' },
                      { value: 'meeting', label: '打ち合わせ', icon: '👥', color: 'hover:border-purple-500 hover:bg-purple-50' },
                      { value: 'presentation', label: 'プレゼン', icon: '📊', color: 'hover:border-pink-500 hover:bg-pink-50' },
                      { value: 'estimate', label: '見積提出', icon: '💰', color: 'hover:border-orange-500 hover:bg-orange-50' },
                      { value: 'contract', label: '契約', icon: '📝', color: 'hover:border-yellow-500 hover:bg-yellow-50' },
                      { value: 'note', label: 'メモ', icon: '📋', color: 'hover:border-gray-500 hover:bg-gray-50' },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        className={`p-4 border-2 border-gray-200 rounded-xl transition-all text-center group ${type.color}`}
                      >
                        <div className="text-3xl mb-2 group-hover:scale-125 transition-transform">
                          {type.icon}
                        </div>
                        <div className="text-sm font-bold text-gray-700">
                          {type.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title and Content */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    📝 活動内容
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        タイトル <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="例: 初回ヒアリング訪問"
                        defaultValue={editingActivity?.title}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        詳細内容 <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        placeholder="活動の詳細を記録してください..."
                        defaultValue={editingActivity?.content}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Property Association */}
                {properties.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      🏠 物件との紐付け
                    </h3>
                    <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                      <option value="">物件を選択（任意）</option>
                      {properties.map((property) => (
                        <option key={property.id} value={property.id}>
                          {property.name || property.address.fullAddress}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Duration and Outcome */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      所要時間（分）
                    </label>
                    <input
                      type="number"
                      placeholder="60"
                      defaultValue={editingActivity?.duration}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      結果・成果
                    </label>
                    <input
                      type="text"
                      placeholder="例: 好反応、契約見込み高い"
                      defaultValue={editingActivity?.outcome}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Next Action */}
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    ⚡ 次のアクション
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        次回実施事項
                      </label>
                      <input
                        type="text"
                        placeholder="例: プラン図面作成"
                        defaultValue={editingActivity?.nextAction}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        実施予定日
                      </label>
                      <input
                        type="date"
                        defaultValue={editingActivity?.nextActionDate}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button
                onClick={() => {
                  setShowActivityModal(false);
                  setEditingActivity(null);
                }}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-bold"
              >
                キャンセル
              </button>
              <button
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-bold"
              >
                {editingActivity ? '更新する' : '記録する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Upload Modal */}
      {showDocumentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Upload className="h-7 w-7" />
                    資料をアップロード
                  </h2>
                  <p className="text-white/80 text-sm mt-1">
                    {customer?.name}様の関連資料を登録します
                  </p>
                </div>
                <button
                  onClick={() => setShowDocumentModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <form className="space-y-6">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-cyan-300 rounded-2xl p-12 bg-gradient-to-br from-cyan-50 to-blue-50 hover:border-cyan-500 transition-colors cursor-pointer">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                      <Upload className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      ファイルをドラッグ&ドロップ
                    </h3>
                    <p className="text-gray-600 mb-4">または</p>
                    <button
                      type="button"
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-bold"
                    >
                      ファイルを選択
                    </button>
                    <p className="text-xs text-gray-500 mt-4">
                      PDF, JPG, PNG (最大10MB)
                    </p>
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    資料カテゴリー <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { value: 'estimate', label: '見積書', icon: '💰', color: 'hover:border-orange-500 hover:bg-orange-50' },
                      { value: 'contract', label: '契約書', icon: '📝', color: 'hover:border-yellow-500 hover:bg-yellow-50' },
                      { value: 'drawing', label: '図面', icon: '📐', color: 'hover:border-purple-500 hover:bg-purple-50' },
                      { value: 'photo', label: '写真', icon: '📷', color: 'hover:border-green-500 hover:bg-green-50' },
                      { value: 'identity', label: '身分証', icon: '🪪', color: 'hover:border-blue-500 hover:bg-blue-50' },
                      { value: 'other', label: 'その他', icon: '📄', color: 'hover:border-gray-500 hover:bg-gray-50' },
                    ].map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        className={`p-4 border-2 border-gray-200 rounded-xl transition-all text-center group ${cat.color}`}
                      >
                        <div className="text-3xl mb-2 group-hover:scale-125 transition-transform">
                          {cat.icon}
                        </div>
                        <div className="text-sm font-bold text-gray-700">
                          {cat.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Property Association */}
                {properties.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      🏠 物件との紐付け
                    </h3>
                    <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                      <option value="">物件を選択（任意）</option>
                      {properties.map((property) => (
                        <option key={property.id} value={property.id}>
                          {property.name || property.address.fullAddress}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    メモ <span className="text-gray-400 text-xs">(任意)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="資料に関する補足情報など..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  />
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button
                onClick={() => setShowDocumentModal(false)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-bold"
              >
                キャンセル
              </button>
              <button
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-bold"
              >
                アップロード
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
