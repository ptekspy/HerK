import { SectionHeader } from '../../../components/section-header';
import { PolicyEditor } from '../../../components/policy-editor';

import { apiGet } from '../../../../lib/api-server';

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
          <h3>Policy editor</h3>
          <PolicyEditor
            orgId={orgId}
            initialFailOnBreaking={policy.failOnBreaking}
            initialRuleOverrides={policy.ruleOverrides ?? {}}
          />
        </article>
      </section>
    </>
  );
}
