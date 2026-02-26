import { SITE_BRAND_NAME } from '../content/site';

interface SiteLogoProps {
  className?: string;
  showWordmark?: boolean;
}

export function SiteLogo({ className, showWordmark = true }: SiteLogoProps) {
  const rootClassName = className ? `site-logo ${className}` : 'site-logo';

  return (
    <span className={rootClassName}>
      <svg aria-hidden="true" className="site-logo-mark-svg" viewBox="0 0 64 64">
        <rect width="64" height="64" rx="16" fill="#173ea0" />
        <path
          d="M32 8L50 15V28c0 14-8.2 24.2-18 28C22.2 52.2 14 42 14 28V15l18-7Z"
          fill="#2157d5"
        />
        <path
          d="M24 31.5l5.1 5.1L40.5 25.2"
          fill="none"
          stroke="#f4f8ff"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3.6"
        />
        <path
          d="M10 20.5c-2.8 1.8-4.5 5.1-4.5 8.5 0 3.4 1.7 6.7 4.5 8.5M54 20.5c2.8 1.8 4.5 5.1 4.5 8.5 0 3.4-1.7 6.7-4.5 8.5"
          fill="none"
          stroke="#f78b35"
          strokeLinecap="round"
          strokeWidth="3.2"
        />
      </svg>
      {showWordmark ? <span className="site-logo-wordmark">{SITE_BRAND_NAME}</span> : null}
    </span>
  );
}

