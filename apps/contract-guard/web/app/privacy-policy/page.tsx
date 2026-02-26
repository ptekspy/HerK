import type { Metadata } from 'next';

import { LEGAL_LAST_UPDATED } from '../content/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Draft privacy policy template for API Contract Guard. Review with legal counsel before production use.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="marketing-main page-wrap legal-wrap">
      <section className="marketing-section">
        <h1>Privacy Policy</h1>
        <p className="legal-note">
          Template notice: this privacy policy is a draft template and must be reviewed with legal counsel
          before final publication.
        </p>
        <p>Last updated: {LEGAL_LAST_UPDATED}</p>
      </section>

      <section className="marketing-section legal-toc">
        <h2>Contents</h2>
        <ol className="legal-list">
          <li>
            <a href="#information-we-collect">Information we collect</a>
          </li>
          <li>
            <a href="#how-we-use-information">How we use information</a>
          </li>
          <li>
            <a href="#data-retention">Data retention</a>
          </li>
          <li>
            <a href="#security">Security</a>
          </li>
          <li>
            <a href="#contact">Contact</a>
          </li>
        </ol>
      </section>

      <section id="information-we-collect" className="marketing-section">
        <h2>Information we collect</h2>
        <p>
          We collect account data (name, email, organization membership), billing metadata from payment
          processors, and product activity data such as repository mappings, service settings, and check
          outcomes.
        </p>
      </section>

      <section id="how-we-use-information" className="marketing-section">
        <h2>How we use information</h2>
        <p>
          We use collected information to provide the service, process payments, improve product quality,
          detect abuse, and communicate operational or billing updates.
        </p>
      </section>

      <section id="data-retention" className="marketing-section">
        <h2>Data retention</h2>
        <p>
          We retain information for as long as needed to operate the service, meet legal obligations,
          resolve disputes, and enforce agreements. Customers may request deletion where legally permitted.
        </p>
      </section>

      <section id="security" className="marketing-section">
        <h2>Security</h2>
        <p>
          We apply administrative and technical controls intended to protect data from unauthorized access,
          alteration, and disclosure. No method of transmission or storage is completely secure.
        </p>
      </section>

      <section id="contact" className="marketing-section">
        <h2>Contact</h2>
        <p>For privacy inquiries, contact support through the Help page contact channels.</p>
      </section>
    </main>
  );
}
