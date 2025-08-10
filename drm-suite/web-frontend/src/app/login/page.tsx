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
  bgColor: string;
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
      bgColor: 'bg-gradient-to-br from-dandori-blue to-dandori-sky',
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
      bgColor: 'bg-gradient-to-br from-dandori-orange to-dandori-yellow',
    },
    {
      name: '佐藤 次郎',
      role: '営業担当',
      email: 'sato@drm.com',
      password: 'admin123',
      status: 'worker',
      department: '営業部',
      permissions: ['自分のスケジュール確認', '作業進捗登録', 'チャット機能'],
      avatar: '👨‍💻',
      bgColor: 'bg-gradient-to-br from-dandori-pink to-dandori-orange',
    },
    {
      name: '山田 愛子',
      role: '経理担当',
      email: 'aiko@drm.com',
      password: 'admin123',
      status: 'worker',
      department: '経理部',
      permissions: ['請求書作成', '入金管理', '財務分析', '月次報告'],
      avatar: '👩‍💼',
      bgColor: 'bg-gradient-to-br from-purple-500 to-dandori-pink',
    },
    {
      name: '木村 健太',
      role: 'マーケティング',
      email: 'kimura@drm.com',
      password: 'admin123',
      status: 'worker',
      department: 'マーケティング部',
      permissions: ['キャンペーン管理', 'Web分析', 'SEO対策', 'SNS運用'],
      avatar: '📊',
      bgColor: 'bg-gradient-to-br from-dandori-yellow to-green-400',
    },
  ];

  const handleQuickLogin = (account: QuickLoginAccount) => {
    setSelectedAccount(account);
    // セッション保存のシミュレーション
    localStorage.setItem('userRole', account.role);
    localStorage.setItem('userEmail', account.email);
    localStorage.setItem('userName', account.name);
    // ダッシュボードへ遷移
    setTimeout(() => {
      router.push('/dashboard');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dandori-blue/5 via-white to-dandori-sky/5">
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* ヘッダー */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-dandori shadow-xl mb-4">
            <span className="text-4xl text-white">🏗️</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-dandori bg-clip-text text-transparent mb-2">
            DRM Suite v1.0
          </h1>
          <p className="text-gray-600">Dandori Relation Management System</p>
        </div>

        {/* デモ用クイックログイン */}
        <div className="w-full max-w-5xl">
          <h3 className="text-center text-lg font-semibold text-gray-700 mb-6">
            🚀 デモ用クイックログイン
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickAccounts.map((account) => (
              <button
                key={account.email}
                onClick={() => handleQuickLogin(account)}
                className={`relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-2 ${
                  selectedAccount?.email === account.email
                    ? 'border-dandori-blue ring-4 ring-dandori-blue/20'
                    : 'border-transparent hover:border-dandori-blue/30'
                }`}
              >
                {/* グラデーションバッジ */}
                <div
                  className={`absolute -top-3 -right-3 w-16 h-16 rounded-full ${account.bgColor} flex items-center justify-center shadow-lg`}
                >
                  <span className="text-2xl">{account.avatar}</span>
                </div>

                <div className="text-left">
                  <h4 className="font-bold text-lg text-gray-800 mb-1">
                    {account.name}
                  </h4>
                  <p className="text-sm text-dandori-blue font-medium mb-2">
                    {account.role}
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    {account.department}
                  </p>

                  <div className="space-y-1">
                    <p className="text-xs text-gray-600">権限:</p>
                    <div className="flex flex-wrap gap-1">
                      {account.permissions.slice(0, 3).map((perm, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-2 py-0.5 bg-dandori-blue/10 text-dandori-blue text-xs rounded-full"
                        >
                          {perm}
                        </span>
                      ))}
                      {account.permissions.length > 3 && (
                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{account.permissions.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedAccount?.email === account.email && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-dandori/90 rounded-2xl animate-fade-in">
                    <div className="text-white text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white/30 border-t-white mb-2"></div>
                      <p className="text-sm font-medium">ログイン中...</p>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* フッター */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            © 2024 DRM Suite - Powered by Dandori Work
          </p>
          <div className="mt-2 flex justify-center gap-4">
            <a
              href="#"
              className="text-xs text-dandori-blue hover:text-dandori-blue-dark transition-colors"
            >
              利用規約
            </a>
            <span className="text-gray-300">|</span>
            <a
              href="#"
              className="text-xs text-dandori-blue hover:text-dandori-blue-dark transition-colors"
            >
              プライバシーポリシー
            </a>
            <span className="text-gray-300">|</span>
            <a
              href="#"
              className="text-xs text-dandori-blue hover:text-dandori-blue-dark transition-colors"
            >
              ヘルプ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
