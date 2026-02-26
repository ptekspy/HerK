import type { Metadata } from 'next';

import { PricingTable } from '../components/pricing-table';
import { getSalesEmail } from '../content/site';
import { getOptionalSession, getPrimaryOrg } from '../../lib/site-auth';

export const metadata: Metadata = {
  title: 'Pricing for API Contract Reliability',
  description:
    'Choose Starter, Growth, or Enterprise plans to prevent breaking API changes before merge with monthly or yearly billing.',
};

export default async function PricingPage() {
  const session = await getOptionalSession();
  const org = await getPrimaryOrg(session);
  const salesEmail = getSalesEmail();

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-14 pt-10 sm:px-6 lg:px-8">
      <section className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Pricing</h1>
        <p className="text-sm text-muted-foreground">
          Select the package that matches your API footprint. Yearly billing includes the equivalent of
          2 months free.
        </p>
      </section>
      <PricingTable
        billingHref={org ? `/app/${org.id}/billing` : null}
        isAuthenticated={Boolean(session)}
        salesEmail={salesEmail}
      />
    </main>
  );
}
