'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { apiDelete, apiPatch } from '../../lib/api';

const MEMBER_ROLES = ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] as const;
type MemberRole = (typeof MEMBER_ROLES)[number];

interface TeamMemberActionsProps {
  orgId: string;
  memberId: string;
  initialRole: string;
}

export function TeamMemberActions({ orgId, memberId, initialRole }: TeamMemberActionsProps) {
  const router = useRouter();
  const [role, setRole] = useState<MemberRole>((initialRole as MemberRole) || 'MEMBER');
  const [loading, setLoading] = useState<null | 'save' | 'remove'>(null);
  const [error, setError] = useState<string | null>(null);

  const onSaveRole = async () => {
    setError(null);
    setLoading('save');

    try {
      await apiPatch(`/v1/orgs/${orgId}/members/${memberId}`, {
        role,
      });
      router.refresh();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Role update failed');
    } finally {
      setLoading(null);
    }
  };

  const onRemove = async () => {
    setError(null);
    const confirmed = window.confirm('Remove this member from the organization?');
    if (!confirmed) {
      return;
    }

    setLoading('remove');
    try {
      await apiDelete(`/v1/orgs/${orgId}/members/${memberId}`);
      router.refresh();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Remove failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="form-grid mt-0">
      <div className="inline-row-sm">
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as MemberRole)}
          disabled={loading !== null}
        >
          {MEMBER_ROLES.map((memberRole) => (
            <option key={memberRole} value={memberRole}>
              {memberRole}
            </option>
          ))}
        </select>
        <button className="btn btn-secondary" type="button" onClick={onSaveRole} disabled={loading !== null}>
          {loading === 'save' ? 'Saving…' : 'Save'}
        </button>
        <button className="btn btn-secondary" type="button" onClick={onRemove} disabled={loading !== null}>
          {loading === 'remove' ? 'Removing…' : 'Remove'}
        </button>
      </div>
      {error && <p className="flash flash-error">{error}</p>}
    </div>
  );
}
