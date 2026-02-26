'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@herk/ui/base/alert';
import { Button } from '@herk/ui/base/button';

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
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={onMarkRead}
        disabled={disabled || loading}
      >
        {loading ? 'Saving…' : label}
      </Button>
      {error ? (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
