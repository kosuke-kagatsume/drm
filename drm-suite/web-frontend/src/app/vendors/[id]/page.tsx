'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface VendorProject {
  id: string;
  projectName: string;
  workType: string;
  startDate: string;
  endDate: string;
  amount: number;
  quality: number;
  status: 'completed' | 'in_progress' | 'cancelled';
}

interface VendorReview {
  id: string;
  projectName: string;
  reviewer: string;
  rating: number;
  quality: number;
  schedule: number;
  communication: number;
  comment: string;
  date: string;
}

interface VendorDetail {
  id: string;
  name: string;
  category: string;
  phone: string;
  email: string;
  address: string;
  representative: string;
  established: string;
  employees: number;
  capital: number;
  website?: string;
  availability: 'immediate' | 'next_week' | 'busy';
  qualityScore: number;
  totalProjects: number;
  avgAmount: number;
  onTimeRate: number;
  specialties: string[];
  certifications: string[];
  notes: string;
  contractTerms: string;
  paymentTerms: string;
  projects: VendorProject[];
  reviews: VendorReview[];
}

export default function VendorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'projects' | 'reviews' | 'contract'
  >('overview');
  const [isEditing, setIsEditing] = useState(false);

  const [vendor, setVendor] = useState<VendorDetail>({
    id: params.id as string,
    name: '株式会社 田中塗装',
    category: '塗装工事',
    phone: '03-1234-5678',
    email: 'info@tanaka-tosou.co.jp',
    address: '東京都港区赤坂1-2-3',
    representative: '田中 太郎',
    established: '1995年4月',
    employees: 25,
    capital: 10000000,
    website: 'https://tanaka-tosou.co.jp',
    availability: 'next_week',
    qualityScore: 4.2,
    totalProjects: 127,
    avgAmount: 2800000,
    onTimeRate: 92,
    specialties: [
      '外壁塗装',
      '屋根塗装',
      '防水工事',
      'ウレタン系塗料',
      'シリコン系塗料',
    ],
    certifications: [
      '一級塗装技能士',
      '職長・安全衛生責任者',
      '足場組立等作業主任者',
    ],
    notes:
      '品質が非常に高く、納期も守る信頼できる協力会社。特に外壁塗装の仕上がりは評判が良い。',
    contractTerms: '工事請負契約書に基づく。保証期間：外壁塗装3年、屋根塗装2年',
    paymentTerms: '月末締め翌月末支払い。材料費は前払い対応可能',
    projects: [
      {
        id: 'P001',
        projectName: '田中様邸 外壁塗装',
        workType: '外壁塗装',
        startDate: '2024-01-10',
        endDate: '2024-01-20',
        amount: 3200000,
        quality: 4.8,
        status: 'completed',
      },
      {
        id: 'P002',
        projectName: '山田ビル 外壁・屋根塗装',
        workType: '塗装工事',
        startDate: '2023-12-05',
        endDate: '2023-12-25',
        amount: 5800000,
        quality: 4.5,
        status: 'completed',
      },
      {
        id: 'P003',
        projectName: '佐藤邸 屋根塗装',
        workType: '屋根塗装',
        startDate: '2024-02-01',
        endDate: '2024-02-15',
        amount: 1800000,
        quality: 4.2,
        status: 'in_progress',
      },
    ],
    reviews: [
      {
        id: 'R001',
        projectName: '田中様邸 外壁塗装',
        reviewer: '山田 太郎（営業）',
        rating: 4.8,
        quality: 5,
        schedule: 4,
        communication: 5,
        comment:
          '非常に丁寧な仕上がりで、お客様からも高評価をいただきました。職人さんの技術力が高く、細部まで配慮が行き届いていました。',
        date: '2024-01-22',
      },
      {
        id: 'R002',
        projectName: '山田ビル 外壁・屋根塗装',
        reviewer: '鈴木 花子（営業）',
        rating: 4.5,
        quality: 4,
        schedule: 5,
        communication: 4,
        comment:
          'スケジュール通りに完了し、品質も満足のいくレベルでした。現場の清掃も丁寧で助かりました。',
        date: '2023-12-26',
      },
    ],
  });

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'immediate':
        return 'bg-green-100 text-green-800';
      case 'next_week':
        return 'bg-yellow-100 text-yellow-800';
      case 'busy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityLabel = (availability: string) => {
    switch (availability) {
      case 'immediate':
        return '即対応可能';
      case 'next_week':
        return '来週対応可能';
      case 'busy':
        return '繁忙中';
      default:
        return availability;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return '完了';
      case 'in_progress':
        return '進行中';
      case 'cancelled':
        return 'キャンセル';
      default:
        return status;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-800"
              >
                ← 戻る
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {vendor.name}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getAvailabilityColor(vendor.availability)}`}
              >
                {getAvailabilityLabel(vendor.availability)}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  isEditing
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isEditing ? '編集終了' : '情報編集'}
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">
                新規依頼
              </button>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700">
                見積依頼
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="border-b">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: '基本情報' },
                    { id: 'projects', label: '実績' },
                    { id: 'reviews', label: '評価' },
                    { id: 'contract', label: '契約条件' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          会社名
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={vendor.name}
                            onChange={(e) =>
                              setVendor((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        ) : (
                          <p className="text-gray-900">{vendor.name}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          代表者
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={vendor.representative}
                            onChange={(e) =>
                              setVendor((prev) => ({
                                ...prev,
                                representative: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        ) : (
                          <p className="text-gray-900">
                            {vendor.representative}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          電話番号
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={vendor.phone}
                            onChange={(e) =>
                              setVendor((prev) => ({
                                ...prev,
                                phone: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        ) : (
                          <p className="text-gray-900">
                            <a
                              href={`tel:${vendor.phone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {vendor.phone}
                            </a>
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          メールアドレス
                        </label>
                        {isEditing ? (
                          <input
                            type="email"
                            value={vendor.email}
                            onChange={(e) =>
                              setVendor((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        ) : (
                          <p className="text-gray-900">
                            <a
                              href={`mailto:${vendor.email}`}
                              className="text-blue-600 hover:underline"
                            >
                              {vendor.email}
                            </a>
                          </p>
                        )}
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          所在地
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={vendor.address}
                            onChange={(e) =>
                              setVendor((prev) => ({
                                ...prev,
                                address: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        ) : (
                          <p className="text-gray-900">{vendor.address}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          設立
                        </label>
                        <p className="text-gray-900">{vendor.established}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          従業員数
                        </label>
                        <p className="text-gray-900">{vendor.employees}名</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          資本金
                        </label>
                        <p className="text-gray-900">
                          ¥{vendor.capital.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ウェブサイト
                        </label>
                        {vendor.website && (
                          <p className="text-gray-900">
                            <a
                              href={vendor.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {vendor.website}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        専門分野
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {vendor.specialties.map((specialty, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        資格・認証
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {vendor.certifications.map((cert, idx) => (
                          <span
                            key={idx}
                            className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        備考
                      </label>
                      {isEditing ? (
                        <textarea
                          value={vendor.notes}
                          onChange={(e) =>
                            setVendor((prev) => ({
                              ...prev,
                              notes: e.target.value,
                            }))
                          }
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      ) : (
                        <p className="text-gray-700 whitespace-pre-line">
                          {vendor.notes}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Projects Tab */}
                {activeTab === 'projects' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">過去の実績</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              プロジェクト名
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              工事種別
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                              期間
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                              金額
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                              品質評価
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                              状態
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {vendor.projects.map((project) => (
                            <tr key={project.id} className="hover:bg-gray-50">
                              <td className="px-4 py-4 font-medium text-gray-900">
                                {project.projectName}
                              </td>
                              <td className="px-4 py-4 text-gray-600">
                                {project.workType}
                              </td>
                              <td className="px-4 py-4 text-center text-sm">
                                {project.startDate} 〜 {project.endDate}
                              </td>
                              <td className="px-4 py-4 text-center font-medium">
                                ¥{project.amount.toLocaleString()}
                              </td>
                              <td className="px-4 py-4 text-center">
                                <div className="flex items-center justify-center">
                                  {renderStars(project.quality)}
                                  <span className="ml-1 text-sm text-gray-600">
                                    ({project.quality})
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(project.status)}`}
                                >
                                  {getStatusLabel(project.status)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      評価・レビュー
                    </h3>
                    <div className="space-y-6">
                      {vendor.reviews.map((review) => (
                        <div key={review.id} className="border rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {review.projectName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                評価者: {review.reviewer}
                              </p>
                              <p className="text-xs text-gray-500">
                                {review.date}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center">
                                {renderStars(review.rating)}
                                <span className="ml-2 text-lg font-bold text-gray-900">
                                  {review.rating}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center">
                              <p className="text-sm text-gray-600">品質</p>
                              <div className="flex items-center justify-center">
                                {renderStars(review.quality)}
                                <span className="ml-1 text-sm">
                                  ({review.quality})
                                </span>
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">
                                スケジュール
                              </p>
                              <div className="flex items-center justify-center">
                                {renderStars(review.schedule)}
                                <span className="ml-1 text-sm">
                                  ({review.schedule})
                                </span>
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">
                                コミュニケーション
                              </p>
                              <div className="flex items-center justify-center">
                                {renderStars(review.communication)}
                                <span className="ml-1 text-sm">
                                  ({review.communication})
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contract Tab */}
                {activeTab === 'contract' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        契約条件
                      </label>
                      {isEditing ? (
                        <textarea
                          value={vendor.contractTerms}
                          onChange={(e) =>
                            setVendor((prev) => ({
                              ...prev,
                              contractTerms: e.target.value,
                            }))
                          }
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      ) : (
                        <p className="text-gray-700 whitespace-pre-line bg-gray-50 p-4 rounded-lg">
                          {vendor.contractTerms}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        支払条件
                      </label>
                      {isEditing ? (
                        <textarea
                          value={vendor.paymentTerms}
                          onChange={(e) =>
                            setVendor((prev) => ({
                              ...prev,
                              paymentTerms: e.target.value,
                            }))
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      ) : (
                        <p className="text-gray-700 whitespace-pre-line bg-gray-50 p-4 rounded-lg">
                          {vendor.paymentTerms}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          対応可能時間
                        </label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                          平日 8:00-17:00
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          緊急時連絡先
                        </label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                          080-1234-5678（田中）
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Performance Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">📊 パフォーマンス</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">品質評価:</span>
                  <div className="flex items-center">
                    {renderStars(vendor.qualityScore)}
                    <span className="ml-2 font-bold text-gray-900">
                      {vendor.qualityScore}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">実績件数:</span>
                  <span className="font-bold text-gray-900">
                    {vendor.totalProjects}件
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">平均受注額:</span>
                  <span className="font-bold text-gray-900">
                    ¥{vendor.avgAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">納期遵守率:</span>
                  <span className="font-bold text-green-600">
                    {vendor.onTimeRate}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                ⚡ クイックアクション
              </h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  📞 電話する
                </button>
                <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                  📧 メール送信
                </button>
                <button className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
                  📋 見積依頼
                </button>
                <button className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700">
                  📅 打ち合わせ予約
                </button>
                <button className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">
                  ⭐ 評価・レビュー
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">📈 最近の活動</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">最後の連絡:</span>
                  <span className="font-medium">3日前</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">最新プロジェクト:</span>
                  <span className="font-medium">進行中</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">次回打ち合わせ:</span>
                  <span className="font-medium">2/15 14:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
