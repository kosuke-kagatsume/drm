export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            DRM Suite v1.0
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Dandori Relation Management System
          </p>
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">
              マイクロサービス型CRM + RAG Copilot
            </h2>
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="p-4 bg-blue-50 rounded">
                <h3 className="font-semibold text-blue-900">見積・原価管理</h3>
                <p className="text-sm text-gray-600">承認フロー対応</p>
              </div>
              <div className="p-4 bg-green-50 rounded">
                <h3 className="font-semibold text-green-900">在庫・棚卸</h3>
                <p className="text-sm text-gray-600">リアルタイム追跡</p>
              </div>
              <div className="p-4 bg-purple-50 rounded">
                <h3 className="font-semibold text-purple-900">予約管理</h3>
                <p className="text-sm text-gray-600">会議室・車両</p>
              </div>
              <div className="p-4 bg-orange-50 rounded">
                <h3 className="font-semibold text-orange-900">
                  マーケティング
                </h3>
                <p className="text-sm text-gray-600">CPA分析・KPI</p>
              </div>
            </div>
            <div className="mt-8 p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded text-white">
              <h3 className="font-semibold mb-2">🤖 RAG Copilot搭載</h3>
              <p className="text-sm">AIが文書を理解し、業務をサポート</p>
            </div>
            <div className="mt-6 text-sm text-gray-500">
              <p>Powered by: Next.js, NestJS, Nx Monorepo</p>
              <p>© 2024 DRM Suite - Enterprise CRM Solution</p>
            </div>
            <div className="mt-4">
              <a
                href="/login"
                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                ログインして始める
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
