import { useEffect, useState } from 'react';

// Google Maps APIのローディング状態を管理するフック
export function useGoogleMaps(apiKey?: string) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // 既にロード済みの場合
    if (window.google?.maps?.Map) {
      setIsLoaded(true);
      return;
    }

    // APIキーが設定されていない場合はスキップ
    if (!apiKey) {
      return;
    }

    // グローバルコールバック関数を定義
    const callbackName = 'initGoogleMaps';
    (window as any)[callbackName] = () => {
      console.log('Google Maps API loaded successfully');
      setIsLoaded(true);
      // コールバックを削除
      delete (window as any)[callbackName];
    };

    // スクリプトタグを動的に追加
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=ja&region=JP&callback=${callbackName}`;
    script.async = true;
    script.defer = true;

    script.onerror = () => {
      setLoadError('Google Maps APIの読み込みに失敗しました');
      delete (window as any)[callbackName];
    };

    document.head.appendChild(script);

    return () => {
      // クリーンアップ
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      delete (window as any)[callbackName];
    };
  }, [apiKey]);

  return { isLoaded, loadError };
}
