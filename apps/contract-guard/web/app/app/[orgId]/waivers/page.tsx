import { Card, CardContent, CardHeader, CardTitle } from '@herk/ui/base/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@herk/ui/base/table';

import { SectionHeader } from '../../../components/section-header';
import { CreateWaiverForm } from '../../../components/create-waiver-form';
import { WaiverActions } from '../../../components/waiver-actions';
import { apiGet } from '../../../../lib/api-server';
import { requireActiveSubscription } from '../../../../lib/subscription';

interface Waiver {
  id: string;
  reason: string;
  pullRequestNumber: number | null;
  expiresAt: string;
  service: { name: string } | null;
  repository: { fullName: string } | null;
  createdBy: { email: string | null; name: string | null };
}

interface ServiceOption {
  id: string;
  name: string;
}

interface RepositoryOption {
  id: string;
  fullName: string;
}

export default async function WaiversPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  await requireActiveSubscription(orgId);
  const waivers = await apiGet<Waiver[]>(`/v1/orgs/${orgId}/waivers`).catch(() => []);
  const services = await apiGet<ServiceOption[]>(`/v1/orgs/${orgId}/services`).catch(() => []);
  const repositories = await apiGet<RepositoryOption[]>(`/v1/orgs/${orgId}/repos`).catch(() => []);

  return (
    <>
      <SectionHeader title="Waivers" subtitle="Time-bound exceptions with auditability" />

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Grant waiver</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateWaiverForm orgId={orgId} services={services} repositories={repositories} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Waivers should remain narrowly scoped and short-lived. Each waiver is recorded for
              policy and incident audits.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reason</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>PR</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>By</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waivers.map((waiver) => (
                  <TableRow key={waiver.id}>
                    <TableCell>{waiver.reason}</TableCell>
                    <TableCell>{waiver.service?.name ?? waiver.repository?.fullName ?? 'Org-wide'}</TableCell>
                    <TableCell>{waiver.pullRequestNumber ?? 'Any'}</TableCell>
                    <TableCell>{new Date(waiver.expiresAt).toLocaleString()}</TableCell>
                    <TableCell>{waiver.createdBy.name ?? waiver.createdBy.email ?? 'Unknown'}</TableCell>
                    <TableCell>
                      <WaiverActions orgId={orgId} waiverId={waiver.id} />
                    </TableCell>
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
