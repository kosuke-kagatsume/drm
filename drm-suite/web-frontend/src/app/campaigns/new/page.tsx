'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCampaigns } from '@/hooks/useCampaigns';
import { CampaignType, TargetSegment } from '@/types/campaign';

// 建築業界向けのテンプレート
const CONSTRUCTION_TEMPLATES = {
  spring_campaign: {
    name: '春の外壁塗装キャンペーン',
    subject: '【期間限定】春の外壁塗装キャンペーン実施中！最大20%OFF',
    body: `いつもお世話になっております。
    
春の訪れとともに、お住まいのメンテナンスはいかがでしょうか？

この度、春の特別キャンペーンとして、外壁塗装工事を
通常価格より最大20%OFFでご提供させていただきます。

【キャンペーン特典】
✓ 外壁塗装工事 最大20%OFF
✓ 無料現地調査・お見積り
✓ 10年保証付き
✓ 足場代サービス（100㎡以上の場合）

【こんな症状はありませんか？】
・外壁にひび割れがある
・塗装が剥がれている
・カビや藻が発生している
・前回の塗装から10年以上経過

お見積りは完全無料です。
まずはお気軽にご相談ください。`,
    ctaText: '無料見積もりを申し込む',
  },
  roof_inspection: {
    name: '梅雨前！無料屋根点検キャンペーン',
    subject: '【無料】梅雨前の屋根点検を実施中！雨漏り対策はお済みですか？',
    body: `梅雨の季節が近づいてまいりました。

大切なお住まいを雨漏りから守るため、
今なら無料で屋根の点検を実施しております。

【無料点検の内容】
✓ 屋根材の状態チェック
✓ 雨樋の詰まり確認
✓ 防水シートの劣化診断
✓ ドローンによる高所撮影
✓ 詳細な診断レポート作成

【点検時間】約30分〜1時間
【費用】完全無料（期間限定）

昨年は梅雨時期に多くの雨漏り被害が発生しました。
被害が出る前の予防が最も効果的です。`,
    ctaText: '無料点検を予約する',
  },
  renovation_fair: {
    name: 'リフォーム相談会開催',
    subject: '【ご招待】リフォーム相談会＆施工事例見学会のご案内',
    body: `この度、リフォーム相談会を開催する運びとなりました。

実際の施工事例をご覧いただきながら、
専門スタッフが皆様のご相談にお答えいたします。

【イベント内容】
◆ リフォーム事例の展示
◆ 最新設備の体験コーナー
◆ 個別相談会（要予約）
◆ 特別価格でのお見積り

【ご来場特典】
・QUOカード1,000円分プレゼント
・リフォームご成約で工事費5%OFF
・無料プランニングサービス

定員に限りがございますので、
お早めにご予約ください。`,
    ctaText: 'イベントに申し込む',
  },
  senior_discount: {
    name: 'シニア世代応援キャンペーン',
    subject: '65歳以上の方限定！バリアフリー工事が特別価格に',
    body: `シニア世代の皆様が安心して暮らせる住まいづくりを応援します。

【対象工事と割引率】
◆ 手すり設置工事：30%OFF
◆ 段差解消工事：25%OFF
◆ 浴室改修工事：20%OFF
◆ トイレ改修工事：20%OFF

【さらに！】
・介護保険の住宅改修費支給申請もサポート
・最大20万円の補助金申請代行も無料

安全で快適な住まいで、
いつまでも元気にお過ごしください。`,
    ctaText: '詳細を確認する',
  },
};

// 建築業界向けのターゲティングオプション
const CONSTRUCTION_SEGMENTS = [
  { value: 'homeowner_10years', label: '築10年以上の戸建て所有者' },
  { value: 'apartment_owner', label: 'アパート・マンションオーナー' },
  { value: 'senior_couple', label: 'シニア世代（60歳以上）' },
  { value: 'young_family', label: '子育て世代（30-40代）' },
  { value: 'previous_customer', label: '過去施工済み顧客' },
  { value: 'estimate_requested', label: '見積依頼履歴あり' },
  { value: 'event_attended', label: 'イベント参加者' },
];

const WORK_TYPES = [
  '外壁塗装',
  '屋根工事',
  '防水工事',
  'リフォーム全般',
  'バリアフリー',
  'エクステリア',
  '増改築',
  '耐震補強',
];

export default function NewCampaignPage() {
  const router = useRouter();
  const { createCampaign } = useCampaigns();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'email' as CampaignType,
    targetSegment: 'all' as TargetSegment,
    customSegments: [] as string[],
    workTypes: [] as string[],
    budget: 100000,
    startDate: '',
    endDate: '',
    content: {
      subject: '',
      body: '',
      ctaText: '',
      ctaUrl: '',
    },
    areas: [] as string[],
    ageRange: { min: 30, max: 70 },
    estimatedReach: 0,
  });

  const [selectedTemplate, setSelectedTemplate] = useState('');

  const applyTemplate = (templateKey: string) => {
    const template =
      CONSTRUCTION_TEMPLATES[
        templateKey as keyof typeof CONSTRUCTION_TEMPLATES
      ];
    if (template) {
      setFormData((prev) => ({
        ...prev,
        name: template.name,
        content: {
          ...prev.content,
          subject: template.subject,
          body: template.body,
          ctaText: template.ctaText,
        },
      }));
      setSelectedTemplate(templateKey);
    }
  };

  const calculateEstimatedReach = () => {
    // 簡易的なリーチ計算
    let base = 500;
    if (formData.targetSegment === 'all') base = 1500;
    if (formData.targetSegment === 'existing') base = 800;
    if (formData.targetSegment === 'new') base = 300;

    // セグメント数に応じて調整
    const segmentMultiplier = 1 - formData.customSegments.length * 0.2;

    return Math.round(base * segmentMultiplier);
  };

  const handleSubmit = async () => {
    const campaign = await createCampaign({
      name: formData.name,
      description: formData.description,
      type: formData.type,
      targetSegment: formData.targetSegment,
      budget: formData.budget,
      startDate: formData.startDate,
      endDate: formData.endDate,
      content: formData.content,
      targeting: {
        area: formData.areas,
        ageRange: formData.ageRange,
        tags: [...formData.customSegments, ...formData.workTypes],
      },
    });

    if (campaign) {
      router.push('/campaigns');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push('/campaigns')}
            className="text-white/80 hover:text-white mb-2 flex items-center"
          >
            ← キャンペーン一覧に戻る
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">新規キャンペーン作成</h1>
              <p className="text-indigo-100 mt-1">
                建築・リフォーム業界向けマーケティング施策を設定
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
              >
                🏠 ダッシュボード
              </button>
              <button
                onClick={() => router.push('/campaigns')}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
              >
                ✕ 閉じる
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ステップインジケーター */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'}`}
            >
              1
            </div>
            <div
              className={`w-24 h-1 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}
            ></div>
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'}`}
            >
              2
            </div>
            <div
              className={`w-24 h-1 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-300'}`}
            ></div>
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'}`}
            >
              3
            </div>
          </div>
        </div>

        {/* Step 1: 基本設定 */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">基本設定</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  キャンペーン名 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="例：春の外壁塗装キャンペーン"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  説明
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="キャンペーンの目的や概要を入力"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    配信方法 *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        type: e.target.value as CampaignType,
                      }))
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="email">📧 メール配信</option>
                    <option value="sms">💬 SMS配信</option>
                    <option value="line">📱 LINE配信</option>
                    <option value="dm">📮 DM郵送</option>
                    <option value="web">🌐 Web広告</option>
                    <option value="event">🎪 イベント・展示会</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    予算
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        budget: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="100000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    開始日 *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    終了日 *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* 工事種別 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  対象工事種別
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {WORK_TYPES.map((type) => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.workTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData((prev) => ({
                              ...prev,
                              workTypes: [...prev.workTypes, type],
                            }));
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              workTypes: prev.workTypes.filter(
                                (t) => t !== type,
                              ),
                            }));
                          }
                        }}
                        className="rounded text-indigo-600"
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={() => setStep(2)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                次へ：ターゲット設定
              </button>
            </div>
          </div>
        )}

        {/* Step 2: ターゲット設定 */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">ターゲット設定</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  基本セグメント
                </label>
                <select
                  value={formData.targetSegment}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      targetSegment: e.target.value as TargetSegment,
                    }))
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">全顧客</option>
                  <option value="new">新規顧客（未施工）</option>
                  <option value="existing">既存顧客（施工済み）</option>
                  <option value="dormant">休眠顧客（2年以上接触なし）</option>
                  <option value="vip">VIP顧客（累計500万円以上）</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  詳細セグメント（建築業界特化）
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {CONSTRUCTION_SEGMENTS.map((segment) => (
                    <label
                      key={segment.value}
                      className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={formData.customSegments.includes(
                          segment.value,
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData((prev) => ({
                              ...prev,
                              customSegments: [
                                ...prev.customSegments,
                                segment.value,
                              ],
                            }));
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              customSegments: prev.customSegments.filter(
                                (s) => s !== segment.value,
                              ),
                            }));
                          }
                        }}
                        className="rounded text-indigo-600"
                      />
                      <span className="text-sm">{segment.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  年齢層
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    value={formData.ageRange.min}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        ageRange: {
                          ...prev.ageRange,
                          min: parseInt(e.target.value),
                        },
                      }))
                    }
                    className="w-20 px-3 py-2 border rounded-lg"
                    placeholder="30"
                  />
                  <span>〜</span>
                  <input
                    type="number"
                    value={formData.ageRange.max}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        ageRange: {
                          ...prev.ageRange,
                          max: parseInt(e.target.value),
                        },
                      }))
                    }
                    className="w-20 px-3 py-2 border rounded-lg"
                    placeholder="70"
                  />
                  <span className="text-sm text-gray-600">歳</span>
                </div>
              </div>

              {/* 推定リーチ数 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      推定リーチ数
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      選択した条件に該当する顧客数の推定値
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-900">
                      {calculateEstimatedReach()}
                    </p>
                    <p className="text-sm text-blue-700">件</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                戻る
              </button>
              <button
                onClick={() => setStep(3)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                次へ：メッセージ作成
              </button>
            </div>
          </div>
        )}

        {/* Step 3: メッセージ作成 */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">メッセージ作成</h2>

            {/* テンプレート選択 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                業界テンプレート（選択すると自動入力されます）
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(CONSTRUCTION_TEMPLATES).map(
                  ([key, template]) => (
                    <button
                      key={key}
                      onClick={() => applyTemplate(key)}
                      className={`p-3 border rounded-lg text-left hover:bg-gray-50 transition ${
                        selectedTemplate === key
                          ? 'border-indigo-500 bg-indigo-50'
                          : ''
                      }`}
                    >
                      <p className="font-medium text-sm">{template.name}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        クリックして適用
                      </p>
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  件名（メールの場合）
                </label>
                <input
                  type="text"
                  value={formData.content.subject}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      content: { ...prev.content, subject: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="例：【期間限定】春の外壁塗装キャンペーン実施中！"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  本文
                </label>
                <textarea
                  value={formData.content.body}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      content: { ...prev.content, body: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={12}
                  placeholder="メッセージ本文を入力..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CTAボタンテキスト
                  </label>
                  <input
                    type="text"
                    value={formData.content.ctaText}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        content: { ...prev.content, ctaText: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="例：無料見積もりを申し込む"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    リンク先URL
                  </label>
                  <input
                    type="url"
                    value={formData.content.ctaUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        content: { ...prev.content, ctaUrl: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://example.com/campaign"
                  />
                </div>
              </div>

              {/* プレビュー */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  プレビュー
                </p>
                <div className="bg-white border rounded p-4">
                  <p className="font-medium mb-2">
                    {formData.content.subject || '（件名）'}
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {formData.content.body || '（本文）'}
                  </p>
                  {formData.content.ctaText && (
                    <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded">
                      {formData.content.ctaText}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                戻る
              </button>
              <div className="space-x-3">
                <button
                  onClick={() => handleSubmit()}
                  className="px-6 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                >
                  下書き保存
                </button>
                <button
                  onClick={() => handleSubmit()}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  キャンペーンを作成
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
