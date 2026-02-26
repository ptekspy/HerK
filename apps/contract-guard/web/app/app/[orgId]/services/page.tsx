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
import { CreateServiceForm } from '../../../components/create-service-form';

import { apiGet } from '../../../../lib/api-server';
import { requireActiveSubscription } from '../../../../lib/subscription';

interface Service {
  id: string;
  name: string;
  slug: string;
  contractSourceType: string;
  repository: { fullName: string };
}

interface RepositoryOption {
  id: string;
  fullName: string;
}

export default async function ServicesPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  await requireActiveSubscription(orgId);
  const services = await apiGet<Service[]>(`/v1/orgs/${orgId}/services`).catch(() => []);
  const repositories = await apiGet<RepositoryOption[]>(`/v1/orgs/${orgId}/repos`).catch(() => []);

  return (
    <>
      <SectionHeader title="Services" subtitle="Protect multiple contracts per repository" />

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Registered services</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Repository</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>{service.slug}</TableCell>
                    <TableCell>{service.contractSourceType}</TableCell>
                    <TableCell>{service.repository?.fullName ?? 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card id="create-service">
          <CardHeader>
            <CardTitle className="text-lg">Add service</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateServiceForm
              orgId={orgId}
              repositories={repositories}
              isSubscriptionActive
              billingHref={`/onboarding/plan?orgId=${encodeURIComponent(orgId)}`}
            />
          </CardContent>
        </Card>
      </section>
    </>
  );
}
