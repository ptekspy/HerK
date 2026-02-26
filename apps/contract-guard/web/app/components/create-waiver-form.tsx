'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@herk/ui/base/alert';
import { Button } from '@herk/ui/base/button';
import { Input } from '@herk/ui/base/input';
import { Label } from '@herk/ui/base/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@herk/ui/base/select';

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
      setOk('Waiver created.');
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
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Scope</Label>
          <Select value={scope} onValueChange={(value) => setScope(value as WaiverScope)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {scopeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {scope === 'SERVICE' ? (
          <div className="space-y-2 sm:col-span-2">
            <Label>Service</Label>
            <Select value={serviceId} onValueChange={setServiceId} disabled={services.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {scope === 'REPOSITORY' ? (
          <div className="space-y-2 sm:col-span-2">
            <Label>Repository</Label>
            <Select
              value={repositoryId}
              onValueChange={setRepositoryId}
              disabled={repositories.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select repository" />
              </SelectTrigger>
              <SelectContent>
                {repositories.map((repository) => (
                  <SelectItem key={repository.id} value={repository.id}>
                    {repository.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="waiver-pr">PR number (optional)</Label>
          <Input
            id="waiver-pr"
            value={pullRequestNumber}
            onChange={(event) => setPullRequestNumber(event.target.value)}
            placeholder="12"
            inputMode="numeric"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="waiver-reason">Reason</Label>
          <Input
            id="waiver-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Migration window for mobile clients"
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="waiver-expiry">Expiry</Label>
          <Input
            id="waiver-expiry"
            type="datetime-local"
            value={expiresAtLocal}
            onChange={(event) => setExpiresAtLocal(event.target.value)}
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving…' : 'Create waiver'}
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
