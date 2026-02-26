import type { Metadata } from 'next';

import { LEGAL_LAST_UPDATED } from '../content/site';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Draft cookie policy template for API Contract Guard. Review with legal counsel before production use.',
};

export default function CookiePolicyPage() {
  return (
    <main className="marketing-main page-wrap legal-wrap">
      <section className="marketing-section">
        <h1>Cookie Policy</h1>
        <p className="legal-note">
          Template notice: this cookie policy is a draft template and must be reviewed with legal counsel
          before final publication.
        </p>
        <p>Last updated: {LEGAL_LAST_UPDATED}</p>
      </section>

      <section className="marketing-section legal-toc">
        <h2>Contents</h2>
        <ol className="legal-list">
          <li>
            <a href="#what-are-cookies">What are cookies</a>
          </li>
          <li>
            <a href="#cookies-we-use">Cookies we use</a>
          </li>
          <li>
            <a href="#managing-cookies">Managing cookies</a>
          </li>
          <li>
            <a href="#updates">Policy updates</a>
          </li>
        </ol>
      </section>

      <section id="what-are-cookies" className="marketing-section">
        <h2>What are cookies</h2>
        <p>
          Cookies are small data files stored in your browser. They can support authentication, user
          preferences, and product performance diagnostics.
        </p>
      </section>

      <section id="cookies-we-use" className="marketing-section">
        <h2>Cookies we use</h2>
        <p>
          API Contract Guard uses essential session cookies for authentication and security. Additional analytics
          or preference cookies should be documented here if enabled in production.
        </p>
      </section>

      <section id="managing-cookies" className="marketing-section">
        <h2>Managing cookies</h2>
        <p>
          You can control cookie behavior through browser settings. Blocking essential cookies may limit
          platform functionality such as sign-in and secure session handling.
        </p>
      </section>

      <section id="updates" className="marketing-section">
        <h2>Policy updates</h2>
        <p>
          We may update this policy as product behavior changes. Material changes should include a revised
          last-updated date and, where required, customer notice.
        </p>
      </section>
    </main>
  );
}
