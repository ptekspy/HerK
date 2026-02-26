import Image from 'next/image';

interface MarketingVisualCardProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  title: string;
  description: string;
  annotations?: string[];
}

export function MarketingVisualCard({
  src,
  alt,
  width,
  height,
  title,
  description,
  annotations = [],
}: MarketingVisualCardProps) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      <div className="relative">
        <Image alt={alt} className="h-auto w-full" height={height} src={src} width={width} />
        {annotations.length > 0 ? (
          <figcaption className="absolute inset-x-3 bottom-3 flex flex-wrap gap-2">
            {annotations.map((label) => (
              <span
                key={label}
                className="rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground shadow"
              >
                {label}
              </span>
            ))}
          </figcaption>
        ) : null}
      </div>
      <div className="space-y-1 p-4">
        <strong className="text-sm font-semibold text-foreground">{title}</strong>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </figure>
  );
}
