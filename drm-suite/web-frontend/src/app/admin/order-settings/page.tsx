'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChevronLeft,
  Save,
  ShoppingCart,
  AlertCircle,
  Bell,
  CheckCircle,
  Settings,
  Clock,
  Users,
  Link as LinkIcon,
  Key,
  Server,
} from 'lucide-react';

interface OrderSettings {
  // 発注期限設定
  orderDeadlineDays: number;
  // アラート設定
  alertBeforeDays: number;
  notifySupervisor: boolean;
  notifyDepartmentHead: boolean;
  notifyCEO: boolean;
  // 承認設定
  approvalThresholds: {
    under1M: string;
    from1Mto5M: string;
    from5Mto10M: string;
    over10M: string;
  };
  // DW連携設定
  dwApiEndpoint: string;
  dwApiKey: string;
  placeCode: string;
  syncFrequency: string;
}

export default function OrderSettingsPage() {
  const router = useRouter();
  const { user, isLoading, isSuperAdmin } = useAuth();
  const [settings, setSettings] = useState<OrderSettings>({
    orderDeadlineDays: 7,
    alertBeforeDays: 5,
    notifySupervisor: true,
    notifyDepartmentHead: true,
    notifyCEO: false,
    approvalThresholds: {
      under1M: 'auto',
      from1Mto5M: 'manager',
      from5Mto10M: 'department_head',
      over10M: 'executive',
    },
    dwApiEndpoint: 'https://dw.example.com/api',
    dwApiKey: '',
    placeCode: '',
    syncFrequency: 'daily_1am',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (!isLoading && !isSuperAdmin()) {
      router.push('/dashboard');
    }
  }, [user, isLoading, isSuperAdmin, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/order-settings', {
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

  const testDWConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus(null);
    try {
      const response = await fetch('/api/admin/test-dw-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: settings.dwApiEndpoint,
          apiKey: settings.dwApiKey,
        }),
      });

      if (response.ok) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setTestingConnection(false);
    }
  };

  if (isLoading || !isSuperAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const approvalOptions = [
    { value: 'auto', label: '自動承認' },
    { value: 'manager', label: '課長承認' },
    { value: 'department_head', label: '部長承認' },
    { value: 'department_head_and_gm', label: '部長+事業部長承認' },
    { value: 'executive', label: '役員承認' },
  ];

  const syncFrequencyOptions = [
    { value: 'realtime', label: 'リアルタイム' },
    { value: 'hourly', label: '1時間ごと' },
    { value: 'daily_1am', label: '毎日 1:00 AM' },
    { value: 'daily_6am', label: '毎日 6:00 AM' },
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
                  <ShoppingCart className="h-6 w-6 text-rose-500" />
                  発注管理設定
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  発注期限、承認ルート、DW連携の設定
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
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

        {/* 発注期限設定 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-rose-500" />
            発注期限設定
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                契約締結後の発注期限
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={settings.orderDeadlineDays}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      orderDeadlineDays: parseInt(e.target.value) || 7,
                    })
                  }
                  min="1"
                  max="30"
                  className="w-24 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
                <span className="text-gray-600">日以内</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                契約締結後、この期限内に全ての発注先を決定する必要があります
              </p>
            </div>
          </div>
        </div>

        {/* アラート設定 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-rose-500" />
            アラート設定
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                期限前アラート
              </label>
              <div className="flex items-center gap-3">
                <span className="text-gray-600">契約締結後</span>
                <input
                  type="number"
                  value={settings.alertBeforeDays}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      alertBeforeDays: parseInt(e.target.value) || 5,
                    })
                  }
                  min="1"
                  max="30"
                  className="w-24 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
                <span className="text-gray-600">日でアラート表示</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                期限超過時の通知先
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifySupervisor}
                    onChange={(e) =>
                      setSettings({ ...settings, notifySupervisor: e.target.checked })
                    }
                    className="w-5 h-5 text-rose-500 rounded focus:ring-rose-500"
                  />
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">上司（組織階層の1つ上）</span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifyDepartmentHead}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifyDepartmentHead: e.target.checked,
                      })
                    }
                    className="w-5 h-5 text-rose-500 rounded focus:ring-rose-500"
                  />
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">事業部長</span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifyCEO}
                    onChange={(e) =>
                      setSettings({ ...settings, notifyCEO: e.target.checked })
                    }
                    className="w-5 h-5 text-rose-500 rounded focus:ring-rose-500"
                  />
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">代表取締役</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 発注承認設定 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-rose-500" />
            発注承認設定
          </h2>

          <p className="text-sm text-gray-600 mb-4">
            総発注金額による承認ルート分岐
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-gray-700">100万円未満</div>
              <select
                value={settings.approvalThresholds.under1M}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    approvalThresholds: {
                      ...settings.approvalThresholds,
                      under1M: e.target.value,
                    },
                  })
                }
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              >
                {approvalOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-gray-700">100-500万円</div>
              <select
                value={settings.approvalThresholds.from1Mto5M}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    approvalThresholds: {
                      ...settings.approvalThresholds,
                      from1Mto5M: e.target.value,
                    },
                  })
                }
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              >
                {approvalOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-gray-700">500-1000万円</div>
              <select
                value={settings.approvalThresholds.from5Mto10M}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    approvalThresholds: {
                      ...settings.approvalThresholds,
                      from5Mto10M: e.target.value,
                    },
                  })
                }
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              >
                {approvalOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-gray-700">1000万円以上</div>
              <select
                value={settings.approvalThresholds.over10M}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    approvalThresholds: {
                      ...settings.approvalThresholds,
                      over10M: e.target.value,
                    },
                  })
                }
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              >
                {approvalOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* DW連携設定 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Server className="h-5 w-5 text-rose-500" />
            DW連携設定
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <LinkIcon className="inline h-4 w-4 mr-1" />
                DW API エンドポイント
              </label>
              <input
                type="url"
                value={settings.dwApiEndpoint}
                onChange={(e) =>
                  setSettings({ ...settings, dwApiEndpoint: e.target.value })
                }
                placeholder="https://dw.example.com/api"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Key className="inline h-4 w-4 mr-1" />
                API認証キー
              </label>
              <input
                type="password"
                value={settings.dwApiKey}
                onChange={(e) =>
                  setSettings({ ...settings, dwApiKey: e.target.value })
                }
                placeholder="sk_live_********************************"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                プレイスコード
              </label>
              <input
                type="text"
                value={settings.placeCode}
                onChange={(e) =>
                  setSettings({ ...settings, placeCode: e.target.value })
                }
                placeholder="ABC123"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
              <p className="mt-2 text-sm text-gray-600">
                DW側で割り当てられたテナント識別コード
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                同期頻度
              </label>
              <select
                value={settings.syncFrequency}
                onChange={(e) =>
                  setSettings({ ...settings, syncFrequency: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              >
                {syncFrequencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-600">
                DWから実績原価を取得する頻度
              </p>
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={testDWConnection}
                disabled={testingConnection || !settings.dwApiEndpoint || !settings.dwApiKey}
                className="flex items-center gap-2 px-4 py-2 border border-rose-200 text-rose-700 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Server className="h-4 w-4" />
                {testingConnection ? '接続テスト中...' : 'DW接続テスト'}
              </button>

              {connectionStatus === 'success' && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800">DWへの接続に成功しました</span>
                </div>
              )}

              {connectionStatus === 'error' && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-800">
                    DWへの接続に失敗しました。設定を確認してください
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
