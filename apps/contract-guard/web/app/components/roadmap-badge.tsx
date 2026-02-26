import type { RoadmapStatus } from '../content/pricing';

export function RoadmapBadge({ status }: { status: RoadmapStatus }) {
  return (
    <span className={`roadmap-badge ${status === 'LIVE' ? 'is-live' : 'is-roadmap'}`}>
      {status === 'LIVE' ? 'Live' : 'Roadmap'}
    </span>
  );
}
