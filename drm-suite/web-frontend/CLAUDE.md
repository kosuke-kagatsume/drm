# Claude Code 引き継ぎドキュメント

## 🎯 明日のClaude（またはあなた）へ

### 最重要情報

**本番URL**: https://web-frontend-cy7qcla7s-kosukes-projects-c6ad92ba.vercel.app/
**開発サーバー**: http://localhost:3005 (ポート3005で動作中)

これが2025年9月27日 23:30時点の最新デプロイです。他のURLは古いので使わないこと。

### プロジェクト概要

- **場所**: `/Users/dw100/crm-monorepo/drm-suite/`
- **内容**: 建設業界向けCRM「DRMスイート」の見積システム + 企業向けPDF管理システム
- **技術**: Next.js 14 + TypeScript + Tailwind CSS

### 🆕 最新の実装内容（2025/09/27）

#### 1. 企業向けマルチテナント対応PDF管理システム 🎯

**完全実装済み** - 建設業界向けの企業ブランディング対応PDF生成システム

##### 主要機能
- **企業ブランディング管理** (`/admin/pdf-management`)
  - 会社ロゴ、カラーテーマ、フォント設定
  - 連絡先情報、法的情報（法人番号等）
  - リアルタイムプレビュー機能

- **PDFテンプレート管理**
  - 見積書、請求書、契約書等の多文書種対応
  - 階層型セクション管理（ヘッダー、明細、合計等）
  - 企業別カスタマイズ対応

- **アセット管理**
  - ドラッグ&ドロップファイルアップロード
  - ロゴ、印鑑、署名画像管理
  - ファイル形式検証（PNG, JPEG, SVG対応）

- **PDF生成エンジン**
  - ブラウザネイティブ印刷（window.print）
  - 企業ブランディング動的適用
  - テンプレート変数処理

##### 技術仕様
```typescript
// 型定義: /src/types/pdf-template.ts
// PDF生成: /src/lib/pdf-engine.ts
// API: /src/app/api/pdf/branding/, /src/app/api/pdf/templates/
// 管理画面: /src/app/admin/pdf-management/
// コンポーネント: /src/components/pdf/
```

##### アクセスURL
- **PDF管理システム**: https://web-frontend-cy7qcla7s-kosukes-projects-c6ad92ba.vercel.app/admin/pdf-management
- **見積エディタ（PDF連携済み）**: https://web-frontend-cy7qcla7s-kosukes-projects-c6ad92ba.vercel.app/estimates/editor-v3/new
- **ローカル開発**: http://localhost:3005 (開発時)

#### 2. 見積システム既存機能（継続）

- **見積作成フロー**: `/estimates/create-v2` → `/estimates/editor-v3`
- **マスターデータ連携**: 建設業界75種類以上
- **ドラッグ&ドロップ**: 明細編集対応
- **承認ワークフロー**: 3段階承認（マネージャー→取締役→社長）

### 実装済みファイル構成

```
src/
├── types/pdf-template.ts          # PDF関連型定義（400行）
├── lib/pdf-engine.ts              # PDF生成エンジン（600行）
├── app/
│   ├── admin/pdf-management/      # PDF管理画面（400行）
│   ├── api/pdf/                   # PDF用API
│   │   ├── branding/route.ts      # 企業ブランディングAPI
│   │   └── templates/route.ts     # テンプレート管理API
│   └── estimates/editor-v3/[id]/  # 見積エディタ（PDF連携）
└── components/pdf/                # PDF関連コンポーネント
    ├── CompanyBrandingManager.tsx # ブランディング管理（500行）
    ├── PdfTemplateManager.tsx     # テンプレート管理（400行）
    ├── AssetManager.tsx           # アセット管理（300行）
    └── TemplateSelector.tsx       # テンプレート選択（400行）
```

### 作業の始め方

```bash
# 1. ローカル開発サーバー起動（ポート3005固定）
cd /Users/dw100/crm-monorepo/drm-suite/web-frontend
PORT=3005 npm run dev

# 2. PDF管理システムにアクセス
open http://localhost:3005/admin/pdf-management

# 3. 見積エディタでPDF機能確認
open http://localhost:3005/estimates/editor-v3/new
```

### Git コミット履歴

最新コミット（2025/09/27）:
```
dfa23c0 - feat: 企業向けマルチテナント対応PDF管理システム実装
```

### 次の開発タスク候補

- [x] PDF出力機能（完了）
- [x] 承認ワークフロー統合（完了）
- [x] 企業ブランディング管理（完了）
- [ ] Vercelデプロイ
- [ ] 見積から契約書への自動変換
- [ ] 請求書発行機能
- [ ] 工事進捗との連動

### デプロイ方法

```bash
cd /Users/dw100/crm-monorepo/drm-suite/web-frontend
vercel --prod
# 新しいURLが出たら必ずこのファイルを更新すること！
```

### 重要な技術詳細

#### PDF生成システムの特徴
- **マルチテナント対応**: 企業ID別のデータ分離
- **ブラウザネイティブ**: サーバーレス環境対応
- **リアルタイムプレビュー**: 設定変更の即時反映
- **REST API設計**: /api/pdf/* エンドポイント

#### 型安全性
- TypeScript完全対応
- 310行の包括的型定義
- 企業ブランディング、テンプレート、セクション等

---

**最終更新**: 2025/09/27 23:30
**開発者**: Claude Code + Human
**ステータス**: PDF管理システム完全実装済み、動作確認済み