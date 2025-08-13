'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface Template {
  id: string;
  name: string;
  type: 'email' | 'landing' | 'social' | 'blog';
  category: string;
  thumbnail: string;
  description: string;
  performance: {
    uses: number;
    conversion: number;
    openRate?: number;
    clickRate?: number;
  };
  tags: string[];
  lastUsed: string;
  createdBy: string;
  status: 'active' | 'draft' | 'archived';
}

export default function DarkMarketingTemplatesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );

  const [templates] = useState<Template[]>([
    {
      id: '1',
      name: 'EXTERIOR PAINTING CAMPAIGN LP',
      type: 'landing',
      category: 'SEASONAL CAMPAIGN',
      thumbnail: 'LP',
      description: 'SPRING EXTERIOR PAINTING CAMPAIGN LANDING PAGE',
      performance: {
        uses: 145,
        conversion: 12.5,
      },
      tags: ['EXTERIOR_PAINTING', 'SPRING', 'CAMPAIGN'],
      lastUsed: '2024-03-15',
      createdBy: 'YAMADA TARO',
      status: 'active',
    },
    {
      id: '2',
      name: 'RENOVATION QUOTE REQUEST EMAIL',
      type: 'email',
      category: 'FOLLOW-UP',
      thumbnail: 'EM',
      description: 'FOLLOW-UP EMAIL TEMPLATE FOR QUOTE REQUESTS',
      performance: {
        uses: 89,
        conversion: 8.2,
        openRate: 45.3,
        clickRate: 12.1,
      },
      tags: ['RENOVATION', 'FOLLOW_UP', 'EMAIL'],
      lastUsed: '2024-03-18',
      createdBy: 'SUZUKI ICHIRO',
      status: 'active',
    },
    {
      id: '3',
      name: 'CASE STUDY INSTAGRAM POST',
      type: 'social',
      category: 'SNS POST',
      thumbnail: 'IG',
      description: 'BEFORE/AFTER CASE STUDY INSTAGRAM POST TEMPLATE',
      performance: {
        uses: 234,
        conversion: 5.8,
      },
      tags: ['INSTAGRAM', 'CASE_STUDY', 'BEFORE_AFTER'],
      lastUsed: '2024-03-20',
      createdBy: 'SATO HANAKO',
      status: 'active',
    },
    {
      id: '4',
      name: 'NEW HOME COMPLETION TOUR ANNOUNCEMENT',
      type: 'blog',
      category: 'EVENT ANNOUNCEMENT',
      thumbnail: 'BL',
      description: 'BLOG TEMPLATE FOR COMPLETION TOUR ANNOUNCEMENTS',
      performance: {
        uses: 56,
        conversion: 15.2,
      },
      tags: ['NEW_BUILD', 'OPEN_HOUSE', 'EVENT'],
      lastUsed: '2024-03-10',
      createdBy: 'YAMADA TARO',
      status: 'active',
    },
    {
      id: '5',
      name: 'MONTHLY NEWSLETTER',
      type: 'email',
      category: 'NEWSLETTER',
      thumbnail: 'NL',
      description: 'MONTHLY CONSTRUCTION RESULTS AND ANNOUNCEMENTS NEWSLETTER',
      performance: {
        uses: 12,
        conversion: 3.5,
        openRate: 38.2,
        clickRate: 8.7,
      },
      tags: ['NEWSLETTER', 'MONTHLY', 'RESULTS_REPORT'],
      lastUsed: '2024-02-28',
      createdBy: 'SUZUKI ICHIRO',
      status: 'draft',
    },
  ]);

  const filteredTemplates = templates.filter((template) => {
    const matchesType =
      selectedType === 'all' || template.type === selectedType;
    const matchesSearch =
      searchTerm === '' ||
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    return matchesType && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        color: 'text-emerald-500 border-emerald-500/50',
        label: 'ACTIVE',
        indicator: '01',
      },
      draft: {
        color: 'text-zinc-500 border-zinc-500/50',
        label: 'DRAFT',
        indicator: '02',
      },
      archived: {
        color: 'text-red-500 border-red-500/50',
        label: 'ARCHIVED',
        indicator: '03',
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <span
        className={`px-3 py-1 border text-xs tracking-wider ${config.color} flex items-center gap-2 inline-flex`}
      >
        <span>{config.indicator}</span>
        <span>{config.label}</span>
      </span>
    );
  };

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

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dark/dashboard')}
                className="mr-6 text-zinc-500 hover:text-white transition-colors text-xs tracking-wider"
              >
                ← DASHBOARD
              </button>
              <div>
                <h1 className="text-2xl font-thin text-white tracking-widest">
                  MARKETING TEMPLATES
                </h1>
                <p className="text-zinc-500 mt-1 text-xs tracking-wider">
                  CAMPAIGN TEMPLATE CREATION • MANAGEMENT
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-3 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors"
            >
              + CREATE NEW TEMPLATE
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="SEARCH TEMPLATES, TAGS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'email', 'landing', 'social', 'blog'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-3 text-xs tracking-wider transition-colors ${
                    selectedType === type
                      ? 'bg-white text-black'
                      : 'bg-black border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
                  }`}
                >
                  {type === 'all'
                    ? 'ALL'
                    : type === 'email'
                      ? 'EMAIL'
                      : type === 'landing'
                        ? 'LANDING'
                        : type === 'social'
                          ? 'SOCIAL'
                          : 'BLOG'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <div
              key={template.id}
              className="bg-zinc-950 border border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer"
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                    {template.thumbnail}
                  </div>
                  {getStatusBadge(template.status)}
                </div>

                <h3 className="font-light text-lg text-white mb-2 tracking-wider">
                  {template.name}
                </h3>
                <p className="text-xs text-zinc-500 mb-4 tracking-wider">
                  {template.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {template.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-black border border-zinc-800 text-zinc-400 text-xs tracking-wider"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                    <div>
                      <p className="text-zinc-500 tracking-wider mb-1">
                        USAGE COUNT
                      </p>
                      <p className="font-light text-white tracking-wider">
                        {template.performance.uses}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500 tracking-wider mb-1">
                        CONVERSION
                      </p>
                      <p className="font-light text-emerald-500 tracking-wider">
                        {template.performance.conversion}%
                      </p>
                    </div>
                    {template.performance.openRate && (
                      <div>
                        <p className="text-zinc-500 tracking-wider mb-1">
                          OPEN RATE
                        </p>
                        <p className="font-light text-white tracking-wider">
                          {template.performance.openRate}%
                        </p>
                      </div>
                    )}
                    {template.performance.clickRate && (
                      <div>
                        <p className="text-zinc-500 tracking-wider mb-1">
                          CLICK RATE
                        </p>
                        <p className="font-light text-white tracking-wider">
                          {template.performance.clickRate}%
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-xs text-zinc-600 tracking-wider">
                    <span>LAST USED: {template.lastUsed}</span>
                    <span>BY: {template.createdBy}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('EDIT TEMPLATE');
                    }}
                    className="flex-1 py-2 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors"
                  >
                    EDIT
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('DUPLICATE TEMPLATE');
                    }}
                    className="flex-1 py-2 bg-zinc-800 text-white text-xs tracking-wider hover:bg-zinc-700 transition-colors"
                  >
                    DUPLICATE
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('USE TEMPLATE');
                    }}
                    className="flex-1 py-2 bg-emerald-500 text-white text-xs tracking-wider hover:bg-emerald-400 transition-colors"
                  >
                    USE
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="bg-zinc-950 border border-zinc-800 p-16 text-center">
            <div className="w-16 h-16 border border-zinc-700 flex items-center justify-center text-zinc-500 font-light text-2xl mx-auto mb-6">
              TMP
            </div>
            <p className="text-zinc-500 mb-6 text-xs tracking-wider">
              NO TEMPLATES FOUND
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-3 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors"
            >
              CREATE NEW TEMPLATE
            </button>
          </div>
        )}
      </div>

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-800">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-thin text-white mb-2 tracking-widest">
                    {selectedTemplate.name}
                  </h2>
                  <p className="text-zinc-500 text-xs tracking-wider">
                    {selectedTemplate.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-zinc-500 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-black border border-zinc-800 p-4">
                  <p className="text-xs text-zinc-500 tracking-wider mb-2">
                    TYPE
                  </p>
                  <p className="font-light text-white tracking-wider uppercase">
                    {selectedTemplate.type}
                  </p>
                </div>
                <div className="bg-black border border-zinc-800 p-4">
                  <p className="text-xs text-zinc-500 tracking-wider mb-2">
                    CATEGORY
                  </p>
                  <p className="font-light text-white tracking-wider">
                    {selectedTemplate.category}
                  </p>
                </div>
                <div className="bg-black border border-zinc-800 p-4">
                  <p className="text-xs text-zinc-500 tracking-wider mb-2">
                    STATUS
                  </p>
                  {getStatusBadge(selectedTemplate.status)}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-normal text-white mb-4 tracking-widest">
                  PERFORMANCE METRICS
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-blue-500 bg-opacity-10 border border-blue-500/20 p-4">
                    <p className="text-xs text-zinc-500 tracking-wider mb-2">
                      USAGE COUNT
                    </p>
                    <p className="text-2xl font-thin text-blue-500">
                      {selectedTemplate.performance.uses}
                    </p>
                  </div>
                  <div className="bg-emerald-500 bg-opacity-10 border border-emerald-500/20 p-4">
                    <p className="text-xs text-zinc-500 tracking-wider mb-2">
                      CONVERSION RATE
                    </p>
                    <p className="text-2xl font-thin text-emerald-500">
                      {selectedTemplate.performance.conversion}%
                    </p>
                  </div>
                  {selectedTemplate.performance.openRate && (
                    <div className="bg-amber-500 bg-opacity-10 border border-amber-500/20 p-4">
                      <p className="text-xs text-zinc-500 tracking-wider mb-2">
                        OPEN RATE
                      </p>
                      <p className="text-2xl font-thin text-amber-500">
                        {selectedTemplate.performance.openRate}%
                      </p>
                    </div>
                  )}
                  {selectedTemplate.performance.clickRate && (
                    <div className="bg-purple-500 bg-opacity-10 border border-purple-500/20 p-4">
                      <p className="text-xs text-zinc-500 tracking-wider mb-2">
                        CLICK RATE
                      </p>
                      <p className="text-2xl font-thin text-purple-500">
                        {selectedTemplate.performance.clickRate}%
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-normal text-white mb-4 tracking-widest">
                  PREVIEW
                </h3>
                <div className="border border-zinc-800 bg-black h-64 flex items-center justify-center">
                  <p className="text-zinc-600 text-xs tracking-wider">
                    TEMPLATE PREVIEW AREA
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 py-3 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors">
                  EDIT TEMPLATE
                </button>
                <button className="flex-1 py-3 bg-zinc-800 text-white text-xs tracking-wider hover:bg-zinc-700 transition-colors">
                  DUPLICATE TEMPLATE
                </button>
                <button className="flex-1 py-3 bg-emerald-500 text-white text-xs tracking-wider hover:bg-emerald-400 transition-colors">
                  USE THIS TEMPLATE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
