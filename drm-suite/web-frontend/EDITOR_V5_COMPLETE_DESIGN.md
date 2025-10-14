# 見積エディタ V5 完全設計書

**作成日**: 2025/10/14
**目的**: V5の詳細仕様を確定し、実装に着手する
**設計方針**: V4のUI/UX + V3の企業向け機能 + 既存システム統合

---

## 🎯 V5の基本コンセプト

### 設計思想

1. **V4のUI/UXを継承** - 洗練されたインターフェース、1,901行の基盤
2. **V3の企業向け機能を搭載** - バージョン管理・承認・テンプレート
3. **既存システムと統合** - 承認フロー・PDF管理・権限管理を活用
4. **Excel風の操作性** - キーボードショートカット重視
5. **シンプルさの維持** - 不要な機能は削除、必要な機能に集中

### 目標指標

```
目標コード量: 2,550-2,750行
V3比: 58-62%削減 ✅
V4比: 約1.4倍（企業向け機能追加）

実装期間: 7-10日
  Day 1-2: バージョン管理（150行）
  Day 3-4: テンプレート選択・保存（500行）
  Day 5-6: 原価管理・マスタ検索（300行）
  Day 7-8: 既存システム統合（150行）
  Day 9-10: Excel風ショートカット・最終調整（150行）
```

---

## 📊 V5の機能構成

### 実装する機能（優先順位順）

| Tier   | 機能                     | 推定行数  | 優先度   | 備考                   |
| ------ | ------------------------ | --------- | -------- | ---------------------- |
| **1**  | 基本機能（V4継承）       | 1,700行   | **必須** | テーブル・編集・保存   |
| **2**  | バージョン管理（簡易版） | 150行     | **必須** | 比較・アーカイブなし   |
| **3**  | テンプレート選択         | 350-400行 | **必須** | セクション・支店別対応 |
| **4**  | テンプレート保存         | 80-100行  | 高       | 見積→テンプレート化    |
| **5**  | 原価管理                 | 100-150行 | 高       | 基本版（モーダルなし） |
| **6**  | マスタ検索               | 150-200行 | 高       | 4段階（住設機器のみ）  |
| **7**  | 承認連携                 | 50-80行   | 中       | 既存API呼び出し        |
| **8**  | PDF連携                  | 30-50行   | 中       | 既存テンプレート選択   |
| **9**  | Excel風ショートカット    | 50-80行   | 中       | Ctrl+S等               |
| **10** | その他                   | 100行     | 低       | 有効期限等             |

### 削除する機能（V3から省略）

| 機能                     | 理由               | 削減行数 |
| ------------------------ | ------------------ | -------- |
| バージョン比較           | ユーザー回答: 不要 | ▼100行   |
| アーカイブ・復元         | ユーザー回答: 不要 | ▼50行    |
| 承認ワークフロー独自実装 | 既存システムと統合 | ▼250行   |
| PDF独自実装              | 既存システムと統合 | ▼100行   |
| 価格一括調整             | ユーザー回答: 不要 | ▼50行    |
| 原価掛率モーダル         | ユーザー回答: 不要 | ▼30行    |
| 保存済み見積モーダル     | 見積一覧で代替     | ▼526行   |
| Undo/Redo                | 実装コスト高       | ▼80行    |
| 複数行・セル選択         | 複雑さ増加         | ▼50行    |
| ドラッグ&ドロップ        | V4の上下ボタン継続 | ▼80行    |

**合計削減**: **▼1,316行**

---

## 🏗️ V5のアーキテクチャ

### ファイル構成

```
/app/estimates/editor-v5/[id]/
├── page.tsx                    # メインファイル（2,700行）
├── components/
│   ├── VersionPanel.tsx        # バージョン管理パネル（150行）
│   ├── TemplateSelectModal.tsx # テンプレート選択モーダル（400行）
│   ├── TemplateSaveModal.tsx   # テンプレート保存モーダル（100行）
│   ├── MasterSearchModal.tsx   # マスタ検索モーダル（200行）
│   ├── ApprovalRequestModal.tsx # 承認申請モーダル（80行）
│   └── PdfTemplateSelector.tsx # PDF選択モーダル（50行）
└── hooks/
    ├── useKeyboardShortcuts.ts # キーボードショートカット（80行）
    └── useCostCalculation.ts   # 原価計算ロジック（100行）
```

### 依存関係

**外部ライブラリ**:

```typescript
// V4から継承
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  Plus,
  Trash2,
  Copy,
  Upload,
  Download,
  Printer,
} from 'lucide-react';

// V5で追加（最小限）
import { GitBranch, FileTemplate, Send, Check } from 'lucide-react';
```

**削除するライブラリ**:

```typescript
// dnd-kitは削除（V4の上下ボタンを使用）
- @dnd-kit/core
- @dnd-kit/sortable
- @dnd-kit/utilities
```

---

## 📋 機能詳細設計

### 1. 基本機能（V4継承）- 1,700行

V4の実装をそのまま継承：

- ✅ テーブル表示（10カラム）
- ✅ 行追加・削除・複製
- ✅ セル編集（カテゴリ・単位選択、テキスト・数値入力）
- ✅ 金額自動計算
- ✅ 合計金額表示
- ✅ ローカルストレージ保存
- ✅ 自動保存（5秒）
- ✅ 未保存警告
- ✅ CSVエクスポート・インポート
- ✅ コメント機能
- ✅ PDF出力（ブラウザ印刷）

**変更点**: なし（V4の実装を100%継承）

---

### 2. バージョン管理（簡易版）- 150行 🆕

#### 機能要件

**実装する機能**:

- ✅ バージョン番号管理（メジャー.マイナー.ドラフト）
- ✅ バージョン一覧表示（サイドパネル形式）
- ✅ バージョン切り替え（ワンクリック）
- ✅ 新バージョン作成（変更メモ付き）
- ✅ バージョンステータス（draft/active/superseded）

**削除する機能**:

- ❌ バージョン比較（ユーザー回答: 不要）
- ❌ アーカイブ・復元（ユーザー回答: 不要）
- ❌ 変更履歴（changelog）の詳細表示

#### データ構造

```typescript
interface EstimateVersion {
  id: string;
  versionNumber: string; // "1.0", "1.1", "2.0"
  versionType: 'major' | 'minor' | 'draft';
  status: 'draft' | 'active' | 'superseded';
  title: string;
  changeNote?: string; // 変更メモ（簡易版）
  createdAt: string;
  createdBy: string;
  createdByName: string;
  totalAmount: number;
}
```

#### UI設計

**バージョンパネル（サイドバー形式）**:

```tsx
<div className="fixed right-0 top-16 h-screen w-80 bg-white border-l shadow-lg">
  <div className="p-4 border-b">
    <h2 className="text-xl font-bold">バージョン履歴</h2>
    <button onClick={handleCreateVersion} className="mt-2 w-full btn-primary">
      <GitBranch className="w-4 h-4" />
      新バージョン作成
    </button>
  </div>

  <div className="overflow-y-auto h-[calc(100vh-180px)]">
    {versions.map((version) => (
      <div
        key={version.id}
        className="p-4 border-b hover:bg-gray-50 cursor-pointer"
        onClick={() => handleLoadVersion(version.id)}
      >
        <div className="flex items-center justify-between">
          <span className="font-semibold">v{version.versionNumber}</span>
          <span className="text-sm text-gray-500">
            {version.status === 'active' ? '✅ 最新' : ''}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{version.changeNote}</p>
        <p className="text-xs text-gray-400 mt-1">
          {new Date(version.createdAt).toLocaleString('ja-JP')}
        </p>
      </div>
    ))}
  </div>
</div>
```

**新バージョン作成モーダル**:

```tsx
<Modal isOpen={showCreateVersionModal}>
  <h2>新バージョン作成</h2>

  <div className="space-y-4">
    <div>
      <label>バージョンタイプ</label>
      <select
        value={versionType}
        onChange={(e) => setVersionType(e.target.value)}
      >
        <option value="minor">マイナー更新（1.0 → 1.1）</option>
        <option value="major">メジャー更新（1.0 → 2.0）</option>
        <option value="draft">ドラフト（1.0-draft1）</option>
      </select>
    </div>

    <div>
      <label>変更内容（メモ）</label>
      <textarea
        value={changeNote}
        onChange={(e) => setChangeNote(e.target.value)}
        placeholder="どのような変更を行いましたか？"
        rows={4}
      />
    </div>

    <div className="flex gap-2">
      <button onClick={handleSaveAsNewVersion} className="btn-primary">
        作成
      </button>
      <button onClick={handleCloseModal} className="btn-secondary">
        キャンセル
      </button>
    </div>
  </div>
</Modal>
```

#### 実装ロジック

```typescript
// バージョン番号の自動採番
const generateVersionNumber = (
  versions: EstimateVersion[],
  type: 'major' | 'minor' | 'draft',
): string => {
  const activeVersion = versions.find((v) => v.status === 'active');
  if (!activeVersion) return '1.0';

  const [major, minor] = activeVersion.versionNumber.split('.').map(Number);

  if (type === 'major') {
    return `${major + 1}.0`;
  } else if (type === 'minor') {
    return `${major}.${minor + 1}`;
  } else {
    // draft
    const draftCount = versions.filter((v) =>
      v.versionNumber.startsWith(`${major}.${minor}-draft`),
    ).length;
    return `${major}.${minor}-draft${draftCount + 1}`;
  }
};

// 新バージョン作成
const handleCreateVersion = async () => {
  const newVersion: EstimateVersion = {
    id: nanoid(),
    versionNumber: generateVersionNumber(versions, versionType),
    versionType,
    status: versionType === 'draft' ? 'draft' : 'active',
    title: estimateTitle,
    changeNote,
    createdAt: new Date().toISOString(),
    createdBy: currentUser.id,
    createdByName: currentUser.name,
    totalAmount: calculateTotal(),
  };

  // 既存の active を superseded に変更
  const updatedVersions = versions.map((v) =>
    v.status === 'active' ? { ...v, status: 'superseded' } : v,
  );

  // 新バージョンを追加
  updatedVersions.push(newVersion);

  // localStorageに保存
  localStorage.setItem(
    `estimate-${estimateId}-versions`,
    JSON.stringify(updatedVersions),
  );

  setVersions(updatedVersions);
  setCurrentVersionId(newVersion.id);
};

// バージョン切り替え
const handleLoadVersion = (versionId: string) => {
  const versionData = localStorage.getItem(
    `estimate-${estimateId}-v${versionId}`,
  );
  if (versionData) {
    const data = JSON.parse(versionData);
    setItems(data.items);
    setTitle(data.title);
    setCurrentVersionId(versionId);
  }
};
```

**推定行数**: **150行**（V3の423行から64%削減）

---

### 3. テンプレート選択 - 350-400行 🆕

#### 機能要件

**実装する機能**:

- ✅ テンプレート一覧表示（カテゴリ別）
- ✅ セクション選択（チェックボックス）
- ✅ 支店別テンプレート（東京/大阪/名古屋）
- ✅ テンプレート検索
- ✅ テンプレート適用

**削除する機能**:

- ❌ 価格一括調整（ユーザー回答: 不要）
- ❌ 使用統計（使用回数・最終使用日）
- ❌ タグ管理

#### データ構造

```typescript
interface EstimateTemplate {
  id: string;
  name: string;
  description?: string;
  category: string; // '新築', 'リフォーム', 'リノベーション'
  scope: 'personal' | 'branch' | 'company';
  branch?: '東京支店' | '大阪支店' | '名古屋支店';
  sections: TemplateSection[];
  createdBy: string;
  createdAt: string;
}

interface TemplateSection {
  id: string;
  name: string; // '仮設工事', '基礎工事', '木工事'
  items: EstimateItem[];
}
```

#### UI設計

**テンプレート選択モーダル**:

```tsx
<Modal isOpen={showTemplateModal} size="xl">
  <div className="flex h-[80vh]">
    {/* 左側: テンプレート一覧 */}
    <div className="w-1/3 border-r overflow-y-auto">
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="テンプレート検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      {/* 支店フィルター */}
      <div className="p-4 border-b">
        <label className="text-sm font-semibold">支店</label>
        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
        >
          <option value="all">全て</option>
          <option value="東京支店">東京支店</option>
          <option value="大阪支店">大阪支店</option>
          <option value="名古屋支店">名古屋支店</option>
        </select>
      </div>

      {/* テンプレート一覧 */}
      {filteredTemplates.map((template) => (
        <div
          key={template.id}
          onClick={() => setSelectedTemplate(template)}
          className={`p-4 border-b cursor-pointer hover:bg-blue-50 ${
            selectedTemplate?.id === template.id ? 'bg-blue-100' : ''
          }`}
        >
          <div className="font-semibold">{template.name}</div>
          <div className="text-sm text-gray-600">{template.description}</div>
          <div className="flex gap-2 mt-2">
            <span className="text-xs bg-gray-200 px-2 py-1 rounded">
              {template.category}
            </span>
            {template.branch && (
              <span className="text-xs bg-blue-200 px-2 py-1 rounded">
                {template.branch}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>

    {/* 右側: セクション選択 */}
    <div className="w-2/3 overflow-y-auto">
      {selectedTemplate ? (
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">{selectedTemplate.name}</h3>
          <p className="text-gray-600 mb-6">{selectedTemplate.description}</p>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={selectAllSections}
                onChange={(e) => handleSelectAllSections(e.target.checked)}
                className="w-4 h-4"
              />
              <label className="font-semibold">全てのセクションを選択</label>
            </div>

            {selectedTemplate.sections.map((section) => (
              <div key={section.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={selectedSections.has(section.id)}
                    onChange={(e) =>
                      handleToggleSection(section.id, e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  <label className="font-semibold">{section.name}</label>
                  <span className="text-sm text-gray-500">
                    （{section.items.length}項目）
                  </span>
                </div>

                {/* セクションのプレビュー */}
                <div className="ml-6 text-sm text-gray-600">
                  {section.items.slice(0, 3).map((item, idx) => (
                    <div key={idx}>• {item.itemName}</div>
                  ))}
                  {section.items.length > 3 && (
                    <div>... 他{section.items.length - 3}項目</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 適用ボタン */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={handleApplyTemplate}
              disabled={selectedSections.size === 0}
              className="btn-primary flex-1"
            >
              <Check className="w-4 h-4 mr-2" />
              選択したセクションを適用（{selectedSections.size}個）
            </button>
            <button onClick={handleCloseModal} className="btn-secondary">
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          左側からテンプレートを選択してください
        </div>
      )}
    </div>
  </div>
</Modal>
```

#### 実装ロジック

```typescript
// テンプレートの読み込み
const loadTemplates = () => {
  const savedTemplates = JSON.parse(
    localStorage.getItem('estimate-templates') || '[]',
  ) as EstimateTemplate[];
  setTemplates(savedTemplates);
};

// セクション選択の切り替え
const handleToggleSection = (sectionId: string, checked: boolean) => {
  const newSelectedSections = new Set(selectedSections);
  if (checked) {
    newSelectedSections.add(sectionId);
  } else {
    newSelectedSections.delete(sectionId);
  }
  setSelectedSections(newSelectedSections);
};

// テンプレートの適用
const handleApplyTemplate = () => {
  if (!selectedTemplate) return;

  const newItems: EstimateItem[] = [];
  let currentNo = items.length + 1;

  selectedTemplate.sections.forEach((section) => {
    if (selectedSections.has(section.id)) {
      // セクションの項目を追加
      section.items.forEach((item) => {
        newItems.push({
          ...item,
          id: nanoid(),
          no: currentNo++,
        });
      });
    }
  });

  // 既存の項目に新しい項目を追加
  setItems([...items, ...newItems]);

  // モーダルを閉じる
  setShowTemplateModal(false);
  setSelectedSections(new Set());

  // 保存メッセージ
  showToast(`テンプレートから${newItems.length}項目を追加しました`);
};

// フィルタリング
const filteredTemplates = templates.filter((template) => {
  // 検索語でフィルター
  const matchesSearch =
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase());

  // 支店でフィルター
  const matchesBranch =
    branchFilter === 'all' || template.branch === branchFilter;

  return matchesSearch && matchesBranch;
});
```

**推定行数**: **350-400行**（V3の652行から40%削減）

---

### 4. テンプレート保存 - 80-100行 🆕

#### 機能要件

- ✅ 現在の見積をテンプレートとして保存
- ✅ テンプレート情報の入力（名前・説明・カテゴリ）
- ✅ スコープ選択（個人/支店/全社）
- ✅ 支店の選択（支店スコープの場合）

#### UI設計

```tsx
<Modal isOpen={showSaveTemplateModal}>
  <h2 className="text-xl font-bold mb-4">テンプレートとして保存</h2>

  <div className="space-y-4">
    <div>
      <label className="block text-sm font-semibold mb-1">テンプレート名</label>
      <input
        type="text"
        value={templateName}
        onChange={(e) => setTemplateName(e.target.value)}
        placeholder="例: 標準的な新築見積"
        className="w-full px-3 py-2 border rounded-lg"
      />
    </div>

    <div>
      <label className="block text-sm font-semibold mb-1">説明（任意）</label>
      <textarea
        value={templateDescription}
        onChange={(e) => setTemplateDescription(e.target.value)}
        placeholder="このテンプレートの用途や特徴を記入..."
        rows={3}
        className="w-full px-3 py-2 border rounded-lg"
      />
    </div>

    <div>
      <label className="block text-sm font-semibold mb-1">カテゴリ</label>
      <select
        value={templateCategory}
        onChange={(e) => setTemplateCategory(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg"
      >
        <option value="新築">新築</option>
        <option value="リフォーム">リフォーム</option>
        <option value="リノベーション">リノベーション</option>
        <option value="外構">外構</option>
        <option value="その他">その他</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-semibold mb-1">公開範囲</label>
      <select
        value={templateScope}
        onChange={(e) =>
          setTemplateScope(e.target.value as 'personal' | 'branch' | 'company')
        }
        className="w-full px-3 py-2 border rounded-lg"
      >
        <option value="personal">個人用（自分だけ）</option>
        <option value="branch">支店用（支店メンバー共有）</option>
        <option value="company">全社用（全員が使用可能）</option>
      </select>
    </div>

    {templateScope === 'branch' && (
      <div>
        <label className="block text-sm font-semibold mb-1">支店</label>
        <select
          value={templateBranch}
          onChange={(e) => setTemplateBranch(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="東京支店">東京支店</option>
          <option value="大阪支店">大阪支店</option>
          <option value="名古屋支店">名古屋支店</option>
        </select>
      </div>
    )}

    <div className="flex gap-2 pt-4">
      <button
        onClick={handleSaveTemplate}
        disabled={!templateName.trim()}
        className="btn-primary flex-1"
      >
        <FileTemplate className="w-4 h-4 mr-2" />
        テンプレートを保存
      </button>
      <button
        onClick={() => setShowSaveTemplateModal(false)}
        className="btn-secondary"
      >
        キャンセル
      </button>
    </div>
  </div>
</Modal>
```

#### 実装ロジック

```typescript
const handleSaveTemplate = () => {
  if (!templateName.trim()) {
    alert('テンプレート名を入力してください');
    return;
  }

  // セクションをカテゴリごとにグループ化
  const sections: TemplateSection[] = [];
  const categoryMap = new Map<string, EstimateItem[]>();

  items.forEach((item) => {
    if (!categoryMap.has(item.category)) {
      categoryMap.set(item.category, []);
    }
    categoryMap.get(item.category)!.push(item);
  });

  categoryMap.forEach((items, category) => {
    sections.push({
      id: nanoid(),
      name: category,
      items: items.map((item) => ({
        ...item,
        id: '', // テンプレートでは空にする（適用時に再生成）
      })),
    });
  });

  const newTemplate: EstimateTemplate = {
    id: nanoid(),
    name: templateName.trim(),
    description: templateDescription.trim() || undefined,
    category: templateCategory,
    scope: templateScope,
    branch: templateScope === 'branch' ? templateBranch : undefined,
    sections,
    createdBy: currentUser.id,
    createdAt: new Date().toISOString(),
  };

  // 既存のテンプレートに追加
  const existingTemplates = JSON.parse(
    localStorage.getItem('estimate-templates') || '[]',
  );
  existingTemplates.push(newTemplate);
  localStorage.setItem('estimate-templates', JSON.stringify(existingTemplates));

  // モーダルを閉じる
  setShowSaveTemplateModal(false);
  showToast('テンプレートを保存しました');
};
```

**推定行数**: **80-100行**

---

### 5. 原価管理 - 100-150行 🆕

#### 機能要件

- ✅ 各行に原価を入力
- ✅ 粗利の自動計算（売価 - 原価）
- ✅ 粗利率の自動計算（(売価 - 原価) / 売価 × 100）
- ✅ 合計原価・合計粗利の表示
- ❌ 掛率調整モーダル（ユーザー回答: 不要）

#### データ構造（V4に追加）

```typescript
interface EstimateItem {
  // 既存のフィールド（V4）
  id: string;
  no: number;
  category: string;
  itemName: string;
  specification: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  remarks: string;

  // 原価管理用フィールド（V5で追加）
  costPrice?: number; // 原価単価
  costAmount?: number; // 原価合計（costPrice × quantity）
  grossProfit?: number; // 粗利額（amount - costAmount）
  grossProfitRate?: number; // 粗利率（grossProfit / amount × 100）
}
```

#### UI設計

**テーブルに原価カラムを追加**:

```tsx
<thead>
  <tr>
    <th>No</th>
    <th>カテゴリ</th>
    <th>項目名</th>
    <th>仕様</th>
    <th>数量</th>
    <th>単位</th>
    <th>単価</th>
    <th>金額</th>
    {/* V5で追加 */}
    <th className="bg-yellow-50">原価</th>
    <th className="bg-green-50">粗利</th>
    <th className="bg-green-50">粗利率</th>
    <th>備考</th>
    <th>操作</th>
  </tr>
</thead>
```

**合計行に原価・粗利を追加**:

```tsx
<div className="mt-6 grid grid-cols-3 gap-4">
  <div className="bg-blue-50 p-4 rounded-lg">
    <div className="text-sm text-gray-600">合計金額</div>
    <div className="text-2xl font-bold text-blue-600">
      {formatPrice(totalAmount)}
    </div>
  </div>

  <div className="bg-yellow-50 p-4 rounded-lg">
    <div className="text-sm text-gray-600">合計原価</div>
    <div className="text-2xl font-bold text-yellow-600">
      {formatPrice(totalCost)}
    </div>
  </div>

  <div className="bg-green-50 p-4 rounded-lg">
    <div className="text-sm text-gray-600">合計粗利</div>
    <div className="text-2xl font-bold text-green-600">
      {formatPrice(totalProfit)}
    </div>
    <div className="text-sm text-gray-600 mt-1">
      粗利率: {totalProfitRate.toFixed(1)}%
    </div>
  </div>
</div>
```

#### 実装ロジック

```typescript
// 原価計算のカスタムフック
const useCostCalculation = (items: EstimateItem[]) => {
  const calculateItemCost = useCallback((item: EstimateItem): EstimateItem => {
    const costAmount = (item.costPrice || 0) * item.quantity;
    const grossProfit = item.amount - costAmount;
    const grossProfitRate =
      item.amount > 0 ? (grossProfit / item.amount) * 100 : 0;

    return {
      ...item,
      costAmount,
      grossProfit,
      grossProfitRate,
    };
  }, []);

  const itemsWithCost = useMemo(() => {
    return items.map(calculateItemCost);
  }, [items, calculateItemCost]);

  const totals = useMemo(() => {
    const totalAmount = itemsWithCost.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    const totalCost = itemsWithCost.reduce(
      (sum, item) => sum + (item.costAmount || 0),
      0,
    );
    const totalProfit = totalAmount - totalCost;
    const totalProfitRate =
      totalAmount > 0 ? (totalProfit / totalAmount) * 100 : 0;

    return { totalAmount, totalCost, totalProfit, totalProfitRate };
  }, [itemsWithCost]);

  return { itemsWithCost, totals };
};

// メインコンポーネントで使用
const { itemsWithCost, totals } = useCostCalculation(items);
```

**推定行数**: **100-150行**（V3の200行から30%削減）

---

### 6. マスタ検索 - 150-200行

#### 機能要件

- ✅ 4段階階層検索（カテゴリ→商品種別→メーカー→製品）
- ⚠️ **住設機器のみ**4段階、それ以外は簡易検索
- ✅ マスタデータ75項目
- ✅ 検索機能（キーワード）
- ✅ 行への適用

#### UI設計

```tsx
<Modal isOpen={showMasterSearch} size="lg">
  <h2 className="text-xl font-bold mb-4">マスタ検索</h2>

  {/* 検索ボックス */}
  <div className="mb-4">
    <input
      type="text"
      placeholder="キーワード検索..."
      value={masterSearchTerm}
      onChange={(e) => setMasterSearchTerm(e.target.value)}
      className="w-full px-3 py-2 border rounded-lg"
    />
  </div>

  {/* 住設機器の場合: 4段階検索 */}
  {selectedCategory === 'キッチン工事' ||
  selectedCategory === '浴室工事' ||
  selectedCategory === '給排水工事' ? (
    <div className="space-y-4">
      {/* Step 1: 商品種別 */}
      {searchStep === 'productType' && (
        <div>
          <h3 className="font-semibold mb-2">商品種別を選択</h3>
          <div className="grid grid-cols-2 gap-2">
            {productTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleSelectProductType(type.id)}
                className="p-3 border rounded-lg hover:bg-blue-50"
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: メーカー */}
      {searchStep === 'maker' && (
        <div>
          <button
            onClick={() => setSearchStep('productType')}
            className="text-blue-600 mb-2"
          >
            ← 商品種別に戻る
          </button>
          <h3 className="font-semibold mb-2">メーカーを選択</h3>
          <div className="grid grid-cols-3 gap-2">
            {makers.map((maker) => (
              <button
                key={maker}
                onClick={() => handleSelectMaker(maker)}
                className="p-3 border rounded-lg hover:bg-blue-50"
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
          <button
            onClick={() => setSearchStep('maker')}
            className="text-blue-600 mb-2"
          >
            ← メーカーに戻る
          </button>
          <h3 className="font-semibold mb-2">製品を選択</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleSelectProduct(product)}
                className="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer"
              >
                <div className="font-semibold">{product.itemName}</div>
                <div className="text-sm text-gray-600">
                  {product.specification}
                </div>
                <div className="flex gap-4 text-sm mt-1">
                  <span>単価: {formatPrice(product.standardPrice)}</span>
                  <span>原価: {formatPrice(product.costPrice)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  ) : (
    /* その他のカテゴリ: シンプルな一覧検索 */
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {filteredMasterItems.map((item) => (
        <div
          key={item.id}
          onClick={() => handleSelectMasterItem(item)}
          className="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer"
        >
          <div className="font-semibold">{item.itemName}</div>
          <div className="text-sm text-gray-600">{item.specification}</div>
          <div className="flex gap-4 text-sm mt-1">
            <span>単価: {formatPrice(item.standardPrice)}</span>
            <span>原価: {formatPrice(item.costPrice)}</span>
          </div>
        </div>
      ))}
    </div>
  )}
</Modal>
```

#### 実装ロジック

```typescript
// マスタ検索の状態管理
const [searchStep, setSearchStep] = useState<
  'productType' | 'maker' | 'product'
>('productType');
const [selectedProductType, setSelectedProductType] = useState<string | null>(
  null,
);
const [selectedMaker, setSelectedMaker] = useState<string | null>(null);

// 住設機器判定
const isEquipmentCategory = (category: string): boolean => {
  return ['キッチン工事', '浴室工事', '給排水工事', '電気工事'].includes(
    category,
  );
};

// マスタアイテム選択時
const handleSelectMasterItem = (masterItem: MasterItem) => {
  if (!activeRowId) return;

  // 行にマスタ情報を適用
  setItems(
    items.map((item) =>
      item.id === activeRowId
        ? {
            ...item,
            itemName: masterItem.itemName,
            specification: masterItem.specification,
            unit: masterItem.unit,
            unitPrice: masterItem.standardPrice,
            amount: item.quantity * masterItem.standardPrice,
            costPrice: masterItem.costPrice,
            costAmount: item.quantity * masterItem.costPrice,
          }
        : item,
    ),
  );

  // モーダルを閉じる
  setShowMasterSearch(false);
  setSearchStep('productType');
  setSelectedProductType(null);
  setSelectedMaker(null);
};
```

**推定行数**: **150-200行**（V3の98行 + 検索ロジック）

---

### 7. 承認連携 - 50-80行

#### 機能要件

- ✅ 既存の承認システム（`/admin/approval-flows`）と連携
- ✅ 承認申請モーダル
- ✅ 緊急度選択（高/中/低）
- ✅ 承認ステップ設定（管理コンソールの設定を使用）

#### UI設計

```tsx
<Modal isOpen={showApprovalRequestModal}>
  <h2 className="text-xl font-bold mb-4">承認申請</h2>

  <div className="space-y-4">
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="text-sm text-gray-600">見積金額</div>
      <div className="text-2xl font-bold text-blue-600">
        {formatPrice(totalAmount)}
      </div>
    </div>

    <div>
      <label className="block text-sm font-semibold mb-1">緊急度</label>
      <select
        value={approvalUrgency}
        onChange={(e) => setApprovalUrgency(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg"
      >
        <option value="high">高（至急）</option>
        <option value="normal">中（通常）</option>
        <option value="low">低（余裕あり）</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-semibold mb-1">申請コメント</label>
      <textarea
        value={approvalComment}
        onChange={(e) => setApprovalComment(e.target.value)}
        placeholder="承認者へのメッセージ..."
        rows={3}
        className="w-full px-3 py-2 border rounded-lg"
      />
    </div>

    {/* 承認フロー情報（管理コンソールから取得） */}
    <div className="bg-blue-50 p-4 rounded-lg">
      <div className="text-sm font-semibold mb-2">承認フロー</div>
      {approvalFlow?.steps.map((step, index) => (
        <div key={step.id} className="text-sm">
          Step {index + 1}: {step.approvers.map((a) => a.name).join(', ')}
        </div>
      ))}
    </div>

    <div className="flex gap-2 pt-4">
      <button onClick={handleSubmitApproval} className="btn-primary flex-1">
        <Send className="w-4 h-4 mr-2" />
        承認申請を送信
      </button>
      <button
        onClick={() => setShowApprovalRequestModal(false)}
        className="btn-secondary"
      >
        キャンセル
      </button>
    </div>
  </div>
</Modal>
```

#### 実装ロジック

```typescript
// 承認フローの取得（管理コンソールのAPIを使用）
const loadApprovalFlow = async () => {
  const response = await fetch(
    `/api/admin/approval-flows?documentType=estimate&amount=${totalAmount}`,
  );
  const flow = await response.json();
  setApprovalFlow(flow);
};

// 承認申請
const handleSubmitApproval = async () => {
  // 見積を保存
  await handleSave(true);

  // 承認ワークフローを作成（既存APIを使用）
  const response = await fetch('/api/approvals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      documentType: 'estimate',
      documentId: estimateId,
      documentTitle: estimateTitle,
      totalAmount,
      urgency: approvalUrgency,
      requestNote: approvalComment,
      requestedBy: currentUser.id,
      requestedByName: currentUser.name,
    }),
  });

  const workflow = await response.json();

  // 承認画面へ遷移
  router.push(`/approvals/${workflow.id}`);
};
```

**推定行数**: **50-80行**（既存API活用により大幅削減）

---

### 8. PDF連携 - 30-50行

#### 機能要件

- ✅ 管理コンソール（`/admin/pdf-management`）で作成したテンプレートを使用
- ✅ テンプレート選択モーダル
- ✅ 既存のPDF生成エンジンを使用

#### UI設計

```tsx
<Modal isOpen={showPdfSelector} size="sm">
  <h2 className="text-xl font-bold mb-4">PDFテンプレート選択</h2>

  <div className="space-y-2">
    {pdfTemplates.map((template) => (
      <div
        key={template.id}
        onClick={() => handleSelectPdfTemplate(template)}
        className="p-4 border rounded-lg hover:bg-blue-50 cursor-pointer"
      >
        <div className="font-semibold">{template.name}</div>
        <div className="text-sm text-gray-600">{template.description}</div>
      </div>
    ))}
  </div>
</Modal>
```

#### 実装ロジック

```typescript
// PDFテンプレートの取得（管理コンソールのAPIを使用）
const loadPdfTemplates = async () => {
  const response = await fetch('/api/pdf-templates?type=estimate');
  const templates = await response.json();
  setPdfTemplates(templates);
};

// PDF生成（既存のPDFエンジンを使用）
const handleSelectPdfTemplate = async (template: PdfTemplate) => {
  setShowPdfSelector(false);

  // 既存のPDF生成エンジンを使用
  await PdfTemplateEngine.generateFromTemplate({
    template,
    data: {
      estimate: {
        id: estimateId,
        title: estimateTitle,
        customer: customerInfo,
        items: items,
        totalAmount,
        validUntil,
      },
    },
  });
};
```

**推定行数**: **30-50行**（既存システム活用）

---

### 9. Excel風ショートカット - 50-80行 🆕

#### 機能要件

- ✅ Ctrl+S: 保存
- ✅ Ctrl+C: 行コピー（選択行）
- ✅ Ctrl+V: 行貼り付け
- ✅ Ctrl+Z: 元に戻す（検討）
- ✅ Delete: 行削除（選択行）
- ✅ Enter: 次のセルに移動
- ✅ Tab: 右のセルに移動

#### 実装ロジック

```typescript
// キーボードショートカットのカスタムフック
const useKeyboardShortcuts = (handlers: {
  onSave: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S: 保存
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handlers.onSave();
      }

      // Ctrl+C: コピー
      if (e.ctrlKey && e.key === 'c') {
        // input/textarea内では標準動作
        if (
          document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA'
        ) {
          return;
        }
        e.preventDefault();
        handlers.onCopy();
      }

      // Ctrl+V: 貼り付け
      if (e.ctrlKey && e.key === 'v') {
        if (
          document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA'
        ) {
          return;
        }
        e.preventDefault();
        handlers.onPaste();
      }

      // Delete: 削除
      if (e.key === 'Delete') {
        if (
          document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA'
        ) {
          return;
        }
        e.preventDefault();
        handlers.onDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
};

// メインコンポーネントで使用
const [copiedRow, setCopiedRow] = useState<EstimateItem | null>(null);
const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

useKeyboardShortcuts({
  onSave: () => handleSave(true),
  onCopy: () => {
    if (selectedRowId) {
      const row = items.find((item) => item.id === selectedRowId);
      if (row) {
        setCopiedRow(row);
        showToast('行をコピーしました');
      }
    }
  },
  onPaste: () => {
    if (copiedRow) {
      const newRow = {
        ...copiedRow,
        id: nanoid(),
        no: items.length + 1,
      };
      setItems([...items, newRow]);
      showToast('行を貼り付けました');
    }
  },
  onDelete: () => {
    if (selectedRowId) {
      handleDeleteRow(selectedRowId);
    }
  },
});
```

**推定行数**: **50-80行**

---

## 📈 V5実装スケジュール

### 全体スケジュール: 7-10日

```
Day 1-2: バージョン管理（150行）
  - バージョン番号管理
  - バージョン一覧・切り替え
  - 新バージョン作成

Day 3-4: テンプレート選択・保存（500行）
  - テンプレート選択モーダル（セクション選択）
  - 支店別フィルター
  - テンプレート保存機能

Day 5-6: 原価管理・マスタ検索（300行）
  - 原価カラム追加
  - 粗利計算ロジック
  - マスタ検索モーダル（4段階 + 簡易版）

Day 7-8: 既存システム統合（150行）
  - 承認API連携
  - PDF API連携
  - 見積コピー機能（見積一覧）

Day 9-10: Excel風ショートカット・最終調整（150行）
  - キーボードショートカット実装
  - UI/UX調整
  - テスト・デバッグ
```

---

## ✅ 実装チェックリスト

### Phase 1: 基盤（V4継承）

- [ ] V4のコードをV5ディレクトリにコピー
- [ ] パスを `/estimates/editor-v5/[id]` に変更
- [ ] 基本動作確認

### Phase 2: バージョン管理

- [ ] バージョン番号の自動採番ロジック
- [ ] バージョン一覧サイドパネル
- [ ] 新バージョン作成モーダル
- [ ] バージョン切り替え機能
- [ ] localStorageへの保存

### Phase 3: テンプレート機能

- [ ] テンプレート一覧表示
- [ ] 支店別フィルター
- [ ] セクション選択UI
- [ ] テンプレート適用ロジック
- [ ] テンプレート保存機能

### Phase 4: 原価管理

- [ ] 原価カラムをテーブルに追加
- [ ] 原価計算ロジック（カスタムフック）
- [ ] 粗利・粗利率の表示
- [ ] 合計原価・粗利の表示

### Phase 5: マスタ検索

- [ ] マスタ検索モーダル
- [ ] 住設機器の4段階検索
- [ ] その他カテゴリの簡易検索
- [ ] マスタ適用ロジック

### Phase 6: 既存システム統合

- [ ] 承認API連携
- [ ] 承認申請モーダル
- [ ] PDFテンプレート取得API連携
- [ ] PDF生成エンジン連携
- [ ] 見積一覧のコピー機能

### Phase 7: Excel風操作

- [ ] キーボードショートカット実装
- [ ] 行のコピー・貼り付け
- [ ] セル移動（Enter/Tab）
- [ ] ショートカットヘルプモーダル

### Phase 8: 最終調整

- [ ] UI/UXの統一
- [ ] エラーハンドリング
- [ ] ローディング状態
- [ ] レスポンシブ対応確認
- [ ] 完全テスト

---

## 🎨 UI/UXガイドライン

### カラーパレット（V4継承）

```css
/* プライマリ */
--primary: #3b82f6; /* 青 */
--primary-hover: #2563eb;

/* セカンダリ */
--secondary: #10b981; /* 緑 */
--warning: #f59e0b; /* オレンジ */
--danger: #ef4444; /* 赤 */

/* 原価管理用 */
--cost: #fcd34d; /* 黄色（原価） */
--profit: #34d399; /* 緑（粗利） */
```

### コンポーネントスタイル

**ボタン**:

```tsx
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
  保存
</button>
```

**モーダル**:

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
    {/* ヘッダー */}
    <div className="p-6 border-b">
      <h2 className="text-2xl font-bold">タイトル</h2>
    </div>
    {/* コンテンツ */}
    <div className="flex-1 overflow-y-auto p-6">{/* ... */}</div>
    {/* フッター */}
    <div className="p-6 border-t flex gap-2">
      <button className="btn-primary flex-1">決定</button>
      <button className="btn-secondary">キャンセル</button>
    </div>
  </div>
</div>
```

---

## 🔧 技術的な注意点

### 1. State管理

```typescript
// V5で追加するState（V4の43個に追加）
const [showVersionPanel, setShowVersionPanel] = useState(false);
const [versions, setVersions] = useState<EstimateVersion[]>([]);
const [currentVersionId, setCurrentVersionId] = useState<string>('');
const [showTemplateModal, setShowTemplateModal] = useState(false);
const [selectedTemplate, setSelectedTemplate] =
  useState<EstimateTemplate | null>(null);
const [selectedSections, setSelectedSections] = useState<Set<string>>(
  new Set(),
);
const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
const [showMasterSearch, setShowMasterSearch] = useState(false);
const [searchStep, setSearchStep] = useState<
  'productType' | 'maker' | 'product'
>('productType');
const [showApprovalRequestModal, setShowApprovalRequestModal] = useState(false);
const [approvalUrgency, setApprovalUrgency] = useState<
  'high' | 'normal' | 'low'
>('normal');
const [copiedRow, setCopiedRow] = useState<EstimateItem | null>(null);
const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
```

### 2. パフォーマンス最適化

```typescript
// useCallback/useMemoの活用
const handleCellChange = useCallback(
  (rowId: string, colKey: string, value: string) => {
    // ...
  },
  [items],
);

const { itemsWithCost, totals } = useCostCalculation(items);
```

### 3. TypeScript型定義

すべての新機能に対して型定義を作成：

- `EstimateVersion`
- `EstimateTemplate`
- `TemplateSection`
- `ApprovalRequest`
- `PdfTemplate`

---

## 📊 最終的なコード量予測

```
V4継承: 1,700行
バージョン管理: 150行
テンプレート選択: 400行
テンプレート保存: 100行
原価管理: 150行
マスタ検索: 200行
承認連携: 80行
PDF連携: 50行
Excel風ショートカット: 80行
その他: 100行
━━━━━━━━━━━━━━━━━━━━━
合計: 3,010行

V3比: 54.2%削減 ✅
目標範囲: 2,550-2,750行に対して+260行
  → 実装中の最適化で削減可能
```

---

## 🎯 成功基準

### 機能面

- ✅ V4の全機能が動作
- ✅ バージョン管理が正常動作
- ✅ テンプレート選択・保存が正常動作
- ✅ 原価管理が正常動作
- ✅ マスタ検索が正常動作
- ✅ 既存システムとの連携が正常動作
- ✅ Excel風操作が正常動作

### 品質面

- ✅ TypeScript エラーなし
- ✅ コンパイル成功
- ✅ 全機能のテスト完了
- ✅ レスポンシブ対応
- ✅ ブラウザ互換性（Chrome/Safari/Edge）

### コード品質

- ✅ コード量: 2,800-3,200行（目標: 3,000行以内）
- ✅ V3比: 50%以上削減
- ✅ 可読性: 関数は100行以内
- ✅ 保守性: コンポーネント分割

---

**最終更新**: 2025/10/14
**作成者**: Claude Code
**ステータス**: V5完全設計書完成、実装準備完了
**次のステップ**: ユーザー承認後、実装開始

---

## 📝 実装開始前の最終確認

この設計書の内容で問題なければ、**V5の実装を開始**します。

実装前に確認したいこと：

1. 機能の優先順位はこれでOKですか？
2. コード量（約3,000行）は許容範囲ですか？
3. 実装スケジュール（7-10日）は問題ないですか？
4. 何か追加・変更したい機能はありますか？

ご確認後、「OK、実装開始！」とおっしゃっていただければ、Day 1から着手します！
