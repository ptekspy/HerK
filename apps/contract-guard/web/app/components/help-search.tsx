'use client';

import { useMemo, useState } from 'react';
import { Input } from '@herk/ui/base/input';

import type { HelpCategoryConfig, HelpFaqItem } from '../content/help';

interface HelpSearchProps {
  categories: HelpCategoryConfig[];
  faqItems: HelpFaqItem[];
}

export function HelpSearch({ categories, faqItems }: HelpSearchProps) {
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = useMemo(() => {
    if (!normalizedQuery) {
      return faqItems;
    }

    return faqItems.filter((item) => {
      return (
        item.question.toLowerCase().includes(normalizedQuery) ||
        item.answer.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [faqItems, normalizedQuery]);

  return (
    <section className="space-y-6" id="help-search">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Search help articles</h2>
        <p className="text-sm text-muted-foreground">
          Find setup guidance, policy behavior, troubleshooting steps, and billing answers.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="help-search-input">
          Search by keyword
        </label>
        <Input
          id="help-search-input"
          name="help-search-input"
          placeholder="Try: callback, repositories, waivers, billing"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <nav aria-label="Help categories" className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <a
            key={category.id}
            href={`#help-${category.id}`}
            className="rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {category.title}
          </a>
        ))}
      </nav>

      <div className="space-y-6">
        {categories.map((category) => {
          const items = filteredItems.filter((item) => item.category === category.id);
          if (items.length === 0) {
            return null;
          }

          return (
            <section key={category.id} id={`help-${category.id}`} className="space-y-3 rounded-xl border border-border/70 bg-card p-5">
              <header className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">{category.title}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </header>
              <div className="grid gap-3 md:grid-cols-2">
                {items.map((item) => (
                  <article key={item.id} className="space-y-1 rounded-lg border border-border/60 bg-muted/20 p-3">
                    <h4 className="text-sm font-semibold text-foreground">{item.question}</h4>
                    <p className="text-sm text-muted-foreground">{item.answer}</p>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
