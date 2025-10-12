'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Palette,
  FileText,
  CreditCard,
  Save,
  Eye,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { CompanyBranding } from '@/types/pdf-template';

export default function BrandingSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [branding, setBranding] = useState<CompanyBranding | null>(null);
  const [activeTab, setActiveTab] = useState<
    'company' | 'visual' | 'bank' | 'preview'
  >('company');

  useEffect(() => {
    loadBranding();
  }, []);

  const loadBranding = async () => {
    try {
      setLoading(true);
      const companyId = 'demo-tenant';
      const response = await fetch(`/api/pdf/branding?companyId=${companyId}`);

      if (response.ok) {
        const data = await response.json();
        setBranding(data.branding);
      }
    } catch (error) {
      console.error('ブランディング情報の読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!branding) return;

    try {
      setSaving(true);
      const companyId = 'demo-tenant';
      const response = await fetch(`/api/pdf/branding`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...branding,
          companyId,
        }),
      });

      if (response.ok) {
        alert('ブランディング設定を保存しました');
      } else {
        alert('保存に失敗しました');
      }
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存中にエラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  const updateBranding = (updates: Partial<CompanyBranding>) => {
    if (!branding) return;
    setBranding({ ...branding, ...updates });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!branding) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">ブランディング情報が見つかりません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  ブランディング設定
                </h1>
                <p className="text-sm text-gray-600">
                  PDF出力時の企業情報とデザインをカスタマイズ
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveTab('preview')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                プレビュー
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>

          {/* タブナビゲーション */}
          <div className="flex space-x-1 border-t">
            <button
              onClick={() => setActiveTab('company')}
              className={`px-4 py-3 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'company'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              企業情報
            </button>
            <button
              onClick={() => setActiveTab('visual')}
              className={`px-4 py-3 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'visual'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Palette className="w-4 h-4" />
              ビジュアル設定
            </button>
            <button
              onClick={() => setActiveTab('bank')}
              className={`px-4 py-3 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'bank'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              銀行口座情報
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-3 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'preview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              プレビュー
            </button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 企業情報タブ */}
        {activeTab === 'company' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                基本情報
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    会社名
                  </label>
                  <input
                    type="text"
                    value={branding.companyName}
                    onChange={(e) =>
                      updateBranding({ companyName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="株式会社〇〇"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    会社名（英語）
                  </label>
                  <input
                    type="text"
                    value={branding.companyNameEn || ''}
                    onChange={(e) =>
                      updateBranding({ companyNameEn: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Example Co., Ltd."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    住所
                  </label>
                  <input
                    type="text"
                    value={branding.address}
                    onChange={(e) =>
                      updateBranding({ address: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="東京都〇〇区..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    郵便番号
                  </label>
                  <input
                    type="text"
                    value={branding.postalCode}
                    onChange={(e) =>
                      updateBranding({ postalCode: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="100-0001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電話番号
                  </label>
                  <input
                    type="text"
                    value={branding.phone}
                    onChange={(e) => updateBranding({ phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="03-0000-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    FAX番号
                  </label>
                  <input
                    type="text"
                    value={branding.fax || ''}
                    onChange={(e) => updateBranding({ fax: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="03-0000-0001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={branding.email}
                    onChange={(e) => updateBranding({ email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="info@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ウェブサイト
                  </label>
                  <input
                    type="url"
                    value={branding.website || ''}
                    onChange={(e) =>
                      updateBranding({ website: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    法人番号
                  </label>
                  <input
                    type="text"
                    value={branding.registrationNumber || ''}
                    onChange={(e) =>
                      updateBranding({ registrationNumber: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1234567890123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    建設業許可番号
                  </label>
                  <input
                    type="text"
                    value={branding.licensePlate || ''}
                    onChange={(e) =>
                      updateBranding({ licensePlate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="〇〇県知事許可(般-1)第12345号"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ビジュアル設定タブ */}
        {activeTab === 'visual' && (
          <div className="space-y-6">
            {/* ロゴ設定 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                ロゴ設定
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ロゴ位置
                  </label>
                  <div className="flex gap-3">
                    {['left', 'center', 'right'].map((position) => (
                      <button
                        key={position}
                        onClick={() =>
                          updateBranding({
                            logoPosition: position as
                              | 'left'
                              | 'center'
                              | 'right',
                          })
                        }
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          branding.logoPosition === position
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {position === 'left'
                          ? '左寄せ'
                          : position === 'center'
                            ? '中央'
                            : '右寄せ'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ロゴURL（オプション）
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="url"
                      value={branding.logoUrl || ''}
                      onChange={(e) =>
                        updateBranding({ logoUrl: e.target.value })
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/logo.png"
                    />
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      アップロード
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* カラーテーマ */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                カラーテーマ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { key: 'primary', label: 'プライマリカラー' },
                  { key: 'secondary', label: 'セカンダリカラー' },
                  { key: 'accent', label: 'アクセントカラー' },
                  { key: 'text', label: 'テキストカラー' },
                  { key: 'background', label: '背景カラー' },
                  { key: 'border', label: 'ボーダーカラー' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={
                          branding.colorTheme[
                            key as keyof typeof branding.colorTheme
                          ]
                        }
                        onChange={(e) =>
                          updateBranding({
                            colorTheme: {
                              ...branding.colorTheme,
                              [key]: e.target.value,
                            },
                          })
                        }
                        className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={
                          branding.colorTheme[
                            key as keyof typeof branding.colorTheme
                          ]
                        }
                        onChange={(e) =>
                          updateBranding({
                            colorTheme: {
                              ...branding.colorTheme,
                              [key]: e.target.value,
                            },
                          })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* フォント設定 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                フォント設定
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メインフォント
                  </label>
                  <select
                    value={branding.primaryFont}
                    onChange={(e) =>
                      updateBranding({ primaryFont: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Noto Sans JP">Noto Sans JP</option>
                    <option value="Noto Serif JP">Noto Serif JP</option>
                    <option value="M PLUS 1p">M PLUS 1p</option>
                    <option value="M PLUS Rounded 1c">M PLUS Rounded 1c</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    サブフォント
                  </label>
                  <select
                    value={branding.secondaryFont}
                    onChange={(e) =>
                      updateBranding({ secondaryFont: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="system-ui">System UI</option>
                    <option value="sans-serif">Sans Serif</option>
                    <option value="serif">Serif</option>
                    <option value="monospace">Monospace</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: 'title', label: 'タイトル' },
                  { key: 'header', label: 'ヘッダー' },
                  { key: 'body', label: '本文' },
                  { key: 'small', label: '小文字' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label}サイズ (pt)
                    </label>
                    <input
                      type="number"
                      value={
                        branding.fontSize[key as keyof typeof branding.fontSize]
                      }
                      onChange={(e) =>
                        updateBranding({
                          fontSize: {
                            ...branding.fontSize,
                            [key]: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="8"
                      max="72"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 銀行口座情報タブ */}
        {activeTab === 'bank' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                振込先銀行口座
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    銀行名
                  </label>
                  <input
                    type="text"
                    value={branding.bankInfo?.bankName || ''}
                    onChange={(e) =>
                      updateBranding({
                        bankInfo: {
                          ...branding.bankInfo!,
                          bankName: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="〇〇銀行"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    支店名
                  </label>
                  <input
                    type="text"
                    value={branding.bankInfo?.branchName || ''}
                    onChange={(e) =>
                      updateBranding({
                        bankInfo: {
                          ...branding.bankInfo!,
                          branchName: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="〇〇支店"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    口座種別
                  </label>
                  <select
                    value={branding.bankInfo?.accountType || ''}
                    onChange={(e) =>
                      updateBranding({
                        bankInfo: {
                          ...branding.bankInfo!,
                          accountType: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="普通">普通</option>
                    <option value="当座">当座</option>
                    <option value="貯蓄">貯蓄</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    口座番号
                  </label>
                  <input
                    type="text"
                    value={branding.bankInfo?.accountNumber || ''}
                    onChange={(e) =>
                      updateBranding({
                        bankInfo: {
                          ...branding.bankInfo!,
                          accountNumber: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1234567"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    口座名義（カナ）
                  </label>
                  <input
                    type="text"
                    value={branding.bankInfo?.accountHolder || ''}
                    onChange={(e) =>
                      updateBranding({
                        bankInfo: {
                          ...branding.bankInfo!,
                          accountHolder: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="カ）〇〇〇〇"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* プレビュータブ */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                プレビュー
              </h2>
              <div className="border border-gray-200 rounded-lg p-8 bg-gray-50">
                <div className="bg-white p-8 rounded shadow-sm max-w-3xl mx-auto">
                  {/* ヘッダー */}
                  <div
                    className={`pb-4 mb-6 border-b-2`}
                    style={{ borderColor: branding.colorTheme.primary }}
                  >
                    <div
                      className={`text-${branding.logoPosition}`}
                      style={{
                        fontFamily: branding.primaryFont,
                        fontSize: `${branding.fontSize.title}pt`,
                        color: branding.colorTheme.primary,
                        fontWeight: 'bold',
                      }}
                    >
                      {branding.companyName}
                    </div>
                    {branding.companyNameEn && (
                      <div
                        className={`text-${branding.logoPosition} text-sm mt-1`}
                        style={{ color: branding.colorTheme.secondary }}
                      >
                        {branding.companyNameEn}
                      </div>
                    )}
                  </div>

                  {/* 企業情報 */}
                  <div
                    className="text-sm space-y-1"
                    style={{
                      fontFamily: branding.secondaryFont,
                      fontSize: `${branding.fontSize.body}pt`,
                      color: branding.colorTheme.text,
                    }}
                  >
                    <p>
                      〒{branding.postalCode} {branding.address}
                    </p>
                    <p>
                      TEL: {branding.phone}
                      {branding.fax && ` / FAX: ${branding.fax}`}
                    </p>
                    <p>Email: {branding.email}</p>
                    {branding.website && <p>Web: {branding.website}</p>}
                    {branding.registrationNumber && (
                      <p>法人番号: {branding.registrationNumber}</p>
                    )}
                    {branding.licensePlate && (
                      <p>建設業許可: {branding.licensePlate}</p>
                    )}
                  </div>

                  {/* 銀行口座情報 */}
                  {branding.bankInfo && (
                    <div className="mt-6 pt-6 border-t">
                      <div
                        className="font-semibold mb-2"
                        style={{
                          fontFamily: branding.primaryFont,
                          fontSize: `${branding.fontSize.header}pt`,
                          color: branding.colorTheme.primary,
                        }}
                      >
                        お振込先
                      </div>
                      <div
                        className="text-sm space-y-1"
                        style={{
                          fontFamily: branding.secondaryFont,
                          fontSize: `${branding.fontSize.body}pt`,
                          color: branding.colorTheme.text,
                        }}
                      >
                        <p>
                          {branding.bankInfo.bankName}{' '}
                          {branding.bankInfo.branchName}
                        </p>
                        <p>
                          {branding.bankInfo.accountType}{' '}
                          {branding.bankInfo.accountNumber}
                        </p>
                        <p>{branding.bankInfo.accountHolder}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
