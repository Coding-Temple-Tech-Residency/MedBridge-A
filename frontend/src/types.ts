export type View = 'login' | 'landing' | 'upload' | 'results';

export type MetricStatus = 'normal' | 'elevated' | 'low';

export type Priority = 'high' | 'medium' | 'low';

export interface HealthMetric {
  name: string;
  shortName: string;
  value: number;
  normalMin: number;
  normalMax: number;
  unit: string;
  status: MetricStatus;
  description: string;
}

export interface ExplanationSection {
  title: string;
  icon: string;
  finding: string;
  detail: string;
  status: MetricStatus;
}

export interface HealthCategory {
  category: string;
  score: number;
  fullMark: number;
}

export interface ActionableStep {
  priority: Priority;
  title: string;
  description: string;
  timeframe: string;
  icon: string;
}

export interface AnalysisResult {
  reportType: string;
  date: string;
  overallStatus: 'normal' | 'mostly-normal' | 'attention-needed';
  overallMessage: string;
  explanation: {
    summary: string;
    sections: ExplanationSection[];
  };
  metrics: HealthMetric[];
  healthCategories: HealthCategory[];
  steps: ActionableStep[];
}
