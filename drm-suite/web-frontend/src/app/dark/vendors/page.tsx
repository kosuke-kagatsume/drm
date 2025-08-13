'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface Vendor {
  id: string;
  name: string;
  category: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  distance: number;
  qualityScore: number;
  priceLevel: 'low' | 'medium' | 'high';
  availability: 'immediate' | 'next_week' | 'busy';
  completedProjects: number;
  claimCount: number;
  averageDelay: number;
  paymentTerms: string;
  notes: string;
}

export default function VendorsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: '1',
      name: 'YAMADA CONSTRUCTION',
      category: 'SCAFFOLDING',
      contactPerson: 'YAMADA TARO',
      phone: '090-1234-5678',
      email: 'yamada@example.com',
      address: 'SETAGAYA, TOKYO',
      distance: 5,
      qualityScore: 95,
      priceLevel: 'low',
      availability: 'immediate',
      completedProjects: 125,
      claimCount: 2,
      averageDelay: 0.5,
      paymentTerms: 'END OF MONTH PAYMENT',
      notes: 'FAST RESPONSE AND STABLE QUALITY',
    },
    {
      id: '2',
      name: 'SATO PAINTING',
      category: 'PAINTING',
      contactPerson: 'SATO JIRO',
      phone: '090-2345-6789',
      email: 'sato@example.com',
      address: 'SUGINAMI, TOKYO',
      distance: 8,
      qualityScore: 90,
      priceLevel: 'medium',
      availability: 'next_week',
      completedProjects: 89,
      claimCount: 3,
      averageDelay: 1.2,
      paymentTerms: 'END OF MONTH PAYMENT',
      notes: 'HIGH TECHNICAL SKILLS BUT BUSY DURING PEAK SEASON',
    },
    {
      id: '3',
      name: 'SUZUKI ELECTRICAL',
      category: 'ELECTRICAL',
      contactPerson: 'SUZUKI SABURO',
      phone: '090-3456-7890',
      email: 'suzuki@example.com',
      address: 'NERIMA, TOKYO',
      distance: 12,
      qualityScore: 88,
      priceLevel: 'high',
      availability: 'busy',
      completedProjects: 67,
      claimCount: 1,
      averageDelay: 0.8,
      paymentTerms: 'IMMEDIATE PAYMENT',
      notes: 'GOOD QUALITY BUT HIGH UNIT PRICE',
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getAvailabilityBadge = (availability: string) => {
    const configs = {
      immediate: {
        color: 'text-emerald-500 border-emerald-500/50',
        label: 'IMMEDIATE',
      },
      next_week: {
        color: 'text-amber-500 border-amber-500/50',
        label: 'NEXT WEEK',
      },
      busy: { color: 'text-red-500 border-red-500/50', label: 'BUSY' },
    };
    const config = configs[availability as keyof typeof configs];
    return (
      <span
        className={`px-3 py-1 border text-xs tracking-wider ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getPriceLevelIndicator = (level: string) => {
    const indicators = {
      low: '01',
      medium: '02',
      high: '03',
    };
    return indicators[level as keyof typeof indicators];
  };

  const filteredVendors = vendors.filter((vendor) => {
    const matchesCategory =
      selectedCategory === 'all' || vendor.category === selectedCategory;
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    'all',
    'SCAFFOLDING',
    'PAINTING',
    'ELECTRICAL',
    'PLUMBING',
    'CARPENTRY',
    'INTERIOR',
    'EXTERIOR',
  ];

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
      <nav className="bg-zinc-950 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dark/dashboard')}
              className="text-zinc-500 hover:text-white transition-colors text-sm tracking-wider"
            >
              ← DASHBOARD
            </button>
            <div className="w-px h-6 bg-zinc-800"></div>
            <h1 className="text-2xl font-thin text-white tracking-widest">
              VENDOR MANAGEMENT
            </h1>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <h3 className="text-xs text-zinc-500 tracking-wider mb-2">
              REGISTERED COMPANIES
            </h3>
            <p className="text-3xl font-thin text-white">{vendors.length}</p>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <h3 className="text-xs text-zinc-500 tracking-wider mb-2">
              IMMEDIATE AVAILABLE
            </h3>
            <p className="text-3xl font-thin text-emerald-500">
              {vendors.filter((v) => v.availability === 'immediate').length}
            </p>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <h3 className="text-xs text-zinc-500 tracking-wider mb-2">
              AVERAGE QUALITY SCORE
            </h3>
            <p className="text-3xl font-thin text-blue-500">
              {(
                vendors.reduce((sum, v) => sum + v.qualityScore, 0) /
                vendors.length
              ).toFixed(1)}
            </p>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <h3 className="text-xs text-zinc-500 tracking-wider mb-2">
              THIS MONTH ORDERS
            </h3>
            <p className="text-3xl font-thin text-purple-500">42</p>
          </div>
        </div>

        {/* Filter and Actions */}
        <div className="bg-zinc-950 border border-zinc-800 mb-6 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="SEARCH COMPANY NAME OR CATEGORY..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider w-80"
              />
              <div className="flex space-x-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 text-xs tracking-wider transition-colors ${
                      selectedCategory === cat
                        ? 'bg-white text-black'
                        : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    {cat === 'all' ? 'ALL' : cat}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-black px-6 py-3 text-xs tracking-wider hover:bg-zinc-200 transition-colors"
            >
              + ADD VENDOR
            </button>
          </div>
        </div>

        {/* Vendor List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor, index) => (
            <div
              key={vendor.id}
              className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-sm">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <h3 className="text-sm font-light text-white tracking-wider">
                        {vendor.name}
                      </h3>
                      <p className="text-xs text-zinc-500 tracking-wider mt-1">
                        {vendor.category}
                      </p>
                    </div>
                  </div>
                  {getAvailabilityBadge(vendor.availability)}
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 tracking-wider">
                      CONTACT PERSON:
                    </span>
                    <span className="text-white font-light tracking-wider">
                      {vendor.contactPerson}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 tracking-wider">PHONE:</span>
                    <span className="text-zinc-400 tracking-wider">
                      {vendor.phone}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 tracking-wider">
                      DISTANCE:
                    </span>
                    <span className="text-zinc-400 tracking-wider">
                      {vendor.distance}KM
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 tracking-wider">
                      PRICE LEVEL:
                    </span>
                    <div className="w-6 h-6 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                      {getPriceLevelIndicator(vendor.priceLevel)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-500 tracking-wider">
                      QUALITY SCORE
                    </span>
                    <span className="text-xs font-light text-white">
                      {vendor.qualityScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1">
                    <div
                      className={`h-1 transition-all duration-500 ${
                        vendor.qualityScore >= 90
                          ? 'bg-emerald-500/50'
                          : vendor.qualityScore >= 80
                            ? 'bg-amber-500/50'
                            : 'bg-red-500/50'
                      }`}
                      style={{ width: `${vendor.qualityScore}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="bg-black border border-zinc-800 p-3">
                    <p className="text-zinc-500 tracking-wider">COMPLETED</p>
                    <p className="font-light text-white">
                      {vendor.completedProjects}
                    </p>
                  </div>
                  <div className="bg-black border border-zinc-800 p-3">
                    <p className="text-zinc-500 tracking-wider">CLAIMS</p>
                    <p className="font-light text-red-500">
                      {vendor.claimCount}
                    </p>
                  </div>
                  <div className="bg-black border border-zinc-800 p-3">
                    <p className="text-zinc-500 tracking-wider">AVG DELAY</p>
                    <p className="font-light text-white">
                      {vendor.averageDelay}D
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 bg-white text-black py-3 text-xs tracking-wider hover:bg-zinc-200 transition-colors">
                    ORDER
                  </button>
                  <button
                    onClick={() => router.push(`/dark/vendors/${vendor.id}`)}
                    className="flex-1 border border-zinc-800 text-white py-3 text-xs tracking-wider hover:bg-zinc-900 transition-colors"
                  >
                    DETAILS
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-lg">
            <div className="p-6 border-b border-zinc-800">
              <h3 className="text-sm font-normal text-white tracking-widest">
                ADD NEW VENDOR
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                    COMPANY NAME
                  </label>
                  <input
                    type="text"
                    placeholder="Enter company name"
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                    CATEGORY
                  </label>
                  <select className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm">
                    <option value="">SELECT CATEGORY</option>
                    <option value="scaffolding">SCAFFOLDING</option>
                    <option value="painting">PAINTING</option>
                    <option value="electrical">ELECTRICAL</option>
                    <option value="plumbing">PLUMBING</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                    CONTACT PERSON
                  </label>
                  <input
                    type="text"
                    placeholder="Enter contact person name"
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                    PHONE NUMBER
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-zinc-800">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 text-zinc-500 hover:text-white transition-colors text-xs tracking-wider"
                >
                  CANCEL
                </button>
                <button className="px-8 py-3 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors">
                  ADD VENDOR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
