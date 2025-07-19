import { useState } from 'react';
import { mockProjects, statusColors, statusLabels, Project } from '@/lib/mock-data';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import GoogleMapPage from './map-google';

// Google Maps APIキーを環境変数から取得
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// デバッグ用のログ
if (typeof window !== 'undefined') {
  console.log(
    'GOOGLE_MAPS_API_KEY:',
    GOOGLE_MAPS_API_KEY ? '***' + GOOGLE_MAPS_API_KEY.slice(-4) : 'Not set',
  );
  console.log('API Key length:', GOOGLE_MAPS_API_KEY?.length);
}

export default function MapPage() {
  // すべてのフックを最初に宣言（Reactのルール）
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<string>('ALL');
  const { isLoaded, loadError } = useGoogleMaps(GOOGLE_MAPS_API_KEY);

  // デバッグ用のログ
  console.log('Google Maps status:', { isLoaded, loadError });

  // ローディング中
  if (!isLoaded && !loadError && GOOGLE_MAPS_API_KEY) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">地図を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  // Google Maps APIが利用可能かつ有効な場合のみGoogleMapPageを表示
  if (isLoaded && !loadError && GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY.length > 20) {
    return <GoogleMapPage />;
  }

  const filteredProjects =
    filter === 'ALL' ? mockProjects : mockProjects.filter((p) => p.status === filter);

  // 日本の中心座標
  const centerLat = 36.2048;
  const centerLng = 138.2529;

  // 緯度経度を画面座標に変換（日本全体表示用）
  const latLngToPixel = (lat: number, lng: number) => {
    const mapWidth = 800;
    const mapHeight = 600;
    const scale = 120; // 日本全体が見えるスケール

    const x = (lng - centerLng) * scale + mapWidth / 2;
    const y = -(lat - centerLat) * scale + mapHeight / 2;

    return { x, y };
  };

  return (
    <div className="h-full flex flex-col">
      {/* フィルターバー */}
      <div className="bg-white border-b p-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium">ステータス:</span>
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 text-sm rounded-full ${
              filter === 'ALL'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            すべて ({mockProjects.length})
          </button>
          {Object.entries(statusLabels).map(([key, label]) => {
            const count = mockProjects.filter((p) => p.status === key).length;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1 text-sm rounded-full ${
                  filter === key ? 'text-white' : 'text-gray-700 hover:opacity-80'
                }`}
                style={{
                  backgroundColor:
                    filter === key ? statusColors[key as keyof typeof statusColors] : '#f3f4f6',
                }}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 地図エリア */}
      <div className="flex-1 relative bg-gray-100 overflow-hidden">
        {/* 背景（簡易地図風） */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
          {/* グリッド線 */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e5e7eb" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* 日本の主要エリアラベル */}
          <div className="absolute" style={{ left: '480px', top: '320px' }}>
            <span className="text-sm text-gray-600 font-medium">東京</span>
          </div>
          <div className="absolute" style={{ left: '400px', top: '380px' }}>
            <span className="text-sm text-gray-600 font-medium">名古屋</span>
          </div>
          <div className="absolute" style={{ left: '350px', top: '360px' }}>
            <span className="text-sm text-gray-600 font-medium">大阪</span>
          </div>
          <div className="absolute" style={{ left: '200px', top: '400px' }}>
            <span className="text-sm text-gray-600 font-medium">福岡</span>
          </div>
        </div>

        {/* プロジェクトマーカー */}
        {filteredProjects.map((project) => {
          const { x, y } = latLngToPixel(project.latitude, project.longitude);
          return (
            <div
              key={project.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110 group"
              style={{ left: `${x}px`, top: `${y}px` }}
              onClick={() => setSelectedProject(project)}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                style={{ backgroundColor: statusColors[project.status] }}
              >
                {project.id}
              </div>
              <div className="absolute top-9 left-1/2 transform -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <span className="text-xs bg-gray-900 text-white px-2 py-1 rounded shadow-md">
                  {project.name}
                </span>
              </div>
            </div>
          );
        })}

        {/* プロジェクト詳細サイドパネル */}
        <div
          className={`absolute right-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform ${
            selectedProject ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {selectedProject && (
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold">{selectedProject.name}</h3>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">ステータス:</span>
                  <span
                    className="ml-2 px-2 py-1 rounded-full text-xs text-white"
                    style={{
                      backgroundColor:
                        statusColors[selectedProject.status as keyof typeof statusColors],
                    }}
                  >
                    {statusLabels[selectedProject.status as keyof typeof statusLabels]}
                  </span>
                </div>

                <div>
                  <span className="text-gray-500">顧客名:</span>
                  <span className="ml-2 font-medium">{selectedProject.customerName}</span>
                </div>

                <div>
                  <span className="text-gray-500">住所:</span>
                  <p className="ml-2">{selectedProject.address}</p>
                </div>

                <div>
                  <span className="text-gray-500">契約金額:</span>
                  <span className="ml-2 font-medium">
                    ¥{selectedProject.contractAmount.toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-gray-500">工期:</span>
                  <p className="ml-2">
                    {selectedProject.startDate} 〜 {selectedProject.completionDate}
                  </p>
                </div>

                <div>
                  <span className="text-gray-500">進捗:</span>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${selectedProject.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{selectedProject.progress}%</span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-500">担当:</span>
                  <span className="ml-2">{selectedProject.assignee}</span>
                </div>
              </div>

              <div className="mt-6">
                <a
                  href={`/projects/${selectedProject.id}`}
                  className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  詳細を見る
                </a>
              </div>
            </div>
          )}
        </div>

        {/* 凡例 */}
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded shadow">
          <h4 className="text-xs font-bold mb-2">凡例</h4>
          <div className="space-y-1">
            {Object.entries(statusLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: statusColors[key as keyof typeof statusColors] }}
                ></div>
                <span className="text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
