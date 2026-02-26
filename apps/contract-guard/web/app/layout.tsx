import type { Metadata } from 'next';
import localFont from 'next/font/local';

import { SiteFooter } from './components/site-footer';
import { SiteHeader } from './components/site-header';
import './globals.css';
import { getOptionalSession, getPrimaryOrg, toMarketingNavState } from '../lib/site-auth';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'API Contract Guard',
    template: '%s | API Contract Guard',
  },
  description:
    'API Contract Guard protects API reliability by catching breaking contract changes before merge.',
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getOptionalSession();
  const org = await getPrimaryOrg(session);
  const navState = toMarketingNavState(session, org);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className="site-frame">
          <SiteHeader navState={navState} />
          <div className="site-content">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
