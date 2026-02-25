import { MemberRole } from '@herk/api';
import { Request } from 'express';

export interface CurrentUser {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl?: string | null;
  source: 'session' | 'header';
  sessionId?: string;
  rolesByOrg: Record<string, MemberRole>;
}

export interface AuthenticatedRequest extends Request {
  currentUser?: CurrentUser;
}
