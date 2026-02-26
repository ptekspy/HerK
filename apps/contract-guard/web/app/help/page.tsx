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
    <main className="marketing-main page-wrap legal-wrap">
      <SeoJsonLd data={faqJsonLd} />

      <section className="marketing-section">
        <h1>Help Center</h1>
        <p>
          Start with self-serve guidance first. Use search and category links below, then escalate with org ID
          and timestamps if you still need support.
        </p>
      </section>

      <section className="marketing-section">
        <h2>Quick start checklist</h2>
        <ol className="legal-list">
          {HELP_GETTING_STARTED.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="marketing-section">
        <h2>Browse by category</h2>
        <div className="help-category-grid">
          {HELP_CATEGORIES.map((category) => (
            <article key={category.id}>
              <h3>{category.title}</h3>
              <p>{category.description}</p>
              <a href={`#help-${category.id}`}>Open section</a>
            </article>
          ))}
        </div>
      </section>

      <HelpSearch categories={HELP_CATEGORIES} faqItems={HELP_FAQ} />

      <section className="marketing-section">
        <h2>Need escalation?</h2>
        <p>
          Contact <a href={`mailto:${supportEmail}`}>{supportEmail}</a> for incident and account support.
        </p>
        {statusPageUrl ? (
          <p>
            Review platform health on the{' '}
            <a href={statusPageUrl} target="_blank" rel="noreferrer">
              status page
            </a>
            .
          </p>
        ) : null}
      </section>
    </main>
  );
}

