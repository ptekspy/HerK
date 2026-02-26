import type { Metadata } from 'next';

import { PricingTable } from '../components/pricing-table';
import { getOptionalSession, getPrimaryOrg } from '../../lib/site-auth';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Choose Starter, Growth, or Enterprise with monthly or yearly billing. Yearly plans include two months free.',
};

export default async function PricingPage() {
  const session = await getOptionalSession();
  const org = await getPrimaryOrg(session);

  return (
    <main className="marketing-main page-wrap">
      <section className="marketing-section">
        <h1>Pricing</h1>
        <p>
          Select the package that matches your API footprint. Yearly billing includes the equivalent of 2
          months free.
        </p>
      </section>
      <PricingTable isAuthenticated={Boolean(session)} billingHref={org ? `/app/${org.id}/billing` : null} />
    </main>
  );
}
