'use client';

import React, { useState } from 'react';
import {
  GitBranch,
  Clock,
  User,
  Check,
  Archive,
  Plus,
  ChevronDown,
  Eye,
  Copy,
  Trash2,
  FileText,
  ArrowUpRight,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import {
  EstimateVersion,
  CreateVersionOptions,
} from '@/features/estimate-versions/types';

interface Props {
  estimateId: string;
  currentVersionId?: string;
  versions: EstimateVersion[];
  onCreateVersion: (options: CreateVersionOptions) => void;
  onSwitchVersion: (versionId: string) => void;
  onCompareVersions?: (versionAId: string, versionBId: string) => void;
  onDeleteVersion?: (versionId: string) => void;
  onRestoreVersion?: (versionId: string) => void;
}

export default function VersionManager({
  estimateId,
  currentVersionId,
  versions,
  onCreateVersion,
  onSwitchVersion,
  onCompareVersions,
  onDeleteVersion,
  onRestoreVersion,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [createOptions, setCreateOptions] = useState<CreateVersionOptions>({
    versionType: 'minor',
    title: '',
    description: '',
    changeLog: '',
    keepDraft: false,
    autoActivate: true,
  });

  const currentVersion = versions.find((v) => v.id === currentVersionId);
  const sortedVersions = [...versions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const getVersionIcon = (status: EstimateVersion['status']) => {
    switch (status) {
      case 'draft':
        return <FileText className="w-4 h-4 text-gray-400" />;
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'archived':
        return <Archive className="w-4 h-4 text-gray-400" />;
      case 'superseded':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getVersionBadgeClass = (status: EstimateVersion['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'archived':
        return 'bg-gray-100 text-gray-500';
      case 'superseded':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleCreateVersion = () => {
    if (createOptions.title) {
      onCreateVersion({
        ...createOptions,
        fromVersionId: currentVersionId,
      });
      setShowCreateModal(false);
      setCreateOptions({
        versionType: 'minor',
        title: '',
        description: '',
        changeLog: '',
        keepDraft: false,
        autoActivate: true,
      });
    }
  };

  const handleCompare = () => {
    if (selectedVersions.length === 2 && onCompareVersions) {
      onCompareVersions(selectedVersions[0], selectedVersions[1]);
      setSelectedVersions([]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* ヘッダー */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <GitBranch className="w-5 h-5" />
            <span className="font-medium">バージョン管理</span>
            {currentVersion && (
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${getVersionBadgeClass(currentVersion.status)}`}
              >
                v{currentVersion.versionNumber}
              </span>
            )}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
          <div className="flex items-center gap-2">
            {selectedVersions.length === 2 && (
              <button
                onClick={handleCompare}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                比較
              </button>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* バージョン一覧 */}
      {isExpanded && (
        <div className="max-h-96 overflow-y-auto">
          {sortedVersions.map((version) => {
            const isSelected = selectedVersions.includes(version.id);
            const isCurrent = version.id === currentVersionId;

            return (
              <div
                key={version.id}
                className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  isCurrent ? 'bg-blue-50' : ''
                } ${isSelected ? 'bg-yellow-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedVersions((prev) =>
                            [...prev, version.id].slice(-2),
                          );
                        } else {
                          setSelectedVersions((prev) =>
                            prev.filter((id) => id !== version.id),
                          );
                        }
                      }}
                      className="mt-1 rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getVersionIcon(version.status)}
                        <span className="font-medium text-gray-900">
                          v{version.versionNumber} - {version.title}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                            現在
                          </span>
                        )}
                      </div>
                      {version.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {version.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(version.createdAt).toLocaleDateString(
                            'ja-JP',
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {version.createdByName}
                        </span>
                        {version.approvedAt && (
                          <span className="flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            承認済み
                          </span>
                        )}
                      </div>
                      {version.changeLog && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                          {version.changeLog}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!isCurrent && (
                      <button
                        onClick={() => onSwitchVersion(version.id)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="このバージョンに切り替え"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setCreateOptions((prev) => ({
                          ...prev,
                          fromVersionId: version.id,
                          title: `${version.title} (コピー)`,
                        }));
                        setShowCreateModal(true);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="このバージョンを複製"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {version.status === 'archived' && onRestoreVersion && (
                      <button
                        onClick={() => onRestoreVersion(version.id)}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title="復元"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                    {version.status === 'draft' && onDeleteVersion && (
                      <button
                        onClick={() => onDeleteVersion(version.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 新規バージョン作成モーダル */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                新規バージョン作成
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    バージョンタイプ
                  </label>
                  <select
                    value={createOptions.versionType}
                    onChange={(e) =>
                      setCreateOptions((prev) => ({
                        ...prev,
                        versionType: e.target.value as
                          | 'major'
                          | 'minor'
                          | 'draft',
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="major">メジャーバージョン（x.0）</option>
                    <option value="minor">マイナーバージョン（x.y）</option>
                    <option value="draft">ドラフト</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    タイトル <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createOptions.title}
                    onChange={(e) =>
                      setCreateOptions((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例: 価格改定版"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    説明
                  </label>
                  <textarea
                    value={createOptions.description}
                    onChange={(e) =>
                      setCreateOptions((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="バージョンの説明を入力"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    変更履歴
                  </label>
                  <textarea
                    value={createOptions.changeLog}
                    onChange={(e) =>
                      setCreateOptions((prev) => ({
                        ...prev,
                        changeLog: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="主な変更点を記載"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={createOptions.autoActivate}
                      onChange={(e) =>
                        setCreateOptions((prev) => ({
                          ...prev,
                          autoActivate: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      作成後すぐに有効化
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={createOptions.keepDraft}
                      onChange={(e) =>
                        setCreateOptions((prev) => ({
                          ...prev,
                          keepDraft: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      現在のバージョンをドラフトとして保持
                    </span>
                  </label>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleCreateVersion}
                disabled={!createOptions.title}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                作成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
