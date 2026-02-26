'use client';

import { useState } from 'react';

import { apiPatch } from '../../lib/api';

interface PrFailureEmailToggleProps {
  orgId: string;
  initialValue: boolean;
}

export function PrFailureEmailToggle({ orgId, initialValue }: PrFailureEmailToggleProps) {
  const [enabled, setEnabled] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = async (next: boolean) => {
    setEnabled(next);
    setSaving(true);
    setError(null);

    try {
      await apiPatch(`/v1/orgs/${orgId}/notifications/preferences`, {
        emailOnPrFailure: next,
      });
    } catch (toggleError) {
      setEnabled(!next);
      setError(toggleError instanceof Error ? toggleError.message : 'Failed to update email preference');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card mb-4">
      <h3 className="mt-0">PR failure emails</h3>
      <p className="mt-0">
        Email notifications for failed/error API Contract Guard pull request checks.
      </p>
      <label htmlFor="pr-failure-email-toggle">
        <input
          id="pr-failure-email-toggle"
          type="checkbox"
          checked={enabled}
          disabled={saving}
          onChange={(event) => onChange(event.target.checked)}
        />{' '}
        {enabled ? 'Enabled' : 'Disabled'}
      </label>
      {error ? <p className="flash flash-error">{error}</p> : null}
    </div>
  );
}
