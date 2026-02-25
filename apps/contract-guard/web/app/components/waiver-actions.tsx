'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { apiDelete } from '../../lib/api';

export function WaiverActions({ orgId, waiverId }: { orgId: string; waiverId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onRevoke = async () => {
    setError(null);

    const confirmed = window.confirm('Revoke this waiver now?');
    if (!confirmed) {
      return;
    }

    setLoading(true);
    try {
      await apiDelete(`/v1/orgs/${orgId}/waivers/${waiverId}`);
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Revoke failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: '0.35rem' }}>
      <button className="btn btn-secondary" type="button" onClick={onRevoke} disabled={loading}>
        {loading ? 'Revoking…' : 'Revoke'}
      </button>
      {error && <p className="flash flash-error">{error}</p>}
    </div>
  );
}
