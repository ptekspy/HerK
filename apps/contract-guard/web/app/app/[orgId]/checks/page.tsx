import Link from 'next/link';

import { SectionHeader } from '../../../components/section-header';

import { apiGet } from '../../../../lib/api';

interface Check {
  id: string;
  pullRequestNumber: number;
  status: string;
  conclusion: 'PASS' | 'WARN' | 'FAIL' | 'ERROR' | null;
  summary: string | null;
  service: { name: string };
}

function badgeClass(conclusion: Check['conclusion']) {
  if (conclusion === 'FAIL' || conclusion === 'ERROR') return 'badge badge-fail';
  if (conclusion === 'WARN') return 'badge badge-warn';
  return 'badge badge-pass';
}

export default async function ChecksPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const checks = await apiGet<Check[]>(`/v1/orgs/${orgId}/checks`).catch(() => []);

  return (
    <>
      <SectionHeader title="Checks" subtitle="Historical contract analyses and PR outcomes" />

      <section className="card">
        <table className="table">
          <thead>
            <tr>
              <th>PR</th>
              <th>Service</th>
              <th>Status</th>
              <th>Summary</th>
            </tr>
          </thead>
          <tbody>
            {checks.map((check) => (
              <tr key={check.id}>
                <td>
                  <Link href={`/app/${orgId}/checks/${check.id}`}>#{check.pullRequestNumber}</Link>
                </td>
                <td>{check.service?.name ?? 'N/A'}</td>
                <td>
                  <span className={badgeClass(check.conclusion)}>{check.conclusion ?? check.status}</span>
                </td>
                <td>{check.summary ?? 'No summary'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
