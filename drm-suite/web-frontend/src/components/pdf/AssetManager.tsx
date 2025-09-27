'use client';

import React, { useState, useCallback } from 'react';
import {
  Upload,
  Image,
  FileText,
  Trash2,
  Download,
  Eye,
  Copy,
  RefreshCw,
  Folder,
  File,
  Search,
  Grid,
  List,
  Filter,
  MoreVertical
} from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  type: 'logo' | 'seal' | 'signature' | 'template' | 'other';
  fileType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

interface AssetManagerProps {
  companyId: string;
  onAssetSelect?: (asset: Asset) => void;
  allowedTypes?: string[];
  maxFileSize?: number; // MB
}

const assetTypeLabels: Record<string, string> = {
  logo: '会社ロゴ',
  seal: '印鑑',
  signature: '署名',
  template: 'テンプレート',
  other: 'その他'
};

const assetTypeColors: Record<string, string> = {
  logo: 'bg-blue-100 text-blue-800',
  seal: 'bg-red-100 text-red-800',
  signature: 'bg-green-100 text-green-800',
  template: 'bg-purple-100 text-purple-800',
  other: 'bg-gray-100 text-gray-800'
};

export default function AssetManager({
  companyId,
  onAssetSelect,
  allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'],
  maxFileSize = 5
}: AssetManagerProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // 模拟データ（実際の実装ではAPIから取得）
  React.useEffect(() => {
    loadAssets();
  }, [companyId]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      // 模拟データ
      const mockAssets: Asset[] = [
        {
          id: '1',
          name: 'company-logo.png',
          type: 'logo',
          fileType: 'image/png',
          size: 125000,
          url: 'https://via.placeholder.com/300x120/2563eb/ffffff?text=Company+Logo',
          thumbnailUrl: 'https://via.placeholder.com/150x60/2563eb/ffffff?text=Logo',
          uploadedAt: '2024-03-01T10:00:00Z',
          dimensions: { width: 300, height: 120 }
        },
        {
          id: '2',
          name: 'company-seal.png',
          type: 'seal',
          fileType: 'image/png',
          size: 80000,
          url: 'https://via.placeholder.com/100x100/dc2626/ffffff?text=印',
          thumbnailUrl: 'https://via.placeholder.com/50x50/dc2626/ffffff?text=印',
          uploadedAt: '2024-03-02T14:30:00Z',
          dimensions: { width: 100, height: 100 }
        },
        {
          id: '3',
          name: 'signature.png',
          type: 'signature',
          fileType: 'image/png',
          size: 45000,
          url: 'https://via.placeholder.com/200x80/059669/ffffff?text=Signature',
          thumbnailUrl: 'https://via.placeholder.com/100x40/059669/ffffff?text=Sign',
          uploadedAt: '2024-03-03T09:15:00Z',
          dimensions: { width: 200, height: 80 }
        }
      ];

      setAssets(mockAssets);
    } catch (error) {
      console.error('アセット読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!files.length) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        // ファイルサイズチェック
        if (file.size > maxFileSize * 1024 * 1024) {
          alert(`ファイルサイズが${maxFileSize}MBを超えています: ${file.name}`);
          continue;
        }

        // ファイルタイプチェック
        if (!allowedTypes.includes(file.type)) {
          alert(`サポートされていないファイル形式です: ${file.name}`);
          continue;
        }

        // 画像の場合は寸法を取得
        let dimensions;
        if (file.type.startsWith('image/')) {
          dimensions = await getImageDimensions(file);
        }

        // ファイルタイプを推測
        const assetType = inferAssetType(file.name);

        // 模拟アップロード（実際の実装ではAPIにアップロード）
        const mockAsset: Asset = {
          id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: assetType,
          fileType: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          thumbnailUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
          uploadedAt: new Date().toISOString(),
          dimensions
        };

        setAssets(prev => [mockAsset, ...prev]);
      }
    } catch (error) {
      console.error('アップロードエラー:', error);
    } finally {
      setUploading(false);
    }
  }, [maxFileSize, allowedTypes]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDeleteAsset = async (asset: Asset) => {
    if (!confirm(`「${asset.name}」を削除しますか？`)) return;

    try {
      setAssets(prev => prev.filter(a => a.id !== asset.id));
      // 実際の実装ではAPIに削除リクエスト
    } catch (error) {
      console.error('削除エラー:', error);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URLをクリップボードにコピーしました');
  };

  const handleDownload = (asset: Asset) => {
    const link = document.createElement('a');
    link.href = asset.url;
    link.download = asset.name;
    link.click();
  };

  // ファイルタイプを推測
  const inferAssetType = (filename: string): Asset['type'] => {
    const lower = filename.toLowerCase();
    if (lower.includes('logo')) return 'logo';
    if (lower.includes('seal') || lower.includes('印')) return 'seal';
    if (lower.includes('signature') || lower.includes('sign')) return 'signature';
    if (lower.includes('template')) return 'template';
    return 'other';
  };

  // 画像の寸法を取得
  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // フィルタリング
  const filteredAssets = assets.filter(asset => {
    const matchesType = selectedType === 'all' || asset.type === selectedType;
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Folder className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">アセット管理</h2>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
            {filteredAssets.length}件
          </span>
        </div>
      </div>

      {/* アップロードエリア */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          ファイルをアップロード
        </h3>
        <p className="text-gray-600 mb-4">
          ドラッグ&ドロップまたはクリックしてファイルを選択
        </p>
        <p className="text-sm text-gray-500 mb-4">
          対応形式: {allowedTypes.join(', ')} | 最大サイズ: {maxFileSize}MB
        </p>
        <input
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 cursor-pointer"
        >
          <Upload className="w-4 h-4 mr-2" />
          ファイルを選択
        </label>
        {uploading && (
          <div className="mt-4 flex items-center justify-center">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            アップロード中...
          </div>
        )}
      </div>

      {/* フィルター・検索バー */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* 検索 */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="ファイル名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* タイプフィルター */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべてのタイプ</option>
              {Object.entries(assetTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* 表示モード切替 */}
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* アセット一覧 */}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          読み込み中...
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">アセットがありません</h3>
          <p className="text-gray-600">ファイルをアップロードしてください。</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onSelect={() => onAssetSelect?.(asset)}
              onDelete={() => handleDeleteAsset(asset)}
              onCopyUrl={() => handleCopyUrl(asset.url)}
              onDownload={() => handleDownload(asset)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ファイル名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  タイプ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  サイズ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  寸法
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アップロード日
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssets.map((asset) => (
                <AssetRow
                  key={asset.id}
                  asset={asset}
                  onSelect={() => onAssetSelect?.(asset)}
                  onDelete={() => handleDeleteAsset(asset)}
                  onCopyUrl={() => handleCopyUrl(asset.url)}
                  onDownload={() => handleDownload(asset)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// アセットカードコンポーネント
function AssetCard({
  asset,
  onSelect,
  onDelete,
  onCopyUrl,
  onDownload
}: {
  asset: Asset;
  onSelect: () => void;
  onDelete: () => void;
  onCopyUrl: () => void;
  onDownload: () => void;
}) {
  const [showActions, setShowActions] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow relative">
      {/* プレビュー */}
      <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
        {asset.thumbnailUrl ? (
          <img
            src={asset.thumbnailUrl}
            alt={asset.name}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <File className="w-12 h-12 text-gray-400" />
        )}

        {/* タイプバッジ */}
        <span className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${assetTypeColors[asset.type]}`}>
          {assetTypeLabels[asset.type]}
        </span>

        {/* アクションボタン */}
        <div className="absolute top-2 right-2">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 bg-white bg-opacity-80 rounded-full text-gray-600 hover:text-gray-800"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showActions && (
            <div className="absolute right-0 top-8 bg-white border rounded-md shadow-lg z-10 py-1 min-w-32">
              <button
                onClick={() => { onSelect(); setShowActions(false); }}
                className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                選択
              </button>
              <button
                onClick={() => { onCopyUrl(); setShowActions(false); }}
                className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center"
              >
                <Copy className="w-4 h-4 mr-2" />
                URL
              </button>
              <button
                onClick={() => { onDownload(); setShowActions(false); }}
                className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                DL
              </button>
              <button
                onClick={() => { onDelete(); setShowActions(false); }}
                className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 text-red-600 flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                削除
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ファイル情報 */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900 truncate" title={asset.name}>
          {asset.name}
        </h3>
        <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
          <span>{formatFileSize(asset.size)}</span>
          {asset.dimensions && (
            <span>{asset.dimensions.width}×{asset.dimensions.height}</span>
          )}
        </div>
        <div className="mt-2">
          <button
            onClick={onSelect}
            className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            選択
          </button>
        </div>
      </div>
    </div>
  );
}

// アセット行コンポーネント
function AssetRow({
  asset,
  onSelect,
  onDelete,
  onCopyUrl,
  onDownload
}: {
  asset: Asset;
  onSelect: () => void;
  onDelete: () => void;
  onCopyUrl: () => void;
  onDownload: () => void;
}) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {asset.thumbnailUrl ? (
            <img
              src={asset.thumbnailUrl}
              alt={asset.name}
              className="w-10 h-10 object-cover rounded mr-3"
            />
          ) : (
            <File className="w-10 h-10 text-gray-400 mr-3" />
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">{asset.name}</div>
            <div className="text-sm text-gray-500">{asset.fileType}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${assetTypeColors[asset.type]}`}>
          {assetTypeLabels[asset.type]}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatFileSize(asset.size)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {asset.dimensions ? `${asset.dimensions.width}×${asset.dimensions.height}` : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(asset.uploadedAt).toLocaleDateString('ja-JP')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={onSelect}
            className="text-blue-600 hover:text-blue-700"
          >
            選択
          </button>
          <button
            onClick={onCopyUrl}
            className="text-gray-600 hover:text-gray-700"
            title="URLをコピー"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={onDownload}
            className="text-gray-600 hover:text-gray-700"
            title="ダウンロード"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
            title="削除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}