import type { Metadata } from 'next';

import { MarketingVisualCard } from '../components/marketing-visual-card';

export const metadata: Metadata = {
  title: 'Features That Prevent API Breakages',
  description:
    'Explore GitHub-native contract diffing, policy enforcement, waivers, notifications, and historical check visibility.',
};

const FEATURE_SECTIONS = [
  {
    id: 'automated-contract-diffing',
    icon: 'Δ',
    title: 'Automated Contract Diffing',
    body: 'Detect removed fields, type changes, enum narrowing, and required field additions automatically on every pull request.',
    visual: '/marketing/pr-check-placeholder.svg',
  },
  {
    id: 'github-pr-integration',
    icon: 'GH',
    title: 'GitHub PR Integration',
    body: 'Run contract checks where teams already work and publish pass/fail outcomes directly to pull request status checks.',
    visual: '/marketing/pr-check-placeholder.svg',
  },
  {
    id: 'policy-engine',
    icon: 'PE',
    title: 'Policy Engine',
    body: 'Define org-wide merge rules for breaking changes and keep policy logic reviewable and explicit.',
    visual: '/marketing/policy-editor-placeholder.svg',
  },
  {
    id: 'service-overrides',
    icon: 'SV',
    title: 'Service-Level Overrides',
    body: 'Adjust strictness per service without losing central policy control across your organization.',
    visual: '/marketing/policy-editor-placeholder.svg',
  },
  {
    id: 'waivers-expirations',
    icon: 'WX',
    title: 'Waivers and Expirations',
    body: 'Grant temporary exceptions with expiration windows and rationale, then return to enforced policy automatically.',
    visual: '/marketing/dashboard-placeholder.svg',
  },
  {
    id: 'notifications',
    icon: 'NT',
    title: 'Notifications',
    body: 'Keep teams informed through in-app notifications and optional PR failure email alerts with org-level controls.',
    visual: '/marketing/dashboard-placeholder.svg',
  },
  {
    id: 'historical-check-log',
    icon: 'HL',
    title: 'Historical Check Log',
    body: 'Review previous check outcomes, conclusions, and remediation history for release reliability and audit readiness.',
    visual: '/marketing/dashboard-placeholder.svg',
  },
] as const;

export default function FeaturesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 pb-14 pt-10 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Feature set built for API outcomes</h1>
        <p className="text-sm text-muted-foreground">
          API Contract Guard focuses on one result: preventing production API breakages while keeping your
          pull request workflow fast.
        </p>
        <div className="flex flex-wrap gap-2">
          {FEATURE_SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {section.title}
            </a>
          ))}
        </div>
      </section>

      <div className="space-y-6">
        {FEATURE_SECTIONS.map((section) => (
          <section key={section.id} className="grid gap-4 rounded-xl border border-border/70 bg-card p-5 lg:grid-cols-2" id={section.id}>
            <div className="space-y-2">
              <span className="inline-flex rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                {section.icon}
              </span>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">{section.title}</h2>
              <p className="text-sm text-muted-foreground">{section.body}</p>
            </div>
            <MarketingVisualCard
              alt={`${section.title} placeholder visual`}
              description="Placeholder visual. Replace with final product screenshot in the design handoff pass."
              height={980}
              src={section.visual}
              title={section.title}
              width={1600}
            />
          </section>
        ))}
      </div>

      <section className="space-y-2 rounded-xl border border-border/70 bg-card p-5">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">What&apos;s next</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>OpenAPI enforcement today, with GraphQL and JSON Schema expansion in roadmap sequence.</li>
          <li>Enterprise identity and governance controls including SSO/SAML and expanded audit exports.</li>
          <li>Higher-assurance operational support tiers aligned to API-critical teams.</li>
        </ul>
      </section>
    </main>
  );
}
