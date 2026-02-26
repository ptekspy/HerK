'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    <div>
      <button
        className="btn btn-secondary"
        type="button"
        onClick={refreshRepositories}
        disabled={loading || installations.length === 0}
      >
        {loading ? 'Refreshing…' : 'Refresh repositories'}
      </button>
      {error && <p className="flash flash-error mt-3">{error}</p>}
      {ok && <p className="flash flash-ok mt-3">{ok}</p>}
      {installations.length === 0 && (
        <p className="flash mt-3">
          No GitHub App installation found yet.
        </p>
      )}
    </div>
  );
}
