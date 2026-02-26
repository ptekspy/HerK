import type { Metadata } from 'next';

import { LEGAL_LAST_UPDATED } from '../content/site';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Draft terms of use template for API Contract Guard. Review with legal counsel before production use.',
};

export default function TermsOfUsePage() {
  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 pb-14 pt-10 sm:px-6 lg:px-8">
      <section className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Terms of Use</h1>
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Template notice: these terms are a draft template and must be reviewed with legal counsel before
          final publication.
        </p>
        <p className="text-sm text-muted-foreground">Last updated: {LEGAL_LAST_UPDATED}</p>
      </section>

      <section className="space-y-2 rounded-xl border border-border/70 bg-card p-5">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Contents</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li><a className="text-primary hover:underline" href="#service-scope">Service scope</a></li>
          <li><a className="text-primary hover:underline" href="#acceptable-use">Acceptable use</a></li>
          <li><a className="text-primary hover:underline" href="#billing-and-subscription">Billing and subscription</a></li>
          <li><a className="text-primary hover:underline" href="#warranties-and-liability">Warranties and liability</a></li>
          <li><a className="text-primary hover:underline" href="#termination">Termination</a></li>
        </ol>
      </section>

      <section id="service-scope" className="space-y-2 rounded-xl border border-border/70 bg-card p-5">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Service scope</h2>
        <p className="text-sm text-muted-foreground">API Contract Guard provides hosted tooling for API contract checks, policy management, and notifications. Features may evolve over time and may vary by subscription package.</p>
      </section>

      <section id="acceptable-use" className="space-y-2 rounded-xl border border-border/70 bg-card p-5">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Acceptable use</h2>
        <p className="text-sm text-muted-foreground">Customers must not use the service for unlawful activity, security abuse, or attempts to disrupt availability, confidentiality, or integrity of the platform.</p>
      </section>

      <section id="billing-and-subscription" className="space-y-2 rounded-xl border border-border/70 bg-card p-5">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Billing and subscription</h2>
        <p className="text-sm text-muted-foreground">Paid subscriptions are billed through third-party payment processors. Subscription status, renewal, and cancellation behavior follow the selected package and processor terms.</p>
      </section>

      <section id="warranties-and-liability" className="space-y-2 rounded-xl border border-border/70 bg-card p-5">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Warranties and liability</h2>
        <p className="text-sm text-muted-foreground">The service is provided on an as-is basis to the fullest extent allowed by law. Liability limits, exclusions, and disclaimers should be finalized by legal counsel before publication.</p>
      </section>

      <section id="termination" className="space-y-2 rounded-xl border border-border/70 bg-card p-5">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Termination</h2>
        <p className="text-sm text-muted-foreground">Either party may terminate service access as described in the final agreement. Upon termination, access may be revoked and data handling follows the final retention and deletion terms.</p>
      </section>
    </main>
  );
}
