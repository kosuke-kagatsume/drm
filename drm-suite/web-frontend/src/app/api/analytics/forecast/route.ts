import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || 'demo-tenant';

    const responseData = {
      summary: {
        currentMonthForecast: 125000000,
        nextMonthForecast: 135000000,
        quarterForecast: 380000000,
        achievementRate: 83.3,
        pipelineValue: 250000000,
        wonRate: 62.5,
      },
      monthlyForecast: [
        {
          month: '2024-05',
          forecast: 110000000,
          actual: 105000000,
          achievement: 95.5,
        },
        {
          month: '2024-06',
          forecast: 115000000,
          actual: 112000000,
          achievement: 97.4,
        },
        {
          month: '2024-07',
          forecast: 120000000,
          actual: 118000000,
          achievement: 98.3,
        },
        {
          month: '2024-08',
          forecast: 125000000,
          actual: null,
          achievement: null,
        },
        {
          month: '2024-09',
          forecast: 130000000,
          actual: null,
          achievement: null,
        },
        {
          month: '2024-10',
          forecast: 135000000,
          actual: null,
          achievement: null,
        },
      ],
      pipeline: [
        { stage: 'リード', count: 15, value: 75000000, probability: 10 },
        { stage: '商談中', count: 8, value: 80000000, probability: 40 },
        { stage: '提案済み', count: 5, value: 65000000, probability: 70 },
        { stage: '最終交渉', count: 3, value: 30000000, probability: 90 },
      ],
      filters: { tenantId },
      metadata: { generatedAt: new Date().toISOString() },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
