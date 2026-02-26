import { Card, CardContent, CardHeader, CardTitle } from '@herk/ui/base/card';

import { SectionHeader } from '../../../components/section-header';
import { PolicyEditor } from '../../../components/policy-editor';

import { apiGet } from '../../../../lib/api-server';
import { requireActiveSubscription } from '../../../../lib/subscription';

interface Policy {
  id: string;
  failOnBreaking: boolean;
  ruleOverrides: Record<string, string>;
}

export default async function PoliciesPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  await requireActiveSubscription(orgId);

  const policy = await apiGet<Policy>(`/v1/orgs/${orgId}/policies/default`).catch(() => ({
    id: 'default',
    failOnBreaking: true,
    ruleOverrides: {},
  }));

  return (
    <>
      <SectionHeader title="Policies" subtitle="Default org policy and service-level overrides" />
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Default policy</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground">Fail on breaking</dt>
                <dd className="text-foreground">{policy.failOnBreaking ? 'Enabled' : 'Disabled'}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Rule overrides</dt>
                <dd className="text-foreground">{Object.keys(policy.ruleOverrides).length}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Policy editor</CardTitle>
          </CardHeader>
          <CardContent>
            <PolicyEditor
              orgId={orgId}
              initialFailOnBreaking={policy.failOnBreaking}
              initialRuleOverrides={policy.ruleOverrides ?? {}}
            />
          </CardContent>
        </Card>
      </section>
    </>
  );
}
