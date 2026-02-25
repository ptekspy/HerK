import { SectionHeader } from '../../../../components/section-header';

import { apiGet } from '../../../../../lib/api';

interface Issue {
  id: string;
  ruleCode: string;
  title: string;
  severity: string;
  isWaived: boolean;
}

interface CheckDetail {
  id: string;
  pullRequestNumber: number;
  summary: string;
  conclusion: string;
  service: { name: string };
  issues: Issue[];
}

export default async function CheckDetailPage({
  params,
}: {
  params: Promise<{ orgId: string; checkId: string }>;
}) {
  const { orgId, checkId } = await params;

  const check = await apiGet<CheckDetail>(`/v1/orgs/${orgId}/checks/${checkId}`).catch(() => ({
    id: checkId,
    pullRequestNumber: 0,
    summary: 'Check not found',
    conclusion: 'ERROR',
    service: { name: 'Unknown' },
    issues: [],
  }));

  return (
    <>
      <SectionHeader
        title={`Check ${check.id}`}
        subtitle={`PR #${check.pullRequestNumber} · ${check.service.name}`}
      />

      <section className="grid">
        <article className="card card-grid-6">
          <h3>Conclusion</h3>
          <p>{check.conclusion}</p>
          <p>{check.summary}</p>
        </article>

        <article className="card card-grid-6">
          <h3>Issues</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Rule</th>
                <th>Severity</th>
                <th>Waived</th>
              </tr>
            </thead>
            <tbody>
              {check.issues.map((issue) => (
                <tr key={issue.id}>
                  <td>{issue.ruleCode}</td>
                  <td>{issue.severity}</td>
                  <td>{issue.isWaived ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>
    </>
  );
}
