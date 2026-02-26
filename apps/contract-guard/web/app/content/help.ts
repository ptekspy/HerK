export type HelpCategory =
  | 'getting-started'
  | 'policies'
  | 'troubleshooting'
  | 'billing'
  | 'integrations';

export interface HelpCategoryConfig {
  id: HelpCategory;
  title: string;
  description: string;
}

export interface HelpChecklistItem {
  id: string;
  title: string;
  body: string;
}

export interface HelpFaqItem {
  id: string;
  category: HelpCategory;
  question: string;
  answer: string;
}

export const HELP_CATEGORIES: HelpCategoryConfig[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Core onboarding and setup sequence to go live quickly.',
  },
  {
    id: 'policies',
    title: 'Policies',
    description: 'How to configure policy defaults, overrides, and waivers.',
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    description: 'Known errors and recovery steps for common setup issues.',
  },
  {
    id: 'billing',
    title: 'Billing',
    description: 'Trial, checkout, and subscription lifecycle guidance.',
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'GitHub app, repository sync, and callback behavior.',
  },
];

export const HELP_GETTING_STARTED: HelpChecklistItem[] = [
  {
    id: 'connect-github',
    title: 'Connect your GitHub account',
    body: 'Start onboarding and authorize API Contract Guard to create your secure workspace session.',
  },
  {
    id: 'install-github-app',
    title: 'Install the API Contract Guard GitHub App',
    body: 'Approve installation for your organization to allow repository discovery and pull request checks.',
  },
  {
    id: 'choose-plan',
    title: 'Choose a plan and start your trial',
    body: 'Select a monthly or yearly package, complete Stripe checkout, then return to your workspace.',
  },
  {
    id: 'map-services',
    title: 'Map repositories and services',
    body: 'Sync repositories, then create services and point each service at the correct contract source.',
  },
];

export const HELP_FAQ: HelpFaqItem[] = [
  {
    id: 'first-policy',
    category: 'policies',
    question: 'What should our first policy enforce?',
    answer:
      'Start by blocking removed endpoints and required-field additions at the organization level, then add service-level overrides where migration windows are needed.',
  },
  {
    id: 'waivers-expiration',
    category: 'policies',
    question: 'When should we use waivers instead of overrides?',
    answer:
      'Use waivers for temporary exceptions tied to a specific check failure and expiration date. Use overrides when a service needs an intentional long-running policy difference.',
  },
  {
    id: 'github-callback',
    category: 'integrations',
    question: 'GitHub connect or app install callback fails. What should I check first?',
    answer:
      'Verify your OAuth callback and GitHub App setup URLs both point to the same public domain and auth endpoints. Also confirm state parameters are preserved through all redirects.',
  },
  {
    id: 'missing-repositories',
    category: 'integrations',
    question: 'My repositories do not appear after installation.',
    answer:
      'Use the repository refresh action after installation permission changes. Confirm app repository permissions in GitHub and that the installation is linked to the expected organization.',
  },
  {
    id: 'create-service-failed',
    category: 'troubleshooting',
    question: 'Create Service returns a fetch or request error.',
    answer:
      'Confirm your org is trialing/active, check selected repository availability, and ensure API/web share the same public origin. Then inspect API logs for validation details.',
  },
  {
    id: 'checks-not-running',
    category: 'troubleshooting',
    question: 'Why are pull request checks not running?',
    answer:
      'Check that the repository is mapped to a service, GitHub app webhook delivery is healthy, and contract path settings resolve correctly in the repository branch being tested.',
  },
  {
    id: 'billing-status',
    category: 'billing',
    question: 'Billing status does not match my Stripe action.',
    answer:
      'Confirm Stripe webhook delivery and signing secret validity. Subscription state is updated by checkout and webhook events, so webhook failures can leave stale plan status.',
  },
  {
    id: 'enterprise-contact',
    category: 'billing',
    question: 'How do we move to an enterprise agreement?',
    answer:
      'Use the Contact Sales path on pricing for enterprise onboarding, procurement, and support/SLA discussions.',
  },
  {
    id: 'integration-scope',
    category: 'getting-started',
    question: 'Can we onboard gradually by team or repository?',
    answer:
      'Yes. Start with a subset of repositories, map core services first, and expand policy coverage as teams adopt PR checks and waiver workflows.',
  },
];

