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
  CheckCircle,
  AlertCircle,
  DollarSign,
  FileText,
  Send,
  Clock,
} from 'lucide-react';

interface UserNotificationSettings {
  // 通知方法の選択
  notificationMethods: {
    email: boolean;
    slack: boolean;
    chatwork: boolean;
  };

  // 個人メールアドレス（会社メールとは別）
  personalEmail?: string;

  // 受け取る通知の選択
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
    orderDeadlineApproaching: boolean;
    orderDeadlineExceeded: boolean;
    orderApprovalPending: boolean;

    // 請求関連
    invoiceIssued: boolean;
    invoicePaymentDue: boolean;
    invoiceOverdue: boolean;
    invoicePaid: boolean;

    // 原価管理関連
    costBudgetExceeded: boolean;
    costSyncCompleted: boolean;
    costSyncFailed: boolean;

    // 承認関連（自分が承認者の場合）
    approvalAssignedToMe: boolean;
    approvalReminder: boolean;
  };

  // 通知頻度
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';

  // 通知時間帯（daily/weeklyの場合）
  notificationTime?: string; // HH:mm

  // 勤務時間外の通知
  allowAfterHours: boolean;
  workingHoursStart?: string; // HH:mm
  workingHoursEnd?: string; // HH:mm

  // 優先度フィルター
  priorityFilter: 'all' | 'high_only' | 'urgent_only';
}

export default function UserNotificationSettingsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [settings, setSettings] = useState<UserNotificationSettings>({
    notificationMethods: {
      email: true,
      slack: false,
      chatwork: false,
    },
    notifications: {
      estimateCreated: false,
      estimateApprovalPending: true,
      estimateApproved: true,
      estimateRejected: true,
      contractCreated: false,
      contractApprovalPending: true,
      contractSigned: true,
      orderCreated: false,
      orderDeadlineApproaching: true,
      orderDeadlineExceeded: true,
      orderApprovalPending: true,
      invoiceIssued: false,
      invoicePaymentDue: true,
      invoiceOverdue: true,
      invoicePaid: false,
      costBudgetExceeded: true,
      costSyncCompleted: false,
      costSyncFailed: true,
      approvalAssignedToMe: true,
      approvalReminder: true,
    },
    frequency: 'realtime',
    allowAfterHours: false,
    workingHoursStart: '09:00',
    workingHoursEnd: '18:00',
    priorityFilter: 'all',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      loadSettings();
    }
  }, [user, isLoading]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/user/notification-settings');
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
      const response = await fetch('/api/user/notification-settings', {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Bell className="h-6 w-6" />
                  個人通知設定
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  あなたが受け取る通知をカスタマイズします
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                saved
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } disabled:opacity-50`}
            >
              <Save className="h-4 w-4" />
              {saved ? '保存完了' : saving ? '保存中...' : '設定を保存'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* 通知方法の選択 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">通知方法</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificationMethods.email}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    notificationMethods: { ...prev.notificationMethods, email: e.target.checked },
                  }))}
                  className="rounded"
                />
                <Mail className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">メール通知</p>
                  <p className="text-sm text-gray-500">{user?.email || '未設定'}</p>
                </div>
              </label>

              {settings.notificationMethods.email && (
                <div className="ml-8 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    個人メールアドレス（オプション）
                  </label>
                  <input
                    type="email"
                    value={settings.personalEmail || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, personalEmail: e.target.value }))}
                    placeholder="personal@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <p className="text-xs text-gray-500">
                    会社のメールアドレスとは別に、個人のメールアドレスにも通知を送信できます
                  </p>
                </div>
              )}

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificationMethods.slack}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    notificationMethods: { ...prev.notificationMethods, slack: e.target.checked },
                  }))}
                  className="rounded"
                />
                <MessageSquare className="h-5 w-5 text-purple-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Slack通知</p>
                  <p className="text-sm text-gray-500">個人のSlackアカウントに通知</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificationMethods.chatwork}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    notificationMethods: { ...prev.notificationMethods, chatwork: e.target.checked },
                  }))}
                  className="rounded"
                />
                <MessageSquare className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Chatwork通知</p>
                  <p className="text-sm text-gray-500">個人のChatworkアカウントに通知</p>
                </div>
              </label>
            </div>
          </div>

          {/* 通知頻度 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              通知頻度
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="frequency"
                  checked={settings.frequency === 'realtime'}
                  onChange={() => setSettings(prev => ({ ...prev, frequency: 'realtime' }))}
                  className="rounded-full"
                />
                <div>
                  <p className="font-medium text-gray-900">リアルタイム</p>
                  <p className="text-sm text-gray-500">イベント発生時に即座に通知</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="frequency"
                  checked={settings.frequency === 'hourly'}
                  onChange={() => setSettings(prev => ({ ...prev, frequency: 'hourly' }))}
                  className="rounded-full"
                />
                <div>
                  <p className="font-medium text-gray-900">1時間ごと</p>
                  <p className="text-sm text-gray-500">1時間分の通知をまとめて送信</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="frequency"
                  checked={settings.frequency === 'daily'}
                  onChange={() => setSettings(prev => ({ ...prev, frequency: 'daily' }))}
                  className="rounded-full"
                />
                <div>
                  <p className="font-medium text-gray-900">1日1回</p>
                  <p className="text-sm text-gray-500">1日分の通知をまとめて送信</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="frequency"
                  checked={settings.frequency === 'weekly'}
                  onChange={() => setSettings(prev => ({ ...prev, frequency: 'weekly' }))}
                  className="rounded-full"
                />
                <div>
                  <p className="font-medium text-gray-900">週1回</p>
                  <p className="text-sm text-gray-500">1週間分の通知をまとめて送信</p>
                </div>
              </label>

              {(settings.frequency === 'daily' || settings.frequency === 'weekly') && (
                <div className="ml-6 mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    通知送信時刻
                  </label>
                  <input
                    type="time"
                    value={settings.notificationTime || '09:00'}
                    onChange={(e) => setSettings(prev => ({ ...prev, notificationTime: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 勤務時間外の通知 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">勤務時間外の通知</h2>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowAfterHours}
                  onChange={(e) => setSettings(prev => ({ ...prev, allowAfterHours: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {!settings.allowAfterHours && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  以下の時間帯のみ通知を受け取ります
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      勤務開始時刻
                    </label>
                    <input
                      type="time"
                      value={settings.workingHoursStart || '09:00'}
                      onChange={(e) => setSettings(prev => ({ ...prev, workingHoursStart: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      勤務終了時刻
                    </label>
                    <input
                      type="time"
                      value={settings.workingHoursEnd || '18:00'}
                      onChange={(e) => setSettings(prev => ({ ...prev, workingHoursEnd: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 優先度フィルター */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              優先度フィルター
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  checked={settings.priorityFilter === 'all'}
                  onChange={() => setSettings(prev => ({ ...prev, priorityFilter: 'all' }))}
                  className="rounded-full"
                />
                <p className="font-medium text-gray-900">全ての通知を受け取る</p>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  checked={settings.priorityFilter === 'high_only'}
                  onChange={() => setSettings(prev => ({ ...prev, priorityFilter: 'high_only' }))}
                  className="rounded-full"
                />
                <p className="font-medium text-gray-900">高優先度のみ</p>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  checked={settings.priorityFilter === 'urgent_only'}
                  onChange={() => setSettings(prev => ({ ...prev, priorityFilter: 'urgent_only' }))}
                  className="rounded-full"
                />
                <p className="font-medium text-gray-900">緊急のみ</p>
              </label>
            </div>
          </div>

          {/* 通知の選択 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">受け取る通知</h2>
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
                    { key: 'estimateApprovalPending', label: '見積承認待ち（自分が承認者の場合）' },
                    { key: 'estimateApproved', label: '見積承認完了（自分が申請した場合）' },
                    { key: 'estimateRejected', label: '見積却下（自分が申請した場合）' },
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
                    { key: 'contractApprovalPending', label: '契約承認待ち（自分が承認者の場合）' },
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
                    { key: 'orderDeadlineApproaching', label: '7日期限が近づいた' },
                    { key: 'orderDeadlineExceeded', label: '7日期限超過' },
                    { key: 'orderApprovalPending', label: '発注承認待ち（自分が承認者の場合）' },
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

              {/* 承認関連 */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  承認関連
                </h3>
                <div className="space-y-2 ml-7">
                  {[
                    { key: 'approvalAssignedToMe', label: '自分に承認依頼が来た時' },
                    { key: 'approvalReminder', label: '承認依頼のリマインダー（未承認の場合）' },
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
        </div>
      </div>
    </div>
  );
}
