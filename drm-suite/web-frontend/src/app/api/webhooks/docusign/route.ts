import { NextRequest, NextResponse } from 'next/server';
import { electronicContractService } from '@/services/electronic-contract.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('DocuSign webhook received:', body);

    // DocuSignからのWebhookを処理
    await electronicContractService.processWebhook('docusign', body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DocuSign webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'DocuSign Webhook Endpoint',
    status: 'active',
  });
}
