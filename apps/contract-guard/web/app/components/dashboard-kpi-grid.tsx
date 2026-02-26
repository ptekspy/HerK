import type { DashboardMetrics, DashboardSummary } from './dashboard-types';

interface DashboardKpiGridProps {
  metrics: DashboardMetrics;
  billing: DashboardSummary['billing'];
  plan: DashboardSummary['org']['billingPlan'];
}

export function DashboardKpiGrid({ metrics, billing, plan }: DashboardKpiGridProps) {
  const billingStatus = billing.status ?? 'Not subscribed';

  return (
    <section className="grid dashboard-kpi-grid">
      <article className="card card-grid-4">
        <h3>Plan</h3>
        <p>{plan}</p>
      </article>
      <article className="card card-grid-4">
        <h3>Subscription</h3>
        <p>{billingStatus}</p>
      </article>
      <article className="card card-grid-4">
        <h3>Services</h3>
        <p>
          {metrics.services}
          {billing.serviceLimit !== null ? ` / ${billing.serviceLimit}` : ' / unlimited'}
        </p>
      </article>

      <article className="card card-grid-4">
        <h3>Repositories</h3>
        <p>{metrics.repositories}</p>
      </article>
      <article className="card card-grid-4">
        <h3>Team members</h3>
        <p>{metrics.members}</p>
      </article>
      <article className="card card-grid-4">
        <h3>Unread notifications</h3>
        <p>{metrics.unreadNotifications}</p>
      </article>

      <article className="card card-grid-6">
        <h3>Checks (last 7 days)</h3>
        <p>{metrics.checksLast7Days}</p>
      </article>
      <article className="card card-grid-6">
        <h3>Failing checks (last 7 days)</h3>
        <p>{metrics.failingChecksLast7Days}</p>
      </article>
    </section>
  );
}
