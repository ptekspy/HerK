'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { apiPost } from '../../lib/api';

interface RepositoryOption {
  id: string;
  fullName: string;
}

interface CreateServiceFormProps {
  orgId: string;
  repositories: RepositoryOption[];
  isSubscriptionActive: boolean;
  billingHref: string;
}

export function CreateServiceForm({
  orgId,
  repositories,
  isSubscriptionActive,
  billingHref,
}: CreateServiceFormProps) {
  const router = useRouter();
  const [repositoryId, setRepositoryId] = useState(repositories[0]?.id ?? '');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [contractSourceType, setContractSourceType] = useState<'GITHUB_FILE' | 'PUBLIC_URL'>(
    'GITHUB_FILE',
  );
  const [contractPath, setContractPath] = useState('openapi.yaml');
  const [contractUrlTemplate, setContractUrlTemplate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const hasRepositories = repositories.length > 0;
  const canSubmit = hasRepositories && isSubscriptionActive && !loading;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setOk(null);

    if (!hasRepositories) {
      setError('At least one repository must be connected before creating a service.');
      return;
    }

    if (!isSubscriptionActive) {
      setError('An active subscription is required before creating services.');
      return;
    }

    const payload: Record<string, unknown> = {
      repositoryId,
      name,
      slug,
      contractSourceType,
      isActive,
    };

    if (contractSourceType === 'GITHUB_FILE') {
      payload.contractPath = contractPath;
    }

    if (contractSourceType === 'PUBLIC_URL') {
      payload.contractUrlTemplate = contractUrlTemplate;
    }

    setLoading(true);
    try {
      await apiPost(`/v1/orgs/${orgId}/services`, payload);
      setOk('service created.');
      setName('');
      setSlug('');
      if (contractSourceType === 'PUBLIC_URL') {
        setContractUrlTemplate('');
      }
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
        Repository
        <select
          name="repositoryId"
          value={repositoryId}
          onChange={(event) => setRepositoryId(event.target.value)}
          disabled={!hasRepositories || loading}
          required
        >
          {repositories.map((repo) => (
            <option key={repo.id} value={repo.id}>
              {repo.fullName}
            </option>
          ))}
        </select>
      </label>

      <label>
        Name
        <input
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Public API"
          required
        />
      </label>

      <label>
        Slug
        <input
          name="slug"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          placeholder="public-api"
          required
        />
      </label>

      <label>
        Source type
        <select
          name="contractSourceType"
          value={contractSourceType}
          onChange={(event) =>
            setContractSourceType(event.target.value as 'GITHUB_FILE' | 'PUBLIC_URL')
          }
          required
        >
          <option value="GITHUB_FILE">GITHUB_FILE</option>
          <option value="PUBLIC_URL">PUBLIC_URL</option>
        </select>
      </label>

      {contractSourceType === 'GITHUB_FILE' ? (
        <label>
          Contract path
          <input
            name="contractPath"
            value={contractPath}
            onChange={(event) => setContractPath(event.target.value)}
            placeholder="openapi.yaml"
            required
          />
        </label>
      ) : null}

      {contractSourceType === 'PUBLIC_URL' ? (
        <label>
          Contract URL template
          <input
            name="contractUrlTemplate"
            value={contractUrlTemplate}
            onChange={(event) => setContractUrlTemplate(event.target.value)}
            placeholder="https://example.com/openapi?sha={sha}"
            required
          />
        </label>
      ) : null}

      <label className="inline-checkbox">
        <input
          type="checkbox"
          name="isActive"
          checked={isActive}
          onChange={(event) => setIsActive(event.target.checked)}
        />
        Active service
      </label>

      <button className="btn btn-primary" type="submit" disabled={!canSubmit}>
        {loading ? 'Saving…' : 'Create service'}
      </button>

      {!isSubscriptionActive ? (
        <p className="flash flash-error">
          Subscription required before creating services. <Link href={billingHref}>Go to billing</Link>.
        </p>
      ) : null}
      {!hasRepositories ? (
        <p className="flash">Connect and sync a repository first from the Repositories page.</p>
      ) : null}
      {error ? <p className="flash flash-error">{error}</p> : null}
      {ok ? <p className="flash flash-ok">{ok}</p> : null}
    </form>
  );
}
