import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@herk/ui/base/button';

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
    <main className="space-y-12 pb-16 pt-10">
      <SeoJsonLd data={organizationJsonLd} />
      <SeoJsonLd data={productJsonLd} />

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="space-y-4">
          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Merge-Time API Protection
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Stop Breaking API Changes Before They Ship.
          </h1>
          <p className="text-base text-muted-foreground">
            API Contract Guard integrates with GitHub to automatically detect and block breaking OpenAPI
            changes at merge time.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href={ctaHref}>{session ? 'Open workspace' : 'Start free trial'}</Link>
            </Button>
            <Button asChild variant="outline">
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">GitHub-native • OpenAPI-first • No code changes required</p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-border/70 bg-card px-2.5 py-1">Secure GitHub OAuth</span>
            <span className="rounded-full border border-border/70 bg-card px-2.5 py-1">No code changes required</span>
            <span className="rounded-full border border-border/70 bg-card px-2.5 py-1">Data stored securely</span>
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
      </section>

      <section className="mx-auto w-full max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">
        <header className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Trusted by API-first teams</h2>
          <p className="text-sm text-muted-foreground">Built for teams that ship frequently and need confidence in every merge.</p>
        </header>
        <div className="grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-border/70 bg-card p-4">
            <h3 className="text-base font-semibold text-foreground">Early adopter insight</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              &quot;We caught three breaking changes in week one and avoided a customer-facing release incident.&quot;
            </p>
          </article>
          <article className="rounded-xl border border-border/70 bg-card p-4">
            <h3 className="text-base font-semibold text-foreground">Merge-time enforcement</h3>
            <p className="mt-1 text-sm text-muted-foreground">Policy-backed PR checks prevent accidental API regressions before they leave GitHub.</p>
          </article>
          <article className="rounded-xl border border-border/70 bg-card p-4">
            <h3 className="text-base font-semibold text-foreground">Audit-ready decisions</h3>
            <p className="mt-1 text-sm text-muted-foreground">Track failures, waivers, and policy outcomes with a clear operational history.</p>
          </article>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto w-full max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">
        <header className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">How it works</h2>
          <p className="text-sm text-muted-foreground">Go from install to enforced API safety in minutes.</p>
        </header>
        <div className="grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-border/70 bg-card p-4">
            <span className="text-xs font-semibold text-primary">01</span>
            <h3 className="mt-1 text-base font-semibold text-foreground">Connect GitHub and install the app</h3>
            <p className="mt-1 text-sm text-muted-foreground">Authorize once and connect the repositories you want protected.</p>
          </article>
          <article className="rounded-xl border border-border/70 bg-card p-4">
            <span className="text-xs font-semibold text-primary">02</span>
            <h3 className="mt-1 text-base font-semibold text-foreground">Define policy defaults and service overrides</h3>
            <p className="mt-1 text-sm text-muted-foreground">Set org-level guardrails and tune strictness per service as teams mature.</p>
          </article>
          <article className="rounded-xl border border-border/70 bg-card p-4">
            <span className="text-xs font-semibold text-primary">03</span>
            <h3 className="mt-1 text-base font-semibold text-foreground">Block breaking changes automatically in PR</h3>
            <p className="mt-1 text-sm text-muted-foreground">Contract diffs run in pull requests and enforce release safety before merge.</p>
          </article>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">
        <header className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Built for API-first engineering teams</h2>
          <p className="text-sm text-muted-foreground">Adopt contract safety without changing your delivery workflow.</p>
        </header>
        <div className="grid gap-3 md:grid-cols-2">
          <article className="rounded-xl border border-border/70 bg-card p-4 text-sm text-muted-foreground">Platform teams standardizing API quality across services.</article>
          <article className="rounded-xl border border-border/70 bg-card p-4 text-sm text-muted-foreground">Backend teams preventing accidental breaking contract changes.</article>
          <article className="rounded-xl border border-border/70 bg-card p-4 text-sm text-muted-foreground">DevOps teams enforcing policy in CI with clear merge gates.</article>
          <article className="rounded-xl border border-border/70 bg-card p-4 text-sm text-muted-foreground">API product companies protecting partner and customer integrations.</article>
        </div>
        <p className="text-sm text-muted-foreground">
          Jump to detailed capabilities:{' '}
          <a className="text-primary hover:underline" href="/features#automated-contract-diffing">Automated Contract Diffing</a>{' · '}
          <a className="text-primary hover:underline" href="/features#policy-engine">Policy Engine</a>{' · '}
          <a className="text-primary hover:underline" href="/features#waivers-expirations">Waivers</a>
        </p>
      </section>

      <section className="mx-auto w-full max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">
        <header className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Product workflow visuals</h2>
          <p className="text-sm text-muted-foreground">Understand how checks, policy editing, and operations work together.</p>
        </header>
        <div className="grid gap-4 lg:grid-cols-2">
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

      <section className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Prevent production API breakages before merge.</h2>
          <p className="text-sm text-muted-foreground">Start your 3-day trial, choose monthly or yearly billing, and onboard your first repositories.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={ctaHref}>{session ? 'Go to workspace' : 'Start free trial'}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/pricing">Compare pricing</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
