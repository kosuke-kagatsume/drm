'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// テーマ3: ダーク・エレガント（高級感＆プレミアム）
export default function Theme3Page() {
  const router = useRouter();
  const [showDetailModal, setShowDetailModal] = useState(false);

  return (
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/customers')}
                className="text-zinc-500 hover:text-white transition-colors text-sm tracking-wider"
              >
                RETURN
              </button>
              <div className="w-px h-6 bg-zinc-800"></div>
              <button className="bg-white text-black px-8 py-3 text-sm font-medium tracking-wider hover:bg-zinc-200 transition-colors">
                ADD NEW
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Theme Description */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 mb-8">
          <h3 className="text-sm font-normal text-white tracking-widest mb-3">
            THEME 3: DARK ELEGANT
          </h3>
          <ul className="text-xs text-zinc-400 space-y-2 tracking-wide">
            <li>• Premium luxury design</li>
            <li>• Black-based sophisticated color scheme</li>
            <li>• Typography-focused minimal UI</li>
            <li>• Luxury brand style refined expression</li>
          </ul>
        </div>

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

        {/* Search and Filter */}
        <div className="bg-zinc-950 border border-zinc-800 p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="SEARCH DATABASE"
                className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
              />
            </div>
            <select className="px-6 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 text-sm tracking-wider">
              <option>ALL STATUS</option>
              <option>ACTIVE</option>
              <option>PROSPECT</option>
              <option>INACTIVE</option>
            </select>
            <button className="px-6 py-3 bg-black border border-zinc-800 hover:border-zinc-600 transition-colors">
              <svg
                className="w-4 h-4 text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Customer List */}
        <div className="bg-zinc-950 border border-zinc-800">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-normal text-white tracking-widest">
                CUSTOMER RECORDS
              </h3>
              <div className="flex items-center space-x-4 text-xs tracking-wider">
                <button className="text-zinc-500 hover:text-white transition-colors">
                  SORT BY NAME
                </button>
                <div className="w-px h-4 bg-zinc-800"></div>
                <button className="text-zinc-500 hover:text-white transition-colors">
                  SORT BY VALUE
                </button>
                <div className="w-px h-4 bg-zinc-800"></div>
                <button className="text-zinc-500 hover:text-white transition-colors">
                  SORT BY DATE
                </button>
              </div>
            </div>

            <div className="space-y-0 divide-y divide-zinc-800">
              <div
                className="flex items-center justify-between py-5 hover:bg-zinc-900/50 transition-colors px-4 -mx-4 cursor-pointer"
                onClick={() => setShowDetailModal(true)}
              >
                <div className="flex items-center space-x-6">
                  <div className="w-12 h-12 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-lg">
                    01
                  </div>
                  <div>
                    <h4 className="font-light text-white text-lg">田中 太郎</h4>
                    <p className="text-xs text-zinc-500 tracking-wider mt-1">
                      TANAKA CONSTRUCTION CO., LTD. • CHIEF EXECUTIVE OFFICER
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

              <div className="flex items-center justify-between py-5 hover:bg-zinc-900/50 transition-colors px-4 -mx-4 cursor-pointer">
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

              <div className="flex items-center justify-between py-5 hover:bg-zinc-900/50 transition-colors px-4 -mx-4 cursor-pointer">
                <div className="flex items-center space-x-6">
                  <div className="w-12 h-12 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-lg">
                    03
                  </div>
                  <div>
                    <h4 className="font-light text-white text-lg">鈴木 商事</h4>
                    <p className="text-xs text-zinc-500 tracking-wider mt-1">
                      SUZUKI CORPORATION • PURCHASING DEPARTMENT
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-8">
                  <div className="text-right">
                    <p className="text-sm text-white font-light">¥5,200,000</p>
                    <p className="text-xs text-zinc-600 tracking-wider">
                      LIFETIME VALUE
                    </p>
                  </div>
                  <div className="w-px h-8 bg-zinc-800"></div>
                  <span className="text-xs text-zinc-500 font-light tracking-wider">
                    ● LEAD
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

            {/* Pagination */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-800">
              <p className="text-xs text-zinc-500 tracking-wider">
                SHOWING 1-10 OF 458 RECORDS
              </p>
              <div className="flex items-center space-x-1">
                <button
                  className="px-4 py-2 text-zinc-600 hover:text-white transition-colors text-xs tracking-wider"
                  disabled
                >
                  PREV
                </button>
                <button className="px-4 py-2 bg-white text-black text-xs tracking-wider">
                  01
                </button>
                <button className="px-4 py-2 text-zinc-500 hover:text-white transition-colors text-xs tracking-wider">
                  02
                </button>
                <button className="px-4 py-2 text-zinc-500 hover:text-white transition-colors text-xs tracking-wider">
                  03
                </button>
                <span className="px-2 text-zinc-600">...</span>
                <button className="px-4 py-2 text-zinc-500 hover:text-white transition-colors text-xs tracking-wider">
                  46
                </button>
                <button className="px-4 py-2 text-zinc-500 hover:text-white transition-colors text-xs tracking-wider">
                  NEXT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="p-8 border-b border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-normal text-white tracking-widest">
                    CUSTOMER PROFILE
                  </h3>
                  <p className="text-xs text-zinc-500 mt-2 tracking-wider">
                    ID: CUS-001234
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-start space-x-6 mb-8">
                <div className="w-20 h-20 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-2xl">
                  01
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-thin text-white">田中 太郎</h4>
                  <p className="text-sm text-zinc-500 tracking-wider mt-1">
                    TANAKA CONSTRUCTION CO., LTD.
                  </p>
                  <p className="text-xs text-zinc-600 tracking-wider mt-1">
                    CHIEF EXECUTIVE OFFICER
                  </p>
                  <div className="flex items-center space-x-4 mt-4">
                    <span className="text-xs text-emerald-500 tracking-wider">
                      ● ACTIVE CUSTOMER
                    </span>
                    <div className="w-px h-4 bg-zinc-800"></div>
                    <span className="text-xs text-zinc-500 tracking-wider">
                      SINCE 2019
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="border border-zinc-800 p-6">
                  <h5 className="text-xs font-normal text-white tracking-widest mb-4">
                    CONTACT INFORMATION
                  </h5>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500 tracking-wider">
                        EMAIL
                      </span>
                      <span className="text-white font-light">
                        tanaka@example.com
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 tracking-wider">
                        PHONE
                      </span>
                      <span className="text-white font-light">
                        090-1234-5678
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 tracking-wider">
                        ADDRESS
                      </span>
                      <span className="text-white font-light">
                        Tokyo, Japan
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border border-zinc-800 p-6">
                  <h5 className="text-xs font-normal text-white tracking-widest mb-4">
                    TRANSACTION SUMMARY
                  </h5>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500 tracking-wider">
                        LIFETIME VALUE
                      </span>
                      <span className="text-white font-light">¥2,500,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 tracking-wider">
                        TRANSACTIONS
                      </span>
                      <span className="text-white font-light">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 tracking-wider">
                        LAST ACTIVITY
                      </span>
                      <span className="text-white font-light">
                        FEB 15, 2024
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-zinc-800">
                <h5 className="text-xs font-normal text-white tracking-widest mb-4">
                  RECENT ACTIVITY
                </h5>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 font-light">
                      Contract signed for new project
                    </span>
                    <span className="text-zinc-600 text-xs tracking-wider">
                      FEB 15, 2024
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 font-light">
                      Meeting scheduled for consultation
                    </span>
                    <span className="text-zinc-600 text-xs tracking-wider">
                      FEB 10, 2024
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 font-light">
                      Quote sent for renovation project
                    </span>
                    <span className="text-zinc-600 text-xs tracking-wider">
                      FEB 05, 2024
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-zinc-800">
              <div className="flex justify-between">
                <button className="text-zinc-500 hover:text-white transition-colors text-xs tracking-wider">
                  DELETE RECORD
                </button>
                <div className="flex space-x-4">
                  <button className="px-6 py-3 border border-zinc-800 text-white hover:bg-zinc-900 transition-colors text-xs tracking-wider">
                    EDIT
                  </button>
                  <button className="px-6 py-3 bg-white text-black hover:bg-zinc-200 transition-colors text-xs tracking-wider font-medium">
                    VIEW FULL PROFILE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
