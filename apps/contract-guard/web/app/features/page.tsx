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
    <main className="marketing-main page-wrap">
      <section className="marketing-section">
        <h1>Feature set built for API outcomes</h1>
        <p>
          API Contract Guard focuses on one result: preventing production API breakages while keeping your
          pull request workflow fast.
        </p>
        <div className="feature-anchor-links">
          {FEATURE_SECTIONS.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              {section.title}
            </a>
          ))}
        </div>
      </section>

      <div className="feature-outcome-stack">
        {FEATURE_SECTIONS.map((section) => (
          <section key={section.id} className="marketing-section feature-outcome-block" id={section.id}>
            <div className="feature-outcome-copy">
              <span className="feature-icon" aria-hidden="true">
                {section.icon}
              </span>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
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

      <section className="marketing-section">
        <h2>What&apos;s next</h2>
        <ul className="legal-list">
          <li>OpenAPI enforcement today, with GraphQL and JSON Schema expansion in roadmap sequence.</li>
          <li>Enterprise identity and governance controls including SSO/SAML and expanded audit exports.</li>
          <li>Higher-assurance operational support tiers aligned to API-critical teams.</li>
        </ul>
      </section>
    </main>
  );
}

