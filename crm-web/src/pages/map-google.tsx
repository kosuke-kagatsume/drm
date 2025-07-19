import { useEffect, useRef, useState } from 'react';
import { mockProjects, statusColors, statusLabels, Project } from '@/lib/mock-data';

// Google Maps APIを使用した地図表示
// 注: 実装にはGoogle Maps APIキーが必要です
export default function GoogleMapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<string>('ALL');
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  const filteredProjects =
    filter === 'ALL' ? mockProjects : mockProjects.filter((p) => p.status === filter);

  // Google Maps初期化
  useEffect(() => {
    if (!mapRef.current) return;

    // Google Maps APIが読み込まれることを確認
    if (!window.google?.maps?.Map) {
      console.error('Google Maps API not loaded yet');
      return;
    }

    const newMap = new google.maps.Map(mapRef.current, {
      center: { lat: 36.2048, lng: 138.2529 }, // 日本の中心付近
      zoom: 6, // 日本全体が見える程度のズーム
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    setMap(newMap);
  }, []);

  // マーカーの更新
  useEffect(() => {
    if (!map) return;

    // 既存のマーカーをクリア
    markersRef.current.forEach((marker) => {
      marker.map = null;
    });
    markersRef.current = [];

    // 新しいマーカーを追加
    filteredProjects.forEach((project) => {
      // マーカー要素を作成
      const markerDiv = document.createElement('div');
      markerDiv.style.width = '24px';
      markerDiv.style.height = '24px';
      markerDiv.style.backgroundColor = statusColors[project.status];
      markerDiv.style.border = '2px solid white';
      markerDiv.style.borderRadius = '50%';
      markerDiv.style.cursor = 'pointer';
      markerDiv.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      markerDiv.title = project.name;

      // AdvancedMarkerElementが利用可能か確認
      let marker;
      if (google.maps.marker?.AdvancedMarkerElement) {
        marker = new google.maps.marker.AdvancedMarkerElement({
          position: { lat: project.latitude, lng: project.longitude },
          map,
          content: markerDiv,
          title: project.name,
        });
      } else {
        // フォールバック: 通常のMarkerを使用
        console.warn('AdvancedMarkerElement not available, using regular Marker');
        marker = new google.maps.Marker({
          position: { lat: project.latitude, lng: project.longitude },
          map,
          title: project.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: statusColors[project.status],
            fillOpacity: 0.8,
            strokeColor: 'white',
            strokeWeight: 2,
          },
        });

        // クリックイベントをMarkerに追加
        marker.addListener('click', () => {
          setSelectedProject(project);
        });

        markersRef.current.push(marker as any);
        return;
      }

      // クリックイベント
      markerDiv.addEventListener('click', () => {
        setSelectedProject(project);
      });

      if (marker) {
        markersRef.current.push(marker);
      }
    });
  }, [map, filteredProjects]);

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
      <div className="flex-1 relative">
        {/* Google Maps */}
        <div ref={mapRef} className="w-full h-full" />

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
                    style={{ backgroundColor: statusColors[selectedProject.status] }}
                  >
                    {statusLabels[selectedProject.status]}
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

              <div className="mt-6 space-y-2">
                <a
                  href={`/projects/${selectedProject.id}`}
                  className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  詳細を見る
                </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedProject.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                  Google Mapsで開く
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
