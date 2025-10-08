'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChevronLeft,
  Save,
  Bell,
  Mail,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle,
  DollarSign,
  FileText,
  Users,
  Send,
} from 'lucide-react';

interface NotificationSettings {
  // メール通知
  emailEnabled: boolean;
  emailRecipients: string[];

  // Slack通知
  slackEnabled: boolean;
  slackWebhookUrl: string;
  slackChannel: string;

  // Chatwork通知
  chatworkEnabled: boolean;
  chatworkApiToken: string;
  chatworkRoomId: string;

  // 通知トリガー設定
  notifications: {
    // 見積関連
    estimateCreated: boolean;
    estimateApprovalPending: boolean;
    estimateApproved: boolean;
    estimateRejected: boolean;

    // 契約関連
    contractCreated: boolean;
    contractApprovalPending: boolean;
    contractSigned: boolean;

    // 発注関連
    orderCreated: boolean;
    orderDeadlineApproaching: boolean; // 7日期限が近づいた
    orderDeadlineExceeded: boolean; // 7日期限超過
    orderApprovalPending: boolean;

    // 請求関連
    invoiceIssued: boolean;
    invoicePaymentDue: boolean; // 支払期限が近づいた
    invoiceOverdue: boolean; // 支払期限超過
    invoicePaid: boolean;

    // 原価管理関連
    costBudgetExceeded: boolean; // 予算超過
    costSyncCompleted: boolean; // DW同期完了
    costSyncFailed: boolean; // DW同期失敗
  };

  // 通知タイミング
  timing: {
    deadlineWarningDays: number; // 期限の何日前に通知するか
    batchNotification: boolean; // バッチ通知（1日1回まとめて送信）
    batchTime: string; // バッチ通知時刻 (HH:mm)
  };

  // 通知先設定
  recipients: {
    approvalRequests: string[]; // 承認依頼の通知先
    deadlineAlerts: string[]; // 期限アラートの通知先
    costAlerts: string[]; // 原価アラートの通知先
    systemAlerts: string[]; // システムアラートの通知先
  };
}

export default function NotificationSettingsPage() {
  const router = useRouter();
  const { user, isLoading, isSuperAdmin } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>({
    emailEnabled: true,
    emailRecipients: ['admin@example.com', 'manager@example.com'],
    slackEnabled: false,
    slackWebhookUrl: '',
    slackChannel: '#drm-notifications',
    chatworkEnabled: false,
    chatworkApiToken: '',
    chatworkRoomId: '',
    notifications: {
      estimateCreated: true,
      estimateApprovalPending: true,
      estimateApproved: true,
      estimateRejected: true,
      contractCreated: true,
      contractApprovalPending: true,
      contractSigned: true,
      orderCreated: true,
      orderDeadlineApproaching: true,
      orderDeadlineExceeded: true,
      orderApprovalPending: true,
      invoiceIssued: true,
      invoicePaymentDue: true,
      invoiceOverdue: true,
      invoicePaid: false,
      costBudgetExceeded: true,
      costSyncCompleted: false,
      costSyncFailed: true,
    },
    timing: {
      deadlineWarningDays: 3,
      batchNotification: false,
      batchTime: '09:00',
    },
    recipients: {
      approvalRequests: ['manager@example.com'],
      deadlineAlerts: ['admin@example.com', 'manager@example.com'],
      costAlerts: ['admin@example.com'],
      systemAlerts: ['admin@example.com'],
    },
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testingSending, setTestingSending] = useState(false);

  useEffect(() => {
    if (!isLoading && !isSuperAdmin()) {
      router.push('/dashboard');
    }
  }, [user, isLoading, isSuperAdmin, router]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/notification-settings');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error('設定の読み込みに失敗しました:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/notification-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        alert('設定を保存しました');
      }
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
      alert('設定の保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    setTestingSending(true);
    try {
      const response = await fetch('/api/admin/notification-settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        alert('テスト通知を送信しました。メールまたはSlackを確認してください。');
      } else {
        alert('テスト通知の送信に失敗しました');
      }
    } catch (error) {
      console.error('テスト通知の送信に失敗しました:', error);
      alert('テスト通知の送信に失敗しました');
    } finally {
      setTestingSending(false);
    }
  };

  const handleAddRecipient = (category: keyof NotificationSettings['recipients']) => {
    const email = prompt('通知先メールアドレスを入力してください:');
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSettings(prev => ({
        ...prev,
        recipients: {
          ...prev.recipients,
          [category]: [...prev.recipients[category], email],
        },
      }));
    } else if (email) {
      alert('有効なメールアドレスを入力してください');
    }
  };

  const handleRemoveRecipient = (category: keyof NotificationSettings['recipients'], email: string) => {
    setSettings(prev => ({
      ...prev,
      recipients: {
        ...prev.recipients,
        [category]: prev.recipients[category].filter(e => e !== email),
      },
    }));
  };

  if (isLoading || !isSuperAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

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
                  <Bell className="h-6 w-6" />
                  通知設定
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  メール・Slack・Chatwork通知の設定を管理します
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleTestNotification}
                disabled={testingSending}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                テスト送信
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  saved
                    ? 'bg-green-600 text-white'
                    : 'bg-red-600 text-white hover:bg-red-700'
                } disabled:opacity-50`}
              >
                <Save className="h-4 w-4" />
                {saved ? '保存完了' : saving ? '保存中...' : '設定を保存'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* メール通知設定 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="h-6 w-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">メール通知</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">メール通知を有効にする</p>
                  <p className="text-sm text-gray-500">重要なイベントをメールで通知します</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailEnabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, emailEnabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.emailEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    デフォルト送信先
                  </label>
                  <div className="space-y-2">
                    {settings.emailRecipients.map((email, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            const newRecipients = [...settings.emailRecipients];
                            newRecipients[index] = e.target.value;
                            setSettings(prev => ({ ...prev, emailRecipients: newRecipients }));
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <button
                          onClick={() => {
                            setSettings(prev => ({
                              ...prev,
                              emailRecipients: prev.emailRecipients.filter((_, i) => i !== index),
                            }));
                          }}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          削除
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setSettings(prev => ({
                          ...prev,
                          emailRecipients: [...prev.emailRecipients, ''],
                        }));
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + 送信先を追加
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Slack通知設定 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="h-6 w-6 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Slack通知</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Slack通知を有効にする</p>
                  <p className="text-sm text-gray-500">Slackワークスペースに通知を送信します</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.slackEnabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, slackEnabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {settings.slackEnabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Webhook URL
                    </label>
                    <input
                      type="url"
                      value={settings.slackWebhookUrl}
                      onChange={(e) => setSettings(prev => ({ ...prev, slackWebhookUrl: e.target.value }))}
                      placeholder="https://hooks.slack.com/services/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Slack Appの設定画面からIncoming Webhook URLを取得してください
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      通知先チャンネル
                    </label>
                    <input
                      type="text"
                      value={settings.slackChannel}
                      onChange={(e) => setSettings(prev => ({ ...prev, slackChannel: e.target.value }))}
                      placeholder="#drm-notifications"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Chatwork通知設定 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="h-6 w-6 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Chatwork通知</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Chatwork通知を有効にする</p>
                  <p className="text-sm text-gray-500">Chatworkに通知を送信します</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.chatworkEnabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, chatworkEnabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              {settings.chatworkEnabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Token
                    </label>
                    <input
                      type="password"
                      value={settings.chatworkApiToken}
                      onChange={(e) => setSettings(prev => ({ ...prev, chatworkApiToken: e.target.value }))}
                      placeholder="Chatwork API Token"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Chatworkの「サービス連携」からAPI Tokenを取得してください
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room ID
                    </label>
                    <input
                      type="text"
                      value={settings.chatworkRoomId}
                      onChange={(e) => setSettings(prev => ({ ...prev, chatworkRoomId: e.target.value }))}
                      placeholder="123456789"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      通知を送信したいチャットルームのIDを入力してください
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 通知トリガー設定 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="h-6 w-6 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">通知トリガー</h2>
            </div>

            <div className="space-y-6">
              {/* 見積関連 */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  見積関連
                </h3>
                <div className="space-y-2 ml-7">
                  {[
                    { key: 'estimateCreated', label: '見積作成時' },
                    { key: 'estimateApprovalPending', label: '見積承認待ち' },
                    { key: 'estimateApproved', label: '見積承認完了' },
                    { key: 'estimateRejected', label: '見積却下' },
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            [item.key]: e.target.checked,
                          },
                        }))}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 契約関連 */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  契約関連
                </h3>
                <div className="space-y-2 ml-7">
                  {[
                    { key: 'contractCreated', label: '契約作成時' },
                    { key: 'contractApprovalPending', label: '契約承認待ち' },
                    { key: 'contractSigned', label: '契約締結時' },
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            [item.key]: e.target.checked,
                          },
                        }))}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 発注関連 */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  発注関連
                </h3>
                <div className="space-y-2 ml-7">
                  {[
                    { key: 'orderCreated', label: '発注作成時' },
                    { key: 'orderDeadlineApproaching', label: '7日期限が近づいた（3日前）' },
                    { key: 'orderDeadlineExceeded', label: '7日期限超過' },
                    { key: 'orderApprovalPending', label: '発注承認待ち' },
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            [item.key]: e.target.checked,
                          },
                        }))}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 請求関連 */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  請求関連
                </h3>
                <div className="space-y-2 ml-7">
                  {[
                    { key: 'invoiceIssued', label: '請求書発行時' },
                    { key: 'invoicePaymentDue', label: '支払期限が近づいた' },
                    { key: 'invoiceOverdue', label: '支払期限超過' },
                    { key: 'invoicePaid', label: '入金確認時' },
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            [item.key]: e.target.checked,
                          },
                        }))}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 原価管理関連 */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  原価管理関連
                </h3>
                <div className="space-y-2 ml-7">
                  {[
                    { key: 'costBudgetExceeded', label: '予算超過時' },
                    { key: 'costSyncCompleted', label: 'DW同期完了' },
                    { key: 'costSyncFailed', label: 'DW同期失敗' },
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            [item.key]: e.target.checked,
                          },
                        }))}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 通知タイミング設定 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="h-6 w-6 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">通知タイミング</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  期限アラートの通知タイミング
                </label>
                <select
                  value={settings.timing.deadlineWarningDays}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    timing: { ...prev.timing, deadlineWarningDays: parseInt(e.target.value) },
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="1">期限の1日前</option>
                  <option value="2">期限の2日前</option>
                  <option value="3">期限の3日前</option>
                  <option value="5">期限の5日前</option>
                  <option value="7">期限の7日前</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">バッチ通知</p>
                  <p className="text-sm text-gray-500">1日1回まとめて通知を送信します</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.timing.batchNotification}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      timing: { ...prev.timing, batchNotification: e.target.checked },
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              {settings.timing.batchNotification && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    バッチ通知時刻
                  </label>
                  <input
                    type="time"
                    value={settings.timing.batchTime}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      timing: { ...prev.timing, batchTime: e.target.value },
                    }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 通知先カテゴリ別設定 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="h-6 w-6 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">カテゴリ別通知先</h2>
            </div>

            <div className="space-y-6">
              {[
                { key: 'approvalRequests', label: '承認依頼', icon: CheckCircle, color: 'text-blue-600' },
                { key: 'deadlineAlerts', label: '期限アラート', icon: Clock, color: 'text-orange-600' },
                { key: 'costAlerts', label: '原価アラート', icon: DollarSign, color: 'text-red-600' },
                { key: 'systemAlerts', label: 'システムアラート', icon: AlertCircle, color: 'text-purple-600' },
              ].map(category => {
                const Icon = category.icon;
                return (
                  <div key={category.key}>
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${category.color}`} />
                      {category.label}
                    </h3>
                    <div className="space-y-2 ml-7">
                      {settings.recipients[category.key as keyof typeof settings.recipients].map((email, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="flex-1 text-sm text-gray-700 px-3 py-2 bg-gray-50 rounded-lg">
                            {email}
                          </span>
                          <button
                            onClick={() => handleRemoveRecipient(category.key as keyof typeof settings.recipients, email)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                          >
                            削除
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddRecipient(category.key as keyof typeof settings.recipients)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        + 通知先を追加
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
