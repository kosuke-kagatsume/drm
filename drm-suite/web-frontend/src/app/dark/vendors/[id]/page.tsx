'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface VendorProject {
  id: string;
  projectName: string;
  workType: string;
  startDate: string;
  endDate: string;
  amount: number;
  quality: number;
  status: 'completed' | 'in_progress' | 'cancelled';
}

interface VendorReview {
  id: string;
  projectName: string;
  reviewer: string;
  rating: number;
  quality: number;
  schedule: number;
  communication: number;
  comment: string;
  date: string;
}

interface VendorDetail {
  id: string;
  name: string;
  category: string;
  phone: string;
  email: string;
  address: string;
  representative: string;
  established: string;
  employees: number;
  capital: number;
  website?: string;
  availability: 'immediate' | 'next_week' | 'busy';
  qualityScore: number;
  totalProjects: number;
  avgAmount: number;
  onTimeRate: number;
  specialties: string[];
  certifications: string[];
  notes: string;
  contractTerms: string;
  paymentTerms: string;
  projects: VendorProject[];
  reviews: VendorReview[];
}

export default function DarkVendorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'projects' | 'reviews' | 'contract'
  >('overview');
  const [isEditing, setIsEditing] = useState(false);

  const [vendor, setVendor] = useState<VendorDetail>({
    id: params.id as string,
    name: 'TANAKA PAINTING CO., LTD.',
    category: 'PAINTING CONTRACTOR',
    phone: '03-1234-5678',
    email: 'info@tanaka-tosou.co.jp',
    address: 'AKASAKA 1-2-3, MINATO-KU, TOKYO',
    representative: 'TANAKA TARO',
    established: 'APRIL 1995',
    employees: 25,
    capital: 10000000,
    website: 'https://tanaka-tosou.co.jp',
    availability: 'next_week',
    qualityScore: 4.2,
    totalProjects: 127,
    avgAmount: 2800000,
    onTimeRate: 92,
    specialties: [
      'EXTERIOR PAINTING',
      'ROOF PAINTING',
      'WATERPROOFING',
      'URETHANE PAINT',
      'SILICONE PAINT',
    ],
    certifications: [
      'FIRST-CLASS PAINTING TECHNICIAN',
      'FOREMAN & SAFETY HEALTH MANAGER',
      'SCAFFOLDING WORK SUPERVISOR',
    ],
    notes:
      'EXCEPTIONAL QUALITY AND RELIABLE SCHEDULE ADHERENCE. PARTICULARLY RENOWNED FOR EXTERIOR PAINTING FINISHES.',
    contractTerms:
      'BASED ON CONSTRUCTION CONTRACT. WARRANTY: EXTERIOR 3 YEARS, ROOF 2 YEARS',
    paymentTerms:
      'END OF MONTH PAYMENT NEXT MONTH. MATERIAL ADVANCE PAYMENT AVAILABLE',
    projects: [
      {
        id: 'P001',
        projectName: 'TANAKA RESIDENCE EXTERIOR',
        workType: 'EXTERIOR PAINTING',
        startDate: '2024-01-10',
        endDate: '2024-01-20',
        amount: 3200000,
        quality: 4.8,
        status: 'completed',
      },
      {
        id: 'P002',
        projectName: 'YAMADA BUILDING EXTERIOR & ROOF',
        workType: 'PAINTING',
        startDate: '2023-12-05',
        endDate: '2023-12-25',
        amount: 5800000,
        quality: 4.5,
        status: 'completed',
      },
      {
        id: 'P003',
        projectName: 'SATO RESIDENCE ROOF',
        workType: 'ROOF PAINTING',
        startDate: '2024-02-01',
        endDate: '2024-02-15',
        amount: 1800000,
        quality: 4.2,
        status: 'in_progress',
      },
    ],
    reviews: [
      {
        id: 'R001',
        projectName: 'TANAKA RESIDENCE EXTERIOR',
        reviewer: 'YAMADA TARO (SALES)',
        rating: 4.8,
        quality: 5,
        schedule: 4,
        communication: 5,
        comment:
          'EXCEPTIONAL ATTENTION TO DETAIL WITH HIGH CUSTOMER SATISFACTION. SKILLED CRAFTSMEN WITH METICULOUS WORKMANSHIP.',
        date: '2024-01-22',
      },
      {
        id: 'R002',
        projectName: 'YAMADA BUILDING EXTERIOR & ROOF',
        reviewer: 'SUZUKI HANAKO (SALES)',
        rating: 4.5,
        quality: 4,
        schedule: 5,
        communication: 4,
        comment:
          'COMPLETED ON SCHEDULE WITH SATISFACTORY QUALITY. CLEAN SITE MANAGEMENT WAS APPRECIATED.',
        date: '2023-12-26',
      },
    ],
  });

  const getAvailabilityBadge = (availability: string) => {
    const statusConfig = {
      immediate: {
        color: 'text-emerald-500 border-emerald-500/50',
        label: 'AVAILABLE NOW',
        indicator: '01',
      },
      next_week: {
        color: 'text-amber-500 border-amber-500/50',
        label: 'NEXT WEEK',
        indicator: '02',
      },
      busy: {
        color: 'text-red-500 border-red-500/50',
        label: 'BUSY',
        indicator: '03',
      },
    };

    const config =
      statusConfig[availability as keyof typeof statusConfig] ||
      statusConfig.busy;

    return (
      <span
        className={`px-3 py-1 border text-xs tracking-wider ${config.color} flex items-center gap-2 inline-flex`}
      >
        <span>{config.indicator}</span>
        <span>{config.label}</span>
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: {
        color: 'text-emerald-500 border-emerald-500/50',
        label: 'COMPLETED',
        indicator: '01',
      },
      in_progress: {
        color: 'text-blue-500 border-blue-500/50',
        label: 'IN PROGRESS',
        indicator: '02',
      },
      cancelled: {
        color: 'text-red-500 border-red-500/50',
        label: 'CANCELLED',
        indicator: '03',
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.cancelled;

    return (
      <span
        className={`px-2 py-1 border text-xs tracking-wider ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={i < Math.floor(rating) ? 'text-amber-500' : 'text-zinc-700'}
      >
        ★
      </span>
    ));
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
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => router.back()}
                className="text-zinc-500 hover:text-white transition-colors text-xs tracking-wider"
              >
                ← BACK
              </button>
              <h1 className="text-2xl font-thin text-white tracking-widest">
                {vendor.name}
              </h1>
              {getAvailabilityBadge(vendor.availability)}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-6 py-3 text-xs tracking-wider transition-colors ${
                  isEditing
                    ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                    : 'bg-white text-black hover:bg-zinc-200'
                }`}
              >
                {isEditing ? 'FINISH EDITING' : 'EDIT INFO'}
              </button>
              <button className="bg-emerald-500 text-white px-6 py-3 text-xs tracking-wider hover:bg-emerald-400 transition-colors">
                NEW REQUEST
              </button>
              <button className="bg-purple-500 text-white px-6 py-3 text-xs tracking-wider hover:bg-purple-400 transition-colors">
                REQUEST QUOTE
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="bg-zinc-950 border border-zinc-800">
              <div className="border-b border-zinc-800">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'OVERVIEW' },
                    { id: 'projects', label: 'PROJECTS' },
                    { id: 'reviews', label: 'REVIEWS' },
                    { id: 'contract', label: 'CONTRACT' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-1 border-b-2 text-xs tracking-wider transition-colors ${
                        activeTab === tab.id
                          ? 'border-white text-white'
                          : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-600'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                          COMPANY NAME
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={vendor.name}
                            onChange={(e) =>
                              setVendor((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                          />
                        ) : (
                          <p className="text-white font-light tracking-wider">
                            {vendor.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                          REPRESENTATIVE
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={vendor.representative}
                            onChange={(e) =>
                              setVendor((prev) => ({
                                ...prev,
                                representative: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                          />
                        ) : (
                          <p className="text-white font-light tracking-wider">
                            {vendor.representative}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                          PHONE
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={vendor.phone}
                            onChange={(e) =>
                              setVendor((prev) => ({
                                ...prev,
                                phone: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                          />
                        ) : (
                          <p className="text-white font-light tracking-wider">
                            <a
                              href={`tel:${vendor.phone}`}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              {vendor.phone}
                            </a>
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                          EMAIL
                        </label>
                        {isEditing ? (
                          <input
                            type="email"
                            value={vendor.email}
                            onChange={(e) =>
                              setVendor((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                          />
                        ) : (
                          <p className="text-white font-light tracking-wider">
                            <a
                              href={`mailto:${vendor.email}`}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              {vendor.email}
                            </a>
                          </p>
                        )}
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                          ADDRESS
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={vendor.address}
                            onChange={(e) =>
                              setVendor((prev) => ({
                                ...prev,
                                address: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                          />
                        ) : (
                          <p className="text-white font-light tracking-wider">
                            {vendor.address}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                          ESTABLISHED
                        </label>
                        <p className="text-white font-light tracking-wider">
                          {vendor.established}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                          EMPLOYEES
                        </label>
                        <p className="text-white font-light tracking-wider">
                          {vendor.employees}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                          CAPITAL
                        </label>
                        <p className="text-white font-light tracking-wider">
                          ¥{vendor.capital.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                          WEBSITE
                        </label>
                        {vendor.website && (
                          <p className="text-white font-light tracking-wider">
                            <a
                              href={vendor.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300"
                            >
                              {vendor.website}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                        SPECIALTIES
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {vendor.specialties.map((specialty, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs tracking-wider"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                        CERTIFICATIONS
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {vendor.certifications.map((cert, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs tracking-wider"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                        NOTES
                      </label>
                      {isEditing ? (
                        <textarea
                          value={vendor.notes}
                          onChange={(e) =>
                            setVendor((prev) => ({
                              ...prev,
                              notes: e.target.value,
                            }))
                          }
                          rows={4}
                          className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                        />
                      ) : (
                        <p className="text-zinc-300 whitespace-pre-line font-light tracking-wider text-sm">
                          {vendor.notes}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Projects Tab */}
                {activeTab === 'projects' && (
                  <div>
                    <h3 className="text-lg font-light text-white mb-6 tracking-widest flex items-center gap-3">
                      <span className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                        01
                      </span>
                      PROJECT HISTORY
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-zinc-900 border-b border-zinc-800">
                          <tr>
                            <th className="px-4 py-4 text-left text-xs text-zinc-500 tracking-widest">
                              PROJECT NAME
                            </th>
                            <th className="px-4 py-4 text-left text-xs text-zinc-500 tracking-widest">
                              WORK TYPE
                            </th>
                            <th className="px-4 py-4 text-center text-xs text-zinc-500 tracking-widest">
                              PERIOD
                            </th>
                            <th className="px-4 py-4 text-center text-xs text-zinc-500 tracking-widest">
                              AMOUNT
                            </th>
                            <th className="px-4 py-4 text-center text-xs text-zinc-500 tracking-widest">
                              QUALITY
                            </th>
                            <th className="px-4 py-4 text-center text-xs text-zinc-500 tracking-widest">
                              STATUS
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                          {vendor.projects.map((project, index) => (
                            <tr
                              key={project.id}
                              className="hover:bg-zinc-900/50 transition-colors"
                            >
                              <td className="px-4 py-4 font-light text-white tracking-wider">
                                <div className="flex items-center gap-3">
                                  <span className="w-6 h-6 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                                    {String(index + 1).padStart(2, '0')}
                                  </span>
                                  {project.projectName}
                                </div>
                              </td>
                              <td className="px-4 py-4 text-zinc-300 font-light tracking-wider text-sm">
                                {project.workType}
                              </td>
                              <td className="px-4 py-4 text-center text-sm text-zinc-300 font-light tracking-wider">
                                {project.startDate} - {project.endDate}
                              </td>
                              <td className="px-4 py-4 text-center font-light text-white tracking-wider">
                                ¥{project.amount.toLocaleString()}
                              </td>
                              <td className="px-4 py-4 text-center">
                                <div className="flex items-center justify-center">
                                  {renderStars(project.quality)}
                                  <span className="ml-2 text-xs text-zinc-500 tracking-wider">
                                    ({project.quality})
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-center">
                                {getStatusBadge(project.status)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div>
                    <h3 className="text-lg font-light text-white mb-6 tracking-widest flex items-center gap-3">
                      <span className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                        02
                      </span>
                      REVIEWS & RATINGS
                    </h3>
                    <div className="space-y-6">
                      {vendor.reviews.map((review, index) => (
                        <div
                          key={review.id}
                          className="border border-zinc-800 p-6"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-normal text-white tracking-wider flex items-center gap-3">
                                <span className="w-6 h-6 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                                  {String(index + 1).padStart(2, '0')}
                                </span>
                                {review.projectName}
                              </h4>
                              <p className="text-xs text-zinc-500 mt-2 tracking-wider">
                                REVIEWER: {review.reviewer}
                              </p>
                              <p className="text-xs text-zinc-600 mt-1 tracking-wider">
                                {review.date}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center">
                                {renderStars(review.rating)}
                                <span className="ml-3 text-lg font-thin text-white">
                                  {review.rating}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-6 mb-4">
                            <div className="text-center">
                              <p className="text-xs text-zinc-500 tracking-wider mb-2">
                                QUALITY
                              </p>
                              <div className="flex items-center justify-center">
                                {renderStars(review.quality)}
                                <span className="ml-2 text-sm text-zinc-400">
                                  ({review.quality})
                                </span>
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-zinc-500 tracking-wider mb-2">
                                SCHEDULE
                              </p>
                              <div className="flex items-center justify-center">
                                {renderStars(review.schedule)}
                                <span className="ml-2 text-sm text-zinc-400">
                                  ({review.schedule})
                                </span>
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-zinc-500 tracking-wider mb-2">
                                COMMUNICATION
                              </p>
                              <div className="flex items-center justify-center">
                                {renderStars(review.communication)}
                                <span className="ml-2 text-sm text-zinc-400">
                                  ({review.communication})
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-zinc-900/50 border border-zinc-800 p-4">
                            <p className="text-zinc-300 font-light tracking-wider text-sm">
                              {review.comment}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contract Tab */}
                {activeTab === 'contract' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                        CONTRACT TERMS
                      </label>
                      {isEditing ? (
                        <textarea
                          value={vendor.contractTerms}
                          onChange={(e) =>
                            setVendor((prev) => ({
                              ...prev,
                              contractTerms: e.target.value,
                            }))
                          }
                          rows={4}
                          className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                        />
                      ) : (
                        <p className="text-zinc-300 whitespace-pre-line bg-zinc-900/50 border border-zinc-800 p-4 font-light tracking-wider text-sm">
                          {vendor.contractTerms}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                        PAYMENT TERMS
                      </label>
                      {isEditing ? (
                        <textarea
                          value={vendor.paymentTerms}
                          onChange={(e) =>
                            setVendor((prev) => ({
                              ...prev,
                              paymentTerms: e.target.value,
                            }))
                          }
                          rows={3}
                          className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                        />
                      ) : (
                        <p className="text-zinc-300 whitespace-pre-line bg-zinc-900/50 border border-zinc-800 p-4 font-light tracking-wider text-sm">
                          {vendor.paymentTerms}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                          BUSINESS HOURS
                        </label>
                        <p className="text-white bg-zinc-900/50 border border-zinc-800 p-4 font-light tracking-wider text-sm">
                          WEEKDAYS 8:00-17:00
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                          EMERGENCY CONTACT
                        </label>
                        <p className="text-white bg-zinc-900/50 border border-zinc-800 p-4 font-light tracking-wider text-sm">
                          080-1234-5678 (TANAKA)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Performance Summary */}
            <div className="bg-zinc-950 border border-zinc-800 p-6">
              <h3 className="text-lg font-light text-white mb-6 tracking-widest flex items-center gap-3">
                <span className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                  03
                </span>
                PERFORMANCE
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-xs tracking-wider">
                    QUALITY RATING:
                  </span>
                  <div className="flex items-center">
                    {renderStars(vendor.qualityScore)}
                    <span className="ml-2 font-thin text-white">
                      {vendor.qualityScore}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-xs tracking-wider">
                    TOTAL PROJECTS:
                  </span>
                  <span className="font-thin text-white">
                    {vendor.totalProjects}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-xs tracking-wider">
                    AVG CONTRACT:
                  </span>
                  <span className="font-thin text-white">
                    ¥{vendor.avgAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-xs tracking-wider">
                    ON-TIME RATE:
                  </span>
                  <span className="font-thin text-emerald-500">
                    {vendor.onTimeRate}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-zinc-950 border border-zinc-800 p-6">
              <h3 className="text-lg font-light text-white mb-6 tracking-widest flex items-center gap-3">
                <span className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                  04
                </span>
                QUICK ACTIONS
              </h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-500 text-white py-3 text-xs tracking-wider hover:bg-blue-400 transition-colors">
                  CALL VENDOR
                </button>
                <button className="w-full bg-emerald-500 text-white py-3 text-xs tracking-wider hover:bg-emerald-400 transition-colors">
                  SEND EMAIL
                </button>
                <button className="w-full bg-purple-500 text-white py-3 text-xs tracking-wider hover:bg-purple-400 transition-colors">
                  REQUEST QUOTE
                </button>
                <button className="w-full bg-amber-500 text-white py-3 text-xs tracking-wider hover:bg-amber-400 transition-colors">
                  SCHEDULE MEETING
                </button>
                <button className="w-full bg-red-500 text-white py-3 text-xs tracking-wider hover:bg-red-400 transition-colors">
                  ADD REVIEW
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-zinc-950 border border-zinc-800 p-6">
              <h3 className="text-lg font-light text-white mb-6 tracking-widest flex items-center gap-3">
                <span className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                  05
                </span>
                RECENT ACTIVITY
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-xs tracking-wider">
                    LAST CONTACT:
                  </span>
                  <span className="font-light text-white tracking-wider">
                    3 DAYS AGO
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-xs tracking-wider">
                    LATEST PROJECT:
                  </span>
                  <span className="font-light text-white tracking-wider">
                    IN PROGRESS
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-xs tracking-wider">
                    NEXT MEETING:
                  </span>
                  <span className="font-light text-white tracking-wider">
                    2/15 14:00
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
