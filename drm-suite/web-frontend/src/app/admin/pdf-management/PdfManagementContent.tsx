'use client';

import React, { useState } from 'react';
import {
  Settings,
  Building2,
  FileText,
  Folder,
  Eye,
  Menu,
  Palette,
  Upload,
} from 'lucide-react';
import CompanyBrandingManager from '@/components/pdf/CompanyBrandingManager';
import PdfTemplateManager from '@/components/pdf/PdfTemplateManager';
import AssetManager from '@/components/pdf/AssetManager';
import { PdfTemplate, CompanyBranding } from '@/types/pdf-template';

type TabType = 'branding' | 'templates' | 'assets' | 'settings';

export default function PdfManagementContent() {
  const [activeTab, setActiveTab] = useState<TabType>('branding');
  const [selectedTemplate, setSelectedTemplate] = useState<PdfTemplate | null>(
    null,
  );
  const [branding, setBranding] = useState<CompanyBranding | null>(null);

  // 模拟企業ID（実際にはユーザー認証から取得）
  const companyId = 'company_1';

  const tabs = [
    {
      id: 'branding' as TabType,
      label: '企業ブランディング',
      icon: Building2,
      description: '会社ロゴ、カラーテーマ、連絡先情報の管理',
    },
    {
      id: 'templates' as TabType,
      label: 'PDFテンプレート',
      icon: FileText,
      description: '見積書、請求書などのテンプレート管理',
    },
    {
      id: 'assets' as TabType,
      label: 'アセット管理',
      icon: Folder,
      description: 'ロゴ、印鑑、署名画像などのファイル管理',
    },
    {
      id: 'settings' as TabType,
      label: '全体設定',
      icon: Settings,
      description: 'PDF生成の全体設定と権限管理',
    },
  ];

  const handleBrandingUpdate = (updatedBranding: CompanyBranding) => {
    setBranding(updatedBranding);
  };

  const handleTemplateEdit = (template: PdfTemplate) => {
    setSelectedTemplate(template);
    // 実際にはテンプレート編集画面に遷移
    console.log('Edit template:', template);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  PDF管理システム
                </h1>
                <p className="text-sm text-gray-600">
                  多テナント対応PDFテンプレート管理
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">企業ID: {companyId}</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* サイドバー */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="font-semibold text-gray-900 flex items-center">
                  <Menu className="w-5 h-5 mr-2" />
                  管理メニュー
                </h2>
              </div>
              <nav className="space-y-1 p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-3 py-3 rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start">
                        <Icon
                          className={`w-5 h-5 mr-3 mt-0.5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}
                        />
                        <div>
                          <div className="font-medium">{tab.label}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {tab.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* 統計情報 */}
            <div className="mt-6 bg-white rounded-lg border p-4">
              <h3 className="font-semibold text-gray-900 mb-3">統計情報</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    アクティブテンプレート
                  </span>
                  <span className="text-sm font-medium">12件</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">総アセット数</span>
                  <span className="text-sm font-medium">38件</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">今月のPDF生成</span>
                  <span className="text-sm font-medium">247件</span>
                </div>
              </div>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border min-h-[600px]">
              {/* タブコンテンツ */}
              <div className="p-6">
                {activeTab === 'branding' && (
                  <CompanyBrandingManager
                    companyId={companyId}
                    onBrandingUpdate={handleBrandingUpdate}
                  />
                )}

                {activeTab === 'templates' && (
                  <PdfTemplateManager
                    companyId={companyId}
                    onTemplateEdit={handleTemplateEdit}
                  />
                )}

                {activeTab === 'assets' && (
                  <AssetManager
                    companyId={companyId}
                    allowedTypes={[
                      'image/png',
                      'image/jpeg',
                      'image/gif',
                      'image/svg+xml',
                    ]}
                    maxFileSize={10}
                  />
                )}

                {activeTab === 'settings' && (
                  <PdfSettingsPanel companyId={companyId} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// PDF設定パネル
function PdfSettingsPanel({ companyId }: { companyId: string }) {
  const [settings, setSettings] = useState({
    defaultFormat: 'pdf' as 'pdf' | 'html',
    compression: 'medium' as 'none' | 'low' | 'medium' | 'high',
    maxFileSize: 50,
    watermarkEnabled: false,
    passwordProtection: false,
    autoBackup: true,
    retentionPeriod: 365,
  });

  const handleSave = async () => {
    try {
      // 実際の実装ではAPIに保存
      console.log('Settings saved:', settings);
      alert('設定を保存しました');
    } catch (error) {
      console.error('設定保存エラー:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">PDF生成設定</h2>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          設定を保存
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 基本設定 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">基本設定</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                デフォルト出力形式
              </label>
              <select
                value={settings.defaultFormat}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    defaultFormat: e.target.value as any,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pdf">PDF</option>
                <option value="html">HTML</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                圧縮レベル
              </label>
              <select
                value={settings.compression}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    compression: e.target.value as any,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">圧縮なし</option>
                <option value="low">低圧縮</option>
                <option value="medium">中圧縮</option>
                <option value="high">高圧縮</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最大ファイルサイズ (MB)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={settings.maxFileSize}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    maxFileSize: parseInt(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* セキュリティ設定 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">セキュリティ設定</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  ウォーターマーク
                </label>
                <p className="text-xs text-gray-500">
                  PDF にウォーターマークを追加
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.watermarkEnabled}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    watermarkEnabled: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  パスワード保護
                </label>
                <p className="text-xs text-gray-500">PDF をパスワードで保護</p>
              </div>
              <input
                type="checkbox"
                checked={settings.passwordProtection}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    passwordProtection: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  自動バックアップ
                </label>
                <p className="text-xs text-gray-500">
                  テンプレートを自動バックアップ
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    autoBackup: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                データ保持期間 (日)
              </label>
              <input
                type="number"
                min="30"
                max="3650"
                value={settings.retentionPeriod}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    retentionPeriod: parseInt(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 権限管理 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">権限管理</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-4 text-xs font-medium text-gray-500 uppercase">
              <div>ロール</div>
              <div>編集</div>
              <div>印刷</div>
              <div>DL</div>
            </div>
            {[
              { role: '管理者', edit: true, print: true, download: true },
              { role: 'マネージャー', edit: true, print: true, download: true },
              { role: '営業', edit: false, print: true, download: true },
              { role: '経理', edit: false, print: true, download: false },
            ].map((perm, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 items-center">
                <div className="text-sm text-gray-900">{perm.role}</div>
                <input
                  type="checkbox"
                  defaultChecked={perm.edit}
                  className="h-4 w-4 text-blue-600"
                />
                <input
                  type="checkbox"
                  defaultChecked={perm.print}
                  className="h-4 w-4 text-blue-600"
                />
                <input
                  type="checkbox"
                  defaultChecked={perm.download}
                  className="h-4 w-4 text-blue-600"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 統計・ログ */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">統計・ログ</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">247</div>
                <div className="text-xs text-gray-500">今月の生成数</div>
              </div>
              <div className="bg-white rounded p-3 text-center">
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-xs text-gray-500">
                  アクティブテンプレート
                </div>
              </div>
            </div>
            <button className="w-full px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50">
              詳細ログを表示
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
