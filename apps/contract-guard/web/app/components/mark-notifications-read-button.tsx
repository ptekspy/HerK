'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { apiPatch } from '../../lib/api';

interface MarkNotificationsReadButtonProps {
  orgId: string;
  ids?: string[];
  label: string;
  disabled?: boolean;
}

export function MarkNotificationsReadButton({
  orgId,
  ids,
  label,
  disabled,
}: MarkNotificationsReadButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onMarkRead = async () => {
    setError(null);
    setLoading(true);

    try {
      await apiPatch(`/v1/orgs/${orgId}/notifications`, ids?.length ? { ids } : {});
      router.refresh();
    } catch (markError) {
      setError(markError instanceof Error ? markError.message : 'Failed to update notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: '0.3rem' }}>
      <button
        className="btn btn-secondary"
        type="button"
        onClick={onMarkRead}
        disabled={disabled || loading}
      >
        {loading ? 'Saving…' : label}
      </button>
      {error && <p className="flash flash-error">{error}</p>}
    </div>
  );
}
