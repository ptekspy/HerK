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

const MEMBER_ROLES = ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] as const;
type MemberRole = (typeof MEMBER_ROLES)[number];

export function TeamInviteForm({ orgId }: { orgId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<MemberRole>('MEMBER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setOk(null);

    setLoading(true);
    try {
      await apiPost(`/v1/orgs/${orgId}/members`, {
        email,
        name: name.trim() ? name : undefined,
        role,
      });
      setOk('Member invited.');
      setEmail('');
      setName('');
      setRole('MEMBER');
      router.refresh();
    } catch (inviteError) {
      setError(inviteError instanceof Error ? inviteError.message : 'Invite failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="member-email">Email</Label>
          <Input
            id="member-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="engineer@acme.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="member-name">Name (optional)</Label>
          <Input
            id="member-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Teammate Name"
          />
        </div>

        <div className="space-y-2">
          <Label>Role</Label>
          <Select value={role} onValueChange={(value) => setRole(value as MemberRole)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MEMBER_ROLES.map((memberRole) => (
                <SelectItem key={memberRole} value={memberRole}>
                  {memberRole}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Inviting…' : 'Invite member'}
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
