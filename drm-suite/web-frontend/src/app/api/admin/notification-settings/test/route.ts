import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// POST: テスト通知送信
export async function POST(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';

    // 実際の環境では以下のようにメール送信やSlack送信を行う
    /*
    // メール送信例
    await sendEmail({
      to: settings.emailRecipients,
      subject: '[DRM Suite] テスト通知',
      body: 'これはテスト通知です。通知設定が正しく動作しています。',
    });

    // Slack送信例
    if (settings.slackEnabled && settings.slackWebhookUrl) {
      await fetch(settings.slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: settings.slackChannel,
          text: '[DRM Suite] テスト通知\nこれはテスト通知です。通知設定が正しく動作しています。',
        }),
      });
    }
    */

    console.log(`[${tenantId}] Test notification sent`);

    return NextResponse.json({
      success: true,
      message: 'Test notification sent successfully',
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}
