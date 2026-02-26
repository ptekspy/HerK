import type { Metadata } from 'next';

import { LEGAL_LAST_UPDATED } from '../content/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Draft privacy policy template for API Contract Guard. Review with legal counsel before production use.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 pb-14 pt-10 sm:px-6 lg:px-8">
      <section className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Privacy Policy</h1>
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Template notice: this privacy policy is a draft template and must be reviewed with legal counsel
          before final publication.
        </p>
        <p className="text-sm text-muted-foreground">Last updated: {LEGAL_LAST_UPDATED}</p>
      </section>

      <section className="space-y-2 rounded-xl border border-border/70 bg-card p-5">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Contents</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li><a className="text-primary hover:underline" href="#information-we-collect">Information we collect</a></li>
          <li><a className="text-primary hover:underline" href="#how-we-use-information">How we use information</a></li>
          <li><a className="text-primary hover:underline" href="#data-retention">Data retention</a></li>
          <li><a className="text-primary hover:underline" href="#security">Security</a></li>
          <li><a className="text-primary hover:underline" href="#contact">Contact</a></li>
        </ol>
      </section>

      <section id="information-we-collect" className="space-y-2 rounded-xl border border-border/70 bg-card p-5">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Information we collect</h2>
        <p className="text-sm text-muted-foreground">We collect account data (name, email, organization membership), billing metadata from payment processors, and product activity data such as repository mappings, service settings, and check outcomes.</p>
      </section>

      <section id="how-we-use-information" className="space-y-2 rounded-xl border border-border/70 bg-card p-5">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">How we use information</h2>
        <p className="text-sm text-muted-foreground">We use collected information to provide the service, process payments, improve product quality, detect abuse, and communicate operational or billing updates.</p>
      </section>

      <section id="data-retention" className="space-y-2 rounded-xl border border-border/70 bg-card p-5">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Data retention</h2>
        <p className="text-sm text-muted-foreground">We retain information for as long as needed to operate the service, meet legal obligations, resolve disputes, and enforce agreements. Customers may request deletion where legally permitted.</p>
      </section>

      <section id="security" className="space-y-2 rounded-xl border border-border/70 bg-card p-5">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Security</h2>
        <p className="text-sm text-muted-foreground">We apply administrative and technical controls intended to protect data from unauthorized access, alteration, and disclosure. No method of transmission or storage is completely secure.</p>
      </section>

      <section id="contact" className="space-y-2 rounded-xl border border-border/70 bg-card p-5">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Contact</h2>
        <p className="text-sm text-muted-foreground">For privacy inquiries, contact support through the Help page contact channels.</p>
      </section>
    </main>
  );
}
