'use client';

import { useState } from 'react';
import { Send, Clock, Lightbulb } from 'lucide-react';

interface RAGAssistantProps {
  className?: string;
  userRole?: string;
}

interface SearchHistory {
  id: string;
  question: string;
  timestamp: string;
}

interface SuggestedQuestion {
  id: string;
  text: string;
  category: string;
}

export default function RAGAssistant({ className = '', userRole = 'マーケティング' }: RAGAssistantProps) {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 役職に応じたおすすめ質問を取得
  const getSuggestedQuestions = (role: string): SuggestedQuestion[] => {
    if (role === '経理担当' || role === 'accounting') {
      return [
        {
          id: '1',
          text: '建設業の勘定科目の設定方法は？',
          category: '勘定科目'
        },
        {
          id: '2', 
          text: '工事原価の管理と計算方法は？',
          category: '原価管理'
        },
        {
          id: '3',
          text: '請求書の自動仕訳のルールは？',
          category: '仕訳処理'
        }
      ];
    }
    // デフォルト（マーケティング）
    return [
      {
        id: '1',
        text: '建築業界のSNSマーケティングのコツは？',
        category: 'マーケティング'
      },
      {
        id: '2', 
        text: 'リフォームのターゲティング手法は？',
        category: 'ターゲティング'
      },
      {
        id: '3',
        text: 'メールの開封率を上げる方法は？',
        category: 'メール配信'
      }
    ];
  };

  // 役職に応じた検索履歴を取得
  const getSearchHistory = (role: string): SearchHistory[] => {
    if (role === '経理担当' || role === 'accounting') {
      return [
        {
          id: '1',
          question: '工事進行基準 会計処理',
          timestamp: '2時間前'
        },
        {
          id: '2',
          question: '完成工事未収入金 仕訳',
          timestamp: '5時間前'
        },
        {
          id: '3',
          question: '建設業経理士 試験対策',
          timestamp: '1日前'
        }
      ];
    }
    // デフォルト（マーケティング）
    return [
      {
        id: '1',
        question: 'コンテンツマーケティング 施工事例',
        timestamp: '2時間前'
      },
      {
        id: '2',
        question: 'Google広告 キーワード選定',
        timestamp: '5時間前'
      },
      {
        id: '3',
        question: 'ランディングページ 最適化',
        timestamp: '1日前'
      }
    ];
  };

  // 役職に応じたプレースホルダーテキストを取得
  const getPlaceholder = (role: string): string => {
    if (role === '経理担当' || role === 'accounting') {
      return '例：建設業の減価償却の計算方法は？';
    }
    return '例：建築業界でのインフルエンサーマーケティングは？';
  };

  const suggestedQuestions = getSuggestedQuestions(userRole);
  const searchHistory = getSearchHistory(userRole);
  const placeholder = getPlaceholder(userRole);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    
    // RAG処理のシミュレーション
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // ここで実際のRAG APIを呼び出す
      console.log('RAG query:', question);
      setQuestion('');
    } catch (error) {
      console.error('RAG query failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestionClick = (suggestedQuestion: string) => {
    setQuestion(suggestedQuestion);
  };

  return (
    <div className={`bg-gradient-to-br from-purple-600 to-indigo-700 rounded-lg shadow-lg ${className}`}>
      {/* ヘッダー */}
      <div className="p-4 border-b border-purple-500/30">
        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
          🤖 RAGアシスタント
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* おすすめ質問セクション */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-yellow-300" />
            <span className="text-white font-medium text-sm">おすすめ質問</span>
          </div>
          <div className="space-y-2">
            {suggestedQuestions.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSuggestedQuestionClick(item.text)}
                className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <div className="text-white text-sm leading-relaxed">
                  {item.text}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 質問入力セクション */}
        <div>
          <label className="block text-white font-medium text-sm mb-2">
            質問を入力
          </label>
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={placeholder}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 resize-none focus:outline-none focus:ring-2 focus:ring-white/30"
              rows={3}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!question.trim() || isLoading}
              className="w-full bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  処理中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  RAGに聞く
                </>
              )}
            </button>
          </form>
        </div>

        {/* 最近の検索履歴セクション */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-blue-300" />
            <span className="text-white font-medium text-sm">最近の検索</span>
          </div>
          <div className="space-y-2">
            {searchHistory.map((item) => (
              <div key={item.id} className="flex justify-between items-start p-2 bg-white/5 rounded-lg">
                <button
                  onClick={() => handleSuggestedQuestionClick(item.question)}
                  className="text-white/80 text-sm flex-1 text-left hover:text-white transition-colors"
                >
                  {item.question}
                </button>
                <span className="text-white/50 text-xs ml-2 flex-shrink-0">
                  {item.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}