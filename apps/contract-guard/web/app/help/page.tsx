import type { Metadata } from 'next';

import { HelpSearch } from '../components/help-search';
import { SeoJsonLd } from '../components/seo-json-ld';
import { HELP_CATEGORIES, HELP_FAQ, HELP_GETTING_STARTED } from '../content/help';
import { getStatusPageUrl, getSupportEmail } from '../content/site';

export const metadata: Metadata = {
  title: 'Help Center for API Contract Teams',
  description:
    'Find onboarding, policy, troubleshooting, billing, and integration answers for API Contract Guard.',
};

export default function HelpPage() {
  const supportEmail = getSupportEmail();
  const statusPageUrl = getStatusPageUrl();

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HELP_FAQ.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 pb-14 pt-10 sm:px-6 lg:px-8">
      <SeoJsonLd data={faqJsonLd} />

      <section className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Help Center</h1>
        <p className="text-sm text-muted-foreground">
          Start with self-serve guidance first. Use search and category links below, then escalate with org ID
          and timestamps if you still need support.
        </p>
      </section>

      <section className="space-y-3 rounded-xl border border-border/70 bg-card p-5">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Quick start checklist</h2>
        <ol className="space-y-2">
          {HELP_GETTING_STARTED.map((item) => (
            <li key={item.id} className="rounded-lg border border-border/60 bg-muted/20 p-3">
              <strong className="text-sm font-semibold text-foreground">{item.title}</strong>
              <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-3 rounded-xl border border-border/70 bg-card p-5">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Browse by category</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {HELP_CATEGORIES.map((category) => (
            <article key={category.id} className="rounded-lg border border-border/60 bg-muted/20 p-3">
              <h3 className="text-base font-semibold text-foreground">{category.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
              <a className="mt-2 inline-block text-sm text-primary hover:underline" href={`#help-${category.id}`}>
                Open section
              </a>
            </article>
          ))}
        </div>
      </section>

      <HelpSearch categories={HELP_CATEGORIES} faqItems={HELP_FAQ} />

      <section className="space-y-2 rounded-xl border border-border/70 bg-card p-5">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Need escalation?</h2>
        <p className="text-sm text-muted-foreground">
          Contact <a className="text-primary hover:underline" href={`mailto:${supportEmail}`}>{supportEmail}</a> for incident and account support.
        </p>
        {statusPageUrl ? (
          <p className="text-sm text-muted-foreground">
            Review platform health on the{' '}
            <a className="text-primary hover:underline" href={statusPageUrl} target="_blank" rel="noreferrer">
              status page
            </a>
            .
          </p>
        ) : null}
      </section>
    </main>
  );
}
