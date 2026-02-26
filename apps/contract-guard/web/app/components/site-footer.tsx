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
    <footer className="site-footer">
      <div className="page-wrap site-footer-grid">
        {FOOTER_COLUMNS.map((column) => (
          <section key={column.heading} className="site-footer-column">
            <h2>{column.heading}</h2>
            <ul>
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="site-footer-column">
          <h2>Contact</h2>
          <ul>
            <li>
              <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
            </li>
            {statusPageUrl ? (
              <li>
                <a href={statusPageUrl} target="_blank" rel="noreferrer">
                  Status Page
                </a>
              </li>
            ) : null}
          </ul>
        </section>
      </div>
      <div className="site-footer-meta page-wrap">
        <p>
          {SITE_BRAND_NAME} © {new Date().getFullYear()}.
        </p>
        <p>Legal pages last updated: {LEGAL_LAST_UPDATED}</p>
      </div>
    </footer>
  );
}
