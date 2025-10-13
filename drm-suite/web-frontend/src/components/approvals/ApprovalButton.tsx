'use client';

import { useState } from 'react';
import { CheckCircle, Send, AlertCircle, X, Loader2 } from 'lucide-react';
import type { DocumentType } from '@/types/approval-flow';

interface ApprovalButtonProps {
  documentType: DocumentType;
  documentId: string;
  documentTitle: string;
  amount?: number;
  onSuccess?: () => void;
  className?: string;
}

export default function ApprovalButton({
  documentType,
  documentId,
  documentTitle,
  amount,
  onSuccess,
  className = '',
}: ApprovalButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const typeLabels = {
    estimate: '見積',
    contract: '契約',
    invoice: '請求書',
    expense: '経費',
    purchase: '発注書',
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/approvals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType,
          documentId,
          documentTitle,
          requestedBy: 'current-user-id', // 実際はログインユーザーIDを使用
          amount,
          metadata: {
            comment,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          setShowModal(false);
          setSuccess(false);
          setComment('');
          if (onSuccess) {
            onSuccess();
          }
        }, 2000);
      } else {
        setError(data.error || '承認申請に失敗しました');
      }
    } catch (err) {
      console.error('Approval request error:', err);
      setError('承認申請に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 font-medium ${className}`}
        title="承認申請"
      >
        <Send className="h-4 w-4" />
        承認申請
      </button>

      {/* 承認申請モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Send className="w-5 h-5 text-purple-600" />
                  承認申請
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setComment('');
                    setError(null);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {success ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-bold text-gray-900 mb-2">
                    承認申請を送信しました
                  </p>
                  <p className="text-sm text-gray-600">
                    承認者に通知が送信されました
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600 mb-1">種別</p>
                          <p className="font-semibold text-gray-900">
                            {typeLabels[documentType]}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">番号</p>
                          <p className="font-semibold text-gray-900">
                            {documentId}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-600 mb-1">件名</p>
                          <p className="font-semibold text-gray-900">
                            {documentTitle}
                          </p>
                        </div>
                        {amount && (
                          <div className="col-span-2">
                            <p className="text-gray-600 mb-1">金額</p>
                            <p className="font-semibold text-gray-900 text-lg">
                              ¥{amount.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        コメント（任意）
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="承認者へのメッセージを入力..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setComment('');
                        setError(null);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={isSubmitting}
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          送信中...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          承認申請を送信
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
