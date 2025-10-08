import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// メモリ内データストア（ユーザーIDごと）
let userNotificationSettings: Map<string, any> = new Map();

// GET: ユーザー通知設定取得
export async function GET(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    const userId = cookies().get('userId')?.value || 'demo-user';

    const key = `${tenantId}:${userId}`;
    const settings = userNotificationSettings.get(key);

    return NextResponse.json({
      success: true,
      settings: settings || null,
    });
  } catch (error) {
    console.error('Error fetching user notification settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user notification settings' },
      { status: 500 }
    );
  }
}

// POST: ユーザー通知設定保存
export async function POST(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    const userId = cookies().get('userId')?.value || 'demo-user';
    const settings = await request.json();

    const key = `${tenantId}:${userId}`;
    userNotificationSettings.set(key, settings);

    return NextResponse.json({
      success: true,
      message: 'User notification settings saved successfully',
    });
  } catch (error) {
    console.error('Error saving user notification settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save user notification settings' },
      { status: 500 }
    );
  }
}
