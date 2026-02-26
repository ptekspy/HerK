import type { Metadata } from 'next';

import { LEGAL_LAST_UPDATED } from '../content/site';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Draft terms of use template for API Contract Guard. Review with legal counsel before production use.',
};

export default function TermsOfUsePage() {
  return (
    <main className="marketing-main page-wrap legal-wrap">
      <section className="marketing-section">
        <h1>Terms of Use</h1>
        <p className="legal-note">
          Template notice: these terms are a draft template and must be reviewed with legal counsel before
          final publication.
        </p>
        <p>Last updated: {LEGAL_LAST_UPDATED}</p>
      </section>

      <section className="marketing-section legal-toc">
        <h2>Contents</h2>
        <ol className="legal-list">
          <li>
            <a href="#service-scope">Service scope</a>
          </li>
          <li>
            <a href="#acceptable-use">Acceptable use</a>
          </li>
          <li>
            <a href="#billing-and-subscription">Billing and subscription</a>
          </li>
          <li>
            <a href="#warranties-and-liability">Warranties and liability</a>
          </li>
          <li>
            <a href="#termination">Termination</a>
          </li>
        </ol>
      </section>

      <section id="service-scope" className="marketing-section">
        <h2>Service scope</h2>
        <p>
          API Contract Guard provides hosted tooling for API contract checks, policy management, and
          notifications. Features may evolve over time and may vary by subscription package.
        </p>
      </section>

      <section id="acceptable-use" className="marketing-section">
        <h2>Acceptable use</h2>
        <p>
          Customers must not use the service for unlawful activity, security abuse, or attempts to disrupt
          availability, confidentiality, or integrity of the platform.
        </p>
      </section>

      <section id="billing-and-subscription" className="marketing-section">
        <h2>Billing and subscription</h2>
        <p>
          Paid subscriptions are billed through third-party payment processors. Subscription status,
          renewal, and cancellation behavior follow the selected package and processor terms.
        </p>
      </section>

      <section id="warranties-and-liability" className="marketing-section">
        <h2>Warranties and liability</h2>
        <p>
          The service is provided on an as-is basis to the fullest extent allowed by law. Liability limits,
          exclusions, and disclaimers should be finalized by legal counsel before publication.
        </p>
      </section>

      <section id="termination" className="marketing-section">
        <h2>Termination</h2>
        <p>
          Either party may terminate service access as described in the final agreement. Upon termination,
          access may be revoked and data handling follows the final retention and deletion terms.
        </p>
      </section>
    </main>
  );
}
