'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// テーマ2: モダン・グラデーション（現代的＆スタイリッシュ）
export default function Theme2Page() {
  const router = useRouter();
  const [showDetailModal, setShowDetailModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="backdrop-blur-md bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Customer Management
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                458 total customers • 125 active
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/customers')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Back to Current Design
              </button>
              <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2.5 rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                + Add Customer
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Theme Description */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 mb-8">
          <h3 className="font-semibold text-white mb-2">
            Theme 2: Modern Gradient
          </h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Dark mode based modern design</li>
            <li>• Gradient and glassmorphism effects</li>
            <li>• Tech startup style UI</li>
            <li>• Neon color accents</li>
          </ul>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
            <h4 className="text-3xl font-bold text-white">458</h4>
            <p className="text-sm text-gray-400 mt-1">Total Customers</p>
            <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h4 className="text-3xl font-bold text-white">125</h4>
            <p className="text-sm text-gray-400 mt-1">Active</p>
            <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full w-1/2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h4 className="text-3xl font-bold text-white">¥285M</h4>
            <p className="text-sm text-gray-400 mt-1">Total Value</p>
            <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full w-4/5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
            <h4 className="text-3xl font-bold text-white">72%</h4>
            <p className="text-sm text-gray-400 mt-1">Conversion</p>
            <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full w-[72%] bg-gradient-to-r from-orange-500 to-red-500"></div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search customers..."
                className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <select className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500">
              <option>All Status</option>
              <option>Active</option>
              <option>Prospect</option>
              <option>Inactive</option>
            </select>
            <button className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg hover:bg-gray-800/50 transition-colors">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Customer List */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Customer List
              </h3>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 bg-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">
                  Grid
                </button>
                <button className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400">
                  List
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div
                className="flex items-center justify-between p-4 bg-gray-900/30 hover:bg-gray-900/50 rounded-lg transition-all border border-gray-700/30 cursor-pointer"
                onClick={() => setShowDetailModal(true)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-medium">
                    T
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Tanaka Taro</h4>
                    <p className="text-sm text-gray-400">
                      Tanaka Construction Co. • CEO
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

              <div className="flex items-center justify-between p-4 bg-gray-900/30 hover:bg-gray-900/50 rounded-lg transition-all border border-gray-700/30 cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-medium">
                    S
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Sato Misaki</h4>
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

              <div className="flex items-center justify-between p-4 bg-gray-900/30 hover:bg-gray-900/50 rounded-lg transition-all border border-gray-700/30 cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-medium">
                    S
                  </div>
                  <div>
                    <h4 className="font-medium text-white">
                      Suzuki Corporation
                    </h4>
                    <p className="text-sm text-gray-400">
                      Suzuki Corp. • Purchasing
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-sm text-white font-medium">¥5.2M</p>
                    <p className="text-xs text-gray-500">Value</p>
                  </div>
                  <span className="px-3 py-1 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-lg text-xs font-medium">
                    Lead
                  </span>
                  <button className="text-gray-500 hover:text-cyan-400 transition-colors">
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="mt-6 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 animate-pulse"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-300">
                  New customer{' '}
                  <span className="text-cyan-400">Yamada Corp.</span> added
                </p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-300">
                  Deal closed with{' '}
                  <span className="text-green-400">Tanaka Construction</span>
                </p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">
                  Customer Details
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-medium text-xl">
                  T
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-medium text-white">
                    Tanaka Taro
                  </h4>
                  <p className="text-gray-400">Tanaka Construction Co. • CEO</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-medium">
                      Active
                    </span>
                    <span className="text-sm text-gray-500">
                      ID: CUS-001234
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <h5 className="text-sm font-medium text-cyan-400 mb-3">
                    Contact Information
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2 text-gray-300">
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <span>tanaka@example.com</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <span>090-1234-5678</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>Tokyo, Japan</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <h5 className="text-sm font-medium text-purple-400 mb-3">
                    Transaction Info
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span className="text-gray-500">Total Value</span>
                      <span className="font-medium">¥2,500,000</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span className="text-gray-500">Transactions</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span className="text-gray-500">Last Activity</span>
                      <span className="font-medium">Feb 15, 2024</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-700">
              <div className="flex justify-end space-x-3">
                <button className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  Edit
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
