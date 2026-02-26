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
    <figure className="marketing-visual-card">
      <div className="marketing-visual-media">
        <Image alt={alt} className="marketing-visual-image" height={height} src={src} width={width} />
        {annotations.length > 0 ? (
          <figcaption className="marketing-visual-annotations">
            {annotations.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </figcaption>
        ) : null}
      </div>
      <div className="marketing-visual-copy">
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </figure>
  );
}

