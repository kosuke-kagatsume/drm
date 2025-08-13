'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// テーマ1: プロフェッショナル・ミニマル（シンプル＆洗練）
const Theme1 = () => (
  <div className="min-h-screen bg-gray-50">
    {/* Header */}
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-light text-gray-900">顧客管理</h1>
            <p className="text-sm text-gray-500 mt-1">
              Customer Relationship Management
            </p>
          </div>
          <button className="bg-gray-900 text-white px-6 py-2.5 rounded-md hover:bg-gray-800 transition-colors">
            + 新規顧客
          </button>
        </div>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-3xl font-light text-gray-900">458</h4>
          <p className="text-sm text-gray-500 mt-1">総顧客数</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-3xl font-light text-gray-900">125</h4>
          <p className="text-sm text-gray-500 mt-1">アクティブ</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-3xl font-light text-gray-900">¥285M</h4>
          <p className="text-sm text-gray-500 mt-1">総価値</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-3xl font-light text-gray-900">72%</h4>
          <p className="text-sm text-gray-500 mt-1">成約率</p>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-light text-gray-900 mb-4">顧客リスト</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                  田
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">田中太郎</h4>
                  <p className="text-sm text-gray-500">田中建設株式会社</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm text-gray-900">¥2.5M</p>
                  <p className="text-xs text-gray-500">顧客価値</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  アクティブ
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                  佐
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">佐藤美咲</h4>
                  <p className="text-sm text-gray-500">個人顧客</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm text-gray-900">¥1.8M</p>
                  <p className="text-xs text-gray-500">顧客価値</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  見込み
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// テーマ2: モダン・グラデーション（現代的＆スタイリッシュ）
const Theme2 = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    {/* Header */}
    <div className="backdrop-blur-md bg-black/30 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Customer Management
            </h1>
            <p className="text-sm text-gray-400 mt-1">458 total customers</p>
          </div>
          <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2.5 rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all">
            + Add Customer
          </button>
        </div>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
          <h4 className="text-3xl font-bold text-white">458</h4>
          <p className="text-sm text-gray-400 mt-1">Total Customers</p>
          <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
          <h4 className="text-3xl font-bold text-white">125</h4>
          <p className="text-sm text-gray-400 mt-1">Active</p>
          <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
          <h4 className="text-3xl font-bold text-white">¥285M</h4>
          <p className="text-sm text-gray-400 mt-1">Total Value</p>
          <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full w-4/5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
          <h4 className="text-3xl font-bold text-white">72%</h4>
          <p className="text-sm text-gray-400 mt-1">Conversion</p>
          <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full w-[72%] bg-gradient-to-r from-orange-500 to-red-500"></div>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Customer List
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-900/30 hover:bg-gray-900/50 rounded-lg transition-all border border-gray-700/30">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-medium">
                  T
                </div>
                <div>
                  <h4 className="font-medium text-white">田中太郎</h4>
                  <p className="text-sm text-gray-400">
                    Tanaka Construction Co.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm text-white font-medium">¥2.5M</p>
                  <p className="text-xs text-gray-500">Value</p>
                </div>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-medium">
                  Active
                </span>
                <button className="text-gray-500 hover:text-cyan-400 transition-colors">
                  →
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-900/30 hover:bg-gray-900/50 rounded-lg transition-all border border-gray-700/30">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-medium">
                  S
                </div>
                <div>
                  <h4 className="font-medium text-white">佐藤美咲</h4>
                  <p className="text-sm text-gray-400">Individual Customer</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm text-white font-medium">¥1.8M</p>
                  <p className="text-xs text-gray-500">Value</p>
                </div>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium">
                  Prospect
                </span>
                <button className="text-gray-500 hover:text-cyan-400 transition-colors">
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// テーマ3: ダーク・エレガント（高級感＆プレミアム）
const Theme3 = () => (
  <div className="min-h-screen bg-black">
    {/* Header */}
    <div className="bg-zinc-950 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-thin text-white tracking-widest">
              CUSTOMER DATABASE
            </h1>
            <p className="text-xs text-zinc-500 mt-2 tracking-wider">
              PREMIUM CRM SYSTEM
            </p>
          </div>
          <button className="bg-white text-black px-8 py-3 text-sm font-medium tracking-wider hover:bg-zinc-200 transition-colors">
            ADD NEW
          </button>
        </div>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-zinc-950 p-6 border border-zinc-800 hover:border-zinc-700 transition-colors">
          <p className="text-xs text-zinc-500 tracking-wider mb-2">
            TOTAL CUSTOMERS
          </p>
          <h4 className="text-4xl font-thin text-white">458</h4>
          <div className="mt-4 flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-xs text-emerald-500">+12.3%</span>
          </div>
        </div>
        <div className="bg-zinc-950 p-6 border border-zinc-800 hover:border-zinc-700 transition-colors">
          <p className="text-xs text-zinc-500 tracking-wider mb-2">
            ACTIVE NOW
          </p>
          <h4 className="text-4xl font-thin text-white">125</h4>
          <div className="mt-4 flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-xs text-emerald-500">+5.7%</span>
          </div>
        </div>
        <div className="bg-zinc-950 p-6 border border-zinc-800 hover:border-zinc-700 transition-colors">
          <p className="text-xs text-zinc-500 tracking-wider mb-2">
            TOTAL VALUE
          </p>
          <h4 className="text-4xl font-thin text-white">¥285M</h4>
          <div className="mt-4 flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-xs text-emerald-500">+18.9%</span>
          </div>
        </div>
        <div className="bg-zinc-950 p-6 border border-zinc-800 hover:border-zinc-700 transition-colors">
          <p className="text-xs text-zinc-500 tracking-wider mb-2">
            CONVERSION RATE
          </p>
          <h4 className="text-4xl font-thin text-white">72%</h4>
          <div className="mt-4 flex items-center space-x-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <span className="text-xs text-amber-500">-2.1%</span>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-zinc-950 border border-zinc-800">
        <div className="p-6">
          <h3 className="text-sm font-normal text-white tracking-widest mb-6">
            CUSTOMER RECORDS
          </h3>
          <div className="space-y-0 divide-y divide-zinc-800">
            <div className="flex items-center justify-between py-5 hover:bg-zinc-900/50 transition-colors px-4 -mx-4">
              <div className="flex items-center space-x-6">
                <div className="w-12 h-12 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-lg">
                  01
                </div>
                <div>
                  <h4 className="font-light text-white text-lg">田中 太郎</h4>
                  <p className="text-xs text-zinc-500 tracking-wider mt-1">
                    TANAKA CONSTRUCTION CO., LTD.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-8">
                <div className="text-right">
                  <p className="text-sm text-white font-light">¥2,500,000</p>
                  <p className="text-xs text-zinc-600 tracking-wider">
                    LIFETIME VALUE
                  </p>
                </div>
                <div className="w-px h-8 bg-zinc-800"></div>
                <span className="text-xs text-emerald-500 font-light tracking-wider">
                  ● ACTIVE
                </span>
                <button className="text-zinc-600 hover:text-white transition-colors">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between py-5 hover:bg-zinc-900/50 transition-colors px-4 -mx-4">
              <div className="flex items-center space-x-6">
                <div className="w-12 h-12 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-lg">
                  02
                </div>
                <div>
                  <h4 className="font-light text-white text-lg">佐藤 美咲</h4>
                  <p className="text-xs text-zinc-500 tracking-wider mt-1">
                    INDIVIDUAL CUSTOMER
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-8">
                <div className="text-right">
                  <p className="text-sm text-white font-light">¥1,800,000</p>
                  <p className="text-xs text-zinc-600 tracking-wider">
                    LIFETIME VALUE
                  </p>
                </div>
                <div className="w-px h-8 bg-zinc-800"></div>
                <span className="text-xs text-blue-500 font-light tracking-wider">
                  ● PROSPECT
                </span>
                <button className="text-zinc-600 hover:text-white transition-colors">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function ThemePreviewPage() {
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState(1);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Theme Selector */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                CRMデザインテーマ選択
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                3つのデザインから選んでください
              </p>
            </div>
            <button
              onClick={() => router.push('/customers')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← 戻る
            </button>
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              onClick={() => setSelectedTheme(1)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedTheme === 1
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              テーマ1: プロフェッショナル・ミニマル
            </button>
            <button
              onClick={() => setSelectedTheme(2)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedTheme === 2
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              テーマ2: モダン・グラデーション
            </button>
            <button
              onClick={() => setSelectedTheme(3)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedTheme === 3
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              テーマ3: ダーク・エレガント
            </button>
          </div>
        </div>
      </div>

      {/* Theme Preview */}
      <div className="mt-8">
        {selectedTheme === 1 && (
          <div>
            <div className="max-w-7xl mx-auto px-6 mb-4">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">
                  テーマ1: プロフェッショナル・ミニマル
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• シンプルで洗練されたデザイン</li>
                  <li>• 絵文字を排除し、アイコンとテキストで構成</li>
                  <li>• モノトーンベースで落ち着いた配色</li>
                  <li>• ビジネスシーンに最適な信頼感のあるUI</li>
                </ul>
              </div>
            </div>
            <Theme1 />
          </div>
        )}

        {selectedTheme === 2 && (
          <div>
            <div className="max-w-7xl mx-auto px-6 mb-4">
              <div className="bg-gray-800 p-6 rounded-lg text-white">
                <h3 className="font-semibold mb-2">
                  テーマ2: モダン・グラデーション
                </h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• ダークモードベースの現代的デザイン</li>
                  <li>• グラデーションとグラスモーフィズム効果</li>
                  <li>• テック系スタートアップ風のスタイリッシュなUI</li>
                  <li>• ネオンカラーのアクセント</li>
                </ul>
              </div>
            </div>
            <Theme2 />
          </div>
        )}

        {selectedTheme === 3 && (
          <div>
            <div className="max-w-7xl mx-auto px-6 mb-4">
              <div className="bg-zinc-900 p-6 rounded-lg text-white border border-zinc-800">
                <h3 className="font-semibold mb-2">
                  テーマ3: ダーク・エレガント
                </h3>
                <ul className="text-sm text-zinc-400 space-y-1">
                  <li>• 高級感あふれるプレミアムデザイン</li>
                  <li>• 黒基調の重厚な配色</li>
                  <li>• タイポグラフィを重視したミニマルUI</li>
                  <li>• ラグジュアリーブランド風の洗練された表現</li>
                </ul>
              </div>
            </div>
            <Theme3 />
          </div>
        )}
      </div>

      {/* Apply Button */}
      <div className="fixed bottom-8 right-8">
        <button className="bg-green-600 text-white px-8 py-4 rounded-lg shadow-lg hover:bg-green-700 transition-colors font-medium">
          このテーマを適用する
        </button>
      </div>
    </div>
  );
}
