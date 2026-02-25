'use client';

import { useState } from 'react';

import { apiPost } from '../../lib/api';

export function BillingActions({ orgId }: { orgId: string }) {
  const [loading, setLoading] = useState<'checkout' | 'portal' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openCheckout = async () => {
    setError(null);
    setLoading('checkout');

    try {
      const result = await apiPost<{ checkoutUrl?: string; mode?: string }>(
        `/v1/orgs/${orgId}/billing/checkout-session`,
        {
          plan: 'GROWTH',
        },
      );

      if (!result.checkoutUrl) {
        throw new Error('Checkout URL was not returned by API.');
      }

      window.location.assign(result.checkoutUrl);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Checkout failed');
    } finally {
      setLoading(null);
    }
  };

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
    <div className="form-grid" style={{ marginTop: '0.6rem' }}>
      <button className="btn btn-primary" type="button" onClick={openCheckout} disabled={loading !== null}>
        {loading === 'checkout' ? 'Opening checkout…' : 'Start checkout'}
      </button>
      <button className="btn btn-secondary" type="button" onClick={openPortal} disabled={loading !== null}>
        {loading === 'portal' ? 'Opening portal…' : 'Open customer portal'}
      </button>
      {error && <p className="flash flash-error">{error}</p>}
    </div>
  );
}
