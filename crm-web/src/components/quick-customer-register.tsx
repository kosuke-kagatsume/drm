import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, X, Save } from 'lucide-react';

export default function QuickCustomerRegister() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    projectType: 'new-construction',
    budget: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 保存処理（実際はAPIコール）
    console.log('新規顧客登録:', formData);

    // 見積作成画面へ遷移（顧客情報を引き継ぎ）
    const customerId = `customer-${Date.now()}`;
    navigate(`/quote?customerId=${customerId}&name=${encodeURIComponent(formData.customerName)}`);

    // フォームリセット
    setFormData({
      customerName: '',
      phone: '',
      email: '',
      address: '',
      projectType: 'new-construction',
      budget: '',
      notes: '',
    });
    setIsOpen(false);
  };

  return (
    <>
      {/* フローティングボタン */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-all hover:scale-110 group"
        title="新規顧客登録"
      >
        <UserPlus className="w-6 h-6" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          新規顧客登録
        </span>
      </button>

      {/* モーダル */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                新規顧客クイック登録
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* 顧客名 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  顧客名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="山田太郎"
                />
              </div>

              {/* 電話番号 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  電話番号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="090-1234-5678"
                />
              </div>

              {/* メールアドレス */}
              <div>
                <label className="block text-sm font-medium mb-1">メールアドレス</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="yamada@example.com"
                />
              </div>

              {/* 住所 */}
              <div>
                <label className="block text-sm font-medium mb-1">建設予定地</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="東京都渋谷区..."
                />
              </div>

              {/* 工事種別 */}
              <div>
                <label className="block text-sm font-medium mb-1">工事種別</label>
                <select
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="new-construction">新築工事</option>
                  <option value="renovation">リフォーム</option>
                  <option value="exterior">外構工事</option>
                  <option value="repair">修繕工事</option>
                  <option value="other">その他</option>
                </select>
              </div>

              {/* 予算 */}
              <div>
                <label className="block text-sm font-medium mb-1">予算感</label>
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">未定</option>
                  <option value="under-10m">1,000万円未満</option>
                  <option value="10m-30m">1,000万円〜3,000万円</option>
                  <option value="30m-50m">3,000万円〜5,000万円</option>
                  <option value="50m-100m">5,000万円〜1億円</option>
                  <option value="over-100m">1億円以上</option>
                </select>
              </div>

              {/* メモ */}
              <div>
                <label className="block text-sm font-medium mb-1">メモ</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="展示会で来場、〇月頃着工希望など..."
                />
              </div>

              {/* ボタン */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  登録して見積作成
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
