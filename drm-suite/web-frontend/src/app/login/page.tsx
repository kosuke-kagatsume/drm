'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface QuickLoginAccount {
  name: string;
  role: string;
  email: string;
  password: string;
  status: 'manager' | 'supervisor' | 'worker';
  department: string;
  permissions: string[];
  avatar: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [selectedAccount, setSelectedAccount] =
    useState<QuickLoginAccount | null>(null);

  const quickAccounts: QuickLoginAccount[] = [
    {
      name: '山田 太郎',
      role: '経営者',
      email: 'yamada@drm.com',
      password: 'admin123',
      status: 'manager',
      department: '経営管理',
      permissions: ['スケジュール管理', '売上分析', '現場管理', '承認権限'],
      avatar: '👨‍💼',
    },
    {
      name: '鈴木 一郎',
      role: '支店長',
      email: 'suzuki@drm.com',
      password: 'admin123',
      status: 'supervisor',
      department: '東京支店',
      permissions: [
        '自分のスケジュール確認',
        '作業報告書作成',
        '予定変更申請',
        'チャット機能',
      ],
      avatar: '👷',
    },
    {
      name: '佐藤 次郎',
      role: '営業担当',
      email: 'sato@drm.com',
      password: 'admin123',
      status: 'worker',
      department: '営業部',
      permissions: ['自分のスケジュール確認', '見積作成', 'チャット機能'],
      avatar: '🔧',
    },
    {
      name: '田中 花子',
      role: '経理担当',
      email: 'tanaka@drm.com',
      password: 'admin123',
      status: 'worker',
      department: '経理部',
      permissions: ['入金確認', '請求書発行', '支払管理'],
      avatar: '💼',
    },
    {
      name: '高橋 三郎',
      role: 'マーケティング',
      email: 'takahashi@drm.com',
      password: 'admin123',
      status: 'worker',
      department: 'マーケティング部',
      permissions: ['集客分析', 'キャンペーン管理', 'SEO/Web管理'],
      avatar: '📊',
    },
  ];

  const handleQuickLogin = (account: QuickLoginAccount) => {
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('userEmail', account.email);
    sessionStorage.setItem('userName', account.name);
    sessionStorage.setItem('userAvatar', account.avatar);

    // 役職に応じたroleをセット
    let roleType = 'sales';
    if (account.role === '経営者') roleType = 'executive';
    else if (account.role === '支店長') roleType = 'manager';
    else if (account.role === '営業担当') roleType = 'sales';
    else if (account.role === '経理担当') roleType = 'accounting';
    else if (account.role === 'マーケティング') roleType = 'marketing';

    sessionStorage.setItem('userRole', roleType);
    router.push('/dashboard');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'manager':
        return 'bg-red-500';
      case 'supervisor':
        return 'bg-green-500';
      case 'worker':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'manager':
        return '管理者';
      case 'supervisor':
        return '責任者';
      case 'worker':
        return '担当者';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <span className="text-5xl mr-3">🏗️</span>
            <h1 className="text-4xl font-bold text-white">DRM Suite</h1>
          </div>
          <p className="text-xl text-purple-100">建築業向け統合管理システム</p>
          <p className="text-purple-200 mt-2">
            デモアカウントを選択してログイン
          </p>
        </div>

        {/* クイックログインカード */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {quickAccounts.map((account, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-xl p-6 hover:shadow-2xl transition transform hover:scale-105 cursor-pointer"
              onClick={() => handleQuickLogin(account)}
            >
              <div className="text-center mb-4">
                <div className="text-5xl mb-3">{account.avatar}</div>
                <h3 className="text-lg font-bold text-gray-900">
                  {account.name}
                </h3>
                <div className="flex items-center justify-center mt-2">
                  <span
                    className={`${getStatusColor(account.status)} text-white text-xs px-2 py-1 rounded`}
                  >
                    {getStatusLabel(account.status)}
                  </span>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                <p className="font-medium">
                  {account.department}の{account.role}
                </p>
              </div>

              <div className="border-t pt-3">
                <p className="text-xs font-medium text-gray-500 mb-2">
                  利用可能な機能：
                </p>
                <div className="flex flex-wrap gap-1">
                  {account.permissions.slice(0, 3).map((perm, pidx) => (
                    <span
                      key={pidx}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                    >
                      {perm}
                    </span>
                  ))}
                  {account.permissions.length > 3 && (
                    <span className="text-xs text-gray-400">
                      他{account.permissions.length - 3}件
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <button
                  className={`w-full py-2 px-4 rounded-lg text-white font-medium transition
                    ${
                      account.status === 'manager'
                        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                        : account.status === 'supervisor'
                          ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                    }`}
                >
                  クイックログイン →
                </button>
              </div>

              <div className="mt-3 text-xs text-gray-400 text-center">
                <p>Email: {account.email}</p>
                <p>Pass: ••••••••</p>
              </div>
            </div>
          ))}
        </div>

        {/* 通常ログインリンク */}
        <div className="text-center mt-8">
          <p className="text-white text-sm">
            ※ これはデモ環境です。実際のデータは保存されません。
          </p>
          <button
            onClick={() => setSelectedAccount(quickAccounts[0])}
            className="mt-4 text-purple-200 hover:text-white underline text-sm"
          >
            通常のログインはこちら
          </button>
        </div>
      </div>
    </div>
  );
}
