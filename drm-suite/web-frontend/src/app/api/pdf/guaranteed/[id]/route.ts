// src/app/api/pdf/guaranteed/[id]/route.ts
import { NextRequest } from 'next/server';

// NOTE: Puppeteerはパフォーマンス最適化のため削除されました（2025/10/14）
// 今後はインストール済みのjsPDFを使用して実装予定

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // NOTE: PDF生成機能は一時的に無効化されています（2025/10/14）
    // Puppeteerはパフォーマンス最適化のため削除されました
    // 今後はjsPDFライブラリを使用して再実装予定です
    return new Response(
      JSON.stringify({
        error: 'PDF生成機能は一時的に利用できません',
        message:
          'Puppeteerはパフォーマンス最適化のため削除されました。PDF生成機能はjsPDFを使用して再実装予定です。',
        estimateId: params.id,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('PDF route error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}

// POST メソッドでも対応
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  return GET(req, { params });
}
