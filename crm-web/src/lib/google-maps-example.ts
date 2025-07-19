// Google Maps & Places API実装例
// このファイルは実際のAPI実装時の参考コードです

/* 
実装に必要なもの:
1. Google Cloud Consoleでプロジェクト作成
2. Maps JavaScript API と Places API を有効化
3. APIキーを取得して環境変数に設定

実装例:
*/

// Google Maps型定義（実際はnpm install @types/google.mapsで取得）
declare const google: any;

// 1. Google Maps表示
export const initializeMap = (mapElement: HTMLElement, projects: any[]) => {
  const map = new google.maps.Map(mapElement, {
    center: { lat: 35.6762, lng: 139.6503 }, // 東京
    zoom: 11,
    styles: [
      // カスタムスタイル（ダークモードなど）
    ],
  });

  // プロジェクトマーカーを追加
  projects.forEach((project) => {
    const marker = new google.maps.Marker({
      position: { lat: project.latitude, lng: project.longitude },
      map,
      title: project.name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: project.statusColor || '#3b82f6', // ステータスごとの色
        fillOpacity: 0.9,
        strokeColor: '#fff',
        strokeWeight: 2,
        scale: 10,
      },
    });

    // クリックで詳細表示
    marker.addListener('click', () => {
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div>
            <h3>${project.name}</h3>
            <p>${project.address}</p>
            <p>契約金額: ¥${project.contractAmount.toLocaleString()}</p>
          </div>
        `,
      });
      infoWindow.open(map, marker);
    });
  });
};

// 2. Places API - 住所オートコンプリート
export const initializeAutocomplete = (inputElement: HTMLInputElement) => {
  const autocomplete = new google.maps.places.Autocomplete(inputElement, {
    componentRestrictions: { country: 'jp' }, // 日本限定
    fields: ['address_components', 'geometry', 'name', 'formatted_address'],
    types: ['address'], // 住所のみ
  });

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();

    if (place.geometry?.location) {
      // 緯度経度を取得
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      // フォームに自動入力
      return {
        address: place.formatted_address || '',
        latitude: lat,
        longitude: lng,
        // 住所コンポーネントから詳細情報を抽出
        prefecture: extractComponent(place, 'administrative_area_level_1'),
        city: extractComponent(place, 'locality'),
        ward: extractComponent(place, 'sublocality_level_1'),
      };
    }
  });
};

// 3. Geocoding - 住所から緯度経度を取得
export const geocodeAddress = async (address: string) => {
  const geocoder = new google.maps.Geocoder();

  try {
    const response = await geocoder.geocode({ address });
    if (response.results[0]) {
      const location = response.results[0].geometry.location;
      return {
        lat: location.lat(),
        lng: location.lng(),
        formattedAddress: response.results[0].formatted_address,
      };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// 4. 周辺検索 - 近くの建設関連業者を検索
export const searchNearbySuppliers = async (location: { lat: number; lng: number }) => {
  const service = new google.maps.places.PlacesService(
    document.createElement('div'), // ダミー要素
  );

  return new Promise((resolve, reject) => {
    service.nearbySearch(
      {
        location,
        radius: 5000, // 5km
        type: 'hardware_store', // 建材店
        keyword: '建設 工事 資材',
        language: 'ja',
      },
      (results: any, status: any) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(
            results.map((place: any) => ({
              name: place.name,
              address: place.vicinity,
              rating: place.rating,
              placeId: place.place_id,
            })),
          );
        } else {
          reject(status);
        }
      },
    );
  });
};

// ヘルパー関数
const extractComponent = (place: any, type: string) => {
  const component = place.address_components?.find((comp: any) => comp.types.includes(type));
  return component?.long_name || '';
};

// 使用例:
/*
// Reactコンポーネント内
useEffect(() => {
  if (window.google) {
    initializeMap(mapRef.current, projects);
    initializeAutocomplete(addressInputRef.current);
  }
}, []);

// 住所入力フィールド
<input
  ref={addressInputRef}
  type="text"
  placeholder="プロジェクトの住所を入力"
  className="..."
/>

// 地図表示エリア
<div ref={mapRef} className="w-full h-96" />
*/

// 環境変数設定例:
// VITE_GOOGLE_MAPS_API_KEY=your-api-key-here

// index.htmlにスクリプト追加:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&language=ja"></script>
