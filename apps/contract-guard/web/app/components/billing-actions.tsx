'use client';

import { useState } from 'react';

import { apiPost } from '../../lib/api';
import { SubscriptionCheckoutForm } from './subscription-checkout-form';

export function BillingActions({ orgId }: { orgId: string }) {
  const [loading, setLoading] = useState<'portal' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openPortal = async () => {
    setError(null);
    setLoading('portal');

    try {
      const result = await apiPost<{ portalUrl?: string; mode?: string }>(
        `/v1/orgs/${orgId}/billing/portal-session`,
        {},
      );

      if (!result.portalUrl) {
        throw new Error('Portal URL was not returned by API.');
      }

      window.location.assign(result.portalUrl);
    } catch (portalError) {
      setError(portalError instanceof Error ? portalError.message : 'Portal launch failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="form-grid mt-form-offset">
      <SubscriptionCheckoutForm orgId={orgId} ctaLabel="Choose plan and checkout" />
      <button className="btn btn-secondary" type="button" onClick={openPortal} disabled={loading !== null}>
        {loading === 'portal' ? 'Opening portal…' : 'Open customer portal'}
      </button>
      {error && <p className="flash flash-error">{error}</p>}
    </div>
  );
}
