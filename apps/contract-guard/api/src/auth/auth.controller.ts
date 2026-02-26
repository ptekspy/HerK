import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { CurrentUserContext } from '../common/auth/current-user.decorator';
import type { CurrentUser } from '../common/auth/current-user.type';
import { SessionGuard } from '../common/auth/session.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('github/start')
  async githubStart(@Query('returnTo') returnTo: string | undefined, @Res() res: Response) {
    const redirectUrl = await this.authService.startGithubOAuth(returnTo);
    return res.redirect(redirectUrl);
  }

  @Get('github/app/install/start')
  @UseGuards(SessionGuard)
  async githubAppInstallStart(
    @CurrentUserContext() user: CurrentUser,
    @Query('orgId') orgId: string | undefined,
    @Query('returnTo') returnTo: string | undefined,
    @Res() res: Response,
  ) {
    if (!orgId) {
      throw new BadRequestException('orgId is required.');
    }

    const redirectUrl = await this.authService.startGithubAppInstall({
      userId: user.id,
      orgId,
      returnTo,
    });

    return res.redirect(redirectUrl);
  }

  @Get('github/app/install/callback')
  async githubAppInstallCallback(
    @Query('state') state: string | undefined,
    @Query('installation_id') installationId: string | undefined,
    @Query('setup_action') setupAction: string | undefined,
    @Res() res: Response,
  ) {
    const completed = await this.authService.completeGithubAppInstall({
      state: state || '',
      installationId,
      setupAction,
    });

    return res.redirect(completed.redirectTo);
  }

  @Get('github/callback')
  async githubCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('installation_id') installationId: string | undefined,
    @Query('setup_action') setupAction: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // Some GitHub App configurations return install callbacks to this OAuth route.
    // Handle that shape here for backward compatibility.
    if (installationId || setupAction) {
      const completed = await this.authService.completeGithubAppInstall({
        state: state || '',
        installationId,
        setupAction,
      });

      return res.redirect(completed.redirectTo);
    }

    const completed = await this.authService.completeGithubOAuth({
      code: code || '',
      state: state || '',
      ipAddress: req.ip || null,
      userAgent: req.headers['user-agent'] || null,
    });

    res.cookie(this.authService.getCookieName(), completed.sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.authService.shouldUseSecureCookies(),
      path: '/',
      expires: completed.expiresAt,
    });

    return res.redirect(completed.redirectTo);
  }

  @Get('session')
  async session(@Headers('cookie') cookieHeader?: string) {
    const token = this.authService.extractSessionTokenFromCookies(cookieHeader);
    if (!token) {
      throw new UnauthorizedException('No active session cookie found.');
    }

    const session = await this.authService.getSessionUserByToken(token);
    if (!session) {
      throw new UnauthorizedException('Session is invalid or expired.');
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      avatarUrl: session.user.avatarUrl,
      memberships: session.user.memberships.map((membership) => ({
        orgId: membership.orgId,
        role: membership.role,
      })),
      expiresAt: session.expiresAt,
    };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Headers('cookie') cookieHeader?: string, @Res({ passthrough: true }) res?: Response) {
    const token = this.authService.extractSessionTokenFromCookies(cookieHeader);

    if (token) {
      await this.authService.revokeSession(token);
    }

    res?.clearCookie(this.authService.getCookieName(), {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.authService.shouldUseSecureCookies(),
      path: '/',
    });

    return {
      ok: true,
    };
  }
}
