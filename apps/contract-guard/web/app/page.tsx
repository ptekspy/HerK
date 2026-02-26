import type { Metadata } from 'next';
import Link from 'next/link';

import { MarketingVisualCard } from './components/marketing-visual-card';
import { SeoJsonLd } from './components/seo-json-ld';
import { getSiteOrigin } from './content/site';
import { getOptionalSession, getPrimaryOrg } from '../lib/site-auth';

export const metadata: Metadata = {
  title: 'Stop Breaking API Changes Before They Ship',
  description:
    'Prevent production API breakages with GitHub-native contract checks that detect and block breaking OpenAPI changes before merge.',
};

export default async function LandingPage() {
  const session = await getOptionalSession();
  const org = await getPrimaryOrg(session);
  const workspaceHref = org ? `/app/${org.id}/dashboard` : '/onboarding';
  const ctaHref = session ? workspaceHref : '/onboarding';
  const siteOrigin = getSiteOrigin();

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'API Contract Guard',
    url: siteOrigin,
    logo: `${siteOrigin}/logo-square.png`,
  };

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'API Contract Guard',
    description:
      'GitHub-native API contract protection that detects and blocks breaking OpenAPI changes at merge time.',
    brand: {
      '@type': 'Brand',
      name: 'API Contract Guard',
    },
    category: 'DeveloperTools',
    offers: [
      {
        '@type': 'Offer',
        name: 'Starter',
        priceCurrency: 'USD',
        price: '49',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'Growth',
        priceCurrency: 'USD',
        price: '199',
        availability: 'https://schema.org/InStock',
      },
    ],
  };

  return (
    <main className="marketing-main">
      <SeoJsonLd data={organizationJsonLd} />
      <SeoJsonLd data={productJsonLd} />

      <section className="page-wrap marketing-hero">
        <div className="marketing-hero-grid">
          <div>
            <span className="hero-kicker">Merge-Time API Protection</span>
            <h1>Stop Breaking API Changes Before They Ship.</h1>
            <p>
              API Contract Guard integrates with GitHub to automatically detect and block breaking OpenAPI
              changes at merge time.
            </p>
            <div className="marketing-cta-row">
              <Link className="btn btn-primary" href={ctaHref}>
                {session ? 'Open workspace' : 'Start free trial'}
              </Link>
              <a className="btn btn-secondary" href="#how-it-works">
                See how it works
              </a>
            </div>
            <p className="hero-trust-line">GitHub-native • OpenAPI-first • No code changes required</p>
            <div className="trust-badge-row">
              <span>Secure GitHub OAuth</span>
              <span>No code changes required</span>
              <span>Data stored securely</span>
            </div>
          </div>

          <MarketingVisualCard
            alt="Pull request check showing a blocked breaking API change"
            annotations={['Breaking change detected', 'Rule applied', 'PR blocked']}
            description="Contract changes are classified and enforced directly in the pull request before merge."
            height={980}
            src="/marketing/pr-check-placeholder.svg"
            title="GitHub PR check with actionable failure context"
            width={1600}
          />
        </div>
      </section>

      <section className="page-wrap marketing-section trust-strip">
        <header>
          <h2>Trusted by API-first teams</h2>
          <p>Built for teams that ship frequently and need confidence in every merge.</p>
        </header>
        <div className="proof-grid">
          <article>
            <h3>Early adopter insight</h3>
            <p>
              &quot;We caught three breaking changes in week one and avoided a customer-facing release
              incident.&quot;
            </p>
          </article>
          <article>
            <h3>Merge-time enforcement</h3>
            <p>Policy-backed PR checks prevent accidental API regressions before they leave GitHub.</p>
          </article>
          <article>
            <h3>Audit-ready decisions</h3>
            <p>Track failures, waivers, and policy outcomes with a clear operational history.</p>
          </article>
        </div>
      </section>

      <section id="how-it-works" className="page-wrap marketing-section how-it-works">
        <header>
          <h2>How it works</h2>
          <p>Go from install to enforced API safety in minutes.</p>
        </header>
        <div className="step-grid">
          <article>
            <span>01</span>
            <h3>Connect GitHub and install the app</h3>
            <p>Authorize once and connect the repositories you want protected.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Define policy defaults and service overrides</h3>
            <p>Set org-level guardrails and tune strictness per service as teams mature.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Block breaking changes automatically in PR</h3>
            <p>Contract diffs run in pull requests and enforce release safety before merge.</p>
          </article>
        </div>
      </section>

      <section className="page-wrap marketing-section audience-strip">
        <header>
          <h2>Built for API-first engineering teams</h2>
          <p>Adopt contract safety without changing your delivery workflow.</p>
        </header>
        <div className="audience-grid">
          <article>Platform teams standardizing API quality across services.</article>
          <article>Backend teams preventing accidental breaking contract changes.</article>
          <article>DevOps teams enforcing policy in CI with clear merge gates.</article>
          <article>API product companies protecting partner and customer integrations.</article>
        </div>
        <p className="mt-3">
          Jump to detailed capabilities:
          <span className="feature-jump-links">
            <a href="/features#automated-contract-diffing">Automated Contract Diffing</a>
            <a href="/features#policy-engine">Policy Engine</a>
            <a href="/features#waivers-expirations">Waivers</a>
          </span>
        </p>
      </section>

      <section className="page-wrap marketing-section">
        <header>
          <h2>Product workflow visuals</h2>
          <p>Understand how checks, policy editing, and operations work together.</p>
        </header>
        <div className="visual-grid">
          <MarketingVisualCard
            alt="Policy editor showing enabled breaking change rules"
            description="Define enforcement rules and service-level exceptions without changing developer workflow."
            height={980}
            src="/marketing/policy-editor-placeholder.svg"
            title="Policy Engine controls"
            width={1600}
          />
          <MarketingVisualCard
            alt="Dashboard showing setup status, checks, and attention items"
            description="Track setup progress, recent checks, and risk signals in one operations-focused dashboard."
            height={980}
            src="/marketing/dashboard-placeholder.svg"
            title="Operational dashboard overview"
            width={1600}
          />
        </div>
      </section>

      <section className="page-wrap marketing-section final-cta">
        <div>
          <h2>Prevent production API breakages before merge.</h2>
          <p>Start your 3-day trial, choose monthly or yearly billing, and onboard your first repositories.</p>
        </div>
        <div className="marketing-cta-row">
          <Link className="btn btn-primary" href={ctaHref}>
            {session ? 'Go to workspace' : 'Start free trial'}
          </Link>
          <Link className="btn btn-secondary" href="/pricing">
            Compare pricing
          </Link>
        </div>
      </section>
    </main>
  );
}

