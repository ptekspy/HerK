'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@herk/ui/base/alert-dialog';
import { Alert, AlertDescription } from '@herk/ui/base/alert';
import { Button } from '@herk/ui/base/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@herk/ui/base/select';

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
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={role}
          onValueChange={(value) => setRole(value as MemberRole)}
          disabled={loading !== null}
        >
          <SelectTrigger className="w-[140px]">
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

        <Button type="button" variant="outline" onClick={onSaveRole} disabled={loading !== null}>
          {loading === 'save' ? 'Saving…' : 'Save'}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="outline" disabled={loading !== null}>
              {loading === 'remove' ? 'Removing…' : 'Remove'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove member</AlertDialogTitle>
              <AlertDialogDescription>
                Remove this member from the organization?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading !== null}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onRemove} disabled={loading !== null}>
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      {error ? (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
