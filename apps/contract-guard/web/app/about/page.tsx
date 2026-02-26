import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About API Contract Guard',
  description:
    'Our mission is to make API releases predictable and safe with merge-time contract protection built for engineering teams.',
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-4xl space-y-8 px-4 pb-14 pt-10 sm:px-6 lg:px-8">
      <section className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">About API Contract Guard</h1>
        <p className="text-sm text-muted-foreground">
          We built API Contract Guard to make API releases predictable for teams shipping fast across multiple
          services.
        </p>
      </section>

      <section className="space-y-2 rounded-xl border border-border/70 bg-card p-5">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Mission</h2>
        <p className="text-sm text-muted-foreground">Our mission is to make API releases predictable and safe.</p>
      </section>

      <section className="space-y-3 rounded-xl border border-border/70 bg-card p-5">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Why this exists</h2>
        <div className="space-y-3">
          <article>
            <h3 className="text-base font-semibold text-foreground">APIs break silently</h3>
            <p className="text-sm text-muted-foreground">Field removals and required field additions often look harmless in normal code review.</p>
          </article>
          <article>
            <h3 className="text-base font-semibold text-foreground">Outages follow quickly</h3>
            <p className="text-sm text-muted-foreground">Downstream consumers fail, rollback pressure spikes, and release confidence collapses.</p>
          </article>
          <article>
            <h3 className="text-base font-semibold text-foreground">Manual controls do not scale</h3>
            <p className="text-sm text-muted-foreground">Tribal knowledge and ad-hoc QA cannot enforce contract safety at modern shipping velocity.</p>
          </article>
          <article>
            <h3 className="text-base font-semibold text-foreground">So we enforce safety in pull requests</h3>
            <p className="text-sm text-muted-foreground">API Contract Guard places contract policy at merge time, where teams can fix issues before production impact.</p>
          </article>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-border/70 bg-card p-5">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Team</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <article className="space-y-1 rounded-lg border border-border/60 bg-muted/20 p-3">
            <h3 className="text-base font-semibold text-foreground">Founder (Placeholder)</h3>
            <p className="text-sm text-muted-foreground">API platform engineering background focused on reliability and release governance.</p>
            <a className="text-sm text-primary hover:underline" href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn profile</a>
          </article>
          <article className="space-y-1 rounded-lg border border-border/60 bg-muted/20 p-3">
            <h3 className="text-base font-semibold text-foreground">Engineering Lead (Placeholder)</h3>
            <p className="text-sm text-muted-foreground">Builds CI-native workflows for policy enforcement and developer-friendly remediation loops.</p>
            <a className="text-sm text-primary hover:underline" href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn profile</a>
          </article>
          <article className="space-y-1 rounded-lg border border-border/60 bg-muted/20 p-3">
            <h3 className="text-base font-semibold text-foreground">Product/Platform (Placeholder)</h3>
            <p className="text-sm text-muted-foreground">Translates enterprise API governance requirements into practical product workflows.</p>
            <a className="text-sm text-primary hover:underline" href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn profile</a>
          </article>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-border/70 bg-card p-5">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Roadmap direction</h2>
        <article>
          <h3 className="text-base font-semibold text-foreground">Now: OpenAPI merge protection</h3>
          <p className="text-sm text-muted-foreground">GitHub app onboarding, repository sync, service mapping, policy checks, and waiver controls.</p>
        </article>
        <article>
          <h3 className="text-base font-semibold text-foreground">Next: GraphQL and JSON Schema support</h3>
          <p className="text-sm text-muted-foreground">Extend coverage to broader API contract formats while preserving the same policy workflow.</p>
        </article>
        <article>
          <h3 className="text-base font-semibold text-foreground">Then: Enterprise governance controls</h3>
          <p className="text-sm text-muted-foreground">Expand identity, audit export, and support capabilities for compliance-driven API organizations.</p>
        </article>
      </section>
    </main>
  );
}
