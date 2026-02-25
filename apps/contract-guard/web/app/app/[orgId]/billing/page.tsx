import { SectionHeader } from '../../../components/section-header';

import { apiGet } from '../../../../lib/api';

interface BillingSummary {
  plan: string;
  serviceLimit: number | null;
  serviceCount: number;
  status: string | null;
  currentPeriodEnd: string | null;
}

export default async function BillingPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;

  const billing = await apiGet<BillingSummary>(`/v1/orgs/${orgId}/billing`).catch(() => ({
    plan: 'STARTER',
    serviceLimit: 3,
    serviceCount: 0,
    status: null,
    currentPeriodEnd: null,
  }));

  return (
    <>
      <SectionHeader title="Billing" subtitle="Stripe subscriptions with sandbox support" />

      <section className="grid">
        <article className="card card-grid-6">
          <h3>Current subscription</h3>
          <dl className="kv">
            <div>
              <dt>Plan</dt>
              <dd>{billing.plan}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{billing.status ?? 'Not subscribed'}</dd>
            </div>
            <div>
              <dt>Current period end</dt>
              <dd>{billing.currentPeriodEnd ?? 'N/A'}</dd>
            </div>
            <div>
              <dt>Service usage</dt>
              <dd>
                {billing.serviceCount}
                {billing.serviceLimit !== null ? ` / ${billing.serviceLimit}` : ' / unlimited'}
              </dd>
            </div>
          </dl>
        </article>

        <article className="card card-grid-6">
          <h3>Checkout and portal</h3>
          <p>
            Use API endpoints <code>/v1/orgs/:orgId/billing/checkout-session</code> and{' '}
            <code>/v1/orgs/:orgId/billing/portal-session</code> to launch Stripe flows.
          </p>
        </article>
      </section>
    </>
  );
}
