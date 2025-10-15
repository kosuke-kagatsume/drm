'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
  HeatmapLayer,
  MarkerClusterer,
} from '@react-google-maps/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectLocation {
  id: string;
  name: string;
  type: 'ongoing' | 'completed' | 'estimate' | 'vendor';
  lat: number;
  lng: number;
  address: string;
  status: string;
  value: number;
  startDate?: string;
  endDate?: string;
  manager?: string;
  category?: string;
  quality?: number;
}

const mapContainerStyle = {
  width: '100%',
  height: '100vh',
};

const center = {
  lat: 35.6762,
  lng: 139.6503, // Tokyo center
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: true,
  mapTypeControl: true,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'all',
      stylers: [{ invert_lightness: true }, { saturation: -100 }],
    },
  ],
};

const libraries: ('places' | 'drawing' | 'geometry' | 'visualization')[] = [
  'visualization',
  'places',
];

// Google Maps API key from environment variables
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export default function MapDashboard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [selectedMarker, setSelectedMarker] = useState<ProjectLocation | null>(
    null,
  );
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>(
    'roadmap',
  );
  const [filterType, setFilterType] = useState<
    'all' | 'ongoing' | 'completed' | 'estimate' | 'vendor'
  >('all');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showClusters, setShowClusters] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [valueRange, setValueRange] = useState({ min: 0, max: 10000000 });

  // Sample data adapted to Dark Elegant theme
  const projectLocations: ProjectLocation[] = [
    {
      id: 'P001',
      name: 'TANAKA RESIDENCE EXTERIOR PAINTING',
      type: 'ongoing',
      lat: 35.6895,
      lng: 139.6917,
      address: 'TOKYO, SHINJUKU-KU, NISHI-SHINJUKU 2-8-1',
      status: 'IN PROGRESS',
      value: 2500000,
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      manager: 'YAMADA TARO',
      category: 'EXTERIOR PAINTING',
    },
    {
      id: 'P002',
      name: 'YAMADA BUILDING RENOVATION',
      type: 'completed',
      lat: 35.658,
      lng: 139.7016,
      address: 'TOKYO, MINATO-KU, ROPPONGI 6-10-1',
      status: 'COMPLETED',
      value: 5800000,
      startDate: '2023-12-01',
      endDate: '2024-01-10',
      manager: 'SATO JIRO',
      category: 'RENOVATION',
    },
    {
      id: 'P003',
      name: 'SATO RESIDENCE ROOF REPAIR',
      type: 'estimate',
      lat: 35.675,
      lng: 139.765,
      address: 'TOKYO, SUMIDA-KU, OSHIAGE 1-1-2',
      status: 'ESTIMATING',
      value: 1200000,
      manager: 'SUZUKI ICHIRO',
      category: 'ROOF REPAIR',
    },
    {
      id: 'V001',
      name: 'TANAKA PAINTING CO',
      type: 'vendor',
      lat: 35.709,
      lng: 139.7319,
      address: 'TOKYO, TOSHIMA-KU, IKEBUKURO 2-40-13',
      status: 'PARTNER COMPANY',
      value: 0,
      category: 'PAINTING CONTRACTOR',
      quality: 4.5,
    },
    {
      id: 'P004',
      name: 'TAKAHASHI APARTMENT EXTERIOR',
      type: 'ongoing',
      lat: 35.6314,
      lng: 139.7365,
      address: 'TOKYO, SHINAGAWA-KU, OSAKI 2-11-1',
      status: 'IN PROGRESS',
      value: 8900000,
      startDate: '2024-01-20',
      manager: 'TANAKA HANAKO',
      category: 'EXTERIOR CONSTRUCTION',
    },
    {
      id: 'P005',
      name: 'SUZUKI STORE RENOVATION',
      type: 'completed',
      lat: 35.7012,
      lng: 139.7747,
      address: 'TOKYO, TAITO-KU, UENO 7-1-1',
      status: 'COMPLETED',
      value: 3200000,
      startDate: '2023-11-15',
      endDate: '2023-12-20',
      manager: 'YAMADA TARO',
      category: 'RENOVATION',
    },
    {
      id: 'V002',
      name: 'CONSTRUCTION MATERIALS CO',
      type: 'vendor',
      lat: 35.6459,
      lng: 139.7478,
      address: 'TOKYO, MEGURO-KU, NAKA-MEGURO 3-5-7',
      status: 'PARTNER COMPANY',
      value: 0,
      category: 'MATERIAL SUPPLIER',
      quality: 4.2,
    },
    {
      id: 'P006',
      name: 'KIMURA RESIDENCE WATERPROOFING',
      type: 'estimate',
      lat: 35.684,
      lng: 139.609,
      address: 'TOKYO, SUGINAMI-KU, TAKAIDO-HIGASHI 3-7-5',
      status: 'ESTIMATING',
      value: 950000,
      manager: 'SATO JIRO',
      category: 'WATERPROOFING',
    },
  ];

  const filteredLocations = useMemo(() => {
    return projectLocations.filter((location) => {
      if (filterType !== 'all' && location.type !== filterType) return false;
      if (location.value < valueRange.min || location.value > valueRange.max)
        return false;
      return true;
    });
  }, [filterType, valueRange, projectLocations]);

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'ongoing':
        return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
      case 'completed':
        return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
      case 'estimate':
        return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
      case 'vendor':
        return 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png';
      default:
        return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
    }
  };

  const heatmapData = useMemo(() => {
    if (!showHeatmap) return [];
    return filteredLocations.map((location) => ({
      location: new google.maps.LatLng(location.lat, location.lng),
      weight: location.value / 1000000, // Weight by project value in millions
    }));
  }, [filteredLocations, showHeatmap]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const stats = {
      totalProjects: filteredLocations.filter((l) => l.type !== 'vendor')
        .length,
      totalValue: filteredLocations
        .filter((l) => l.type !== 'vendor')
        .reduce((sum, l) => sum + l.value, 0),
      ongoingProjects: filteredLocations.filter((l) => l.type === 'ongoing')
        .length,
      completedProjects: filteredLocations.filter((l) => l.type === 'completed')
        .length,
      estimates: filteredLocations.filter((l) => l.type === 'estimate').length,
      vendors: filteredLocations.filter((l) => l.type === 'vendor').length,
      avgProjectValue: 0,
      topCategory: '',
    };

    stats.avgProjectValue =
      stats.totalProjects > 0 ? stats.totalValue / stats.totalProjects : 0;

    // Find top category
    const categories: { [key: string]: number } = {};
    filteredLocations.forEach((l) => {
      if (l.category) {
        categories[l.category] = (categories[l.category] || 0) + 1;
      }
    });
    stats.topCategory =
      Object.keys(categories).reduce(
        (a, b) => (categories[a] > categories[b] ? a : b),
        '',
      ) || 'NONE';

    return stats;
  }, [filteredLocations]);

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
    <div className="flex h-screen bg-black">
      {/* Sidebar */}
      <div className="w-96 bg-zinc-950 border-r border-zinc-800 overflow-y-auto">
        <div className="p-6 bg-zinc-900 border-b border-zinc-800">
          <button
            onClick={() => router.push('/dark/dashboard')}
            className="mb-4 text-zinc-500 hover:text-white transition-colors text-xs tracking-wider"
          >
            ← DASHBOARD
          </button>
          <h1 className="text-xl font-thin text-white tracking-widest">
            PROJECT MAP
          </h1>
          <p className="text-zinc-500 mt-2 text-xs tracking-wider">
            GEOGRAPHIC BUSINESS INTELLIGENCE
          </p>
        </div>

        {/* Statistics */}
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-sm font-normal text-white mb-4 tracking-widest">
            STATISTICS SUMMARY
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black border border-zinc-800 p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-zinc-500 tracking-wider">
                    TOTAL PROJECTS
                  </p>
                  <p className="text-xl font-thin text-blue-500">
                    {statistics.totalProjects}
                  </p>
                </div>
                <div className="w-6 h-6 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                  01
                </div>
              </div>
            </div>
            <div className="bg-black border border-zinc-800 p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-zinc-500 tracking-wider">
                    TOTAL VALUE
                  </p>
                  <p className="text-lg font-thin text-emerald-500">
                    ¥{(statistics.totalValue / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div className="w-6 h-6 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                  02
                </div>
              </div>
            </div>
            <div className="bg-black border border-zinc-800 p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-zinc-500 tracking-wider">
                    IN PROGRESS
                  </p>
                  <p className="text-xl font-thin text-amber-500">
                    {statistics.ongoingProjects}
                  </p>
                </div>
                <div className="w-6 h-6 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                  03
                </div>
              </div>
            </div>
            <div className="bg-black border border-zinc-800 p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-zinc-500 tracking-wider">
                    PARTNERS
                  </p>
                  <p className="text-xl font-thin text-purple-500">
                    {statistics.vendors}
                  </p>
                </div>
                <div className="w-6 h-6 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                  04
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-zinc-900 border border-zinc-800">
            <p className="text-xs text-zinc-500 tracking-wider">
              AVERAGE PROJECT VALUE
            </p>
            <p className="text-sm font-light text-white">
              ¥{(statistics.avgProjectValue / 1000000).toFixed(2)}M
            </p>
            <p className="text-xs text-zinc-500 mt-2 tracking-wider">
              TOP CATEGORY
            </p>
            <p className="text-xs font-light text-white tracking-wider">
              {statistics.topCategory}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-sm font-normal text-white mb-4 tracking-widest">
            FILTERS
          </h2>

          <div className="mb-4">
            <label className="block text-xs text-zinc-500 tracking-wider mb-2">
              PROJECT TYPE
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm"
            >
              <option value="all">ALL</option>
              <option value="ongoing">IN PROGRESS</option>
              <option value="completed">COMPLETED</option>
              <option value="estimate">ESTIMATING</option>
              <option value="vendor">PARTNERS</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-xs text-zinc-500 tracking-wider mb-2">
              VALUE RANGE
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="MIN"
                value={valueRange.min}
                onChange={(e) =>
                  setValueRange((prev) => ({
                    ...prev,
                    min: Number(e.target.value),
                  }))
                }
                className="flex-1 px-3 py-2 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
              />
              <span className="self-center text-zinc-500">—</span>
              <input
                type="number"
                placeholder="MAX"
                value={valueRange.max}
                onChange={(e) =>
                  setValueRange((prev) => ({
                    ...prev,
                    max: Number(e.target.value),
                  }))
                }
                className="flex-1 px-3 py-2 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showHeatmap}
                onChange={(e) => setShowHeatmap(e.target.checked)}
                className="mr-3 bg-black border-zinc-700"
              />
              <span className="text-xs tracking-wider text-white">
                HEATMAP DISPLAY
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showClusters}
                onChange={(e) => setShowClusters(e.target.checked)}
                className="mr-3 bg-black border-zinc-700"
              />
              <span className="text-xs tracking-wider text-white">
                CLUSTER DISPLAY
              </span>
            </label>
          </div>
        </div>

        {/* Map Type */}
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-sm font-normal text-white mb-4 tracking-widest">
            MAP TYPE
          </h2>
          <div className="space-y-2">
            <button
              onClick={() => setMapType('roadmap')}
              className={`w-full py-2 px-4 text-xs tracking-wider transition-colors ${mapType === 'roadmap' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'}`}
            >
              ROADMAP
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={`w-full py-2 px-4 text-xs tracking-wider transition-colors ${mapType === 'satellite' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'}`}
            >
              SATELLITE
            </button>
            <button
              onClick={() => setMapType('hybrid')}
              className={`w-full py-2 px-4 text-xs tracking-wider transition-colors ${mapType === 'hybrid' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'}`}
            >
              HYBRID
            </button>
          </div>
        </div>

        {/* Project List */}
        <div className="p-6">
          <h2 className="text-sm font-normal text-white mb-4 tracking-widest">
            PROJECT LIST
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredLocations.map((location, index) => (
              <div
                key={location.id}
                onClick={() => setSelectedMarker(location)}
                className="p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs mt-0.5">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <h4 className="text-xs font-light text-white tracking-wider">
                        {location.name}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-1 tracking-wider">
                        {location.address}
                      </p>
                      {location.value > 0 && (
                        <p className="text-xs font-light text-emerald-500 mt-1">
                          ¥{location.value.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 border tracking-wider ${
                      location.type === 'ongoing'
                        ? 'text-blue-500 border-blue-500/50'
                        : location.type === 'completed'
                          ? 'text-emerald-500 border-emerald-500/50'
                          : location.type === 'estimate'
                            ? 'text-amber-500 border-amber-500/50'
                            : 'text-purple-500 border-purple-500/50'
                    }`}
                  >
                    {location.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {!GOOGLE_MAPS_API_KEY ||
        GOOGLE_MAPS_API_KEY === 'AIzaSyBGVEu7pxJUhDl9vR9mLkN5N4JhYPFfPHE' ? (
          <div className="h-full flex items-center justify-center bg-black">
            <div className="text-center p-8 bg-zinc-950 border border-zinc-800 max-w-md">
              <div className="w-16 h-16 border border-zinc-700 flex items-center justify-center text-zinc-500 font-light text-2xl mx-auto mb-4">
                MAP
              </div>
              <h2 className="text-xl font-thin text-white mb-3 tracking-widest">
                GOOGLE MAPS API KEY INVALID
              </h2>
              <p className="text-zinc-500 mb-4 text-xs tracking-wider">
                CURRENT API KEY CANNOT DISPLAY MAP.
              </p>
              <div className="bg-zinc-900 border border-zinc-800 p-4 text-left mb-4">
                <p className="text-xs text-zinc-400 mb-2 tracking-wider">
                  ✓ REQUIRED APIS TO ENABLE:
                </p>
                <ul className="text-xs text-zinc-500 ml-4 space-y-1 tracking-wider">
                  <li>• MAPS JAVASCRIPT API</li>
                  <li>• GEOCODING API</li>
                  <li>• PLACES API</li>
                </ul>
                <p className="text-xs text-zinc-400 mt-3 tracking-wider">
                  🔑 CHECK API KEY RESTRICTIONS:
                </p>
                <ul className="text-xs text-zinc-500 ml-4 space-y-1 tracking-wider">
                  <li>• HTTP REFERRER RESTRICTIONS</li>
                  <li>• API KEY RESTRICTIONS</li>
                </ul>
              </div>
              <a
                href="https://console.cloud.google.com/apis/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors"
              >
                OPEN GOOGLE CLOUD CONSOLE
              </a>
            </div>
          </div>
        ) : (
          <LoadScript
            googleMapsApiKey={GOOGLE_MAPS_API_KEY}
            libraries={libraries}
            loadingElement={
              <div className="h-full flex items-center justify-center bg-black">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-500 mx-auto"></div>
                  <p className="mt-4 text-zinc-500 text-xs tracking-wider">
                    LOADING MAP...
                  </p>
                </div>
              </div>
            }
          >
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={11}
              options={{ ...mapOptions, mapTypeId: mapType }}
            >
              {/* Heatmap Layer */}
              {showHeatmap && heatmapData.length > 0 && (
                <HeatmapLayer
                  data={heatmapData}
                  options={{
                    radius: 50,
                    opacity: 0.6,
                  }}
                />
              )}

              {/* Markers with Clustering */}
              {showClusters ? (
                <MarkerClusterer>
                  {(clusterer) => (
                    <>
                      {filteredLocations.map((location) => (
                        <Marker
                          key={location.id}
                          position={{ lat: location.lat, lng: location.lng }}
                          icon={getMarkerIcon(location.type)}
                          onClick={() => setSelectedMarker(location)}
                          clusterer={clusterer}
                        />
                      ))}
                    </>
                  )}
                </MarkerClusterer>
              ) : (
                filteredLocations.map((location) => (
                  <Marker
                    key={location.id}
                    position={{ lat: location.lat, lng: location.lng }}
                    icon={getMarkerIcon(location.type)}
                    onClick={() => setSelectedMarker(location)}
                  />
                ))
              )}

              {/* Info Window */}
              {selectedMarker && (
                <InfoWindow
                  position={{
                    lat: selectedMarker.lat,
                    lng: selectedMarker.lng,
                  }}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div className="p-2 min-w-[200px] bg-zinc-950 text-white">
                    <h3 className="font-light text-lg mb-2 tracking-wider">
                      {selectedMarker.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mb-1 tracking-wider">
                      {selectedMarker.address}
                    </p>
                    <p className="text-xs mb-2">
                      <span
                        className={`px-2 py-1 border text-xs tracking-wider ${
                          selectedMarker.type === 'ongoing'
                            ? 'text-blue-500 border-blue-500/50'
                            : selectedMarker.type === 'completed'
                              ? 'text-emerald-500 border-emerald-500/50'
                              : selectedMarker.type === 'estimate'
                                ? 'text-amber-500 border-amber-500/50'
                                : 'text-purple-500 border-purple-500/50'
                        }`}
                      >
                        {selectedMarker.status}
                      </span>
                    </p>
                    {selectedMarker.value > 0 && (
                      <p className="text-sm font-light text-emerald-500 mb-2">
                        ¥{selectedMarker.value.toLocaleString()}
                      </p>
                    )}
                    {selectedMarker.manager && (
                      <p className="text-xs text-zinc-400 tracking-wider">
                        MANAGER: {selectedMarker.manager}
                      </p>
                    )}
                    {selectedMarker.startDate && (
                      <p className="text-xs text-zinc-400 tracking-wider">
                        PERIOD: {selectedMarker.startDate} —{' '}
                        {selectedMarker.endDate || 'ONGOING'}
                      </p>
                    )}
                    {selectedMarker.quality && (
                      <p className="text-xs tracking-wider">
                        QUALITY RATING:{' '}
                        {'★'.repeat(Math.floor(selectedMarker.quality))}
                        <span className="text-zinc-600">
                          {'★'.repeat(5 - Math.floor(selectedMarker.quality))}
                        </span>
                        ({selectedMarker.quality})
                      </p>
                    )}
                    <button
                      onClick={() => {
                        if (selectedMarker.type === 'vendor') {
                          router.push(`/dark/vendors/${selectedMarker.id}`);
                        } else {
                          router.push(`/dark/projects/${selectedMarker.id}`);
                        }
                      }}
                      className="mt-3 w-full bg-white text-black py-1 px-3 text-xs tracking-wider hover:bg-zinc-200 transition-colors"
                    >
                      VIEW DETAILS
                    </button>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        )}

        {/* Floating Action Buttons */}
        <div className="absolute bottom-8 right-8 space-y-3">
          <button
            onClick={() => router.push('/estimates/create-v2')}
            className="w-12 h-12 bg-blue-500 border border-zinc-800 flex items-center justify-center hover:bg-blue-400 transition-colors"
          >
            <span className="text-white text-xs tracking-widest">EST</span>
          </button>
          <button
            onClick={() => router.push('/dark/projects/new')}
            className="w-12 h-12 bg-emerald-500 border border-zinc-800 flex items-center justify-center hover:bg-emerald-400 transition-colors"
          >
            <span className="text-white text-xs tracking-widest">PRJ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
