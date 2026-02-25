import { ForbiddenException, Injectable } from '@nestjs/common';
import { MemberRole } from '@herk/api';

import { PrismaService } from '../prisma/prisma.service';

const ROLE_SCORE: Record<MemberRole, number> = {
  OWNER: 4,
  ADMIN: 3,
  MEMBER: 2,
  VIEWER: 1,
};

@Injectable()
export class RbacService {
  constructor(private readonly prisma: PrismaService) {}

  async requireOrgRole(
    userId: string,
    orgId: string,
    minimumRole: MemberRole,
  ): Promise<MemberRole> {
    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('User is not a member of this organization.');
    }

    if (ROLE_SCORE[membership.role] < ROLE_SCORE[minimumRole]) {
      throw new ForbiddenException(
        `Role ${membership.role} does not satisfy required role ${minimumRole}.`,
      );
    }

    return membership.role;
  }
}
