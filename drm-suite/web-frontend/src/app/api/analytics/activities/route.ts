import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface SalesActivity {
  id: string;
  tenantId: string;
  activityNo: string;
  date: string;
  type:
    | 'call'
    | 'email'
    | 'meeting'
    | 'visit'
    | 'negotiation'
    | 'proposal'
    | 'followup';
  customerId: string;
  customerName: string;
  customerCompany: string;
  assignee: string;
  assigneeName: string;
  duration: number;
  outcome: 'won' | 'in_progress' | 'lost' | 'scheduled' | null;
}

interface ActivitySummary {
  totalActivities: number;
  completedActivities: number;
  scheduledActivities: number;
  averageDuration: number;
  conversionRate: number;
  totalLeadTime: number;
}

const SAMPLE_ACTIVITIES: SalesActivity[] = [
  {
    id: 'act-001',
    tenantId: 'demo-tenant',
    activityNo: 'ACT-2024-001',
    date: '2024-01-05',
    type: 'call',
    customerId: 'C-001',
    customerName: '田中 太郎',
    customerCompany: '株式会社田中工務店',
    assignee: 'user-001',
    assigneeName: '営業太郎',
    duration: 15,
    outcome: 'in_progress',
  },
  {
    id: 'act-002',
    tenantId: 'demo-tenant',
    activityNo: 'ACT-2024-002',
    date: '2024-01-08',
    type: 'visit',
    customerId: 'C-001',
    customerName: '田中 太郎',
    customerCompany: '株式会社田中工務店',
    assignee: 'user-001',
    assigneeName: '営業太郎',
    duration: 90,
    outcome: 'in_progress',
  },
  {
    id: 'act-003',
    tenantId: 'demo-tenant',
    activityNo: 'ACT-2024-003',
    date: '2024-01-12',
    type: 'proposal',
    customerId: 'C-001',
    customerName: '田中 太郎',
    customerCompany: '株式会社田中工務店',
    assignee: 'user-001',
    assigneeName: '営業太郎',
    duration: 60,
    outcome: 'won',
  },
  {
    id: 'act-004',
    tenantId: 'demo-tenant',
    activityNo: 'ACT-2024-004',
    date: '2024-02-01',
    type: 'negotiation',
    customerId: 'C-002',
    customerName: '佐藤 花子',
    customerCompany: '佐藤建設株式会社',
    assignee: 'user-001',
    assigneeName: '営業太郎',
    duration: 120,
    outcome: 'won',
  },
  {
    id: 'act-005',
    tenantId: 'demo-tenant',
    activityNo: 'ACT-2024-005',
    date: '2024-03-15',
    type: 'proposal',
    customerId: 'C-010',
    customerName: '加藤 恵美',
    customerCompany: '加藤住建',
    assignee: 'user-001',
    assigneeName: '営業太郎',
    duration: 90,
    outcome: 'won',
  },
  {
    id: 'act-016',
    tenantId: 'demo-tenant',
    activityNo: 'ACT-2024-016',
    date: '2024-01-25',
    type: 'proposal',
    customerId: 'C-003',
    customerName: '鈴木 一郎',
    customerCompany: '鈴木住宅',
    assignee: 'user-002',
    assigneeName: '営業花子',
    duration: 70,
    outcome: 'won',
  },
  {
    id: 'act-021',
    tenantId: 'demo-tenant',
    activityNo: 'ACT-2024-021',
    date: '2024-02-20',
    type: 'negotiation',
    customerId: 'C-004',
    customerName: '高橋 美咲',
    customerCompany: '高橋リフォーム',
    assignee: 'user-002',
    assigneeName: '営業花子',
    duration: 110,
    outcome: 'won',
  },
  {
    id: 'act-026',
    tenantId: 'demo-tenant',
    activityNo: 'ACT-2024-026',
    date: '2024-04-01',
    type: 'proposal',
    customerId: 'C-011',
    customerName: '吉田 健',
    customerCompany: '吉田リノベーション',
    assignee: 'user-002',
    assigneeName: '営業花子',
    duration: 75,
    outcome: 'won',
  },
  {
    id: 'act-033',
    tenantId: 'demo-tenant',
    activityNo: 'ACT-2024-033',
    date: '2024-02-01',
    type: 'proposal',
    customerId: 'C-005',
    customerName: '伊藤 健二',
    customerCompany: '伊藤建築事務所',
    assignee: 'user-003',
    assigneeName: '営業次郎',
    duration: 65,
    outcome: 'won',
  },
  {
    id: 'act-036',
    tenantId: 'demo-tenant',
    activityNo: 'ACT-2024-036',
    date: '2024-03-12',
    type: 'negotiation',
    customerId: 'C-009',
    customerName: '小林 誠',
    customerCompany: '小林建材',
    assignee: 'user-003',
    assigneeName: '営業次郎',
    duration: 105,
    outcome: 'won',
  },
];

function calculateSummary(activities: SalesActivity[]): ActivitySummary {
  const totalActivities = activities.length;
  const completedActivities = activities.filter(
    (a) => a.outcome && a.outcome !== 'scheduled',
  ).length;
  const scheduledActivities = activities.filter(
    (a) => a.outcome === 'scheduled',
  ).length;
  const totalDuration = activities.reduce((sum, a) => sum + a.duration, 0);
  const averageDuration =
    totalActivities > 0 ? totalDuration / totalActivities : 0;
  const wonActivities = activities.filter((a) => a.outcome === 'won').length;
  const conversionRate =
    completedActivities > 0 ? (wonActivities / completedActivities) * 100 : 0;

  return {
    totalActivities,
    completedActivities,
    scheduledActivities,
    averageDuration,
    conversionRate,
    totalLeadTime: 15,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || 'demo-tenant';

    let filteredActivities = SAMPLE_ACTIVITIES.filter(
      (a) => a.tenantId === tenantId,
    );
    const summary = calculateSummary(filteredActivities);

    const responseData = {
      summary,
      filters: { tenantId },
      metadata: {
        totalRecords: filteredActivities.length,
        generatedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
