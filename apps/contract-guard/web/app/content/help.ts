export interface HelpChecklistItem {
  title: string;
  body: string;
}

export interface HelpFaqItem {
  id: string;
  question: string;
  answer: string;
}

export const HELP_GETTING_STARTED: HelpChecklistItem[] = [
  {
    title: 'Connect your GitHub account',
    body: 'Start onboarding and authorize API Contract Guard to create your secure workspace session.',
  },
  {
    title: 'Install the API Contract Guard GitHub App',
    body: 'Approve installation for your organization to allow repository discovery and pull request checks.',
  },
  {
    title: 'Choose a plan and start your trial',
    body: 'Select a monthly or yearly package, complete Stripe checkout, then return to your workspace.',
  },
  {
    title: 'Map repositories and services',
    body: 'Sync repositories, then create services and point each service at the correct contract source.',
  },
];

export const HELP_FAQ: HelpFaqItem[] = [
  {
    id: 'github-callback',
    question: 'GitHub connect or app install callback fails. What should I check first?',
    answer:
      'Verify your OAuth callback and GitHub App setup URLs both point to the API Contract Guard auth endpoints on the same domain you are using in the browser. Also confirm state parameters are preserved during redirects.',
  },
  {
    id: 'missing-repositories',
    question: 'My repositories do not appear after installation.',
    answer:
      'Use the repository refresh action after installation permission changes. Confirm the app has repository access in GitHub and that the installation is linked to the expected organization.',
  },
  {
    id: 'create-service-failed',
    question: 'Create Service returns a fetch or request error.',
    answer:
      'Check that your current org has an active or trialing subscription, the selected repository exists, and API/web are using the same public origin. Then inspect API logs for validation errors.',
  },
  {
    id: 'billing-status',
    question: 'Billing status does not match my Stripe action.',
    answer:
      'Confirm Stripe webhook delivery to API Contract Guard is healthy and webhook signing secret is correct. Subscription updates are applied from checkout and subscription webhook events.',
  },
];
