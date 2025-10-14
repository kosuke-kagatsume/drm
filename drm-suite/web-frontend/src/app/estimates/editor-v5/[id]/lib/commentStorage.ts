// ==================== コメント保存・読み込みロジック ====================

import { Comment } from '../types';
import { generateId } from './estimateCalculations';

/**
 * 見積のコメント一覧を取得
 */
export function loadComments(estimateId: string): Comment[] {
  if (typeof window === 'undefined') return [];

  const key = `estimate-v5-comments-${estimateId}`;
  const data = localStorage.getItem(key);
  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * コメント一覧を保存
 */
export function saveComments(estimateId: string, comments: Comment[]): void {
  if (typeof window === 'undefined') return;

  const key = `estimate-v5-comments-${estimateId}`;
  localStorage.setItem(key, JSON.stringify(comments));
}

/**
 * 特定項目のコメント一覧を取得
 */
export function getItemComments(estimateId: string, itemId: string): Comment[] {
  const allComments = loadComments(estimateId);
  return allComments.filter((comment) => comment.itemId === itemId);
}

/**
 * コメントを追加
 */
export function addComment(
  estimateId: string,
  itemId: string,
  content: string,
  userId: string,
  userName: string,
): Comment {
  const comments = loadComments(estimateId);

  const newComment: Comment = {
    id: generateId(),
    itemId,
    content,
    createdBy: userId,
    createdByName: userName,
    createdAt: new Date().toISOString(),
  };

  comments.push(newComment);
  saveComments(estimateId, comments);

  return newComment;
}

/**
 * コメントを編集
 */
export function updateComment(
  estimateId: string,
  commentId: string,
  content: string,
): boolean {
  const comments = loadComments(estimateId);
  const index = comments.findIndex((c) => c.id === commentId);

  if (index === -1) return false;

  comments[index] = {
    ...comments[index],
    content,
    updatedAt: new Date().toISOString(),
  };

  saveComments(estimateId, comments);
  return true;
}

/**
 * コメントを削除
 */
export function deleteComment(estimateId: string, commentId: string): boolean {
  const comments = loadComments(estimateId);
  const filteredComments = comments.filter((c) => c.id !== commentId);

  if (filteredComments.length === comments.length) return false;

  saveComments(estimateId, filteredComments);
  return true;
}

/**
 * 項目ごとのコメント数を取得
 */
export function getCommentCounts(estimateId: string): Map<string, number> {
  const comments = loadComments(estimateId);
  const counts = new Map<string, number>();

  comments.forEach((comment) => {
    const current = counts.get(comment.itemId) || 0;
    counts.set(comment.itemId, current + 1);
  });

  return counts;
}
