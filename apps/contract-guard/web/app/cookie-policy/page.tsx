import type { Metadata } from 'next';

import { LEGAL_LAST_UPDATED } from '../content/site';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Draft cookie policy template for API Contract Guard. Review with legal counsel before production use.',
};

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 pb-14 pt-10 sm:px-6 lg:px-8">
      <section className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Cookie Policy</h1>
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Template notice: this cookie policy is a draft template and must be reviewed with legal counsel
          before final publication.
        </p>
        <p className="text-sm text-muted-foreground">Last updated: {LEGAL_LAST_UPDATED}</p>
      </section>

      <section className="space-y-2 rounded-xl border border-border/70 bg-card p-5">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Contents</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li><a className="text-primary hover:underline" href="#what-are-cookies">What are cookies</a></li>
          <li><a className="text-primary hover:underline" href="#cookies-we-use">Cookies we use</a></li>
          <li><a className="text-primary hover:underline" href="#managing-cookies">Managing cookies</a></li>
          <li><a className="text-primary hover:underline" href="#updates">Policy updates</a></li>
        </ol>
      </section>

      <section id="what-are-cookies" className="space-y-2 rounded-xl border border-border/70 bg-card p-5">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">What are cookies</h2>
        <p className="text-sm text-muted-foreground">Cookies are small data files stored in your browser. They can support authentication, user preferences, and product performance diagnostics.</p>
      </section>

      <section id="cookies-we-use" className="space-y-2 rounded-xl border border-border/70 bg-card p-5">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Cookies we use</h2>
        <p className="text-sm text-muted-foreground">API Contract Guard uses essential session cookies for authentication and security. Additional analytics or preference cookies should be documented here if enabled in production.</p>
      </section>

      <section id="managing-cookies" className="space-y-2 rounded-xl border border-border/70 bg-card p-5">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Managing cookies</h2>
        <p className="text-sm text-muted-foreground">You can control cookie behavior through browser settings. Blocking essential cookies may limit platform functionality such as sign-in and secure session handling.</p>
      </section>

      <section id="updates" className="space-y-2 rounded-xl border border-border/70 bg-card p-5">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Policy updates</h2>
        <p className="text-sm text-muted-foreground">We may update this policy as product behavior changes. Material changes should include a revised last-updated date and, where required, customer notice.</p>
      </section>
    </main>
  );
}
