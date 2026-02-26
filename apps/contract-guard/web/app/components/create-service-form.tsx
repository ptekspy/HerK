'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@herk/ui/base/alert';
import { Button } from '@herk/ui/base/button';
import { Checkbox } from '@herk/ui/base/checkbox';
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
      setOk('Service created.');
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
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Repository</Label>
          <Select
            value={repositoryId}
            onValueChange={setRepositoryId}
            disabled={!hasRepositories || loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select repository" />
            </SelectTrigger>
            <SelectContent>
              {repositories.map((repo) => (
                <SelectItem key={repo.id} value={repo.id}>
                  {repo.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="service-name">Name</Label>
          <Input
            id="service-name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Public API"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="service-slug">Slug</Label>
          <Input
            id="service-slug"
            name="slug"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="public-api"
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label>Source type</Label>
          <Select
            value={contractSourceType}
            onValueChange={(value) => setContractSourceType(value as 'GITHUB_FILE' | 'PUBLIC_URL')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GITHUB_FILE">GITHUB_FILE</SelectItem>
              <SelectItem value="PUBLIC_URL">PUBLIC_URL</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {contractSourceType === 'GITHUB_FILE' ? (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="service-contract-path">Contract path</Label>
            <Input
              id="service-contract-path"
              name="contractPath"
              value={contractPath}
              onChange={(event) => setContractPath(event.target.value)}
              placeholder="openapi.yaml"
              required
            />
          </div>
        ) : null}

        {contractSourceType === 'PUBLIC_URL' ? (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="service-contract-url">Contract URL template</Label>
            <Input
              id="service-contract-url"
              name="contractUrlTemplate"
              value={contractUrlTemplate}
              onChange={(event) => setContractUrlTemplate(event.target.value)}
              placeholder="https://example.com/openapi?sha={sha}"
              required
            />
          </div>
        ) : null}

        <div className="flex items-center gap-2 sm:col-span-2">
          <Checkbox
            id="service-active"
            checked={isActive}
            onCheckedChange={(checked) => setIsActive(Boolean(checked))}
          />
          <Label htmlFor="service-active">Active service</Label>
        </div>
      </div>

      <Button type="submit" disabled={!canSubmit}>
        {loading ? 'Saving…' : 'Create service'}
      </Button>

      {!isSubscriptionActive ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Subscription required before creating services. <Link className="underline" href={billingHref}>Go to billing</Link>.
          </AlertDescription>
        </Alert>
      ) : null}
      {!hasRepositories ? (
        <Alert>
          <AlertDescription>Connect and sync a repository first from the Repositories page.</AlertDescription>
        </Alert>
      ) : null}
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
