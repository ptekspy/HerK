import { createHmac } from 'node:crypto';

import { UnauthorizedException } from '@nestjs/common';

import { WebhooksService } from './webhooks.service';

describe('WebhooksService signature verification', () => {
  const service = new WebhooksService({} as never, {} as never);

  beforeEach(() => {
    process.env.GITHUB_WEBHOOK_SECRET = 'test-secret';
  });

  afterEach(() => {
    delete process.env.GITHUB_WEBHOOK_SECRET;
  });

  it('accepts valid webhook signature', () => {
    const payload = Buffer.from('{"ok":true}', 'utf-8');
    const digest = createHmac('sha256', 'test-secret').update(payload).digest('hex');

    expect(() => {
      service.verifyGithubSignature(payload, `sha256=${digest}`);
    }).not.toThrow();
  });

  it('rejects invalid webhook signature', () => {
    const payload = Buffer.from('{"ok":true}', 'utf-8');

    expect(() => {
      service.verifyGithubSignature(payload, 'sha256=deadbeef');
    }).toThrow(UnauthorizedException);
  });
});
