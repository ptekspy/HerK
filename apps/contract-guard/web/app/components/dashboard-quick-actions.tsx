interface DashboardQuickActionsProps {
  orgId: string;
}

export function DashboardQuickActions({ orgId }: DashboardQuickActionsProps) {
  return (
    <section className="card dashboard-quick-actions">
      <h3>Quick actions</h3>
      <p>Jump to the actions needed most during setup and daily operations.</p>
      <div className="cta-row mt-3">
        <a className="btn btn-secondary" href={`/app/${orgId}/repos#github-sync`}>
          Refresh repositories
        </a>
        <a className="btn btn-secondary" href={`/app/${orgId}/services#create-service`}>
          Create service
        </a>
        <a className="btn btn-secondary" href={`/app/${orgId}/policies`}>
          Edit policy
        </a>
        <a className="btn btn-secondary" href={`/app/${orgId}/notifications`}>
          Notification settings
        </a>
        <a className="btn btn-secondary" href={`/app/${orgId}/billing`}>
          Billing
        </a>
      </div>
    </section>
  );
}
