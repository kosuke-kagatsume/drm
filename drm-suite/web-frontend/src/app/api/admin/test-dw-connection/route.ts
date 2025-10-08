import { NextRequest, NextResponse } from 'next/server';

// DW接続テスト型定義
interface DWConnectionTestRequest {
  endpoint: string;
  apiKey: string;
}

// POST: DW接続テスト
export async function POST(request: NextRequest) {
  try {
    const body: DWConnectionTestRequest = await request.json();

    // バリデーション
    if (!body.endpoint || !body.apiKey) {
      return NextResponse.json(
        { success: false, error: 'Endpoint and API key are required' },
        { status: 400 }
      );
    }

    // URLの妥当性チェック
    try {
      new URL(body.endpoint);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid endpoint URL' },
        { status: 400 }
      );
    }

    // DW APIへ接続テスト（実際の実装）
    try {
      const response = await fetch(`${body.endpoint}/api/v1/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${body.apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10秒タイムアウト
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          success: true,
          message: 'DW API接続成功',
          data: {
            status: 'connected',
            version: data.version || 'unknown',
            timestamp: new Date().toISOString(),
          },
        });
      } else {
        return NextResponse.json({
          success: false,
          error: `DW API returned status ${response.status}`,
          message: '接続に失敗しました（認証エラーの可能性）',
        }, { status: 502 });
      }
    } catch (fetchError: any) {
      // ネットワークエラー、タイムアウトなど
      if (fetchError.name === 'AbortError') {
        return NextResponse.json({
          success: false,
          error: 'Connection timeout',
          message: '接続タイムアウト（10秒以内に応答がありませんでした）',
        }, { status: 504 });
      }

      return NextResponse.json({
        success: false,
        error: fetchError.message || 'Network error',
        message: 'DW APIへの接続に失敗しました',
      }, { status: 502 });
    }
  } catch (error) {
    console.error('Error testing DW connection:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
