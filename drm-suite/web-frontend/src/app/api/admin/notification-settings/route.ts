import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// メモリ内データストア
let notificationSettings: Map<string, any> = new Map();

// GET: 通知設定取得
export async function GET(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    const settings = notificationSettings.get(tenantId);

    return NextResponse.json({
      success: true,
      settings: settings || null,
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notification settings' },
      { status: 500 }
    );
  }
}

// POST: 通知設定保存
export async function POST(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    const settings = await request.json();

    notificationSettings.set(tenantId, settings);

    return NextResponse.json({
      success: true,
      message: 'Notification settings saved successfully',
    });
  } catch (error) {
    console.error('Error saving notification settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save notification settings' },
      { status: 500 }
    );
  }
}
