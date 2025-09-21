export interface MaDashboard {
  totalLeads: number;
  conversionRate: number;
  activeJourneys: number;
  monthlyROI: number;
  leadGrowth: number;
  conversionGrowth: number;
  journeyStats: JourneyStats;
  channelPerformance: ChannelPerformance[];
}

export interface JourneyStats {
  total: number;
  active: number;
  paused: number;
  completed: number;
}

export interface ChannelPerformance {
  channel: string;
  leads: number;
  conversions: number;
  cost: number;
  roi: number;
}

export interface MAJourney {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  contacts: number;
  conversionRate: number;
  steps: number;
  avgDays: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MAActivity {
  id: string;
  type: 'conversion' | 'lead' | 'email' | 'journey' | 'alert';
  message: string;
  value: string;
  timestamp: Date;
}