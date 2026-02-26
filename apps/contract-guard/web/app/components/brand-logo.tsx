import Image from 'next/image';

type BrandLogoVariant = 'long' | 'square';

export interface BrandLogoProps {
  variant: BrandLogoVariant;
  className?: string;
  priority?: boolean;
  alt?: string;
}

const LOGO_BY_VARIANT = {
  long: {
    src: '/logo-long.png',
    width: 1013,
    height: 233,
  },
  square: {
    src: '/logo-square.png',
    width: 235,
    height: 233,
  },
} as const;

export function BrandLogo({
  variant,
  className,
  priority = false,
  alt = 'API Contract Guard',
}: BrandLogoProps) {
  const config = LOGO_BY_VARIANT[variant];
  const rootClassName = className ? `brand-logo brand-logo-${variant} ${className}` : `brand-logo brand-logo-${variant}`;

  return (
    <span className={rootClassName}>
      <Image
        alt={alt}
        className="brand-logo-image"
        height={config.height}
        priority={priority}
        src={config.src}
        width={config.width}
      />
    </span>
  );
}
