import { useState, useCallback } from 'react';
import { EstimateVersion, EstimateData } from '../types';
import { generateVersionNumber, generateId } from '../lib/estimateCalculations';
import {
  saveVersions,
  loadVersions,
  saveVersionData,
  loadVersionData,
} from '../lib/estimateStorage';

// ==================== カスタムフック: バージョン管理 ====================

interface UseVersionManagementProps {
  estimateId: string;
  estimateTitle: string;
  totalAmount: number;
  itemCount: number;
  currentUser: {
    id: string;
    name: string;
  };
}

/**
 * バージョン管理カスタムフック
 */
export function useVersionManagement({
  estimateId,
  estimateTitle,
  totalAmount,
  itemCount,
  currentUser,
}: UseVersionManagementProps) {
  const [versions, setVersions] = useState<EstimateVersion[]>(() =>
    loadVersions(estimateId),
  );
  const [currentVersionId, setCurrentVersionId] = useState<string>(() => {
    const activeVersion = versions.find((v) => v.status === 'active');
    return activeVersion?.id || '';
  });

  /**
   * 新しいバージョンを作成
   */
  const createVersion = useCallback(
    (
      type: 'major' | 'minor' | 'draft',
      changeNote: string,
      estimateData: EstimateData,
    ): string => {
      // 現在のアクティブバージョンを取得
      const activeVersion = versions.find((v) => v.status === 'active');
      const currentVersionNumber = activeVersion?.versionNumber || '0.0';

      // 新しいバージョン番号を生成
      const newVersionNumber = generateVersionNumber(
        currentVersionNumber,
        type,
      );

      // 新しいバージョンを作成
      const newVersion: EstimateVersion = {
        id: generateId(),
        versionNumber: newVersionNumber,
        versionType: type,
        status: type === 'draft' ? 'draft' : 'active',
        title: estimateTitle,
        changeNote,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.id,
        createdByName: currentUser.name,
        totalAmount,
        itemCount,
      };

      // 既存のアクティブバージョンをsupersededに変更
      const updatedVersions = versions.map((v) =>
        v.status === 'active' ? { ...v, status: 'superseded' as const } : v,
      );

      // 新しいバージョンを追加
      updatedVersions.push(newVersion);

      // 保存
      setVersions(updatedVersions);
      saveVersions(estimateId, updatedVersions);

      // 新しいバージョンのデータを保存
      saveVersionData(estimateId, newVersion.id, estimateData);

      // 現在のバージョンIDを更新
      setCurrentVersionId(newVersion.id);

      return newVersion.id;
    },
    [versions, estimateId, estimateTitle, totalAmount, itemCount, currentUser],
  );

  /**
   * バージョンを切り替える
   */
  const switchVersion = useCallback(
    (versionId: string): EstimateData | null => {
      const versionData = loadVersionData(estimateId, versionId);
      if (versionData) {
        setCurrentVersionId(versionId);
      }
      return versionData;
    },
    [estimateId],
  );

  /**
   * 現在のバージョン情報を取得
   */
  const getCurrentVersion = useCallback((): EstimateVersion | null => {
    return versions.find((v) => v.id === currentVersionId) || null;
  }, [versions, currentVersionId]);

  return {
    versions,
    currentVersionId,
    createVersion,
    switchVersion,
    getCurrentVersion,
  };
}
