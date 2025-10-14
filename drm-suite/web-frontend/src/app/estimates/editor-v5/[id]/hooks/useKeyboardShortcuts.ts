import { useEffect } from 'react';

// ==================== カスタムフック: キーボードショートカット ====================

interface KeyboardShortcutHandlers {
  onSave: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onDelete?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

/**
 * キーボードショートカットカスタムフック
 *
 * Excel風のキーボード操作を実現
 */
export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 入力フィールド内では標準動作
      const target = e.target as HTMLElement;
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true';

      // Ctrl+S: 保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handlers.onSave();
        return;
      }

      // 以下はinput/textareaでは無効
      if (isInputField) return;

      // Ctrl+C: コピー
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && handlers.onCopy) {
        e.preventDefault();
        handlers.onCopy();
        return;
      }

      // Ctrl+V: 貼り付け
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && handlers.onPaste) {
        e.preventDefault();
        handlers.onPaste();
        return;
      }

      // Delete: 削除
      if (e.key === 'Delete' && handlers.onDelete) {
        e.preventDefault();
        handlers.onDelete();
        return;
      }

      // Ctrl+Z: 元に戻す
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === 'z' &&
        !e.shiftKey &&
        handlers.onUndo
      ) {
        e.preventDefault();
        handlers.onUndo();
        return;
      }

      // Ctrl+Shift+Z または Ctrl+Y: やり直し
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')
      ) {
        if (handlers.onRedo) {
          e.preventDefault();
          handlers.onRedo();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlers]);
}
