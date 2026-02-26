import { Card, CardContent, CardHeader, CardTitle } from '@herk/ui/base/card';

import type { DashboardMetrics, DashboardSummary } from './dashboard-types';

interface DashboardKpiGridProps {
  metrics: DashboardMetrics;
  billing: DashboardSummary['billing'];
  plan: DashboardSummary['org']['billingPlan'];
}

function KpiCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardKpiGrid({ metrics, billing, plan }: DashboardKpiGridProps) {
  const billingStatus = billing.status ?? 'Not subscribed';

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <KpiCard title="Plan" value={plan} />
      <KpiCard title="Subscription" value={billingStatus} />
      <KpiCard
        title="Services"
        value={`${metrics.services}${billing.serviceLimit !== null ? ` / ${billing.serviceLimit}` : ' / unlimited'}`}
      />
      <KpiCard title="Repositories" value={metrics.repositories} />
      <KpiCard title="Team members" value={metrics.members} />
      <KpiCard title="Unread notifications" value={metrics.unreadNotifications} />
      <KpiCard title="Checks (last 7 days)" value={metrics.checksLast7Days} />
      <KpiCard title="Failing checks (last 7 days)" value={metrics.failingChecksLast7Days} />
    </section>
  );
}
