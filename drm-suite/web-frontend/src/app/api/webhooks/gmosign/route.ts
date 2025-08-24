import { NextRequest, NextResponse } from 'next/server';
import { electronicContractService } from '@/services/electronic-contract.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('GMOサイン webhook received:', body);

    // GMOサインからのWebhookを処理
    await electronicContractService.processWebhook('gmosign', body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('GMOサイン webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'GMOサイン Webhook Endpoint',
    status: 'active',
  });
}
