export type PlanId = 'STARTER' | 'GROWTH' | 'ENTERPRISE';
export type BillingCycle = 'MONTHLY' | 'YEARLY';
export type RoadmapStatus = 'LIVE' | 'ROADMAP';
export type PlanCtaMode = 'TRIAL' | 'CONTACT_SALES';

export interface PlanPackage {
  id: PlanId;
  name: string;
  tagline: string;
  audienceLabel: string;
  description: string;
  ctaMode: PlanCtaMode;
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
    tagline: 'For teams shipping their first protected APIs',
    audienceLabel: 'Best for individual developers and small teams.',
    description: 'Essential merge-time checks and policy controls for focused API surfaces.',
    ctaMode: 'TRIAL',
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
    tagline: 'For scaling API platforms and shared service ownership',
    audienceLabel: 'Best for scaling teams managing 3-15 services.',
    description: 'Expanded coverage, collaboration controls, and stronger release governance.',
    ctaMode: 'TRIAL',
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
    tagline: 'For large API organizations with compliance and SLA needs',
    audienceLabel: 'Best for 15+ services with procurement and SLA requirements.',
    description: 'Unlimited scale, governance roadmap controls, and enterprise onboarding support.',
    ctaMode: 'CONTACT_SALES',
    price: {
      MONTHLY: 'Contact sales',
      YEARLY: 'Contact sales',
    },
    highlights: [
      'Unlimited monitored services',
      'Priority onboarding and architecture guidance',
      'Enterprise support and governance roadmap',
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
      STARTER: '3',
      GROWTH: '15',
      ENTERPRISE: 'Unlimited',
    },
  },
  {
    key: 'github_app',
    feature: 'GitHub App integration',
    detail: 'Install once and sync repositories into API Contract Guard.',
    status: 'LIVE',
    values: {
      STARTER: '✓',
      GROWTH: '✓',
      ENTERPRISE: '✓',
    },
  },
  {
    key: 'pr_checks',
    feature: 'Pull request contract checks',
    detail: 'Automated OpenAPI diff checks on opened and synchronized pull requests.',
    status: 'LIVE',
    values: {
      STARTER: '✓',
      GROWTH: '✓',
      ENTERPRISE: '✓',
    },
  },
  {
    key: 'policy_controls',
    feature: 'Policy controls',
    detail: 'Org defaults with service-level policy overrides.',
    status: 'LIVE',
    values: {
      STARTER: '✓',
      GROWTH: '✓',
      ENTERPRISE: '✓',
    },
  },
  {
    key: 'waivers',
    feature: 'Waivers and expirations',
    detail: 'Time-bound exception workflows with rationale tracking.',
    status: 'LIVE',
    values: {
      STARTER: '✓',
      GROWTH: '✓',
      ENTERPRISE: '✓',
    },
  },
  {
    key: 'in_app_notifications',
    feature: 'In-app notifications',
    detail: 'Activity feed for failures, warnings, and operational updates.',
    status: 'LIVE',
    values: {
      STARTER: '✓',
      GROWTH: '✓',
      ENTERPRISE: '✓',
    },
  },
  {
    key: 'email_alerts',
    feature: 'PR failure email alerts',
    detail: 'Email notifications for failing or error check outcomes with org-level toggle.',
    status: 'LIVE',
    values: {
      STARTER: '✓',
      GROWTH: '✓',
      ENTERPRISE: '✓',
    },
  },
  {
    key: 'team_collaboration',
    feature: 'Team collaboration',
    detail: 'Role-based access with Owner/Admin/Member/Viewer controls.',
    status: 'LIVE',
    values: {
      STARTER: '✓',
      GROWTH: '✓',
      ENTERPRISE: '✓',
    },
  },
  {
    key: 'billing_cadence',
    feature: 'Billing cadence',
    detail: 'Monthly and yearly options with yearly savings.',
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
    detail: 'Centralized identity integration and lifecycle controls.',
    status: 'ROADMAP',
    values: {
      STARTER: 'Roadmap',
      GROWTH: 'Roadmap',
      ENTERPRISE: 'Priority roadmap',
    },
  },
  {
    key: 'audit_exports',
    feature: 'Advanced audit exports',
    detail: 'Structured exports for policies, waivers, and check histories.',
    status: 'ROADMAP',
    values: {
      STARTER: 'Roadmap',
      GROWTH: 'Roadmap',
      ENTERPRISE: 'Priority roadmap',
    },
  },
  {
    key: 'sla_support',
    feature: 'SLA and support tiers',
    detail: 'Tiered response commitments and escalation channels.',
    status: 'ROADMAP',
    values: {
      STARTER: 'Roadmap',
      GROWTH: 'Roadmap',
      ENTERPRISE: 'Priority roadmap',
    },
  },
];

