'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

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
          ? `installation synced (${result.syncedRepositories} repositories).`
          : 'installation synced.',
      );
      router.refresh();
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : 'Sync failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="form-grid">
      <label>
        GitHub installation ID
        <input
          value={installationId}
          onChange={(event) => setInstallationId(event.target.value)}
          placeholder="12345678"
          inputMode="numeric"
          required
        />
      </label>

      <label>
        Account login
        <input
          value={accountLogin}
          onChange={(event) => setAccountLogin(event.target.value)}
          placeholder="acme"
          required
        />
      </label>

      <label className="inline-checkbox">
        <input
          type="checkbox"
          checked={syncRepositories}
          onChange={(event) => setSyncRepositories(event.target.checked)}
        />
        Sync repositories after installation upsert
      </label>

      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? 'Syncing…' : 'Sync installation'}
      </button>

      {error && <p className="flash flash-error">{error}</p>}
      {ok && <p className="flash flash-ok">{ok}</p>}
    </form>
  );
}
