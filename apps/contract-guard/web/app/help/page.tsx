import type { Metadata } from 'next';

import { HELP_FAQ, HELP_GETTING_STARTED } from '../content/help';
import { getStatusPageUrl, getSupportEmail } from '../content/site';

export const metadata: Metadata = {
  title: 'Help',
  description:
    'Troubleshooting and onboarding guidance for GitHub setup, repository sync, service creation, and billing.',
};

export default function HelpPage() {
  const supportEmail = getSupportEmail();
  const statusPageUrl = getStatusPageUrl();

  return (
    <main className="marketing-main page-wrap legal-wrap">
      <section className="marketing-section">
        <h1>Help Center</h1>
        <p>
          Start with self-serve guidance below. If you still need help, contact support with your org ID
          and timestamp of the issue.
        </p>
      </section>

      <section className="marketing-section">
        <h2>Getting started checklist</h2>
        <ol className="legal-list">
          {HELP_GETTING_STARTED.map((item) => (
            <li key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="marketing-section">
        <h2>FAQ and troubleshooting</h2>
        <div className="faq-grid">
          {HELP_FAQ.map((item) => (
            <article key={item.id}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-section">
        <h2>Need escalation?</h2>
        <p>
          Contact <a href={`mailto:${supportEmail}`}>{supportEmail}</a> for incident or account support.
        </p>
        {statusPageUrl ? (
          <p>
            Check platform health on the{' '}
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
