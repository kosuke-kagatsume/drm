'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function StrategyAnalysisPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [selectedAnalysis, setSelectedAnalysis] = useState('swot');
  const [selectedScenario, setSelectedScenario] = useState('base');

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  const swotData = {
    strengths: [
      { item: '地域No.1の施工実績', impact: 'high' },
      { item: '熟練職人による高品質施工', impact: 'high' },
      { item: '充実したアフターサービス', impact: 'medium' },
      { item: '強固な顧客基盤', impact: 'high' },
    ],
    weaknesses: [
      { item: '若手人材の不足', impact: 'high' },
      { item: 'デジタル化の遅れ', impact: 'medium' },
      { item: '営業エリアの限定', impact: 'low' },
      { item: '原価率の上昇傾向', impact: 'medium' },
    ],
    opportunities: [
      { item: '省エネリフォーム需要の拡大', impact: 'high' },
      { item: '補助金制度の充実', impact: 'medium' },
      { item: '高齢化による需要増', impact: 'high' },
      { item: '新規エリアへの展開可能性', impact: 'medium' },
    ],
    threats: [
      { item: '競合他社の参入増加', impact: 'high' },
      { item: '原材料価格の高騰', impact: 'high' },
      { item: '職人不足の深刻化', impact: 'medium' },
      { item: '景気後退リスク', impact: 'low' },
    ],
  };

  const strategicGoals = [
    {
      goal: '売上高200億円達成',
      current: 125,
      target: 200,
      deadline: '2025年度',
      progress: 62.5,
      status: 'on-track',
      initiatives: [
        '新規エリア3拠点開設',
        'デジタルマーケティング強化',
        '大型案件獲得体制構築',
      ],
    },
    {
      goal: '営業利益率15%達成',
      current: 12,
      target: 15,
      deadline: '2024年度',
      progress: 80,
      status: 'at-risk',
      initiatives: [
        '原価管理システム導入',
        '業務効率化推進',
        '高付加価値サービス展開',
      ],
    },
    {
      goal: '顧客満足度95%以上',
      current: 92,
      target: 95,
      deadline: '2024年Q4',
      progress: 96.8,
      status: 'on-track',
      initiatives: [
        'カスタマーサクセス体制強化',
        'アフターサービス充実',
        'デジタル接点改善',
      ],
    },
  ];

  const scenarioAnalysis = {
    base: {
      revenue: 145000000,
      profit: 18850000,
      growth: 16,
      probability: 60,
    },
    optimistic: {
      revenue: 165000000,
      profit: 24750000,
      growth: 32,
      probability: 25,
    },
    pessimistic: {
      revenue: 115000000,
      profit: 10350000,
      growth: -8,
      probability: 15,
    },
  };

  const competitorAnalysis = [
    {
      name: '競合A社',
      marketShare: 22,
      strengths: '低価格戦略',
      weaknesses: '品質のばらつき',
      threat: 'high',
    },
    {
      name: '競合B社',
      marketShare: 18,
      strengths: '広告宣伝力',
      weaknesses: 'アフターサービス',
      threat: 'medium',
    },
    {
      name: '自社',
      marketShare: 15,
      strengths: '高品質・信頼性',
      weaknesses: '価格競争力',
      threat: 'self',
    },
    {
      name: '競合C社',
      marketShare: 12,
      strengths: 'エリア密着',
      weaknesses: '規模の限界',
      threat: 'low',
    },
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-100 text-green-800';
      case 'at-risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← ダッシュボード
              </button>
              <h1 className="text-2xl font-bold text-gray-900">🎯 戦略分析</h1>
            </div>

            <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              📥 戦略レポート出力
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Analysis Type Selector */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex space-x-1 p-1">
            {[
              { id: 'swot', label: 'SWOT分析' },
              { id: 'goals', label: '戦略目標' },
              { id: 'scenario', label: 'シナリオ分析' },
              { id: 'competitor', label: '競合分析' },
              { id: 'growth', label: '成長戦略' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedAnalysis(type.id)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                  selectedAnalysis === type.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* SWOT Analysis */}
        {selectedAnalysis === 'swot' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-green-50 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                💪 強み (Strengths)
              </h3>
              <div className="space-y-3">
                {swotData.strengths.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-3 rounded-lg flex justify-between items-center"
                  >
                    <span className="text-sm font-medium">{item.item}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(item.impact)}`}
                    >
                      {item.impact === 'high'
                        ? '高'
                        : item.impact === 'medium'
                          ? '中'
                          : '低'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="bg-red-50 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-4">
                ⚠️ 弱み (Weaknesses)
              </h3>
              <div className="space-y-3">
                {swotData.weaknesses.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-3 rounded-lg flex justify-between items-center"
                  >
                    <span className="text-sm font-medium">{item.item}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(item.impact)}`}
                    >
                      {item.impact === 'high'
                        ? '高'
                        : item.impact === 'medium'
                          ? '中'
                          : '低'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunities */}
            <div className="bg-blue-50 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                🚀 機会 (Opportunities)
              </h3>
              <div className="space-y-3">
                {swotData.opportunities.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-3 rounded-lg flex justify-between items-center"
                  >
                    <span className="text-sm font-medium">{item.item}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(item.impact)}`}
                    >
                      {item.impact === 'high'
                        ? '高'
                        : item.impact === 'medium'
                          ? '中'
                          : '低'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Threats */}
            <div className="bg-orange-50 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-orange-800 mb-4">
                ⚡ 脅威 (Threats)
              </h3>
              <div className="space-y-3">
                {swotData.threats.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-3 rounded-lg flex justify-between items-center"
                  >
                    <span className="text-sm font-medium">{item.item}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(item.impact)}`}
                    >
                      {item.impact === 'high'
                        ? '高'
                        : item.impact === 'medium'
                          ? '中'
                          : '低'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Strategic Goals */}
        {selectedAnalysis === 'goals' && (
          <div className="space-y-6">
            {strategicGoals.map((goal, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {goal.goal}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      期限: {goal.deadline}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(goal.status)}`}
                  >
                    {goal.status === 'on-track'
                      ? '順調'
                      : goal.status === 'at-risk'
                        ? '要注意'
                        : '遅延'}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>
                      進捗: {goal.current} / {goal.target}
                    </span>
                    <span className="font-medium">{goal.progress}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        goal.status === 'on-track'
                          ? 'bg-green-500'
                          : goal.status === 'at-risk'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    主要施策
                  </h4>
                  <div className="space-y-2">
                    {goal.initiatives.map((initiative, iIdx) => (
                      <div key={iIdx} className="flex items-center space-x-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-sm text-gray-600">
                          {initiative}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Scenario Analysis */}
        {selectedAnalysis === 'scenario' && (
          <>
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  📈 シナリオ別予測
                </h3>

                <div className="flex space-x-2 mb-6">
                  {Object.keys(scenarioAnalysis).map((scenario) => (
                    <button
                      key={scenario}
                      onClick={() => setSelectedScenario(scenario)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                        selectedScenario === scenario
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {scenario === 'base'
                        ? '基本シナリオ'
                        : scenario === 'optimistic'
                          ? '楽観シナリオ'
                          : '悲観シナリオ'}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">売上高予測</p>
                    <p className="text-3xl font-bold text-blue-600">
                      ¥
                      {(
                        scenarioAnalysis[
                          selectedScenario as keyof typeof scenarioAnalysis
                        ].revenue / 1000000
                      ).toFixed(0)}
                      M
                    </p>
                    <p
                      className={`text-sm mt-1 ${
                        scenarioAnalysis[
                          selectedScenario as keyof typeof scenarioAnalysis
                        ].growth >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {scenarioAnalysis[
                        selectedScenario as keyof typeof scenarioAnalysis
                      ].growth >= 0
                        ? '+'
                        : ''}
                      {
                        scenarioAnalysis[
                          selectedScenario as keyof typeof scenarioAnalysis
                        ].growth
                      }
                      %
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">営業利益予測</p>
                    <p className="text-3xl font-bold text-green-600">
                      ¥
                      {(
                        scenarioAnalysis[
                          selectedScenario as keyof typeof scenarioAnalysis
                        ].profit / 1000000
                      ).toFixed(1)}
                      M
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      利益率:{' '}
                      {(
                        (scenarioAnalysis[
                          selectedScenario as keyof typeof scenarioAnalysis
                        ].profit /
                          scenarioAnalysis[
                            selectedScenario as keyof typeof scenarioAnalysis
                          ].revenue) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">実現確率</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {
                        scenarioAnalysis[
                          selectedScenario as keyof typeof scenarioAnalysis
                        ].probability
                      }
                      %
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">リスクレベル</p>
                    <div
                      className={`inline-block px-4 py-2 rounded-lg ${
                        selectedScenario === 'optimistic'
                          ? 'bg-yellow-100 text-yellow-800'
                          : selectedScenario === 'pessimistic'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      <span className="text-lg font-bold">
                        {selectedScenario === 'optimistic'
                          ? '中'
                          : selectedScenario === 'pessimistic'
                            ? '高'
                            : '低'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">
                    シナリオの前提条件
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {selectedScenario === 'base' && (
                      <>
                        <li>• 市場成長率: 年率5-7%</li>
                        <li>• 原材料価格: 現状維持〜微増</li>
                        <li>• 競合環境: 現状維持</li>
                      </>
                    )}
                    {selectedScenario === 'optimistic' && (
                      <>
                        <li>• 市場成長率: 年率10%以上</li>
                        <li>• 新規事業の成功</li>
                        <li>• 大型案件の連続受注</li>
                      </>
                    )}
                    {selectedScenario === 'pessimistic' && (
                      <>
                        <li>• 景気後退による需要減</li>
                        <li>• 原材料価格の大幅上昇</li>
                        <li>• 競合の価格攻勢激化</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Competitor Analysis */}
        {selectedAnalysis === 'competitor' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-6">🏆 競合分析</h3>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  市場シェア
                </h4>
                <div className="space-y-3">
                  {competitorAnalysis.map((company) => (
                    <div key={company.name}>
                      <div className="flex justify-between items-center mb-1">
                        <span
                          className={`font-medium ${company.threat === 'self' ? 'text-blue-600' : 'text-gray-700'}`}
                        >
                          {company.name}
                        </span>
                        <span className="text-sm font-bold">
                          {company.marketShare}%
                        </span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-6">
                        <div
                          className={`h-6 rounded-full flex items-center justify-end pr-2 ${
                            company.threat === 'self'
                              ? 'bg-blue-500'
                              : company.threat === 'high'
                                ? 'bg-red-500'
                                : company.threat === 'medium'
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                          }`}
                          style={{ width: `${company.marketShare}%` }}
                        >
                          <span className="text-xs text-white font-medium">
                            {company.marketShare}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        企業名
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        強み
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        弱み
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                        脅威度
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {competitorAnalysis
                      .filter((c) => c.threat !== 'self')
                      .map((company) => (
                        <tr key={company.name}>
                          <td className="px-4 py-3 font-medium">
                            {company.name}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {company.strengths}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {company.weaknesses}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                company.threat === 'high'
                                  ? 'bg-red-100 text-red-800'
                                  : company.threat === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {company.threat === 'high'
                                ? '高'
                                : company.threat === 'medium'
                                  ? '中'
                                  : '低'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">
                  競争優位性の構築
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <div className="bg-white p-3 rounded">
                    <h5 className="font-medium text-sm mb-1">差別化戦略</h5>
                    <p className="text-xs text-gray-600">
                      高品質施工とアフターサービスで差別化
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <h5 className="font-medium text-sm mb-1">コスト戦略</h5>
                    <p className="text-xs text-gray-600">
                      業務効率化による原価削減
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <h5 className="font-medium text-sm mb-1">集中戦略</h5>
                    <p className="text-xs text-gray-600">
                      高付加価値セグメントへの集中
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Growth Strategy */}
        {selectedAnalysis === 'growth' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 text-purple-800">
                🌱 成長戦略マトリックス
              </h3>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-blue-600 mb-3">
                    市場浸透戦略
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    既存市場×既存製品
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span>顧客シェア拡大キャンペーン</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span>リピート率向上施策</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span>紹介制度の強化</span>
                    </li>
                  </ul>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500">期待効果: 売上+15%</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-green-600 mb-3">
                    市場開拓戦略
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">新市場×既存製品</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span>隣接エリアへの進出</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span>法人市場の開拓</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span>オンライン販路構築</span>
                    </li>
                  </ul>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500">期待効果: 売上+25%</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-orange-600 mb-3">
                    製品開発戦略
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">既存市場×新製品</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span>省エネリフォームサービス</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span>メンテナンスパッケージ</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span>IoT連携サービス</span>
                    </li>
                  </ul>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500">期待効果: 売上+20%</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-purple-600 mb-3">
                    多角化戦略
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">新市場×新製品</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span>不動産仲介事業</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span>建材販売事業</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span>コンサルティング事業</span>
                    </li>
                  </ul>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500">期待効果: 売上+30%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                📅 実行ロードマップ
              </h3>

              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-24 text-sm font-medium">Q1 2024</div>
                  <div className="flex-1 bg-blue-100 rounded-lg p-3 ml-4">
                    <p className="font-medium text-blue-800">
                      基盤強化フェーズ
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      業務効率化、デジタル化推進
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-24 text-sm font-medium">Q2 2024</div>
                  <div className="flex-1 bg-green-100 rounded-lg p-3 ml-4">
                    <p className="font-medium text-green-800">
                      市場拡大フェーズ
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      新エリア進出、マーケティング強化
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-24 text-sm font-medium">Q3 2024</div>
                  <div className="flex-1 bg-orange-100 rounded-lg p-3 ml-4">
                    <p className="font-medium text-orange-800">
                      サービス拡充フェーズ
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      新サービス投入、付加価値向上
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-24 text-sm font-medium">Q4 2024</div>
                  <div className="flex-1 bg-purple-100 rounded-lg p-3 ml-4">
                    <p className="font-medium text-purple-800">
                      成長加速フェーズ
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      M&A検討、新規事業立ち上げ
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
