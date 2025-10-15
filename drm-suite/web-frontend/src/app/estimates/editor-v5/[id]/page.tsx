'use client';

import dynamic from 'next/dynamic';

// V5エディタクライアントを動的インポート
const EditorClient = dynamic(() => import('./EditorClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">
          📝 V5エディタを読み込み中...
        </p>
        <p className="text-gray-400 text-sm mt-2">
          高度なエディタ機能を準備しています
        </p>
      </div>
    </div>
  ),
});

interface PageProps {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function EstimateEditorV5Page({
  params,
  searchParams,
}: PageProps) {
  const customerName =
    typeof searchParams?.customerName === 'string'
      ? searchParams.customerName
      : '';
  const customerId =
    typeof searchParams?.customerId === 'string' ? searchParams.customerId : '';

  const currentUser = {
    id: 'user-001',
    name: '山田太郎',
    branch: '東京支店',
  };

  return (
    <EditorClient
      estimateId={params.id}
      initialTitle="新規見積"
      initialCustomer={customerName}
      initialCustomerId={customerId}
      initialItems={[]}
      currentUser={currentUser}
    />
  );
}
