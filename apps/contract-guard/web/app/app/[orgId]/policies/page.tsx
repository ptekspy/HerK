import { SectionHeader } from '../../../components/section-header';

import { apiGet } from '../../../../lib/api';

interface Policy {
  id: string;
  failOnBreaking: boolean;
  ruleOverrides: Record<string, string>;
}

export default async function PoliciesPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;

  const policy = await apiGet<Policy>(`/v1/orgs/${orgId}/policies/default`).catch(() => ({
    id: 'default',
    failOnBreaking: true,
    ruleOverrides: {},
  }));

  return (
    <>
      <SectionHeader title="Policies" subtitle="Default org policy and service-level overrides" />
      <section className="grid">
        <article className="card card-grid-6">
          <h3>Default policy</h3>
          <dl className="kv">
            <div>
              <dt>Fail on breaking</dt>
              <dd>{policy.failOnBreaking ? 'Enabled' : 'Disabled'}</dd>
            </div>
            <div>
              <dt>Rule overrides</dt>
              <dd>{Object.keys(policy.ruleOverrides).length}</dd>
            </div>
          </dl>
        </article>

        <article className="card card-grid-6">
          <h3>Rule examples</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Rule</th>
                <th>Default</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>endpoint.removed</td>
                <td>BLOCK</td>
              </tr>
              <tr>
                <td>schema.required_added</td>
                <td>BLOCK</td>
              </tr>
              <tr>
                <td>schema.type_changed</td>
                <td>BLOCK</td>
              </tr>
              <tr>
                <td>schema.enum_narrowed</td>
                <td>BLOCK</td>
              </tr>
            </tbody>
          </table>
        </article>
      </section>
    </>
  );
}
