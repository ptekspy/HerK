'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@herk/ui/base/alert';
import { Button } from '@herk/ui/base/button';

import { apiPost } from '../../lib/api';

interface RefreshRepositoriesButtonProps {
  orgId: string;
  installations: Array<{
    installationId: string;
    accountLogin: string;
  }>;
}

export function RefreshRepositoriesButton({
  orgId,
  installations,
}: RefreshRepositoriesButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const refreshRepositories = async () => {
    if (installations.length === 0) {
      return;
    }

    setLoading(true);
    setError(null);
    setOk(null);

    try {
      let syncedRepositories = 0;

      for (const installation of installations) {
        const result = await apiPost<{ syncedRepositories?: number }>(
          `/v1/orgs/${orgId}/github/installations/sync`,
          {
            installationId: Number(installation.installationId),
            accountLogin: installation.accountLogin,
            syncRepositories: true,
          },
        );

        syncedRepositories += result.syncedRepositories ?? 0;
      }

      setOk(`Repositories refreshed (${syncedRepositories} synced).`);
      router.refresh();
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Refresh failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        type="button"
        onClick={refreshRepositories}
        disabled={loading || installations.length === 0}
      >
        {loading ? 'Refreshing…' : 'Refresh repositories'}
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
      {installations.length === 0 ? (
        <Alert>
          <AlertDescription>No GitHub App installation found yet.</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
