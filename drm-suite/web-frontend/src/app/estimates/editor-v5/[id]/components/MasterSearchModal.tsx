'use client';

import React, { memo, useState, useMemo } from 'react';
import { X, Search, ArrowLeft } from 'lucide-react';
import { MasterItem, SearchStep } from '../types';
import {
  MASTER_ITEMS,
  PRODUCT_TYPES,
  MAKERS,
  EQUIPMENT_CATEGORIES,
  getMinorCategoriesByMajor,
} from '../constants';
import { formatPrice } from '../lib/estimateCalculations';

// ==================== MasterSearchModal コンポーネント ====================

interface MasterSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  onSelectItem: (item: MasterItem) => void;
}

const MasterSearchModal = memo(function MasterSearchModal({
  isOpen,
  onClose,
  category,
  onSelectItem,
}: MasterSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchStep, setSearchStep] = useState<SearchStep>('minorCategory');
  const [selectedMinorCategory, setSelectedMinorCategory] = useState<
    string | null
  >(null);
  const [selectedProductType, setSelectedProductType] = useState<string | null>(
    null,
  );
  const [selectedMaker, setSelectedMaker] = useState<string | null>(null);

  // 住設機器カテゴリかどうか判定（Hooksはearly returnの前に配置）
  const isEquipmentCategory = EQUIPMENT_CATEGORIES.includes(category as any);

  // 小項目をフィルター
  const minorCategories = useMemo(() => {
    return getMinorCategoriesByMajor(category);
  }, [category]);

  // 商品種別をフィルター
  const productTypes = useMemo(() => {
    return PRODUCT_TYPES.filter((pt) => pt.category === category);
  }, [category]);

  // メーカーをフィルター（選択された商品種別に基づく）
  const makers = useMemo(() => {
    if (!selectedProductType) return [];
    const items = MASTER_ITEMS.filter(
      (item) =>
        item.category === category && item.productType === selectedProductType,
    );
    const makerSet = new Set(items.map((item) => item.maker).filter(Boolean));
    return Array.from(makerSet) as string[];
  }, [category, selectedProductType]);

  // マスタアイテムをフィルター
  const filteredItems = useMemo(() => {
    let items = MASTER_ITEMS.filter((item) => item.category === category);

    // 小項目でフィルター
    if (selectedMinorCategory) {
      items = items.filter(
        (item) => item.minorCategory === selectedMinorCategory,
      );
    }

    // 住設機器カテゴリの場合
    if (isEquipmentCategory) {
      if (selectedProductType) {
        items = items.filter(
          (item) => item.productType === selectedProductType,
        );
      }
      if (selectedMaker) {
        items = items.filter((item) => item.maker === selectedMaker);
      }
    }

    // 検索語でフィルター
    if (searchTerm) {
      items = items.filter(
        (item) =>
          item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.specification.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.tags?.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      );
    }

    return items;
  }, [
    category,
    selectedMinorCategory,
    isEquipmentCategory,
    selectedProductType,
    selectedMaker,
    searchTerm,
  ]);

  // 小項目を選択
  const handleSelectMinorCategory = (minorCategoryName: string) => {
    setSelectedMinorCategory(minorCategoryName);
    // 住設機器カテゴリの場合は商品種別選択へ、それ以外は製品一覧へ
    if (isEquipmentCategory) {
      setSearchStep('category');
    } else {
      setSearchStep('product');
    }
  };

  // 商品種別を選択
  const handleSelectProductType = (productTypeId: string) => {
    setSelectedProductType(productTypeId);
    setSearchStep('maker');
  };

  // メーカーを選択
  const handleSelectMaker = (maker: string) => {
    setSelectedMaker(maker);
    setSearchStep('product');
  };

  // アイテムを選択
  const handleSelectItem = (item: MasterItem) => {
    onSelectItem(item);
    handleClose();
  };

  // モーダルを閉じる
  const handleClose = () => {
    setSearchTerm('');
    setSearchStep('minorCategory');
    setSelectedMinorCategory(null);
    setSelectedProductType(null);
    setSelectedMaker(null);
    onClose();
  };

  // 戻るボタン
  const handleBack = () => {
    if (searchStep === 'product') {
      if (isEquipmentCategory) {
        setSearchStep('maker');
        setSelectedMaker(null);
      } else {
        setSearchStep('minorCategory');
        setSelectedMinorCategory(null);
      }
    } else if (searchStep === 'maker') {
      setSearchStep('category');
      setSelectedProductType(null);
    } else if (searchStep === 'category') {
      setSearchStep('minorCategory');
      setSelectedMinorCategory(null);
    }
  };

  // モーダルが閉じている場合は何も表示しない
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* ヘッダー */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {searchStep !== 'minorCategory' && (
                <button
                  onClick={handleBack}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <h2 className="text-2xl font-bold">マスタ検索 - {category}</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* 検索ボックス */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="キーワード検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 0: 小項目選択 */}
          {searchStep === 'minorCategory' && (
            <div>
              <h3 className="font-semibold text-lg mb-3">小項目を選択</h3>
              <div className="grid grid-cols-2 gap-3">
                {minorCategories.map((minorCat) => (
                  <button
                    key={minorCat.id}
                    onClick={() => handleSelectMinorCategory(minorCat.name)}
                    className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="font-semibold">{minorCat.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isEquipmentCategory ? (
            /* 住設機器: 4段階検索 */
            <>
              {/* Step 1: 商品種別 */}
              {searchStep === 'category' && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">商品種別を選択</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {productTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => handleSelectProductType(type.id)}
                        className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                      >
                        <div className="font-semibold">{type.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: メーカー */}
              {searchStep === 'maker' && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">メーカーを選択</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {makers.map((maker) => (
                      <button
                        key={maker}
                        onClick={() => handleSelectMaker(maker)}
                        className="p-3 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                      >
                        {maker}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: 製品 */}
              {searchStep === 'product' && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">製品を選択</h3>
                  <MasterItemList
                    items={filteredItems}
                    onSelect={handleSelectItem}
                  />
                </div>
              )}
            </>
          ) : (
            /* その他: シンプルな一覧検索 */
            <div>
              <h3 className="font-semibold text-lg mb-3">
                マスタアイテム（{filteredItems.length}件）
              </h3>
              <MasterItemList
                items={filteredItems}
                onSelect={handleSelectItem}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// ==================== MasterItemList コンポーネント ====================

interface MasterItemListProps {
  items: MasterItem[];
  onSelect: (item: MasterItem) => void;
}

const MasterItemList = memo(function MasterItemList({
  items,
  onSelect,
}: MasterItemListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <p>該当するマスタアイテムが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onSelect(item)}
          className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="font-semibold text-lg mb-1">{item.itemName}</div>
              <div className="text-sm text-gray-600">{item.specification}</div>
            </div>
            <div className="text-right ml-4">
              <div className="text-sm text-gray-500">単価</div>
              <div className="text-lg font-semibold text-blue-600">
                {formatPrice(item.standardPrice)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex gap-2">
              {item.maker && (
                <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded">
                  {item.maker}
                </span>
              )}
              {item.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="text-gray-600">
              原価:{' '}
              <span className="font-semibold">
                {formatPrice(item.costPrice)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

export default MasterSearchModal;
