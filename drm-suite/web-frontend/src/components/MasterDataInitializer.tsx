'use client';

import { useEffect } from 'react';
import { initializeConstructionMasters } from '@/data/construction-masters';

export default function MasterDataInitializer() {
  useEffect(() => {
    // 既存データがない場合のみ初期化
    const hasData = localStorage.getItem('construction_products');
    if (!hasData) {
      console.log('マスタデータを初期化しています...');
      initializeConstructionMasters();
    } else {
      console.log('マスタデータは既に存在します');
    }
  }, []);

  return null;
}
