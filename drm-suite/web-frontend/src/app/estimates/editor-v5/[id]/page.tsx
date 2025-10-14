import React from 'react';
import EditorClient from './EditorClient';

// ==================== Server Component（ページエントリーポイント） ====================

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EstimateEditorV5Page({ params }: PageProps) {
  const { id } = params;

  // TODO: 将来的にはサーバー側でデータを取得
  // 現在はlocalStorageベースなのでクライアント側で取得

  // サンプルユーザー（TODO: 認証システムと連携）
  const currentUser = {
    id: 'user-001',
    name: '山田太郎',
    branch: '東京支店',
  };

  return (
    <div>
      <EditorClient
        estimateId={id}
        initialTitle="新規見積"
        initialItems={[]}
        currentUser={currentUser}
      />
    </div>
  );
}

// ==================== メタデータ ====================

export async function generateMetadata({ params }: PageProps) {
  const { id } = params;

  return {
    title: `見積編集 - ${id} | DRM Suite`,
    description: 'V5見積エディタ - Next.js 14 Server Components対応',
  };
}
