'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface FamilyMember {
  id: string;
  relation: string; // 続柄
  name: string;
  birthDate?: string;
  age?: number;
  occupation?: string;
  notes?: string;
  hobbies?: string[];
  allergies?: string[];
}

interface Property {
  id: string;
  type: 'house' | 'apartment' | 'land' | 'building' | 'other';
  address: string;
  purchaseDate?: string;
  value?: number;
  size?: string;
  notes?: string;
  lastRenovation?: string;
  mortgageStatus?: string;
}

interface Vehicle {
  id: string;
  type: 'car' | 'motorcycle' | 'other';
  brand: string;
  model: string;
  year?: number;
  purchaseDate?: string;
  inspectionDate?: string;
  notes?: string;
}

interface HealthInfo {
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
  medicalHistory?: string[];
  hospital?: string;
  doctor?: string;
}

interface Preference {
  category: string;
  items: string[];
}

interface CustomerRelation {
  customerId: string;
  customerName: string;
  relationType: string; // 親戚、友人、ビジネスパートナー等
  notes?: string;
}

export default function CustomerDetailedPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);

  // 詳細な顧客データ
  const customerDetailed = {
    // 基本情報
    id: params.id,
    name: '田中太郎',
    nameKana: 'タナカタロウ',
    nickname: 'タナさん',
    company: '田中建設株式会社',
    position: '代表取締役',
    email: 'tanaka@example.com',
    phone: '090-1234-5678',
    altPhone: '03-1234-5678',
    lineId: 'tanaka_taro',

    // 個人情報
    birthDate: '1975-03-15',
    age: 48,
    bloodType: 'A型',
    birthplace: '東京都渋谷区',
    currentAddress: '東京都世田谷区○○1-2-3',

    // 家族構成
    maritalStatus: '既婚',
    familyMembers: [
      {
        id: '1',
        relation: '妻',
        name: '田中花子',
        birthDate: '1978-07-20',
        age: 45,
        occupation: '主婦',
        hobbies: ['ヨガ', 'ガーデニング'],
        allergies: ['そば'],
        notes: 'PTA役員経験あり',
      },
      {
        id: '2',
        relation: '長男',
        name: '田中一郎',
        birthDate: '2005-04-10',
        age: 18,
        occupation: '大学生（慶應義塾大学）',
        hobbies: ['サッカー', 'ゲーム'],
        notes: '来年就職活動',
      },
      {
        id: '3',
        relation: '長女',
        name: '田中美咲',
        birthDate: '2008-09-25',
        age: 15,
        occupation: '高校生',
        hobbies: ['ピアノ', '読書'],
        notes: '英検準1級保持',
      },
      {
        id: '4',
        relation: '父',
        name: '田中太一',
        birthDate: '1945-01-05',
        age: 78,
        occupation: '無職（元会社経営）',
        notes: '同居中、足腰が弱い',
      },
    ] as FamilyMember[],

    // 記念日
    anniversaries: [
      { date: '03-15', event: '誕生日（本人）', recurring: true },
      { date: '07-20', event: '妻の誕生日', recurring: true },
      { date: '11-22', event: '結婚記念日', recurring: true },
      { date: '04-10', event: '長男の誕生日', recurring: true },
      { date: '09-25', event: '長女の誕生日', recurring: true },
      { date: '2020-06-15', event: '自宅購入', recurring: false },
    ],

    // 不動産・資産
    properties: [
      {
        id: '1',
        type: 'house' as const,
        address: '東京都世田谷区○○1-2-3',
        purchaseDate: '2020-06-15',
        value: 85000000,
        size: '120㎡',
        lastRenovation: '2023-03',
        mortgageStatus: '残り15年',
        notes: '太陽光パネル設置済み',
      },
      {
        id: '2',
        type: 'apartment' as const,
        address: '神奈川県横浜市○○',
        purchaseDate: '2015-03-20',
        value: 35000000,
        size: '65㎡',
        notes: '投資用、賃貸中',
      },
    ] as Property[],

    // 車両
    vehicles: [
      {
        id: '1',
        type: 'car' as const,
        brand: 'トヨタ',
        model: 'アルファード',
        year: 2022,
        purchaseDate: '2022-05-01',
        inspectionDate: '2024-05-01',
        notes: 'ファミリーカー',
      },
      {
        id: '2',
        type: 'car' as const,
        brand: 'レクサス',
        model: 'LS500h',
        year: 2021,
        purchaseDate: '2021-03-15',
        notes: '社用車',
      },
    ] as Vehicle[],

    // 趣味・嗜好
    preferences: [
      { category: '趣味', items: ['ゴルフ', '釣り', '読書', '映画鑑賞'] },
      {
        category: '好きな食べ物',
        items: ['寿司', '焼肉', 'イタリアン', '日本酒'],
      },
      {
        category: 'スポーツ',
        items: ['ゴルフ（HC15）', '野球観戦（巨人ファン）'],
      },
      { category: '旅行先', items: ['ハワイ', '沖縄', '京都', '北海道'] },
      { category: 'ブランド', items: ['ユニクロ', 'パタゴニア', 'Apple製品'] },
      {
        category: '新聞・雑誌',
        items: ['日経新聞', 'プレジデント', 'ゴルフダイジェスト'],
      },
    ] as Preference[],

    // 健康情報
    health: {
      bloodType: 'A型',
      allergies: ['花粉症', '甲殻類アレルギー'],
      medications: ['高血圧薬'],
      medicalHistory: ['2019年 胃潰瘍', '2021年 帯状疱疹'],
      hospital: '○○総合病院',
      doctor: '山田医師',
    } as HealthInfo,

    // ペット
    pets: [
      { name: 'ポチ', type: '犬', breed: '柴犬', age: 3 },
      { name: 'ミケ', type: '猫', breed: 'ミックス', age: 5 },
    ],

    // 関係性（他の顧客との繋がり）
    relations: [
      {
        customerId: '2',
        customerName: '佐藤次郎',
        relationType: '従兄弟',
        notes: '同じ町内会',
      },
      {
        customerId: '3',
        customerName: '鈴木三郎',
        relationType: 'ゴルフ仲間',
        notes: '月1回ラウンド',
      },
      {
        customerId: '4',
        customerName: '高橋商事',
        relationType: 'ビジネスパートナー',
        notes: '協力会社',
      },
    ] as CustomerRelation[],

    // その他の情報
    education: '慶應義塾大学 経済学部卒',
    hometown: '東京都渋谷区',
    religion: '無宗教',
    politicalView: '無党派',
    socialMedia: {
      facebook: 'tanaka.taro',
      instagram: '@tanaka_construction',
      twitter: '@tanaka_taro',
    },

    // ビジネス関連
    annualIncome: '約2000万円',
    creditRating: 'A',
    bankAccounts: ['みずほ銀行', '三菱UFJ銀行'],
    investments: ['株式（国内）', '投資信託', '不動産'],
    insurance: ['生命保険（日本生命）', '医療保険（アフラック）', '火災保険'],

    // 特記事項
    specialNotes: [
      '早朝（6時台）の連絡OK',
      'メールより電話を好む',
      '決断が早い',
      '品質重視、価格は二の次',
      '地域の有力者（町内会長）',
      '息子の就職相談を受けたことがある',
    ],
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-dandori text-white shadow-xl">
        <div className="max-w-full-hd mx-auto px-4 lg:px-6 xl:px-8 2xl:px-12 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/customers/${params.id}`)}
                className="text-white/80 hover:text-white transition-colors"
              >
                ← 基本情報へ
              </button>
              <div>
                <h1 className="text-3xl font-bold flex items-center">
                  <span className="text-4xl mr-3">📋</span>
                  {customerDetailed.name} - 詳細情報
                </h1>
                <p className="text-dandori-yellow/80 text-sm mt-1">
                  全ての顧客情報を網羅的に管理
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full-hd mx-auto px-4 lg:px-6 xl:px-8 2xl:px-12 py-8">
        {/* Quick Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="text-2xl mb-1">👨‍👩‍👧‍👦</div>
            <div className="text-xl font-bold">
              {customerDetailed.familyMembers.length}人
            </div>
            <div className="text-xs text-gray-600">家族構成</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="text-2xl mb-1">🏠</div>
            <div className="text-xl font-bold">
              {customerDetailed.properties.length}件
            </div>
            <div className="text-xs text-gray-600">不動産</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="text-2xl mb-1">🚗</div>
            <div className="text-xl font-bold">
              {customerDetailed.vehicles.length}台
            </div>
            <div className="text-xs text-gray-600">車両</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="text-2xl mb-1">🎂</div>
            <div className="text-xl font-bold">
              {customerDetailed.anniversaries.length}件
            </div>
            <div className="text-xs text-gray-600">記念日</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="text-2xl mb-1">🤝</div>
            <div className="text-xl font-bold">
              {customerDetailed.relations.length}人
            </div>
            <div className="text-xs text-gray-600">関係者</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="text-2xl mb-1">🐕</div>
            <div className="text-xl font-bold">
              {customerDetailed.pets.length}匹
            </div>
            <div className="text-xs text-gray-600">ペット</div>
          </div>
        </div>

        {/* Detailed Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-2">
            <div className="flex space-x-2 overflow-x-auto">
              {[
                { id: 'personal', label: '個人情報', icon: '👤' },
                { id: 'family', label: '家族構成', icon: '👨‍👩‍👧‍👦' },
                { id: 'property', label: '不動産・資産', icon: '🏠' },
                { id: 'lifestyle', label: 'ライフスタイル', icon: '🎯' },
                { id: 'health', label: '健康・医療', icon: '🏥' },
                { id: 'anniversaries', label: '記念日', icon: '🎂' },
                { id: 'relations', label: '人脈・関係', icon: '🤝' },
                { id: 'business', label: 'ビジネス', icon: '💼' },
                { id: 'notes', label: '特記事項', icon: '📝' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-dandori text-white shadow-lg'
                      : 'text-gray-600 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <span className="text-lg mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="font-bold text-gray-800 mb-3">基本情報</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">氏名（カナ）</span>
                        <span className="font-medium">
                          {customerDetailed.nameKana}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ニックネーム</span>
                        <span className="font-medium">
                          {customerDetailed.nickname}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">生年月日</span>
                        <span className="font-medium">
                          {customerDetailed.birthDate} ({customerDetailed.age}
                          歳)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">血液型</span>
                        <span className="font-medium">
                          {customerDetailed.bloodType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">出身地</span>
                        <span className="font-medium">
                          {customerDetailed.birthplace}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">最終学歴</span>
                        <span className="font-medium">
                          {customerDetailed.education}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="font-bold text-gray-800 mb-3">連絡先</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">LINE ID</span>
                        <span className="font-medium">
                          {customerDetailed.lineId}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">副電話</span>
                        <span className="font-medium">
                          {customerDetailed.altPhone}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="font-bold text-gray-800 mb-3">SNS</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Facebook</span>
                        <span className="font-medium">
                          {customerDetailed.socialMedia.facebook}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Instagram</span>
                        <span className="font-medium">
                          {customerDetailed.socialMedia.instagram}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Twitter</span>
                        <span className="font-medium">
                          {customerDetailed.socialMedia.twitter}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="font-bold text-gray-800 mb-3">その他</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">宗教</span>
                        <span className="font-medium">
                          {customerDetailed.religion}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">政治観</span>
                        <span className="font-medium">
                          {customerDetailed.politicalView}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">婚姻状況</span>
                        <span className="font-medium">
                          {customerDetailed.maritalStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Family Tab */}
            {activeTab === 'family' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">家族構成</h3>
                  <button
                    onClick={() => setShowAddFamilyModal(true)}
                    className="bg-gradient-dandori text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg"
                  >
                    + 家族追加
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {customerDetailed.familyMembers.map((member) => (
                    <div
                      key={member.id}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                            {member.relation}
                          </span>
                          <h4 className="font-bold text-lg mt-2">
                            {member.name}
                          </h4>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <span className="text-xl">✏️</span>
                        </button>
                      </div>

                      <div className="space-y-2 text-sm">
                        {member.birthDate && (
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">🎂</span>
                            <span>
                              {member.birthDate} ({member.age}歳)
                            </span>
                          </div>
                        )}
                        {member.occupation && (
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">💼</span>
                            <span>{member.occupation}</span>
                          </div>
                        )}
                        {member.hobbies && member.hobbies.length > 0 && (
                          <div className="flex items-start space-x-2">
                            <span className="text-gray-600">🎯</span>
                            <span>{member.hobbies.join('、')}</span>
                          </div>
                        )}
                        {member.allergies && member.allergies.length > 0 && (
                          <div className="flex items-start space-x-2">
                            <span className="text-gray-600">⚠️</span>
                            <span className="text-red-600">
                              アレルギー: {member.allergies.join('、')}
                            </span>
                          </div>
                        )}
                        {member.notes && (
                          <div className="mt-2 p-2 bg-white/70 rounded text-xs">
                            📝 {member.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ペット情報 */}
                <h3 className="text-lg font-bold mt-6 mb-4">ペット</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {customerDetailed.pets.map((pet, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">
                          {pet.type === '犬' ? '🐕' : '🐈'}
                        </span>
                        <div>
                          <h4 className="font-bold">{pet.name}</h4>
                          <p className="text-sm text-gray-600">
                            {pet.breed} ({pet.age}歳)
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Property Tab */}
            {activeTab === 'property' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">不動産・資産</h3>
                  <button
                    onClick={() => setShowAddPropertyModal(true)}
                    className="bg-gradient-dandori text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg"
                  >
                    + 不動産追加
                  </button>
                </div>

                {/* 不動産 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {customerDetailed.properties.map((property) => (
                    <div
                      key={property.id}
                      className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                            {property.type === 'house'
                              ? '戸建'
                              : property.type === 'apartment'
                                ? 'マンション'
                                : property.type === 'land'
                                  ? '土地'
                                  : 'その他'}
                          </span>
                          <h4 className="font-bold mt-2">{property.address}</h4>
                        </div>
                        <div className="text-right">
                          {property.value && (
                            <p className="font-bold text-green-700">
                              ¥{(property.value / 10000).toFixed(0)}万
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1 text-sm">
                        {property.size && <p>📐 {property.size}</p>}
                        {property.purchaseDate && (
                          <p>📅 購入: {property.purchaseDate}</p>
                        )}
                        {property.lastRenovation && (
                          <p>🔨 最終改修: {property.lastRenovation}</p>
                        )}
                        {property.mortgageStatus && (
                          <p>🏦 ローン: {property.mortgageStatus}</p>
                        )}
                        {property.notes && (
                          <div className="mt-2 p-2 bg-white/70 rounded text-xs">
                            📝 {property.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 車両 */}
                <h3 className="text-lg font-bold mb-4">車両</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {customerDetailed.vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-xl border border-purple-200"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-3xl">
                          {vehicle.type === 'car' ? '🚗' : '🏍️'}
                        </span>
                        <div>
                          <h4 className="font-bold">
                            {vehicle.brand} {vehicle.model}
                          </h4>
                          {vehicle.year && (
                            <p className="text-sm text-gray-600">
                              {vehicle.year}年式
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1 text-sm">
                        {vehicle.purchaseDate && (
                          <p>📅 購入: {vehicle.purchaseDate}</p>
                        )}
                        {vehicle.inspectionDate && (
                          <p>🔧 次回車検: {vehicle.inspectionDate}</p>
                        )}
                        {vehicle.notes && (
                          <p className="text-gray-600">📝 {vehicle.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 金融資産 */}
                <h3 className="text-lg font-bold mb-4">金融・保険</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-medium mb-2">💰 年収</h4>
                    <p className="text-lg font-bold">
                      {customerDetailed.annualIncome}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-medium mb-2">🏦 取引銀行</h4>
                    <p className="text-sm">
                      {customerDetailed.bankAccounts.join('、')}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-medium mb-2">📊 投資</h4>
                    <p className="text-sm">
                      {customerDetailed.investments.join('、')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Lifestyle Tab */}
            {activeTab === 'lifestyle' && (
              <div>
                <h3 className="text-lg font-bold mb-4">趣味・嗜好</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customerDetailed.preferences.map((pref, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-200"
                    >
                      <h4 className="font-bold text-orange-800 mb-2">
                        {pref.category}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {pref.items.map((item, itemIdx) => (
                          <span
                            key={itemIdx}
                            className="px-3 py-1 bg-white rounded-full text-sm"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Health Tab */}
            {activeTab === 'health' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-50 p-5 rounded-xl border border-red-200">
                  <h3 className="font-bold text-red-800 mb-3">🏥 健康情報</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">血液型:</span>{' '}
                      {customerDetailed.health.bloodType}
                    </div>
                    <div>
                      <span className="font-medium">アレルギー:</span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {customerDetailed.health.allergies?.map(
                          (allergy, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
                            >
                              {allergy}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">服用薬:</span>
                      <div className="mt-1">
                        {customerDetailed.health.medications?.join('、')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
                  <h3 className="font-bold text-blue-800 mb-3">🏥 医療機関</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">かかりつけ医院:</span>{' '}
                      {customerDetailed.health.hospital}
                    </div>
                    <div>
                      <span className="font-medium">担当医:</span>{' '}
                      {customerDetailed.health.doctor}
                    </div>
                    <div>
                      <span className="font-medium">既往歴:</span>
                      <ul className="mt-1 space-y-1">
                        {customerDetailed.health.medicalHistory?.map(
                          (history, idx) => (
                            <li key={idx} className="pl-4">
                              • {history}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Anniversaries Tab */}
            {activeTab === 'anniversaries' && (
              <div>
                <h3 className="text-lg font-bold mb-4">🎂 記念日・重要な日</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customerDetailed.anniversaries.map((anniversary, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-xl border border-pink-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold">{anniversary.event}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {anniversary.recurring
                              ? `毎年 ${anniversary.date}`
                              : anniversary.date}
                          </p>
                        </div>
                        {anniversary.recurring && (
                          <span className="bg-pink-500 text-white px-2 py-1 rounded-full text-xs">
                            毎年
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Relations Tab */}
            {activeTab === 'relations' && (
              <div>
                <h3 className="text-lg font-bold mb-4">🤝 関係者・人脈</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customerDetailed.relations.map((relation) => (
                    <div
                      key={relation.customerId}
                      className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <button
                            onClick={() =>
                              router.push(`/customers/${relation.customerId}`)
                            }
                            className="font-bold text-indigo-600 hover:underline"
                          >
                            {relation.customerName}
                          </button>
                          <p className="text-sm mt-1">
                            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                              {relation.relationType}
                            </span>
                          </p>
                          {relation.notes && (
                            <p className="text-sm text-gray-600 mt-2">
                              📝 {relation.notes}
                            </p>
                          )}
                        </div>
                        <button className="text-indigo-600 hover:text-indigo-800">
                          →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Business Tab */}
            {activeTab === 'business' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
                  <h3 className="font-bold text-blue-800 mb-3">
                    💼 ビジネス情報
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">会社名</span>
                      <span className="font-medium">
                        {customerDetailed.company}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">役職</span>
                      <span className="font-medium">
                        {customerDetailed.position}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">年収</span>
                      <span className="font-medium">
                        {customerDetailed.annualIncome}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">信用格付</span>
                      <span className="font-medium">
                        {customerDetailed.creditRating}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-5 rounded-xl border border-green-200">
                  <h3 className="font-bold text-green-800 mb-3">
                    🏦 金融・保険
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">取引銀行:</span>
                      <p className="mt-1">
                        {customerDetailed.bankAccounts.join('、')}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">投資:</span>
                      <p className="mt-1">
                        {customerDetailed.investments.join('、')}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">保険:</span>
                      <p className="mt-1">
                        {customerDetailed.insurance.join('、')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div>
                <h3 className="text-lg font-bold mb-4">📝 特記事項</h3>
                <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-200">
                  <ul className="space-y-2">
                    {customerDetailed.specialNotes.map((note, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-yellow-600 mr-2">⚡</span>
                        <span className="text-sm">{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <button className="bg-gradient-dandori text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg">
                    + 特記事項を追加
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
