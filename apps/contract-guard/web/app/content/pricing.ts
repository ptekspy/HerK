export type PlanId = 'STARTER' | 'GROWTH' | 'ENTERPRISE';
export type BillingCycle = 'MONTHLY' | 'YEARLY';
export type RoadmapStatus = 'LIVE' | 'ROADMAP';

export interface PlanPackage {
  id: PlanId;
  name: string;
  tagline: string;
  description: string;
  price: Record<BillingCycle, string>;
  highlights: string[];
}

export interface PricingFeatureRow {
  key: string;
  feature: string;
  detail: string;
  status: RoadmapStatus;
  values: Record<PlanId, string>;
}

export const PLAN_PACKAGES: PlanPackage[] = [
  {
    id: 'STARTER',
    name: 'Starter',
    tagline: 'Small teams shipping their first protected APIs',
    description: 'Essential contract checks and policy control for teams with a focused API surface.',
    price: {
      MONTHLY: '$49/mo',
      YEARLY: '$490/yr',
    },
    highlights: [
      'Up to 3 monitored services',
      'GitHub App install and repository sync',
      'PR checks with in-app notifications',
    ],
  },
  {
    id: 'GROWTH',
    name: 'Growth',
    tagline: 'Scaling organizations with multiple API domains',
    description: 'Expanded service coverage, collaboration controls, and richer operational workflows.',
    price: {
      MONTHLY: '$199/mo',
      YEARLY: '$1,990/yr',
    },
    highlights: [
      'Up to 15 monitored services',
      'Advanced waiver and policy override workflows',
      'Team management with billing self-serve controls',
    ],
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    tagline: 'Large API platforms and compliance-heavy environments',
    description: 'Unlimited service scale with roadmap features designed for strict governance.',
    price: {
      MONTHLY: 'Contact sales',
      YEARLY: 'Contact sales',
    },
    highlights: [
      'Unlimited monitored services',
      'Priority onboarding and architecture guidance',
      'Enterprise security and governance roadmap',
    ],
  },
];

export const PRICING_FEATURE_ROWS: PricingFeatureRow[] = [
  {
    key: 'services_per_org',
    feature: 'Monitored services per organization',
    detail: 'Maximum number of active services protected by API Contract Guard checks.',
    status: 'LIVE',
    values: {
      STARTER: '3 services',
      GROWTH: '15 services',
      ENTERPRISE: 'Unlimited',
    },
  },
  {
    key: 'github_app',
    feature: 'GitHub App integration',
    detail: 'Install once and sync repositories into API Contract Guard.',
    status: 'LIVE',
    values: {
      STARTER: 'Included',
      GROWTH: 'Included',
      ENTERPRISE: 'Included',
    },
  },
  {
    key: 'pr_checks',
    feature: 'Pull request contract checks',
    detail: 'Automated OpenAPI diff checks on opened/synchronized PRs.',
    status: 'LIVE',
    values: {
      STARTER: 'Included',
      GROWTH: 'Included',
      ENTERPRISE: 'Included',
    },
  },
  {
    key: 'policy_controls',
    feature: 'Policy controls',
    detail: 'Org defaults and service-level policy overrides.',
    status: 'LIVE',
    values: {
      STARTER: 'Included',
      GROWTH: 'Included',
      ENTERPRISE: 'Included',
    },
  },
  {
    key: 'waivers',
    feature: 'Waivers and exception windows',
    detail: 'Time-bound waiver workflows for controlled releases.',
    status: 'LIVE',
    values: {
      STARTER: 'Included',
      GROWTH: 'Included',
      ENTERPRISE: 'Included',
    },
  },
  {
    key: 'in_app_notifications',
    feature: 'In-app notifications',
    detail: 'Activity feed for contract warnings, failures, and errors.',
    status: 'LIVE',
    values: {
      STARTER: 'Included',
      GROWTH: 'Included',
      ENTERPRISE: 'Included',
    },
  },
  {
    key: 'email_alerts',
    feature: 'PR failure email alerts',
    detail: 'Email notifications for failing/error check outcomes with org-level toggle.',
    status: 'LIVE',
    values: {
      STARTER: 'Included',
      GROWTH: 'Included',
      ENTERPRISE: 'Included',
    },
  },
  {
    key: 'team_collaboration',
    feature: 'Team collaboration',
    detail: 'Owner/Admin/Member/Viewer role-based access management.',
    status: 'LIVE',
    values: {
      STARTER: 'Included',
      GROWTH: 'Included',
      ENTERPRISE: 'Included',
    },
  },
  {
    key: 'billing_cadence',
    feature: 'Billing cadence',
    detail: 'Monthly and yearly billing options with yearly savings.',
    status: 'LIVE',
    values: {
      STARTER: 'Monthly + Yearly',
      GROWTH: 'Monthly + Yearly',
      ENTERPRISE: 'Monthly + Yearly',
    },
  },
  {
    key: 'sso_saml',
    feature: 'SSO / SAML',
    detail: 'Centralized identity integration and access lifecycle controls.',
    status: 'ROADMAP',
    values: {
      STARTER: 'Roadmap',
      GROWTH: 'Roadmap',
      ENTERPRISE: 'Planned priority',
    },
  },
  {
    key: 'audit_exports',
    feature: 'Advanced audit exports',
    detail: 'Structured exports for waivers, policies, and check history.',
    status: 'ROADMAP',
    values: {
      STARTER: 'Roadmap',
      GROWTH: 'Roadmap',
      ENTERPRISE: 'Planned priority',
    },
  },
  {
    key: 'sla_support',
    feature: 'SLA and support tiers',
    detail: 'Tiered support response commitments and escalation channels.',
    status: 'ROADMAP',
    values: {
      STARTER: 'Roadmap',
      GROWTH: 'Roadmap',
      ENTERPRISE: 'Planned priority',
    },
  },
];
