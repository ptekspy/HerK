export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export type BillingPlan = 'STARTER' | 'GROWTH' | 'ENTERPRISE';

export type ContractSourceType = 'GITHUB_FILE' | 'PUBLIC_URL';

export type PolicySeverity = 'OFF' | 'WARN' | 'BLOCK';

export type CheckRunStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export type CheckConclusion = 'PASS' | 'WARN' | 'FAIL' | 'ERROR';

export type DiffIssueSeverity = 'INFO' | 'WARN' | 'BREAKING';

export interface Org {
  id: string;
  name: string;
  slug: string;
  billingPlan: BillingPlan;
  createdAt: string;
  updatedAt: string;
}

export interface Repository {
  id: string;
  orgId: string;
  owner: string;
  name: string;
  fullName: string;
  defaultBranch: string;
  githubInstallationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  orgId: string;
  repositoryId: string;
  name: string;
  slug: string;
  contractSourceType: ContractSourceType;
  contractPath: string | null;
  contractUrlTemplate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Policy {
  id: string;
  orgId: string;
  serviceId: string | null;
  failOnBreaking: boolean;
  ruleOverrides: Record<string, PolicySeverity>;
  updatedAt: string;
}

export interface Waiver {
  id: string;
  orgId: string;
  serviceId: string | null;
  repositoryId: string | null;
  pullRequestNumber: number | null;
  reason: string;
  expiresAt: string;
  createdByUserId: string;
  createdAt: string;
}

export interface DiffIssue {
  id: string;
  checkRunId: string;
  ruleCode: string;
  title: string;
  path: string | null;
  beforeValue: string | null;
  afterValue: string | null;
  severity: DiffIssueSeverity;
  isBreaking: boolean;
  isWaived: boolean;
  createdAt: string;
}

export interface CheckRun {
  id: string;
  orgId: string;
  repositoryId: string;
  serviceId: string;
  pullRequestNumber: number;
  pullRequestHeadSha: string;
  status: CheckRunStatus;
  conclusion: CheckConclusion | null;
  summary: string | null;
  githubCheckRunId: string | null;
  githubCommentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  orgId: string;
  userId: string | null;
  kind: string;
  title: string;
  body: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface BillingSummary {
  orgId: string;
  plan: BillingPlan;
  serviceLimit: number | null;
  serviceCount: number;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  status: string | null;
  currentPeriodEnd: string | null;
}

export type DashboardWizardStepId =
  | 'github_installation_connected'
  | 'repositories_synced'
  | 'first_service_created'
  | 'policy_reviewed'
  | 'notifications_reviewed'
  | 'first_check_received'
  | 'teammate_invited';

export type DashboardWizardAcknowledgedStepId =
  | 'policy_reviewed'
  | 'notifications_reviewed';

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

export interface DashboardWizardStateSummary {
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
  conclusion: CheckConclusion | null;
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
    billingPlan: BillingPlan;
  };
  billing: {
    status: string | null;
    serviceCount: number;
    serviceLimit: number | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  };
  metrics: DashboardMetrics;
  wizard: DashboardWizardStateSummary;
  recentChecks: DashboardRecentCheck[];
  recentNotifications: DashboardRecentNotification[];
  attention: DashboardAttentionItem[];
}

export interface UpdateDashboardWizardStateRequest {
  dismissed?: boolean;
  markSeen?: boolean;
  acknowledgeStepId?: DashboardWizardAcknowledgedStepId;
  clearAcknowledgeStepId?: DashboardWizardAcknowledgedStepId;
}

export interface PrAnalysisJobPayload {
  orgId: string;
  repositoryId: string;
  serviceId: string;
  checkRunId: string;
  pullRequestNumber: number;
  headSha: string;
  baseSha: string;
  githubInstallationId: number;
  repositoryOwner: string;
  repositoryName: string;
  defaultBranch: string;
}

export interface OrgEmailNotificationJobPayload {
  orgId: string;
  kind: string;
  title: string;
  body: string;
  link?: string | null;
}
