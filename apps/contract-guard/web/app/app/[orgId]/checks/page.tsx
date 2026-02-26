import Link from 'next/link';
import { Badge } from '@herk/ui/base/badge';
import { Card, CardContent } from '@herk/ui/base/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@herk/ui/base/table';

import { SectionHeader } from '../../../components/section-header';

import { apiGet } from '../../../../lib/api-server';
import { requireActiveSubscription } from '../../../../lib/subscription';

interface Check {
  id: string;
  pullRequestNumber: number;
  status: string;
  conclusion: 'PASS' | 'WARN' | 'FAIL' | 'ERROR' | null;
  summary: string | null;
  service: { name: string };
}

function badgeVariant(conclusion: Check['conclusion']) {
  if (conclusion === 'FAIL' || conclusion === 'ERROR') return 'destructive' as const;
  if (conclusion === 'WARN') return 'outline' as const;
  return 'secondary' as const;
}

export default async function ChecksPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  await requireActiveSubscription(orgId);
  const checks = await apiGet<Check[]>(`/v1/orgs/${orgId}/checks`).catch(() => []);

  return (
    <>
      <SectionHeader title="Checks" subtitle="Historical contract analyses and PR outcomes" />

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PR</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Summary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checks.map((check) => (
                <TableRow key={check.id}>
                  <TableCell>
                    <Link className="text-primary hover:underline" href={`/app/${orgId}/checks/${check.id}`}>
                      #{check.pullRequestNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{check.service?.name ?? 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={badgeVariant(check.conclusion)}>{check.conclusion ?? check.status}</Badge>
                  </TableCell>
                  <TableCell>{check.summary ?? 'No summary'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
