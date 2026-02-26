import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features',
  description:
    'Explore API Contract Guard capabilities across GitHub integration, policy enforcement, notifications, and billing workflows.',
};

export default function FeaturesPage() {
  return (
    <main className="marketing-main page-wrap">
      <section className="marketing-section">
        <h1>Features</h1>
        <p>
          API Contract Guard focuses on the API contract workflow that matters most: protecting merge quality
          without slowing down delivery.
        </p>
      </section>

      <section className="feature-grid">
        <article>
          <h2>GitHub App installation and repository sync</h2>
          <p>Install once, connect organizations, and continuously sync repositories into your workspace.</p>
        </article>
        <article>
          <h2>PR contract checks</h2>
          <p>
            Trigger OpenAPI contract checks on pull request events and publish conclusions directly back to
            GitHub.
          </p>
        </article>
        <article>
          <h2>Policy overrides and waivers</h2>
          <p>Define organization defaults, refine by service, and grant time-bound exceptions with reasons.</p>
        </article>
        <article>
          <h2>Notifications</h2>
          <p>Track outcomes in-app and optionally email teams when critical PR failures or errors occur.</p>
        </article>
        <article>
          <h2>Team roles and collaboration</h2>
          <p>Manage access with role-based controls for owners, admins, members, and viewers.</p>
        </article>
        <article>
          <h2>Billing and subscription management</h2>
          <p>Start trials with Stripe checkout and manage plan lifecycle from the customer portal.</p>
        </article>
      </section>

      <section className="marketing-section">
        <h2>What&apos;s next</h2>
        <ul className="legal-list">
          <li>SSO/SAML identity integration for enterprise access management.</li>
          <li>Advanced audit exports for compliance and leadership reporting.</li>
          <li>Tiered SLA and support workflows for critical API programs.</li>
        </ul>
      </section>
    </main>
  );
}
