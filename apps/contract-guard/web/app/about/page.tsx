import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn why API Contract Guard exists, the API reliability principles behind it, and how the product is evolving.',
};

export default function AboutPage() {
  return (
    <main className="marketing-main page-wrap legal-wrap">
      <section className="marketing-section">
        <h1>About API Contract Guard</h1>
        <p>
          API Contract Guard was built for engineering teams that move quickly and still need confidence in
          public and internal API stability.
        </p>
      </section>

      <section className="marketing-section">
        <h2>Mission</h2>
        <p>
          Give API teams a practical way to prevent breaking changes during pull requests, not after
          incidents.
        </p>
      </section>

      <section className="marketing-section">
        <h2>Product philosophy</h2>
        <ul className="legal-list">
          <li>Policy should be explicit, reviewable, and versioned with your engineering workflow.</li>
          <li>Guardrails should be enforceable without blocking legitimate migration paths.</li>
          <li>Signals should appear where teams already operate: pull requests, dashboards, and alerts.</li>
        </ul>
      </section>

      <section className="marketing-section timeline">
        <h2>Roadmap narrative</h2>
        <article>
          <h3>Phase 1: Merge-time protection</h3>
          <p>GitHub App onboarding, repository sync, service mapping, policy checks, and waiver controls.</p>
        </article>
        <article>
          <h3>Phase 2: Operational maturity</h3>
          <p>Billing integration, email notifications, and auditable workflow history for cross-team use.</p>
        </article>
        <article>
          <h3>Phase 3: Enterprise governance</h3>
          <p>Roadmap focus on SSO/SAML, deeper audit exports, and service-level support commitments.</p>
        </article>
      </section>
    </main>
  );
}
