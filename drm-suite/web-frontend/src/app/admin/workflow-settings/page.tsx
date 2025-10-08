'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChevronLeft,
  Save,
  FileText,
  ArrowRight,
  Settings,
  CheckCircle,
  XCircle,
  Workflow,
} from 'lucide-react';

interface WorkflowSettings {
  // 見積→契約変換設定
  autoConvertEnabled: boolean;
  defaultContractTemplate: string;
  // 項目マッピング
  mapEstimateItemsToContract: boolean;
  mapAmountToContract: boolean;
  mapDurationToContract: boolean;
  mapCustomerInfoToContract: boolean;
  // 承認設定
  requireApprovalForConversion: boolean;
  approvalFlowId: string;
}

export default function WorkflowSettingsPage() {
  const router = useRouter();
  const { user, isLoading, isSuperAdmin } = useAuth();
  const [settings, setSettings] = useState<WorkflowSettings>({
    autoConvertEnabled: true,
    defaultContractTemplate: 'construction',
    mapEstimateItemsToContract: true,
    mapAmountToContract: true,
    mapDurationToContract: true,
    mapCustomerInfoToContract: true,
    requireApprovalForConversion: true,
    approvalFlowId: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isLoading && !isSuperAdmin()) {
      router.push('/dashboard');
    }
  }, [user, isLoading, isSuperAdmin, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/workflow-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !isSuperAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const contractTemplates = [
    { id: 'construction', name: '建設工事請負契約' },
    { id: 'subcontract', name: '下請負契約' },
    { id: 'maintenance', name: '保守メンテナンス契約' },
    { id: 'lease', name: '建設機械リース契約' },
    { id: 'consulting', name: 'コンサルティング契約' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Workflow className="h-6 w-6 text-amber-500" />
                  業務フロー設定
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  見積から契約への自動変換設定
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? '保存中...' : '設定を保存'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {saved && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800">設定を保存しました</span>
          </div>
        )}

        {/* 見積→契約変換設定 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-500" />
            見積→契約 自動変換設定
          </h2>

          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoConvertEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, autoConvertEnabled: e.target.checked })
                }
                className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
              />
              <div>
                <div className="font-medium text-gray-900">自動変換を有効化</div>
                <div className="text-sm text-gray-600">
                  見積承認完了時に、自動的に契約書作成画面へ遷移
                </div>
              </div>
            </label>

            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                デフォルト契約テンプレート
              </label>
              <select
                value={settings.defaultContractTemplate}
                onChange={(e) =>
                  setSettings({ ...settings, defaultContractTemplate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                {contractTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-600">
                見積から契約書を作成する際のデフォルトテンプレート
              </p>
            </div>
          </div>
        </div>

        {/* 項目マッピング設定 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-amber-500" />
            項目マッピング設定
          </h2>

          <p className="text-sm text-gray-600 mb-4">
            見積から契約へ自動的にコピーする項目を選択してください
          </p>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.mapEstimateItemsToContract}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    mapEstimateItemsToContract: e.target.checked,
                  })
                }
                className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">見積項目 → 契約条項</div>
                <div className="text-sm text-gray-600">
                  見積の工事項目を契約書の条項として反映
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.mapAmountToContract}
                onChange={(e) =>
                  setSettings({ ...settings, mapAmountToContract: e.target.checked })
                }
                className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">契約金額の自動反映</div>
                <div className="text-sm text-gray-600">
                  見積金額を契約金額として自動設定
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.mapDurationToContract}
                onChange={(e) =>
                  setSettings({ ...settings, mapDurationToContract: e.target.checked })
                }
                className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">工期の自動反映</div>
                <div className="text-sm text-gray-600">
                  見積の工期を契約の工期として設定
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.mapCustomerInfoToContract}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    mapCustomerInfoToContract: e.target.checked,
                  })
                }
                className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">顧客情報の自動反映</div>
                <div className="text-sm text-gray-600">
                  見積の顧客情報を契約書に自動入力
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* 承認設定 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-amber-500" />
            承認フロー設定
          </h2>

          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requireApprovalForConversion}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    requireApprovalForConversion: e.target.checked,
                  })
                }
                className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
              />
              <div>
                <div className="font-medium text-gray-900">
                  契約書作成時に承認を必須化
                </div>
                <div className="text-sm text-gray-600">
                  見積から契約書を作成する際、承認フローを経由させる
                </div>
              </div>
            </label>

            {settings.requireApprovalForConversion && (
              <div className="ml-8 border-l-2 border-amber-200 pl-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  承認フロー選択
                </label>
                <select
                  value={settings.approvalFlowId}
                  onChange={(e) =>
                    setSettings({ ...settings, approvalFlowId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">承認フローを選択してください</option>
                  <option value="contract-basic">契約書承認（基本）</option>
                  <option value="contract-advanced">契約書承認（詳細）</option>
                  <option value="contract-executive">契約書承認（役員）</option>
                </select>
                <p className="mt-2 text-sm text-gray-600">
                  契約書作成時に使用する承認フローを設定
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
