'use client';

import { useMemo, useState } from 'react';

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
    <section className="marketing-section help-search-shell" id="help-search">
      <div className="help-search-header">
        <h2>Search help articles</h2>
        <p>Find setup guidance, policy behavior, troubleshooting steps, and billing answers.</p>
      </div>

      <label className="help-search-input-wrap" htmlFor="help-search-input">
        <span>Search by keyword</span>
        <input
          id="help-search-input"
          name="help-search-input"
          placeholder="Try: callback, repositories, waivers, billing"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <nav aria-label="Help categories" className="help-category-links">
        {categories.map((category) => (
          <a key={category.id} href={`#help-${category.id}`}>
            {category.title}
          </a>
        ))}
      </nav>

      <div className="help-category-sections">
        {categories.map((category) => {
          const items = filteredItems.filter((item) => item.category === category.id);
          if (items.length === 0) {
            return null;
          }

          return (
            <section key={category.id} id={`help-${category.id}`} className="help-category-section">
              <header>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
              </header>
              <div className="faq-grid">
                {items.map((item) => (
                  <article key={item.id}>
                    <h4>{item.question}</h4>
                    <p>{item.answer}</p>
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

