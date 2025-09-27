'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Upload,
  Palette,
  Save,
  Eye,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
  Stamp
} from 'lucide-react';
import { CompanyBranding, CompanyBrandingResponse } from '@/types/pdf-template';

interface CompanyBrandingManagerProps {
  companyId: string;
  onBrandingUpdate?: (branding: CompanyBranding) => void;
}

export default function CompanyBrandingManager({
  companyId,
  onBrandingUpdate
}: CompanyBrandingManagerProps) {
  const [branding, setBranding] = useState<CompanyBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // フォーム状態
  const [formData, setFormData] = useState<Partial<CompanyBranding>>({});

  useEffect(() => {
    loadBranding();
  }, [companyId]);

  const loadBranding = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pdf/branding?companyId=${companyId}`);

      if (response.ok) {
        const data: CompanyBrandingResponse = await response.json();
        setBranding(data.branding);
        setFormData(data.branding);
      }
    } catch (error) {
      console.error('ブランディング情報の読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const method = branding ? 'PUT' : 'POST';
      const response = await fetch('/api/pdf/branding', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, companyId })
      });

      if (response.ok) {
        const data: CompanyBrandingResponse = await response.json();
        setBranding(data.branding);
        setFormData(data.branding);
        onBrandingUpdate?.(data.branding);
      }
    } catch (error) {
      console.error('ブランディング情報の保存エラー:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parentField: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField as keyof CompanyBranding] as any),
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Building2 className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">企業ブランディング管理</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? '編集モード' : 'プレビュー'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            保存
          </button>
        </div>
      </div>

      {previewMode ? (
        <BrandingPreview branding={formData as CompanyBranding} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 基本企業情報 */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              基本企業情報
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  会社名
                </label>
                <input
                  type="text"
                  value={formData.companyName || ''}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="株式会社〇〇"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  会社名（英語）
                </label>
                <input
                  type="text"
                  value={formData.companyNameEn || ''}
                  onChange={(e) => handleInputChange('companyNameEn', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Company Name Co., Ltd."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  住所
                </label>
                <textarea
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="〒000-0000 東京都〇〇区〇〇 1-2-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    郵便番号
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode || ''}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="000-0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="w-4 h-4 inline mr-1" />
                    電話番号
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="03-0000-0000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="info@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Globe className="w-4 h-4 inline mr-1" />
                    ウェブサイト
                  </label>
                  <input
                    type="url"
                    value={formData.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://company.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ロゴ・ビジュアル設定 */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              ロゴ・ビジュアル設定
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ロゴ画像URL
                </label>
                <input
                  type="url"
                  value={formData.logoUrl || ''}
                  onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ロゴ幅
                  </label>
                  <input
                    type="number"
                    value={formData.logoWidth || 150}
                    onChange={(e) => handleInputChange('logoWidth', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ロゴ高さ
                  </label>
                  <input
                    type="number"
                    value={formData.logoHeight || 60}
                    onChange={(e) => handleInputChange('logoHeight', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ロゴ位置
                  </label>
                  <select
                    value={formData.logoPosition || 'left'}
                    onChange={(e) => handleInputChange('logoPosition', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="left">左</option>
                    <option value="center">中央</option>
                    <option value="right">右</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Stamp className="w-4 h-4 inline mr-1" />
                  印鑑画像URL
                </label>
                <input
                  type="url"
                  value={formData.sealImageUrl || ''}
                  onChange={(e) => handleInputChange('sealImageUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/seal.png"
                />
              </div>
            </div>
          </div>

          {/* カラーテーマ設定 */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              カラーテーマ
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'primary', label: 'プライマリー', defaultValue: '#2563eb' },
                { key: 'secondary', label: 'セカンダリー', defaultValue: '#64748b' },
                { key: 'accent', label: 'アクセント', defaultValue: '#f59e0b' },
                { key: 'text', label: 'テキスト', defaultValue: '#1f2937' },
                { key: 'background', label: '背景', defaultValue: '#ffffff' },
                { key: 'border', label: 'ボーダー', defaultValue: '#e5e7eb' }
              ].map(({ key, label, defaultValue }) => (
                <div key={key} className="flex items-center space-x-2">
                  <label className="block text-sm font-medium text-gray-700 flex-1">
                    {label}
                  </label>
                  <input
                    type="color"
                    value={formData.colorTheme?.[key as keyof typeof formData.colorTheme] || defaultValue}
                    onChange={(e) => handleNestedInputChange('colorTheme', key, e.target.value)}
                    className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* フォント設定 */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              フォント設定
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メインフォント
                  </label>
                  <select
                    value={formData.primaryFont || 'Noto Sans JP'}
                    onChange={(e) => handleInputChange('primaryFont', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Noto Sans JP">Noto Sans JP</option>
                    <option value="Hiragino Sans">ヒラギノ角ゴ</option>
                    <option value="Yu Gothic">游ゴシック</option>
                    <option value="Meiryo">メイリオ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    サブフォント
                  </label>
                  <select
                    value={formData.secondaryFont || 'system-ui'}
                    onChange={(e) => handleInputChange('secondaryFont', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="system-ui">システムフォント</option>
                    <option value="serif">明朝体</option>
                    <option value="monospace">等幅フォント</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {[
                  { key: 'title', label: 'タイトル', defaultValue: 24 },
                  { key: 'header', label: 'ヘッダー', defaultValue: 18 },
                  { key: 'body', label: '本文', defaultValue: 12 },
                  { key: 'small', label: '小文字', defaultValue: 10 }
                ].map(({ key, label, defaultValue }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {label}
                    </label>
                    <input
                      type="number"
                      value={formData.fontSize?.[key as keyof typeof formData.fontSize] || defaultValue}
                      onChange={(e) => handleNestedInputChange('fontSize', key, parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="8"
                      max="48"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// プレビューコンポーネント
function BrandingPreview({ branding }: { branding: CompanyBranding }) {
  if (!branding) return null;

  return (
    <div className="bg-white border rounded-lg p-8" style={{
      fontFamily: branding.primaryFont,
      color: branding.colorTheme?.text
    }}>
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className={`flex items-center mb-8 ${
          branding.logoPosition === 'center' ? 'justify-center' :
          branding.logoPosition === 'right' ? 'justify-end' : 'justify-start'
        }`}>
          {branding.logoUrl && (
            <img
              src={branding.logoUrl}
              alt="Company Logo"
              style={{
                width: branding.logoWidth || 150,
                height: branding.logoHeight || 60,
                objectFit: 'contain'
              }}
              className="mr-4"
            />
          )}
          <div>
            <h1 style={{
              fontSize: branding.fontSize?.title,
              color: branding.colorTheme?.primary
            }}>
              {branding.companyName || '会社名'}
            </h1>
            {branding.companyNameEn && (
              <p style={{ fontSize: branding.fontSize?.body }}>
                {branding.companyNameEn}
              </p>
            )}
          </div>
        </div>

        {/* 会社情報 */}
        <div className="space-y-2 mb-8" style={{ fontSize: branding.fontSize?.body }}>
          {branding.address && <p>{branding.address}</p>}
          <div className="flex flex-wrap gap-4">
            {branding.phone && <span>TEL: {branding.phone}</span>}
            {branding.fax && <span>FAX: {branding.fax}</span>}
            {branding.email && <span>E-mail: {branding.email}</span>}
          </div>
          {branding.website && <p>URL: {branding.website}</p>}
        </div>

        {/* サンプル文書 */}
        <div className="border-t pt-8" style={{ borderColor: branding.colorTheme?.border }}>
          <h2 style={{
            fontSize: branding.fontSize?.header,
            color: branding.colorTheme?.primary,
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            見積書
          </h2>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 style={{ fontSize: branding.fontSize?.header }}>お客様情報</h3>
              <div style={{ fontSize: branding.fontSize?.body }}>
                <p>株式会社サンプル</p>
                <p>東京都渋谷区〇〇 1-2-3</p>
              </div>
            </div>
            <div className="text-right">
              <p style={{ fontSize: branding.fontSize?.body }}>
                見積書番号: EST-2024-001<br />
                作成日: 2024年3月15日<br />
                有効期限: 2024年4月15日
              </p>
            </div>
          </div>

          {/* サンプルテーブル */}
          <table className="w-full mb-8" style={{ fontSize: branding.fontSize?.body }}>
            <thead>
              <tr style={{ backgroundColor: branding.colorTheme?.primary, color: 'white' }}>
                <th className="p-2 text-left">項目</th>
                <th className="p-2 text-right">数量</th>
                <th className="p-2 text-right">単価</th>
                <th className="p-2 text-right">金額</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: `1px solid ${branding.colorTheme?.border}` }}>
                <td className="p-2">サンプル工事</td>
                <td className="p-2 text-right">1</td>
                <td className="p-2 text-right">¥100,000</td>
                <td className="p-2 text-right">¥100,000</td>
              </tr>
            </tbody>
          </table>

          <div className="text-right mb-8">
            <div style={{ fontSize: branding.fontSize?.body }}>
              <p>小計: ¥100,000</p>
              <p>消費税(10%): ¥10,000</p>
              <p style={{
                fontSize: branding.fontSize?.header,
                fontWeight: 'bold',
                color: branding.colorTheme?.primary
              }}>
                合計: ¥110,000
              </p>
            </div>
          </div>

          {/* 印鑑エリア */}
          {branding.sealImageUrl && (
            <div className="text-right">
              <img
                src={branding.sealImageUrl}
                alt="Company Seal"
                className="inline-block"
                style={{ width: 60, height: 60 }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}