'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { apiPost } from '../../lib/api';

interface InstallationOption {
  id: string;
  accountLogin: string;
  installationId: string;
}

interface CreateRepoFormProps {
  orgId: string;
  installations: InstallationOption[];
}

export function CreateRepoForm({ orgId, installations }: CreateRepoFormProps) {
  const router = useRouter();
  const [githubInstallationId, setGithubInstallationId] = useState(installations[0]?.id ?? '');
  const [owner, setOwner] = useState('');
  const [name, setName] = useState('');
  const [defaultBranch, setDefaultBranch] = useState('main');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const hasInstallations = installations.length > 0;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setOk(null);

    if (!hasInstallations) {
      setError('Install and sync a GitHub App installation before mapping a repository.');
      return;
    }

    setLoading(true);
    try {
      await apiPost(`/v1/orgs/${orgId}/repos`, {
        owner,
        name,
        githubInstallationId,
        defaultBranch,
      });
      setOk('repository mapped.');
      setOwner('');
      setName('');
      setDefaultBranch('main');
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="form-grid">
      <label>
        Installation
        <select
          value={githubInstallationId}
          onChange={(event) => setGithubInstallationId(event.target.value)}
          disabled={!hasInstallations || loading}
          required
        >
          {installations.map((installation) => (
            <option key={installation.id} value={installation.id}>
              {installation.accountLogin} ({installation.installationId})
            </option>
          ))}
        </select>
      </label>

      <label>
        Owner
        <input
          value={owner}
          onChange={(event) => setOwner(event.target.value)}
          placeholder="acme"
          required
        />
      </label>

      <label>
        Repository name
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="platform-api"
          required
        />
      </label>

      <label>
        Default branch
        <input
          value={defaultBranch}
          onChange={(event) => setDefaultBranch(event.target.value)}
          placeholder="main"
          required
        />
      </label>

      <button className="btn btn-primary" type="submit" disabled={loading || !hasInstallations}>
        {loading ? 'Saving…' : 'Map repository'}
      </button>

      {!hasInstallations && (
        <p className="flash">No installation found yet. Install GitHub App and run installation sync.</p>
      )}
      {error && <p className="flash flash-error">{error}</p>}
      {ok && <p className="flash flash-ok">{ok}</p>}
    </form>
  );
}
