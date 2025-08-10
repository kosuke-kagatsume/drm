'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
  HeatmapLayer,
  MarkerClusterer,
} from '@react-google-maps/api';
import { useRouter } from 'next/navigation';

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
};

const libraries: (
  | 'places'
  | 'drawing'
  | 'geometry'
  | 'localContext'
  | 'visualization'
)[] = ['visualization', 'places'];

export default function MapDashboard() {
  const router = useRouter();
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

  // Sample data for demonstration
  const projectLocations: ProjectLocation[] = [
    {
      id: 'P001',
      name: '田中様邸 外壁塗装',
      type: 'ongoing',
      lat: 35.6895,
      lng: 139.6917,
      address: '東京都新宿区西新宿2-8-1',
      status: '施工中',
      value: 2500000,
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      manager: '山田太郎',
      category: '外壁塗装',
    },
    {
      id: 'P002',
      name: '山田ビル リフォーム',
      type: 'completed',
      lat: 35.658,
      lng: 139.7016,
      address: '東京都港区六本木6-10-1',
      status: '完了',
      value: 5800000,
      startDate: '2023-12-01',
      endDate: '2024-01-10',
      manager: '佐藤次郎',
      category: 'リフォーム',
    },
    {
      id: 'P003',
      name: '佐藤邸 屋根修理',
      type: 'estimate',
      lat: 35.675,
      lng: 139.765,
      address: '東京都墨田区押上1-1-2',
      status: '見積中',
      value: 1200000,
      manager: '鈴木一郎',
      category: '屋根修理',
    },
    {
      id: 'V001',
      name: '田中塗装',
      type: 'vendor',
      lat: 35.709,
      lng: 139.7319,
      address: '東京都豊島区池袋2-40-13',
      status: '協力会社',
      value: 0,
      category: '塗装工事',
      quality: 4.5,
    },
    {
      id: 'P004',
      name: '高橋マンション 外装',
      type: 'ongoing',
      lat: 35.6314,
      lng: 139.7365,
      address: '東京都品川区大崎2-11-1',
      status: '施工中',
      value: 8900000,
      startDate: '2024-01-20',
      manager: '田中花子',
      category: '外装工事',
    },
    {
      id: 'P005',
      name: '鈴木商店 改装',
      type: 'completed',
      lat: 35.7012,
      lng: 139.7747,
      address: '東京都台東区上野7-1-1',
      status: '完了',
      value: 3200000,
      startDate: '2023-11-15',
      endDate: '2023-12-20',
      manager: '山田太郎',
      category: 'リフォーム',
    },
    {
      id: 'V002',
      name: '建材商事',
      type: 'vendor',
      lat: 35.6459,
      lng: 139.7478,
      address: '東京都目黒区中目黒3-5-7',
      status: '協力会社',
      value: 0,
      category: '建材供給',
      quality: 4.2,
    },
    {
      id: 'P006',
      name: '木村邸 防水工事',
      type: 'estimate',
      lat: 35.684,
      lng: 139.609,
      address: '東京都杉並区高井戸東3-7-5',
      status: '見積中',
      value: 950000,
      manager: '佐藤次郎',
      category: '防水工事',
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
      ) || 'なし';

    return stats;
  }, [filteredLocations]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-96 bg-white shadow-lg overflow-y-auto">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-4 text-white/80 hover:text-white"
          >
            ← ダッシュボードに戻る
          </button>
          <h1 className="text-2xl font-bold">🗺️ プロジェクトマップ</h1>
          <p className="text-blue-100 mt-2">地理的ビジネスインテリジェンス</p>
        </div>

        {/* Statistics */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-4">📊 統計サマリー</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-xs text-gray-600">総プロジェクト数</p>
              <p className="text-2xl font-bold text-blue-600">
                {statistics.totalProjects}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <p className="text-xs text-gray-600">総受注額</p>
              <p className="text-xl font-bold text-green-600">
                ¥{(statistics.totalValue / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="bg-orange-50 p-3 rounded">
              <p className="text-xs text-gray-600">進行中</p>
              <p className="text-2xl font-bold text-orange-600">
                {statistics.ongoingProjects}
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <p className="text-xs text-gray-600">協力会社</p>
              <p className="text-2xl font-bold text-purple-600">
                {statistics.vendors}
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p className="text-xs text-gray-600">平均プロジェクト単価</p>
            <p className="text-lg font-bold">
              ¥{(statistics.avgProjectValue / 1000000).toFixed(2)}M
            </p>
            <p className="text-xs text-gray-600 mt-2">最多カテゴリ</p>
            <p className="text-sm font-medium">{statistics.topCategory}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-4">🔍 フィルター</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              プロジェクトタイプ
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">すべて</option>
              <option value="ongoing">進行中</option>
              <option value="completed">完了</option>
              <option value="estimate">見積中</option>
              <option value="vendor">協力会社</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              金額範囲
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="最小"
                value={valueRange.min}
                onChange={(e) =>
                  setValueRange((prev) => ({
                    ...prev,
                    min: Number(e.target.value),
                  }))
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              />
              <span className="self-center">〜</span>
              <input
                type="number"
                placeholder="最大"
                value={valueRange.max}
                onChange={(e) =>
                  setValueRange((prev) => ({
                    ...prev,
                    max: Number(e.target.value),
                  }))
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showHeatmap}
                onChange={(e) => setShowHeatmap(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">ヒートマップ表示</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showClusters}
                onChange={(e) => setShowClusters(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">クラスター表示</span>
            </label>
          </div>
        </div>

        {/* Map Type */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-4">🗺️ マップタイプ</h2>
          <div className="space-y-2">
            <button
              onClick={() => setMapType('roadmap')}
              className={`w-full py-2 px-4 rounded ${mapType === 'roadmap' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              ロードマップ
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={`w-full py-2 px-4 rounded ${mapType === 'satellite' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              衛星写真
            </button>
            <button
              onClick={() => setMapType('hybrid')}
              className={`w-full py-2 px-4 rounded ${mapType === 'hybrid' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              ハイブリッド
            </button>
          </div>
        </div>

        {/* Project List */}
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">📍 プロジェクト一覧</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredLocations.map((location) => (
              <div
                key={location.id}
                onClick={() => setSelectedMarker(location)}
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-sm">{location.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {location.address}
                    </p>
                    {location.value > 0 && (
                      <p className="text-sm font-bold text-green-600 mt-1">
                        ¥{location.value.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      location.type === 'ongoing'
                        ? 'bg-blue-100 text-blue-800'
                        : location.type === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : location.type === 'estimate'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-purple-100 text-purple-800'
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
        <LoadScript
          googleMapsApiKey={
            process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
            'AIzaSyBNLrJhOMz6idD05pzfn5lhA-TAw-mAZCU'
          }
          libraries={libraries}
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
                {(clusterer) =>
                  filteredLocations.map((location) => (
                    <Marker
                      key={location.id}
                      position={{ lat: location.lat, lng: location.lng }}
                      icon={getMarkerIcon(location.type)}
                      onClick={() => setSelectedMarker(location)}
                      clusterer={clusterer}
                    />
                  ))
                }
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
                position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-lg mb-2">
                    {selectedMarker.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    {selectedMarker.address}
                  </p>
                  <p className="text-sm mb-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        selectedMarker.type === 'ongoing'
                          ? 'bg-blue-100 text-blue-800'
                          : selectedMarker.type === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : selectedMarker.type === 'estimate'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {selectedMarker.status}
                    </span>
                  </p>
                  {selectedMarker.value > 0 && (
                    <p className="text-lg font-bold text-green-600 mb-2">
                      ¥{selectedMarker.value.toLocaleString()}
                    </p>
                  )}
                  {selectedMarker.manager && (
                    <p className="text-sm text-gray-600">
                      担当: {selectedMarker.manager}
                    </p>
                  )}
                  {selectedMarker.startDate && (
                    <p className="text-sm text-gray-600">
                      期間: {selectedMarker.startDate} 〜{' '}
                      {selectedMarker.endDate || '進行中'}
                    </p>
                  )}
                  {selectedMarker.quality && (
                    <p className="text-sm">
                      品質評価: {'★'.repeat(Math.floor(selectedMarker.quality))}
                      <span className="text-gray-400">
                        {'★'.repeat(5 - Math.floor(selectedMarker.quality))}
                      </span>
                      ({selectedMarker.quality})
                    </p>
                  )}
                  <button
                    onClick={() => {
                      if (selectedMarker.type === 'vendor') {
                        router.push(`/vendors/${selectedMarker.id}`);
                      } else {
                        router.push(`/projects/${selectedMarker.id}`);
                      }
                    }}
                    className="mt-3 w-full bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700"
                  >
                    詳細を見る
                  </button>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>

        {/* Floating Action Buttons */}
        <div className="absolute bottom-8 right-8 space-y-3">
          <button
            onClick={() => router.push('/estimates/create')}
            className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
          >
            <span className="text-2xl">📝</span>
          </button>
          <button
            onClick={() => router.push('/projects/new')}
            className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition"
          >
            <span className="text-2xl">🏗️</span>
          </button>
        </div>
      </div>
    </div>
  );
}
