'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ScheduledPost {
  id: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin';
  type: 'post' | 'story' | 'reel';
  content: string;
  media: string[];
  hashtags: string[];
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'published' | 'failed' | 'draft';
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  };
  campaign?: string;
}

export default function DarkSNSSchedulerPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const [scheduledPosts] = useState<ScheduledPost[]>([
    {
      id: '1',
      platform: 'instagram',
      type: 'post',
      content:
        'CONSTRUCTION CASE STUDY: EXTERIOR PAINTING BEFORE/AFTER\n20-YEAR-OLD RESIDENCE TRANSFORMED LIKE NEW!',
      media: ['image1.jpg', 'image2.jpg'],
      hashtags: [
        'EXTERIOR_PAINTING',
        'RENOVATION',
        'CASE_STUDY',
        'BEFORE_AFTER',
      ],
      scheduledDate: '2024-03-25',
      scheduledTime: '10:00',
      status: 'scheduled',
      campaign: 'SPRING EXTERIOR PAINTING CAMPAIGN',
    },
    {
      id: '2',
      platform: 'facebook',
      type: 'post',
      content:
        'WITH THE ARRIVAL OF SPRING, HOW ABOUT HOME MAINTENANCE?\nSPECIAL PRICES ON EXTERIOR PAINTING NOW AVAILABLE!',
      media: ['campaign.jpg'],
      hashtags: ['SPRING_CAMPAIGN', 'EXTERIOR_PAINTING', 'SPECIAL_PRICE'],
      scheduledDate: '2024-03-26',
      scheduledTime: '14:00',
      status: 'scheduled',
      campaign: 'SPRING EXTERIOR PAINTING CAMPAIGN',
    },
    {
      id: '3',
      platform: 'twitter',
      type: 'post',
      content:
        'NEW HOME COMPLETION TOUR EVENT!\n3/30(SAT)・31(SUN) 10:00-17:00\nDETAILS IN PROFILE LINK',
      media: [],
      hashtags: ['OPEN_HOUSE', 'NEW_BUILD', 'EVENT'],
      scheduledDate: '2024-03-28',
      scheduledTime: '09:00',
      status: 'scheduled',
    },
    {
      id: '4',
      platform: 'instagram',
      type: 'story',
      content:
        "FROM TODAY'S CONSTRUCTION SITE. SHOWCASING OUR CRAFTSMEN'S METICULOUS WORK.",
      media: ['story1.jpg', 'story2.jpg'],
      hashtags: ['CONSTRUCTION_SITE', 'CRAFTSMEN', 'IN_PROGRESS'],
      scheduledDate: '2024-03-24',
      scheduledTime: '15:00',
      status: 'published',
      engagement: {
        likes: 145,
        comments: 12,
        shares: 8,
        reach: 1234,
      },
    },
  ]);

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = parseInt(selectedMonth.split('-')[0]);
    const month = parseInt(selectedMonth.split('-')[1]) - 1;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add padding for first day of month
    const startPadding = firstDay.getDay();
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    // Add dates
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getPostsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return scheduledPosts.filter((post) => post.scheduledDate === dateStr);
  };

  const platformLabels = {
    instagram: 'INSTAGRAM',
    facebook: 'FACEBOOK',
    twitter: 'TWITTER',
    linkedin: 'LINKEDIN',
  };

  const platformColors = {
    instagram: 'bg-purple-500',
    facebook: 'bg-blue-500',
    twitter: 'bg-sky-500',
    linkedin: 'bg-blue-600',
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: {
        color: 'text-amber-500 border-amber-500/50',
        label: 'SCHEDULED',
        indicator: '01',
      },
      published: {
        color: 'text-emerald-500 border-emerald-500/50',
        label: 'PUBLISHED',
        indicator: '02',
      },
      failed: {
        color: 'text-red-500 border-red-500/50',
        label: 'FAILED',
        indicator: '03',
      },
      draft: {
        color: 'text-zinc-500 border-zinc-500/50',
        label: 'DRAFT',
        indicator: '04',
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
                  SNS POST SCHEDULER
                </h1>
                <p className="text-zinc-500 mt-1 text-xs tracking-wider">
                  SOCIAL MEDIA POST PLANNING • MANAGEMENT
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-3 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors"
            >
              + CREATE NEW POST
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 justify-between">
            <div className="flex gap-2">
              {['all', 'instagram', 'facebook', 'twitter', 'linkedin'].map(
                (platform) => (
                  <button
                    key={platform}
                    onClick={() => setSelectedPlatform(platform)}
                    className={`px-4 py-3 text-xs tracking-wider transition-colors ${
                      selectedPlatform === platform
                        ? 'bg-white text-black'
                        : 'bg-black border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
                    }`}
                  >
                    {platform === 'all'
                      ? 'ALL PLATFORMS'
                      : platformLabels[platform as keyof typeof platformLabels]}
                  </button>
                ),
              )}
            </div>

            <div className="flex gap-4">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm"
              />
              <div className="flex border border-zinc-800">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-3 text-xs tracking-wider transition-colors ${viewMode === 'calendar' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                >
                  CALENDAR
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-3 text-xs tracking-wider transition-colors ${viewMode === 'list' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                >
                  LIST
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <div className="grid grid-cols-7 gap-px bg-zinc-800">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                <div
                  key={day}
                  className="bg-zinc-900 p-3 text-center text-xs text-zinc-500 tracking-wider"
                >
                  {day}
                </div>
              ))}
              {generateCalendarDays().map((date, index) => {
                const posts = date ? getPostsForDate(date) : [];
                const isToday =
                  date && date.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={index}
                    className={`bg-black p-2 min-h-[100px] border border-zinc-800 ${isToday ? 'border-white' : ''}`}
                  >
                    {date && (
                      <>
                        <div className="text-xs font-light text-zinc-400 mb-2 tracking-wider">
                          {String(date.getDate()).padStart(2, '0')}
                        </div>
                        <div className="space-y-1">
                          {posts.slice(0, 3).map((post) => (
                            <div
                              key={post.id}
                              className={`text-xs p-1 text-white ${platformColors[post.platform]}`}
                            >
                              <div className="flex items-center gap-1">
                                <span className="tracking-wider">
                                  {post.scheduledTime}
                                </span>
                              </div>
                            </div>
                          ))}
                          {posts.length > 3 && (
                            <div className="text-xs text-zinc-600 text-center tracking-wider">
                              +{posts.length - 3} MORE
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="bg-zinc-950 border border-zinc-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-900 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs text-zinc-500 tracking-widest">
                    DATE • TIME
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-zinc-500 tracking-widest">
                    PLATFORM
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-zinc-500 tracking-widest">
                    CONTENT
                  </th>
                  <th className="px-6 py-4 text-center text-xs text-zinc-500 tracking-widest">
                    STATUS
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-zinc-500 tracking-widest">
                    ENGAGEMENT
                  </th>
                  <th className="px-6 py-4 text-center text-xs text-zinc-500 tracking-widest">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {scheduledPosts
                  .filter(
                    (post) =>
                      selectedPlatform === 'all' ||
                      post.platform === selectedPlatform,
                  )
                  .map((post, index) => (
                    <tr
                      key={post.id}
                      className="hover:bg-zinc-900/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs mt-0.5">
                            {String(index + 1).padStart(2, '0')}
                          </div>
                          <div>
                            <p className="text-sm font-light text-white tracking-wider">
                              {post.scheduledDate}
                            </p>
                            <p className="text-xs text-zinc-500 tracking-wider mt-1">
                              {post.scheduledTime}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 ${platformColors[post.platform]}`}
                          ></div>
                          <span className="text-xs text-white tracking-wider">
                            {platformLabels[post.platform]}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-sm font-light text-white truncate tracking-wider">
                            {post.content}
                          </p>
                          <div className="flex gap-2 mt-2">
                            {post.hashtags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="text-xs text-blue-500 tracking-wider"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(post.status)}
                      </td>
                      <td className="px-6 py-4">
                        {post.engagement ? (
                          <div className="text-xs text-zinc-400 tracking-wider">
                            <p>
                              LIKES: {post.engagement.likes} | COMMENTS:{' '}
                              {post.engagement.comments}
                            </p>
                            <p className="mt-1">
                              SHARES: {post.engagement.shares} | REACH:{' '}
                              {post.engagement.reach}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-600 tracking-wider">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button className="px-3 py-1 text-xs text-blue-500 hover:text-blue-400 tracking-wider transition-colors">
                            EDIT
                          </button>
                          <button className="px-3 py-1 text-xs text-red-500 hover:text-red-400 tracking-wider transition-colors">
                            DELETE
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-zinc-500 tracking-wider mb-2">
                  SCHEDULED THIS MONTH
                </p>
                <p className="text-2xl font-thin text-white">24</p>
              </div>
              <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                01
              </div>
            </div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-zinc-500 tracking-wider mb-2">
                  PUBLISHED
                </p>
                <p className="text-2xl font-thin text-emerald-500">12</p>
              </div>
              <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                02
              </div>
            </div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-zinc-500 tracking-wider mb-2">
                  TOTAL ENGAGEMENT
                </p>
                <p className="text-2xl font-thin text-blue-500">3,456</p>
              </div>
              <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                03
              </div>
            </div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-zinc-500 tracking-wider mb-2">
                  AVERAGE REACH
                </p>
                <p className="text-2xl font-thin text-purple-500">1,234</p>
              </div>
              <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                04
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-800">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-thin text-white tracking-widest">
                  CREATE NEW POST
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-zinc-500 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                    SELECT PLATFORM
                  </label>
                  <div className="flex gap-3">
                    {['instagram', 'facebook', 'twitter', 'linkedin'].map(
                      (platform) => (
                        <button
                          key={platform}
                          className="px-4 py-3 bg-black border border-zinc-800 text-white hover:border-zinc-600 transition-colors flex items-center gap-3 text-xs tracking-wider"
                        >
                          <div
                            className={`w-2 h-2 ${platformColors[platform as keyof typeof platformColors]}`}
                          ></div>
                          <span>
                            {
                              platformLabels[
                                platform as keyof typeof platformLabels
                              ]
                            }
                          </span>
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                    POST CONTENT
                  </label>
                  <textarea
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    rows={4}
                    placeholder="Enter post content..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                      POST DATE
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                      POST TIME
                    </label>
                    <input
                      type="time"
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                    HASHTAGS
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    placeholder="#EXTERIOR_PAINTING #RENOVATION..."
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                    MEDIA FILES
                  </label>
                  <div className="border-2 border-dashed border-zinc-800 p-12 text-center">
                    <p className="text-zinc-500 text-xs tracking-wider mb-4">
                      DRAG & DROP IMAGES OR VIDEOS
                    </p>
                    <button className="px-6 py-3 bg-zinc-800 text-zinc-400 hover:text-white transition-colors text-xs tracking-wider">
                      SELECT FILES
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-4 pt-6 border-t border-zinc-800">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 text-zinc-500 hover:text-white transition-colors text-xs tracking-wider"
                >
                  CANCEL
                </button>
                <button className="flex-1 py-3 bg-zinc-800 text-white hover:bg-zinc-700 transition-colors text-xs tracking-wider">
                  SAVE AS DRAFT
                </button>
                <button className="flex-1 py-3 bg-white text-black hover:bg-zinc-200 transition-colors text-xs tracking-wider">
                  SCHEDULE POST
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
