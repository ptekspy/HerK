import { Card, CardContent, CardHeader, CardTitle } from '@herk/ui/base/card';

import { SectionHeader } from '../../../components/section-header';
import { BillingActions } from '../../../components/billing-actions';

import { apiGet } from '../../../../lib/api-server';

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

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground">Plan</dt>
                <dd className="text-foreground">{billing.plan}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Status</dt>
                <dd className="text-foreground">{billing.status ?? 'Not subscribed'}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Current period end</dt>
                <dd className="text-foreground">{billing.currentPeriodEnd ?? 'N/A'}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Service usage</dt>
                <dd className="text-foreground">
                  {billing.serviceCount}
                  {billing.serviceLimit !== null ? ` / ${billing.serviceLimit}` : ' / unlimited'}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Checkout and portal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Choose a plan to start your 3-day trial (card required), then use the customer portal for
              upgrades, downgrades, and cancellations.
            </p>
            <BillingActions orgId={orgId} />
          </CardContent>
        </Card>
      </section>
    </>
  );
}
