'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  Download,
  Upload,
  Plus,
  FileText,
  GitBranch,
  Printer,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
} from 'lucide-react';
import {
  EstimateItem,
  EditingCell,
  MasterItem,
  EstimateTemplate,
  TemplateSection,
  Comment,
} from './types';
import { CATEGORIES, UNITS } from './constants';
import {
  calculateItemAmount,
  calculateItemCost,
  calculateAllItemsCost,
  calculateTotals,
  formatPrice,
  recalculateItemNumbers,
} from './lib/estimateCalculations';
import {
  saveEstimate,
  loadEstimate,
  saveVersionData,
  loadVersionData,
  exportCSV,
  importCSV,
  getAllTemplates,
  saveTemplate,
} from './lib/estimateStorage';
import { generateEstimatePdf, canGeneratePdf } from './lib/pdfGenerator';
import {
  loadComments,
  addComment,
  updateComment,
  deleteComment,
} from './lib/commentStorage';
import { initializeDemoTemplates } from './lib/demoTemplates';
import { useCostCalculation } from './hooks/useCostCalculation';
import { useVersionManagement } from './hooks/useVersionManagement';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import EstimateTable from './components/EstimateTable';
import VersionPanel from './components/VersionPanel';
import TemplateSelectModal from './components/TemplateSelectModal';
import TemplateSaveModal from './components/TemplateSaveModal';
import MasterSearchModal from './components/MasterSearchModal';
import VersionComparisonModal from './components/VersionComparisonModal';
import CommentPanel from './components/CommentPanel';

// ==================== EditorClient メインコンポーネント ====================

interface EditorClientProps {
  estimateId: string;
  initialTitle?: string;
  initialCustomer?: string;
  initialCustomerId?: string;
  initialItems?: EstimateItem[];
  currentUser: {
    id: string;
    name: string;
    branch: string;
  };
}

export default function EditorClient({
  estimateId,
  initialTitle = '新規見積',
  initialCustomer = '',
  initialCustomerId = '',
  initialItems = [],
  currentUser,
}: EditorClientProps) {
  const router = useRouter();

  // ==================== State管理 ====================

  // 基本データ
  const [estimateTitle, setEstimateTitle] = useState(initialTitle);
  const [customer, setCustomer] = useState(initialCustomer);
  const [customerId] = useState(initialCustomerId);
  const [items, setItems] = useState<EstimateItem[]>(initialItems);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);

  // クライアント側のみでマウント状態を管理
  const [isMounted, setIsMounted] = useState(false);

  // 保存状態
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>(
    'saved',
  );
  const [lastSaved, setLastSaved] = useState<Date>(new Date());

  // クライアント側マウント検出
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // モーダル表示フラグ
  const [showVersionPanel, setShowVersionPanel] = useState(false);
  const [showVersionComparison, setShowVersionComparison] = useState(false);
  const [showTemplateSelectModal, setShowTemplateSelectModal] = useState(false);
  const [showTemplateSaveModal, setShowTemplateSaveModal] = useState(false);
  const [showMasterSearchModal, setShowMasterSearchModal] = useState(false);
  const [masterSearchCategory, setMasterSearchCategory] = useState<string>('');
  const [masterSearchTargetItemId, setMasterSearchTargetItemId] = useState<
    string | null
  >(null);

  // コメントパネル
  const [showCommentPanel, setShowCommentPanel] = useState(false);
  const [commentTargetItemId, setCommentTargetItemId] = useState<string | null>(
    null,
  );
  const [comments, setComments] = useState<Comment[]>([]);

  // 大項目追加用の選択状態
  const [selectedCategoryForAdd, setSelectedCategoryForAdd] = useState<string>(
    CATEGORIES[0],
  );

  // ==================== Custom Hooks ====================

  // 原価計算
  const { itemsWithCost, totals } = useCostCalculation(items);

  // バージョン管理
  const {
    versions,
    currentVersionId,
    createVersion,
    switchVersion,
    getCurrentVersion,
    deleteVersion,
  } = useVersionManagement({
    estimateId,
    estimateTitle,
    totalAmount: totals.totalAmount,
    itemCount: items.length,
    currentUser,
  });

  // ==================== データ読み込み ====================

  useEffect(() => {
    const loadedData = loadEstimate(estimateId);
    if (loadedData) {
      setEstimateTitle(loadedData.title);
      setCustomer(loadedData.customer || '');
      setItems(loadedData.items);
      setLastSaved(new Date(loadedData.updatedAt));
    }

    // コメントを読み込み
    const loadedComments = loadComments(estimateId);
    setComments(loadedComments);
  }, [estimateId]);

  // ==================== デモテンプレート初期化 ====================

  useEffect(() => {
    // 初回マウント時のみデモテンプレートを初期化
    initializeDemoTemplates();
  }, []);

  // ==================== 自動保存 ====================

  useEffect(() => {
    if (items.length === 0 && estimateTitle === initialTitle) {
      // 初期状態では保存しない
      return;
    }

    setSaveStatus('unsaved');

    const timer = setTimeout(() => {
      handleSave();
    }, 2000); // 2秒後に自動保存

    return () => clearTimeout(timer);
  }, [items, estimateTitle]);

  // ==================== 保存処理 ====================

  const handleSave = useCallback(() => {
    setSaveStatus('saving');

    const estimateData = {
      id: estimateId,
      title: estimateTitle,
      customer: customer,
      items: itemsWithCost,
      totalAmount: totals.totalAmount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser.id,
      createdByName: currentUser.name,
    };

    saveEstimate(estimateId, estimateData);
    setLastSaved(new Date());
    setSaveStatus('saved');
  }, [
    estimateId,
    estimateTitle,
    customer,
    itemsWithCost,
    totals.totalAmount,
    currentUser,
  ]);

  // ==================== セル編集 ====================

  const handleCellEdit = useCallback((cell: EditingCell | null) => {
    setEditingCell(cell);
  }, []);

  const handleCellChange = useCallback(
    (itemId: string, field: keyof EstimateItem, value: string) => {
      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item.id !== itemId) return item;

          const updatedItem = { ...item, [field]: value };

          // 数値フィールドの処理
          if (
            field === 'quantity' ||
            field === 'unitPrice' ||
            field === 'costPrice'
          ) {
            const numValue = parseFloat(value) || 0;
            updatedItem[field] = numValue;
          }

          // 金額の再計算
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.amount = calculateItemAmount(
              updatedItem.quantity,
              updatedItem.unitPrice,
            );
          }

          // 原価計算
          return calculateItemCost(updatedItem);
        }),
      );
    },
    [],
  );

  // ==================== 行操作 ====================

  const handleAddRow = useCallback(
    (category?: string) => {
      const newNo =
        items.length > 0 ? Math.max(...items.map((item) => item.no)) + 1 : 1;

      // categoryはドロップダウンまたはヘッダーボタンから常に指定される
      const selectedCategory = category || CATEGORIES[0];

      const newItem: EstimateItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        no: newNo,
        category: selectedCategory,
        minorCategory: undefined, // 小項目は未選択
        itemName: '',
        specification: '',
        quantity: 1,
        unit: UNITS[0],
        unitPrice: 0,
        amount: 0,
        remarks: '',
        costPrice: 0,
        costAmount: 0,
        grossProfit: 0,
        grossProfitRate: 0,
      };
      setItems((prev) => [...prev, newItem]);
    },
    [items],
  );

  const handleDeleteRow = useCallback((itemId: string) => {
    setItems((prev) => {
      const filtered = prev.filter((item) => item.id !== itemId);
      return recalculateItemNumbers(filtered);
    });
  }, []);

  const handleDuplicateRow = useCallback((itemId: string) => {
    setItems((prev) => {
      const targetIndex = prev.findIndex((item) => item.id === itemId);
      if (targetIndex === -1) return prev;

      const targetItem = prev[targetIndex];
      const newItem: EstimateItem = {
        ...targetItem,
        id: `item-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        no: targetItem.no + 1,
      };

      const newItems = [
        ...prev.slice(0, targetIndex + 1),
        newItem,
        ...prev.slice(targetIndex + 1),
      ];

      return recalculateItemNumbers(newItems);
    });
  }, []);

  const handleMoveRowUp = useCallback((itemId: string) => {
    setItems((prev) => {
      const targetIndex = prev.findIndex((item) => item.id === itemId);
      if (targetIndex <= 0) return prev;

      // 大項目境界チェック: 上の行と同じ大項目かどうか
      const currentItem = prev[targetIndex];
      const aboveItem = prev[targetIndex - 1];
      if (currentItem.category !== aboveItem.category) {
        // 大項目が異なる場合は移動不可
        return prev;
      }

      const newItems = [...prev];
      [newItems[targetIndex - 1], newItems[targetIndex]] = [
        newItems[targetIndex],
        newItems[targetIndex - 1],
      ];

      return recalculateItemNumbers(newItems);
    });
  }, []);

  const handleMoveRowDown = useCallback((itemId: string) => {
    setItems((prev) => {
      const targetIndex = prev.findIndex((item) => item.id === itemId);
      if (targetIndex === -1 || targetIndex >= prev.length - 1) return prev;

      // 大項目境界チェック: 下の行と同じ大項目かどうか
      const currentItem = prev[targetIndex];
      const belowItem = prev[targetIndex + 1];
      if (currentItem.category !== belowItem.category) {
        // 大項目が異なる場合は移動不可
        return prev;
      }

      const newItems = [...prev];
      [newItems[targetIndex], newItems[targetIndex + 1]] = [
        newItems[targetIndex + 1],
        newItems[targetIndex],
      ];

      return recalculateItemNumbers(newItems);
    });
  }, []);

  // ==================== マスタ検索 ====================

  const handleOpenMasterSearch = useCallback(
    (itemId: string) => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      setMasterSearchCategory(item.category);
      setMasterSearchTargetItemId(itemId);
      setShowMasterSearchModal(true);
    },
    [items],
  );

  const handleSelectMasterItem = useCallback(
    (masterItem: MasterItem) => {
      if (!masterSearchTargetItemId) return;

      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== masterSearchTargetItemId) return item;

          const updatedItem: EstimateItem = {
            ...item,
            category: masterItem.category,
            minorCategory: masterItem.minorCategory, // 小項目も設定
            itemName: masterItem.itemName,
            specification: masterItem.specification,
            unit: masterItem.unit,
            unitPrice: masterItem.standardPrice,
            amount: item.quantity * masterItem.standardPrice,
            costPrice: masterItem.costPrice,
          };

          return calculateItemCost(updatedItem);
        }),
      );

      setShowMasterSearchModal(false);
      setMasterSearchTargetItemId(null);
    },
    [masterSearchTargetItemId],
  );

  // ==================== CSV入出力 ====================

  const handleExportCSV = useCallback(() => {
    const estimateData = {
      id: estimateId,
      title: estimateTitle,
      items: itemsWithCost,
      totalAmount: totals.totalAmount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser.id,
      createdByName: currentUser.name,
    };

    exportCSV(estimateData);
  }, [
    estimateId,
    estimateTitle,
    itemsWithCost,
    totals.totalAmount,
    currentUser,
  ]);

  const handleImportCSV = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const importedData = importCSV(text);

        if (importedData) {
          setEstimateTitle(importedData.title);
          setItems(importedData.items);
        } else {
          alert('CSVファイルの読み込みに失敗しました');
        }
      };
      reader.readAsText(file);

      // ファイル選択をリセット
      event.target.value = '';
    },
    [],
  );

  // ==================== テンプレート管理 ====================

  const handleOpenTemplateSelect = useCallback(() => {
    setShowTemplateSelectModal(true);
  }, []);

  const handleApplyTemplate = useCallback(
    (template: EstimateTemplate, selectedSectionIds: Set<string>) => {
      const selectedSections = template.sections.filter((section) =>
        selectedSectionIds.has(section.id),
      );

      const newItems: EstimateItem[] = [];
      let currentNo = items.length + 1;

      selectedSections.forEach((section) => {
        section.items.forEach((templateItem) => {
          const newItem: EstimateItem = {
            id: `item-${Date.now()}-${Math.random().toString(36).substring(7)}-${currentNo}`,
            no: currentNo++,
            category: templateItem.category,
            minorCategory: templateItem.minorCategory, // 小項目も含める
            itemName: templateItem.itemName,
            specification: templateItem.specification,
            quantity: templateItem.quantity,
            unit: templateItem.unit,
            unitPrice: templateItem.unitPrice,
            amount: templateItem.amount,
            remarks: templateItem.remarks || '',
            costPrice: templateItem.costPrice,
          };
          newItems.push(calculateItemCost(newItem));
        });
      });

      setItems((prev) => recalculateItemNumbers([...prev, ...newItems]));
      setShowTemplateSelectModal(false);
    },
    [items],
  );

  const handleOpenTemplateSave = useCallback(() => {
    if (items.length === 0) {
      alert('保存する項目がありません');
      return;
    }
    setShowTemplateSaveModal(true);
  }, [items]);

  const handleSaveTemplate = useCallback(
    (data: {
      name: string;
      description: string;
      category: string;
      scope: 'personal' | 'branch' | 'company';
      branch?: string;
    }) => {
      // 大項目ごとにグループ化
      const categoryGroups: Map<string, EstimateItem[]> = new Map();
      items.forEach((item) => {
        const category = item.category;
        if (!categoryGroups.has(category)) {
          categoryGroups.set(category, []);
        }
        categoryGroups.get(category)!.push(item);
      });

      // 各大項目をセクションに変換
      const sections: TemplateSection[] = [];
      let sectionIndex = 0;
      categoryGroups.forEach((categoryItems, majorCategory) => {
        sections.push({
          id: `section-${Date.now()}-${sectionIndex++}`,
          name: majorCategory, // セクション名を大項目名にする
          majorCategory: majorCategory,
          minorCategory: undefined,
          items: categoryItems.map((item) => ({
            category: item.category,
            minorCategory: item.minorCategory,
            itemName: item.itemName,
            specification: item.specification,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            amount: item.amount,
            costPrice: item.costPrice,
            remarks: item.remarks,
          })),
        });
      });

      const template: EstimateTemplate = {
        id: `template-${Date.now()}`,
        name: data.name,
        description: data.description,
        category: data.category,
        scope: data.scope,
        branch: data.branch as any,
        sections: sections,
        createdBy: currentUser.id,
        createdByName: currentUser.name,
        createdAt: new Date().toISOString(),
      };

      saveTemplate(template);
      setShowTemplateSaveModal(false);
      alert('テンプレートを保存しました');
    },
    [items, currentUser],
  );

  // ==================== バージョン管理 ====================

  const handleCreateVersion = useCallback(
    (type: 'major' | 'minor' | 'draft', changeNote: string) => {
      const estimateData = {
        id: estimateId,
        title: estimateTitle,
        items: itemsWithCost,
        totalAmount: totals.totalAmount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentUser.id,
        createdByName: currentUser.name,
      };

      createVersion(type, changeNote, estimateData);
      alert(
        `バージョン${type === 'major' ? 'メジャー' : type === 'minor' ? 'マイナー' : 'ドラフト'}を作成しました`,
      );
    },
    [
      estimateId,
      estimateTitle,
      itemsWithCost,
      totals.totalAmount,
      currentUser,
      createVersion,
    ],
  );

  const handleSwitchVersion = useCallback(
    (versionId: string) => {
      const versionData = switchVersion(versionId);
      if (versionData) {
        setEstimateTitle(versionData.title);
        setItems(versionData.items);
        alert('バージョンを切り替えました');
      } else {
        alert('バージョンの読み込みに失敗しました');
      }
    },
    [switchVersion],
  );

  const handleDeleteVersion = useCallback(
    (versionId: string) => {
      const success = deleteVersion(versionId);
      if (success) {
        // 削除が成功した場合、現在のバージョンのデータを再読み込み
        const currentVersion = getCurrentVersion();
        if (currentVersion) {
          const versionData = loadVersionData(estimateId, currentVersion.id);
          if (versionData) {
            setEstimateTitle(versionData.title);
            setItems(versionData.items);
          }
        }
        alert('バージョンを削除しました');
      } else {
        alert('バージョンの削除に失敗しました');
      }
    },
    [deleteVersion, getCurrentVersion, estimateId],
  );

  const handleDeleteEstimate = useCallback(() => {
    if (
      !confirm(
        `見積書「${estimateTitle}」を完全に削除しますか？\n\nこの操作は取り消せません。\n全てのバージョンとデータが削除されます。`,
      )
    ) {
      return;
    }

    // 全バージョンのデータを削除
    versions.forEach((version) => {
      localStorage.removeItem(
        `estimate-v5-version-${estimateId}-${version.id}`,
      );
    });

    // バージョンリストを削除
    localStorage.removeItem(`estimate-v5-versions-${estimateId}`);

    // 見積データを削除
    localStorage.removeItem(`estimate-v5-${estimateId}`);

    alert('見積書を削除しました');

    // 見積一覧画面に遷移
    router.push('/estimates');
  }, [estimateId, estimateTitle, versions, router]);

  const getVersionItems = useCallback(
    (versionId: string): EstimateItem[] => {
      const versionData = loadVersionData(estimateId, versionId);
      return versionData ? versionData.items : [];
    },
    [estimateId],
  );

  // ==================== コメント管理 ====================

  const handleOpenCommentPanel = useCallback((itemId: string) => {
    setCommentTargetItemId(itemId);
    setShowCommentPanel(true);
  }, []);

  const handleAddComment = useCallback(
    (itemId: string, content: string) => {
      const newComment = addComment(
        estimateId,
        itemId,
        content,
        currentUser.id,
        currentUser.name,
      );
      setComments((prev) => [...prev, newComment]);
    },
    [estimateId, currentUser],
  );

  const handleUpdateComment = useCallback(
    (commentId: string, content: string) => {
      const success = updateComment(estimateId, commentId, content);
      if (success) {
        const updatedComments = loadComments(estimateId);
        setComments(updatedComments);
      }
    },
    [estimateId],
  );

  const handleDeleteComment = useCallback(
    (commentId: string) => {
      const success = deleteComment(estimateId, commentId);
      if (success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    },
    [estimateId],
  );

  // 項目ごとのコメント数を計算
  const commentCounts = useMemo(() => {
    const counts = new Map<string, number>();
    comments.forEach((comment) => {
      const current = counts.get(comment.itemId) || 0;
      counts.set(comment.itemId, current + 1);
    });
    return counts;
  }, [comments]);

  // 選択中の項目のコメント一覧
  const selectedItemComments = useMemo(() => {
    if (!commentTargetItemId) return [];
    return comments.filter((c) => c.itemId === commentTargetItemId);
  }, [comments, commentTargetItemId]);

  // 選択中の項目名
  const selectedItemName = useMemo(() => {
    if (!commentTargetItemId) return '';
    const item = items.find((i) => i.id === commentTargetItemId);
    return item ? `No.${item.no} ${item.itemName || '(項目名なし)'}` : '';
  }, [commentTargetItemId, items]);

  // ==================== PDF出力 ====================

  const handlePrintPDF = useCallback(async () => {
    try {
      // 見積データを作成
      const estimateData = {
        id: estimateId,
        title: estimateTitle,
        customer: customer,
        items: items,
        totalAmount: totals.totalAmount,
        comment: '', // コメント欄は後で追加予定
        createdAt: new Date().toISOString(),
        updatedAt: lastSaved.toISOString(),
      };

      // PDF生成可能かチェック
      const validation = canGeneratePdf(estimateData);
      if (!validation.canGenerate) {
        alert(validation.reason || 'PDF生成できません');
        return;
      }

      // PDF生成
      await generateEstimatePdf(estimateData);
    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert('PDF生成に失敗しました');
    }
  }, [
    estimateId,
    estimateTitle,
    customer,
    items,
    totals.totalAmount,
    lastSaved,
  ]);

  // ==================== キーボードショートカット ====================

  useKeyboardShortcuts({
    onSave: handleSave,
    onAddRow: handleAddRow,
    onDeleteRow: () => {
      if (editingCell) {
        handleDeleteRow(editingCell.row);
      }
    },
    onDuplicateRow: () => {
      if (editingCell) {
        handleDuplicateRow(editingCell.row);
      }
    },
  });

  // ==================== テンプレート一覧取得 ====================

  const allTemplates = useMemo(() => {
    return getAllTemplates();
  }, [showTemplateSelectModal]);

  // ==================== レンダリング ====================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* ヘッダー */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-30">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          {/* タイトル行 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex flex-col gap-2 flex-1 max-w-2xl">
                <input
                  type="text"
                  value={estimateTitle}
                  onChange={(e) => setEstimateTitle(e.target.value)}
                  className="text-2xl font-bold border-none outline-none focus:outline-none bg-transparent hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                  placeholder="見積タイトル"
                />
                {customer && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <span className="text-sm text-indigo-600 font-semibold">
                      顧客:
                    </span>
                    <span className="text-base text-indigo-900 font-medium">
                      {customer}
                    </span>
                  </div>
                )}
              </div>
              {/* 保存状態インジケーター */}
              <div className="flex items-center gap-2 text-sm">
                {saveStatus === 'saved' && (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    保存済み
                  </span>
                )}
                {saveStatus === 'saving' && (
                  <span className="flex items-center gap-1 text-blue-600">
                    <Clock className="w-4 h-4 animate-spin" />
                    保存中...
                  </span>
                )}
                {saveStatus === 'unsaved' && (
                  <span className="flex items-center gap-1 text-orange-600">
                    <AlertCircle className="w-4 h-4" />
                    未保存
                  </span>
                )}
                <span className="text-gray-400 text-xs">
                  最終保存:{' '}
                  {isMounted
                    ? lastSaved.toLocaleTimeString('ja-JP')
                    : '--:--:--'}
                </span>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex items-center gap-2">
              {/* 手動保存 */}
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-semibold"
                title="保存 (Ctrl+S)"
              >
                <Save className="w-4 h-4" />
                保存
              </button>

              {/* バージョン管理 */}
              <button
                onClick={() => setShowVersionPanel(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 font-semibold"
                title="バージョン履歴"
              >
                <GitBranch className="w-4 h-4" />
                バージョン
              </button>

              {/* テンプレート選択 */}
              <button
                onClick={handleOpenTemplateSelect}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                title="テンプレートから追加"
              >
                <FileText className="w-4 h-4" />
                テンプレート
              </button>

              {/* テンプレート保存 */}
              <button
                onClick={handleOpenTemplateSave}
                className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-2"
                title="テンプレートとして保存"
              >
                <FileText className="w-4 h-4" />
                保存
              </button>

              {/* CSV出力 */}
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                title="CSV出力"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>

              {/* CSV入力 */}
              <label className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="hidden"
                />
              </label>

              {/* PDF出力 */}
              <button
                onClick={handlePrintPDF}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                title="PDF出力"
              >
                <Printer className="w-4 h-4" />
                PDF
              </button>

              {/* 見積削除 */}
              <button
                onClick={handleDeleteEstimate}
                className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                title="見積書を削除"
              >
                <Trash2 className="w-4 h-4" />
                削除
              </button>
            </div>
          </div>

          {/* サマリー行 */}
          <div className="flex items-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">項目数:</span>
              <span className="font-semibold">{items.length}件</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">合計金額:</span>
              <span className="font-bold text-blue-600 text-lg">
                {formatPrice(totals.totalAmount)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">合計原価:</span>
              <span className="font-semibold text-yellow-600">
                {formatPrice(totals.totalCost)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">合計粗利:</span>
              <span className="font-semibold text-green-600">
                {formatPrice(totals.totalProfit)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">粗利率:</span>
              <span className="font-semibold text-green-600">
                {totals.totalProfitRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-gray-600">現在のバージョン:</span>
              <span className="font-semibold text-purple-600">
                v{getCurrentVersion()?.versionNumber || '1.0'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* テーブルコントロール */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-700">見積明細</h2>
              <div className="flex items-center gap-2">
                <select
                  value={selectedCategoryForAdd}
                  onChange={(e) => setSelectedCategoryForAdd(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleAddRow(selectedCategoryForAdd)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  title="大項目を追加 (Ctrl+N)"
                >
                  <Plus className="w-4 h-4" />
                  大項目を追加
                </button>
              </div>
            </div>
          </div>

          {/* テーブル */}
          <div className="p-4">
            <EstimateTable
              items={itemsWithCost}
              editingCell={editingCell}
              onCellEdit={handleCellEdit}
              onCellChange={handleCellChange}
              onAddRow={handleAddRow}
              onDeleteRow={handleDeleteRow}
              onDuplicateRow={handleDuplicateRow}
              onMoveRowUp={handleMoveRowUp}
              onMoveRowDown={handleMoveRowDown}
              onOpenMasterSearch={handleOpenMasterSearch}
              onOpenCommentPanel={handleOpenCommentPanel}
              commentCounts={commentCounts}
            />
          </div>
        </div>

        {/* ショートカットヘルプ */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            キーボードショートカット
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-blue-700">
            <div>
              <kbd className="px-2 py-1 bg-white rounded border border-blue-200">
                Ctrl+S
              </kbd>{' '}
              保存
            </div>
            <div>
              <kbd className="px-2 py-1 bg-white rounded border border-blue-200">
                Ctrl+N
              </kbd>{' '}
              新規行
            </div>
            <div>
              <kbd className="px-2 py-1 bg-white rounded border border-blue-200">
                Delete
              </kbd>{' '}
              行削除
            </div>
            <div>
              <kbd className="px-2 py-1 bg-white rounded border border-blue-200">
                Ctrl+D
              </kbd>{' '}
              行複製
            </div>
          </div>
        </div>
      </main>

      {/* バージョンパネル */}
      <VersionPanel
        isOpen={showVersionPanel}
        onClose={() => setShowVersionPanel(false)}
        versions={versions}
        currentVersionId={currentVersionId}
        onCreateVersion={handleCreateVersion}
        onSwitchVersion={handleSwitchVersion}
        onOpenVersionComparison={() => setShowVersionComparison(true)}
        onDeleteVersion={handleDeleteVersion}
      />

      {/* バージョン比較モーダル */}
      <VersionComparisonModal
        isOpen={showVersionComparison}
        onClose={() => setShowVersionComparison(false)}
        versions={versions}
        getVersionItems={getVersionItems}
      />

      {/* テンプレート選択モーダル */}
      <TemplateSelectModal
        isOpen={showTemplateSelectModal}
        onClose={() => setShowTemplateSelectModal(false)}
        templates={allTemplates}
        onApplyTemplate={handleApplyTemplate}
      />

      {/* テンプレート保存モーダル */}
      <TemplateSaveModal
        isOpen={showTemplateSaveModal}
        onClose={() => setShowTemplateSaveModal(false)}
        onSave={handleSaveTemplate}
      />

      {/* マスタ検索モーダル */}
      <MasterSearchModal
        isOpen={showMasterSearchModal}
        onClose={() => setShowMasterSearchModal(false)}
        category={masterSearchCategory}
        onSelectItem={handleSelectMasterItem}
      />

      {/* コメントパネル */}
      <CommentPanel
        isOpen={showCommentPanel}
        onClose={() => setShowCommentPanel(false)}
        itemId={commentTargetItemId}
        itemName={selectedItemName}
        comments={selectedItemComments}
        onAddComment={handleAddComment}
        onUpdateComment={handleUpdateComment}
        onDeleteComment={handleDeleteComment}
        currentUserId={currentUser.id}
      />
    </div>
  );
}
