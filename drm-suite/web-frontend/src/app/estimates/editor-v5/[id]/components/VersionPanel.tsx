'use client';

import React, { memo, useState } from 'react';
import { X, GitBranch, Check, Trash2 } from 'lucide-react';
import { EstimateVersion } from '../types';
import { formatPrice } from '../lib/estimateCalculations';

// ==================== VersionPanel コンポーネント ====================

interface VersionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  versions: EstimateVersion[];
  currentVersionId: string;
  onCreateVersion: (
    type: 'major' | 'minor' | 'draft',
    changeNote: string,
  ) => void;
  onSwitchVersion: (versionId: string) => void;
  onOpenVersionComparison: () => void;
  onDeleteVersion: (versionId: string) => void;
}

const VersionPanel = memo(function VersionPanel({
  isOpen,
  onClose,
  versions,
  currentVersionId,
  onCreateVersion,
  onSwitchVersion,
  onOpenVersionComparison,
  onDeleteVersion,
}: VersionPanelProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [versionType, setVersionType] = useState<'major' | 'minor' | 'draft'>(
    'minor',
  );
  const [changeNote, setChangeNote] = useState('');

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!changeNote.trim()) {
      alert('変更内容を入力してください');
      return;
    }
    onCreateVersion(versionType, changeNote);
    setShowCreateModal(false);
    setChangeNote('');
  };

  const handleDeleteVersion = (
    versionId: string,
    versionNumber: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation(); // 親要素のクリックイベントを防ぐ
    if (
      confirm(
        `バージョン ${versionNumber} を削除しますか？\nこの操作は取り消せません。`,
      )
    ) {
      onDeleteVersion(versionId);
    }
  };

  return (
    <>
      {/* バージョンパネル */}
      <div className="fixed right-0 top-0 h-screen w-80 bg-white border-l shadow-2xl z-40 flex flex-col">
        {/* ヘッダー */}
        <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <GitBranch className="w-5 h-5" />
              バージョン履歴
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-blue-500 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              <GitBranch className="w-4 h-4 inline mr-2" />
              新バージョン作成
            </button>
            <button
              onClick={onOpenVersionComparison}
              className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition-colors"
            >
              バージョン比較
            </button>
          </div>
        </div>

        {/* バージョンリスト */}
        <div className="flex-1 overflow-y-auto p-4">
          {versions.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p>バージョンがありません</p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions
                .slice()
                .reverse()
                .map((version) => (
                  <div
                    key={version.id}
                    onClick={() => onSwitchVersion(version.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all relative group ${
                      version.id === currentVersionId
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-semibold text-lg text-blue-600">
                        v{version.versionNumber}
                      </span>
                      <div className="flex gap-1 items-center">
                        {version.status === 'active' && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            ✓ 最新
                          </span>
                        )}
                        {version.status === 'draft' && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                            下書き
                          </span>
                        )}
                        {version.id === currentVersionId && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                            表示中
                          </span>
                        )}
                        {/* 削除ボタン（最低1バージョンは残す） */}
                        {versions.length > 1 && (
                          <button
                            onClick={(e) =>
                              handleDeleteVersion(
                                version.id,
                                version.versionNumber,
                                e,
                              )
                            }
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                            title="バージョンを削除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {version.changeNote && (
                      <p className="text-sm text-gray-700 mb-2">
                        {version.changeNote}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{version.createdByName}</span>
                      <span>
                        {new Date(version.createdAt).toLocaleDateString(
                          'ja-JP',
                        )}
                      </span>
                    </div>

                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-semibold">
                        {formatPrice(version.totalAmount)}
                      </span>
                      <span className="ml-2 text-gray-400">
                        ({version.itemCount}項目)
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* 新バージョン作成モーダル */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">新バージョン作成</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  バージョンタイプ
                </label>
                <select
                  value={versionType}
                  onChange={(e) =>
                    setVersionType(e.target.value as typeof versionType)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="minor">マイナー更新（例: 1.0 → 1.1）</option>
                  <option value="major">メジャー更新（例: 1.0 → 2.0）</option>
                  <option value="draft">ドラフト（例: 1.0-draft）</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  変更内容（メモ）<span className="text-red-500">*</span>
                </label>
                <textarea
                  value={changeNote}
                  onChange={(e) => setChangeNote(e.target.value)}
                  placeholder="どのような変更を行いましたか？"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleCreate}
                  disabled={!changeNote.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Check className="w-4 h-4 inline mr-2" />
                  作成
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default VersionPanel;
