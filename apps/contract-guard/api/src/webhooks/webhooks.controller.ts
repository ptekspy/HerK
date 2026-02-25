import { Body, Controller, Headers, HttpCode, Post, Req } from '@nestjs/common';
import { Request } from 'express';

import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('github')
  @HttpCode(202)
  async githubWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Body() body: unknown,
    @Headers('x-github-event') eventName: string,
    @Headers('x-github-delivery') deliveryId: string,
    @Headers('x-hub-signature-256') signature: string,
  ) {
    this.webhooksService.verifyGithubSignature(req.rawBody ?? JSON.stringify(body), signature);

    return this.webhooksService.handleGithubWebhook(
      eventName,
      deliveryId,
      body as {
        action: string;
        pull_request?: {
          number: number;
          head: { sha: string };
          base: { sha: string };
        };
        repository?: {
          owner?: { login: string };
          name?: string;
          full_name?: string;
          default_branch?: string;
        };
        installation?: {
          id: number;
        };
      },
    );
  }

  @Post('stripe')
  @HttpCode(202)
  async stripeWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Body() body: unknown,
    @Headers('stripe-signature') signature: string,
  ) {
    const event = this.webhooksService.verifyStripeEvent(
      req.rawBody ?? JSON.stringify(body),
      signature,
    );

    return this.webhooksService.handleStripeWebhook(event, body);
  }
}
