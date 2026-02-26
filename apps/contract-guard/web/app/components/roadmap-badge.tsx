import { Badge } from '@herk/ui/base/badge';

import type { RoadmapStatus } from '../content/pricing';

export function RoadmapBadge({ status }: { status: RoadmapStatus }) {
  return status === 'LIVE' ? (
    <Badge variant="secondary">Live</Badge>
  ) : (
    <Badge variant="outline">Roadmap</Badge>
  );
}
