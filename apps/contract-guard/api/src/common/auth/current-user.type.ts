import { MemberRole } from '@herk/api';
import { Request } from 'express';

export interface CurrentUser {
  id: string;
  email: string | null;
  name: string | null;
  rolesByOrg: Record<string, MemberRole>;
}

export interface AuthenticatedRequest extends Request {
  currentUser?: CurrentUser;
}
