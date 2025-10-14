'use client';

import React, { memo, useState, useEffect } from 'react';
import { X, MessageSquare, Send, Edit2, Trash2, Check } from 'lucide-react';
import { Comment } from '../types';

// ==================== CommentPanel コンポーネント ====================

interface CommentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string | null;
  itemName: string;
  comments: Comment[];
  onAddComment: (itemId: string, content: string) => void;
  onUpdateComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  currentUserId: string;
}

const CommentPanel = memo(function CommentPanel({
  isOpen,
  onClose,
  itemId,
  itemName,
  comments,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  currentUserId,
}: CommentPanelProps) {
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // パネルが閉じたらリセット
  useEffect(() => {
    if (!isOpen) {
      setNewComment('');
      setEditingCommentId(null);
      setEditContent('');
    }
  }, [isOpen]);

  if (!isOpen || !itemId) return null;

  const handleAddComment = () => {
    if (!newComment.trim()) {
      alert('コメントを入力してください');
      return;
    }
    onAddComment(itemId, newComment);
    setNewComment('');
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim() || !editingCommentId) return;
    onUpdateComment(editingCommentId, editContent);
    setEditingCommentId(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (confirm('このコメントを削除しますか？')) {
      onDeleteComment(commentId);
    }
  };

  // コメントを新しい順にソート
  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-white border-l shadow-2xl z-40 flex flex-col">
      {/* ヘッダー */}
      <div className="p-4 border-b bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            コメント
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-indigo-500 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="text-sm bg-indigo-500 px-3 py-1 rounded-lg">
          {itemName}
        </div>
      </div>

      {/* コメント一覧 */}
      <div className="flex-1 overflow-y-auto p-4">
        {sortedComments.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>まだコメントがありません</p>
            <p className="text-sm mt-1">最初のコメントを追加しましょう</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedComments.map((comment) => (
              <div
                key={comment.id}
                className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                {/* ヘッダー */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-sm text-indigo-600">
                      {comment.createdByName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString('ja-JP')}
                      {comment.updatedAt && ' (編集済み)'}
                    </div>
                  </div>
                  {comment.createdBy === currentUserId && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleStartEdit(comment)}
                        className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="編集"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* コメント内容 */}
                {editingCommentId === comment.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        保存
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 新規コメント入力 */}
      <div className="p-4 border-t bg-gray-50">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="コメントを入力..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2 text-sm"
          rows={3}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleAddComment();
            }
          }}
        />
        <button
          onClick={handleAddComment}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-semibold"
        >
          <Send className="w-4 h-4" />
          コメントを追加 (Ctrl+Enter)
        </button>
      </div>
    </div>
  );
});

export default CommentPanel;
