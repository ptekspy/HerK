import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash } from 'node:crypto';

import { PrismaService } from '../prisma/prisma.service';

import type { AuthenticatedRequest } from './current-user.type';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private getCookieName() {
    return process.env.SESSION_COOKIE_NAME || 'cg_session';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const cookieName = this.getCookieName();
    const cookieToken = request.cookies?.[cookieName];

    if (typeof cookieToken === 'string' && cookieToken.length > 0) {
      const session = await this.prisma.authSession.findUnique({
        where: {
          tokenHash: this.hashToken(cookieToken),
        },
        include: {
          user: {
            include: {
              memberships: true,
            },
          },
        },
      });

      if (!session || session.revokedAt || session.expiresAt <= new Date()) {
        throw new UnauthorizedException('Session is invalid or expired.');
      }

      await this.prisma.authSession.update({
        where: {
          id: session.id,
        },
        data: {
          lastSeenAt: new Date(),
        },
      });

      request.currentUser = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        avatarUrl: session.user.avatarUrl,
        source: 'session',
        sessionId: session.id,
        rolesByOrg: Object.fromEntries(
          session.user.memberships.map((membership) => [membership.orgId, membership.role]),
        ),
      };

      return true;
    }

    const allowHeaderAuth = process.env.ALLOW_HEADER_AUTH === 'true';
    if (!allowHeaderAuth) {
      throw new UnauthorizedException('No active session cookie found.');
    }

    const emailHeader = request.headers['x-user-email'];
    const nameHeader = request.headers['x-user-name'];

    if (typeof emailHeader !== 'string' || emailHeader.trim().length === 0) {
      throw new UnauthorizedException('No session cookie found and x-user-email is missing.');
    }

    const email = emailHeader.trim().toLowerCase();
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

    request.currentUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      source: 'header',
      rolesByOrg: Object.fromEntries(
        user.memberships.map((membership) => [membership.orgId, membership.role]),
      ),
    };

    return true;
  }
}
