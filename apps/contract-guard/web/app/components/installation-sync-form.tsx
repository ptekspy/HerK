'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@herk/ui/base/alert';
import { Button } from '@herk/ui/base/button';
import { Checkbox } from '@herk/ui/base/checkbox';
import { Input } from '@herk/ui/base/input';
import { Label } from '@herk/ui/base/label';

import { apiPost } from '../../lib/api';

export function InstallationSyncForm({ orgId }: { orgId: string }) {
  const router = useRouter();
  const [installationId, setInstallationId] = useState('');
  const [accountLogin, setAccountLogin] = useState('');
  const [syncRepositories, setSyncRepositories] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setOk(null);

    const parsedInstallationId = Number.parseInt(installationId, 10);
    if (!Number.isInteger(parsedInstallationId) || parsedInstallationId <= 0) {
      setError('Installation ID must be a positive integer.');
      return;
    }

    setLoading(true);
    try {
      const result = await apiPost<{ syncedRepositories?: number }>(
        `/v1/orgs/${orgId}/github/installations/sync`,
        {
          installationId: parsedInstallationId,
          accountLogin,
          syncRepositories,
        },
      );
      setOk(
        typeof result.syncedRepositories === 'number'
          ? `Installation synced (${result.syncedRepositories} repositories).`
          : 'Installation synced.',
      );
      router.refresh();
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : 'Sync failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="installation-id">GitHub installation ID</Label>
          <Input
            id="installation-id"
            value={installationId}
            onChange={(event) => setInstallationId(event.target.value)}
            placeholder="12345678"
            inputMode="numeric"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="installation-login">Account login</Label>
          <Input
            id="installation-login"
            value={accountLogin}
            onChange={(event) => setAccountLogin(event.target.value)}
            placeholder="acme"
            required
          />
        </div>

        <div className="flex items-center gap-2 sm:col-span-2">
          <Checkbox
            id="sync-repositories"
            checked={syncRepositories}
            onCheckedChange={(checked) => setSyncRepositories(Boolean(checked))}
          />
          <Label htmlFor="sync-repositories">Sync repositories after installation upsert</Label>
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Syncing…' : 'Sync installation'}
      </Button>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {ok ? (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900 [&>svg]:text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{ok}</AlertDescription>
        </Alert>
      ) : null}
    </form>
  );
}
