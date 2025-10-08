'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChevronLeft,
  Save,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Percent,
  Eye,
  Settings,
} from 'lucide-react';

interface CostSettings {
  // アラート閾値
  costOverrunThreshold: number;
  profitMarginWarningThreshold: number;
  scheduleDelayThreshold: number;
  // 自動承認条件
  autoApprovalEnabled: boolean;
  autoApprovalProfitMargin: number;
  // 差分管理
  differenceUnit: 'yen' | 'thousand' | 'million';
  positiveColor: string;
  negativeColor: string;
  neutralRange: number;
  neutralColor: string;
  // 表示設定
  showPredictedProfit: boolean;
  showCostBreakdown: boolean;
  highlightRiskyProjects: boolean;
}

export default function CostSettingsPage() {
  const router = useRouter();
  const { user, isLoading, isSuperAdmin } = useAuth();
  const [settings, setSettings] = useState<CostSettings>({
    costOverrunThreshold: 10,
    profitMarginWarningThreshold: 5,
    scheduleDelayThreshold: 7,
    autoApprovalEnabled: true,
    autoApprovalProfitMargin: 15,
    differenceUnit: 'yen',
    positiveColor: 'green',
    negativeColor: 'red',
    neutralRange: 3,
    neutralColor: 'yellow',
    showPredictedProfit: true,
    showCostBreakdown: true,
    highlightRiskyProjects: true,
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
      const response = await fetch('/api/admin/cost-settings', {
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

  const unitOptions = [
    { value: 'yen', label: '円' },
    { value: 'thousand', label: '千円' },
    { value: 'million', label: '百万円' },
  ];

  const colorOptions = [
    { value: 'green', label: '緑', class: 'bg-green-500' },
    { value: 'blue', label: '青', class: 'bg-blue-500' },
    { value: 'red', label: '赤', class: 'bg-red-500' },
    { value: 'yellow', label: '黄色', class: 'bg-yellow-500' },
    { value: 'orange', label: 'オレンジ', class: 'bg-orange-500' },
    { value: 'purple', label: '紫', class: 'bg-purple-500' },
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
                  <DollarSign className="h-6 w-6 text-emerald-500" />
                  原価管理設定
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  アラート閾値、差分管理、表示設定
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
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

        {/* アラート閾値設定 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-emerald-500" />
            アラート閾値設定
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                原価超過アラート
              </label>
              <div className="flex items-center gap-3">
                <span className="text-gray-600">予定原価の</span>
                <input
                  type="number"
                  value={settings.costOverrunThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      costOverrunThreshold: parseInt(e.target.value) || 10,
                    })
                  }
                  min="1"
                  max="50"
                  className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <span className="text-gray-600">% 超過でアラート</span>
              </div>
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  例: 予定原価 ¥10,000,000 の場合、¥11,000,000（110%）を超えるとアラート
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                利益率低下アラート
              </label>
              <div className="flex items-center gap-3">
                <span className="text-gray-600">粗利率が</span>
                <input
                  type="number"
                  value={settings.profitMarginWarningThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      profitMarginWarningThreshold: parseInt(e.target.value) || 5,
                    })
                  }
                  min="0"
                  max="30"
                  className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <span className="text-gray-600">% 未満でアラート</span>
              </div>
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  例: 粗利率が 4.8% まで低下した場合、アラート表示
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                スケジュール遅延アラート
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={settings.scheduleDelayThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      scheduleDelayThreshold: parseInt(e.target.value) || 7,
                    })
                  }
                  min="1"
                  max="30"
                  className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <span className="text-gray-600">日以上の遅延でアラート</span>
              </div>
            </div>
          </div>
        </div>

        {/* 自動承認条件 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            自動承認条件
          </h2>

          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoApprovalEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, autoApprovalEnabled: e.target.checked })
                }
                className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
              />
              <div>
                <div className="font-medium text-gray-900">
                  利益率による自動承認を有効化
                </div>
                <div className="text-sm text-gray-600">
                  設定した利益率以上の案件は自動承認
                </div>
              </div>
            </label>

            {settings.autoApprovalEnabled && (
              <div className="ml-12 border-l-2 border-emerald-200 pl-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自動承認の利益率基準
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">粗利率が</span>
                  <input
                    type="number"
                    value={settings.autoApprovalProfitMargin}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        autoApprovalProfitMargin: parseInt(e.target.value) || 15,
                      })
                    }
                    min="0"
                    max="50"
                    className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <span className="text-gray-600">% 以上で自動承認</span>
                </div>
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-sm text-emerald-800">
                    例: 粗利率が 18% の案件は承認フローをスキップして自動承認
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 差分管理設定 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            差分管理設定
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                差分表示単位
              </label>
              <select
                value={settings.differenceUnit}
                onChange={(e) =>
                  setSettings({ ...settings, differenceUnit: e.target.value as any })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {unitOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  プラス差分の色
                </label>
                <div className="flex gap-2">
                  <select
                    value={settings.positiveColor}
                    onChange={(e) =>
                      setSettings({ ...settings, positiveColor: e.target.value })
                    }
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    {colorOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div
                    className={`w-10 h-10 rounded-lg ${colorOptions.find((c) => c.value === settings.positiveColor)?.class}`}
                  ></div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  マイナス差分の色
                </label>
                <div className="flex gap-2">
                  <select
                    value={settings.negativeColor}
                    onChange={(e) =>
                      setSettings({ ...settings, negativeColor: e.target.value })
                    }
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    {colorOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div
                    className={`w-10 h-10 rounded-lg ${colorOptions.find((c) => c.value === settings.negativeColor)?.class}`}
                  ></div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ニュートラル範囲（±）
              </label>
              <div className="flex items-center gap-3">
                <span className="text-gray-600">±</span>
                <input
                  type="number"
                  value={settings.neutralRange}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      neutralRange: parseInt(e.target.value) || 3,
                    })
                  }
                  min="0"
                  max="10"
                  className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <span className="text-gray-600">% 以内</span>
                <select
                  value={settings.neutralColor}
                  onChange={(e) =>
                    setSettings({ ...settings, neutralColor: e.target.value })
                  }
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {colorOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div
                  className={`w-10 h-10 rounded-lg ${colorOptions.find((c) => c.value === settings.neutralColor)?.class}`}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                差分が ±{settings.neutralRange}% 以内の場合、この色で表示
              </p>
            </div>
          </div>
        </div>

        {/* 表示設定 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5 text-emerald-500" />
            表示設定
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showPredictedProfit}
                onChange={(e) =>
                  setSettings({ ...settings, showPredictedProfit: e.target.checked })
                }
                className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">粗利予測を表示</div>
                <div className="text-sm text-gray-600">
                  リアルタイム計算された粗利予測を表示
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showCostBreakdown}
                onChange={(e) =>
                  setSettings({ ...settings, showCostBreakdown: e.target.checked })
                }
                className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">原価内訳を表示</div>
                <div className="text-sm text-gray-600">
                  発注済/発注中/未発注の詳細内訳を表示
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.highlightRiskyProjects}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    highlightRiskyProjects: e.target.checked,
                  })
                }
                className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  リスク案件をハイライト表示
                </div>
                <div className="text-sm text-gray-600">
                  原価超過・利益率低下の案件を目立たせる
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
