'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'radio' | 'checkbox';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

interface LeadForm {
  id: string;
  name: string;
  title: string;
  description: string;
  fields: FormField[];
  styling: {
    primaryColor: string;
    backgroundColor: string;
    fontFamily: string;
    borderRadius: string;
  };
  settings: {
    redirectUrl: string;
    notificationEmail: string;
    autoResponse: boolean;
    autoResponseMessage: string;
  };
}

export default function LeadFormBuilderPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    'fields' | 'design' | 'settings' | 'preview'
  >('fields');

  const [form, setForm] = useState<LeadForm>({
    id: '',
    name: '新規リード獲得フォーム',
    title: '無料お見積もり依頼',
    description:
      'お気軽にお見積もりをご依頼ください。専門スタッフが迅速に対応いたします。',
    fields: [
      {
        id: '1',
        type: 'text',
        label: 'お名前',
        placeholder: '山田太郎',
        required: true,
      },
      {
        id: '2',
        type: 'email',
        label: 'メールアドレス',
        placeholder: 'taro@example.com',
        required: true,
      },
      {
        id: '3',
        type: 'tel',
        label: '電話番号',
        placeholder: '090-1234-5678',
        required: false,
      },
    ],
    styling: {
      primaryColor: '#4F46E5',
      backgroundColor: '#FFFFFF',
      fontFamily: 'system-ui',
      borderRadius: '8px',
    },
    settings: {
      redirectUrl: '/thanks',
      notificationEmail: 'marketing@company.com',
      autoResponse: true,
      autoResponseMessage:
        'お問い合わせありがとうございます。担当者より24時間以内にご連絡いたします。',
    },
  });

  const [draggedField, setDraggedField] = useState<FormField | null>(null);

  const fieldTypes = [
    { type: 'text', label: '📝 テキスト入力', icon: '📝' },
    { type: 'email', label: '📧 メールアドレス', icon: '📧' },
    { type: 'tel', label: '📞 電話番号', icon: '📞' },
    { type: 'textarea', label: '📄 長文テキスト', icon: '📄' },
    { type: 'select', label: '📋 選択肢（ドロップダウン）', icon: '📋' },
    { type: 'radio', label: '🔘 選択肢（単一選択）', icon: '🔘' },
    { type: 'checkbox', label: '☑️ チェックボックス', icon: '☑️' },
  ];

  const constructionTemplates = [
    {
      name: '外壁塗装見積もり',
      fields: [
        { id: '1', type: 'text' as const, label: 'お名前', required: true },
        {
          id: '2',
          type: 'email' as const,
          label: 'メールアドレス',
          required: true,
        },
        { id: '3', type: 'tel' as const, label: '電話番号', required: true },
        { id: '4', type: 'text' as const, label: 'ご住所', required: true },
        {
          id: '5',
          type: 'select' as const,
          label: '建物種別',
          required: true,
          options: ['戸建て', 'アパート', 'マンション', 'その他'],
        },
        {
          id: '6',
          type: 'select' as const,
          label: '築年数',
          required: false,
          options: ['5年未満', '5-10年', '10-15年', '15-20年', '20年以上'],
        },
        {
          id: '7',
          type: 'textarea' as const,
          label: 'お困りの症状・ご要望',
          required: false,
        },
      ],
    },
    {
      name: 'リフォーム相談',
      fields: [
        { id: '1', type: 'text' as const, label: 'お名前', required: true },
        {
          id: '2',
          type: 'email' as const,
          label: 'メールアドレス',
          required: true,
        },
        { id: '3', type: 'tel' as const, label: '電話番号', required: true },
        {
          id: '4',
          type: 'select' as const,
          label: 'リフォーム箇所',
          required: true,
          options: [
            'キッチン',
            '浴室',
            'トイレ',
            '洗面所',
            'リビング',
            '寝室',
            '外壁・屋根',
            'その他',
          ],
        },
        {
          id: '5',
          type: 'select' as const,
          label: '予算',
          required: false,
          options: [
            '50万円未満',
            '50-100万円',
            '100-300万円',
            '300-500万円',
            '500万円以上',
          ],
        },
        {
          id: '6',
          type: 'textarea' as const,
          label: 'ご希望・ご要望',
          required: false,
        },
      ],
    },
  ];

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: Date.now().toString(),
      type,
      label: `新しい${fieldTypes.find((f) => f.type === type)?.label}`,
      placeholder: '',
      required: false,
      options:
        type === 'select' || type === 'radio'
          ? ['選択肢1', '選択肢2']
          : undefined,
    };
    setForm((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field,
      ),
    }));
  };

  const removeField = (id: string) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.filter((field) => field.id !== id),
    }));
  };

  const applyTemplate = (template: (typeof constructionTemplates)[0]) => {
    setForm((prev) => ({
      ...prev,
      name: template.name + 'フォーム',
      title: template.name + 'のお問い合わせ',
      fields: template.fields,
    }));
  };

  const saveForm = async () => {
    // フォーム保存のロジック
    console.log('Form saved:', form);
    alert('フォームが保存されました！');
  };

  const publishForm = async () => {
    // フォーム公開のロジック
    console.log('Form published:', form);
    alert('フォームが公開されました！');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-500 hover:text-gray-700"
              >
                ← ダッシュボードに戻る
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                📝 リード獲得フォーム作成
              </h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={saveForm}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                💾 保存
              </button>
              <button
                onClick={publishForm}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                🚀 公開
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左サイドバー - フォーム設定 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              {/* タブ */}
              <div className="border-b">
                <div className="flex">
                  {[
                    { key: 'fields', label: 'フィールド', icon: '📝' },
                    { key: 'design', label: 'デザイン', icon: '🎨' },
                    { key: 'settings', label: '設定', icon: '⚙️' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${
                        activeTab === tab.key
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {/* フィールド設定 */}
                {activeTab === 'fields' && (
                  <div className="space-y-6">
                    {/* テンプレート */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">
                        🏗️ 建築業界テンプレート
                      </h3>
                      <div className="space-y-2">
                        {constructionTemplates.map((template, idx) => (
                          <button
                            key={idx}
                            onClick={() => applyTemplate(template)}
                            className="w-full p-3 text-left border rounded-lg hover:bg-gray-50"
                          >
                            <p className="font-medium">{template.name}</p>
                            <p className="text-sm text-gray-600">
                              {template.fields.length}個のフィールド
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* フィールド追加 */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">
                        フィールドを追加
                      </h3>
                      <div className="space-y-2">
                        {fieldTypes.map((fieldType) => (
                          <button
                            key={fieldType.type}
                            onClick={() => addField(fieldType.type)}
                            className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <span>{fieldType.icon}</span>
                            <span className="text-sm">{fieldType.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* デザイン設定 */}
                {activeTab === 'design' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        プライマリーカラー
                      </label>
                      <input
                        type="color"
                        value={form.styling.primaryColor}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            styling: {
                              ...prev.styling,
                              primaryColor: e.target.value,
                            },
                          }))
                        }
                        className="w-full h-10 border rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        背景色
                      </label>
                      <input
                        type="color"
                        value={form.styling.backgroundColor}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            styling: {
                              ...prev.styling,
                              backgroundColor: e.target.value,
                            },
                          }))
                        }
                        className="w-full h-10 border rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        フォントファミリー
                      </label>
                      <select
                        value={form.styling.fontFamily}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            styling: {
                              ...prev.styling,
                              fontFamily: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-2 border rounded"
                      >
                        <option value="system-ui">システムフォント</option>
                        <option value="serif">明朝体</option>
                        <option value="sans-serif">ゴシック体</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        角の丸み
                      </label>
                      <select
                        value={form.styling.borderRadius}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            styling: {
                              ...prev.styling,
                              borderRadius: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-2 border rounded"
                      >
                        <option value="0px">角ばった</option>
                        <option value="4px">少し丸い</option>
                        <option value="8px">丸い</option>
                        <option value="16px">とても丸い</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 設定 */}
                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        送信後のリダイレクトURL
                      </label>
                      <input
                        type="url"
                        value={form.settings.redirectUrl}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            settings: {
                              ...prev.settings,
                              redirectUrl: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-2 border rounded"
                        placeholder="https://example.com/thanks"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        通知メールアドレス
                      </label>
                      <input
                        type="email"
                        value={form.settings.notificationEmail}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            settings: {
                              ...prev.settings,
                              notificationEmail: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-2 border rounded"
                        placeholder="marketing@company.com"
                      />
                    </div>

                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={form.settings.autoResponse}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              settings: {
                                ...prev.settings,
                                autoResponse: e.target.checked,
                              },
                            }))
                          }
                          className="rounded"
                        />
                        <span className="text-sm font-medium">
                          自動返信メールを送信
                        </span>
                      </label>
                    </div>

                    {form.settings.autoResponse && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          自動返信メッセージ
                        </label>
                        <textarea
                          value={form.settings.autoResponseMessage}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              settings: {
                                ...prev.settings,
                                autoResponseMessage: e.target.value,
                              },
                            }))
                          }
                          rows={4}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* メインエリア - フォームプレビュー */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium">フォームプレビュー</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveTab('preview')}
                      className="px-3 py-1 text-sm bg-gray-100 rounded"
                    >
                      👁️ プレビュー
                    </button>
                    <button className="px-3 py-1 text-sm bg-gray-100 rounded">
                      📱 モバイル表示
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div
                  className="max-w-2xl mx-auto p-8 rounded-lg border"
                  style={{
                    backgroundColor: form.styling.backgroundColor,
                    borderRadius: form.styling.borderRadius,
                    fontFamily: form.styling.fontFamily,
                  }}
                >
                  {/* フォームヘッダー */}
                  <div className="mb-6 text-center">
                    <h2
                      className="text-2xl font-bold mb-2"
                      style={{ color: form.styling.primaryColor }}
                    >
                      {form.title}
                    </h2>
                    <p className="text-gray-600">{form.description}</p>
                  </div>

                  {/* フィールド一覧 */}
                  <div className="space-y-4">
                    {form.fields.map((field, index) => (
                      <div key={field.id} className="group relative">
                        <label className="block text-sm font-medium mb-1">
                          {field.label}
                          {field.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>

                        {/* フィールド編集ボタン */}
                        <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => {
                                const label = prompt(
                                  'フィールド名を入力:',
                                  field.label,
                                );
                                if (label) updateField(field.id, { label });
                              }}
                              className="p-1 bg-blue-500 text-white rounded text-xs"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => removeField(field.id)}
                              className="p-1 bg-red-500 text-white rounded text-xs"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        {/* フィールドレンダリング */}
                        {field.type === 'textarea' ? (
                          <textarea
                            placeholder={field.placeholder}
                            rows={3}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-opacity-50"
                            style={{
                              borderRadius: form.styling.borderRadius,
                              focusRingColor: form.styling.primaryColor,
                            }}
                            disabled
                          />
                        ) : field.type === 'select' ? (
                          <select
                            className="w-full p-2 border rounded"
                            style={{ borderRadius: form.styling.borderRadius }}
                            disabled
                          >
                            <option>選択してください</option>
                            {field.options?.map((option, i) => (
                              <option key={i}>{option}</option>
                            ))}
                          </select>
                        ) : field.type === 'radio' ? (
                          <div className="space-y-2">
                            {field.options?.map((option, i) => (
                              <label key={i} className="flex items-center">
                                <input
                                  type="radio"
                                  name={field.id}
                                  className="mr-2"
                                  disabled
                                />
                                {option}
                              </label>
                            ))}
                          </div>
                        ) : field.type === 'checkbox' ? (
                          <div className="space-y-2">
                            {field.options?.map((option, i) => (
                              <label key={i} className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="mr-2"
                                  disabled
                                />
                                {option}
                              </label>
                            ))}
                          </div>
                        ) : (
                          <input
                            type={field.type}
                            placeholder={field.placeholder}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-opacity-50"
                            style={{
                              borderRadius: form.styling.borderRadius,
                              focusRingColor: form.styling.primaryColor,
                            }}
                            disabled
                          />
                        )}
                      </div>
                    ))}

                    {/* 送信ボタン */}
                    <button
                      className="w-full py-3 px-6 text-white font-medium rounded-lg"
                      style={{
                        backgroundColor: form.styling.primaryColor,
                        borderRadius: form.styling.borderRadius,
                      }}
                      disabled
                    >
                      送信する
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
