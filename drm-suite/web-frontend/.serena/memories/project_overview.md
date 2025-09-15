# DRM Suite プロジェクト概要

## プロジェクト情報
- **名称**: DRM Suite (Dandori Relation Management System)
- **バージョン**: v1.0.1
- **場所**: `/Users/dw100/crm-monorepo/drm-suite/web-frontend`
- **最新デプロイURL**: https://web-frontend-efzpznpt7-kosukes-projects-c6ad92ba.vercel.app

## プロジェクトの目的
建設業界向けの統合CRMシステム。見積作成、原価管理、工事台帳、電子契約、請求書管理、在庫管理、マーケティング機能などを統合したエンタープライズソリューション。

## 技術スタック
- **フレームワーク**: Next.js 14.2.5
- **言語**: TypeScript 5.5.2
- **スタイリング**: Tailwind CSS 3.4.0
- **UI**: Framer Motion, Lucide React
- **チャート**: Chart.js, React-ChartJS-2
- **地図**: Google Maps API
- **PDF生成**: jsPDF, html2canvas
- **ドラッグ&ドロップ**: @dnd-kit
- **Node.js**: >=18.0.0

## 主要機能
1. **見積管理**: 詳細見積作成、テンプレート管理、原価計算
2. **契約管理**: 電子契約、契約書生成
3. **工事管理**: 工事台帳、進捗管理、原価分析
4. **会計管理**: 勘定科目管理、プロジェクト別会計分析
5. **在庫管理**: リアルタイム在庫追跡
6. **マーケティング**: キャンペーン管理、CPA分析
7. **DW連携**: 外部システムとのデータ連携

## プロジェクト構造
```
src/
├── app/          # Next.js App Router
│   ├── dashboard/
│   ├── estimates/
│   ├── contracts/
│   ├── construction/
│   ├── accounting/
│   └── ...
├── components/   # 共通コンポーネント
├── services/     # ビジネスロジック
├── contexts/     # React Context
├── types/        # TypeScript型定義
└── utils/        # ユーティリティ関数
```