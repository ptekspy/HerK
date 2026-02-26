export type DashboardWizardStepId =
  | 'github_installation_connected'
  | 'repositories_synced'
  | 'first_service_created'
  | 'policy_reviewed'
  | 'notifications_reviewed'
  | 'first_check_received'
  | 'teammate_invited';

export type DashboardWizardStepStatus = 'completed' | 'pending' | 'warning';

export interface DashboardWizardStep {
  id: DashboardWizardStepId;
  label: string;
  description: string;
  required: boolean;
  status: DashboardWizardStepStatus;
  completed: boolean;
  actionLabel?: string;
  actionHref?: string;
  note?: string;
}

export interface DashboardWizardSummary {
  isDismissed: boolean;
  isComplete: boolean;
  completedAt: string | null;
  dismissedAt: string | null;
  requiredCompleted: number;
  requiredTotal: number;
  steps: DashboardWizardStep[];
}

export interface DashboardMetrics {
  repositories: number;
  services: number;
  members: number;
  checksTotal: number;
  checksLast7Days: number;
  failingChecksLast7Days: number;
  unreadNotifications: number;
}

export interface DashboardRecentCheck {
  id: string;
  conclusion: string | null;
  createdAt: string;
  serviceName: string;
  repositoryFullName: string;
  pullRequestNumber: number;
}

export interface DashboardRecentNotification {
  id: string;
  kind: string;
  title: string;
  readAt: string | null;
  createdAt: string;
}

export interface DashboardAttentionItem {
  key: string;
  level: 'warn' | 'error';
  title: string;
  message: string;
  href?: string;
}

export interface DashboardSummary {
  org: {
    id: string;
    name: string;
    billingPlan: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  };
  billing: {
    status: string | null;
    serviceCount: number;
    serviceLimit: number | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  };
  metrics: DashboardMetrics;
  wizard: DashboardWizardSummary;
  recentChecks: DashboardRecentCheck[];
  recentNotifications: DashboardRecentNotification[];
  attention: DashboardAttentionItem[];
}
