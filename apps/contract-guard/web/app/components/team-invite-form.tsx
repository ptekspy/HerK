'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

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
      setOk('member invited.');
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
    <form onSubmit={onSubmit} className="form-grid">
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="engineer@acme.com"
          required
        />
      </label>

      <label>
        Name (optional)
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Teammate Name"
        />
      </label>

      <label>
        Role
        <select value={role} onChange={(event) => setRole(event.target.value as MemberRole)} required>
          {MEMBER_ROLES.map((memberRole) => (
            <option key={memberRole} value={memberRole}>
              {memberRole}
            </option>
          ))}
        </select>
      </label>

      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? 'Inviting…' : 'Invite member'}
      </button>

      {error && <p className="flash flash-error">{error}</p>}
      {ok && <p className="flash flash-ok">{ok}</p>}
    </form>
  );
}
