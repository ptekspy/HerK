import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@herk/ui/base/alert';
import { Button } from '@herk/ui/base/button';
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
import { CreateRepoForm } from '../../../components/create-repo-form';
import { RefreshRepositoriesButton } from '../../../components/refresh-repositories-button';

import { apiGet } from '../../../../lib/api-server';
import { getRequestOrigin } from '../../../../lib/request-origin';
import { requireActiveSubscription } from '../../../../lib/subscription';

interface Repo {
  id: string;
  fullName: string;
  defaultBranch: string;
  _count: { services: number };
}

interface GithubInstallation {
  id: string;
  installationId: string;
  accountLogin: string;
  _count: { repositories: number };
}

interface PageSearchParams {
  githubAppInstall?: string;
  githubAppInstallReason?: string;
}

export default async function ReposPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<PageSearchParams>;
}) {
  const { orgId } = await params;
  await requireActiveSubscription(orgId);
  const query = await searchParams;
  const installStatus = query.githubAppInstall;
  const installStatusReason = query.githubAppInstallReason;
  const requestOrigin = await getRequestOrigin();
  const apiBase = requestOrigin;
  const webBase = requestOrigin;
  const githubAppInstallUrl = `${apiBase}/auth/github/app/install/start?orgId=${encodeURIComponent(orgId)}&returnTo=${encodeURIComponent(`${webBase}/app/${orgId}/repos`)}`;
  const repos = await apiGet<Repo[]>(`/v1/orgs/${orgId}/repos`).catch(() => []);
  const installations = await apiGet<GithubInstallation[]>(
    `/v1/orgs/${orgId}/github/installations`,
  ).catch(() => []);

  return (
    <>
      <SectionHeader title="Repositories" subtitle="Map GitHub repositories to API Contract Guard services" />

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Connected repositories</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Repository</TableHead>
                  <TableHead>Default branch</TableHead>
                  <TableHead>Services</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repos.map((repo) => (
                  <TableRow key={repo.id}>
                    <TableCell>{repo.fullName}</TableCell>
                    <TableCell>{repo.defaultBranch}</TableCell>
                    <TableCell>{repo._count.services}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card id="github-sync">
          <CardHeader>
            <CardTitle className="text-lg">GitHub App</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Refresh repositories from your connected GitHub App installation.</p>

            <Button asChild variant="outline">
              <a href={githubAppInstallUrl}>Refresh GitHub App permissions</a>
            </Button>

            {installStatus === 'ok' ? (
              <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900 [&>svg]:text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>GitHub App installation connected.</AlertDescription>
              </Alert>
            ) : null}
            {installStatus === 'pending' ? (
              <Alert className="border-amber-200 bg-amber-50 text-amber-900 [&>svg]:text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>GitHub App installation is pending approval.</AlertDescription>
              </Alert>
            ) : null}
            {installStatus === 'error' ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Installation callback failed{installStatusReason ? ` (${installStatusReason})` : ''}.
                </AlertDescription>
              </Alert>
            ) : null}
            <div id="refresh-repositories">
              <RefreshRepositoriesButton
                orgId={orgId}
                installations={installations.map((installation) => ({
                  installationId: installation.installationId,
                  accountLogin: installation.accountLogin,
                }))}
              />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Installation ID</TableHead>
                  <TableHead>Repositories</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {installations.map((installation) => (
                  <TableRow key={installation.id}>
                    <TableCell>{installation.accountLogin}</TableCell>
                    <TableCell>{installation.installationId}</TableCell>
                    <TableCell>{installation._count.repositories}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Manual repository mapping</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Use this when a repository is not yet in the synced list.</p>
            <CreateRepoForm orgId={orgId} installations={installations} />
          </CardContent>
        </Card>
      </section>
    </>
  );
}
