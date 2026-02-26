import Link from 'next/link';

import {
  FOOTER_COLUMNS,
  LEGAL_LAST_UPDATED,
  SITE_BRAND_NAME,
  getStatusPageUrl,
  getSupportEmail,
} from '../content/site';

export function SiteFooter() {
  const supportEmail = getSupportEmail();
  const statusPageUrl = getStatusPageUrl();

  return (
    <footer className="border-t border-border/70 bg-card/80">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8">
        {FOOTER_COLUMNS.map((column) => (
          <section key={column.heading} className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">{column.heading}</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link className="transition-colors hover:text-foreground" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Contact</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a className="transition-colors hover:text-foreground" href={`mailto:${supportEmail}`}>
                {supportEmail}
              </a>
            </li>
            {statusPageUrl ? (
              <li>
                <a
                  className="transition-colors hover:text-foreground"
                  href={statusPageUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Status Page
                </a>
              </li>
            ) : null}
          </ul>
        </section>
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 border-t border-border/60 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>
          {SITE_BRAND_NAME} © {new Date().getFullYear()}.
        </p>
        <p>Legal pages last updated: {LEGAL_LAST_UPDATED}</p>
      </div>
    </footer>
  );
}
