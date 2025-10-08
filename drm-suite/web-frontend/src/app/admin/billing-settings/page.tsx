'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChevronLeft,
  Save,
  CreditCard,
  Clock,
  Percent,
  Mail,
  CheckCircle,
  Calendar,
  TrendingUp,
  Plus,
  Trash2,
} from 'lucide-react';

interface BillingPattern {
  id: string;
  name: string;
  percentages: number[];
}

interface BillingSettings {
  // 請求タイミング
  billingTiming: 'milestone' | 'schedule' | 'progress';
  // 分割請求パターン
  splitPatterns: BillingPattern[];
  activePa

tternId: string;
  // 自動化設定
  autoSendInvoice: boolean;
  autoSendReminder: boolean;
  reminderDaysBefore: number;
  // その他
  includeProgressInInvoice: boolean;
}

export default function BillingSettingsPage() {
  const router = useRouter();
  const { user, isLoading, isSuperAdmin } = useAuth();
  const [settings, setSettings] = useState<BillingSettings>({
    billingTiming: 'milestone',
    splitPatterns: [
      { id: 'pattern1', name: '3分割（30-40-30）', percentages: [30, 40, 30] },
      { id: 'pattern2', name: '4分割（10-30-30-30）', percentages: [10, 30, 30, 30] },
      { id: 'pattern3', name: '2分割（50-50）', percentages: [50, 50] },
    ],
    activePatternId: 'pattern1',
    autoSendInvoice: true,
    autoSendReminder: true,
    reminderDaysBefore: 3,
    includeProgressInInvoice: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newPattern, setNewPattern] = useState({ name: '', percentages: '' });

  useEffect(() => {
    if (!isLoading && !isSuperAdmin()) {
      router.push('/dashboard');
    }
  }, [user, isLoading, isSuperAdmin, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/billing-settings', {
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

  const addPattern = () => {
    if (!newPattern.name || !newPattern.percentages) return;

    const percentages = newPattern.percentages.split('-').map(p => parseInt(p.trim()));
    const total = percentages.reduce((sum, p) => sum + p, 0);

    if (total !== 100) {
      alert('合計が100%になるように入力してください');
      return;
    }

    const pattern: BillingPattern = {
      id: `pattern${Date.now()}`,
      name: newPattern.name,
      percentages,
    };

    setSettings({
      ...settings,
      splitPatterns: [...settings.splitPatterns, pattern],
    });

    setNewPattern({ name: '', percentages: '' });
  };

  const deletePattern = (id: string) => {
    if (settings.activePatternId === id) {
      alert('使用中のパターンは削除できません');
      return;
    }

    setSettings({
      ...settings,
      splitPatterns: settings.splitPatterns.filter(p => p.id !== id),
    });
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
                  <CreditCard className="h-6 w-6 text-violet-500" />
                  請求設定
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  請求タイミング、分割請求パターンの設定
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50"
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

        {/* 請求タイミング設定 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-violet-500" />
            請求タイミング設定
          </h2>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-transparent hover:border-violet-200 cursor-pointer transition-colors">
              <input
                type="radio"
                name="billingTiming"
                value="milestone"
                checked={settings.billingTiming === 'milestone'}
                onChange={(e) =>
                  setSettings({ ...settings, billingTiming: e.target.value as any })
                }
                className="mt-1 w-5 h-5 text-violet-500 focus:ring-violet-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  マイルストーンベース
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  工程完了時に自動的に請求書を発行
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-transparent hover:border-violet-200 cursor-pointer transition-colors">
              <input
                type="radio"
                name="billingTiming"
                value="schedule"
                checked={settings.billingTiming === 'schedule'}
                onChange={(e) =>
                  setSettings({ ...settings, billingTiming: e.target.value as any })
                }
                className="mt-1 w-5 h-5 text-violet-500 focus:ring-violet-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  期日ベース
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  月末・月初などの定期的なタイミングで請求
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-transparent hover:border-violet-200 cursor-pointer transition-colors">
              <input
                type="radio"
                name="billingTiming"
                value="progress"
                checked={settings.billingTiming === 'progress'}
                onChange={(e) =>
                  setSettings({ ...settings, billingTiming: e.target.value as any })
                }
                className="mt-1 w-5 h-5 text-violet-500 focus:ring-violet-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  出来高ベース
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  進捗率に応じて請求額を計算
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* 分割請求パターン */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Percent className="h-5 w-5 text-violet-500" />
            分割請求パターン
          </h2>

          <div className="space-y-3 mb-4">
            {settings.splitPatterns.map((pattern) => (
              <div
                key={pattern.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                  settings.activePatternId === pattern.id
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-200 hover:border-violet-200'
                }`}
              >
                <label className="flex items-center gap-3 flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="activePattern"
                    value={pattern.id}
                    checked={settings.activePatternId === pattern.id}
                    onChange={(e) =>
                      setSettings({ ...settings, activePatternId: e.target.value })
                    }
                    className="w-5 h-5 text-violet-500 focus:ring-violet-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{pattern.name}</div>
                    <div className="text-sm text-gray-600">
                      {pattern.percentages.join('% - ')}%
                    </div>
                  </div>
                </label>
                {settings.splitPatterns.length > 1 && (
                  <button
                    onClick={() => deletePattern(pattern.id)}
                    disabled={settings.activePatternId === pattern.id}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-3">新しいパターンを追加</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={newPattern.name}
                onChange={(e) => setNewPattern({ ...newPattern, name: e.target.value })}
                placeholder="パターン名（例: 5分割）"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
              <input
                type="text"
                value={newPattern.percentages}
                onChange={(e) =>
                  setNewPattern({ ...newPattern, percentages: e.target.value })
                }
                placeholder="比率（例: 20-20-20-20-20）"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
              <button
                onClick={addPattern}
                className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                追加
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              ハイフン区切りで入力してください（合計100%になるように）
            </p>
          </div>
        </div>

        {/* 自動化設定 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-violet-500" />
            自動化設定
          </h2>

          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoSendInvoice}
                onChange={(e) =>
                  setSettings({ ...settings, autoSendInvoice: e.target.checked })
                }
                className="w-5 h-5 text-violet-500 rounded focus:ring-violet-500"
              />
              <div>
                <div className="font-medium text-gray-900">請求書自動送付</div>
                <div className="text-sm text-gray-600">
                  承認完了後、自動的に顧客へメール送信
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoSendReminder}
                onChange={(e) =>
                  setSettings({ ...settings, autoSendReminder: e.target.checked })
                }
                className="w-5 h-5 text-violet-500 rounded focus:ring-violet-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">督促メール自動送信</div>
                <div className="text-sm text-gray-600">
                  支払期限前に自動的に督促メールを送信
                </div>
              </div>
            </label>

            {settings.autoSendReminder && (
              <div className="ml-12 border-l-2 border-violet-200 pl-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  督促送信タイミング
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">支払期限の</span>
                  <input
                    type="number"
                    value={settings.reminderDaysBefore}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        reminderDaysBefore: parseInt(e.target.value) || 3,
                      })
                    }
                    min="1"
                    max="30"
                    className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                  <span className="text-gray-600">日前</span>
                </div>
              </div>
            )}

            <label className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.includeProgressInInvoice}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    includeProgressInInvoice: e.target.checked,
                  })
                }
                className="w-5 h-5 text-violet-500 rounded focus:ring-violet-500"
              />
              <div>
                <div className="font-medium text-gray-900">請求書に進捗率を表示</div>
                <div className="text-sm text-gray-600">
                  請求書PDFに工事進捗率を記載
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
