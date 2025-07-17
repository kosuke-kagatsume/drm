export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg bg-white p-6 md:p-8 shadow-xl">
          <h1 className="mb-4 md:mb-6 text-2xl md:text-4xl font-bold text-gray-800">
            CRM/基幹システム デモ
          </h1>
          
          <div className="mb-6 md:mb-8 space-y-3 md:space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-700">
              システム概要
            </h2>
            <p className="text-sm md:text-base text-gray-600">
              建設業向けのCRM/ERPシステムです。DandoriWork APIと連携し、
              土地調達から見積、発注、現場進捗、引渡、アフターサービスまでを
              一元管理します。
            </p>
          </div>

          <div className="mb-6 md:mb-8 grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-2 font-semibold text-gray-700">技術スタック</h3>
              <ul className="space-y-1 text-xs md:text-sm text-gray-600">
                <li>• Backend: NestJS + TypeScript</li>
                <li>• Frontend: React 18 + Vite</li>
                <li>• Database: PostgreSQL 15</li>
                <li>• Cache: Redis</li>
                <li>• Maps: Google Maps</li>
              </ul>
            </div>
            
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-2 font-semibold text-gray-700">主要機能</h3>
              <ul className="space-y-1 text-xs md:text-sm text-gray-600">
                <li>• マルチテナント対応</li>
                <li>• リアルタイムKPI</li>
                <li>• 地図プロジェクト管理</li>
                <li>• DandoriWork同期</li>
                <li>• 役割ベース制御</li>
              </ul>
            </div>
          </div>

          <div className="mb-6 md:mb-8">
            <h3 className="mb-2 font-semibold text-gray-700">デモアカウント</h3>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> admin@crm.com<br />
                <strong>Password:</strong> password123
              </p>
            </div>
          </div>

          <div className="mb-6 md:mb-8">
            <h3 className="mb-2 font-semibold text-gray-700">📱 モバイル対応</h3>
            <div className="rounded-lg bg-green-50 border border-green-200 p-4">
              <p className="text-sm text-green-800">
                ✅ iPhone/iPad完全対応<br />
                ✅ レスポンシブデザイン<br />
                ✅ タッチ操作最適化<br />
                ✅ ログイン状態保持機能
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <a
              href="/login"
              className="text-center rounded-lg bg-blue-600 px-4 md:px-6 py-2.5 md:py-3 text-white transition hover:bg-blue-700"
            >
              ログイン画面へ
            </a>
            <a
              href="https://github.com/your-org/crm-monorepo"
              className="text-center rounded-lg border border-gray-300 bg-white px-4 md:px-6 py-2.5 md:py-3 text-gray-700 transition hover:bg-gray-50"
            >
              GitHubリポジトリ
            </a>
          </div>

          <div className="mt-6 md:mt-8 text-xs md:text-sm text-gray-500">
            <p>実装状況: Week 1完了（認証・基本構造）</p>
            <p>MVP予定: 2025年9月</p>
          </div>
        </div>
      </div>
    </div>
  );
}