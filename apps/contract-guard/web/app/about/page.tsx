import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About API Contract Guard',
  description:
    'Our mission is to make API releases predictable and safe with merge-time contract protection built for engineering teams.',
};

export default function AboutPage() {
  return (
    <main className="marketing-main page-wrap legal-wrap">
      <section className="marketing-section">
        <h1>About API Contract Guard</h1>
        <p>
          We built API Contract Guard to make API releases predictable for teams shipping fast across multiple
          services.
        </p>
      </section>

      <section className="marketing-section">
        <h2>Mission</h2>
        <p>Our mission is to make API releases predictable and safe.</p>
      </section>

      <section className="marketing-section">
        <h2>Why this exists</h2>
        <div className="timeline">
          <article>
            <h3>APIs break silently</h3>
            <p>Field removals and required field additions often look harmless in normal code review.</p>
          </article>
          <article>
            <h3>Outages follow quickly</h3>
            <p>Downstream consumers fail, rollback pressure spikes, and release confidence collapses.</p>
          </article>
          <article>
            <h3>Manual controls do not scale</h3>
            <p>Tribal knowledge and ad-hoc QA cannot enforce contract safety at modern shipping velocity.</p>
          </article>
          <article>
            <h3>So we enforce safety in pull requests</h3>
            <p>
              API Contract Guard places contract policy at merge time, where teams can fix issues before
              production impact.
            </p>
          </article>
        </div>
      </section>

      <section className="marketing-section">
        <h2>Team</h2>
        <div className="team-card-grid">
          <article>
            <h3>Founder (Placeholder)</h3>
            <p>API platform engineering background focused on reliability and release governance.</p>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">
              LinkedIn profile
            </a>
          </article>
          <article>
            <h3>Engineering Lead (Placeholder)</h3>
            <p>Builds CI-native workflows for policy enforcement and developer-friendly remediation loops.</p>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">
              LinkedIn profile
            </a>
          </article>
          <article>
            <h3>Product/Platform (Placeholder)</h3>
            <p>Translates enterprise API governance requirements into practical product workflows.</p>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">
              LinkedIn profile
            </a>
          </article>
        </div>
      </section>

      <section className="marketing-section timeline">
        <h2>Roadmap direction</h2>
        <article>
          <h3>Now: OpenAPI merge protection</h3>
          <p>GitHub app onboarding, repository sync, service mapping, policy checks, and waiver controls.</p>
        </article>
        <article>
          <h3>Next: GraphQL and JSON Schema support</h3>
          <p>Extend coverage to broader API contract formats while preserving the same policy workflow.</p>
        </article>
        <article>
          <h3>Then: Enterprise governance controls</h3>
          <p>Expand identity, audit export, and support capabilities for compliance-driven API organizations.</p>
        </article>
      </section>
    </main>
  );
}

