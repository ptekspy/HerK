import type { Metadata } from 'next';
import Link from 'next/link';

import { getOptionalSession, getPrimaryOrg } from '../lib/site-auth';

export const metadata: Metadata = {
  title: 'API Contract Testing for Pull Requests',
  description:
    'API Contract Guard stops breaking API changes before merge with GitHub-native PR checks, policy controls, and operational workflows.',
};

export default async function LandingPage() {
  const session = await getOptionalSession();
  const org = await getPrimaryOrg(session);
  const workspaceHref = org ? `/app/${org.id}/dashboard` : '/onboarding';

  return (
    <main className="marketing-main">
      <section className="page-wrap marketing-hero">
        <div className="marketing-hero-grid">
          <div>
            <span className="hero-kicker">API Integrity At Merge Time</span>
            <h1>Ship fast without shipping breaking contracts.</h1>
            <p>
              API Contract Guard turns OpenAPI contract verification into a merge gate. Connect GitHub,
              sync repositories, and block breaking API changes before production users notice.
            </p>
            <div className="marketing-cta-row">
              <Link className="btn btn-primary" href={session ? workspaceHref : '/onboarding'}>
                {session ? 'Open workspace' : 'Start free trial'}
              </Link>
              <Link className="btn btn-secondary" href="/pricing">
                Compare plans
              </Link>
            </div>
          </div>
          <aside className="hero-proof-card">
            <h2>Why API teams adopt API Contract Guard</h2>
            <ul>
              <li>
                <strong>Block PRs that remove or break API surface area.</strong>
                <p>Breaking changes are detected before merge and surfaced directly in checks.</p>
              </li>
              <li>
                <strong>Apply policy by org and service.</strong>
                <p>Set strict defaults, override by service, and manage exceptions through waivers.</p>
              </li>
              <li>
                <strong>Keep release stakeholders informed.</strong>
                <p>Get in-app notifications and optional PR failure emails with audit history.</p>
              </li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="page-wrap marketing-section how-it-works">
        <header>
          <h2>How it works</h2>
          <p>Go from GitHub install to enforceable contract gates in minutes.</p>
        </header>
        <div className="step-grid">
          <article>
            <span>01</span>
            <h3>Connect GitHub and install the app</h3>
            <p>Authorize API Contract Guard once and link repositories to your organization workspace.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Map services to contracts</h3>
            <p>Point each service at a repository contract file or public contract URL template.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Enforce checks on every PR</h3>
            <p>Review failures, apply waivers when justified, and ship only safe API changes.</p>
          </article>
        </div>
      </section>

      <section className="page-wrap marketing-section value-strip">
        <article>
          <h3>Problem</h3>
          <p>
            API regressions often slip through review because breaking changes are hard to spot from code
            diff alone.
          </p>
        </article>
        <article>
          <h3>Solution</h3>
          <p>
            API Contract Guard compares baseline and candidate contracts and returns actionable policy-based
            conclusions inside GitHub workflows.
          </p>
        </article>
      </section>

      <section className="page-wrap marketing-section social-proof">
        <header>
          <h2>Operational confidence at API scale</h2>
        </header>
        <div className="proof-grid">
          <article>
            <h3>PR checks</h3>
            <p>Automated contract validation tied to pull request lifecycle events.</p>
          </article>
          <article>
            <h3>Policy control</h3>
            <p>Consistent governance with explicit override and waiver mechanics.</p>
          </article>
          <article>
            <h3>Audit visibility</h3>
            <p>Notifications, outcomes, and decision trails available for teams and leadership.</p>
          </article>
        </div>
      </section>

      <section className="page-wrap marketing-section final-cta">
        <div>
          <h2>Protect every API merge before it ships.</h2>
          <p>Start with a 3-day trial, choose monthly or yearly billing, and onboard your first services.</p>
        </div>
        <div className="marketing-cta-row">
          <Link className="btn btn-primary" href={session ? workspaceHref : '/onboarding'}>
            {session ? 'Go to workspace' : 'Start free trial'}
          </Link>
          <Link className="btn btn-secondary" href="/help">
            Explore help center
          </Link>
        </div>
      </section>
    </main>
  );
}
