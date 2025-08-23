'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function EstimatesDemoPage() {
  const router = useRouter();

  useEffect(() => {
    // デモ用見積データを作成
    const demoEstimate = {
      id: 'DEMO-001',
      customerId: 'CUST-001',
      customerName: '田中太郎',
      customerCompany: '田中建設株式会社',
      title: '田中様邸 新築工事',
      date: '2024-08-23',
      validUntil: '2024-09-23',
      paymentTerms: 'PT-001',
      status: 'draft',
      createdBy: 'sato@drm.com',
      createdAt: new Date().toISOString(),
      notes:
        'お見積もりありがとうございます。ご不明な点がございましたらお気軽にお問い合わせください。',
      items: [
        {
          id: 'ITEM-001',
          itemType: 'product',
          categoryId: 'CAT-001',
          productId: 'PROD-001',
          name: '基礎工事',
          quantity: 1,
          unit: '式',
          unitPrice: 500000,
          costPrice: 350000,
          amount: 500000,
          profitAmount: 150000,
          profitRate: 30,
        },
        {
          id: 'ITEM-002',
          itemType: 'product',
          categoryId: 'CAT-002',
          productId: 'PROD-002',
          name: '外壁塗装工事',
          quantity: 120,
          unit: '㎡',
          unitPrice: 3000,
          costPrice: 2000,
          amount: 360000,
          profitAmount: 120000,
          profitRate: 33.3,
        },
        {
          id: 'ITEM-003',
          itemType: 'work',
          categoryId: 'CAT-003',
          workId: 'WORK-001',
          name: '内装工事',
          quantity: 1,
          unit: '式',
          unitPrice: 300000,
          costPrice: 200000,
          amount: 300000,
          profitAmount: 100000,
          profitRate: 33.3,
        },
      ],
      overheadSettings: {
        管理費率: 5,
        一般管理費率: 8,
        諸経費率: 3,
        廃材処分費率: 2,
      },
      totals: {
        subtotal: 1160000,
        overhead: {
          管理費: 58000,
          一般管理費: 92800,
          諸経費: 34800,
          廃材処分費: 23200,
        },
        overheadTotal: 208800,
        beforeTax: 1368800,
        tax: 136880,
        total: 1505680,
        costTotal: 750000,
        profit: 618800,
        profitRate: 41.1,
      },
    };

    // LocalStorageに保存
    localStorage.setItem('estimates', JSON.stringify([demoEstimate]));

    // 見積詳細ページへリダイレクト
    router.push('/estimates/DEMO-001');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">デモデータを作成中...</p>
      </div>
    </div>
  );
}
