'use client';

import { FormEvent, useState } from 'react';
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
      setOk('Repository mapped.');
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
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Installation</Label>
          <Select
            value={githubInstallationId}
            onValueChange={setGithubInstallationId}
            disabled={!hasInstallations || loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select installation" />
            </SelectTrigger>
            <SelectContent>
              {installations.map((installation) => (
                <SelectItem key={installation.id} value={installation.id}>
                  {installation.accountLogin} ({installation.installationId})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="repo-owner">Owner</Label>
          <Input
            id="repo-owner"
            value={owner}
            onChange={(event) => setOwner(event.target.value)}
            placeholder="acme"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="repo-name">Repository name</Label>
          <Input
            id="repo-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="platform-api"
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="repo-branch">Default branch</Label>
          <Input
            id="repo-branch"
            value={defaultBranch}
            onChange={(event) => setDefaultBranch(event.target.value)}
            placeholder="main"
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={loading || !hasInstallations}>
        {loading ? 'Saving…' : 'Map repository'}
      </Button>

      {!hasInstallations ? (
        <Alert>
          <AlertDescription>No installation found yet. Install GitHub App and run installation sync.</AlertDescription>
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
