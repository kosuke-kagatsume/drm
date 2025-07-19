# Google Maps デバッグガイド

## 現在の実装状況

1. **環境変数の設定**
   - Vercel: `VITE_GOOGLE_MAPS_API_KEY` が設定済み（12分前に更新）
   - ローカル: `.env` ファイルに「ここに実際のAPIキーをペースト」という文字列が入っている

2. **コードの実装**
   - `/src/hooks/useGoogleMaps.ts`: Google Maps APIローダー
   - `/src/pages/map.tsx`: メインのマップページ（フォールバック表示あり）
   - `/src/pages/map-google.tsx`: Google Maps実装

## 問題の診断手順

### 1. ブラウザコンソールの確認

開発サーバー（http://localhost:5173）でマップページを開き、ブラウザのコンソールを確認してください：

```javascript
// 以下のログを確認
GOOGLE_MAPS_API_KEY: [APIキーの値または undefined]
API Key length: [文字数または undefined]
window.google: [オブジェクトまたは undefined]
Google Maps status: { isLoaded: false/true, loadError: null/エラーメッセージ }
```

### 2. よくある問題と解決方法

#### A. APIキーが読み込まれていない場合

**症状**: `GOOGLE_MAPS_API_KEY: undefined`

**解決方法**:
1. ローカルの `.env` ファイルを更新：
   ```bash
   # Vercelから実際のAPIキーをコピーして貼り付け
   VITE_GOOGLE_MAPS_API_KEY=実際のAPIキー
   ```

2. 開発サーバーを再起動：
   ```bash
   # Ctrl+C で停止後
   npm run dev
   ```

#### B. APIキーは読み込まれているがマップが表示されない

**症状**: APIキーは表示されるが、マップが読み込まれない

**考えられる原因**:

1. **APIキーの制限設定**
   - Google Cloud Console で確認: https://console.cloud.google.com/apis/credentials
   - HTTP リファラー制限を確認
   - ローカル開発用に `http://localhost:*` を追加
   - Vercel用に実際のドメインを追加

2. **請求先アカウントの問題**
   - Google Cloud Console で請求先アカウントが有効か確認
   - 無料枠を超えていないか確認

3. **APIが有効化されていない**
   - Maps JavaScript API
   - Places API
   - 両方が有効になっているか確認

#### C. コンソールエラーの対処

**Google Maps API error: RefererNotAllowedMapError**
- APIキーのHTTPリファラー制限に現在のURLが含まれていない
- 解決: Google Cloud ConsoleでAPIキーの制限を更新

**Google Maps API error: ApiNotActivatedMapError**
- 必要なAPIが有効化されていない
- 解決: Maps JavaScript APIとPlaces APIを有効化

**Google Maps API error: InvalidKeyMapError**
- APIキーが無効または間違っている
- 解決: 正しいAPIキーを確認して再設定

### 3. Vercelデプロイメントの確認

1. **環境変数が反映されているか確認**
   - Vercelダッシュボードで最新のデプロイメントを確認
   - 環境変数更新後に再デプロイされているか確認

2. **再デプロイが必要な場合**
   ```bash
   vercel --prod
   ```

### 4. デバッグ用のテストコード

以下のコードをブラウザコンソールで実行して、APIキーの状態を確認：

```javascript
// 環境変数の確認
console.log('ENV vars:', import.meta.env);

// Google Maps APIのロード状態
console.log('Google Maps loaded?', typeof window.google !== 'undefined');
console.log('Google Maps object:', window.google);

// APIキーでマニュアルロード（テスト用）
if (!window.google && import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places,marker`;
  script.onload = () => console.log('Google Maps loaded manually');
  script.onerror = (e) => console.error('Google Maps load error:', e);
  document.head.appendChild(script);
}
```

## 推奨される次のステップ

1. **ローカル環境で動作確認**
   - `.env` ファイルに実際のAPIキーを設定
   - 開発サーバーを再起動
   - ブラウザコンソールでエラーを確認

2. **Google Cloud Console で設定確認**
   - APIキーの制限設定
   - 請求先アカウントの状態
   - API有効化状態

3. **Vercel環境で確認**
   - 環境変数更新後の再デプロイ
   - プロダクションURLでのテスト

## 参考リンク

- Google Cloud Console: https://console.cloud.google.com/
- Maps JavaScript API ドキュメント: https://developers.google.com/maps/documentation/javascript
- Vercel環境変数ドキュメント: https://vercel.com/docs/concepts/projects/environment-variables