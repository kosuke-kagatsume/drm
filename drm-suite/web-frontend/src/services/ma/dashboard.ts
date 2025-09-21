import { MaDashboard } from '@/types/ma';

export async function getMaDashboard(): Promise<MaDashboard> {
  // Mock data for MA dashboard
  return {
    totalLeads: 3240,
    conversionRate: 3.9,
    activeJourneys: 5,
    monthlyROI: 425,
    leadGrowth: 15.2,
    conversionGrowth: 23.1,
    journeyStats: {
      total: 5,
      active: 3,
      paused: 1,
      completed: 1
    },
    channelPerformance: [
      {
        channel: 'Web広告',
        leads: 1450,
        conversions: 203,
        cost: 850000,
        roi: 420
      },
      {
        channel: 'SEO',
        leads: 892,
        conversions: 156,
        cost: 320000,
        roi: 680
      },
      {
        channel: 'メール',
        leads: 567,
        conversions: 78,
        cost: 210000,
        roi: 520
      },
      {
        channel: 'SNS',
        leads: 331,
        conversions: 19,
        cost: 120000,
        roi: 180
      }
    ]
  };
}