'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Button } from '@herk/ui/base/button';
import { Card, CardContent, CardHeader, CardTitle } from '@herk/ui/base/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@herk/ui/base/table';
import { ToggleGroup, ToggleGroupItem } from '@herk/ui/base/toggle-group';

import type { BillingCycle } from '../content/pricing';
import { PLAN_PACKAGES, PRICING_FEATURE_ROWS } from '../content/pricing';

import { RoadmapBadge } from './roadmap-badge';

interface PricingTableProps {
  isAuthenticated: boolean;
  billingHref: string | null;
  salesEmail: string;
}

function normalizeMatrixValue(value: string) {
  if (value === '✓') {
    return <span className="font-semibold text-emerald-700">Included</span>;
  }

  return value;
}

export function PricingTable({ isAuthenticated, billingHref, salesEmail }: PricingTableProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('MONTHLY');

  const defaultCtaHref = isAuthenticated ? billingHref ?? '/onboarding' : '/onboarding';
  const defaultCtaLabel = isAuthenticated ? 'Go to billing' : 'Start free trial';
  const enterpriseHref = `mailto:${salesEmail}?subject=${encodeURIComponent('Enterprise plan - API Contract Guard')}`;

  const billingDescription = useMemo(
    () =>
      billingCycle === 'YEARLY'
        ? 'Yearly billing selected. Save the equivalent of 2 months.'
        : 'Monthly billing selected. Switch to yearly any time.',
    [billingCycle],
  );

  return (
    <div className="space-y-6">
      <section aria-label="Billing cycle" className="space-y-3">
        <ToggleGroup
          type="single"
          value={billingCycle}
          onValueChange={(value) => value && setBillingCycle(value as BillingCycle)}
        >
          <ToggleGroupItem value="MONTHLY" aria-label="Monthly pricing">Monthly</ToggleGroupItem>
          <ToggleGroupItem value="YEARLY" aria-label="Yearly pricing">
            Yearly (2 months free)
          </ToggleGroupItem>
        </ToggleGroup>

        <p className="text-sm text-muted-foreground">{billingDescription}</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {PLAN_PACKAGES.map((plan) => {
          const ctaHref = plan.ctaMode === 'CONTACT_SALES' ? enterpriseHref : defaultCtaHref;
          const ctaLabel = plan.ctaMode === 'CONTACT_SALES' ? 'Contact Sales' : defaultCtaLabel;

          return (
            <Card key={plan.id} className={plan.id === 'GROWTH' ? 'border-primary/40 shadow-lg' : ''}>
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-primary">{plan.tagline}</p>
                  <p className="text-sm text-muted-foreground">{plan.audienceLabel}</p>
                  <p className="text-3xl font-semibold text-foreground">{plan.price[billingCycle]}</p>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {plan.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {plan.ctaMode === 'CONTACT_SALES' ? (
                  <Button asChild variant="outline" className="w-full">
                    <a href={ctaHref}>{ctaLabel}</a>
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link href={ctaHref}>{ctaLabel}</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="space-y-3 rounded-xl border border-border/70 bg-card p-5">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Feature comparison</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Capability</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Starter</TableHead>
              <TableHead>Growth</TableHead>
              <TableHead>Enterprise</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PRICING_FEATURE_ROWS.map((row) => (
              <TableRow key={row.key}>
                <TableCell>
                  <div className="space-y-0.5">
                    <strong className="text-sm font-semibold text-foreground">{row.feature}</strong>
                    <p className="text-xs text-muted-foreground">{row.detail}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <RoadmapBadge status={row.status} />
                </TableCell>
                <TableCell>{normalizeMatrixValue(row.values.STARTER)}</TableCell>
                <TableCell>{normalizeMatrixValue(row.values.GROWTH)}</TableCell>
                <TableCell>{normalizeMatrixValue(row.values.ENTERPRISE)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
