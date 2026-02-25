'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { apiPost } from '../../lib/api';

interface ServiceOption {
  id: string;
  name: string;
}

interface RepositoryOption {
  id: string;
  fullName: string;
}

interface CreateWaiverFormProps {
  orgId: string;
  services: ServiceOption[];
  repositories: RepositoryOption[];
}

type WaiverScope = 'ORG' | 'SERVICE' | 'REPOSITORY';

function localDateTimeAfterDays(days: number) {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  const pad = (value: number) => value.toString().padStart(2, '0');

  return [
    date.getFullYear(),
    '-',
    pad(date.getMonth() + 1),
    '-',
    pad(date.getDate()),
    'T',
    pad(date.getHours()),
    ':',
    pad(date.getMinutes()),
  ].join('');
}

export function CreateWaiverForm({ orgId, services, repositories }: CreateWaiverFormProps) {
  const router = useRouter();
  const [scope, setScope] = useState<WaiverScope>('ORG');
  const [serviceId, setServiceId] = useState(services[0]?.id ?? '');
  const [repositoryId, setRepositoryId] = useState(repositories[0]?.id ?? '');
  const [pullRequestNumber, setPullRequestNumber] = useState('');
  const [reason, setReason] = useState('');
  const [expiresAtLocal, setExpiresAtLocal] = useState(localDateTimeAfterDays(7));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const scopeOptions = useMemo(
    () => [
      { value: 'ORG', label: 'Organization-wide' },
      { value: 'SERVICE', label: 'Service-specific', disabled: services.length === 0 },
      { value: 'REPOSITORY', label: 'Repository-specific', disabled: repositories.length === 0 },
    ],
    [repositories.length, services.length],
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setOk(null);

    const expiresAtDate = new Date(expiresAtLocal);
    if (Number.isNaN(expiresAtDate.getTime())) {
      setError('Expiry date is invalid.');
      return;
    }

    const payload: Record<string, unknown> = {
      reason,
      expiresAt: expiresAtDate.toISOString(),
    };

    if (scope === 'SERVICE') {
      if (!serviceId) {
        setError('Select a service for service-scoped waivers.');
        return;
      }
      payload.serviceId = serviceId;
    }

    if (scope === 'REPOSITORY') {
      if (!repositoryId) {
        setError('Select a repository for repository-scoped waivers.');
        return;
      }
      payload.repositoryId = repositoryId;
    }

    if (pullRequestNumber.trim()) {
      const parsed = Number.parseInt(pullRequestNumber.trim(), 10);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        setError('PR number must be a positive integer.');
        return;
      }
      payload.pullRequestNumber = parsed;
    }

    setLoading(true);
    try {
      await apiPost(`/v1/orgs/${orgId}/waivers`, payload);
      setOk('waiver created.');
      setReason('');
      setPullRequestNumber('');
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
        Scope
        <select
          value={scope}
          onChange={(event) => setScope(event.target.value as WaiverScope)}
          required
        >
          {scopeOptions.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {scope === 'SERVICE' && (
        <label>
          Service
          <select
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
            required
            disabled={services.length === 0}
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {scope === 'REPOSITORY' && (
        <label>
          Repository
          <select
            value={repositoryId}
            onChange={(event) => setRepositoryId(event.target.value)}
            required
            disabled={repositories.length === 0}
          >
            {repositories.map((repository) => (
              <option key={repository.id} value={repository.id}>
                {repository.fullName}
              </option>
            ))}
          </select>
        </label>
      )}

      <label>
        PR number (optional)
        <input
          value={pullRequestNumber}
          onChange={(event) => setPullRequestNumber(event.target.value)}
          placeholder="12"
          inputMode="numeric"
        />
      </label>

      <label>
        Reason
        <input
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Migration window for mobile clients"
          required
        />
      </label>

      <label>
        Expiry
        <input
          type="datetime-local"
          value={expiresAtLocal}
          onChange={(event) => setExpiresAtLocal(event.target.value)}
          required
        />
      </label>

      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? 'Saving…' : 'Create waiver'}
      </button>

      {error && <p className="flash flash-error">{error}</p>}
      {ok && <p className="flash flash-ok">{ok}</p>}
    </form>
  );
}
