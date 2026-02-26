import { Badge } from '@herk/ui/base/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@herk/ui/base/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@herk/ui/base/table';

import { SectionHeader } from '../../../../components/section-header';

import { apiGet } from '../../../../../lib/api-server';
import { requireActiveSubscription } from '../../../../../lib/subscription';

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

function conclusionVariant(conclusion: string) {
  if (conclusion === 'FAIL' || conclusion === 'ERROR') return 'destructive' as const;
  if (conclusion === 'WARN') return 'outline' as const;
  return 'secondary' as const;
}

export default async function CheckDetailPage({
  params,
}: {
  params: Promise<{ orgId: string; checkId: string }>;
}) {
  const { orgId, checkId } = await params;
  await requireActiveSubscription(orgId);

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

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conclusion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Badge variant={conclusionVariant(check.conclusion)}>{check.conclusion}</Badge>
            <p className="text-sm text-muted-foreground">{check.summary}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Waived</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {check.issues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell>{issue.ruleCode}</TableCell>
                    <TableCell>{issue.severity}</TableCell>
                    <TableCell>{issue.isWaived ? 'Yes' : 'No'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
