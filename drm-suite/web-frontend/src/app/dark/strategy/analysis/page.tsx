'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DarkStrategyAnalysisPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [selectedAnalysis, setSelectedAnalysis] = useState('swot');
  const [selectedScenario, setSelectedScenario] = useState('base');

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-500 mx-auto"></div>
          <p className="mt-4 text-zinc-500 text-xs tracking-wider">
            LOADING...
          </p>
        </div>
      </div>
    );
  }

  const swotData = {
    strengths: [
      { item: 'REGIONAL #1 CONSTRUCTION TRACK RECORD', impact: 'high' },
      { item: 'HIGH-QUALITY WORK BY SKILLED CRAFTSMEN', impact: 'high' },
      { item: 'COMPREHENSIVE AFTER-SALES SERVICE', impact: 'medium' },
      { item: 'STRONG CUSTOMER BASE', impact: 'high' },
    ],
    weaknesses: [
      { item: 'SHORTAGE OF YOUNG TALENT', impact: 'high' },
      { item: 'DELAYED DIGITALIZATION', impact: 'medium' },
      { item: 'LIMITED SALES AREA', impact: 'low' },
      { item: 'RISING COST RATIOS', impact: 'medium' },
    ],
    opportunities: [
      {
        item: 'GROWING DEMAND FOR ENERGY-EFFICIENT RENOVATION',
        impact: 'high',
      },
      { item: 'ENHANCED SUBSIDY PROGRAMS', impact: 'medium' },
      { item: 'INCREASED DEMAND DUE TO AGING POPULATION', impact: 'high' },
      { item: 'POTENTIAL EXPANSION TO NEW AREAS', impact: 'medium' },
    ],
    threats: [
      { item: 'INCREASED COMPETITOR ENTRY', impact: 'high' },
      { item: 'RISING RAW MATERIAL PRICES', impact: 'high' },
      { item: 'WORSENING CRAFTSMAN SHORTAGE', impact: 'medium' },
      { item: 'ECONOMIC RECESSION RISK', impact: 'low' },
    ],
  };

  const strategicGoals = [
    {
      goal: 'ACHIEVE ¥20B REVENUE TARGET',
      current: 125,
      target: 200,
      deadline: 'FY2025',
      progress: 62.5,
      status: 'on-track',
      initiatives: [
        'ESTABLISH 3 NEW REGIONAL OFFICES',
        'STRENGTHEN DIGITAL MARKETING',
        'BUILD LARGE PROJECT ACQUISITION SYSTEM',
      ],
    },
    {
      goal: 'ACHIEVE 15% OPERATING PROFIT MARGIN',
      current: 12,
      target: 15,
      deadline: 'FY2024',
      progress: 80,
      status: 'at-risk',
      initiatives: [
        'IMPLEMENT COST MANAGEMENT SYSTEM',
        'PROMOTE OPERATIONAL EFFICIENCY',
        'DEPLOY HIGH-VALUE SERVICES',
      ],
    },
    {
      goal: 'ACHIEVE 95%+ CUSTOMER SATISFACTION',
      current: 92,
      target: 95,
      deadline: 'Q4 2024',
      progress: 96.8,
      status: 'on-track',
      initiatives: [
        'STRENGTHEN CUSTOMER SUCCESS STRUCTURE',
        'ENHANCE AFTER-SALES SERVICE',
        'IMPROVE DIGITAL TOUCHPOINTS',
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
      name: 'COMPETITOR A',
      marketShare: 22,
      strengths: 'LOW-PRICE STRATEGY',
      weaknesses: 'QUALITY INCONSISTENCY',
      threat: 'high',
    },
    {
      name: 'COMPETITOR B',
      marketShare: 18,
      strengths: 'ADVERTISING POWER',
      weaknesses: 'AFTER-SALES SERVICE',
      threat: 'medium',
    },
    {
      name: 'OUR COMPANY',
      marketShare: 15,
      strengths: 'HIGH QUALITY • RELIABILITY',
      weaknesses: 'PRICE COMPETITIVENESS',
      threat: 'self',
    },
    {
      name: 'COMPETITOR C',
      marketShare: 12,
      strengths: 'LOCAL FOCUS',
      weaknesses: 'SCALE LIMITATIONS',
      threat: 'low',
    },
  ];

  const getImpactBadge = (impact: string) => {
    const config = {
      high: {
        color: 'text-red-500 border-red-500/50',
        label: 'HIGH',
        indicator: '03',
      },
      medium: {
        color: 'text-amber-500 border-amber-500/50',
        label: 'MEDIUM',
        indicator: '02',
      },
      low: {
        color: 'text-emerald-500 border-emerald-500/50',
        label: 'LOW',
        indicator: '01',
      },
    };

    const badge = config[impact as keyof typeof config] || config.low;

    return (
      <span
        className={`px-3 py-1 border text-xs tracking-wider ${badge.color} flex items-center gap-2 inline-flex`}
      >
        <span>{badge.indicator}</span>
        <span>{badge.label}</span>
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const config = {
      'on-track': {
        color: 'text-emerald-500 border-emerald-500/50',
        label: 'ON TRACK',
        indicator: '01',
      },
      'at-risk': {
        color: 'text-amber-500 border-amber-500/50',
        label: 'AT RISK',
        indicator: '02',
      },
      delayed: {
        color: 'text-red-500 border-red-500/50',
        label: 'DELAYED',
        indicator: '03',
      },
    };

    const badge = config[status as keyof typeof config] || config['on-track'];

    return (
      <span
        className={`px-3 py-1 border text-xs tracking-wider ${badge.color} flex items-center gap-2 inline-flex`}
      >
        <span>{badge.indicator}</span>
        <span>{badge.label}</span>
      </span>
    );
  };

  const getThreatLevel = (threat: string) => {
    const config = {
      high: {
        color: 'text-red-500 border-red-500/50',
        label: 'HIGH',
        indicator: '03',
      },
      medium: {
        color: 'text-amber-500 border-amber-500/50',
        label: 'MEDIUM',
        indicator: '02',
      },
      low: {
        color: 'text-emerald-500 border-emerald-500/50',
        label: 'LOW',
        indicator: '01',
      },
    };

    const badge = config[threat as keyof typeof config] || config.low;

    return (
      <span
        className={`px-3 py-1 border text-xs tracking-wider ${badge.color} flex items-center gap-2 inline-flex`}
      >
        <span>{badge.indicator}</span>
        <span>{badge.label}</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dark/dashboard')}
                className="text-zinc-500 hover:text-white transition-colors text-xs tracking-wider"
              >
                ← DASHBOARD
              </button>
              <div className="w-px h-6 bg-zinc-800"></div>
              <h1 className="text-2xl font-thin text-white tracking-widest">
                STRATEGIC ANALYSIS
              </h1>
            </div>

            <button className="px-6 py-3 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors">
              EXPORT STRATEGY REPORT
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Analysis Type Selector */}
        <div className="bg-zinc-950 border border-zinc-800 mb-8">
          <div className="flex">
            {[
              { id: 'swot', label: 'SWOT ANALYSIS' },
              { id: 'goals', label: 'STRATEGIC GOALS' },
              { id: 'scenario', label: 'SCENARIO ANALYSIS' },
              { id: 'competitor', label: 'COMPETITOR ANALYSIS' },
              { id: 'growth', label: 'GROWTH STRATEGY' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedAnalysis(type.id)}
                className={`flex-1 py-4 px-6 text-xs tracking-wider transition-colors ${
                  selectedAnalysis === type.id
                    ? 'bg-white text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* SWOT Analysis */}
        {selectedAnalysis === 'swot' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Strengths */}
            <div className="bg-zinc-950 border border-zinc-800 p-6">
              <h3 className="text-sm font-normal text-emerald-500 mb-6 tracking-widest">
                STRENGTHS
              </h3>
              <div className="space-y-4">
                {swotData.strengths.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-black border border-zinc-800 p-4 flex justify-between items-start"
                  >
                    <span className="text-sm font-light text-white tracking-wider flex-1 mr-4">
                      {item.item}
                    </span>
                    {getImpactBadge(item.impact)}
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="bg-zinc-950 border border-zinc-800 p-6">
              <h3 className="text-sm font-normal text-red-500 mb-6 tracking-widest">
                WEAKNESSES
              </h3>
              <div className="space-y-4">
                {swotData.weaknesses.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-black border border-zinc-800 p-4 flex justify-between items-start"
                  >
                    <span className="text-sm font-light text-white tracking-wider flex-1 mr-4">
                      {item.item}
                    </span>
                    {getImpactBadge(item.impact)}
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunities */}
            <div className="bg-zinc-950 border border-zinc-800 p-6">
              <h3 className="text-sm font-normal text-blue-500 mb-6 tracking-widest">
                OPPORTUNITIES
              </h3>
              <div className="space-y-4">
                {swotData.opportunities.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-black border border-zinc-800 p-4 flex justify-between items-start"
                  >
                    <span className="text-sm font-light text-white tracking-wider flex-1 mr-4">
                      {item.item}
                    </span>
                    {getImpactBadge(item.impact)}
                  </div>
                ))}
              </div>
            </div>

            {/* Threats */}
            <div className="bg-zinc-950 border border-zinc-800 p-6">
              <h3 className="text-sm font-normal text-amber-500 mb-6 tracking-widest">
                THREATS
              </h3>
              <div className="space-y-4">
                {swotData.threats.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-black border border-zinc-800 p-4 flex justify-between items-start"
                  >
                    <span className="text-sm font-light text-white tracking-wider flex-1 mr-4">
                      {item.item}
                    </span>
                    {getImpactBadge(item.impact)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Strategic Goals */}
        {selectedAnalysis === 'goals' && (
          <div className="space-y-8">
            {strategicGoals.map((goal, idx) => (
              <div key={idx} className="bg-zinc-950 border border-zinc-800 p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs mt-1">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <h3 className="text-lg font-light text-white tracking-wider">
                        {goal.goal}
                      </h3>
                      <p className="text-xs text-zinc-500 tracking-wider mt-2">
                        DEADLINE: {goal.deadline}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(goal.status)}
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-zinc-400 tracking-wider">
                      PROGRESS: {goal.current} / {goal.target}
                    </span>
                    <span className="text-white font-light tracking-wider">
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="bg-zinc-800 h-2">
                    <div
                      className={`h-2 ${
                        goal.status === 'on-track'
                          ? 'bg-emerald-500'
                          : goal.status === 'at-risk'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs text-zinc-500 tracking-widest mb-4">
                    KEY INITIATIVES
                  </h4>
                  <div className="space-y-3">
                    {goal.initiatives.map((initiative, iIdx) => (
                      <div key={iIdx} className="flex items-center space-x-3">
                        <div className="w-1 h-1 bg-zinc-600"></div>
                        <span className="text-sm text-zinc-300 tracking-wider">
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
            <div className="bg-zinc-950 border border-zinc-800 mb-8">
              <div className="p-6">
                <h3 className="text-sm font-normal text-white mb-6 tracking-widest">
                  SCENARIO FORECASTING
                </h3>

                <div className="flex border border-zinc-800 mb-8">
                  {Object.keys(scenarioAnalysis).map((scenario) => (
                    <button
                      key={scenario}
                      onClick={() => setSelectedScenario(scenario)}
                      className={`flex-1 py-3 px-6 text-xs tracking-wider transition-colors ${
                        selectedScenario === scenario
                          ? 'bg-white text-black'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {scenario === 'base'
                        ? 'BASE SCENARIO'
                        : scenario === 'optimistic'
                          ? 'OPTIMISTIC SCENARIO'
                          : 'PESSIMISTIC SCENARIO'}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="text-center">
                    <p className="text-xs text-zinc-500 tracking-wider mb-3">
                      REVENUE FORECAST
                    </p>
                    <p className="text-3xl font-thin text-blue-500">
                      ¥
                      {(
                        scenarioAnalysis[
                          selectedScenario as keyof typeof scenarioAnalysis
                        ].revenue / 1000000
                      ).toFixed(0)}
                      M
                    </p>
                    <p
                      className={`text-xs mt-2 tracking-wider ${
                        scenarioAnalysis[
                          selectedScenario as keyof typeof scenarioAnalysis
                        ].growth >= 0
                          ? 'text-emerald-500'
                          : 'text-red-500'
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
                    <p className="text-xs text-zinc-500 tracking-wider mb-3">
                      OPERATING PROFIT
                    </p>
                    <p className="text-3xl font-thin text-emerald-500">
                      ¥
                      {(
                        scenarioAnalysis[
                          selectedScenario as keyof typeof scenarioAnalysis
                        ].profit / 1000000
                      ).toFixed(1)}
                      M
                    </p>
                    <p className="text-xs text-zinc-500 mt-2 tracking-wider">
                      MARGIN:{' '}
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
                    <p className="text-xs text-zinc-500 tracking-wider mb-3">
                      PROBABILITY
                    </p>
                    <p className="text-3xl font-thin text-purple-500">
                      {
                        scenarioAnalysis[
                          selectedScenario as keyof typeof scenarioAnalysis
                        ].probability
                      }
                      %
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-zinc-500 tracking-wider mb-3">
                      RISK LEVEL
                    </p>
                    <div
                      className={`inline-block px-4 py-2 border text-xs tracking-wider ${
                        selectedScenario === 'optimistic'
                          ? 'text-amber-500 border-amber-500/50'
                          : selectedScenario === 'pessimistic'
                            ? 'text-red-500 border-red-500/50'
                            : 'text-emerald-500 border-emerald-500/50'
                      }`}
                    >
                      <span className="font-light">
                        {selectedScenario === 'optimistic'
                          ? 'MEDIUM'
                          : selectedScenario === 'pessimistic'
                            ? 'HIGH'
                            : 'LOW'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-zinc-900 border border-zinc-800">
                  <h4 className="text-xs text-zinc-400 tracking-widest mb-4">
                    SCENARIO ASSUMPTIONS
                  </h4>
                  <div className="space-y-2 text-xs text-zinc-500 tracking-wider">
                    {selectedScenario === 'base' && (
                      <>
                        <div className="flex items-center space-x-3">
                          <div className="w-1 h-1 bg-zinc-600"></div>
                          <span>MARKET GROWTH RATE: 5-7% ANNUALLY</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-1 h-1 bg-zinc-600"></div>
                          <span>
                            RAW MATERIAL PRICES: MAINTAIN TO SLIGHT INCREASE
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-1 h-1 bg-zinc-600"></div>
                          <span>COMPETITIVE ENVIRONMENT: STATUS QUO</span>
                        </div>
                      </>
                    )}
                    {selectedScenario === 'optimistic' && (
                      <>
                        <div className="flex items-center space-x-3">
                          <div className="w-1 h-1 bg-zinc-600"></div>
                          <span>MARKET GROWTH RATE: 10%+ ANNUALLY</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-1 h-1 bg-zinc-600"></div>
                          <span>NEW BUSINESS SUCCESS</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-1 h-1 bg-zinc-600"></div>
                          <span>CONSECUTIVE LARGE PROJECT WINS</span>
                        </div>
                      </>
                    )}
                    {selectedScenario === 'pessimistic' && (
                      <>
                        <div className="flex items-center space-x-3">
                          <div className="w-1 h-1 bg-zinc-600"></div>
                          <span>DEMAND REDUCTION DUE TO RECESSION</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-1 h-1 bg-zinc-600"></div>
                          <span>SIGNIFICANT RAW MATERIAL PRICE INCREASE</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-1 h-1 bg-zinc-600"></div>
                          <span>INTENSIFIED PRICE COMPETITION</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Competitor Analysis */}
        {selectedAnalysis === 'competitor' && (
          <div className="bg-zinc-950 border border-zinc-800">
            <div className="p-6">
              <h3 className="text-sm font-normal text-white mb-8 tracking-widest">
                COMPETITIVE LANDSCAPE
              </h3>

              <div className="mb-8">
                <h4 className="text-xs text-zinc-500 tracking-widest mb-6">
                  MARKET SHARE DISTRIBUTION
                </h4>
                <div className="space-y-4">
                  {competitorAnalysis.map((company, index) => (
                    <div key={company.name}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                            {String(index + 1).padStart(2, '0')}
                          </div>
                          <span
                            className={`font-light tracking-wider ${company.threat === 'self' ? 'text-blue-500' : 'text-white'}`}
                          >
                            {company.name}
                          </span>
                        </div>
                        <span className="text-sm text-white tracking-wider">
                          {company.marketShare}%
                        </span>
                      </div>
                      <div className="bg-zinc-800 h-4">
                        <div
                          className={`h-4 flex items-center justify-end pr-2 ${
                            company.threat === 'self'
                              ? 'bg-blue-500'
                              : company.threat === 'high'
                                ? 'bg-red-500'
                                : company.threat === 'medium'
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                          }`}
                          style={{ width: `${company.marketShare}%` }}
                        >
                          <span className="text-xs text-white font-light tracking-wider">
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
                  <thead className="bg-zinc-900 border-b border-zinc-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs text-zinc-500 tracking-widest">
                        COMPANY
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-zinc-500 tracking-widest">
                        STRENGTHS
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-zinc-500 tracking-widest">
                        WEAKNESSES
                      </th>
                      <th className="px-6 py-4 text-center text-xs text-zinc-500 tracking-widest">
                        THREAT LEVEL
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {competitorAnalysis
                      .filter((c) => c.threat !== 'self')
                      .map((company, index) => (
                        <tr
                          key={company.name}
                          className="hover:bg-zinc-900/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                                {String(index + 1).padStart(2, '0')}
                              </div>
                              <span className="text-sm font-light text-white tracking-wider">
                                {company.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-400 tracking-wider">
                            {company.strengths}
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-400 tracking-wider">
                            {company.weaknesses}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {getThreatLevel(company.threat)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 p-6 bg-blue-500 bg-opacity-10 border border-blue-500/20">
                <h4 className="text-sm font-normal text-blue-500 mb-4 tracking-widest">
                  COMPETITIVE ADVANTAGE BUILDING
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  <div className="bg-black border border-zinc-800 p-4">
                    <h5 className="text-xs font-normal text-white mb-2 tracking-wider">
                      DIFFERENTIATION STRATEGY
                    </h5>
                    <p className="text-xs text-zinc-400 tracking-wider">
                      DIFFERENTIATE THROUGH HIGH-QUALITY CONSTRUCTION AND
                      AFTER-SALES SERVICE
                    </p>
                  </div>
                  <div className="bg-black border border-zinc-800 p-4">
                    <h5 className="text-xs font-normal text-white mb-2 tracking-wider">
                      COST STRATEGY
                    </h5>
                    <p className="text-xs text-zinc-400 tracking-wider">
                      COST REDUCTION THROUGH OPERATIONAL EFFICIENCY
                    </p>
                  </div>
                  <div className="bg-black border border-zinc-800 p-4">
                    <h5 className="text-xs font-normal text-white mb-2 tracking-wider">
                      FOCUS STRATEGY
                    </h5>
                    <p className="text-xs text-zinc-400 tracking-wider">
                      FOCUS ON HIGH-VALUE SEGMENTS
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Growth Strategy */}
        {selectedAnalysis === 'growth' && (
          <div className="space-y-8">
            <div className="bg-zinc-950 border border-zinc-800 p-6">
              <h3 className="text-sm font-normal text-white mb-8 tracking-widest">
                GROWTH STRATEGY MATRIX
              </h3>

              <div className="grid grid-cols-2 gap-8">
                <div className="bg-black border border-zinc-800 p-6">
                  <h4 className="text-sm font-normal text-blue-500 mb-4 tracking-wider">
                    MARKET PENETRATION
                  </h4>
                  <p className="text-xs text-zinc-500 mb-4 tracking-wider">
                    EXISTING MARKET × EXISTING PRODUCTS
                  </p>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-start space-x-3">
                      <div className="w-1 h-1 bg-emerald-500 mt-2"></div>
                      <span className="text-zinc-300 tracking-wider">
                        CUSTOMER SHARE EXPANSION CAMPAIGN
                      </span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-1 h-1 bg-emerald-500 mt-2"></div>
                      <span className="text-zinc-300 tracking-wider">
                        REPEAT RATE IMPROVEMENT INITIATIVES
                      </span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-1 h-1 bg-emerald-500 mt-2"></div>
                      <span className="text-zinc-300 tracking-wider">
                        REFERRAL PROGRAM ENHANCEMENT
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500 tracking-wider">
                      EXPECTED IMPACT: +15% REVENUE
                    </p>
                  </div>
                </div>

                <div className="bg-black border border-zinc-800 p-6">
                  <h4 className="text-sm font-normal text-emerald-500 mb-4 tracking-wider">
                    MARKET DEVELOPMENT
                  </h4>
                  <p className="text-xs text-zinc-500 mb-4 tracking-wider">
                    NEW MARKET × EXISTING PRODUCTS
                  </p>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-start space-x-3">
                      <div className="w-1 h-1 bg-emerald-500 mt-2"></div>
                      <span className="text-zinc-300 tracking-wider">
                        EXPANSION TO ADJACENT AREAS
                      </span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-1 h-1 bg-emerald-500 mt-2"></div>
                      <span className="text-zinc-300 tracking-wider">
                        CORPORATE MARKET DEVELOPMENT
                      </span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-1 h-1 bg-emerald-500 mt-2"></div>
                      <span className="text-zinc-300 tracking-wider">
                        ONLINE SALES CHANNEL CONSTRUCTION
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500 tracking-wider">
                      EXPECTED IMPACT: +25% REVENUE
                    </p>
                  </div>
                </div>

                <div className="bg-black border border-zinc-800 p-6">
                  <h4 className="text-sm font-normal text-amber-500 mb-4 tracking-wider">
                    PRODUCT DEVELOPMENT
                  </h4>
                  <p className="text-xs text-zinc-500 mb-4 tracking-wider">
                    EXISTING MARKET × NEW PRODUCTS
                  </p>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-start space-x-3">
                      <div className="w-1 h-1 bg-emerald-500 mt-2"></div>
                      <span className="text-zinc-300 tracking-wider">
                        ENERGY-EFFICIENT RENOVATION SERVICES
                      </span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-1 h-1 bg-emerald-500 mt-2"></div>
                      <span className="text-zinc-300 tracking-wider">
                        MAINTENANCE PACKAGES
                      </span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-1 h-1 bg-emerald-500 mt-2"></div>
                      <span className="text-zinc-300 tracking-wider">
                        IOT-CONNECTED SERVICES
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500 tracking-wider">
                      EXPECTED IMPACT: +20% REVENUE
                    </p>
                  </div>
                </div>

                <div className="bg-black border border-zinc-800 p-6">
                  <h4 className="text-sm font-normal text-purple-500 mb-4 tracking-wider">
                    DIVERSIFICATION
                  </h4>
                  <p className="text-xs text-zinc-500 mb-4 tracking-wider">
                    NEW MARKET × NEW PRODUCTS
                  </p>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-start space-x-3">
                      <div className="w-1 h-1 bg-emerald-500 mt-2"></div>
                      <span className="text-zinc-300 tracking-wider">
                        REAL ESTATE BROKERAGE BUSINESS
                      </span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-1 h-1 bg-emerald-500 mt-2"></div>
                      <span className="text-zinc-300 tracking-wider">
                        CONSTRUCTION MATERIALS SALES
                      </span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-1 h-1 bg-emerald-500 mt-2"></div>
                      <span className="text-zinc-300 tracking-wider">
                        CONSULTING BUSINESS
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500 tracking-wider">
                      EXPECTED IMPACT: +30% REVENUE
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-6">
              <h3 className="text-sm font-normal text-white mb-6 tracking-widest">
                EXECUTION ROADMAP
              </h3>

              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="w-24 text-xs font-light text-zinc-400 tracking-wider">
                    Q1 2024
                  </div>
                  <div className="flex-1 bg-blue-500 bg-opacity-10 border border-blue-500/20 p-4 ml-6">
                    <p className="text-sm font-light text-blue-500 tracking-wider">
                      FOUNDATION STRENGTHENING PHASE
                    </p>
                    <p className="text-xs text-zinc-400 mt-2 tracking-wider">
                      OPERATIONAL EFFICIENCY, DIGITALIZATION PROMOTION
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-24 text-xs font-light text-zinc-400 tracking-wider">
                    Q2 2024
                  </div>
                  <div className="flex-1 bg-emerald-500 bg-opacity-10 border border-emerald-500/20 p-4 ml-6">
                    <p className="text-sm font-light text-emerald-500 tracking-wider">
                      MARKET EXPANSION PHASE
                    </p>
                    <p className="text-xs text-zinc-400 mt-2 tracking-wider">
                      NEW AREA ENTRY, MARKETING ENHANCEMENT
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-24 text-xs font-light text-zinc-400 tracking-wider">
                    Q3 2024
                  </div>
                  <div className="flex-1 bg-amber-500 bg-opacity-10 border border-amber-500/20 p-4 ml-6">
                    <p className="text-sm font-light text-amber-500 tracking-wider">
                      SERVICE ENHANCEMENT PHASE
                    </p>
                    <p className="text-xs text-zinc-400 mt-2 tracking-wider">
                      NEW SERVICE LAUNCH, VALUE-ADDED IMPROVEMENT
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-24 text-xs font-light text-zinc-400 tracking-wider">
                    Q4 2024
                  </div>
                  <div className="flex-1 bg-purple-500 bg-opacity-10 border border-purple-500/20 p-4 ml-6">
                    <p className="text-sm font-light text-purple-500 tracking-wider">
                      GROWTH ACCELERATION PHASE
                    </p>
                    <p className="text-xs text-zinc-400 mt-2 tracking-wider">
                      M&A CONSIDERATION, NEW BUSINESS LAUNCH
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
