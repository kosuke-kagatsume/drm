export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg bg-white p-8 shadow-xl">
          <h1 className="mb-6 text-4xl font-bold text-gray-800">
            CRM/基幹システム デモ
          </h1>
          
          <div className="mb-8 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-700">
              システム概要
            </h2>
            <p className="text-gray-600">
              建設業向けのCRM/ERPシステムです。DandoriWork APIと連携し、
              土地調達から見積、発注、現場進捗、引渡、アフターサービスまでを
              一元管理します。
            </p>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-2 font-semibold text-gray-700">技術スタック</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Backend: NestJS + TypeScript + Prisma</li>
                <li>• Frontend: React 18 + Vite + TailwindCSS</li>
                <li>• Database: PostgreSQL 15</li>
                <li>• Cache: Redis</li>
                <li>• Maps: Google Maps Platform</li>
              </ul>
            </div>
            
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-2 font-semibold text-gray-700">主要機能</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• マルチテナント対応</li>
                <li>• リアルタイムKPIダッシュボード</li>
                <li>• 地図ベースのプロジェクト管理</li>
                <li>• DandoriWork同期（2-5分間隔）</li>
                <li>• 役割ベースのアクセス制御</li>
              </ul>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="mb-2 font-semibold text-gray-700">デモアカウント</h3>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> admin@crm.com<br />
                <strong>Password:</strong> password123
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <a
              href="/login"
              className="rounded-lg bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
            >
              ログイン画面へ
            </a>
            <a
              href="https://github.com/your-org/crm-monorepo"
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 transition hover:bg-gray-50"
            >
              GitHubリポジトリ
            </a>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>実装状況: Week 1完了（認証・基本構造）</p>
            <p>MVP予定: 2025年9月</p>
          </div>
        </div>
      </div>
    </div>
  );
}