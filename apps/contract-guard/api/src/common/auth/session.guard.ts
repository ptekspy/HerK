import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import type { AuthenticatedRequest } from './current-user.type';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const emailHeader = request.headers['x-user-email'];
    const nameHeader = request.headers['x-user-name'];

    const email =
      typeof emailHeader === 'string' && emailHeader.trim().length > 0
        ? emailHeader.trim().toLowerCase()
        : 'demo@contractguard.local';

    const name =
      typeof nameHeader === 'string' && nameHeader.trim().length > 0
        ? nameHeader.trim()
        : 'Demo User';

    const user = await this.prisma.user.upsert({
      where: { email },
      update: { name },
      create: {
        email,
        name,
      },
      include: {
        memberships: true,
      },
    });

    if (!user.email) {
      throw new UnauthorizedException('Unable to resolve session user.');
    }

    request.currentUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      rolesByOrg: Object.fromEntries(
        user.memberships.map((membership) => [membership.orgId, membership.role]),
      ),
    };

    return true;
  }
}
