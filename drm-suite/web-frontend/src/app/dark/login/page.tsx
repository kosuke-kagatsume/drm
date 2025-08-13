'use client';

import { useState, useEffect } from 'react';
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
  indicator: string;
  roleDescription: string;
}

export default function DarkLoginPage() {
  const router = useRouter();
  const [selectedAccount, setSelectedAccount] =
    useState<QuickLoginAccount | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const quickAccounts: QuickLoginAccount[] = [
    {
      name: 'YAMADA TARO',
      role: 'EXECUTIVE',
      email: 'yamada@drm.com',
      password: 'admin123',
      status: 'manager',
      department: 'CORPORATE MANAGEMENT',
      permissions: [
        'SCHEDULE MANAGEMENT',
        'REVENUE ANALYSIS',
        'SITE MANAGEMENT',
        'APPROVAL AUTHORITY',
      ],
      avatar: 'CEO',
      indicator: '01',
      roleDescription: 'CHIEF EXECUTIVE OFFICER',
    },
    {
      name: 'SUZUKI ICHIRO',
      role: 'MANAGER',
      email: 'suzuki@drm.com',
      password: 'admin123',
      status: 'supervisor',
      department: 'TOKYO BRANCH',
      permissions: [
        'PERSONAL SCHEDULE VIEW',
        'WORK REPORT CREATION',
        'SCHEDULE CHANGE REQUEST',
        'COMMUNICATION TOOLS',
      ],
      avatar: 'MGR',
      indicator: '02',
      roleDescription: 'BRANCH MANAGER',
    },
    {
      name: 'SATO JIRO',
      role: 'SALES',
      email: 'sato@drm.com',
      password: 'admin123',
      status: 'worker',
      department: 'SALES DIVISION',
      permissions: [
        'PERSONAL SCHEDULE VIEW',
        'PROGRESS REGISTRATION',
        'COMMUNICATION TOOLS',
      ],
      avatar: 'SLS',
      indicator: '03',
      roleDescription: 'SALES REPRESENTATIVE',
    },
    {
      name: 'YAMADA AIKO',
      role: 'FINANCE',
      email: 'aiko@drm.com',
      password: 'admin123',
      status: 'worker',
      department: 'ACCOUNTING DIVISION',
      permissions: [
        'INVOICE CREATION',
        'PAYMENT MANAGEMENT',
        'FINANCIAL ANALYSIS',
        'MONTHLY REPORTS',
      ],
      avatar: 'FIN',
      indicator: '04',
      roleDescription: 'FINANCIAL ANALYST',
    },
    {
      name: 'KIMURA KENTA',
      role: 'MARKETING',
      email: 'kimura@drm.com',
      password: 'admin123',
      status: 'worker',
      department: 'MARKETING DIVISION',
      permissions: [
        'CAMPAIGN MANAGEMENT',
        'WEB ANALYTICS',
        'SEO OPTIMIZATION',
        'SOCIAL MEDIA',
      ],
      avatar: 'MKT',
      indicator: '05',
      roleDescription: 'MARKETING SPECIALIST',
    },
  ];

  const handleQuickLogin = (account: QuickLoginAccount) => {
    setSelectedAccount(account);
    // Save session
    if (typeof window !== 'undefined') {
      localStorage.setItem('userRole', account.role);
      localStorage.setItem('userEmail', account.email);
      localStorage.setItem('userName', account.name);
      // Navigate to dark dashboard
      setTimeout(() => {
        window.location.href = '/dark/dashboard';
      }, 500);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-black">
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12 fade-in-animation">
            <div className="inline-flex items-center justify-center w-20 h-20 border border-zinc-700 mb-4">
              <span className="text-white text-2xl font-thin tracking-widest">
                DRM
              </span>
            </div>
            <h1 className="text-4xl font-thin text-white mb-2 tracking-widest">
              DRM SUITE V1.0
            </h1>
            <p className="text-zinc-500 text-xs tracking-wider">
              DANDORI RELATION MANAGEMENT SYSTEM
            </p>
          </div>

          {/* Demo Quick Login */}
          <div className="w-full max-w-6xl">
            <h3 className="text-center text-sm font-normal text-white mb-8 tracking-widest">
              DEMO QUICK LOGIN
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickAccounts.map((account) => (
                <button
                  key={account.email}
                  onClick={() => handleQuickLogin(account)}
                  className={`relative bg-zinc-950 border p-8 hover:border-zinc-600 transform hover:scale-105 transition-all duration-200 ${
                    selectedAccount?.email === account.email
                      ? 'border-white'
                      : 'border-zinc-800'
                  }`}
                  style={{
                    boxShadow:
                      selectedAccount?.email === account.email
                        ? '0 0 0 1px rgba(255, 255, 255, 0.1)'
                        : 'none',
                  }}
                >
                  {/* Role Indicator */}
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-black border border-zinc-700 flex items-center justify-center">
                    <span className="text-zinc-400 text-xs font-light tracking-wider">
                      {account.indicator}
                    </span>
                  </div>

                  <div className="text-left">
                    <div className="mb-4">
                      <div className="w-16 h-16 border border-zinc-700 flex items-center justify-center mb-4">
                        <span className="text-white text-xs font-light tracking-wider">
                          {account.avatar}
                        </span>
                      </div>
                    </div>

                    <h4 className="font-light text-lg text-white mb-2 tracking-wider">
                      {account.name}
                    </h4>
                    <p className="text-xs font-normal text-white mb-1 tracking-widest">
                      {account.role}
                    </p>
                    <p className="text-xs text-zinc-500 mb-4 tracking-wider">
                      {account.roleDescription}
                    </p>
                    <p className="text-xs text-zinc-600 mb-6 tracking-wider">
                      {account.department}
                    </p>

                    <div className="space-y-3">
                      <p className="text-xs text-zinc-500 tracking-wider">
                        PERMISSIONS:
                      </p>
                      <div className="space-y-2">
                        {account.permissions.slice(0, 3).map((perm, idx) => (
                          <div
                            key={idx}
                            className="flex items-center text-xs text-zinc-400 tracking-wider"
                          >
                            <span className="w-1 h-1 bg-zinc-600 mr-3"></span>
                            {perm}
                          </div>
                        ))}
                        {account.permissions.length > 3 && (
                          <div className="flex items-center text-xs text-zinc-500 tracking-wider">
                            <span className="w-1 h-1 bg-zinc-700 mr-3"></span>+
                            {account.permissions.length - 3} MORE
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedAccount?.email === account.email && (
                    <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center fade-in-animation">
                      <div className="text-white text-center">
                        <div className="inline-block rounded-full h-8 w-8 border-2 border-zinc-600 border-t-white mb-4 spin-animation"></div>
                        <p className="text-xs font-light tracking-wider">
                          AUTHENTICATING...
                        </p>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center">
            <p className="text-xs text-zinc-600 tracking-wider">
              © 2024 DRM SUITE - POWERED BY DANDORI WORK
            </p>
            <div className="mt-4 flex justify-center gap-6">
              <a
                href="#"
                className="text-xs text-zinc-500 hover:text-white transition-colors tracking-wider"
              >
                TERMS OF SERVICE
              </a>
              <span className="text-zinc-700">|</span>
              <a
                href="#"
                className="text-xs text-zinc-500 hover:text-white transition-colors tracking-wider"
              >
                PRIVACY POLICY
              </a>
              <span className="text-zinc-700">|</span>
              <a
                href="#"
                className="text-xs text-zinc-500 hover:text-white transition-colors tracking-wider"
              >
                HELP
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .fade-in-animation {
          animation: fadeIn 0.5s ease-out;
        }

        .spin-animation {
          animation: spin 1s linear infinite;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
