'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import type { BillingCycle } from '../content/pricing';
import { PLAN_PACKAGES, PRICING_FEATURE_ROWS } from '../content/pricing';

import { RoadmapBadge } from './roadmap-badge';

interface PricingTableProps {
  isAuthenticated: boolean;
  billingHref: string | null;
}

export function PricingTable({ isAuthenticated, billingHref }: PricingTableProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('MONTHLY');
  const ctaHref = isAuthenticated ? billingHref ?? '/onboarding' : '/onboarding';
  const ctaLabel = isAuthenticated ? 'Go to billing' : 'Start free trial';

  const billingDescription = useMemo(
    () =>
      billingCycle === 'YEARLY'
        ? 'Yearly billing selected. Save the equivalent of 2 months.'
        : 'Monthly billing selected. Switch to yearly any time.',
    [billingCycle],
  );

  return (
    <div className="pricing-stack">
      <section className="pricing-cycle-toggle" aria-label="Billing cycle">
        <button
          type="button"
          aria-pressed={billingCycle === 'MONTHLY'}
          className={billingCycle === 'MONTHLY' ? 'is-active' : undefined}
          onClick={() => setBillingCycle('MONTHLY')}
        >
          Monthly
        </button>
        <button
          type="button"
          aria-pressed={billingCycle === 'YEARLY'}
          className={billingCycle === 'YEARLY' ? 'is-active' : undefined}
          onClick={() => setBillingCycle('YEARLY')}
        >
          Yearly (2 months free)
        </button>
      </section>

      <p className="pricing-cycle-note">{billingDescription}</p>

      <section className="pricing-plan-grid">
        {PLAN_PACKAGES.map((plan) => (
          <article key={plan.id} className="pricing-plan-card">
            <div>
              <h2>{plan.name}</h2>
              <p className="pricing-plan-tagline">{plan.tagline}</p>
              <p className="pricing-plan-price">{plan.price[billingCycle]}</p>
              <p>{plan.description}</p>
            </div>
            <ul>
              {plan.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Link className="btn btn-primary" href={ctaHref}>
              {ctaLabel}
            </Link>
          </article>
        ))}
      </section>

      <section className="pricing-matrix-wrap">
        <h2>Feature comparison</h2>
        <table className="pricing-matrix">
          <thead>
            <tr>
              <th>Capability</th>
              <th>Status</th>
              <th>Starter</th>
              <th>Growth</th>
              <th>Enterprise</th>
            </tr>
          </thead>
          <tbody>
            {PRICING_FEATURE_ROWS.map((row) => (
              <tr key={row.key}>
                <td>
                  <strong>{row.feature}</strong>
                  <p>{row.detail}</p>
                </td>
                <td>
                  <RoadmapBadge status={row.status} />
                </td>
                <td>{row.values.STARTER}</td>
                <td>{row.values.GROWTH}</td>
                <td>{row.values.ENTERPRISE}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
