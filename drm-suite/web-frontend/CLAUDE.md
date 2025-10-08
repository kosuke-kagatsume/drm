# Claude Code 引き継ぎドキュメント

## 🎯 明日のClaude（またはあなた）へ

### 最重要情報

**開発サーバー**: http://localhost:3005 (ポート3005で動作中)
**本番URL**: https://web-frontend-joeccdg5b-kosukes-projects-c6ad92ba.vercel.app

⚠️ **2025年10月8日の大規模アップデート実施済み** - Phase 3-7実装完了

### プロジェクト概要

- **場所**: `/Users/dw100/crm-monorepo/drm-suite/`
- **内容**: 建設業界向けCRM「DRMスイート」の統合業務システム
- **技術**: Next.js 14 + TypeScript + Tailwind CSS

---

## 🆕 最新の実装内容（2025/10/08）

### 🚀 Phase 3-7実装完了 - 契約・発注・原価・請求・承認管理

**コミット**: `37def64`, `7bf8370` - 2025/10/08

#### 主要機能追加

**Phase 3-4: DW連携準備とAPI統合**
- ✅ DW発注送信API (`/api/orders/sync-to-dw`)
- ✅ DW原価受信API (`/api/orders/sync-from-dw`)
- ✅ ハイブリッドID管理（DRM ID + DW ID）
- ✅ 原価分析フィールド追加（予算vs実績）

**Phase 5: 原価管理ダッシュボード**
- ✅ 原価管理画面 (`/cost-management`)
- ✅ 予算超過アラート
- ✅ CSV出力機能
- ✅ DW同期ボタン

**Phase 6: 契約・請求管理**
- ✅ 契約CRUD API (`/api/contracts`)
- ✅ 見積→契約変換API (`/api/contracts/from-estimate`)
- ✅ 契約一覧・詳細画面
- ✅ 請求CRUD API (`/api/invoices`)
- ✅ 契約→請求変換API (`/api/invoices/from-contract`)
- ✅ 請求作成画面

**Phase 7: 発注・承認管理**
- ✅ 発注CRUD API (`/api/orders`)
- ✅ 分離発注機能（35業種対応）
- ✅ 協力会社マスタ管理 (`/admin/partners`)
- ✅ 協力会社自動提案
- ✅ 7日期限管理
- ✅ 承認管理画面 (`/approvals`)

**通知システム拡張**
- ✅ 管理者通知設定 (`/admin/notification-settings`)
- ✅ Email/Slack/Chatwork対応
- ✅ 19種類の通知トリガー設定
- ✅ 個人通知設定 (`/settings/notifications`)

#### 技術的改善
- 40ファイル、11,527行追加
- マルチテナント対応（全API）
- メモリベースデータストア
- 自動採番システム
- ステータス管理ワークフロー

#### ドキュメント
- 📄 機能一覧完全版作成 (`~/Desktop/DRM機能一覧_完全版.md`)
- 実装率: 約40%
- 次フェーズ: 工事台帳（Phase 8）

---

## 🆕 2025年9月28日の実装内容

### 1. 管理コンソールの大幅拡張 🎯

#### a. ユーザー管理（42名体制）
- **パス**: `/admin/users`
- **API**: `/api/admin/users` - 完全なREST API
- **特徴**:
  - 建設会社の実際的な組織構成（営業、施工、事務、経理等）
  - リアルタイム検索・フィルタリング
  - 役職別の絞り込み機能
  - CRUD操作完全対応

#### b. 権限管理システム
- **パス**: `/admin/permissions`
- **特徴**:
  - 9段階の役職レベル（代表取締役〜研修生）
  - 24種類の詳細権限設定
  - 権限比較マトリックス機能
  - トグルスイッチでの即座の権限変更

#### c. 組織構造管理 ⭐NEW
- **パス**: `/admin/organization`
- **API**: `/api/admin/departments`
- **革新的機能**:
  - **ドラッグ&ドロップで部署再編成**
  - 階層型組織ツリービュー
  - リアルタイムAPI保存
  - 循環参照防止アルゴリズム
  - 部署の追加・編集・削除モーダル
  - 移動モード切り替え機能

### 2. 設計資料の完全文書化 📚

**デスクトップに配置済み**: `~/Desktop/組織管理システム設計資料/`

含まれるファイル：
- **ORGANIZATION_MANAGEMENT_DESIGN.md** (30KB) - 10章構成の完全設計書
- **実装コード** - フロントエンド＆API
- **クイックスタートガイド** - 5分で動かす方法
- **DandoriPortal連携仕様** - システム間連携設計

---

## 実装済み機能一覧（2025/09/28更新）

### 管理コンソール機能

| 機能 | パス | 状態 | 特徴 |
|------|------|------|------|
| 管理ダッシュボード | `/admin` | ✅ | 6つのクイックアクション |
| ユーザー管理 | `/admin/users` | ✅ | 42名・API完全連携 |
| 権限管理 | `/admin/permissions` | ✅ | 役職×権限マトリックス |
| 組織管理 | `/admin/organization` | ✅ | ドラッグ&ドロップ対応 |
| 承認フロー | `/admin/approval-flows` | 🚧 | 次回実装予定 |

### 見積システム機能（継続中）

| 機能 | パス | 状態 |
|------|------|------|
| 見積作成フロー | `/estimates/create-v2` | ✅ |
| 見積エディタ | `/estimates/editor-v3` | ✅ |
| 資金計画書 | `/estimates/financial` | ✅ |
| テンプレート管理 | `/estimates/templates` | ✅ |

---

## 作業の始め方

```bash
# 1. 開発サーバー起動（ポート3005固定）
cd /Users/dw100/crm-monorepo/drm-suite/web-frontend
PORT=3005 npm run dev

# 2. 管理コンソールにアクセス
open http://localhost:3005/admin

# 3. 組織管理を確認
open http://localhost:3005/admin/organization
```

---

## プロジェクト構成

```
src/
├── app/
│   ├── admin/
│   │   ├── page.tsx              # 管理ダッシュボード
│   │   ├── users/page.tsx        # ユーザー管理
│   │   ├── permissions/page.tsx  # 権限管理
│   │   └── organization/page.tsx # 組織管理 ⭐NEW
│   └── api/
│       └── admin/
│           ├── users/route.ts    # ユーザーAPI
│           └── departments/route.ts # 部署API ⭐NEW
├── types/
│   └── （各種型定義）
└── docs/
    └── ORGANIZATION_MANAGEMENT_DESIGN.md # 設計書 ⭐NEW
```

---

## 次回の作業候補

- [ ] 承認ワークフロー（/admin/approval-flows）の実装
- [ ] 見積から契約書への自動変換
- [ ] 契約後の請求書発行機能
- [ ] 工事進捗と請求の連動
- [ ] DandoriPortalとのAPI連携実装
- [ ] Vercelへのデプロイ

---

## 技術的な注意点

1. **開発サーバー**: PORT=3005で統一（複数のサーバーが起動中）
2. **API設計**: マルチテナント対応（X-Tenant-Id ヘッダー）
3. **型定義**: TypeScript完全対応
4. **状態管理**: React Hooksベース（Context API使用）
5. **UIライブラリ**: Tailwind CSS + Lucide Icons

---

## 重要な変更点

- **NEW**: 管理コンソールが本格的な業務システムに進化
- **NEW**: 組織管理にドラッグ&ドロップ実装
- **NEW**: DandoriPortal連携を想定した共通設計
- 全ての見積編集はeditor-v3に統一済み
- create-v2が正式な見積作成フロー
- ステータス管理が業務フローに対応（受注/失注追跡可能）

---

## デプロイ方法

```bash
cd /Users/dw100/crm-monorepo/drm-suite/web-frontend
vercel --prod
# 新しいURLが出たら必ずこのファイルを更新すること！
```

---

**最終更新**: 2025/10/08 12:40
**セッション**: Phase 3-7実装完了
**実装機能**: 契約・発注・原価・請求・承認管理
**デプロイ**: https://web-frontend-joeccdg5b-kosukes-projects-c6ad92ba.vercel.app
**次のフェーズ**: Phase 8 - 工事台帳（建設業の核心機能）
**開発者**: Claude Code + Human
**ステータス**: Phase 1-7完了、実装率40%、本番デプロイ済み