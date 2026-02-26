import type { DashboardRecentCheck } from './dashboard-types';

interface DashboardRecentChecksProps {
  checks: DashboardRecentCheck[];
}

export function DashboardRecentChecks({ checks }: DashboardRecentChecksProps) {
  return (
    <article className="card card-grid-6">
      <h3>Recent checks</h3>
      {checks.length === 0 ? (
        <p>No checks yet. Open a pull request to trigger your first contract check.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Conclusion</th>
              <th>Service</th>
              <th>Repository</th>
              <th>PR</th>
            </tr>
          </thead>
          <tbody>
            {checks.map((check) => (
              <tr key={check.id}>
                <td>{new Date(check.createdAt).toLocaleString()}</td>
                <td>{check.conclusion ?? 'N/A'}</td>
                <td>{check.serviceName}</td>
                <td>{check.repositoryFullName}</td>
                <td>#{check.pullRequestNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </article>
  );
}
