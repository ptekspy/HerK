import Image from 'next/image';
import { cn } from '@herk/utils';

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
    className: 'w-[170px] md:w-[220px]',
  },
  square: {
    src: '/logo-square.png',
    width: 235,
    height: 233,
    className: 'w-9',
  },
} as const;

export function BrandLogo({
  variant,
  className,
  priority = false,
  alt = 'API Contract Guard',
}: BrandLogoProps) {
  const config = LOGO_BY_VARIANT[variant];

  return (
    <span className={cn('inline-flex items-center', config.className, className)}>
      <Image alt={alt} className="h-auto w-full" height={config.height} priority={priority} src={config.src} width={config.width} />
    </span>
  );
}
